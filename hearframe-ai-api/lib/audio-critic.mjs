import { audioJudge } from './openai.mjs';
import { clampNumber } from './json.mjs';

const MAX_CANDIDATES = 9;
const MAX_AUDIO_BYTES = 1_500_000;

function validateCandidate(candidate) {
  if (!candidate || !/^[A-Za-z0-9_.-]{1,64}$/.test(String(candidate.id || ''))) throw new Error('Invalid candidate id');
  if (!['wav', 'mp3'].includes(candidate.format)) throw new Error('Candidate format must be wav or mp3');
  if (typeof candidate.audioBase64 !== 'string' || candidate.audioBase64.length < 32) throw new Error(`Candidate ${candidate.id} is missing audio`);
  const bytes = Math.ceil(candidate.audioBase64.length * 3 / 4);
  if (bytes > MAX_AUDIO_BYTES) throw new Error(`Candidate ${candidate.id} exceeds audio size limit`);
  const startDeltaMs = clampNumber(candidate.startDeltaMs, -120, 120, 0);
  const endDeltaMs = clampNumber(candidate.endDeltaMs, -120, 120, 0);
  return { ...candidate, id: String(candidate.id), startDeltaMs, endDeltaMs };
}

export function validateRankRequest(body) {
  const target = String(body?.target || '').trim();
  if (!target || target.length > 120) throw new Error('target is required');
  const mode = body?.mode === 'join' ? 'join' : 'word';
  const candidates = Array.isArray(body?.candidates) ? body.candidates.map(validateCandidate) : [];
  if (candidates.length < 2 || candidates.length > MAX_CANDIDATES) throw new Error(`Provide 2-${MAX_CANDIDATES} rendered candidates`);
  return { target, mode, candidates };
}

function criticPrompt({ target, mode, candidates }) {
  const candidateTable = candidates.map(c => `${c.id}: startDeltaMs=${c.startDeltaMs}, endDeltaMs=${c.endDeltaMs}`).join('\n');
  const objective = mode === 'join'
    ? `Judge the audio seam around the intended spoken text "${target}". Prefer no clicks, no repeated/missing phonemes, no unnatural silence, no chopped consonants, and natural continuity.`
    : `Judge which isolated clip most cleanly contains exactly the intended spoken word/phrase "${target}". Prefer complete onset/coda, no audible neighboring word, maximum intelligibility, and no click/pop.`;
  return `${objective}\n\nThe candidate labels below are metadata only. Do NOT infer quality from their offsets; listen to the audio.\n${candidateTable}\n\nReturn exactly one JSON object with this shape:\n{\n  "best_candidate_id":"id",\n  "confidence":0.0,\n  "target_heard":true,\n  "scores":[{"id":"id","clean_isolation":0,"intelligibility":0,"natural_boundary":0,"artifact_free":0,"leading_extra_speech":false,"trailing_extra_speech":false,"onset_clipped":false,"ending_clipped":false,"notes":"short audible reason"}],\n  "reason":"short reason based only on audio"\n}\nScores are integers 0-100. Include every candidate exactly once.`;
}

export async function rankAudioCandidates(body) {
  const req = validateRankRequest(body);
  const raw = await audioJudge({
    prompt: criticPrompt(req),
    audioParts: req.candidates.map(c => ({ id: c.id, base64: c.audioBase64, format: c.format }))
  });
  const ids = new Set(req.candidates.map(c => c.id));
  const bestId = String(raw?.best_candidate_id || '');
  if (!ids.has(bestId)) throw new Error('Audio critic selected an unknown candidate');
  const scoreRows = Array.isArray(raw?.scores) ? raw.scores : [];
  const scores = req.candidates.map(c => {
    const r = scoreRows.find(x => String(x?.id) === c.id) || {};
    return {
      id: c.id,
      cleanIsolation: Math.round(clampNumber(r.clean_isolation, 0, 100, 0)),
      intelligibility: Math.round(clampNumber(r.intelligibility, 0, 100, 0)),
      naturalBoundary: Math.round(clampNumber(r.natural_boundary, 0, 100, 0)),
      artifactFree: Math.round(clampNumber(r.artifact_free, 0, 100, 0)),
      leadingExtraSpeech: Boolean(r.leading_extra_speech),
      trailingExtraSpeech: Boolean(r.trailing_extra_speech),
      onsetClipped: Boolean(r.onset_clipped),
      endingClipped: Boolean(r.ending_clipped),
      notes: String(r.notes || '').slice(0, 300)
    };
  });
  const selected = req.candidates.find(c => c.id === bestId);
  return {
    target: req.target,
    mode: req.mode,
    model: process.env.HEARFRAME_AUDIO_MODEL || 'gpt-audio-1.5',
    bestCandidateId: bestId,
    confidence: clampNumber(raw?.confidence, 0, 1, 0),
    targetHeard: Boolean(raw?.target_heard),
    selectedOffsetsMs: { start: selected.startDeltaMs, end: selected.endDeltaMs },
    scores,
    reason: String(raw?.reason || '').slice(0, 500)
  };
}
