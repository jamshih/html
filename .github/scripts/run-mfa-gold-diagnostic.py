from pathlib import Path
import json, shutil, subprocess

ROOT=Path('hearframe-grand-v4/ask/mfa-diagnostic'); ROOT.mkdir(parents=True,exist_ok=True)
TMP=Path('/tmp/hearframe-mfa');
if TMP.exists(): shutil.rmtree(TMP)
TMP.mkdir(parents=True)
URLS={
 'obama':'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/23/20170110_President_Obama_Farewell_Speech_HD.webm/20170110_President_Obama_Farewell_Speech_HD.webm.360p.vp9.webm',
 'jfk':'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/74/John_F._Kennedy_Inauguration_Speech.ogv/John_F._Kennedy_Inauguration_Speech.ogv.360p.vp9.webm'
}
UA='HearframePrototype/2.0 (MFA alignment QA; github.com/jamshih/html)'

def run(cmd,check=True):
    print('+',' '.join(map(str,cmd)),flush=True)
    p=subprocess.run(cmd,text=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    print(p.stdout[-2000:],p.stderr[-3500:],flush=True)
    if check and p.returncode: raise SystemExit(f'failed {p.returncode}: {p.stderr[-4000:]}')
    return p

src={}
for k,u in URLS.items():
    p=TMP/f'{k}.webm'; run(['curl','--fail','--location','--silent','--show-error','--retry','10','--retry-delay','8','--retry-all-errors','--user-agent',UA,u,'-o',str(p)]); src[k]=p

tests=[
 ('hello','obama',.90,2.20,'Hello Chicago'),
 ('world','jfk',121.00,124.10,'The world is very different now'),
 ('change','obama',227.60,232.35,'change only happens when ordinary people get involved'),
 ('agency','jfk',841.00,845.60,'ask what you can do for your country'),
]
outputs={}
for name,k,s,e,text in tests:
    wav=TMP/f'{name}.wav'; txt=TMP/f'{name}.txt'; out=ROOT/f'{name}.json'
    run(['ffmpeg','-y','-hide_banner','-loglevel','error','-ss',str(s),'-i',str(src[k]),'-t',str(e-s),'-ac','1','-ar','16000','-c:a','pcm_s16le',str(wav)])
    txt.write_text(text+'\n')
    # Legacy signature with downloaded named dictionary/acoustic model is stable in MFA 3.x.
    p=run(['mfa','align_one',str(wav),str(txt),'english_us_arpa','english_us_arpa',str(out),'--output_format','json','--clean'],check=False)
    outputs[name]={'returncode':p.returncode,'stdout':p.stdout[-2500:],'stderr':p.stderr[-4000:],'outputExists':out.exists(),'contextStart':s,'text':text}
    if out.exists():
        try: outputs[name]['raw']=json.loads(out.read_text())
        except Exception as ex: outputs[name]['rawText']=out.read_text()[:20000]; outputs[name]['parseError']=str(ex)
(ROOT/'summary.json').write_text(json.dumps(outputs,indent=2))
print(json.dumps(outputs,indent=2)[:16000])
if not all(x['returncode']==0 and x['outputExists'] for x in outputs.values()): raise SystemExit('one or more MFA diagnostics failed')
