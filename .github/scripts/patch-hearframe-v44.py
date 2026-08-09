from pathlib import Path

main = Path('hearframe-grand-v4/index.html')
seamless = Path('hearframe-grand-v4/seamless/index.html')

# MAIN: preserve the proven one-at-a-time playback path. Do not pre-seek both media
# again inside Grand; WebKit live QA showed that this separate path can stall.
text = main.read_text()
text = text.replace('v4.5 LIVE QA', 'v4.6 LIVE QA')
old = """async function grand(){if(!prepared||busy)return;busy=true;prepareBtn.disabled=true;buttons(false);hf.style.width=wf.style.width='0%';try{\n await Promise.all([seekExact(nv,H.start,'HELLO'),seekExact(jv,W.start,'WORLD')]);nv.pause();jv.pause();\n setStatus('STITCH 1/2 · Obama → HELLO');await playWindow(nv,H,'n','HELLO',hf,helloGain,true);\n setStatus('STITCH 2/2 · hard cut → JFK → WORLD');await playWindow(jv,W,'j','WORLD',wf,worldGain,true);\n wordOverlay.textContent='HELLO WORLD';sourceChip.textContent='PATCHED RESULT';setStatus('Patched Hello World complete with sound balance.','good');\n }catch(e){console.error(e);setStatus(e.message,'bad')}finally{busy=false;prepareBtn.disabled=false;buttons(true)}}"""
new = """async function grand(){if(!prepared||busy)return;busy=true;prepareBtn.disabled=true;buttons(false);hf.style.width=wf.style.width='0%';try{\n // Use exactly the same per-clip seek/play path that passes HELLO-only and WORLD-only on live WebKit.\n setStatus('STITCH 1/2 · Obama → HELLO');await playWindow(nv,H,'n','HELLO',hf,helloGain,false);\n setStatus('STITCH 2/2 · hard cut → JFK → WORLD');await playWindow(jv,W,'j','WORLD',wf,worldGain,false);\n wordOverlay.textContent='HELLO WORLD';sourceChip.textContent='PATCHED RESULT';setStatus('Patched Hello World complete with sound balance.','good');\n }catch(e){console.error(e);setStatus(e.message,'bad')}finally{busy=false;prepareBtn.disabled=false;buttons(true)}}"""
if old not in text:
    raise SystemExit('main: expected v4.5 grand block not found')
text = text.replace(old, new, 1)
main.write_text(text)
print('patched', main)

# SEAMLESS: keep the true simultaneous equal-power overlap on Chromium/desktop.
# On WebKit/iPad, use the same proven sequential playWindow path with the existing
# equal-power edge curves and balanced gains. This avoids concurrent remote WebM
# playback stalls while still smoothing the audio handoff.
text = seamless.read_text()
text = text.replace('v4.5 LIVE QA', 'v4.6 LIVE QA')
anchor = "let analysis={valid:false,helloDb:null,worldDb:null,gainH:1,gainW:1,bandsH:null,bandsW:null,distance:null,message:'not run'};"
if 'const IS_WEBKIT=' not in text:
    if anchor not in text:
        raise SystemExit('seamless: analysis anchor not found')
    text = text.replace(anchor, anchor + "\nconst IS_WEBKIT=/AppleWebKit/i.test(navigator.userAgent)&&!/Chrome|Chromium|Edg/i.test(navigator.userAgent);", 1)

start = text.find("async function grand(){")
end = text.find("async function beep(){", start)
if start < 0 or end < 0:
    raise SystemExit('seamless: grand function boundaries not found')
old_grand = text[start:end]
new_grand = """async function grand(){if(!prepared||busy)return;busy=true;prepareBtn.disabled=true;buttons(false);hf.style.width=wf.style.width='0%';const levels=effectiveLevels(),xfMs=crossfadeMs(),xf=xfMs/1000;try{\n if(IS_WEBKIT){\n   // Safari/iPad: live QA proves each word path is reliable, while simultaneous long remote media can stall.\n   // Reuse the proven path and retain equal-power edge shaping + loudness balance.\n   setStatus(`STITCH 1/2 · HELLO → Safari-safe ${xfMs} ms handoff`);\n   await playWindow(nv,H,'n','HELLO',hf,levels.h,false);\n   setStatus('STITCH 2/2 · Safari-safe balanced handoff → WORLD');\n   await playWindow(jv,W,'j','WORLD',wf,levels.w,false);\n   hf.style.width=wf.style.width='100%';wordOverlay.textContent='HELLO WORLD';sourceChip.textContent='PATCHED RESULT';\n   const mode=analysis.valid&&sound.auto?'auto-balanced':'manual-level';\n   setStatus(`Patched Hello World complete · Safari-safe equal-power handoff · ${mode}.`,'good');\n }else{\n   await Promise.all([seekExact(nv,H.start,'HELLO'),seekExact(jv,W.start,'WORLD')]);nv.pause();jv.pause();nv.muted=false;jv.muted=false;nv.volume=levels.h;jv.volume=0;show('n','HELLO');setStatus(`STITCH 1/2 · HELLO → ${xfMs} ms equal-power overlap`);await nv.play();const crossStart=Math.max(H.start,H.end-xf);await waitMediaTime(nv,crossStart,4000,()=>{hf.style.width=`${clamp((nv.currentTime-H.start)/(H.end-H.start),0,1)*100}%`});jv.volume=0;await jv.play();const crossStarted=performance.now();let switched=false;await new Promise((resolve,reject)=>{const tick=()=>{const p=clamp((performance.now()-crossStarted)/xfMs,0,1);const theta=p*Math.PI/2;nv.volume=clamp(levels.h*Math.cos(theta),0,1);jv.volume=clamp(levels.w*Math.sin(theta),0,1);hf.style.width=`${clamp((nv.currentTime-H.start)/(H.end-H.start),0,1)*100}%`;wf.style.width=`${clamp((jv.currentTime-W.start)/(W.end-W.start),0,1)*100}%`;if(!switched&&p>=.5){switched=true;show('j','WORLD');setStatus('STITCH 2/2 · equal-power crossfade → WORLD')}if(nv.error||jv.error){reject(new Error(nv.error?mediaError(nv):mediaError(jv)));return}if(p>=1){resolve();return}requestAnimationFrame(tick)};requestAnimationFrame(tick)});nv.pause();nv.volume=levels.h;jv.volume=levels.w;await waitMediaTime(jv,W.end,4000,()=>{wf.style.width=`${clamp((jv.currentTime-W.start)/(W.end-W.start),0,1)*100}%`});jv.pause();hf.style.width=wf.style.width='100%';wordOverlay.textContent='HELLO WORLD';sourceChip.textContent='PATCHED RESULT';const mode=analysis.valid&&sound.auto?'auto-balanced':'manual-level';setStatus(`Patched Hello World complete · ${xfMs} ms equal-power overlap · ${mode}.`,'good')\n }\n }catch(e){console.error(e);nv.pause();jv.pause();setStatus(e.message,'bad')}finally{busy=false;prepareBtn.disabled=false;buttons(true)}}\n"""
text = text[:start] + new_grand + text[end:]
seamless.write_text(text)
print('patched', seamless)
