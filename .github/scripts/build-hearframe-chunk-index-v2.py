from pathlib import Path
import json, re, statistics

ROOT=Path('hearframe-grand-v4/ask')
CAT=json.loads((ROOT/'reference-videos.json').read_text())
REFS={x['referenceId']:x for x in CAT['videos']}
shards=[json.loads(p.read_text()) for p in sorted((ROOT/'reference-index').glob('shard-*.json'))]
if not shards: raise SystemExit('reference-index shards missing')
results=[]
for s in shards: results.extend(s.get('results',[]))

def norm(s): return re.sub(r"[^a-z0-9']+",'',str(s).lower().replace('’',"'"))
def phrase_key(tokens): return ' '.join(t for t in tokens if t)
def compact_candidate(rid,ref,word_slice,kind,text=None):
    tokens=[norm(w.get('word','')) for w in word_slice]; tokens=[t for t in tokens if t]
    scores=[float(w.get('score') or 0) for w in word_slice]
    return {
      'referenceId':rid,'title':ref['title'],'pageUrl':ref['pageUrl'],'sourceUrl':ref['sourceUrl'],'license':ref['license'],
      'type':kind,'text':text or ' '.join(w.get('word','').strip() for w in word_slice).strip(),'tokens':tokens,
      'start':round(float(word_slice[0]['start']),3),'end':round(float(word_slice[-1]['end']),3),'wordCount':len(tokens),
      'score':round(statistics.mean(scores),4) if scores else 0
    }

phrases={}; sentences=[]; refs_with_chunks=set(); total_phrase_occ=0
for r in results:
    rid=r.get('referenceId'); ref=REFS.get(rid)
    if not ref or r.get('status') not in ('indexed','low-speech'): continue
    words=sorted([w for w in r.get('words',[]) if w.get('start') is not None and w.get('end') is not None and float(w.get('score') or 0)>=.35],key=lambda w:float(w['start']))
    if len(words)<2: continue
    for seg in r.get('segments',[]):
        if seg.get('start') is None or seg.get('end') is None: continue
        s0=float(seg['start'])-.08; s1=float(seg['end'])+.08
        sw=[w for w in words if ((float(w['start'])+float(w['end']))/2)>=s0 and ((float(w['start'])+float(w['end']))/2)<=s1]
        if len(sw)<2: continue
        refs_with_chunks.add(rid)
        # The full aligned utterance is a first-class candidate. Tighten it to first/last
        # forced-aligned word rather than trusting the broader ASR segment boundary.
        if len(sw)<=30:
            sentences.append(compact_candidate(rid,ref,sw,'sentence',str(seg.get('text') or '').strip()))
        n=len(sw)
        for start in range(n):
            for size in range(2,min(8,n-start)+1):
                window=sw[start:start+size]
                toks=[norm(w.get('word','')) for w in window]
                key=phrase_key(toks)
                if not key: continue
                cand=compact_candidate(rid,ref,window,'phrase')
                phrases.setdefault(key,[]).append(cand); total_phrase_occ+=1

# Keep a small set of high-quality alternatives for the same exact phrase.
for key,cands in phrases.items():
    cands.sort(key=lambda c:(-c['score'],c['end']-c['start']))
    phrases[key]=cands[:4]
sentences.sort(key=lambda c:(-c['wordCount'],-c['score']))
# Keep all useful short corpus sentences for the 100-reference proof, but cap pathological size.
sentences=sentences[:5000]

report={
 'version':'reference-chunk-index-v2-report','referencesWithChunks':len(refs_with_chunks),'sentenceCandidates':len(sentences),
 'uniqueExactPhrases':len(phrases),'phraseOccurrencesBeforeDedup':total_phrase_occ,
 'maxPhraseWords':max((len(k.split()) for k in phrases),default=0),'maxSentenceWords':max((s['wordCount'] for s in sentences),default=0),
 'retrievalOrder':['sentence','phrase','ai-refined-word'],'pass':len(refs_with_chunks)>=60 and len(sentences)>=100 and len(phrases)>=1500
}
index={
 'version':'reference-chunk-index-v2','referenceCount':len(REFS),
 'policy':'Prefer complete aligned sentence/phrase chunks. Fall back to a single word only after that word has passed the Gemini audio precision gate.',
 'sentenceCandidates':sentences,'phraseIndex':phrases,'report':report
}
(ROOT/'reference-chunk-index-v2.json').write_text(json.dumps(index,indent=2,ensure_ascii=False))
(ROOT/'reference-chunk-index-v2-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
if not report['pass']: raise SystemExit('phrase/sentence chunk index quality gate failed')
