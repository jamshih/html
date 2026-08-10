from __future__ import annotations
from pathlib import Path
import base64, io, json, math, os, re, subprocess, time, urllib.error, urllib.request, wave

ROOT=Path('hearframe-grand-v4/ask')
MEDIA=ROOT/'media'
PRECISION=ROOT/'precision'
PRECISION.mkdir(parents=True,exist_ok=True)
CORPUS=json.loads((ROOT/'corpus.json').read_text())
OUT=PRECISION/'long-answer-word-refinements.json'
AI_ENDPOINT=os.environ.get('HEARFRAME_AI_ENDPOINT','https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1/hearframe-ai/audio-critic')
PUBLISHABLE_KEY=os.environ.get('HEARFRAME_PUBLISHABLE_KEY','sb_publishable_Nt8ik0KBWLdi8hucG9oDRQ_cnMyQ9Gx')
MIN_DUR=.055
MIN_CONFIDENCE=.82
TRANSIENT={429,500,502,503,504}

answer=next((a for a in CORPUS.get('answers',[]) if a.get('id')=='long-demo'),None)
if not answer: raise SystemExit('long-demo answer is missing')
segment_ids=answer.get('segments') or []
segments=CORPUS.get('segments') or {}
sources=CORPUS.get('sources') or {}

def words(text): return re.findall(r"[A-Za-z0-9']+",text or '')
def run(cmd,check=True):
    print('+',' '.join(map(str,cmd)),flush=True)
    p=subprocess.run(cmd,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if check and p.returncode: raise RuntimeError(p.stderr[-5000:])
    return p

def round_ms(x): return round(float(x),3)
def candidate_grid(center,start_deltas,end_deltas,prefix,max_dur):
    out=[]; seen=set()
    for ds in start_deltas:
        for de in end_deltas:
            s=round_ms(center['start']+ds/1000); e=round_ms(center['end']+de/1000)
            dur=e-s
            if s<0 or dur<MIN_DUR or dur>max_dur: continue
            key=(s,e)
            if key in seen: continue
            seen.add(key)
            out.append({'id':f'{prefix}-s{ds:+d}-e{de:+d}','start':s,'end':e,'startDeltaMs':ds,'endDeltaMs':de})
    return out

def micro_candidates(center,prefix,max_dur):
    # Last pass moves one edge at a time. This makes the critic distinguish onset
    # clipping from offset leakage instead of comparing many almost-identical windows.
    pairs=[(-5,0),(0,-5),(0,0),(0,5),(5,0)]
    out=[]
    for ds,de in pairs:
        s=round_ms(center['start']+ds/1000); e=round_ms(center['end']+de/1000)
        if s<0 or e-s<MIN_DUR or e-s>max_dur: continue
        out.append({'id':f'{prefix}-s{ds:+d}-e{de:+d}','start':s,'end':e,'startDeltaMs':ds,'endDeltaMs':de})
    return out

def read_wav(path):
    with wave.open(str(path),'rb') as w:
        if w.getsampwidth()!=2 or w.getnchannels()!=1: raise RuntimeError('context WAV must be mono PCM16')
        sr=w.getframerate(); frames=w.readframes(w.getnframes())
    return sr,frames

def wav_slice_base64(frames,sr,context_start,start,end):
    rel0=max(0,start-context_start); rel1=max(rel0,end-context_start)
    a=max(0,min(len(frames)//2,int(math.floor(rel0*sr))))
    b=max(a+1,min(len(frames)//2,int(math.ceil(rel1*sr))))
    raw=frames[a*2:b*2]
    buf=io.BytesIO()
    with wave.open(buf,'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(raw)
    return base64.b64encode(buf.getvalue()).decode('ascii')

def judge(target,cands,frames,sr,context_start,pass_name):
    payload={'targetWord':target,'candidates':[]}
    for c in cands:
        payload['candidates'].append({'id':c['id'],'audioBase64':wav_slice_base64(frames,sr,context_start,c['start'],c['end']),'mimeType':'audio/wav','startMs':round(c['start']*1000),'endMs':round(c['end']*1000)})
    body=json.dumps(payload,separators=(',',':')).encode()
    last=None
    for attempt in range(1,7):
        req=urllib.request.Request(AI_ENDPOINT,data=body,headers={'content-type':'application/json','apikey':PUBLISHABLE_KEY,'user-agent':'HearframeWordPrecision/1.3'},method='POST')
        try:
            with urllib.request.urlopen(req,timeout=70) as r:
                data=json.load(r)
            winner=next((c for c in cands if c['id']==data.get('bestCandidateId')),None)
            if not winner: raise RuntimeError(f"AI returned non-rendered candidate: {data.get('bestCandidateId')}")
            confidence=float(data.get('confidence') or 0)
            if confidence<MIN_CONFIDENCE:
                raise RuntimeError(f'{pass_name}: boundary critic confidence {confidence:.3f} < {MIN_CONFIDENCE:.2f}; fail closed instead of publishing an uncertain word cut')
            return data,winner
        except urllib.error.HTTPError as e:
            detail=e.read().decode('utf-8','replace')[:1200]
            last=RuntimeError(f'Gemini audio critic HTTP {e.code}: {detail}')
            print(f'critic attempt {attempt}/6 failed: {last}',flush=True)
            if e.code not in TRANSIENT or attempt==6: raise last
            retry=e.headers.get('Retry-After') if e.headers else None
            wait=float(retry) if retry and retry.replace('.','',1).isdigit() else min(35,3*(2**(attempt-1)))
            time.sleep(wait)
        except (urllib.error.URLError,TimeoutError) as e:
            last=RuntimeError(f'Gemini audio critic transport failure: {e}')
            print(f'critic attempt {attempt}/6 failed: {last}',flush=True)
            if attempt==6: raise last
            time.sleep(min(35,3*(2**(attempt-1))))
    raise last or RuntimeError('Gemini audio critic failed without a response')

def render_refined_video(sid,source_url,start,end):
    out=MEDIA/f'segment-{sid}-ai-v1.mp4'
    dur=end-start
    run(['ffmpeg','-y','-hide_banner','-nostdin','-loglevel','error','-ss',f'{start:.3f}','-i',source_url,'-t',f'{dur:.3f}',
         '-vf','scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,fps=30',
         '-af','aresample=48000','-c:v','libx264','-preset','veryfast','-crf','21','-profile:v','main','-level','3.1','-pix_fmt','yuv420p','-bf','0','-g','30','-r','30',
         '-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-movflags','+faststart','-video_track_timescale','90000',str(out)])
    run(['ffmpeg','-v','error','-nostdin','-i',str(out),'-f','null','-'])
    return str(out.relative_to(ROOT))

refinements={}
for sid in segment_ids:
    seg=segments.get(sid)
    if not seg: raise SystemExit(f'missing segment {sid}')
    target=seg.get('target') or ''
    toks=words(target)
    if len(toks)!=1: continue
    source=sources.get(seg.get('source')) or {}
    source_url=source.get('url')
    if not source_url: raise SystemExit(f'{sid}: source URL missing')

    forced_start=float(seg['alignedStart']); forced_end=float(seg['alignedEnd'])
    forced_dur=forced_end-forced_start
    if forced_dur<MIN_DUR: raise SystemExit(f'{sid}: forced word window is implausibly short: {forced_dur:.3f}s')
    # Allow enough room to correct a forced-alignment miss, while preventing the critic
    # from selecting a long neighboring phrase as a supposedly cleaner single word.
    max_dur=max(.22,min(1.15,forced_dur+.20))
    center={'start':forced_start,'end':forced_end}
    margin=.28
    context_start=max(0,center['start']-margin); context_end=center['end']+margin
    context=Path(f'/tmp/hearframe-{sid}-precision.wav')
    run(['ffmpeg','-y','-hide_banner','-nostdin','-loglevel','error','-ss',f'{context_start:.3f}','-i',source_url,'-t',f'{context_end-context_start:.3f}','-vn','-ac','1','-ar','16000','-c:a','pcm_s16le',str(context)])
    sr,frames=read_wav(context)

    passes=[]
    pass_specs=[
      ('coarse',[-80,-40,0,40,80],[-80,-40,0,40,80]),
      ('fine',[-20,-10,0,10,20],[-20,-10,0,10,20]),
    ]
    for name,start_deltas,end_deltas in pass_specs:
        grid=candidate_grid(center,start_deltas,end_deltas,f'{sid}-{name}',max_dur)
        if len(grid)<5: raise RuntimeError(f'{sid} {name}: too few legal candidate windows ({len(grid)})')
        print(f'{sid} {name}: sending {len(grid)} independently-adjusted real WAV candidates to Gemini',flush=True)
        result,winner=judge(toks[0],grid,frames,sr,context_start,name)
        passes.append({'pass':name,'candidateCount':len(grid),'winnerId':winner['id'],'start':winner['start'],'end':winner['end'],'confidence':result.get('confidence'),'reason':result.get('reason'),'ranking':result.get('ranking')})
        center={'start':winner['start'],'end':winner['end']}
        time.sleep(2.0 if name=='coarse' else 20.0)

    grid=micro_candidates(center,f'{sid}-micro',max_dur)
    print(f'{sid} micro: sending {len(grid)} single-edge ±5 ms WAV candidates to Gemini after cooldown',flush=True)
    result,winner=judge(toks[0],grid,frames,sr,context_start,'micro')
    passes.append({'pass':'micro','candidateCount':len(grid),'winnerId':winner['id'],'start':winner['start'],'end':winner['end'],'confidence':result.get('confidence'),'reason':result.get('reason'),'ranking':result.get('ranking')})
    center={'start':winner['start'],'end':winner['end']}

    confidences=[float(p.get('confidence') or 0) for p in passes]
    if min(confidences)<MIN_CONFIDENCE: raise RuntimeError(f'{sid}: precision confidence gate failed')
    media=render_refined_video(sid,source_url,center['start'],center['end'])
    refinements[sid]={
      'segmentId':sid,'targetWord':toks[0].lower(),'forcedStart':forced_start,'forcedEnd':forced_end,
      'aiRefinedStart':center['start'],'aiRefinedEnd':center['end'],
      'startDeltaMs':round((center['start']-forced_start)*1000,1),'endDeltaMs':round((center['end']-forced_end)*1000,1),
      'forcedDurationMs':round(forced_dur*1000,1),'refinedDurationMs':round((center['end']-center['start'])*1000,1),
      'method':'gemini-audio-critic independent-edge wide/fine search + five-candidate micro',
      'precisionStatus':'ai-refined','qualityGate':'passed','minimumPassConfidence':round(min(confidences),3),
      'media':media,'passes':passes
    }

if not refinements: raise SystemExit('No single-word segments found; refinement gate did not run')
report={
 'version':'long-answer-word-refinement-v1.3','answerId':'long-demo',
 'policy':'Forced alignment is only the seed. Single-word cuts search start/end independently at ±80/40 ms, then ±20/10 ms, then ±5 ms; uncertain boundaries fail closed.',
 'minimumConfidence':MIN_CONFIDENCE,'singleWordSegmentsRequired':len(refinements),'singleWordSegmentsRefined':len(refinements),
 'allSingleWordsRefined':True,'allQualityGatesPassed':all(v.get('qualityGate')=='passed' for v in refinements.values()),'refinements':refinements
}
if not report['allQualityGatesPassed']: raise SystemExit('word precision quality gate failed')
OUT.write_text(json.dumps(report,indent=2,ensure_ascii=False))
print(json.dumps({k:{'forced':[v['forcedStart'],v['forcedEnd']],'refined':[v['aiRefinedStart'],v['aiRefinedEnd']],'deltaMs':[v['startDeltaMs'],v['endDeltaMs']],'minConfidence':v['minimumPassConfidence']} for k,v in refinements.items()},indent=2))
