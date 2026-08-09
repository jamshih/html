from pathlib import Path
import subprocess, re, json, shutil, time, math

OUT = Path('hearframe-grand-v4/rendered')
MEDIA = OUT / 'media'
MEDIA.mkdir(parents=True, exist_ok=True)
TMP = Path('/tmp/hearframe-rendered')
if TMP.exists(): shutil.rmtree(TMP)
TMP.mkdir(parents=True)

OBAMA_URL = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/23/20170110_President_Obama_Farewell_Speech_HD.webm/20170110_President_Obama_Farewell_Speech_HD.webm.360p.vp9.webm'
JFK_URL = 'https://upload.wikimedia.org/wikipedia/commons/transcoded/7/74/John_F._Kennedy_Inauguration_Speech.ogv/John_F._Kennedy_Inauguration_Speech.ogv.360p.vp9.webm'
H = {'start':1.308,'end':1.500}
W = {'start':122.440,'end':122.700}

def run(cmd, check=True):
    print('+', ' '.join(map(str, cmd)), flush=True)
    p = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if p.stdout: print(p.stdout[-2500:], flush=True)
    if p.stderr: print(p.stderr[-4000:], flush=True)
    if check and p.returncode:
        raise SystemExit(f'command failed ({p.returncode}): {cmd}\n{p.stderr}')
    return p

def download_once(url, dest):
    ua='HearframePrototype/1.0 (historical-speech listening-comprehension prototype; contact via github.com/jamshih/html)'
    run(['curl','--fail','--location','--show-error','--silent','--retry','12','--retry-delay','10','--retry-all-errors','--connect-timeout','30','--max-time','900','--user-agent',ua,url,'--output',str(dest)])
    if not dest.exists() or dest.stat().st_size < 1_000_000:
        raise SystemExit(f'download too small: {dest} {dest.stat().st_size if dest.exists() else 0}')
    print(f'downloaded {dest.name}: {dest.stat().st_size/1024/1024:.1f} MiB', flush=True)

OBAMA = TMP/'obama.webm'; JFK = TMP/'jfk.webm'
download_once(OBAMA_URL, OBAMA); time.sleep(5); download_once(JFK_URL, JFK)

def mean_volume(path, start, duration):
    p = run(['ffmpeg','-hide_banner','-nostdin','-ss',f'{start:.3f}','-i',str(path),'-t',f'{duration:.3f}','-vn','-af','volumedetect','-f','null','-'], check=False)
    m = re.findall(r'mean_volume:\s*(-?[0-9.]+) dB', p.stderr)
    if not m: raise SystemExit('could not parse mean_volume')
    return float(m[-1])

h_db = mean_volume(OBAMA, max(0,H['start']-.25), .70)
w_db = mean_volume(JFK, max(0,W['start']-.30), .85)
target = min(h_db,w_db)
h_gain_db=max(-6.0,min(0.0,target-h_db)); w_gain_db=max(-6.0,min(0.0,target-w_db))
print('context loudness',h_db,w_db,'gains',h_gain_db,w_gain_db,flush=True)

vf='scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:black,fps=30,format=yuv420p'
def make_raw(path,start,end,gain_db,dest):
    dur=end-start; af=f'aresample=48000,volume={gain_db:.3f}dB'
    run(['ffmpeg','-y','-hide_banner','-nostdin','-ss',f'{start:.3f}','-i',str(path),'-t',f'{dur:.3f}','-vf',vf,'-af',af,
         '-c:v','libx264','-preset','veryfast','-crf','20','-profile:v','main','-level','3.1','-pix_fmt','yuv420p','-bf','0','-g','30',
         '-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-movflags','+faststart','-video_track_timescale','90000',str(dest)])

hello_raw=TMP/'hello-raw.mp4'; world_raw=TMP/'world-raw.mp4'
make_raw(OBAMA,H['start'],H['end'],h_gain_db,hello_raw)
make_raw(JFK,W['start'],W['end'],w_gain_db,world_raw)

def standalone(src,dest,dur):
    fade=min(.008,dur*.08); out_start=max(0,dur-fade)
    run(['ffmpeg','-y','-hide_banner','-nostdin','-i',str(src),'-af',f'afade=t=in:st=0:d={fade:.4f}:curve=qsin,afade=t=out:st={out_start:.4f}:d={fade:.4f}:curve=qsin',
         '-c:v','copy','-c:a','aac','-b:a','128k','-movflags','+faststart',str(dest)])
standalone(hello_raw,MEDIA/'hello.mp4',H['end']-H['start']); standalone(world_raw,MEDIA/'world.mp4',W['end']-W['start'])

# IMPORTANT FOR SAFARI:
# Previous build used ffmpeg's video xfade on a <0.5 s result. Live WebKit accepted
# H.264/AAC but stalled at 0.001 s. Keep the video timeline simple: hard-concat
# normal CFR clips, and apply the research-inspired qsin crossfade to AUDIO ONLY.
# Padding restores the audio to the full concatenated video duration.
h_frames=math.ceil((H['end']-H['start'])*30); w_frames=math.ceil((W['end']-W['start'])*30)
video_duration=(h_frames+w_frames)/30.0
variants={'natural':0.010,'balanced':0.025,'smooth':0.035}
for name,xf in variants.items():
    fc=(f'[0:v]settb=AVTB,setpts=PTS-STARTPTS[v0];[1:v]settb=AVTB,setpts=PTS-STARTPTS[v1];'
        f'[v0][v1]concat=n=2:v=1:a=0,fps=30,setpts=PTS-STARTPTS[v];'
        f'[0:a]aresample=48000,asetpts=PTS-STARTPTS[a0];[1:a]aresample=48000,asetpts=PTS-STARTPTS[a1];'
        f'[a0][a1]acrossfade=d={xf:.3f}:c1=qsin:c2=qsin,apad=whole_dur={video_duration:.6f},atrim=duration={video_duration:.6f},asetpts=PTS-STARTPTS[a]')
    dest=MEDIA/f'hello-world-{name}.mp4'
    run(['ffmpeg','-y','-hide_banner','-nostdin','-i',str(hello_raw),'-i',str(world_raw),'-filter_complex',fc,'-map','[v]','-map','[a]',
         '-c:v','libx264','-preset','veryfast','-crf','20','-profile:v','main','-level','3.1','-pix_fmt','yuv420p','-bf','0','-g','30','-r','30',
         '-c:a','aac','-b:a','128k','-ar','48000','-ac','2','-movflags','+faststart','-video_track_timescale','90000',str(dest)])
    # Full decode validation, not just stream metadata.
    run(['ffmpeg','-v','error','-nostdin','-i',str(dest),'-f','null','-'])

metadata={'version':'rendered-v3','hello':H,'world':W,'analysisContext':{'helloMeanDbFS':h_db,'worldMeanDbFS':w_db},'appliedGainDb':{'hello':h_gain_db,'world':w_gain_db},'crossfadeMs':{k:round(v*1000) for k,v in variants.items()},'audioCurve':'qsin equal-power-style','videoTransition':'hard cut; audio crossfade only','videoCodec':'H.264 Main yuv420p CFR 30fps, no B-frames','audioCodec':'AAC 48kHz stereo','notes':'Each remote source is downloaded once. Context loudness is measured locally; only the louder source is attenuated, capped at 6 dB. Word windows remain exactly user-calibrated. Combined files use a simple Safari-safe video concat and qsin audio crossfade.'}
(MEDIA/'metadata.json').write_text(json.dumps(metadata,indent=2))
checks={}
for p in sorted(MEDIA.glob('*.mp4')):
    q=run(['ffprobe','-v','error','-show_entries','stream=codec_type,codec_name,start_time,duration','-show_entries','format=duration,start_time','-of','json',str(p)])
    data=json.loads(q.stdout); types={s.get('codec_type') for s in data.get('streams',[])}
    if not {'video','audio'}<=types: raise SystemExit(f'{p} missing audio/video stream: {data}')
    checks[p.name]=data
(MEDIA/'ffprobe.json').write_text(json.dumps(checks,indent=2))
print(json.dumps(metadata,indent=2),flush=True)
