#!/usr/bin/env python3
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "hearframe-grand-v4/ask/public-speech-interview-bank.json"
OUT = ROOT / "hearframe-grand-v4/ask/m2-bank-introspection.json"

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

report = {
    "version": "hearframe-m2-bank-introspection-v1",
    "source": str(SRC.relative_to(ROOT)),
    "topLevelType": type(data).__name__,
    "topLevelKeys": list(data.keys()) if isinstance(data, dict) else None,
    "rowContainerKey": row_key,
    "rowCount": len(rows),
    "rowKeyFrequency": keys.most_common(),
    "sourceKinds": types.most_common(),
    "capabilities": capabilities.most_common(),
    "samples": samples,
}
OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"rowCount": len(rows), "rowContainerKey": row_key, "topKeys": report["topLevelKeys"], "firstRowKeys": list(rows[0].keys()) if rows and isinstance(rows[0], dict) else []}, ensure_ascii=False, indent=2))
