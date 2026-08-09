from pathlib import Path
import subprocess, re, json, shutil, time, math, difflib

ROOT = Path('hearframe-grand-v4/ask')
MEDIA = ROOT / 'media'
MEDIA.mkdir(parents=True, exist_ok=True)
TMP = Path('/tmp/hearframe-ask')
if TMP.exists(): shutil.rmtree(TMP)
TMP.mkdir(parents=True)

SOURCES = {
  'obama': {
    'speaker': 'Barack Obama', 'year': 2017,
    'url': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/23/20170110_President_Obama_Farewell_Speech_HD.webm/20170110_President_Obama_Farewell_Speech_HD.webm.360p.vp9.webm'
  },
  'jfk': {
    'speaker': 'John F. Kennedy', 'year': 1961,
    'url': 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/74/John_F._Kennedy_Inauguration_Speech.ogv/John_F._Kennedy_Inauguration_Speech.ogv.360p.vp9.webm'
  }
}

# Each context window is grounded in a published subtitle cue, but exact word
# boundaries are produced by faster-whisper word timestamps and must pass the
# alignment confidence gate below.
SEGMENTS = {
  'hello': {'source':'obama','target':'hello','context':[1.20,2.55]},
  'you_can': {'source':'obama','target':'you can','context':[79.55,82.30]},
  'change_people': {'source':'obama','target':'change only happens when ordinary people get involved','context':[226.00,235.20]},
  'progress_uneven': {'source':'obama','target':'yes our progress has been uneven','context':[401.20,406.65]},
  'we_have_what_we_need': {'source':'obama','target':'we need to do so','context':[598.10,600.90]},
  'world_different': {'source':'jfk','target':'the world is very different now','context':[120.90,124.40]},
  'begin': {'source':'jfk','target':'begin','context':[677.55,681.10]},
  'ask_what_you_can_do': {'source':'jfk','target':'ask what you can do','context':[841.20,845.60]}
}

ANSWERS = [
  {'id':'greeting','text':'Hello.','keywords':['hello','hi','hey'],'segments':['hello']},
  {'id':'start','text':'You can begin.','keywords':['can i start','should i start','start','begin','can i do this','do you think i can'],'segments':['you_can','begin']},
  {'id':'change','text':'Change only happens when ordinary people get involved.','keywords':['change','make a difference','make change','how does change happen','how can people change things'],'segments':['change_people']},
  {'id':'progress','text':'Yes, our progress has been uneven.','keywords':['progress','smooth','setback','improving','getting better','always improve'],'segments':['progress_uneven']},
  {'id':'needs','text':'We need to do so.','keywords':['what do we need','do we have enough','need','resources','ready'],'segments':['we_have_what_we_need']},
  {'id':'world','text':'The world is very different now.','keywords':['world','has the world changed','different now','things changed'],'segments':['world_different']},
  {'id':'agency','text':'Ask what you can do.','keywords':['what can i do','how can i help','help','contribute','my part'],'segments':['ask_what_you_can_do']}
]


def run(cmd, check=True):
    print('+', ' '.join(map(str, cmd)), flush=True)
    p = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if p.stdout: print(p.stdout[-2500:], flush=True)
    if p.stderr: print(p.stderr[-3500:], flush=True)
    if check and p.returncode:
        raise SystemExit(f'command failed ({p.returncode}): {cmd}\n{p.stderr}')
    return p


def download_once(url, dest):
    ua='HearframePrototype/1.0 (public historical speech indexing prototype; github.com/jamshih/html)'
    run(['curl','--fail','--location','--show-error','--silent','--retry','12','--retry-delay','10','--retry-all-errors','--connect-timeout','30','--max-time','900','--user-agent',ua,url,'--output',str(dest)])
    if not dest.exists() or dest.stat().st_size < 1_000_000:
        raise SystemExit(f'download too small: {dest}')
    print(f'downloaded {dest.name}: {dest.stat().st_size/1024/1024:.1f} MiB', flush=True)

LOCAL = {}
for key, src in SOURCES.items():
    path = TMP / f'{key}.webm'
    download_once(src['url'], path)
    LOCAL[key] = path
    time.sleep(4)

from faster_whisper import WhisperModel
model = WhisperModel('base.en', device='cpu', compute_type='int8')


def norm(s):
    return re.sub(r"[^a-z0-9']+", '', s.lower().replace('’',"'"))


def align_segment(seg_id, cfg):
    c0, c1 = cfg['context']
    wav = TMP / f'{seg_id}.wav'
    run(['ffmpeg','-y','-hide_banner','-nostdin','-ss',f'{c0:.3f}','-i',str(LOCAL[cfg['source']]),'-t',f'{c1-c0:.3f}','-vn','-ac','1','-ar','16000','-c:a','pcm_s16le',str(wav)])
    segments, _info = model.transcribe(str(wav), language='en', word_timestamps=True, beam_size=5, vad_filter=False, condition_on_previous_text=False)
    words=[]
    for s in segments:
        for w in (s.words or []):
            token=norm(w.word)
            if token and w.start is not None and w.end is not None:
                words.append({'token':token,'raw':w.word.strip(),'start':float(w.start),'end':float(w.end),'probability':float(w.probability or 0)})
    target=[norm(x) for x in cfg['target'].split() if norm(x)]
    if not words: raise SystemExit(f'{seg_id}: no aligned words')
    best=None
    for length in range(max(1,len(target)-1), min(len(words),len(target)+2)+1):
        for i in range(0,len(words)-length+1):
            cand=[x['token'] for x in words[i:i+length]]
            score=difflib.SequenceMatcher(None,' '.join(target),' '.join(cand)).ratio()
            exact=sum(1 for a,b in zip(target,cand) if a==b)/max(len(target),len(cand))
            score=.7*score+.3*exact
            if best is None or score>best[0]: best=(score,i,length,cand)
    score,i,length,cand=best
    if score < .72:
        transcript=' '.join(w['raw'] for w in words)
        raise SystemExit(f'{seg_id}: alignment confidence too low {score:.3f}; wanted {target}; best {cand}; transcript={transcript}')
    chosen=words[i:i+length]
    aligned_start=c0+chosen[0]['start']; aligned_end=c0+chosen[-1]['end']
    cut_start=max(c0,aligned_start-.025); cut_end=min(c1,aligned_end+.035)
    return {
      'id':seg_id,'source':cfg['source'],'target':cfg['target'],
      'contextStart':c0,'contextEnd':c1,
      'alignedStart':round(aligned_start,4),'alignedEnd':round(aligned_end,4),
      'cutStart':round(cut_start,4),'cutEnd':round(cut_end,4),
      'alignmentScore':round(score,4),
      'words':[{'word':w['raw'],'token':w['token'],'start':round(c0+w['start'],4),'end':round(c0+w['end'],4),'probability':round(w['probability'],4)} for w in chosen],
      'contextTranscript':' '.join(w['raw'] for w in words)
    }

aligned={}
for seg_id,cfg in SEGMENTS.items():
    aligned[seg_id]=align_segment(seg_id,cfg)
    print('ALIGNED',seg_id,json.dumps(aligned[seg_id],indent=2),flush=True)


def mean_volume(path,start,end):
    p=run(['ffmpeg','-hide_banner','-nostdin','-ss',f'{max(0,start-.20):.3f}','-i',str(path),'-t',f'{(end-start)+.40:.3f}','-vn','-af','volumedetect','-f','null','-'],check=False)
    m=re.findall(r'mean_volume:\s*(-?[0-9.]+) dB',p.stderr)
    return float(m[-1]) if m else -24.0

for s in aligned.values():
    s['contextMeanDbFS']=mean_volume(LOCAL[s['source']],s['cutStart'],s['cutEnd'])

vf='scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:black,fps=30,format=yuv420p'

def make_clip(seg, dest, gain_db=0.0):
    dur=seg['cutEnd']-seg['cutStart']
    run(['ffmpeg','-y','-hide_banner','-nostdin','-ss',f"{seg['cutStart']:.4f}",'-i',str(LOCAL[seg['source']]),'-t',f'{dur:.4f}',
      '-vf',vf,'-af',f'aresample=48000,volume={gain_db:.3f}dB',
      '-c:v','libx264','-preset','veryfast','-crf','21','-profile:v','main','-level','3.1','-pix_fmt','yuv420p','-bf','0','-g','30','-r','30',
      '-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-movflags','+faststart','-video_track_timescale','90000',str(dest)])

for seg_id,seg in aligned.items():
    make_clip(seg, MEDIA/f'segment-{seg_id}.mp4')


def render_answer(answer):
    segs=[aligned[x] for x in answer['segments']]
    dest=MEDIA/f"answer-{answer['id']}.mp4"
    if len(segs)==1:
        make_clip(segs[0],dest)
        return
    target=min(s['contextMeanDbFS'] for s in segs)
    tmps=[]
    for idx,s in enumerate(segs):
        gain=max(-6.0,min(0.0,target-s['contextMeanDbFS']))
        raw=TMP/f"{answer['id']}-{idx}.mp4"; make_clip(s,raw,gain); tmps.append(raw)
    if len(tmps)!=2: raise SystemExit('POC compositor currently supports up to 2 segments')
    d0=float(run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nk=1:nw=1',str(tmps[0])]).stdout.strip())
    d1=float(run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nk=1:nw=1',str(tmps[1])]).stdout.strip())
    xf=min(.025,d0*.18,d1*.18)
    frames0=max(1,round(d0*30)); frames1=max(1,round(d1*30)); video_duration=(frames0+frames1)/30.0
    fc=(f'[0:v]settb=AVTB,setpts=PTS-STARTPTS[v0];[1:v]settb=AVTB,setpts=PTS-STARTPTS[v1];'
        f'[v0][v1]concat=n=2:v=1:a=0,fps=30,setpts=PTS-STARTPTS[v];'
        f'[0:a]aresample=48000,asetpts=PTS-STARTPTS[a0];[1:a]aresample=48000,asetpts=PTS-STARTPTS[a1];'
        f'[a0][a1]acrossfade=d={xf:.4f}:c1=qsin:c2=qsin,apad=whole_dur={video_duration:.6f},atrim=duration={video_duration:.6f},asetpts=PTS-STARTPTS[a]')
    run(['ffmpeg','-y','-hide_banner','-nostdin','-i',str(tmps[0]),'-i',str(tmps[1]),'-filter_complex',fc,'-map','[v]','-map','[a]',
      '-c:v','libx264','-preset','veryfast','-crf','21','-profile:v','main','-level','3.1','-pix_fmt','yuv420p','-bf','0','-g','30','-r','30',
      '-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-movflags','+faststart','-video_track_timescale','90000',str(dest)])

for a in ANSWERS: render_answer(a)

probes={}
for p in sorted(MEDIA.glob('answer-*.mp4')):
    run(['ffmpeg','-v','error','-nostdin','-i',str(p),'-f','null','-'])
    q=run(['ffprobe','-v','error','-show_entries','stream=codec_type,codec_name','-show_entries','format=duration','-of','json',str(p)])
    probes[p.name]=json.loads(q.stdout)

corpus={
  'version':'ask-v0.1','alignment':'faster-whisper base.en word timestamps',
  'sources':SOURCES,'segments':aligned,
  'answers':[{**a,'media':f"media/answer-{a['id']}.mp4"} for a in ANSWERS],
  'fallback':{'text':'I do not have enough indexed speech to answer that yet. Try a question about starting, change, progress, what you need, the world, or what you can do.'},
  'notes':'The response planner prefers a whole indexed phrase. Only the start answer currently demonstrates a two-source splice: Obama “you can” + JFK “begin”.'
}
(ROOT/'corpus.json').write_text(json.dumps(corpus,indent=2))
(ROOT/'ffprobe.json').write_text(json.dumps(probes,indent=2))
print(json.dumps({'segments':{k:[v['alignedStart'],v['alignedEnd']] for k,v in aligned.items()},'answers':[a['id'] for a in ANSWERS]},indent=2),flush=True)
