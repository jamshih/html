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
const report={startedAt:new Date().toISOString(),health:{},raw:{},ai:{},sheet:{},guide:{},negative:{},acceptance:{},errors:[]};
let failed=false;
const fail=(gate,detail)=>{failed=true;report.errors.push({gate,detail});report.acceptance[gate]='FAIL';console.error(gate,typeof detail==='string'?detail:JSON.stringify(detail,null,2));};
const pass=gate=>{if(!report.acceptance[gate])report.acceptance[gate]='PASS'};
const headers={'content-type':'application/json',apikey:key};
const bannedFact=/這題|上述|上圖|下圖|圖中|本題|選項/;
const mainland=/線粒體|高爾基體|概率|種群|群落|生境|質粒|數據|視頻|信息|网络|軟件|矢量/;

function parseRaw(label,status,raw){
  report.raw[label]={status,raw};
  if(/^\s*["']/.test(raw)) fail(label+'_ROOT_QUOTED',raw.slice(0,160));
  if(/```(?:json)?/i.test(raw)) fail(label+'_MARKDOWN_FENCE',raw.slice(0,240));
  let json;try{json=JSON.parse(raw)}catch(e){fail(label+'_RAW_JSON_PARSE',String(e));return null}
  if(!json||typeof json!=='object'||Array.isArray(json))fail(label+'_ROOT_NOT_OBJECT',typeof json);
  return json;
}
function stringifiedJsonIssues(value,path='$',out=[]){if(typeof value==='string'){const t=value.trim();if((t.startsWith('{')&&t.endsWith('}'))||(t.startsWith('[')&&t.endsWith(']'))){try{JSON.parse(t);out.push(path)}catch{}}return out}if(Array.isArray(value)){value.forEach((v,i)=>stringifiedJsonIssues(v,`${path}[${i}]`,out));return out}if(value&&typeof value==='object')for(const [k,v] of Object.entries(value))stringifiedJsonIssues(v,`${path}.${k}`,out);return out}
function bboxOk(b){return b&&typeof b==='object'&&['x','y','width','height'].every(k=>typeof b[k]==='number'&&Number.isFinite(b[k]))&&b.x>=0&&b.y>=0&&b.width>0&&b.height>0&&b.x+b.width<=100.01&&b.y+b.height<=100.01}
function overlapRatio(a,b){if(!bboxOk(a)||!bboxOk(b))return 1;const x=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x));const y=Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));return x*y/Math.max(1,Math.min(a.width*a.height,b.width*b.height))}
async function rawCall(label,url,body){const r=await fetch(url,{method:'POST',headers,body:typeof body==='string'?body:JSON.stringify(body)});const raw=await r.text();const json=parseRaw(label,r.status,raw);return{status:r.status,ok:r.ok,raw,json}}
async function htmlImage(html,w=1000,h=800){const p=await browser.newPage({viewport:{width:w,height:h}});await p.setContent(`<html><body style="font-family:Arial,'PingFang TC',sans-serif;padding:48px;font-size:25px;line-height:1.45;color:#111;background:white">${html}</body></html>`);const b=await p.screenshot({type:'png',fullPage:true});await p.close();return b.toString('base64')}
function native(label,j){const issues=stringifiedJsonIssues(j);if(issues.length)fail(label+'_STRINGIFIED_JSON',issues);else pass(label+'_NATIVE_JSON');return !issues.length}

for(const [slug,path,transport] of [['wrongbook-ai','/wrongbook-ai/health','generateContent-native-schema'],['wrongbook-sheet-ai','/wrongbook-sheet-ai','generateContent-native-semantic-plus-spatial'],['wrongbook-guide-ai','/wrongbook-guide-ai','generateContent-native-schema']]){
  const r=await fetch(ROOT+path),raw=await r.text(),j=parseRaw('health_'+slug,r.status,raw);report.health[slug]={status:r.status,body:j};
  if(!r.ok||!j?.ok||j?.configured!==true||j?.model!==EXPECT_MODEL||j?.transport!==transport)fail('HEALTH_'+slug,{status:r.status,body:j});else pass('HEALTH_'+slug);
}

// Fresh single-question real-provider tests.
const genericImage=await htmlImage('<b>生物問答題</b><p>粒線體的主要功能是什麼？</p><p style="color:#2346c7">學生作答：進行細胞呼吸並產生 ATP。</p>');
const generic=await rawCall('ai_generic',ROOT+'/wrongbook-ai/analyze',{imageBase64:genericImage,mimeType:'image/png',syllabus:{level:'高中'}}),gr=generic.json?.result,gf=gr?.genericFacts||[];native('AI_GENERIC',generic.json);
if(!generic.ok||gr?.learningObjectType!=='generic_fact'||!Array.isArray(gr?.concepts)||!gr.concepts.length||!Array.isArray(gr?.regions)||!gr.regions.length||!Array.isArray(gr?.tutorSteps)||!gf.length||gf.some(f=>!f?.standalone||!f?.question||!f?.answer||!f?.sourceEvidence||!f?.conceptNameZh||!f?.dedupeKey||bannedFact.test(f.question))||mainland.test(JSON.stringify(gr)))fail('AI_GENERIC_QUALITY',generic.json);else pass('AI_GENERIC_QUALITY');
report.ai.generic={status:generic.status,type:gr?.learningObjectType,factCount:gf.length};

const depImage=await htmlImage('<b>數學圖形題</b><p>完全依下圖資訊回答：A 點標示的 y 數值是多少？離開此圖無法知道數值。</p><svg width="720" height="320"><line x1="70" y1="270" x2="650" y2="270" stroke="black" stroke-width="3"/><line x1="100" y1="290" x2="100" y2="30" stroke="black" stroke-width="3"/><polyline points="100,240 250,180 420,80 610,140" fill="none" stroke="#222" stroke-width="5"/><circle cx="420" cy="80" r="9"/><text x="440" y="78" font-size="28">A=12</text></svg><p style="color:#2346c7">學生作答：7</p>');
const dep=await rawCall('ai_dependent',ROOT+'/wrongbook-ai/analyze',{imageBase64:depImage,mimeType:'image/png',syllabus:{level:'高中'}}),dr=dep.json?.result;native('AI_DEPENDENT',dep.json);
if(!dep.ok||dr?.learningObjectType!=='problem_dependent'||!Array.isArray(dr?.genericFacts)||dr.genericFacts.length!==0||!Array.isArray(dr?.regions)||!dr.regions.length||dr.regions.some(r=>!bboxOk(r?.bbox)))fail('AI_DEPENDENT_QUALITY',dep.json);else pass('AI_DEPENDENT_QUALITY');
report.ai.dependent={status:dep.status,type:dr?.learningObjectType,regionCount:dr?.regions?.length};

const mixedImage=await htmlImage('<b>物理選擇題</b><p>水平外力 F=6 N 時方塊仍靜止。判斷敘述並求此刻靜摩擦力。</p><div style="border:3px solid #222;width:240px;height:90px;text-align:center;line-height:90px">方塊 → F=6N</div><p>A. 靜摩擦力一定等於最大靜摩擦力</p><p>B. 靜摩擦力會依維持靜止所需調整</p><p style="color:#2346c7">學生圈選：A</p>');
const mixed=await rawCall('ai_mixed',ROOT+'/wrongbook-ai/analyze',{imageBase64:mixedImage,mimeType:'image/png',syllabus:{level:'高中'}}),mr=mixed.json?.result,mf=mr?.genericFacts||[];native('AI_MIXED',mixed.json);
if(!mixed.ok||mr?.learningObjectType!=='mixed'||!Array.isArray(mr?.options)||mr.options.length<2||!Array.isArray(mr?.regions)||!mr.regions.length||!mf.length||mf.some(f=>!f?.standalone||!f?.sourceEvidence||bannedFact.test(f.question||'')))fail('AI_MIXED_QUALITY',mixed.json);else pass('AI_MIXED_QUALITY');
report.ai.mixed={status:mixed.status,type:mr?.learningObjectType,factCount:mf.length};

// Fresh whole-sheet test, including native source geometry.
const sheetHtml=`<h1 style="font-size:34px">高中錯題整理 — 三題測試</h1><section style="border:2px solid #bbb;padding:22px;margin:24px 0"><b>1. 生物概念題</b><p>粒線體的主要功能是什麼？</p><p style="color:#2346c7">學生作答：進行細胞呼吸並產生 ATP。</p></section><section style="border:2px solid #bbb;padding:22px;margin:24px 0"><b>2. 圖形依賴題</b><p>完全依右圖資訊回答：A 點所標示的 y 數值是多少？離開此圖無法知道答案。</p><svg width="720" height="260"><line x1="70" y1="220" x2="660" y2="220" stroke="black" stroke-width="3"/><line x1="90" y1="235" x2="90" y2="25" stroke="black" stroke-width="3"/><polyline points="90,205 250,160 410,75 620,120" fill="none" stroke="#222" stroke-width="5"/><circle cx="410" cy="75" r="9"/><text x="428" y="70" font-size="26">A = 12</text></svg><p style="color:#2346c7">學生作答：7</p></section><section style="border:2px solid #bbb;padding:22px;margin:24px 0"><b>3. 物理混合題</b><p>依下圖，水平外力 F = 6 N 時方塊仍靜止。求此刻靜摩擦力大小，並判斷「靜摩擦力永遠等於最大靜摩擦力」是否正確。</p><svg width="720" height="180"><rect x="260" y="65" width="180" height="85" fill="none" stroke="black" stroke-width="4"/><line x1="440" y1="105" x2="610" y2="105" stroke="#111" stroke-width="5"/><polygon points="610,105 585,92 585,118" fill="#111"/><text x="515" y="88" font-size="26">F=6N</text></svg><p>A. 此刻靜摩擦力一定等於最大靜摩擦力</p><p>B. 靜摩擦力會依維持靜止所需調整</p><p style="color:#2346c7">學生圈選：A</p></section>`;
const sheetImage=await htmlImage(sheetHtml,1100,1400),sheet=await rawCall('sheet_current',ROOT+'/wrongbook-sheet-ai',{imageBase64:sheetImage,mimeType:'image/png'}),sj=sheet.json,qs=sj?.result?.questions;native('SHEET',sj);
report.sheet={status:sheet.status,model:sj?.model,schemaVersion:sj?.schemaVersion,questionCount:Array.isArray(qs)?qs.length:null};
if(!sheet.ok||!sj?.result||typeof sj.result!=='object'||Array.isArray(sj.result)||!Array.isArray(qs)||qs.length!==3)fail('SHEET_STRUCTURE',{status:sheet.status,body:sj});else pass('SHEET_STRUCTURE');
if(Array.isArray(qs)){const cropKeys=new Set();for(const [i,q] of qs.entries()){if(!q||typeof q!=='object'||Array.isArray(q)||!['options','recognizedUserAnswer','correctAnswer','concepts','corrections','genericFacts','regions'].every(k=>Array.isArray(q[k])))fail('SHEET_NATIVE_FIELDS',{i,q});if(!bboxOk(q.crop))fail('SHEET_BAD_CROP',{i,crop:q.crop});else cropKeys.add(JSON.stringify(q.crop));if(q.regions.some(r=>!bboxOk(r?.bbox)))fail('SHEET_BAD_REGION',{i,regions:q.regions});if(!q.concepts.length||q.concepts.some(c=>!c?.nameZh))fail('SHEET_CONCEPT_QUALITY',{i,concepts:q.concepts});if(q.learningObjectType==='problem_dependent'&&q.genericFacts.length)fail('SHEET_DEPENDENT_HAS_GENERIC_FACT',{i});if(q.genericFacts.some(f=>!f?.standalone||!f?.question||!f?.answer||!f?.sourceEvidence||!f?.conceptNameZh||!f?.dedupeKey||bannedFact.test(f.question)))fail('SHEET_FACT_QUALITY',{i,facts:q.genericFacts})}if(cropKeys.size!==3)fail('SHEET_CROPS_NOT_DISTINCT',[...cropKeys]);const ys=qs.map(q=>q.crop.y);report.sheet.cropY=ys;if(!(ys[0]<ys[1]&&ys[1]<ys[2]))fail('SHEET_SOURCE_ORDER_GEOMETRY',{ys});for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)if(overlapRatio(qs[i].crop,qs[j].crop)>.35)fail('SHEET_CROP_OVERLAP',{i,j,a:qs[i].crop,b:qs[j].crop});const types=qs.map(q=>q.learningObjectType);report.sheet.types=types;if(!types.includes('generic_fact')||!types.includes('problem_dependent')||!types.includes('mixed'))fail('SHEET_PER_QUESTION_TYPES',types);const q3=qs.find(q=>String(q.number)==='3');if(q3?.questionType!=='single_choice'||q3?.options?.length<2||q3.options[0]?.label!=='A'||q3.options[1]?.label!=='B')fail('SHEET_OPTION_STRUCTURE',q3)}
if(!report.errors.some(e=>e.gate.startsWith('SHEET_')))pass('SHEET_SEMANTIC_AND_GEOMETRY');

// Fresh staged tutor requests.
const base={problemText:'物體在水平面上受水平外力 6 N 且保持靜止。A 選項說靜摩擦力一定等於最大靜摩擦力。',studentAnswer:['A'],correctAnswer:['B'],subject:'物理',concepts:[{nameZh:'靜摩擦力'}],regions:[{id:'low-handwriting',kind:'student_handwriting',text:'模糊字跡',bbox:{x:20,y:55,width:25,height:8},confidence:.35},{id:'stem',kind:'key_phrase',text:'保持靜止',bbox:{x:20,y:18,width:20,height:7},confidence:.98}]};
const gs=await rawCall('guide_start',ROOT+'/wrongbook-guide-ai',{...base,mode:'instructive',requestType:'start',question:'請先看我錯在哪裡，再只提示下一步。'}),g=gs.json?.result;native('GUIDE_START',gs.json);
if(!gs.ok||!g?.diagnosis||!g.diagnosis.blindSpot||g.mode!=='instructive'||g.stages?.length!==1||g.stages[0]?.revealFinalAnswer!==false||g.stages[0]?.waitForStudent!==true)fail('GUIDE_INSTRUCTIVE_GATE',gs.json);else pass('GUIDE_INSTRUCTIVE_GATE');
if((g?.stages?.[0]?.actions||[]).some(a=>a.targetRegionId==='low-handwriting'&&['circle','underline','strike','highlight','fade'].includes(a.kind)))fail('GUIDE_LOW_CONF_GEOMETRY',g.stages[0].actions);else pass('GUIDE_LOW_CONF_GEOMETRY');
const gh=await rawCall('guide_hint',ROOT+'/wrongbook-guide-ai',{...base,mode:'instructive',requestType:'hint',priorStages:g?.stages||[],question:'我還是不懂，請再明確一點但不要直接講答案。'}),hr=gh.json?.result;native('GUIDE_HINT',gh.json);
if(!gh.ok||hr?.stages?.length!==1||hr.stages[0]?.revealFinalAnswer!==false||hr.stages[0]?.waitForStudent!==true||hr.stages[0]?.promptToStudent===g?.stages?.[0]?.promptToStudent)fail('GUIDE_HINT_ESCALATION',gh.json);else pass('GUIDE_HINT_ESCALATION');
const ge=await rawCall('guide_evaluate',ROOT+'/wrongbook-guide-ai',{...base,imageBase64:mixedImage,mimeType:'image/png',mode:'instructive',requestType:'evaluate',studentAttemptNote:'我新寫了：物體靜止所以 ΣFₓ=0，6 N 外力要被 6 N 靜摩擦力平衡，但這不代表已達最大靜摩擦力。',priorStages:hr?.stages||g?.stages||[],question:'我寫好了，幫我看。'}),er=ge.json?.result;native('GUIDE_EVALUATE',ge.json);
const evalText=JSON.stringify(er||{});if(!ge.ok||!er?.diagnosis||er.mode!=='instructive'||er.stages?.length!==1||er.stages[0]?.revealFinalAnswer!==false||er.stages[0]?.waitForStudent!==true||er.diagnosis.studentOnRightTrack!==true||!/合力|平衡|6 N|最大靜摩擦力/.test(evalText))fail('GUIDE_REEVALUATION',ge.json);else pass('GUIDE_REEVALUATION');
const right=await rawCall('guide_right_track',ROOT+'/wrongbook-guide-ai',{...base,studentAnswer:['B'],mode:'instructive',requestType:'start',question:'我選 B，請確認我的方向並引導我說出理由。'}),rr=right.json?.result;native('GUIDE_RIGHT_TRACK',right.json);if(!right.ok||rr?.diagnosis?.studentOnRightTrack!==true||rr?.stages?.length!==1||rr.stages[0]?.revealFinalAnswer!==false)fail('GUIDE_RIGHT_TRACK_BEHAVIOR',right.json);else pass('GUIDE_RIGHT_TRACK_BEHAVIOR');
const gd=await rawCall('guide_direct',ROOT+'/wrongbook-guide-ai',{...base,imageBase64:mixedImage,mimeType:'image/png',mode:'direct',requestType:'direct',question:'直接給我逐步詳解。'}),dir=gd.json?.result;native('GUIDE_DIRECT',gd.json);if(!gd.ok||dir?.mode!=='direct'||!Array.isArray(dir?.stages)||dir.stages.length<2||dir.stages.slice(0,-1).some(s=>s.revealFinalAnswer===true)||dir.stages.at(-1)?.revealFinalAnswer!==true||dir.stages.some(s=>!s.goal||!s.successCriteria))fail('GUIDE_DIRECT_SOLUTION',gd.json);else pass('GUIDE_DIRECT_SOLUTION');
report.guide={start:gs.status,hint:gh.status,evaluate:ge.status,rightTrack:right.status,direct:gd.status};

// Validation-first error paths.
const negatives=[
 ['ai_missing_image',ROOT+'/wrongbook-ai/analyze',{},400],
 ['ai_bad_mime',ROOT+'/wrongbook-ai/analyze',{imageBase64:'AAAA',mimeType:'text/plain'},400],
 ['sheet_missing_image',ROOT+'/wrongbook-sheet-ai',{},400],
 ['sheet_invalid_json',ROOT+'/wrongbook-sheet-ai','not-json',400],
 ['sheet_bad_mime',ROOT+'/wrongbook-sheet-ai',{imageBase64:'AAAA',mimeType:'text/plain'},400],
 ['guide_missing_problem',ROOT+'/wrongbook-guide-ai',{mode:'instructive',requestType:'start'},400],
 ['guide_bad_request_type',ROOT+'/wrongbook-guide-ai',{problemText:'測試題目',mode:'instructive',requestType:'nonsense'},400],
 ['guide_bad_mime',ROOT+'/wrongbook-guide-ai',{problemText:'測試題目',imageBase64:'AAAA',mimeType:'text/plain',mode:'instructive',requestType:'start'},400]
];
for(const [label,url,body,expect] of negatives){const r=await rawCall(label,url,body);report.negative[label]={status:r.status,body:r.json};if(r.status!==expect||String(r.raw).includes(' at ')||r.json?.ok===true)fail('NEGATIVE_'+label,{status:r.status,body:r.json});}
if(!report.errors.some(e=>e.gate.startsWith('NEGATIVE_')))pass('NEGATIVE_ERROR_CASES');

report.finishedAt=new Date().toISOString();fs.writeFileSync(`${OUT}/provider-gate.json`,JSON.stringify(report,null,2));await browser.close();if(failed)process.exit(1);console.log('WRONGBOOK_FULL_PROVIDER_GATE_PASS',JSON.stringify({startedAt:report.startedAt,finishedAt:report.finishedAt,ai:report.ai,sheet:report.sheet,guide:report.guide,acceptance:report.acceptance}));