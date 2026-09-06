#!/usr/bin/env python3
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ASK = ROOT / "hearframe-grand-v4/ask"
SRC = ASK / "public-speech-interview-bank.json"
INDEX = ASK / "production-stitch-index.json"
REPORT = ASK / "production-stitch-index-report.json"
OUT = ASK / "m2-bank-introspection.json"
CANDIDATES_OUT = ASK / "m2-aligned-candidates.json"
READY_OUT = ASK / "m2-ready-references.json"

def rows_from(data):
    if isinstance(data, list):
        return data, "root"
    if not isinstance(data, dict):
        return [], "unknown"
    for key in ("references", "sources", "videos", "items", "entries", "candidates", "bank"):
        value = data.get(key)
        if isinstance(value, list):
            return value, key
    for key, value in data.items():
        if isinstance(value, list) and value and isinstance(value[0], dict):
            return value, key
    return [], "none"

data = json.loads(SRC.read_text())
rows, row_key = rows_from(data)
keys = Counter(); types = Counter(); capabilities = Counter()
for row in rows:
    if not isinstance(row, dict): continue
    keys.update(row.keys())
    kind = row.get("kind") or row.get("sourceKind") or row.get("source_type") or row.get("type")
    if kind is not None: types[str(kind)] += 1
    cap = row.get("sourceCapability") or row.get("capability") or row.get("source_capability")
    if cap is not None: capabilities[str(cap)] += 1

# Preserve stale source-bank status fields as a diagnostic only. They are not the
# output of the production-pool indexing jobs and must never be counted as aligned.
stale=[]
for row in rows:
    if not isinstance(row, dict): continue
    if not (row.get("wordBoundaryStatus") or row.get("speechValidationStatus")): continue
    stale.append({
        "referenceId": row.get("referenceId"), "title": row.get("title"),
        "pageUrl": row.get("pageUrl"), "sourceUrl": row.get("sourceUrl"),
        "width": row.get("width"), "height": row.get("height"), "sourceKind": row.get("sourceKind"),
        "speechValidationStatus": row.get("speechValidationStatus"), "wordBoundaryStatus": row.get("wordBoundaryStatus"),
        "alignmentStatus": row.get("alignmentStatus")
    })
CANDIDATES_OUT.write_text(json.dumps({
    "version":"hearframe-m2-stale-bank-alignment-fields-v2",
    "count":len(stale),
    "definition":"Diagnostic only. These source-bank fields may be pending/stale and MUST NOT be treated as the ready reference set.",
    "rows":stale
},ensure_ascii=False,indent=2)+"\n")

idx=json.loads(INDEX.read_text())
idx_report=json.loads(REPORT.read_text())
refs={}
occ=defaultdict(list)

def ensure_ref(c):
    rid=c.get("referenceId")
    if not rid: return None
    return refs.setdefault(rid,{
        "referenceId":rid,"title":c.get("title"),"pageUrl":c.get("pageUrl"),"sourceUrl":c.get("sourceUrl"),
        "sourceKind":c.get("sourceKind"),"auditPolicyVersion":c.get("auditPolicyVersion"),"enabledBatch":c.get("enabledBatch"),
        "tokenOccurrenceCount":0,"phraseOccurrenceCount":0,"sampleWindows":[]
    })

# A reference is counted by production-stitch-index-report only when it survives the
# final word-token index. Phrase-only curated starter material is intentionally extra.
for token,cands in (idx.get("tokens") or {}).items():
    for c in cands or []:
        r=ensure_ref(c)
        if not r: continue
        r["tokenOccurrenceCount"]+=1
        if c.get("start") is not None and c.get("end") is not None:
            occ[r["referenceId"]].append((float(c["start"]),float(c["end"]),str(c.get("word") or token),float(c.get("score") or 0),"token"))

for _,cands in (idx.get("phrases") or {}).items():
    for c in cands or []:
        r=ensure_ref(c)
        if not r: continue
        r["phraseOccurrenceCount"]+=1
        if c.get("start") is not None and c.get("end") is not None:
            occ[r["referenceId"]].append((float(c["start"]),float(c["end"]),str(c.get("text") or "phrase"),float(c.get("score") or 0),"phrase"))

for rid,r in refs.items():
    xs=sorted(occ[rid],key=lambda x:(x[0],x[1]))
    if xs:
        picks=[]
        for frac in (0.10,0.35,0.60,0.85):
            i=min(len(xs)-1,int(round((len(xs)-1)*frac)))
            if xs[i] not in picks:picks.append(xs[i])
        r["sampleWindows"]=[{"start":round(x[0],3),"end":round(x[1],3),"label":x[2],"score":round(x[3],4),"kind":x[4]} for x in picks]
        r["alignmentTimeRange"]=[round(xs[0][0],3),round(xs[-1][1],3)]

counted=sorted([r for r in refs.values() if r["tokenOccurrenceCount"]>0],key=lambda r:r["referenceId"])
phrase_only=sorted([r for r in refs.values() if r["tokenOccurrenceCount"]==0 and r["phraseOccurrenceCount"]>0],key=lambda r:r["referenceId"])
expected=int(idx_report.get("readyReferencesTotal") or idx.get("readyReferences") or 0)
trace_ok=len(counted)==expected
OUT.write_text(json.dumps({
    "version":"hearframe-m2-bank-introspection-v4",
    "source":str(SRC.relative_to(ROOT)),"rowCount":len(rows),"rowContainerKey":row_key,
    "rowKeyFrequency":keys.most_common(),"sourceKinds":types.most_common(),"capabilities":capabilities.most_common(),
    "staleAlignmentFieldRows":len(stale),"expectedCountedReadyReferences":expected,
    "traceableCountedReadyReferences":len(counted),"phraseOnlyCuratedStarters":len(phrase_only),
    "readyReferenceTraceComplete":trace_ok
},ensure_ascii=False,indent=2)+"\n")
READY_OUT.write_text(json.dumps({
    "version":"hearframe-m2-ready-references-v2",
    "sourceOfTruth":"production-stitch-index.json + production-stitch-index-report.json",
    "definition":"The exact word-indexed English/alignment-ready references counted by production-stitch-index-report. These are still NOT visual_approved or production_ready for cinematic rendering.",
    "expectedReadyCount":expected,"traceableReadyCount":len(counted),"traceComplete":trace_ok,
    "references":counted,
    "phraseOnlyCuratedStarters":phrase_only
},ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"bankRows":len(rows),"staleRows":len(stale),"expectedReady":expected,"traceableReady":len(counted),"phraseOnly":len(phrase_only),"traceComplete":trace_ok},indent=2))
if not trace_ok:
    raise SystemExit(f"ready reference trace mismatch: expected {expected}, got {len(counted)}")
