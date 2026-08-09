import http from 'node:http';
import { rankAudioCandidates } from './lib/audio-critic.mjs';
import { directVideoContent } from './lib/director.mjs';

const PORT = Number(process.env.PORT || 8787);
const MAX_BODY = Number(process.env.HEARFRAME_MAX_BODY_BYTES || 16_000_000);
const allowedOrigins = new Set(String(process.env.ALLOWED_ORIGINS || 'https://hearframe-grand-hello-world-v4.onrender.com,http://localhost:4173').split(',').map(x => x.trim()).filter(Boolean));

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function jsonBody(req) {
  const parts = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > MAX_BODY) throw Object.assign(new Error('Request body too large'), { status: 413 });
    parts.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(parts).toString('utf8') || '{}'); }
  catch { throw Object.assign(new Error('Invalid JSON body'), { status: 400 }); }
}

export function createServer() {
  return http.createServer(async (req, res) => {
    cors(req, res);
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
    const url = new URL(req.url, 'http://localhost');
    try {
      if (req.method === 'GET' && url.pathname === '/health') {
        return send(res, 200, {
          ok: true,
          service: 'hearframe-ai-api',
          audioModel: process.env.HEARFRAME_AUDIO_MODEL || 'gpt-audio-1.5',
          directorModel: process.env.HEARFRAME_DIRECTOR_MODEL || 'gpt-5.6',
          openaiConfigured: Boolean(process.env.OPENAI_API_KEY)
        });
      }
      if (req.method === 'POST' && url.pathname === '/v1/audio/rank-candidates') {
        return send(res, 200, await rankAudioCandidates(await jsonBody(req)));
      }
      if (req.method === 'POST' && url.pathname === '/v1/direct') {
        return send(res, 200, await directVideoContent(await jsonBody(req)));
      }
      return send(res, 404, { error: 'Not found' });
    } catch (error) {
      console.error(error);
      const status = Number(error?.status) || (/required|invalid|provide|must|exceed/i.test(error?.message || '') ? 400 : 502);
      return send(res, status, { error: String(error?.message || error) });
    }
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createServer().listen(PORT, '0.0.0.0', () => console.log(`Hearframe AI API listening on :${PORT}`));
}
