from pathlib import Path
import json, statistics

ROOT=Path('hearframe-grand-v4/ask')
CAT=json.loads((ROOT/'reference-videos.json').read_text())
REFS={x['referenceId']:x for x in CAT['videos']}
shards=[]
for p in sorted((ROOT/'reference-index').glob('shard-*.json')):
    shards.append(json.loads(p.read_text()))
if len(shards)!=10: raise SystemExit(f'expected 10 shards, found {len(shards)}')
results=[]
for s in shards: results.extend(s['results'])
by_id={r['referenceId']:r for r in results}
if len(by_id)!=100: raise SystemExit(f'expected results for 100 references, got {len(by_id)}')

inverted={}; all_scores=[]; total_words=0; indexed=0
for rid in sorted(by_id):
    r=by_id[rid]; ref=REFS[rid]
    if r.get('status')=='indexed': indexed+=1
    for w in r.get('words',[]):
        if w['score'] < .35: continue
        total_words+=1; all_scores.append(w['score'])
        cand={'referenceId':rid,'title':ref['title'],'pageUrl':ref['pageUrl'],'sourceUrl':ref['sourceUrl'],'license':ref['license'],'word':w['word'],'start':w['start'],'end':w['end'],'score':w['score']}
        inverted.setdefault(w['token'],[]).append(cand)
for token,cands in inverted.items():
    cands.sort(key=lambda x:(-x['score'],x['end']-x['start']))
    inverted[token]=cands[:8]

# The catalog itself must contain 100 verified videos. The excerpt index is allowed
# to reject silent/music-only openings, but a healthy run should align most of them.
pass_index = indexed >= 70 and total_words >= 3000 and len(inverted) >= 700
report={
 'catalogReferences':len(REFS),
 'processedReferences':len(by_id),
 'indexedSpeechReferences':indexed,
 'sampleSecondsPerReference':shards[0].get('sampleSeconds'),
 'acceptedWordOccurrences':total_words,
 'uniqueWords':len(inverted),
 'medianAlignmentScore':round(statistics.median(all_scores),4) if all_scores else 0,
 'statusCounts':{},
 'pass':pass_index
}
for r in results: report['statusCounts'][r.get('status','unknown')]=report['statusCounts'].get(r.get('status','unknown'),0)+1
index={'version':'reference-word-index-v1','referenceCount':len(REFS),'indexedSpeechReferences':indexed,'sampleScope':'Opening 45 seconds of each verified reference video; word boundaries use WhisperX wav2vec2 forced alignment.','tokens':inverted}
(ROOT/'reference-word-index.json').write_text(json.dumps(index,indent=2,ensure_ascii=False))
(ROOT/'reference-index-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
if not pass_index: raise SystemExit('reference index quality gate failed')
