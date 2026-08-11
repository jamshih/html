from pathlib import Path
import json, re, statistics, subprocess

ROOT=Path('hearframe-grand-v4/ask'); MEDIA=ROOT/'media'
corpus=json.loads((ROOT/'corpus.json').read_text())
precision_path=ROOT/'precision'/'long-answer-word-refinements.json'
if not precision_path.exists(): raise SystemExit('single-word precision overlay missing; run Hearframe Word Precision Gate first')
precision=json.loads(precision_path.read_text())
segments=corpus.get('segments') or {}
refined_map=precision.get('refinements') or {}

# Multiple real rendered plans give Gemini actual choices. Source timeline order never
# constrains assembled answer order; every plan still ends with an explicit conclusion.
SPECS=[
 {'id':'long-demo','segments':['world_different','change_people','ask_what_you_can_do','you_can','begin'],'conclusion':'You can begin.','conclusionSegments':['you_can','begin'],'text':'The world is very different now. Change only happens when ordinary people get involved. Ask what you can do. You can begin.'},
 {'id':'long-progress','segments':['progress_uneven','world_different','change_people','you_can','begin'],'conclusion':'You can begin.','conclusionSegments':['you_can','begin'],'text':'Yes, our progress has been uneven. The world is very different now. Change only happens when ordinary people get involved. You can begin.'},
 {'id':'long-action','segments':['world_different','ask_what_you_can_do','change_people','we_have_what_we_need'],'conclusion':'We need to do so.','conclusionSegments':['we_have_what_we_need'],'text':'The world is very different now. Ask what you can do. Change only happens when ordinary people get involved. We need to do so.'},
 {'id':'long-resolve','segments':['change_people','progress_uneven','world_different','we_have_what_we_need'],'conclusion':'We need to do so.','conclusionSegments':['we_have_what_we_need'],'text':'Change only happens when ordinary people get involved. Yes, our progress has been uneven. The world is very different now. We need to do so.'},
 {'id':'long-question','segments':['world_different','progress_uneven','change_people','ask_what_you_can_do'],'conclusion':'Ask what you can do.','conclusionSegments':['ask_what_you_can_do'],'text':'The world is very different now. Yes, our progress has been uneven. Change only happens when ordinary people get involved. Ask what you can do.'},
]

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
def chunk_type(n): return 'word' if n==1 else ('phrase' if n<=3 else 'sentence')
def speed_bounds(n): return (.98,1.02) if n==1 else ((.95,1.05) if n<=3 else (.92,1.08))

def input_for(sid):
    seg=segments.get(sid)
    if not seg: raise SystemExit(f'missing corpus segment {sid}')
    n=wc(seg.get('target'))
    if n==1:
        ref=refined_map.get(sid)
        if not ref or ref.get('precisionStatus')!='ai-refined' or ref.get('qualityGate')!='passed':
            raise SystemExit(f'{sid}: single word has not passed the hardened word-boundary gate')
        p=ROOT/ref['media']
    else:
        p=MEDIA/f'segment-{sid}.mp4'
    if not p.exists(): raise SystemExit(f'missing {p}')
    return seg,n,p

def render(spec):
    sids=spec['segments']; conclusion_segments=set(spec['conclusionSegments'])
    rows=[input_for(sid) for sid in sids]
    counts=[r[1] for r in rows]; types=[chunk_type(n) for n in counts]; inputs=[r[2] for r in rows]
    roles=['conclusion' if sid in conclusion_segments else 'body' for sid in sids]
    if roles[-1]!='conclusion': raise SystemExit(f"{spec['id']}: final chunk is not conclusion")
    if not spec['text'].rstrip().endswith(spec['conclusion']): raise SystemExit(f"{spec['id']}: text does not end with conclusion")
    if wc(spec['text'])<12: raise SystemExit(f"{spec['id']}: long plan is too short")
    if not any(t=='sentence' for t in types): raise SystemExit(f"{spec['id']}: no intact sentence chunk")

    raw_durs=[duration(p) for p in inputs]; means=[mean_db(p) for p in inputs]
    raw_wps=[n/d if d>0 else 0 for n,d in zip(counts,raw_durs)]
    pool=[r for r,n in zip(raw_wps,counts) if n>=2 and r>0]
    target_wps=statistics.median(pool) if pool else 3.0
    speeds=[]
    for rate,n,role in zip(raw_wps,counts,roles):
        lo,hi=speed_bounds(n); desired=(target_wps/rate) if rate>0 else 1.0
        speed=clamp(desired,lo,hi)
        if abs(speed-1.0)<.012: speed=1.0
        if role=='conclusion': speed=clamp(speed*.985,lo,hi)
        speeds.append(round(speed,4))
    adj=[d/s for d,s in zip(raw_durs,speeds)]
    target_db=statistics.median(means); gains=[max(-6.0,min(6.0,target_db-x)) for x in means]
    xfades=[min(.025,a*.12,b*.12) for a,b in zip(adj,adj[1:])]
    video_duration=sum(round(d*30)/30 for d in adj)
    out=MEDIA/f"answer-{spec['id']}.mp4"

    args=[]
    for p in inputs: args += ['-i',str(p)]
    filters=[]
    for i,(g,speed) in enumerate(zip(gains,speeds)):
        filters.append(f'[{i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30,settb=AVTB,setpts=(PTS-STARTPTS)/{speed:.4f}[v{i}]')
        filters.append(f'[{i}:a]aresample=48000,atempo={speed:.4f},volume={g:.3f}dB,asetpts=PTS-STARTPTS[a{i}]')
    filters.append(''.join(f'[v{i}]' for i in range(len(inputs)))+f'concat=n={len(inputs)}:v=1:a=0,fps=30,setpts=PTS-STARTPTS[vout]')
    cur='a0'
    for i,xf in enumerate(xfades,1):
        nxt=f'ax{i}'; filters.append(f'[{cur}][a{i}]acrossfade=d={xf:.4f}:c1=qsin:c2=qsin[{nxt}]'); cur=nxt
    filters.append(f'[{cur}]apad=whole_dur={video_duration:.6f},atrim=duration={video_duration:.6f},asetpts=PTS-STARTPTS[aout]')
    run(['ffmpeg','-y','-hide_banner','-nostdin',*args,'-filter_complex',';'.join(filters),'-map','[vout]','-map','[aout]',
         '-c:v','libx264','-preset','veryfast','-crf','21','-profile:v','main','-level','3.1','-pix_fmt','yuv420p','-bf','0','-g','30','-r','30',
         '-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-movflags','+faststart','-video_track_timescale','90000',str(out)])
    run(['ffmpeg','-v','error','-nostdin','-i',str(out),'-f','null','-'])
    probe=json.loads(run(['ffprobe','-v','error','-show_entries','stream=codec_type,codec_name,width,height','-show_entries','format=duration','-of','json',str(out)]).stdout)
    if {s.get('codec_type') for s in probe.get('streams',[])} != {'video','audio'}: raise SystemExit(f"{spec['id']}: missing A/V")
    vs=next(s for s in probe['streams'] if s.get('codec_type')=='video')
    if (vs.get('width'),vs.get('height'))!=(1280,720): raise SystemExit(f"{spec['id']}: final video is not 1280x720")
    single=[sid for sid,n in zip(sids,counts) if n==1]
    return {
      'id':spec['id'],'text':spec['text'],'keywords':['long answer','longer answer','long sentence','inspiring','life decision','change','progress','action'],
      'segments':sids,'roles':roles,'chunkTypes':types,'media':f"media/answer-{spec['id']}.mp4",'wordCount':wc(spec['text']),
      'hasConclusion':True,'conclusionText':spec['conclusion'],'conclusionSegmentIds':spec['conclusionSegments'],'conclusionSourcePositionIndependent':True,
      'speedAdjusted':any(abs(s-1)>1e-6 for s in speeds),'speedFactors':speeds,'retrievalOrder':['sentence','phrase','ai-refined-word'],'phraseFirst':True,
      'singleWordPrecisionGate':'passed','singleWordPrecisionVersion':precision.get('version'),'singleWordSegments':single,
      '_qa':{'duration':float(probe['format']['duration']),'rawWordsPerSecond':[round(x,3) for x in raw_wps],'targetWordsPerSecond':round(target_wps,3),'appliedGainDb':[round(x,3) for x in gains],'crossfadeMs':[round(x*1000,1) for x in xfades],'fullDecode':'pass','probe':probe}
    }

plans=[render(s) for s in SPECS]
public=[]; qa=[]
for p in plans:
    q=p.pop('_qa'); public.append(p); qa.append({'id':p['id'],'text':p['text'],'wordCount':p['wordCount'],'conclusion':p['conclusionText'],'chunkTypes':p['chunkTypes'],'speedFactors':p['speedFactors'],**q})
ids={p['id'] for p in public}
corpus['answers']=[a for a in corpus.get('answers',[]) if a.get('id') not in ids and not str(a.get('id','')).startswith('long-')]
corpus['answers'].extend(public)
corpus['version']='ask-v0.6'
corpus['notes']='Sentence/phrase-first corpus with five independently rendered long-answer variations. Repeated long requests can rotate across real rendered plans. Isolated words remain fallback-only and precision-gated.'
(ROOT/'corpus.json').write_text(json.dumps(corpus,indent=2))
report={'version':'long-answer-qa-v0.6','planCount':len(public),'allLong':all(p['wordCount']>=12 for p in public),'allConcluded':all(p['hasConclusion'] for p in public),'uniqueTexts':len({p['text'] for p in public}),'uniqueMedia':len({p['media'] for p in public}),'precisionVersion':precision.get('version'),'plans':qa,'pass':len(public)>=5 and len({p['text'] for p in public})==len(public)}
(ROOT/'long-sentence-qa.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
