import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT='.qa-artifacts/wrongbook-provider-gate';
fs.mkdirSync(OUT,{recursive:true});
const ROOT='https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1';
const EXPECT_MODEL='gemini-3.1-flash-lite';
const existingQa=fs.readFileSync('.github/scripts/wrongbook-v5-qa-v2.mjs','utf8');
const key=existingQa.match(/sb_publishable_[A-Za-z0-9_-]+/)?.[0];
if(!key) throw new Error('publishable key unavailable to provider gate');
const browser=await chromium.launch({headless:true});
const report={startedAt:new Date().toISOString(),health:{},raw:{},sheet:{},errors:[]};
let failed=false;
const fail=(gate,detail)=>{failed=true;report.errors.push({gate,detail});console.error(gate,typeof detail==='string'?detail:JSON.stringify(detail,null,2));};
const headers={'content-type':'application/json',apikey:key};

function parseRaw(label,status,raw){
  report.raw[label]={status,raw};
  if(/^\s*["']/.test(raw)) fail(label+'_ROOT_QUOTED',raw.slice(0,160));
  if(/```(?:json)?/i.test(raw)) fail(label+'_MARKDOWN_FENCE',raw.slice(0,240));
  let json;
  try{json=JSON.parse(raw);}catch(e){fail(label+'_RAW_JSON_PARSE',String(e));return null;}
  if(!json||typeof json!=='object'||Array.isArray(json)) fail(label+'_ROOT_NOT_OBJECT',typeof json);
  return json;
}
function stringifiedJsonIssues(value,path='$',out=[]){
  if(typeof value==='string'){
    const t=value.trim();
    if((t.startsWith('{')&&t.endsWith('}'))||(t.startsWith('[')&&t.endsWith(']'))){try{JSON.parse(t);out.push(path);}catch{}}
    return out;
  }
  if(Array.isArray(value)){value.forEach((v,i)=>stringifiedJsonIssues(v,`${path}[${i}]`,out));return out;}
  if(value&&typeof value==='object'){for(const [k,v] of Object.entries(value))stringifiedJsonIssues(v,`${path}.${k}`,out);}
  return out;
}
function bboxOk(b){return b&&typeof b==='object'&&['x','y','width','height'].every(k=>typeof b[k]==='number'&&Number.isFinite(b[k]))&&b.x>=0&&b.y>=0&&b.width>0&&b.height>0&&b.x+b.width<=100.01&&b.y+b.height<=100.01;}
function arraysNative(q){return ['options','recognizedUserAnswer','correctAnswer','concepts','corrections','genericFacts','regions'].every(k=>Array.isArray(q[k]));}
function overlapRatio(a,b){if(!bboxOk(a)||!bboxOk(b))return 1;const x=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x));const y=Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));const inter=x*y;return inter/Math.max(1,Math.min(a.width*a.height,b.width*b.height));}
async function rawCall(label,url,body){const r=await fetch(url,{method:'POST',headers,body:JSON.stringify(body)});const raw=await r.text();const json=parseRaw(label,r.status,raw);return{status:r.status,ok:r.ok,raw,json};}
async function htmlImage(html,w=1100,h=1400){const p=await browser.newPage({viewport:{width:w,height:h}});await p.setContent(`<html><body style="font-family:Arial,'PingFang TC',sans-serif;padding:54px;font-size:25px;line-height:1.45;color:#111;background:white">${html}</body></html>`);const b=await p.screenshot({type:'png',fullPage:true});await p.close();return b.toString('base64');}

for(const [slug,path] of [['wrongbook-ai','/wrongbook-ai/health'],['wrongbook-sheet-ai','/wrongbook-sheet-ai'],['wrongbook-guide-ai','/wrongbook-guide-ai']]){
  const r=await fetch(ROOT+path);const raw=await r.text();const j=parseRaw('health_'+slug,r.status,raw);report.health[slug]={status:r.status,body:j};
  if(!r.ok||!j?.ok||j?.model!==EXPECT_MODEL)fail('HEALTH_'+slug,{status:r.status,body:j});
  if(j?.configured!==true)fail('HEALTH_CONFIG_'+slug,j);
}

const sheetHtml=`
<h1 style="font-size:34px">高中錯題整理 — 三題測試</h1>
<section style="border:2px solid #bbb;padding:22px;margin:24px 0"><b>1. 生物概念題</b><p>粒線體的主要功能是什麼？</p><p style="color:#2346c7">學生作答：進行細胞呼吸並產生 ATP。</p></section>
<section style="border:2px solid #bbb;padding:22px;margin:24px 0"><b>2. 圖形依賴題</b><p>完全依右圖資訊回答：A 點所標示的 y 數值是多少？離開此圖無法知道答案。</p><svg width="720" height="260" viewBox="0 0 720 260"><line x1="70" y1="220" x2="660" y2="220" stroke="black" stroke-width="3"/><line x1="90" y1="235" x2="90" y2="25" stroke="black" stroke-width="3"/><polyline points="90,205 250,160 410,75 620,120" fill="none" stroke="#222" stroke-width="5"/><circle cx="410" cy="75" r="9"/><text x="428" y="70" font-size="26">A = 12</text></svg><p style="color:#2346c7">學生作答：7</p></section>
<section style="border:2px solid #bbb;padding:22px;margin:24px 0"><b>3. 物理混合題</b><p>依下圖，水平外力 F = 6 N 時方塊仍靜止。求此刻靜摩擦力大小，並判斷「靜摩擦力永遠等於最大靜摩擦力」是否正確。</p><svg width="720" height="180" viewBox="0 0 720 180"><rect x="260" y="65" width="180" height="85" fill="none" stroke="black" stroke-width="4"/><line x1="440" y1="105" x2="610" y2="105" stroke="#111" stroke-width="5"/><polygon points="610,105 585,92 585,118" fill="#111"/><text x="515" y="88" font-size="26">F=6N</text></svg><p>A. 此刻靜摩擦力一定等於最大靜摩擦力</p><p>B. 靜摩擦力會依維持靜止所需調整</p><p style="color:#2346c7">學生圈選：A</p></section>`;
const sheetImage=await htmlImage(sheetHtml);
const sheet=await rawCall('sheet_current',ROOT+'/wrongbook-sheet-ai',{imageBase64:sheetImage,mimeType:'image/png'});
const sj=sheet.json,qs=sj?.result?.questions;
report.sheet={status:sheet.status,model:sj?.model,schemaVersion:sj?.schemaVersion,questionCount:Array.isArray(qs)?qs.length:null};
if(!sheet.ok)fail('SHEET_HTTP',{status:sheet.status,body:sj});
if(sj?.model!==EXPECT_MODEL)fail('SHEET_MODEL',sj?.model);
if(!sj?.result||typeof sj.result!=='object'||Array.isArray(sj.result))fail('SHEET_RESULT_NOT_OBJECT',sj?.result);
if(!Array.isArray(qs))fail('SHEET_QUESTIONS_NOT_ARRAY',qs);
const encodingIssues=stringifiedJsonIssues(sj);report.sheet.stringifiedJsonIssues=encodingIssues;if(encodingIssues.length)fail('SHEET_DOUBLE_ENCODING',encodingIssues);
if(Array.isArray(qs)){
  if(qs.length!==3)fail('SHEET_QUESTION_COUNT',{expected:3,actual:qs.length,numbers:qs.map(q=>q?.number)});
  const cropKeys=new Set();
  for(const [i,q] of qs.entries()){
    if(!q||typeof q!=='object'||Array.isArray(q))fail('SHEET_QUESTION_NOT_OBJECT',{i,q});
    if(!arraysNative(q))fail('SHEET_ARRAY_FIELD_STRINGIFIED',{i});
    if(!bboxOk(q?.crop))fail('SHEET_BAD_CROP',{i,crop:q?.crop}); else cropKeys.add(JSON.stringify(q.crop));
    if((q?.regions||[]).some(r=>!bboxOk(r?.bbox)))fail('SHEET_BAD_REGION',{i,regions:q?.regions});
    if(!Array.isArray(q?.concepts)||!q.concepts.length||q.concepts.some(c=>!c?.nameZh))fail('SHEET_CONCEPT_QUALITY',{i,concepts:q?.concepts});
    if(!['generic_fact','problem_dependent','mixed'].includes(q?.learningObjectType))fail('SHEET_BAD_LEARNING_OBJECT_TYPE',{i,type:q?.learningObjectType});
    if(q?.learningObjectType==='problem_dependent'&&(q?.genericFacts?.length||0)!==0)fail('SHEET_DEPENDENT_HAS_GENERIC_FACT',{i,facts:q?.genericFacts});
    if((q?.genericFacts||[]).some(f=>!f||typeof f!=='object'||!f.standalone||!f.question||!f.answer||/這題|上述|上圖|下圖|圖中|本題|選項/.test(f.question)||!f.sourceEvidence||!f.conceptNameZh||!f.dedupeKey))fail('SHEET_GENERIC_FACT_QUALITY',{i,facts:q?.genericFacts});
  }
  if(cropKeys.size<Math.min(3,qs.length))fail('SHEET_CROPS_NOT_DISTINCT',[...cropKeys]);
  if(qs.length===3){const ys=qs.map(q=>q?.crop?.y);report.sheet.cropY=ys;if(!(ys[0]<ys[1]&&ys[1]<ys[2]))fail('SHEET_SOURCE_ORDER_GEOMETRY',{ys,crops:qs.map(q=>q.crop)});for(let i=0;i<3;i++)for(let j=i+1;j<3;j++){const r=overlapRatio(qs[i].crop,qs[j].crop);if(r>.35)fail('SHEET_CROP_OVERLAP',{i,j,ratio:r,a:qs[i].crop,b:qs[j].crop});}}
  const types=qs.map(q=>q.learningObjectType);report.sheet.types=types;
  if(!types.includes('generic_fact'))fail('SHEET_MISSING_GENERIC_FACT',types);if(!types.includes('problem_dependent'))fail('SHEET_MISSING_PROBLEM_DEPENDENT',types);if(!types.includes('mixed'))fail('SHEET_MISSING_MIXED',types);
  const q3=qs.find(q=>String(q.number)==='3');if(q3?.questionType!=='single_choice'||q3?.options?.length<2||q3.options[0]?.label!=='A'||q3.options[1]?.label!=='B')fail('SHEET_OPTION_STRUCTURE',q3);
  const texts=qs.map(q=>String(q.problemText||''));if(texts.some(t=>t.length<8))fail('SHEET_PROBLEM_TEXT_TOO_SHORT',texts);if(new Set(texts).size!==texts.length)fail('SHEET_DUPLICATED_PROBLEM_TEXT',texts);
}

for(const [label,body,mime,expect] of [['sheet_missing_image',{},null,400],['sheet_invalid_body','not-json',null,400],['sheet_bad_mime',{imageBase64:'AAAA',mimeType:'text/plain'},null,400]]){
  let r;if(typeof body==='string')r=await fetch(ROOT+'/wrongbook-sheet-ai',{method:'POST',headers,body});else r=await fetch(ROOT+'/wrongbook-sheet-ai',{method:'POST',headers,body:JSON.stringify(body)});const raw=await r.text();const j=parseRaw(label,r.status,raw);report[label]={status:r.status,body:j};if(r.status!==expect)fail(label.toUpperCase(),{status:r.status,body:j});
}

report.finishedAt=new Date().toISOString();fs.writeFileSync(`${OUT}/provider-gate.json`,JSON.stringify(report,null,2));await browser.close();if(failed)process.exit(1);console.log('WRONGBOOK_PROVIDER_GATE_PASS',JSON.stringify({startedAt:report.startedAt,finishedAt:report.finishedAt,questionCount:report.sheet.questionCount,types:report.sheet.types,cropY:report.sheet.cropY}));