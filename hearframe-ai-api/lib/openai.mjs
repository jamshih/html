import { parseModelJson } from './json.mjs';

const API_BASE = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');

function key() {
  const value = process.env.OPENAI_API_KEY;
  if (!value) throw new Error('OPENAI_API_KEY is not configured');
  return value;
}

async function request(path, body, { timeoutMs = 90000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: controller.signal
    });
    const text = await response.text();
    let payload;
    try { payload = JSON.parse(text); } catch { payload = { raw: text }; }
    if (!response.ok) throw new Error(`OpenAI ${response.status}: ${payload?.error?.message || text.slice(0, 500)}`);
    return payload;
  } finally { clearTimeout(timer); }
}

export async function audioJudge({ prompt, audioParts }) {
  const content = [{ type: 'text', text: prompt }];
  for (const part of audioParts) {
    content.push({ type: 'text', text: `Candidate ${part.id}` });
    content.push({ type: 'input_audio', input_audio: { data: part.base64, format: part.format } });
  }
  const payload = await request('/chat/completions', {
    model: process.env.HEARFRAME_AUDIO_MODEL || 'gpt-audio-1.5',
    modalities: ['text'],
    temperature: 0,
    messages: [
      { role: 'system', content: 'You are Hearframe Audio Precision Critic. Judge only what is audible. Never invent timestamps. Return JSON only.' },
      { role: 'user', content }
    ]
  });
  return parseModelJson(payload?.choices?.[0]?.message?.content || '');
}

function outputText(payload) {
  if (typeof payload?.output_text === 'string') return payload.output_text;
  for (const item of payload?.output || []) {
    for (const c of item?.content || []) if (typeof c?.text === 'string') return c.text;
  }
  return '';
}

export async function directAnswer(prompt) {
  const payload = await request('/responses', {
    model: process.env.HEARFRAME_DIRECTOR_MODEL || 'gpt-5.6',
    reasoning: { effort: process.env.HEARFRAME_DIRECTOR_REASONING || 'medium' },
    input: prompt
  });
  return parseModelJson(outputText(payload));
}
