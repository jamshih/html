import { spawnSync } from 'node:child_process';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}
function required(name) { const v = arg(name); if (!v) throw new Error(`--${name} is required`); return v; }
const source = required('source');
const target = required('target');
const api = arg('api', 'http://127.0.0.1:8787');
let start = Number(required('start')), end = Number(required('end'));
if (!(end > start)) throw new Error('end must be greater than start');

function wavBase64(s, e) {
  const p = spawnSync('ffmpeg', ['-v','error','-nostdin','-ss',s.toFixed(6),'-to',e.toFixed(6),'-i',source,'-vn','-ac','1','-ar','16000','-c:a','pcm_s16le','-f','wav','pipe:1'], { encoding: null, maxBuffer: 4_000_000 });
  if (p.status !== 0) throw new Error(`ffmpeg failed: ${p.stderr?.toString().slice(-1000)}`);
  return p.stdout.toString('base64');
}

async function rank(round, stepMs) {
  const shifts = [-stepMs, 0, stepMs];
  const candidates = [];
  let n = 0;
  for (const ds of shifts) for (const de of shifts) {
    const s = start + ds / 1000, e = end + de / 1000;
    if (e - s < .07) continue;
    candidates.push({ id: `r${round}c${++n}`, format:'wav', startDeltaMs:ds, endDeltaMs:de, audioBase64:wavBase64(s,e) });
  }
  const r = await fetch(`${api.replace(/\/$/,'')}/v1/audio/rank-candidates`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({target,mode:'word',candidates}) });
  const payload = await r.json();
  if (!r.ok) throw new Error(payload.error || `API ${r.status}`);
  start += payload.selectedOffsetsMs.start / 1000;
  end += payload.selectedOffsetsMs.end / 1000;
  return { round, stepMs, start, end, result: payload };
}

const report = { target, source, initial:{start,end}, rounds:[] };
report.rounds.push(await rank(1, 40));
report.rounds.push(await rank(2, 10));
report.final = { start:Number(start.toFixed(6)), end:Number(end.toFixed(6)), durationMs:Number(((end-start)*1000).toFixed(1)) };
console.log(JSON.stringify(report,null,2));
