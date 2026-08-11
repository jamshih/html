from pathlib import Path
from collections import Counter
import json

ROOT = Path('hearframe-grand-v4/ask')
CURATED = json.loads((ROOT / 'public-speech-interview-bank.json').read_text())
INDEX = json.loads((ROOT / 'reference-word-index.json').read_text())
CATALOG = json.loads((ROOT / 'reference-videos.json').read_text())

approved = {v['referenceId']: v for v in CURATED.get('videos', []) if v.get('referenceId')}
catalog = {v['referenceId']: v for v in CATALOG.get('videos', []) if v.get('referenceId')}

aligned_ids = set()
approved_aligned = set()
rejected_aligned = set()
safe_tokens = {}
safe_occurrences = 0
all_occurrences = 0
kind_counts = Counter()

for token, cands in (INDEX.get('tokens') or {}).items():
    clean = []
    for c in cands or []:
        rid = c.get('referenceId')
        if not rid:
            continue
        aligned_ids.add(rid)
        all_occurrences += 1
        if rid in approved:
            approved_aligned.add(rid)
            safe_occurrences += 1
            clean.append(c)
        else:
            rejected_aligned.add(rid)
    if clean:
        safe_tokens[token] = clean

for rid in approved_aligned:
    kind_counts[approved[rid].get('sourceKind') or 'unknown'] += 1

report = {
    'version': 'aligned-pool-audit-v1',
    'sourcePolicy': 'public-speech-interview-v1',
    'legacyCatalogCount': len(catalog),
    'legacyAlignedReferenceCount': len(aligned_ids),
    'approvedAlignedReferenceCount': len(approved_aligned),
    'rejectedOrUnprovenAlignedReferenceCount': len(rejected_aligned),
    'approvedAlignedPublicSpeechCount': kind_counts['public-speech'],
    'approvedAlignedPublicInterviewCount': kind_counts['public-interview'],
    'legacyIndexUniqueWordCountBeforeAudit': len(INDEX.get('tokens') or {}),
    'safeUniqueWordCountAfterAudit': len(safe_tokens),
    'candidateOccurrencesBeforeAudit': all_occurrences,
    'safeCandidateOccurrencesAfterAudit': safe_occurrences,
    'approvedAlignedReferences': [
        {
            'referenceId': rid,
            'title': approved[rid].get('title'),
            'sourceKind': approved[rid].get('sourceKind'),
            'auditReasons': approved[rid].get('auditReasons'),
        }
        for rid in sorted(approved_aligned)
    ],
    'removedAlignedReferences': [
        {
            'referenceId': rid,
            'title': (catalog.get(rid) or {}).get('title'),
            'reason': 'not in audited production bank',
        }
        for rid in sorted(rejected_aligned)
    ],
}
report['qualityGates'] = {
    'allSafeCandidatesApproved': all(
        c.get('referenceId') in approved
        for cands in safe_tokens.values()
        for c in cands
    ),
    'countsReconcile': len(approved_aligned | rejected_aligned) == len(aligned_ids),
    'safePoolNonEmpty': bool(approved_aligned) and bool(safe_tokens),
}
report['pass'] = all(report['qualityGates'].values())

(ROOT / 'aligned-pool-audit-report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
print(json.dumps(report, indent=2, ensure_ascii=False))
if not report['pass']:
    raise SystemExit('aligned pool audit failed')
