from pathlib import Path
import json, re, subprocess

ROOT=Path('hearframe-grand-v4/ask'); MEDIA=ROOT/'media'; corpus=json.loads((ROOT/'corpus.json').read_text())
SEG_IDS=['you_can','begin','ask_what_you_can_do','change_people','world_different']
TEXT='You can begin. Ask what you can do. Change only happens when ordinary people get involved. The world is very different now.'
OUT=MEDIA/'answer-long-demo.mp4'

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

inputs=[MEDIA/f'segment-{sid}.mp4' for sid in SEG_IDS]
for p in inputs:
    if not p.exists(): raise SystemExit(f'missing {p}')
durs=[duration(p) for p in inputs]; means=[mean_db(p) for p in inputs]
# Bring sources toward the median speech level but never move a segment by >6 dB.
target=sorted(means)[len(means)//2]
gains=[max(-6.0,min(6.0,target-x)) for x in means]
xfades=[]
for a,b in zip(durs,durs[1:]): xfades.append(min(.025,a*.12,b*.12))
video_duration=sum(round(d*30)/30 for d in durs)
args=[]
for p in inputs: args += ['-i',str(p)]
filters=[]
for i,g in enumerate(gains):
    filters.append(f'[{i}:v]settb=AVTB,setpts=PTS-STARTPTS[v{i}]')
    filters.append(f'[{i}:a]aresample=48000,volume={g:.3f}dB,asetpts=PTS-STARTPTS[a{i}]')
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
# Full decode validation, not just metadata.
run(['ffmpeg','-v','error','-nostdin','-i',str(OUT),'-f','null','-'])
probe=json.loads(run(['ffprobe','-v','error','-show_entries','stream=codec_type,codec_name','-show_entries','format=duration','-of','json',str(OUT)]).stdout)
if {s.get('codec_type') for s in probe.get('streams',[])} != {'video','audio'}: raise SystemExit('long answer missing A/V')
# Update corpus idempotently.
corpus['answers']=[a for a in corpus['answers'] if a.get('id')!='long-demo']
corpus['answers'].append({'id':'long-demo','text':TEXT,'keywords':['long answer','longer answer','long sentence','longer sentence','say something longer','give me a longer answer','test long sentence'],'segments':SEG_IDS,'media':'media/answer-long-demo.mp4'})
corpus['version']='ask-v0.2'
corpus['notes']='Includes a five-fragment, 22-word long-answer regression test in addition to phrase-first answers.'
(ROOT/'corpus.json').write_text(json.dumps(corpus,indent=2))
report={'text':TEXT,'wordCount':len(re.findall(r"[A-Za-z']+",TEXT)),'segments':SEG_IDS,'segmentCount':len(SEG_IDS),'sourceMeansDbFS':means,'appliedGainDb':gains,'crossfadeMs':[round(x*1000,1) for x in xfades],'duration':float(probe['format']['duration']),'fullDecode':'pass','probe':probe,'pass':True}
(ROOT/'long-sentence-qa.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
