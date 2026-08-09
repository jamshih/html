from pathlib import Path
import re

files = [Path('hearframe-grand-v4/index.html'), Path('hearframe-grand-v4/seamless/index.html')]
for path in files:
    text = path.read_text()
    text = re.sub(r'<title>Hearframe — Grand Hello World [^<]+</title>', '<title>Hearframe — Grand Hello World v4.4 LIVE QA</title>', text, count=1)

    pattern = r"const H0=\{start:1\.308,end:1\.500\},\s*W0=\{start:122\.440,end:122\.700\};"
    replacement = "const H0={start:1.308,end:1.500}, W0={start:122.440,end:122.700};\nconst H_WARM=1.468,W_WARM=121.36;"
    text, n = re.subn(pattern, replacement, text, count=1)
    if n != 1:
        raise SystemExit(f'{path}: failed to insert warm seek constants')

    old = "await Promise.all([loadSource(nv,NIXON,'Obama'),loadSource(jv,JFK,'JFK')]);await Promise.all([seekExact(nv,H.start,'HELLO'),seekExact(jv,W.start,'WORLD')]);"
    new = "await Promise.all([loadSource(nv,NIXON,'Obama'),loadSource(jv,JFK,'JFK')]);setStatus('Warming the source ranges that previously prepared successfully…');await Promise.all([seekExact(nv,H_WARM,'HELLO warm-up'),seekExact(jv,W_WARM,'WORLD warm-up')]);setStatus('Moving to your calibrated word windows…');await Promise.all([seekExact(nv,H.start,'HELLO'),seekExact(jv,W.start,'WORLD')]);"
    if old not in text:
        raise SystemExit(f'{path}: prepare sequence not found')
    text = text.replace(old, new, 1)

    # Visible marker for the live runner as a fallback to the title check.
    text = text.replace('<div class="eyebrow">REAL-SPEECH SPLICER / ONE PATCHED VIDEO STAGE</div>', '<div class="eyebrow">REAL-SPEECH SPLICER / ONE PATCHED VIDEO STAGE · v4.4 LIVE QA</div>', 1)
    path.write_text(text)
    print('patched', path)
