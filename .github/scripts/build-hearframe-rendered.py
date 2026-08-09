from pathlib import Path
import subprocess, re, json, math, shutil

OUT = Path('hearframe-grand-v4/rendered')
MEDIA = OUT / 'media'
MEDIA.mkdir(parents=True, exist_ok=True)
TMP = Path('/tmp/hearframe-rendered')
if TMP.exists(): shutil.rmtree(TMP)
TMP.mkdir(parents=True)

OBAMA = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/23/20170110_President_Obama_Farewell_Speech_HD.webm/20170110_President_Obama_Farewell_Speech_HD.webm.360p.vp9.webm'
JFK = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/74/John_F._Kennedy_Inauguration_Speech.ogv/John_F._Kennedy_Inauguration_Speech.ogv.360p.vp9.webm'
H = {'start':1.308,'end':1.500}
W = {'start':122.440,'end':122.700}

def run(cmd, check=True):
    print('+', ' '.join(map(str, cmd)))
    p = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print(p.stderr[-3500:])
    if check and p.returncode:
        raise SystemExit(f'command failed ({p.returncode}): {cmd}\n{p.stderr}')
    return p

def mean_volume(url, start, duration):
    p = run(['ffmpeg','-hide_banner','-nostdin','-ss',f'{start:.3f}','-i',url,'-t',f'{duration:.3f}','-vn','-af','volumedetect','-f','null','-'], check=False)
    m = re.findall(r'mean_volume:\s*(-?[0-9.]+) dB', p.stderr)
    if not m:
        raise SystemExit('could not parse mean_volume')
    return float(m[-1])

# Analyze surrounding speech, not only the microscopic word clips.
h_db = mean_volume(OBAMA, max(0,H['start']-.25), .70)
w_db = mean_volume(JFK, max(0,W['start']-.30), .85)
target = min(h_db, w_db)
h_gain_db = max(-6.0, min(0.0, target-h_db))
w_gain_db = max(-6.0, min(0.0, target-w_db))
print('context loudness', h_db, w_db, 'gains', h_gain_db, w_gain_db)

vf = 'scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:black,fps=30,format=yuv420p'

def make_raw(url, start, end, gain_db, dest):
    dur=end-start
    af=f'aresample=48000,volume={gain_db:.3f}dB'
    run(['ffmpeg','-y','-hide_banner','-nostdin','-ss',f'{start:.3f}','-i',url,'-t',f'{dur:.3f}',
         '-vf',vf,'-af',af,'-c:v','libx264','-preset','veryfast','-crf','20','-profile:v','main','-level','3.1','-pix_fmt','yuv420p',
         '-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-movflags','+faststart',str(dest)])

hello_raw=TMP/'hello-raw.mp4'; world_raw=TMP/'world-raw.mp4'
make_raw(OBAMA,H['start'],H['end'],h_gain_db,hello_raw)
make_raw(JFK,W['start'],W['end'],w_gain_db,world_raw)

# Standalone word files: tiny equal-power-like sine edge fades, still same exact windows.
def standalone(src, dest, dur):
    fade=min(.008,dur*.08)
    out_start=max(0,dur-fade)
    run(['ffmpeg','-y','-hide_banner','-nostdin','-i',str(src),'-af',f'afade=t=in:st=0:d={fade:.4f}:curve=qsin,afade=t=out:st={out_start:.4f}:d={fade:.4f}:curve=qsin',
         '-c:v','copy','-c:a','aac','-b:a','128k','-movflags','+faststart',str(dest)])

standalone(hello_raw, MEDIA/'hello.mp4', H['end']-H['start'])
standalone(world_raw, MEDIA/'world.mp4', W['end']-W['start'])

# Research-inspired equal-power audio match cut. Three user-selectable smoothness variants.
variants={'natural':0.010,'balanced':0.025,'smooth':0.035}
for name, xf in variants.items():
    offset=(H['end']-H['start'])-xf
    # qsin is a quarter-sine curve. A very short matching video dissolve keeps A/V lengths identical.
    fc=(f'[0:v][1:v]xfade=transition=fade:duration={xf:.3f}:offset={offset:.3f}[v];'
        f'[0:a][1:a]acrossfade=d={xf:.3f}:c1=qsin:c2=qsin[a]')
    run(['ffmpeg','-y','-hide_banner','-nostdin','-i',str(hello_raw),'-i',str(world_raw),'-filter_complex',fc,
         '-map','[v]','-map','[a]','-c:v','libx264','-preset','veryfast','-crf','20','-profile:v','main','-level','3.1','-pix_fmt','yuv420p',
         '-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-movflags','+faststart',str(MEDIA/f'hello-world-{name}.mp4')])

metadata={
 'version':'rendered-v1',
 'hello':H,'world':W,
 'analysisContext':{'helloMeanDbFS':h_db,'worldMeanDbFS':w_db},
 'appliedGainDb':{'hello':h_gain_db,'world':w_gain_db},
 'crossfadeMs':{k:round(v*1000) for k,v in variants.items()},
 'audioCurve':'qsin equal-power-style',
 'videoCodec':'H.264 yuv420p','audioCodec':'AAC 48kHz stereo',
 'notes':'Source-context loudness is measured with ffmpeg volumedetect; only the louder source is attenuated, capped at 6 dB. Word windows remain exactly user-calibrated.'
}
(MEDIA/'metadata.json').write_text(json.dumps(metadata,indent=2))

# Verify generated files with ffprobe and reject missing A/V streams.
checks={}
for p in sorted(MEDIA.glob('*.mp4')):
    q=run(['ffprobe','-v','error','-show_entries','stream=codec_type,codec_name','-show_entries','format=duration','-of','json',str(p)])
    data=json.loads(q.stdout)
    types={s.get('codec_type') for s in data.get('streams',[])}
    if not {'video','audio'} <= types:
        raise SystemExit(f'{p} missing audio/video stream: {data}')
    checks[p.name]=data
(MEDIA/'ffprobe.json').write_text(json.dumps(checks,indent=2))
print(json.dumps(metadata,indent=2))
