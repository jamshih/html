from pathlib import Path

files = [Path('hearframe-grand-v4/index.html'), Path('hearframe-grand-v4/seamless/index.html')]
for path in files:
    text = path.read_text()

    text = text.replace('v4.4 LIVE QA', 'v4.5 LIVE QA')

    helper_anchor = 'async function loadSource(v,cands,label)'
    helper = "async function waitReady(v,min,label,timeout=12000){const started=performance.now();while(v.readyState<min){if(v.error)throw new Error(`${label}: ${mediaError(v)}`);if(performance.now()-started>timeout)throw new Error(`${label}: media readiness timed out (readyState ${v.readyState})`);await new Promise(r=>setTimeout(r,50))}}\n"
    if 'async function waitReady(' not in text:
        if helper_anchor not in text:
            raise SystemExit(f'{path}: loadSource anchor missing')
        text = text.replace(helper_anchor, helper + helper_anchor, 1)

    old_ready = "if(v.readyState<3)await waitEvent(v,'canplay',12000);"
    if old_ready not in text:
        raise SystemExit(f'{path}: old canplay readiness check missing')
    text = text.replace(old_ready, "await waitReady(v,2,label,12000);", 1)

    # Sound-analysis media uses the same readiness polling instead of waiting for a canplay event.
    text = text.replace("if(v.readyState<2)await waitEvent(v,'canplay',12000);", "await waitReady(v,2,label,12000);", 1)

    if path.name == 'index.html' and path.parent.name == 'hearframe-grand-v4':
        old_sig = "async function playWindow(v,clip,which,word,fillEl,targetGain){\n await seekExact(v,clip.start,word);"
        new_sig = "async function playWindow(v,clip,which,word,fillEl,targetGain,alreadySeeked=false){\n if(!alreadySeeked)await seekExact(v,clip.start,word);"
        if old_sig not in text:
            raise SystemExit(f'{path}: main playWindow signature missing')
        text = text.replace(old_sig, new_sig, 1)
        text = text.replace("await playWindow(nv,H,'n','HELLO',hf,helloGain);", "await playWindow(nv,H,'n','HELLO',hf,helloGain,true);", 1)
        text = text.replace("await playWindow(jv,W,'j','WORLD',wf,worldGain);", "await playWindow(jv,W,'j','WORLD',wf,worldGain,true);", 1)
    else:
        old_sig = "async function playWindow(v,clip,which,word,fillEl,level){await seekExact(v,clip.start,word);"
        new_sig = "async function playWindow(v,clip,which,word,fillEl,level,alreadySeeked=false){if(!alreadySeeked)await seekExact(v,clip.start,word);"
        if old_sig not in text:
            raise SystemExit(f'{path}: seamless playWindow signature missing')
        text = text.replace(old_sig, new_sig, 1)
        duplicate = "await seekExact(jv,W.start,'WORLD');jv.volume=0;await jv.play();"
        if duplicate not in text:
            raise SystemExit(f'{path}: redundant WORLD seek missing')
        text = text.replace(duplicate, "jv.volume=0;await jv.play();", 1)

    path.write_text(text)
    print('patched', path)
