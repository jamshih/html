from pathlib import Path
import json

ROOT=Path('hearframe-grand-v4/ask')
cal=json.loads((ROOT/'splice-calibration.json').read_text())
idx=json.loads((ROOT/'reference-word-index.json').read_text())
start_base=cal['baseInsetMs']['start']/1000; end_base=cal['baseInsetMs']['end']/1000; frac=cal['durationFractionCap']; min_keep=cal['minimumRetainedFraction']

def window(s,e):
    d=e-s; si=min(start_base,d*frac); ei=min(end_base,d*frac)
    if d-si-ei < d*min_keep:
        budget=d*(1-min_keep); scale=budget/(si+ei) if si+ei else 0; si*=scale; ei*=scale
    return round(s+si,3),round(e-ei,3)
count=0
for token,cands in idx['tokens'].items():
    for c in cands:
        cs,ce=window(float(c['start']),float(c['end']))
        c['clipStart']=cs;c['clipEnd']=ce;c['spliceWindowSource']='forced-alignment + human-gold-calibrated inset';count+=1
idx['version']='reference-word-index-v2'
idx['spliceCalibration']={k:cal[k] for k in ['version','goldWordCount','baseInsetMs','durationFractionCap','minimumRetainedFraction','goldPostCalibrationMaxErrorMs','goldPostCalibrationMeanErrorMs','caveat']}
idx['candidateCountWithSpliceWindows']=count
(ROOT/'reference-word-index.json').write_text(json.dumps(idx,indent=2,ensure_ascii=False))
report=json.loads((ROOT/'reference-index-report.json').read_text()); report['spliceCalibrationApplied']=True; report['spliceCandidateCount']=count; report['goldPostCalibrationMaxErrorMs']=cal['goldPostCalibrationMaxErrorMs']; report['goldPostCalibrationMeanErrorMs']=cal['goldPostCalibrationMeanErrorMs']; report['pass']=bool(report.get('pass')) and bool(cal.get('pass'))
(ROOT/'reference-index-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'candidates':count,'calibrationMaxGoldErrorMs':cal['goldPostCalibrationMaxErrorMs'],'calibrationMeanGoldErrorMs':cal['goldPostCalibrationMeanErrorMs'],'pass':report['pass']},indent=2))
if not report['pass']: raise SystemExit('post-calibrated reference index failed gate')
