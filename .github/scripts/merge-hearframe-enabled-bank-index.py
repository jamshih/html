from __future__ import annotations
from pathlib import Path
import json, re, statistics, collections

ROOT = Path('hearframe-grand-v4/ask')
OLD_INDEX = json.loads((ROOT / 'reference-word-index.json').read_text())
OLD_REPORT = json.loads((ROOT / 'reference-index-report.json').read_text())
CORPUS = json.loads((ROOT / 'corpus.json').read_text())

shards = []
for p in sorted((ROOT / 'enabled-bank-index').glob('shard-*.json')):
    shards.append(json.loads(p.read_text()))
if not shards:
    raise SystemExit('no enabled-bank shards found')
expected = int(shards[0].get('shardCount') or 0)
if len(shards) != expected:
    raise SystemExit(f'expected {expected} enabled-bank shards, found {len(shards)}')

results = []
for s in shards:
    results.extend(s.get('results') or [])
by_id = {r['referenceId']: r for r in results if r.get('referenceId')}
enable_limit = int(shards[0].get('enableLimit') or len(by_id))
if len(by_id) != enable_limit:
    raise SystemExit(f'expected {enable_limit} selected bank references, got {len(by_id)}')

def norm_word(s):
    return re.sub(r"[^a-z0-9']+", '', str(s).lower().replace('’', "'"))

def toks(s):
    return [norm_word(x) for x in str(s).split() if norm_word(x)]

# Begin with the already-enabled 100-reference word index.
tokens = {k: list(v) for k, v in (OLD_INDEX.get('tokens') or {}).items()}
new_scores = []
new_word_occurrences = 0
new_indexed_refs = 0
bucket_counts = collections.Counter()

for rid in sorted(by_id):
    r = by_id[rid]
    ref = r.get('reference') or {}
    bucket_counts[ref.get('discoveryBucket') or 'other'] += 1
    if r.get('status') == 'indexed':
        new_indexed_refs += 1
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
            'title': ref.get('title'),
            'pageUrl': ref.get('pageUrl'),
            'sourceUrl': ref.get('sourceUrl'),
            'licenseStatus': ref.get('licenseStatus', 'validate-on-use'),
            'discoveryBucket': ref.get('discoveryBucket'),
            'word': w.get('word'),
            'start': w.get('start'),
            'end': w.get('end'),
            'score': score,
            'enabledBatch': 'bank-plus200-v1'
        }
        tokens.setdefault(tok, []).append(cand)

# Keep diverse high-confidence alternatives instead of many copies from one source.
for token, cands in list(tokens.items()):
    cands.sort(key=lambda x: (-float(x.get('score') or 0), float(x.get('end') or 0) - float(x.get('start') or 0)))
    kept = []
    seen_refs = set()
    for c in cands:
        rid = c.get('referenceId')
        if rid in seen_refs and len(kept) >= 4:
            continue
        kept.append(c)
        seen_refs.add(rid)
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

# Preserve the hand-audited starter phrases/sentences.
sources = CORPUS.get('sources') or {}
for sid, seg in (CORPUS.get('segments') or {}).items():
    text = seg.get('target') or ''
    src = sources.get(seg.get('source')) or {}
    add_phrase(text, {
        'id': f'corpus:{sid}',
        'referenceId': f'corpus:{seg.get("source")}',
        'title': f"{src.get('speaker', seg.get('source', 'starter'))} · {src.get('year', '')}".strip(' ·'),
        'pageUrl': src.get('url'),
        'sourceUrl': src.get('url'),
        'start': seg.get('alignedStart'),
        'end': seg.get('alignedEnd'),
        'score': float(seg.get('alignmentScore') or 1),
        'sourceType': 'starter-corpus'
    })

# Add aligned full sentences and useful 2–6 word subphrases from the newly enabled bank.
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
        full_text = seg.get('text') or ' '.join(w.get('word', '') for w in seg_words)
        if 2 <= len(toks(full_text)) <= 12 and s1 - s0 <= 8:
            add_phrase(full_text, {
                'id': f'{rid}:seg:{seg_i}',
                'referenceId': rid,
                'title': ref.get('title'),
                'pageUrl': ref.get('pageUrl'),
                'sourceUrl': ref.get('sourceUrl'),
                'start': round(s0, 3),
                'end': round(s1, 3),
                'score': round(statistics.mean([float(w.get('score') or 0) for w in seg_words]), 4),
                'discoveryBucket': ref.get('discoveryBucket'),
                'sourceType': 'enabled-bank-sentence'
            })
        for n in range(6, 1, -1):
            if len(seg_words) < n:
                continue
            for i in range(0, len(seg_words) - n + 1):
                ws = seg_words[i:i+n]
                if float(ws[-1]['end']) - float(ws[0]['start']) > 5:
                    continue
                phrase = ' '.join(str(w.get('word') or '').strip() for w in ws)
                add_phrase(phrase, {
                    'id': f'{rid}:ngram:{seg_i}:{i}:{n}',
                    'referenceId': rid,
                    'title': ref.get('title'),
                    'pageUrl': ref.get('pageUrl'),
                    'sourceUrl': ref.get('sourceUrl'),
                    'start': round(float(ws[0]['start']), 3),
                    'end': round(float(ws[-1]['end']), 3),
                    'score': round(statistics.mean([float(w.get('score') or 0) for w in ws]), 4),
                    'discoveryBucket': ref.get('discoveryBucket'),
                    'sourceType': 'enabled-bank-phrase'
                })

for key, cands in phrase_map.items():
    cands.sort(key=lambda x: (-float(x.get('score') or 0), float(x.get('end') or 0) - float(x.get('start') or 0)))
    phrase_map[key] = cands[:6]

# The director accepts up to 2,000 intact phrase hints. Choose longer/high-confidence phrases first.
phrase_hints = []
for key, cands in phrase_map.items():
    best = cands[0]
    phrase_hints.append((len(key.split()), float(best.get('score') or 0), key))
phrase_hints.sort(key=lambda x: (-x[0], -x[1], x[2]))
phrase_hints = [x[2] for x in phrase_hints[:2000]]

indexed_total = int(OLD_REPORT.get('indexedSpeechReferences') or 0) + new_indexed_refs
accepted_total = int(OLD_REPORT.get('acceptedWordOccurrences') or 0) + new_word_occurrences
enabled_selected = len(by_id)
pass_gate = new_indexed_refs >= max(80, int(enabled_selected * .45)) and new_word_occurrences >= 4000 and len(tokens) >= 1800 and len(phrase_hints) >= 300

index = {
    'version': 'stitch-index-v1',
    'generatedFrom': {
        'legacyWordIndex': OLD_INDEX.get('version'),
        'enabledBankShardVersion': shards[0].get('version'),
        'bankSelectedReferences': enabled_selected
    },
    'enabledReferences': int(OLD_REPORT.get('indexedSpeechReferences') or 0) + new_indexed_refs,
    'legacyIndexedSpeechReferences': int(OLD_REPORT.get('indexedSpeechReferences') or 0),
    'newIndexedSpeechReferences': new_indexed_refs,
    'newSelectedReferences': enabled_selected,
    'availableWordCount': len(tokens),
    'phraseHintCount': len(phrase_hints),
    'retrievalPolicy': 'longest exact sentence/phrase first; word candidate fallback only when no intact unit exists',
    'tokens': tokens,
    'phraseHints': phrase_hints,
    'phrases': phrase_map
}
report = {
    'version': 'stitch-index-v1-report',
    'selectedNewReferences': enabled_selected,
    'newIndexedSpeechReferences': new_indexed_refs,
    'legacyIndexedSpeechReferences': int(OLD_REPORT.get('indexedSpeechReferences') or 0),
    'enabledSpeechReferencesTotal': indexed_total,
    'newAcceptedWordOccurrences': new_word_occurrences,
    'acceptedWordOccurrencesTotal': accepted_total,
    'availableUniqueWords': len(tokens),
    'phraseHints': len(phrase_hints),
    'phraseCandidateKeys': len(phrase_map),
    'newMedianAlignmentScore': round(statistics.median(new_scores), 4) if new_scores else 0,
    'newStatusCounts': dict(collections.Counter(r.get('status', 'unknown') for r in by_id.values())),
    'selectedBucketCounts': dict(bucket_counts),
    'pass': pass_gate,
    'note': 'These are testing-enabled references from the 10,600-reference retrieval bank. Licensing remains validate-on-use; promotion to production still requires manual/source-license review.'
}
(ROOT / 'stitch-index.json').write_text(json.dumps(index, separators=(',', ':'), ensure_ascii=False))
(ROOT / 'stitch-index-report.json').write_text(json.dumps(report, indent=2, ensure_ascii=False))
print(json.dumps(report, indent=2, ensure_ascii=False))
if not pass_gate:
    raise SystemExit('stitch index quality gate failed')
