import test from 'node:test';
import assert from 'node:assert/strict';
import { rankAudioCandidates } from '../lib/audio-critic.mjs';
import { directVideoContent } from '../lib/director.mjs';
import { createServer } from '../server.mjs';

process.env.OPENAI_API_KEY = 'test-key';
const fakeAudio = Buffer.from('RIFF____WAVEfmt fake hearframe audio bytes 000000000000000000000000').toString('base64');

function mockJson(payload, status=200) {
  return new Response(JSON.stringify(payload), { status, headers:{'Content-Type':'application/json'} });
}

test('audio critic returns only an actually rendered candidate and its offsets', async () => {
  const original = global.fetch;
  global.fetch = async (url, options) => {
    assert.match(String(url), /chat\/completions$/);
    const body = JSON.parse(options.body);
    assert.equal(body.model, 'gpt-audio-1.5');
    assert.equal(body.modalities[0], 'text');
    assert.equal(body.messages[1].content.filter(x=>x.type==='input_audio').length, 3);
    return mockJson({choices:[{message:{content:JSON.stringify({
      best_candidate_id:'c2', confidence:.91, target_heard:true,
      scores:[
        {id:'c1',clean_isolation:72,intelligibility:90,natural_boundary:65,artifact_free:94,onset_clipped:true},
        {id:'c2',clean_isolation:96,intelligibility:97,natural_boundary:95,artifact_free:98},
        {id:'c3',clean_isolation:70,intelligibility:95,natural_boundary:60,artifact_free:96,trailing_extra_speech:true}
      ], reason:'c2 contains the full word without neighboring speech'
    })}}]});
  };
  try {
    const result = await rankAudioCandidates({target:'world',candidates:[
      {id:'c1',format:'wav',startDeltaMs:-40,endDeltaMs:0,audioBase64:fakeAudio},
      {id:'c2',format:'wav',startDeltaMs:0,endDeltaMs:-10,audioBase64:fakeAudio},
      {id:'c3',format:'wav',startDeltaMs:40,endDeltaMs:0,audioBase64:fakeAudio}
    ]});
    assert.equal(result.bestCandidateId,'c2');
    assert.deepEqual(result.selectedOffsetsMs,{start:0,end:-10});
    assert.equal(result.scores.length,3);
  } finally { global.fetch = original; }
});

test('audio critic rejects a hallucinated candidate id', async () => {
  const original = global.fetch;
  global.fetch = async () => mockJson({choices:[{message:{content:'{"best_candidate_id":"not-rendered","scores":[]}'}}]});
  try {
    await assert.rejects(()=>rankAudioCandidates({target:'hello',candidates:[
      {id:'a',format:'wav',audioBase64:fakeAudio},{id:'b',format:'wav',audioBase64:fakeAudio}
    ]}),/unknown candidate/);
  } finally { global.fetch = original; }
});

test('video director deterministically rejects unavailable words', async () => {
  const original = global.fetch;
  global.fetch = async (url) => {
    assert.match(String(url), /responses$/);
    return mockJson({output_text:JSON.stringify({candidates:[
      {text:'you can begin now',reason:'direct'},
      {text:'you can teleport now',reason:'uses a missing word'}
    ]})});
  };
  try {
    const result=await directVideoContent({question:'Can I start?',maxWords:8,allowedTokens:['you','can','begin','now','yes','we','do','it','today','start']});
    assert.equal(result.selected.text,'you can begin now');
    assert.deepEqual(result.candidates[1].missingTokens,['teleport']);
  } finally { global.fetch = original; }
});

test('health endpoint never exposes the API key', async () => {
  const server=createServer();
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try {
    const port=server.address().port;
    const r=await fetch(`http://127.0.0.1:${port}/health`);
    const text=await r.text();
    assert.equal(r.status,200);
    assert.equal(text.includes('test-key'),false);
    assert.equal(JSON.parse(text).openaiConfigured,true);
  } finally { await new Promise(r=>server.close(r)); }
});
