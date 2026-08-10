from pathlib import Path
import json, re, statistics, subprocess

ROOT=Path('hearframe-grand-v4/ask'); MEDIA=ROOT/'media'
corpus=json.loads((ROOT/'corpus.json').read_text())
precision_path=ROOT/'precision'/'long-answer-word-refinements.json'
if not precision_path.exists(): raise SystemExit('single-word precision overlay missing; run Hearframe Word Precision Gate first')
precision=json.loads(precision_path.read_text())

# Output order is independent of where the clips occur in their original speeches.
# The last two chunks form an explicit conclusion.
SEG_IDS=['world_different','change_people','ask_what_you_can_do','you_can','begin']
ROLES=['body','body','body','conclusion','conclusion']
CONCLUSION='You can begin.'
TEXT='The world is very different now. Change only happens when ordinary people get involved. Ask what you can do. You can begin.'
OUT=MEDIA/'answer-long-demo.mp4'
segments=corpus.get('segments') or {}

def run(cmd,check=True):
    print('+',' '.join(map(str,cmd)),flush=True)
    p=subprocess.run(cmd,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if check and p.returncode: raise SystemExit(p.stderr[-5000:])
    return p

def duration(path): return float(run(['ffprobe','-v','error','-show_entries','format=duration','-of','default=nk=1:nw=1',str(path)]).stdout.strip())
def mean_db(path):
    p=run(['ffmpeg','-hide_banner','-nostdin','-i',str(path),'-vn','-af','volumedetect','-f','null','-'],check=False)
    m=re.findall(r'mean_volume:\s*(-?[0-9.]+) dB',p.stderr)
    return float(m[-1]) if m else -24.0

def wc(text): return len(re.findall(r"[A-Za-z0-9']+",text or ''))
def clamp(x,lo,hi): return max(lo,min(hi,x))

def chunk_type(n):
    if n==1: return 'word'
    if n<=3: return 'phrase'
    return 'sentence'

def speed_bounds(n):
    if n==1: return (.98,1.02)
    if n<=3: return (.95,1.05)
    return (.92,1.08)

inputs=[]; counts=[]; types=[]; single_word_ids=[]
refined_map=(precision.get('refinements') or {})
for sid in SEG_IDS:
    seg=segments.get(sid)
    if not seg: raise SystemExit(f'missing corpus segment {sid}')
    n=wc(seg.get('target'))
    counts.append(n); types.append(chunk_type(n))
    if n==1:
        single_word_ids.append(sid)
        ref=refined_map.get(sid)
        if not ref or ref.get('precisionStatus')!='ai-refined': raise SystemExit(f'{sid}: single word has not passed Gemini precision refinement')
        p=ROOT/ref['media']
    else:
        p=MEDIA/f'segment-{sid}.mp4'
    if not p.exists(): raise SystemExit(f'missing {p}')
    inputs.append(p)

if set(single_word_ids) != set(refined_map):
    extras=set(refined_map)-set(single_word_ids)
    if extras: raise SystemExit(f'precision overlay contains unrelated word segments: {sorted(extras)}')

raw_durs=[duration(p) for p in inputs]; means=[mean_db(p) for p in inputs]
raw_wps=[(n/d if d>0 else 0) for n,d in zip(counts,raw_durs)]
rate_pool=[r for r,n in zip(raw_wps,counts) if n>=2 and r>0]
target_wps=statistics.median(rate_pool) if rate_pool else 3.0
speeds=[]
for rate,n,role in zip(raw_wps,counts,ROLES):
    lo,hi=speed_bounds(n)
    desired=(target_wps/rate) if rate>0 else 1.0
    speed=clamp(desired,lo,hi)
    if abs(speed-1.0)<.012: speed=1.0
    if role=='conclusion': speed=clamp(speed*.985,lo,hi)
    speeds.append(round(speed,4))
adj_durs=[d/s for d,s in zip(raw_durs,speeds)]
adj_wps=[n/d if d>0 else 0 for n,d in zip(counts,adj_durs)]

target_db=statistics.median(means)
gains=[max(-6.0,min(6.0,target_db-x)) for x in means]
xfades=[min(.025,a*.12,b*.12) for a,b in zip(adj_durs,adj_durs[1:])]
video_duration=sum(round(d*30)/30 for d in adj_durs)

args=[]
for p in inputs: args += ['-i',str(p)]
filters=[]
for i,(g,speed) in enumerate(zip(gains,speeds)):
    # Normalize every source to the exact same Safari-safe 1280x720 canvas before concat.
    # This does not change any source timing/window; it only resolves mixed source resolutions.
    filters.append(f'[{i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30,settb=AVTB,setpts=(PTS-STARTPTS)/{speed:.4f}[v{i}]')
    filters.append(f'[{i}:a]aresample=48000,atempo={speed:.4f},volume={g:.3f}dB,asetpts=PTS-STARTPTS[a{i}]')
filters.append(''.join(f'[v{i}]' for i in range(len(inputs)))+f'concat=n={len(inputs)}:v=1:a=0,fps=30,setpts=PTS-STARTPTS[vout]')
cur='a0'
for i,xf in enumerate(xfades,1):
    nxt=f'ax{i}'
    filters.append(f'[{cur}][a{i}]acrossfade=d={xf:.4f}:c1=qsin:c2=qsin[{nxt}]')
    cur=nxt
filters.append(f'[{cur}]apad=whole_dur={video_duration:.6f},atrim=duration={video_duration:.6f},asetpts=PTS-STARTPTS[aout]')
fc=';'.join(filters)
run(['ffmpeg','-y','-hide_banner','-nostdin',*args,'-filter_complex',fc,'-map','[vout]','-map','[aout]',
     '-c:v','libx264','-preset','veryfast','-crf','21','-profile:v','main','-level','3.1','-pix_fmt','yuv420p','-bf','0','-g','30','-r','30',
     '-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-movflags','+faststart','-video_track_timescale','90000',str(OUT)])
run(['ffmpeg','-v','error','-nostdin','-i',str(OUT),'-f','null','-'])
probe=json.loads(run(['ffprobe','-v','error','-show_entries','stream=codec_type,codec_name,width,height','-show_entries','format=duration','-of','json',str(OUT)]).stdout)
if {s.get('codec_type') for s in probe.get('streams',[])} != {'video','audio'}: raise SystemExit('long answer missing A/V')
video_stream=next(s for s in probe['streams'] if s.get('codec_type')=='video')
if (video_stream.get('width'),video_stream.get('height')) != (1280,720): raise SystemExit('final video is not 1280x720')
if not TEXT.rstrip().endswith(CONCLUSION): raise SystemExit('answer does not end with the required conclusion')
if ROLES[-1] != 'conclusion': raise SystemExit('final chunk is not marked as conclusion')

plan={
 'id':'long-demo','text':TEXT,
 'keywords':['long answer','longer answer','long sentence','longer sentence','say something longer','say something inspiring','give me a longer answer','test long sentence'],
 'segments':SEG_IDS,'roles':ROLES,'chunkTypes':types,'media':'media/answer-long-demo.mp4',
 'wordCount':wc(TEXT),'hasConclusion':True,'conclusionText':CONCLUSION,'conclusionSegmentIds':['you_can','begin'],
 'speedAdjusted':any(abs(s-1)>1e-6 for s in speeds),'speedFactors':speeds,'phraseFirst':True,
 'singleWordPrecisionGate':'passed','singleWordSegments':single_word_ids
}
corpus['answers']=[a for a in corpus.get('answers',[]) if a.get('id')!='long-demo']
corpus['answers'].append(plan)
corpus['version']='ask-v0.4'
corpus['notes']='Phrase/sentence-first corpus; every single-word chunk used by the long-answer render passes Gemini audio-window refinement first. Long answers end with an explicit conclusion and use conservative per-clip tempo matching.'
(ROOT/'corpus.json').write_text(json.dumps(corpus,indent=2))
report={
 'version':'long-answer-qa-v0.4','text':TEXT,'wordCount':wc(TEXT),'segments':SEG_IDS,'roles':ROLES,'chunkTypes':types,'segmentCount':len(SEG_IDS),
 'conclusion':CONCLUSION,'hasConclusion':True,'sourceOrderIndependent':True,
 'singleWordSegments':single_word_ids,'singleWordPrecisionGate':'passed','precisionOverlay':str(precision_path.relative_to(ROOT)),
 'rawDurations':raw_durs,'rawWordsPerSecond':[round(x,3) for x in raw_wps],'targetWordsPerSecond':round(target_wps,3),
 'speedFactors':speeds,'adjustedDurations':[round(x,4) for x in adj_durs],'adjustedWordsPerSecond':[round(x,3) for x in adj_wps],
 'sourceMeansDbFS':means,'appliedGainDb':[round(x,3) for x in gains],'crossfadeMs':[round(x*1000,1) for x in xfades],
 'duration':float(probe['format']['duration']),'fullDecode':'pass','normalizedVideo':'1280x720','corpusVersionAfterBuild':corpus.get('version'),'alignment':corpus.get('alignment'),'probe':probe,
 'pass':True
}
(ROOT/'long-sentence-qa.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
