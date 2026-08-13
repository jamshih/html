#!/usr/bin/env python3
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "hearframe-grand-v4/ask/public-speech-interview-bank.json"
OUT = ROOT / "hearframe-grand-v4/ask/m2-bank-introspection.json"
CANDIDATES_OUT = ROOT / "hearframe-grand-v4/ask/m2-aligned-candidates.json"

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
keys = Counter()
types = Counter()
capabilities = Counter()
for row in rows:
    if not isinstance(row, dict):
        continue
    keys.update(row.keys())
    kind = row.get("kind") or row.get("sourceKind") or row.get("source_type") or row.get("type")
    if kind is not None:
        types[str(kind)] += 1
    cap = row.get("sourceCapability") or row.get("capability") or row.get("source_capability")
    if cap is not None:
        capabilities[str(cap)] += 1

samples=[]
for row in rows[:12]:
    if not isinstance(row, dict):
        samples.append(row)
        continue
    samples.append({k: row.get(k) for k in list(row.keys())[:40]})

aligned=[]
for row in rows:
    if not isinstance(row, dict):
        continue
    if not (row.get("wordBoundaryStatus") or row.get("speechValidationStatus")):
        continue
    aligned.append({
        "referenceId": row.get("referenceId"),
        "title": row.get("title"),
        "pageUrl": row.get("pageUrl"),
        "sourceUrl": row.get("sourceUrl"),
        "mime": row.get("mime"),
        "bytes": row.get("bytes"),
        "width": row.get("width"),
        "height": row.get("height"),
        "sourceKind": row.get("sourceKind"),
        "metadataAuditStatus": row.get("auditStatus"),
        "auditEvidence": row.get("auditEvidence"),
        "auditReasons": row.get("auditReasons"),
        "speechValidationStatus": row.get("speechValidationStatus"),
        "wordBoundaryStatus": row.get("wordBoundaryStatus"),
        "englishSpeechStatus": row.get("englishSpeechStatus"),
        "speechValidationReason": row.get("speechValidationReason"),
        "wordBoundaryReason": row.get("wordBoundaryReason"),
        "allAlignmentFields": {
            k: row.get(k) for k in row.keys()
            if any(token in k.lower() for token in ("speech", "word", "align", "timestamp", "english", "sentence", "duration", "start", "end"))
        }
    })

report = {
    "version": "hearframe-m2-bank-introspection-v2",
    "source": str(SRC.relative_to(ROOT)),
    "topLevelType": type(data).__name__,
    "topLevelKeys": list(data.keys()) if isinstance(data, dict) else None,
    "rowContainerKey": row_key,
    "rowCount": len(rows),
    "rowKeyFrequency": keys.most_common(),
    "sourceKinds": types.most_common(),
    "capabilities": capabilities.most_common(),
    "alignedCandidateRows": len(aligned),
    "samples": samples,
}
OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
CANDIDATES_OUT.write_text(json.dumps({
    "version": "hearframe-m2-aligned-candidates-v1",
    "count": len(aligned),
    "definition": "Rows in public-speech-interview-bank carrying speech validation or word-boundary evidence. This is a candidate set, not visual approval.",
    "candidates": aligned
}, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"rowCount": len(rows), "alignedCandidateRows": len(aligned), "rowContainerKey": row_key}, ensure_ascii=False, indent=2))
