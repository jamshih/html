# Hearframe AI API v0.1

Server-side AI layer for Ask Hearframe. Never place `OPENAI_API_KEY` in the static `/ask/` frontend.

## Roles

### Audio Precision Critic
`POST /v1/audio/rank-candidates`

The critic never invents a timestamp. The renderer creates 2–9 real WAV/MP3 candidates around a forced-alignment anchor and supplies each candidate's actual start/end deltas. `gpt-audio-1.5` listens to the rendered audio and selects one of those IDs. Unknown IDs are rejected server-side.

The included `scripts/refine-word.mjs` uses a bounded two-pass search:
1. coarse 3x3 grid at ±40 ms start/end;
2. fine 3x3 grid at ±10 ms around the coarse winner.

Raw forced-alignment word timestamps and refined splice windows must be stored separately. The AI-refined value is an edit decision, not a replacement phonetic annotation.

Example:

```bash
node scripts/refine-word.mjs \
  --source ./source.mp4 \
  --target world \
  --start 122.349 \
  --end 122.792 \
  --api http://localhost:8787
```

### Conversation / Video Director
`POST /v1/direct`

`gpt-5.6` receives the user's question, available corpus tokens, and preferred intact phrase hints. It proposes short answers. The API then independently token-checks every answer and only selects a candidate whose words all exist in the supplied corpus vocabulary.

The retrieval/rendering engine remains responsible for picking real source clips and producing the final H.264/AAC video.

## Environment

```text
OPENAI_API_KEY=...
HEARFRAME_AUDIO_MODEL=gpt-audio-1.5
HEARFRAME_DIRECTOR_MODEL=gpt-5.6
HEARFRAME_DIRECTOR_REASONING=medium
ALLOWED_ORIGINS=https://hearframe-grand-hello-world-v4.onrender.com
PORT=8787
```

## Endpoints

- `GET /health`
- `POST /v1/audio/rank-candidates`
- `POST /v1/direct`

## Precision release gate

Do not claim universal millisecond precision from an audio LLM. Maintain a manually audited gold set across speakers, microphones, accents, consonant types, and noise conditions. Report start/end error distributions separately for raw forced alignment and refined splice windows. The current 2-word HELLO/WORLD calibration is only a seed benchmark.

Recommended next gold set: at least 50 manually checked words across 10+ speakers, including stop consonants, fricatives, vowels, word-initial/final silence, and connected speech. Target the *splice-window* metric separately from linguistic phonetic boundary accuracy.
