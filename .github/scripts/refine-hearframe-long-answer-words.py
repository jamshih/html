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
MIN_DUR=.06
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
def candidate_grid(center,deltas,prefix):
    out=[]; seen=set()
    for ds in deltas:
        for de in deltas:
            s=round_ms(center['start']+ds/1000); e=round_ms(center['end']+de/1000)
            if s<0 or e-s<MIN_DUR: continue
            key=(s,e)
            if key in seen: continue
            seen.add(key)
            out.append({'id':f'{prefix}-s{ds:+d}-e{de:+d}','start':s,'end':e,'startDeltaMs':ds,'endDeltaMs':de})
    return out

def micro_candidates(center,prefix):
    # The fine pass has already searched start/end independently at ±10 ms. For the
    # last ±5 ms pass, avoid nine nearly indistinguishable audio inputs: compare the
    # center plus each single-edge movement. This still allows either boundary to move.
    pairs=[(-5,0),(0,-5),(0,0),(0,5),(5,0)]
    out=[]
    for ds,de in pairs:
        s=round_ms(center['start']+ds/1000); e=round_ms(center['end']+de/1000)
        if s<0 or e-s<MIN_DUR: continue
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

def judge(target,cands,frames,sr,context_start):
    payload={'targetWord':target,'candidates':[]}
    for c in cands:
        payload['candidates'].append({'id':c['id'],'audioBase64':wav_slice_base64(frames,sr,context_start,c['start'],c['end']),'mimeType':'audio/wav','startMs':round(c['start']*1000),'endMs':round(c['end']*1000)})
    body=json.dumps(payload,separators=(',',':')).encode()
    last=None
    for attempt in range(1,7):
        req=urllib.request.Request(AI_ENDPOINT,data=body,headers={'content-type':'application/json','apikey':PUBLISHABLE_KEY,'user-agent':'HearframeWordPrecision/1.2'},method='POST')
        try:
            with urllib.request.urlopen(req,timeout=70) as r:
                data=json.load(r)
            winner=next((c for c in cands if c['id']==data.get('bestCandidateId')),None)
            if not winner: raise RuntimeError(f"AI returned non-rendered candidate: {data.get('bestCandidateId')}")
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
    center={'start':float(seg['alignedStart']),'end':float(seg['alignedEnd'])}
    margin=.18
    context_start=max(0,center['start']-margin); context_end=center['end']+margin
    context=Path(f'/tmp/hearframe-{sid}-precision.wav')
    run(['ffmpeg','-y','-hide_banner','-nostdin','-loglevel','error','-ss',f'{context_start:.3f}','-i',source_url,'-t',f'{context_end-context_start:.3f}','-vn','-ac','1','-ar','16000','-c:a','pcm_s16le',str(context)])
    sr,frames=read_wav(context)
    passes=[]
    for name,deltas in [('coarse',[-40,0,40]),('fine',[-10,0,10])]:
        grid=candidate_grid(center,deltas,f'{sid}-{name}')
        print(f'{sid} {name}: sending {len(grid)} real WAV candidates to Gemini',flush=True)
        result,winner=judge(toks[0],grid,frames,sr,context_start)
        passes.append({'pass':name,'candidateCount':len(grid),'winnerId':winner['id'],'start':winner['start'],'end':winner['end'],'confidence':result.get('confidence'),'reason':result.get('reason'),'ranking':result.get('ranking')})
        center={'start':winner['start'],'end':winner['end']}
        time.sleep(2.0 if name=='coarse' else 20.0)
    grid=micro_candidates(center,f'{sid}-micro')
    print(f'{sid} micro: sending {len(grid)} single-edge ±5 ms WAV candidates to Gemini after cooldown',flush=True)
    result,winner=judge(toks[0],grid,frames,sr,context_start)
    passes.append({'pass':'micro','candidateCount':len(grid),'winnerId':winner['id'],'start':winner['start'],'end':winner['end'],'confidence':result.get('confidence'),'reason':result.get('reason'),'ranking':result.get('ranking')})
    center={'start':winner['start'],'end':winner['end']}
    media=render_refined_video(sid,source_url,center['start'],center['end'])
    refinements[sid]={
      'segmentId':sid,'targetWord':toks[0].lower(),'forcedStart':float(seg['alignedStart']),'forcedEnd':float(seg['alignedEnd']),
      'aiRefinedStart':center['start'],'aiRefinedEnd':center['end'],
      'startDeltaMs':round((center['start']-float(seg['alignedStart']))*1000,1),'endDeltaMs':round((center['end']-float(seg['alignedEnd']))*1000,1),
      'method':'gemini-audio-critic rendered-candidate coarse/fine + five-candidate micro','precisionStatus':'ai-refined','media':media,'passes':passes
    }

if not refinements: raise SystemExit('No single-word segments found; refinement gate did not run')
report={'version':'long-answer-word-refinement-v1.2','answerId':'long-demo','singleWordSegmentsRequired':len(refinements),'singleWordSegmentsRefined':len(refinements),'allSingleWordsRefined':True,'refinements':refinements}
OUT.write_text(json.dumps(report,indent=2,ensure_ascii=False))
print(json.dumps({k:{'forced':[v['forcedStart'],v['forcedEnd']],'refined':[v['aiRefinedStart'],v['aiRefinedEnd']],'deltaMs':[v['startDeltaMs'],v['endDeltaMs']]} for k,v in refinements.items()},indent=2))
