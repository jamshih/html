from __future__ import annotations
from pathlib import Path
import json, re, shutil, subprocess, time

ROOT=Path('hearframe-grand-v4/ask')
REPORT=ROOT/'word-alignment-qa.json'
TMP=Path('/tmp/hearframe-alignment-v2')
if TMP.exists(): shutil.rmtree(TMP)
TMP.mkdir(parents=True)
UA='HearframePrototype/2.0 (word-boundary QA; github.com/jamshih/html)'
URLS={
 'obama':'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/23/20170110_President_Obama_Farewell_Speech_HD.webm/20170110_President_Obama_Farewell_Speech_HD.webm.360p.vp9.webm',
 'jfk':'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/74/John_F._Kennedy_Inauguration_Speech.ogv/John_F._Kennedy_Inauguration_Speech.ogv.360p.vp9.webm'
}

def run(cmd):
    print('+',' '.join(map(str,cmd)),flush=True)
    p=subprocess.run(cmd,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if p.returncode: raise SystemExit(p.stderr[-5000:])
    return p

def dl(k):
    p=TMP/f'{k}.webm'
    run(['curl','--fail','--location','--show-error','--silent','--retry','10','--retry-delay','8','--retry-all-errors','--user-agent',UA,URLS[k],'-o',str(p)])
    if p.stat().st_size<1_000_000: raise SystemExit(f'{k} download too small')
    return p
sources={k:dl(k) for k in URLS}

import whisperx
DEVICE='cpu'
# WhisperX's phoneme/CTC forced alignment is the authoritative timing stage.
ALIGN_MODEL='WAV2VEC2_ASR_LARGE_LV60K_960H'
model_a, metadata = whisperx.load_align_model(language_code='en', device=DEVICE, model_name=ALIGN_MODEL)

def crop(src,start,end,name):
    out=TMP/f'{name}.wav'
    run(['ffmpeg','-y','-hide_banner','-loglevel','error','-ss',f'{start:.3f}','-i',str(src),'-t',f'{end-start:.3f}','-vn','-ac','1','-ar','16000','-c:a','pcm_s16le',str(out)])
    return out

def norm(s): return re.sub(r"[^a-z0-9']+",'',s.lower())

def forced(name,src,context,text):
    c0,c1=context; wav=crop(sources[src],c0,c1,name)
    audio=whisperx.load_audio(str(wav))
    seg=[{'start':0.0,'end':c1-c0,'text':text}]
    out=whisperx.align(seg,model_a,metadata,audio,DEVICE,return_char_alignments=True)
    words=[]
    for w in out.get('word_segments',[]):
        if w.get('start') is None or w.get('end') is None: continue
        words.append({'word':w['word'].strip(),'token':norm(w['word']),'start':round(c0+float(w['start']),4),'end':round(c0+float(w['end']),4),'score':round(float(w.get('score') or 0),4)})
    expected=[norm(x) for x in text.split() if norm(x)]
    got=[w['token'] for w in words]
    if expected!=got:
        raise SystemExit(f'{name}: forced alignment token mismatch expected={expected} got={got}')
    for i,w in enumerate(words):
        if w['end']<=w['start']: raise SystemExit(f'{name}: nonpositive word {w}')
        if i and w['start'] < words[i-1]['start']: raise SystemExit(f'{name}: nonmonotonic')
    return {'name':name,'source':src,'context':context,'text':text,'alignModel':ALIGN_MODEL,'words':words}

def get_word(test,token,n=0):
    xs=[w for w in test['words'] if w['token']==token]
    if len(xs)<=n: raise SystemExit(f"{test['name']}: missing {token}")
    return xs[n]

# Two human-calibrated boundaries from the POC are our regression gold set.
tests=[]
tests.append(forced('gold-hello','obama',(0.90,2.20),'Hello Chicago'))
tests.append(forced('gold-world','jfk',(121.00,124.10),'The world is very different now'))
# Longer utterances exercise dense adjacent word boundaries, not isolated words.
tests.append(forced('long-change','obama',(227.60,232.35),'change only happens when ordinary people get involved'))
tests.append(forced('long-agency','jfk',(841.00,845.60),'ask what you can do for your country'))

GOLD={
 'gold-hello':{'token':'hello','start':1.308,'end':1.500},
 'gold-world':{'token':'world','start':122.440,'end':122.700},
}
errs=[]
for t in tests:
    if t['name'] in GOLD:
        g=GOLD[t['name']]; w=get_word(t,g['token'])
        se=abs(w['start']-g['start']); ee=abs(w['end']-g['end'])
        t['gold']=g; t['boundaryErrorMs']={'start':round(se*1000,1),'end':round(ee*1000,1),'mean':round((se+ee)*500,1)}
        errs.extend([se*1000,ee*1000])

# Hard accuracy gate: both human-calibrated words must be close enough for splice work.
# <=120 ms individual is intentionally strict relative to ordinary subtitle timing.
max_error=max(errs); mean_error=sum(errs)/len(errs)
long_ok=True
for t in tests[2:]:
    if len(t['words']) < 7: long_ok=False
    if any((w['end']-w['start'])>1.4 for w in t['words']): long_ok=False
report={
 'version':'word-alignment-v2',
 'method':'WhisperX phoneme/CTC forced alignment with WAV2VEC2_ASR_LARGE_LV60K_960H',
 'goldBoundaryToleranceMs':120,
 'goldMaxBoundaryErrorMs':round(max_error,1),
 'goldMeanBoundaryErrorMs':round(mean_error,1),
 'longSentenceStructuralCheck':long_ok,
 'tests':tests,
 'pass':max_error<=120 and long_ok
}
REPORT.write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
if not report['pass']:
    raise SystemExit(f'word-alignment QA failed: max gold boundary error {max_error:.1f} ms, long={long_ok}')
