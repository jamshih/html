import fs from 'node:fs';

const html = fs.readFileSync('hearframe-grand-v4/ai-refine.html','utf8');
const backend = html.match(/const DEFAULT_BACKEND='([^']+)'/)?.[1];
const apikey = html.match(/const INTERVIEW_PUBLISHABLE_KEY='([^']+)'/)?.[1];
if (!backend || !apikey) throw new Error('Could not resolve live Interview AIBot backend configuration');

const origin='https://hearframe-grand-hello-world-v4.onrender.com';
const result={checkedAt:new Date().toISOString(),backend,origin,director:null,audioCritic:null,pass:false};
async function post(path,body){
  const r=await fetch(backend+path,{method:'POST',headers:{'content-type':'application/json','apikey':apikey,'origin':origin},body:JSON.stringify(body)});
  const text=await r.text();let json;try{json=JSON.parse(text)}catch{json={raw:text.slice(0,1000)}}
  return {status:r.status,json};
}
function wavBase64(freq=440,seconds=.28,amp=.2){
  const sr=16000,n=Math.round(sr*seconds),buf=Buffer.alloc(44+n*2);
  buf.write('RIFF',0);buf.writeUInt32LE(36+n*2,4);buf.write('WAVE',8);buf.write('fmt ',12);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(1,22);buf.writeUInt32LE(sr,24);buf.writeUInt32LE(sr*2,28);buf.writeUInt16LE(2,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(n*2,40);
  for(let i=0;i<n;i++){const env=Math.min(1,i/(sr*.015),(n-i-1)/(sr*.015));const v=Math.max(-1,Math.min(1,Math.sin(2*Math.PI*freq*i/sr)*amp*Math.max(0,env)));buf.writeInt16LE(Math.round(v*32767),44+i*2)}
  return buf.toString('base64');
}
try{
  const d=await post('/director',{question:'Give me the shortest greeting.',availableWords:['hello','world'],availablePhrases:['hello world']});
  result.director=d;
  if(d.status!==200||!d.json?.constructible||!String(d.json.answer||'').trim()) throw new Error('director failed '+JSON.stringify(d));
  const allowed=new Set(['hello','world']);
  const tokens=String(d.json.answer).toLowerCase().match(/[a-z']+/g)||[];
  if(tokens.some(t=>!allowed.has(t))) throw new Error('director returned unavailable token '+JSON.stringify(d.json));

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
