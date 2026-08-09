from pathlib import Path
import subprocess, re, json, shutil, time, difflib

ROOT=Path('hearframe-grand-v4/ask'); MEDIA=ROOT/'media'; MEDIA.mkdir(parents=True,exist_ok=True)
TMP=Path('/tmp/hearframe-ask-v2')
if TMP.exists(): shutil.rmtree(TMP)
TMP.mkdir(parents=True)
SOURCES={
 'obama':{'speaker':'Barack Obama','year':2017,'url':'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/23/20170110_President_Obama_Farewell_Speech_HD.webm/20170110_President_Obama_Farewell_Speech_HD.webm.360p.vp9.webm'},
 'jfk':{'speaker':'John F. Kennedy','year':1961,'url':'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/74/John_F._Kennedy_Inauguration_Speech.ogv/John_F._Kennedy_Inauguration_Speech.ogv.360p.vp9.webm'}
}
SEGMENTS={
 'hello':{'source':'obama','target':'hello','context':[.90,2.20]},
 'you_can':{'source':'obama','target':'you can','context':[79.55,82.30]},
 'change_people':{'source':'obama','target':'change only happens when ordinary people get involved','context':[226.00,235.20]},
 'progress_uneven':{'source':'obama','target':'yes our progress has been uneven','context':[401.20,406.65]},
 'we_have_what_we_need':{'source':'obama','target':'we need to do so','context':[598.10,600.90]},
 'world_different':{'source':'jfk','target':'the world is very different now','context':[121.00,124.10]},
 'begin':{'source':'jfk','target':'begin','context':[677.55,681.10]},
 'ask_what_you_can_do':{'source':'jfk','target':'ask what you can do','context':[841.00,845.60]}
}
ANSWERS=[
 {'id':'greeting','text':'Hello.','keywords':['hello','hi','hey'],'segments':['hello']},
 {'id':'start','text':'You can begin.','keywords':['can i start','should i start','start','begin','can i do this','do you think i can'],'segments':['you_can','begin']},
 {'id':'change','text':'Change only happens when ordinary people get involved.','keywords':['change','make a difference','make change','how does change happen','how can people change things'],'segments':['change_people']},
 {'id':'progress','text':'Yes, our progress has been uneven.','keywords':['progress','smooth','setback','improving','getting better','always improve'],'segments':['progress_uneven']},
 {'id':'needs','text':'We need to do so.','keywords':['what do we need','do we have enough','need','resources','ready'],'segments':['we_have_what_we_need']},
 {'id':'world','text':'The world is very different now.','keywords':['world','has the world changed','different now','things changed'],'segments':['world_different']},
 {'id':'agency','text':'Ask what you can do.','keywords':['what can i do','how can i help','help','contribute','my part'],'segments':['ask_what_you_can_do']}
]
GOLD_WORDS={('hello','hello'):(1.308,1.500),('world_different','world'):(122.440,122.700)}
UA='HearframePrototype/2.0 (forced-aligned corpus; github.com/jamshih/html)'

def run(cmd,check=True):
    print('+',' '.join(map(str,cmd)),flush=True)
    p=subprocess.run(cmd,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if check and p.returncode: raise SystemExit(p.stderr[-5000:])
    return p

def download(k,u):
    p=TMP/f'{k}.webm'; run(['curl','--fail','--location','--silent','--show-error','--retry','12','--retry-delay','10','--retry-all-errors','--user-agent',UA,u,'-o',str(p)])
    if p.stat().st_size<1_000_000: raise SystemExit(f'{k} source too small')
    return p
LOCAL={}
for k,s in SOURCES.items(): LOCAL[k]=download(k,s['url']); time.sleep(3)

import whisperx
DEVICE='cpu'; ASR_NAME='small.en'; ALIGN_NAME='WAV2VEC2_ASR_LARGE_LV60K_960H'
asr=whisperx.load_model(ASR_NAME,DEVICE,compute_type='int8',language='en')
align_model,align_meta=whisperx.load_align_model(language_code='en',device=DEVICE,model_name=ALIGN_NAME)

def norm(s): return re.sub(r"[^a-z0-9']+",'',s.lower().replace('’',"'"))
def crop(src,c0,c1,name):
    wav=TMP/f'{name}.wav'; run(['ffmpeg','-y','-hide_banner','-loglevel','error','-ss',f'{c0:.3f}','-i',str(src),'-t',f'{c1-c0:.3f}','-vn','-ac','1','-ar','16000','-c:a','pcm_s16le',str(wav)]); return wav

def align_segment(seg_id,cfg):
    c0,c1=cfg['context']; wav=crop(LOCAL[cfg['source']],c0,c1,seg_id); audio=whisperx.load_audio(str(wav))
    tr=asr.transcribe(audio,batch_size=4,language='en'); segs=tr.get('segments') or []
    if not segs: raise SystemExit(f'{seg_id}: no ASR segments')
    al=whisperx.align(segs,align_model,align_meta,audio,DEVICE,return_char_alignments=False)
    words=[]
    for w in al.get('word_segments',[]):
        if w.get('start') is None or w.get('end') is None: continue
        tok=norm(w.get('word',''))
        if not tok: continue
        words.append({'token':tok,'raw':w.get('word','').strip(),'start':float(w['start']),'end':float(w['end']),'score':float(w.get('score') or 0)})
    target=[norm(x) for x in cfg['target'].split() if norm(x)]
    best=None
    for length in range(max(1,len(target)-1),min(len(words),len(target)+2)+1):
        for i in range(len(words)-length+1):
            cand=[x['token'] for x in words[i:i+length]]
            seq=difflib.SequenceMatcher(None,' '.join(target),' '.join(cand)).ratio(); exact=sum(a==b for a,b in zip(target,cand))/max(len(target),len(cand)); score=.7*seq+.3*exact
            if best is None or score>best[0]: best=(score,i,length,cand)
    if not best or best[0]<.78: raise SystemExit(f'{seg_id}: target not confidently recognized; best={best}; transcript={" ".join(w["raw"] for w in words)}')
    lexical,i,length,cand=best; chosen=words[i:i+length]
    aligned_words=[]
    for w in chosen:
        st=c0+w['start']; en=c0+w['end']; override=GOLD_WORDS.get((seg_id,w['token']))
        aligned_words.append({'word':w['raw'],'token':w['token'],'start':round(override[0] if override else st,4),'end':round(override[1] if override else en,4),'score':round(w['score'],4),'timingSource':'human-gold' if override else 'whisperx-wav2vec2'})
    start=aligned_words[0]['start']; end=aligned_words[-1]['end']; cut_start=max(c0,start-.025); cut_end=min(c1,end+.035)
    return {'id':seg_id,'source':cfg['source'],'target':cfg['target'],'contextStart':c0,'contextEnd':c1,'alignedStart':round(start,4),'alignedEnd':round(end,4),'cutStart':round(cut_start,4),'cutEnd':round(cut_end,4),'alignmentScore':round(lexical,4),'alignmentMethod':f'WhisperX {ALIGN_NAME}','words':aligned_words,'contextTranscript':' '.join(w['raw'] for w in words)}

aligned={k:align_segment(k,v) for k,v in SEGMENTS.items()}

def mean_volume(path,start,end):
    p=run(['ffmpeg','-hide_banner','-nostdin','-ss',f'{max(0,start-.2):.3f}','-i',str(path),'-t',f'{(end-start)+.4:.3f}','-vn','-af','volumedetect','-f','null','-'],check=False)
    m=re.findall(r'mean_volume:\s*(-?[0-9.]+) dB',p.stderr); return float(m[-1]) if m else -24.0
for s in aligned.values(): s['contextMeanDbFS']=mean_volume(LOCAL[s['source']],s['cutStart'],s['cutEnd'])

vf='scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:black,fps=30,format=yuv420p'
def make_clip(seg,dest,gain_db=0):
    dur=seg['cutEnd']-seg['cutStart']; run(['ffmpeg','-y','-hide_banner','-nostdin','-ss',f"{seg['cutStart']:.4f}",'-i',str(LOCAL[seg['source']]),'-t',f'{dur:.4f}','-vf',vf,'-af',f'aresample=48000,volume={gain_db:.3f}dB','-c:v','libx264','-preset','veryfast','-crf','21','-profile:v','main','-level','3.1','-pix_fmt','yuv420p','-bf','0','-g','30','-r','30','-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-movflags','+faststart','-video_track_timescale','90000',str(dest)])
for sid,s in aligned.items(): make_clip(s,MEDIA/f'segment-{sid}.mp4')

def render_answer(a):
    ss=[aligned[x] for x in a['segments']]; dest=MEDIA/f"answer-{a['id']}.mp4"
    if len(ss)==1: make_clip(ss[0],dest); return
    target=min(x['contextMeanDbFS'] for x in ss); tmps=[]
    for i,s in enumerate(ss):
        gain=max(-6,min(0,target-s['contextMeanDbFS'])); p=TMP/f"{a['id']}-{i}.mp4"; make_clip(s,p,gain); tmps.append(p)
    d=[float(run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nk=1:nw=1',str(p)]).stdout.strip()) for p in tmps]; xf=min(.025,d[0]*.18,d[1]*.18); vd=sum(round(x*30)/30 for x in d)
    fc=f'[0:v]settb=AVTB,setpts=PTS-STARTPTS[v0];[1:v]settb=AVTB,setpts=PTS-STARTPTS[v1];[v0][v1]concat=n=2:v=1:a=0,fps=30,setpts=PTS-STARTPTS[v];[0:a]aresample=48000,asetpts=PTS-STARTPTS[a0];[1:a]aresample=48000,asetpts=PTS-STARTPTS[a1];[a0][a1]acrossfade=d={xf:.4f}:c1=qsin:c2=qsin,apad=whole_dur={vd:.6f},atrim=duration={vd:.6f},asetpts=PTS-STARTPTS[a]'
    run(['ffmpeg','-y','-hide_banner','-nostdin','-i',str(tmps[0]),'-i',str(tmps[1]),'-filter_complex',fc,'-map','[v]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','21','-profile:v','main','-level','3.1','-pix_fmt','yuv420p','-bf','0','-g','30','-r','30','-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-movflags','+faststart','-video_track_timescale','90000',str(dest)])
for a in ANSWERS: render_answer(a)
for p in MEDIA.glob('answer-*.mp4'): run(['ffmpeg','-v','error','-nostdin','-i',str(p),'-f','null','-'])
corpus={'version':'ask-v0.3','alignment':f'WhisperX phoneme/CTC forced alignment ({ALIGN_NAME}); known human-gold overrides preserved','sources':SOURCES,'segments':aligned,'answers':[{**a,'media':f"media/answer-{a['id']}.mp4"} for a in ANSWERS],'fallback':{'text':'I do not have enough indexed speech to answer that yet. Try a question about starting, change, progress, what you need, the world, or what you can do.'},'notes':'Phrase-first corpus rebuilt with CTC forced word alignment; exact user-calibrated HELLO/WORLD boundaries override automatic estimates.'}
(ROOT/'corpus.json').write_text(json.dumps(corpus,indent=2))
(ROOT/'forced-corpus-build.json').write_text(json.dumps({'version':corpus['version'],'segments':{k:{'start':v['alignedStart'],'end':v['alignedEnd'],'words':v['words']} for k,v in aligned.items()},'pass':True},indent=2))
print(json.dumps({'version':corpus['version'],'segmentCount':len(aligned),'answerCount':len(ANSWERS)},indent=2))
