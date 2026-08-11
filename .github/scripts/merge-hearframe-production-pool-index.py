from __future__ import annotations

from collections import Counter
from pathlib import Path
import json
import re
import statistics

ROOT = Path('hearframe-grand-v4/ask')
CURATED = json.loads((ROOT / 'public-speech-interview-bank.json').read_text())
OLD_INDEX = json.loads((ROOT / 'reference-word-index.json').read_text())
CORPUS = json.loads((ROOT / 'corpus.json').read_text())
APPROVED = {v['referenceId']: v for v in CURATED.get('videos', []) if v.get('referenceId')}

shards = [json.loads(p.read_text()) for p in sorted((ROOT / 'production-pool-index').glob('shard-*.json'))]
if not shards:
    raise SystemExit('no production-pool shards')
expected = int(shards[0].get('shardCount') or 0)
if len(shards) != expected:
    raise SystemExit(f'expected {expected} shards, found {len(shards)}')
if any(s.get('sourceBankVersion') != 'public-speech-interview-bank-v2' for s in shards):
    raise SystemExit('production shards were not built from hardened audited bank v2')

results = []
for s in shards:
    results.extend(s.get('results') or [])
by_id = {r['referenceId']: r for r in results if r.get('referenceId')}
selected = int(shards[0].get('enableLimit') or len(by_id))
if len(by_id) != selected:
    raise SystemExit(f'expected {selected} selected refs, got {len(by_id)}')


def norm_word(s):
    return re.sub(r"[^a-z0-9']+", '', str(s).lower().replace('’', "'"))


def toks(s):
    return [norm_word(x) for x in str(s).split() if norm_word(x)]

# First salvage only the legacy word candidates whose source passed the new full-bank audit.
tokens = {}
legacy_safe_refs = set()
legacy_removed_refs = set()
legacy_occurrences = 0
for token, cands in (OLD_INDEX.get('tokens') or {}).items():
    for c in cands or []:
        rid = c.get('referenceId')
        if rid in APPROVED:
            src = APPROVED[rid]
            cc = dict(c)
            cc['sourceKind'] = src.get('sourceKind')
            cc['auditPolicyVersion'] = src.get('auditPolicyVersion')
            cc['enabledBatch'] = 'legacy-audited-v2'
            tokens.setdefault(token, []).append(cc)
            legacy_safe_refs.add(rid)
            legacy_occurrences += 1
        elif rid:
            legacy_removed_refs.add(rid)

new_scores = []
new_word_occurrences = 0
new_indexed_refs = 0
status_counts = Counter()
kind_counts = Counter()
language_counts = Counter()

for rid in sorted(by_id):
    r = by_id[rid]
    status_counts[r.get('status', 'unknown')] += 1
    language_counts[r.get('detectedLanguage') or 'unknown'] += 1
    ref = r.get('reference') or {}
    if rid not in APPROVED:
        raise SystemExit(f'non-audited ref leaked into production shard: {rid}')
    if ref.get('sourceKind') not in {'public-speech', 'public-interview'}:
        raise SystemExit(f'invalid source kind for {rid}: {ref.get("sourceKind")}')
    if r.get('status') != 'indexed':
        continue
    if str(r.get('detectedLanguage') or '').lower() not in {'en', 'eng', 'english'}:
        raise SystemExit(f'non-English indexed source leaked: {rid}')
    new_indexed_refs += 1
    kind_counts[ref.get('sourceKind')] += 1
    for w in r.get('words') or []:
        score = float(w.get('score') or 0)
        if score < .35:
            continue
        tok = w.get('token') or norm_word(w.get('word'))
        if not tok:
            continue
        new_scores.append(score)
        new_word_occurrences += 1
        cand = {
            'referenceId': rid,
            'title': ref.get('title'), 'pageUrl': ref.get('pageUrl'), 'sourceUrl': ref.get('sourceUrl'),
            'sourceKind': ref.get('sourceKind'), 'auditPolicyVersion': ref.get('auditPolicyVersion'),
            'word': w.get('word'), 'start': w.get('start'), 'end': w.get('end'), 'score': score,
            'enabledBatch': 'production-audited-english-v1',
        }
        tokens.setdefault(tok, []).append(cand)

# Diverse high-confidence alternatives.
for token, cands in list(tokens.items()):
    cands.sort(key=lambda x: (-float(x.get('score') or 0), float(x.get('end') or 0) - float(x.get('start') or 0)))
    kept, seen = [], set()
    for c in cands:
        rid = c.get('referenceId')
        if rid in seen and len(kept) >= 4:
            continue
        kept.append(c)
        seen.add(rid)
        if len(kept) >= 12:
            break
    tokens[token] = kept

phrase_map = {}


def add_phrase(text, candidate):
    words = toks(text)
    if len(words) < 2 or len(words) > 12:
        return
    key = ' '.join(words)
    candidate = {**candidate, 'text': ' '.join(str(text).strip().split()), 'tokens': words, 'wordCount': len(words)}
    phrase_map.setdefault(key, []).append(candidate)

# Explicitly curated starter speeches are retained: Obama Farewell Speech and JFK Inauguration Speech.
# They are public speeches with known direct-media URLs and existing manual/WhisperX QA.
sources = CORPUS.get('sources') or {}
for sid, seg in (CORPUS.get('segments') or {}).items():
    src_id = seg.get('source')
    src = sources.get(src_id) or {}
    if src_id not in {'obama', 'jfk'}:
        continue
    add_phrase(seg.get('target') or '', {
        'id': f'corpus:{sid}', 'referenceId': f'curated-starter:{src_id}',
        'title': f"{src.get('speaker', src_id)} · public speech · {src.get('year', '')}".strip(' ·'),
        'pageUrl': src.get('url'), 'sourceUrl': src.get('url'),
        'start': seg.get('alignedStart'), 'end': seg.get('alignedEnd'),
        'score': float(seg.get('alignmentScore') or 1),
        'sourceKind': 'public-speech', 'auditPolicyVersion': 'curated-starter-public-speech-v1',
        'sourceType': 'curated-starter-speech'
    })

# Preserve intact sentence/phrase windows from newly validated production sources.
for rid, r in by_id.items():
    if r.get('status') != 'indexed':
        continue
    ref = r.get('reference') or {}
    words = sorted(r.get('words') or [], key=lambda w: (float(w.get('start') or 0), float(w.get('end') or 0)))
    for seg_i, seg in enumerate(r.get('segments') or []):
        s0, s1 = float(seg.get('start') or 0), float(seg.get('end') or 0)
        seg_words = [w for w in words if float(w.get('start') or 0) >= s0 - .08 and float(w.get('end') or 0) <= s1 + .08 and float(w.get('score') or 0) >= .35]
        if not seg_words:
            continue
        full = seg.get('text') or ' '.join(w.get('word', '') for w in seg_words)
        mean_score = statistics.mean(float(w.get('score') or 0) for w in seg_words)
        common = {
            'referenceId': rid, 'title': ref.get('title'), 'pageUrl': ref.get('pageUrl'), 'sourceUrl': ref.get('sourceUrl'),
            'sourceKind': ref.get('sourceKind'), 'auditPolicyVersion': ref.get('auditPolicyVersion'),
        }
        if 2 <= len(toks(full)) <= 12 and s1 - s0 <= 8:
            add_phrase(full, {**common, 'id': f'{rid}:seg:{seg_i}', 'start': round(s0,3), 'end': round(s1,3), 'score': round(mean_score,4), 'sourceType': 'production-sentence'})
        for n in range(6, 1, -1):
            for i in range(0, max(0, len(seg_words) - n + 1)):
                ws = seg_words[i:i+n]
                if len(ws) != n or float(ws[-1]['end']) - float(ws[0]['start']) > 5:
                    continue
                add_phrase(' '.join(str(w.get('word') or '').strip() for w in ws), {
                    **common, 'id': f'{rid}:ngram:{seg_i}:{i}:{n}',
                    'start': round(float(ws[0]['start']),3), 'end': round(float(ws[-1]['end']),3),
                    'score': round(statistics.mean(float(w.get('score') or 0) for w in ws),4), 'sourceType': 'production-phrase'
                })

for key, cands in phrase_map.items():
    cands.sort(key=lambda x: (-float(x.get('score') or 0), float(x.get('end') or 0) - float(x.get('start') or 0)))
    phrase_map[key] = cands[:6]

hints = []
for key, cands in phrase_map.items():
    hints.append((len(key.split()), float(cands[0].get('score') or 0), key))
hints.sort(key=lambda x: (-x[0], -x[1], x[2]))
phrase_hints = [x[2] for x in hints[:2000]]

ready_refs = len(legacy_safe_refs) + new_indexed_refs
pass_gate = new_indexed_refs >= 80 and len(tokens) >= 1000 and len(phrase_hints) >= 200

index = {
    'version': 'production-stitch-index-v1',
    'sourcePolicy': 'public-speech-interview-v2 + detected-English + alignment-quality; fail closed',
    'auditedBankVersion': CURATED.get('version'),
    'readyReferences': ready_refs,
    'auditedLegacyReadyReferences': len(legacy_safe_refs),
    'newReadyReferences': new_indexed_refs,
    'removedLegacyReferences': len(legacy_removed_refs),
    'availableWordCount': len(tokens), 'phraseHintCount': len(phrase_hints),
    'tokens': tokens, 'phraseHints': phrase_hints, 'phrases': phrase_map,
}
report = {
    'version': 'production-stitch-index-v1-report',
    'auditedBankVersion': CURATED.get('version'),
    'selectedNewReferences': selected,
    'newReadyReferences': new_indexed_refs,
    'auditedLegacyReadyReferences': len(legacy_safe_refs),
    'readyReferencesTotal': ready_refs,
    'removedLegacyReferences': len(legacy_removed_refs),
    'newStatusCounts': dict(status_counts),
    'newLanguageCounts': dict(language_counts),
    'newReadyKindCounts': dict(kind_counts),
    'legacySafeWordOccurrences': legacy_occurrences,
    'newAcceptedWordOccurrences': new_word_occurrences,
    'availableUniqueWords': len(tokens),
    'phraseHints': len(phrase_hints), 'phraseCandidateKeys': len(phrase_map),
    'newMedianAlignmentScore': round(statistics.median(new_scores),4) if new_scores else 0,
    'pass': pass_gate,
    'note': 'Only audited public speeches/interviews with detected English speech and successful alignment are counted ready. Source licensing remains validate-on-use before external production distribution.'
}
(ROOT / 'production-stitch-index.json').write_text(json.dumps(index, separators=(',', ':'), ensure_ascii=False))
(ROOT / 'production-stitch-index-report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
print(json.dumps(report, indent=2, ensure_ascii=False))
