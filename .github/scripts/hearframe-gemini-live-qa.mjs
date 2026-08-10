import fs from 'node:fs';

const htmlPath='hearframe-grand-v4/ai-refine.html';
let html = fs.readFileSync(htmlPath,'utf8');
const backend = html.match(/const DEFAULT_BACKEND='([^']+)'/)?.[1];
const apikey = html.match(/const INTERVIEW_PUBLISHABLE_KEY='([^']+)'/)?.[1];
if (!backend || !apikey) throw new Error('Could not resolve live Interview AIBot backend configuration');

const index=JSON.parse(fs.readFileSync('hearframe-grand-v4/ask/reference-word-index.json','utf8'));
const corpus=JSON.parse(fs.readFileSync('hearframe-grand-v4/ask/corpus.json','utf8'));
let words=[];
if(Array.isArray(index.uniqueWords)) words=index.uniqueWords;
else if(index.uniqueWords && typeof index.uniqueWords==='object') words=Object.keys(index.uniqueWords);
else words=Object.keys(index.byToken||{});
words=[...new Set(words.map(x=>String(x).trim().toLowerCase()).filter(Boolean))].sort();
if(words.length<1000) throw new Error(`Real corpus vocabulary unexpectedly small: ${words.length}`);
const phrases=[];
for(const seg of Object.values(corpus.segments||{})){
  const p=String(seg?.target||'').trim().toLowerCase(); if(p&&!phrases.includes(p)) phrases.push(p);
}
for(const ans of corpus.answers||[]){
  const p=String(ans?.text||'').trim().toLowerCase().replace(/[.!?]+$/,''); if(p&&!phrases.includes(p)) phrases.push(p);
}
const stats=index.stats||{};
const vocabulary={version:'reference-100-vocab-v1',sourceCount:stats.speechBearingSources||stats.indexedSources||87,processedSources:stats.processedSources||100,uniqueWordCount:words.length,availableWords:words,preferredPhrases:phrases};
fs.writeFileSync('hearframe-grand-v4/ask/corpus-vocabulary.json',JSON.stringify(vocabulary,null,2)+'\n');

// Upgrade the visible lab from the two-word demo to the actual indexed vocabulary.
if(!html.includes('id="corpusStatus"')){
  html=html.replace(
    '<div class="note">The director may only answer with words we say exist in the indexed video corpus. The backend verifies the answer after Gemini responds.</div>',
    '<div class="note">The director is automatically loaded with the real 100-reference Hearframe vocabulary. It may only answer with indexed words, and the backend verifies every output token after Gemini responds.</div><div class="status" id="corpusStatus">Loading real Hearframe corpus…</div>'
  );
  html=html.replace('<textarea id="words">hello world</textarea>','<textarea id="words">Loading real corpus…</textarea>');
  html=html.replace('<textarea id="phrases">hello world</textarea>','<textarea id="phrases">Loading intact phrases…</textarea>');
  const marker="backendInput.value=localStorage.getItem('hearframeInterviewBackend')||DEFAULT_BACKEND;";
  const loader=`\nconst corpusStatus=$('corpusStatus'),runDirectorBtn=$('runDirector');\nrunDirectorBtn.disabled=true;\nconst corpusVocabularyPromise=fetch('./ask/corpus-vocabulary.json?v=reference-100-v1',{cache:'no-store'})\n .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})\n .then(v=>{\n   if(!Array.isArray(v.availableWords)||v.availableWords.length<1000)throw new Error('indexed vocabulary is incomplete');\n   $('words').value=v.availableWords.join(' ');\n   $('phrases').value=(v.preferredPhrases||[]).join('\\n');\n   runDirectorBtn.disabled=false;\n   setStatus(corpusStatus,\\`Real corpus loaded · \\${v.uniqueWordCount||v.availableWords.length} indexed words · \\${v.sourceCount||'?'} speech-bearing references.\\`,'good');\n   return v;\n })\n .catch(e=>{\n   $('words').value='hello world';$('phrases').value='hello world';runDirectorBtn.disabled=false;\n   setStatus(corpusStatus,'Real corpus failed to load: '+e.message,'bad');\n   return null;\n });`;
  if(!html.includes(marker)) throw new Error('Could not find lab backend initialization marker');
  html=html.replace(marker,marker+loader);
  fs.writeFileSync(htmlPath,html);
}

const origin='https://hearframe-grand-hello-world-v4.onrender.com';
const result={checkedAt:new Date().toISOString(),backend,origin,vocabulary:{uniqueWordCount:words.length,sourceCount:vocabulary.sourceCount,processedSources:vocabulary.processedSources,preferredPhraseCount:phrases.length},shortDirector:null,longDirector:null,audioCritic:null,pass:false};
async function post(path,body){
  const r=await fetch(backend+path,{method:'POST',headers:{'content-type':'application/json','apikey':apikey,'origin':origin},body:JSON.stringify(body)});
  const text=await r.text();let json;try{json=JSON.parse(text)}catch{json={raw:text.slice(0,1000)}}
  return {status:r.status,json};
}
function normalizeTokens(text){return String(text||'').toLowerCase().match(/[a-z0-9']+/g)||[]}
function assertConstructible(response,allowed,label){
  if(response.status!==200||!response.json?.constructible||!String(response.json.answer||'').trim()) throw new Error(`${label} failed `+JSON.stringify(response));
  const bad=normalizeTokens(response.json.answer).filter(t=>!allowed.has(t));
  if(bad.length) throw new Error(`${label} returned unavailable tokens: ${[...new Set(bad)].join(', ')}`);
}
function wavBase64(freq=440,seconds=.28,amp=.2){
  const sr=16000,n=Math.round(sr*seconds),buf=Buffer.alloc(44+n*2);
  buf.write('RIFF',0);buf.writeUInt32LE(36+n*2,4);buf.write('WAVE',8);buf.write('fmt ',12);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(sr,24);buf.writeUInt32LE(sr*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(n*2,40);
  for(let i=0;i<n;i++){const env=Math.min(1,i/(sr*.015),(n-i-1)/(sr*.015));const v=Math.max(-1,Math.min(1,Math.sin(2*Math.PI*freq*i/sr)*amp*Math.max(0,env)));buf.writeInt16LE(Math.round(v*32767),44+i*2)}
  return buf.toString('base64');
}
try{
  const shortAllowed=new Set(['hello','world']);
  const d=await post('/director',{question:'Give me the shortest greeting.',availableWords:['hello','world'],availablePhrases:['hello world']});
  result.shortDirector=d;assertConstructible(d,shortAllowed,'short director');

  const allowed=new Set(words);
  const long=await post('/director',{question:'can you say something longer and inspiring',availableWords:words,availablePhrases:phrases});
  result.longDirector=long;assertConstructible(long,allowed,'real-corpus long director');
  const longTokens=normalizeTokens(long.json.answer);
  if(longTokens.length<8) throw new Error(`long director answer is still too short (${longTokens.length} words): ${long.json.answer}`);

  const a=await post('/audio-critic',{targetWord:'beep',candidates:[
    {id:'tone-low',audioBase64:wavBase64(440),mimeType:'audio/wav',startMs:100,endMs:380},
    {id:'tone-high',audioBase64:wavBase64(880),mimeType:'audio/wav',startMs:105,endMs:385}
  ]});
  result.audioCritic=a;
  if(a.status!==200||!['tone-low','tone-high'].includes(a.json?.bestCandidateId)) throw new Error('audio critic failed '+JSON.stringify(a));
  if(!a.json?.selectedWindow || !Number.isFinite(a.json.selectedWindow.startMs)) throw new Error('audio critic did not map winner back to submitted timing window');
  result.pass=true;
}catch(e){result.error=String(e?.stack||e)}
fs.writeFileSync('hearframe-grand-v4/gemini-live-qa.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(!result.pass)process.exitCode=1;
