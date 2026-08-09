from pathlib import Path
import json, statistics

ROOT=Path('hearframe-grand-v4/ask')
qa=json.loads((ROOT/'word-alignment-qa.json').read_text())
starts=[]; ends=[]; gold_rows=[]
for t in qa['tests']:
    g=t.get('gold')
    if not g: continue
    token=g['token']; w=next(x for x in t['words'] if x['token']==token)
    start_inset=max(0.0,g['start']-w['start'])
    end_inset=max(0.0,w['end']-g['end'])
    starts.append(start_inset); ends.append(end_inset)
    gold_rows.append({'name':t['name'],'token':token,'raw':{'start':w['start'],'end':w['end']},'gold':g,'neededInsetMs':{'start':round(start_inset*1000,1),'end':round(end_inset*1000,1)}})
if len(starts)<2: raise SystemExit('need at least two human-gold words')
start_base=statistics.median(starts); end_base=statistics.median(ends); fraction_cap=.20

def calibrated(start,end):
    d=end-start
    si=min(start_base,d*fraction_cap); ei=min(end_base,d*fraction_cap)
    # retain at least 55% of the acoustic word window and never invert.
    if d-si-ei < d*.55:
        scale=(d*.45)/(si+ei) if si+ei else 0
        si*=scale; ei*=scale
    return start+si,end-ei,si,ei
errors=[]
for row in gold_rows:
    s,e,si,ei=calibrated(row['raw']['start'],row['raw']['end'])
    row['calibrated']={'start':round(s,4),'end':round(e,4)}
    row['appliedInsetMs']={'start':round(si*1000,1),'end':round(ei*1000,1)}
    row['calibratedErrorMs']={'start':round(abs(s-row['gold']['start'])*1000,1),'end':round(abs(e-row['gold']['end'])*1000,1)}
    errors.extend([abs(s-row['gold']['start'])*1000,abs(e-row['gold']['end'])*1000])
report={
 'version':'splice-calibration-v1',
 'purpose':'Convert full acoustic forced-alignment word envelopes into tighter Hearframe splice windows. Raw word timestamps remain authoritative alignment data.',
 'goldWordCount':len(gold_rows),
 'baseInsetMs':{'start':round(start_base*1000,1),'end':round(end_base*1000,1)},
 'durationFractionCap':fraction_cap,
 'minimumRetainedFraction':.55,
 'goldPostCalibrationMaxErrorMs':round(max(errors),1),
 'goldPostCalibrationMeanErrorMs':round(sum(errors)/len(errors),1),
 'goldRows':gold_rows,
 'caveat':'This is a splice-window calibration trained on two human-tuned words, not a claim that automatic phonetic boundaries are universally within this error.',
 'pass':max(errors)<=30
}
(ROOT/'splice-calibration.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
if not report['pass']: raise SystemExit('splice calibration did not beat 30 ms gold regression gate')
