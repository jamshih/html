from __future__ import annotations

from pathlib import Path
import json
import os
import re
import shutil
import statistics
import subprocess

ROOT = Path('hearframe-grand-v4/ask')
CURATED = json.loads((ROOT / 'public-speech-interview-bank.json').read_text())
LEGACY = json.loads((ROOT / 'reference-videos.json').read_text())
SHARD = int(os.environ.get('SHARD_INDEX', '0'))
COUNT = int(os.environ.get('SHARD_COUNT', '20'))
LIMIT = int(os.environ.get('ENABLE_LIMIT', '200'))
SAMPLE_SECONDS = float(os.environ.get('SAMPLE_SECONDS', '60'))
TMP = Path(f'/tmp/hearframe-production-pool-{SHARD:02d}')
if TMP.exists():
    shutil.rmtree(TMP)
TMP.mkdir(parents=True)
OUT = Path(os.environ.get('SHARD_OUTPUT', f'hearframe-grand-v4/ask/production-pool-index/shard-{SHARD:02d}.json'))
OUT.parent.mkdir(parents=True, exist_ok=True)

if CURATED.get('version') != 'public-speech-interview-bank-v2':
    raise SystemExit(f"expected hardened audited bank v2, got {CURATED.get('version')}")

legacy_ids = {x.get('referenceId') for x in LEGACY.get('videos', [])}
eligible = [
    v for v in CURATED.get('videos', [])
    if v.get('referenceId') not in legacy_ids
    and v.get('sourceUrl')
    and v.get('auditStatus') == 'accepted-production'
    and v.get('sourceKind') in {'public-speech', 'public-interview'}
    and v.get('auditEvidence') in {'title', 'explicit-description'}
]

# Build a balanced first production batch rather than 200 near-identical interview files.
speeches = sorted(
    (v for v in eligible if v.get('sourceKind') == 'public-speech'),
    key=lambda v: (-float(v.get('speechPriority') or 0), str(v.get('referenceId') or '')),
)
interviews = sorted(
    (v for v in eligible if v.get('sourceKind') == 'public-interview'),
    key=lambda v: (-float(v.get('speechPriority') or 0), str(v.get('referenceId') or '')),
)

speech_target = min(len(speeches), max(1, round(LIMIT * 0.40)))
interview_target = min(len(interviews), LIMIT - speech_target)
selected = speeches[:speech_target] + interviews[:interview_target]
if len(selected) < LIMIT:
    selected_ids = {v.get('referenceId') for v in selected}
    leftovers = [v for v in speeches[speech_target:] + interviews[interview_target:] if v.get('referenceId') not in selected_ids]
    selected.extend(leftovers[: LIMIT - len(selected)])
selected = selected[:LIMIT]
selected.sort(key=lambda v: str(v.get('referenceId') or ''))

if len(selected) != LIMIT:
    raise SystemExit(f'expected {LIMIT} audited production references, selected {len(selected)}')

refs = [v for i, v in enumerate(selected) if i % COUNT == SHARD]

import whisperx
DEVICE = 'cpu'
print(f'loading WhisperX auto-language ASR; shard={SHARD} refs={len(refs)}', flush=True)
# Do NOT force small.en here. We need language detection before a source is promoted.
asr = whisperx.load_model('small', DEVICE, compute_type='int8')
align_model, align_meta = whisperx.load_align_model(
    language_code='en', device=DEVICE, model_name='WAV2VEC2_ASR_LARGE_LV60K_960H'
)


def run(cmd, check=True):
    p = subprocess.run(cmd, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if check and p.returncode:
        raise RuntimeError(p.stderr[-4000:])
    return p


def norm(s):
    return re.sub(r"[^a-z0-9']+", '', str(s).lower().replace('’', "'"))


def extract(ref):
    wav = TMP / f"{ref['referenceId']}.wav"
    cmd = [
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
        '-user_agent', 'HearframeProductionAudit/1.0',
        '-i', ref['sourceUrl'], '-t', f'{SAMPLE_SECONDS:.1f}',
        '-vn', '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', str(wav)
    ]
    run(cmd)
    if not wav.exists() or wav.stat().st_size < 64000:
        raise RuntimeError('audio sample too small')
    return wav


def process(ref):
    wav = extract(ref)
    audio = whisperx.load_audio(str(wav))
    tr = asr.transcribe(audio, batch_size=4)
    language = str(tr.get('language') or '').lower()
    language_probability = tr.get('language_probability')
    if language not in {'en', 'eng', 'english'}:
        return {
            'referenceId': ref['referenceId'], 'status': 'non-english',
            'detectedLanguage': language or 'unknown',
            'languageProbability': language_probability,
            'words': [], 'segments': []
        }
    segs = tr.get('segments') or []
    if not segs:
        return {
            'referenceId': ref['referenceId'], 'status': 'no-speech',
            'detectedLanguage': language, 'languageProbability': language_probability,
            'words': [], 'segments': []
        }
    aligned = whisperx.align(segs, align_model, align_meta, audio, DEVICE, return_char_alignments=False)
    words = []
    scores = []
    for w in aligned.get('word_segments', []):
        if w.get('start') is None or w.get('end') is None:
            continue
        tok = norm(w.get('word', ''))
        if not tok:
            continue
        start, end = float(w['start']), float(w['end'])
        score = float(w.get('score') or 0)
        if end <= start or start < 0 or end > SAMPLE_SECONDS + 1 or end - start > 1.8:
            continue
        words.append({
            'word': str(w.get('word') or '').strip(), 'token': tok,
            'start': round(start, 3), 'end': round(end, 3), 'score': round(score, 4)
        })
        scores.append(score)
    segments = []
    for s in aligned.get('segments', []):
        if s.get('start') is None or s.get('end') is None:
            continue
        start, end = float(s['start']), float(s['end'])
        text = str(s.get('text') or '').strip()
        if text and end > start:
            segments.append({'start': round(start, 3), 'end': round(end, 3), 'text': text})
    median = statistics.median(scores) if scores else 0
    status = 'indexed' if len(words) >= 15 and segments and median >= 0.50 else 'low-quality-speech'
    return {
        'referenceId': ref['referenceId'], 'status': status,
        'detectedLanguage': language, 'languageProbability': language_probability,
        'sampleSeconds': SAMPLE_SECONDS, 'wordCount': len(words),
        'medianAlignmentScore': round(median, 4), 'words': words, 'segments': segments
    }

results = []
for n, ref in enumerate(refs, 1):
    print(f"[{n}/{len(refs)}] {ref['referenceId']} {ref.get('sourceKind')} {ref.get('title')}", flush=True)
    try:
        r = process(ref)
    except Exception as e:
        r = {'referenceId': ref['referenceId'], 'status': 'error', 'error': str(e), 'words': [], 'segments': []}
    r['reference'] = {
        'referenceId': ref.get('referenceId'), 'title': ref.get('title'),
        'pageUrl': ref.get('pageUrl'), 'sourceUrl': ref.get('sourceUrl'), 'mime': ref.get('mime'),
        'sourceKind': ref.get('sourceKind'), 'auditEvidence': ref.get('auditEvidence'),
        'auditReasons': ref.get('auditReasons'), 'auditPolicyVersion': ref.get('auditPolicyVersion'),
        'licenseStatus': ref.get('licenseStatus', 'validate-on-use'),
    }
    results.append(r)
    print(r['status'], r.get('detectedLanguage'), len(r.get('words', [])), flush=True)

payload = {
    'version': 'production-pool-index-shard-v1',
    'sourceBankVersion': CURATED.get('version'),
    'sourcePolicy': 'audited public speech/interview v2 + detected English speech + alignment quality gate',
    'shard': SHARD, 'shardCount': COUNT, 'enableLimit': LIMIT,
    'sampleSeconds': SAMPLE_SECONDS, 'selectedReferenceCount': len(selected),
    'selectedPublicSpeechCount': sum(v.get('sourceKind') == 'public-speech' for v in selected),
    'selectedPublicInterviewCount': sum(v.get('sourceKind') == 'public-interview' for v in selected),
    'referenceCount': len(refs), 'results': results,
}
OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
print(json.dumps({
    'shard': SHARD, 'total': len(results),
    'indexed': sum(r.get('status') == 'indexed' for r in results),
    'nonEnglish': sum(r.get('status') == 'non-english' for r in results),
    'lowQuality': sum(r.get('status') == 'low-quality-speech' for r in results),
    'errors': sum(r.get('status') == 'error' for r in results),
}, indent=2))
