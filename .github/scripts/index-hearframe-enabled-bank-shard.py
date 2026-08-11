from __future__ import annotations
from pathlib import Path
import json, os, re, shutil, subprocess

ROOT = Path('hearframe-grand-v4/ask')
BANK = json.loads((ROOT / 'reference-bank-v3.json').read_text())
LEGACY = json.loads((ROOT / 'reference-videos.json').read_text())
SHARD = int(os.environ.get('SHARD_INDEX', '0'))
COUNT = int(os.environ.get('SHARD_COUNT', '20'))
LIMIT = int(os.environ.get('ENABLE_LIMIT', '200'))
SAMPLE_SECONDS = float(os.environ.get('SAMPLE_SECONDS', '45'))
TMP = Path(f'/tmp/hearframe-enabled-bank-{SHARD:02d}')
if TMP.exists():
    shutil.rmtree(TMP)
TMP.mkdir(parents=True)
OUT = Path(os.environ.get(
    'SHARD_OUTPUT',
    f'hearframe-grand-v4/ask/enabled-bank-index/shard-{SHARD:02d}.json'
))
OUT.parent.mkdir(parents=True, exist_ok=True)

legacy_ids = {x.get('referenceId') for x in LEGACY.get('videos', [])}
legacy_urls = {x.get('sourceUrl') for x in LEGACY.get('videos', [])}

# Stitch Lab is intentionally strict: only source files whose own metadata identifies
# them as a speech/address/remarks or an interview/Q&A/conversation may be promoted.
# Discovery buckets and search queries alone are NOT sufficient because they can contain
# B-roll, news packages, event footage, or other random video.
SPEECH_RE = re.compile(
    r"\b(speech|address|remarks|keynote|inaugural|farewell|commencement|statement|testimony)\b",
    re.I,
)
INTERVIEW_RE = re.compile(
    r"\b(interview|q\s*&\s*a|questions?\s+and\s+answers?|conversation\s+with|in\s+conversation|press\s+conference|press\s+briefing)\b",
    re.I,
)


def source_kind(ref):
    # Only trust source-owned title/description metadata. Do not classify from
    # discoveryBucket/discoveryQuery because those are retrieval intent, not content proof.
    own_text = ' '.join(str(ref.get(k) or '') for k in ('title', 'description', 'credit'))
    if INTERVIEW_RE.search(own_text):
        return 'interview'
    if SPEECH_RE.search(own_text):
        return 'speech'
    return None


candidates = []
rejected_non_speech_interview = 0
for ref in BANK.get('videos', []):
    if ref.get('referenceId') in legacy_ids or ref.get('sourceUrl') in legacy_urls:
        continue
    if not ref.get('sourceUrl'):
        continue
    kind = source_kind(ref)
    if not kind:
        rejected_non_speech_interview += 1
        continue
    priority = float(ref.get('speechPriority') or 0)
    kind_priority = 0 if kind == 'interview' else 1
    candidates.append((kind_priority, -priority, str(ref.get('referenceId') or ''), kind, ref))

# Favor explicit interviews first, then explicit speeches. Never fill from generic video.
candidates.sort(key=lambda x: x[:3])
selected_rows = candidates[:LIMIT]
selected = [x[-1] for x in selected_rows]
kind_by_id = {x[-1].get('referenceId'): x[3] for x in selected_rows}
refs = [v for i, v in enumerate(selected) if i % COUNT == SHARD]

import whisperx
DEVICE = 'cpu'
print(
    f'loading ASR/alignment models for enabled-bank shard {SHARD}; '
    f'refs={len(refs)} strictEligible={len(candidates)} rejectedRandom={rejected_non_speech_interview}',
    flush=True,
)
asr = whisperx.load_model('small.en', DEVICE, compute_type='int8', language='en')
align_model, align_meta = whisperx.load_align_model(
    language_code='en',
    device=DEVICE,
    model_name='WAV2VEC2_ASR_LARGE_LV60K_960H'
)


def run(cmd, check=True):
    p = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if check and p.returncode:
        raise RuntimeError(p.stderr[-3500:])
    return p


def norm(s):
    return re.sub(r"[^a-z0-9']+", '', str(s).lower().replace('’', "'"))


def extract(ref):
    out = TMP / f"{ref['referenceId']}.wav"
    cmd = [
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
        '-user_agent', 'HearframePrototype/4.1',
        '-i', ref['sourceUrl'],
        '-t', f'{SAMPLE_SECONDS:.1f}',
        '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', str(out)
    ]
    run(cmd)
    if not out.exists() or out.stat().st_size < 32000:
        raise RuntimeError('audio sample too small')
    return out


def process(ref):
    wav = extract(ref)
    audio = whisperx.load_audio(str(wav))
    tr = asr.transcribe(audio, batch_size=4, language='en')
    segs = tr.get('segments') or []
    if not segs:
        return {'referenceId': ref['referenceId'], 'status': 'no-speech', 'words': [], 'segments': []}
    aligned = whisperx.align(
        segs, align_model, align_meta, audio, DEVICE, return_char_alignments=False
    )
    words = []
    for w in aligned.get('word_segments', []):
        if w.get('start') is None or w.get('end') is None:
            continue
        tok = norm(w.get('word', ''))
        if not tok:
            continue
        start = float(w['start'])
        end = float(w['end'])
        score = float(w.get('score') or 0)
        if end <= start or start < 0 or end > SAMPLE_SECONDS + 1:
            continue
        if end - start > 1.8:
            continue
        words.append({
            'word': str(w.get('word', '')).strip(),
            'token': tok,
            'start': round(start, 3),
            'end': round(end, 3),
            'score': round(score, 4)
        })
    segments = []
    for s in aligned.get('segments', []):
        if s.get('start') is None or s.get('end') is None:
            continue
        start = float(s['start'])
        end = float(s['end'])
        text = str(s.get('text') or '').strip()
        if not text or end <= start:
            continue
        segments.append({'start': round(start, 3), 'end': round(end, 3), 'text': text})
    status = 'indexed' if len(words) >= 8 and segments else 'low-speech'
    return {
        'referenceId': ref['referenceId'],
        'status': status,
        'sampleSeconds': SAMPLE_SECONDS,
        'wordCount': len(words),
        'words': words,
        'segments': segments
    }


results = []
for n, ref in enumerate(refs, 1):
    print(f"[{n}/{len(refs)}] {ref['referenceId']} {ref.get('title')}", flush=True)
    try:
        r = process(ref)
    except Exception as e:
        r = {
            'referenceId': ref['referenceId'],
            'status': 'error',
            'error': str(e),
            'words': [],
            'segments': []
        }
    r['reference'] = {
        'referenceId': ref.get('referenceId'),
        'title': ref.get('title'),
        'pageUrl': ref.get('pageUrl'),
        'sourceUrl': ref.get('sourceUrl'),
        'mime': ref.get('mime'),
        'sourceKind': kind_by_id.get(ref.get('referenceId')),
        'discoveryBucket': ref.get('discoveryBucket'),
        'speechPriority': ref.get('speechPriority'),
        'licenseStatus': ref.get('licenseStatus', 'validate-on-use')
    }
    results.append(r)
    print(r['status'], len(r.get('words', [])), flush=True)

payload = {
    'version': 'enabled-bank-index-shard-v1.1-speech-interview-only',
    'shard': SHARD,
    'shardCount': COUNT,
    'enableLimit': LIMIT,
    'sampleSeconds': SAMPLE_SECONDS,
    'strictEligibleReferenceCount': len(candidates),
    'rejectedNonSpeechInterviewCount': rejected_non_speech_interview,
    'selectedReferenceCount': len(selected),
    'referenceCount': len(refs),
    'sourcePolicy': 'explicit speech/address/remarks or interview/Q&A/conversation metadata only; no generic discovery-bucket fallback',
    'results': results
}
OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
print(json.dumps({
    'shard': SHARD,
    'strictEligible': len(candidates),
    'selected': len(selected),
    'indexed': sum(r['status'] == 'indexed' for r in results),
    'total': len(results),
    'words': sum(len(r.get('words', [])) for r in results)
}, indent=2))