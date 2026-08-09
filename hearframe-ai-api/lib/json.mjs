export function parseModelJson(value) {
  if (typeof value !== 'string') throw new Error('Model response was not text');
  let text = value.trim();
  if (text.startsWith('```')) text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { return JSON.parse(text); } catch {}
  const first = text.indexOf('{'), last = text.lastIndexOf('}');
  if (first >= 0 && last > first) return JSON.parse(text.slice(first, last + 1));
  throw new Error('Model response did not contain valid JSON');
}

export function clampNumber(value, min, max, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

export function normalizeToken(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9']/g, '');
}

export function tokenize(value) {
  return String(value || '').match(/[A-Za-z0-9']+/g)?.map(normalizeToken).filter(Boolean) || [];
}
