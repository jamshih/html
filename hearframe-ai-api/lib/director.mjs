import { directAnswer } from './openai.mjs';
import { tokenize, normalizeToken, clampNumber } from './json.mjs';

function cleanTokens(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(normalizeToken).filter(Boolean))];
}

export function validateDirectorRequest(body) {
  const question = String(body?.question || '').trim();
  if (!question || question.length > 1500) throw new Error('question is required');
  const allowedTokens = cleanTokens(body?.allowedTokens);
  if (allowedTokens.length < 10 || allowedTokens.length > 5000) throw new Error('allowedTokens must contain 10-5000 corpus words');
  const phraseHints = (Array.isArray(body?.phraseHints) ? body.phraseHints : []).map(x => String(x).trim()).filter(Boolean).slice(0, 150);
  const maxWords = Math.round(clampNumber(body?.maxWords, 4, 40, 18));
  return { question, allowedTokens, phraseHints, maxWords };
}

function coverage(text, allowedSet) {
  const tokens = tokenize(text);
  const missing = tokens.filter(t => !allowedSet.has(t));
  return { tokens, missing, ratio: tokens.length ? (tokens.length - missing.length) / tokens.length : 0 };
}

function promptFor(req) {
  return `You are Hearframe Video Director. Answer the user's question naturally, but every final spoken word must be constructible from a real indexed speech corpus.\n\nUSER QUESTION:\n${req.question}\n\nMAX WORDS PER ANSWER: ${req.maxWords}\n\nAVAILABLE CORPUS WORDS:\n${req.allowedTokens.join(' ')}\n\nPREFERRED INTACT PHRASES (use these when semantically useful because fewer joins sound better):\n${req.phraseHints.length ? req.phraseHints.join('\n') : '(none supplied)'}\n\nGenerate up to 5 candidate answers. Favor clear direct answers, short common words, and intact phrase hints. Do not use a word absent from AVAILABLE CORPUS WORDS. Do not mention the corpus or the stitching process to the end user.\n\nReturn JSON only:\n{"candidates":[{"text":"answer","reason":"why this answers the question and is easy to construct"}]}`;
}

export async function directVideoContent(body) {
  const req = validateDirectorRequest(body);
  const allowedSet = new Set(req.allowedTokens);
  const raw = await directAnswer(promptFor(req));
  const candidates = (Array.isArray(raw?.candidates) ? raw.candidates : []).slice(0, 5).map(row => {
    const text = String(row?.text || '').trim();
    const c = coverage(text, allowedSet);
    return {
      text,
      reason: String(row?.reason || '').slice(0, 500),
      wordCount: c.tokens.length,
      coverage: c.ratio,
      missingTokens: [...new Set(c.missing)]
    };
  }).filter(c => c.text && c.wordCount > 0 && c.wordCount <= req.maxWords);
  const fullyConstructible = candidates.filter(c => c.missingTokens.length === 0);
  fullyConstructible.sort((a, b) => b.coverage - a.coverage || a.wordCount - b.wordCount);
  return {
    model: process.env.HEARFRAME_DIRECTOR_MODEL || 'gpt-5.6',
    question: req.question,
    selected: fullyConstructible[0] || null,
    candidates,
    needsMoreCorpus: fullyConstructible.length === 0
  };
}
