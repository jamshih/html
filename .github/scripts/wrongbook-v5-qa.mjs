import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT='.qa-artifacts/wrongbook-v5';fs.mkdirSync(OUT,{recursive:true});
const viewports=[['desktop',1440,900],['tablet-landscape',1366,1024],['ipad-portrait',1024,1366],['phone',390,844],['small-phone',375,667]];
const browser=await chromium.launch({headless:true});let failed=false;
const local='http://127.0.0.1:8000/wrongbook-v2/';
const fail=(tag,detail)=>{failed=true;console.error(tag,typeof detail==='string'?detail:JSON.stringify(detail,null,2))};

async function conceptPaneShot(page,name,pane){
  const tab=page.locator(`[data-ce-mobile="${pane}"]`);if(await tab.count()&&await tab.isVisible()){await tab.click();await page.waitForTimeout(100)}
  const box=page.locator(`[data-ce-pane="${pane}"]`);const visible=await box.count()&&await box.isVisible();const rect=visible?await box.boundingBox():null;
  await page.screenshot({path:`${OUT}/${name}-${pane}.png`,fullPage:false});return{visible,rect};
}

async function productViewport(name,width,height){
  const page=await browser.newPage({viewport:{width,height}}),errors=[],badResponses=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('response',r=>{if(r.status()>=400)badResponses.push(`${r.status()} ${r.url()}`)});
  await page.goto(local+'?e2eproduct=1',{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForSelector('#e2e-product-v5-results',{timeout:35000});
  const markerCount=await page.locator('#e2e-product-v5-results').count();
  const status=await page.locator('#e2e-product-v5-results').first().getAttribute('data-status'),text=await page.locator('#e2e-product-v5-results').first().textContent(),result=JSON.parse(text);
  const build=await page.locator('meta[name="wrongbook-build"]').getAttribute('content');
  const doc=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,scrollHeight:document.documentElement.scrollHeight,clientHeight:document.documentElement.clientHeight}));
  const visual={};
  if(width<=1180){
    visual.outline=await conceptPaneShot(page,name,'outline');visual.graph=await conceptPaneShot(page,name,'graph');visual.detail=await conceptPaneShot(page,name,'detail');
    const minReadable=width>700?Math.min(520,width*.55):Math.min(300,width*.72);
    for(const pane of ['outline','graph','detail'])if(!visual[pane].visible||!visual[pane].rect||visual[pane].rect.width<minReadable)fail('PANE_READABILITY_FAIL',{name,pane,minReadable,actual:visual[pane]});
  }
  await page.screenshot({path:`${OUT}/${name}.png`,fullPage:true});
  const persistenceBefore=await page.evaluate(()=>typeof state!=='undefined'?state.v5QaPersistence||null:null);
  await page.goto(local+'?persistcheck=1',{waitUntil:'domcontentloaded',timeout:20000});await page.waitForTimeout(250);
  const persistenceAfter=await page.evaluate(()=>typeof state!=='undefined'?state.v5QaPersistence||null:null);
  const persisted=Boolean(persistenceBefore?.at&&persistenceAfter?.at===persistenceBefore.at&&persistenceAfter?.factId===persistenceBefore.factId);
  const badNetwork=badResponses.filter(x=>!x.includes('favicon'));
  fs.writeFileSync(`${OUT}/${name}.json`,JSON.stringify({status,markerCount,build,result,errors,badResponses,badNetwork,doc,visual,persistenceBefore,persistenceAfter,persisted},null,2));
  if(markerCount!==1)fail('DUPLICATE_PRODUCT_QA',{name,markerCount});
  if(status!=='PASS'||errors.length||badNetwork.length||doc.scrollWidth>doc.clientWidth+2||!persisted||!String(build).includes('wrongbook-v5'))fail('VIEWPORT_FAIL',{name,status,markerCount,build,errors,badNetwork,doc,persisted,result});
  await page.close();
}
for(const v of viewports)await productViewport(...v);

async function isolatedSuite(label,query,waitAfter=900){
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],badResponses=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('response',r=>{if(r.status()>=400)badResponses.push(`${r.status()} ${r.url()}`)});
  await page.goto(local+query,{waitUntil:'domcontentloaded',timeout:20000});await page.waitForSelector('#e2e-results',{timeout:45000});await page.waitForTimeout(waitAfter);
  const markerCount=await page.locator('#e2e-results').count(),status=await page.locator('#e2e-results').first().getAttribute('data-status'),text=await page.locator('#e2e-results').first().textContent(),result=JSON.parse(text);
  const badNetwork=badResponses.filter(x=>!x.includes('favicon'));
  await page.screenshot({path:`${OUT}/${label}.png`,fullPage:true});fs.writeFileSync(`${OUT}/${label}.json`,JSON.stringify({status,markerCount,result,errors,badResponses,badNetwork},null,2));
  if(markerCount!==1||status!=='PASS'||errors.length||badNetwork.length)fail(`${label.toUpperCase()}_FAIL`,{status,markerCount,errors,badNetwork,result});
  await page.close();return result;
}

// Final V4 historical suite owns ?e2e=1 and performs the structural Earth source-integrity audit.
{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[],badResponses=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('response',r=>{if(r.status()>=400)badResponses.push(`${r.status()} ${r.url()}`)});
  await page.goto(local+'?e2e=1',{waitUntil:'domcontentloaded',timeout:20000});await page.waitForSelector('#e2e-results',{timeout:45000});await page.waitForTimeout(5500);
  const markerCount=await page.locator('#e2e-results').count(),status=await page.locator('#e2e-results').first().getAttribute('data-status'),text=await page.locator('#e2e-results').first().textContent(),result=JSON.parse(text);
  const finalEarth=await page.evaluate(()=>({source:window.v8EarthSourceIntegrity?.(),semantic:window.v5StrictAcceptanceReport?.()}));
  await page.screenshot({path:`${OUT}/legacy-v4.png`,fullPage:true});fs.writeFileSync(`${OUT}/legacy-v4.json`,JSON.stringify({status,markerCount,result,finalEarth,errors,badResponses},null,2));
  const badNetwork=badResponses.filter(x=>!x.includes('favicon'));
  if(markerCount!==1||status!=='PASS'||errors.length||badNetwork.length||!finalEarth.source?.ok||!finalEarth.semantic?.ok)fail('LEGACY_V4_FAIL',{status,markerCount,errors,badNetwork,result,finalEarth});await page.close();
}
// Preserve every older/source-specific regression suite as a separate page so result markers cannot race.
await isolatedSuite('legacy-v3','?e2ev3=1',5200);
await isolatedSuite('source-trace-v6','?sourcee2e=1',1800);
await isolatedSuite('source-refinement-v7','?refinee2e=1',1800);

// Live deployed backend QA: versions, auth/client errors, and real Gemini structured-output behavior.
{
  const key='sb_publishable_Nt8ik0KBWLdi8hucG9oDRQ_cnMyQ9Gx',root='https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1',backend={health:{},errors:{},valid:{}};
  for(const [slug,expect] of [['wrongbook-ai','v3-learning-objects-regions'],['wrongbook-sheet-ai','2-learning-objects-regions'],['wrongbook-guide-ai','guide-v2-staged']]){const r=await fetch(`${root}/${slug}${slug==='wrongbook-ai'?'/health':''}`),j=await r.json();backend.health[slug]={status:r.status,body:j};if(!r.ok||!JSON.stringify(j).includes(expect))fail('HEALTH_FAIL',{slug,j})}
  const unauth=await fetch(`${root}/wrongbook-guide-ai`,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});backend.errors.unauthorized={status:unauth.status,body:await unauth.json()};if(unauth.status!==401)fail('AUTH_FAIL',backend.errors.unauthorized);
  const missingAi=await fetch(`${root}/wrongbook-ai/analyze`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:'{}'});backend.errors.missingAnalyze={status:missingAi.status,body:await missingAi.json()};if(missingAi.status!==400)fail('ANALYZE_CLIENT_ERROR_FAIL',backend.errors.missingAnalyze);
  const missingGuide=await fetch(`${root}/wrongbook-guide-ai`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify({mode:'instructive'})});backend.errors.missingGuide={status:missingGuide.status,body:await missingGuide.json()};if(missingGuide.status!==400)fail('GUIDE_CLIENT_ERROR_FAIL',backend.errors.missingGuide);
  const malformed=await fetch(`${root}/wrongbook-guide-ai`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:'{bad'});backend.errors.malformed={status:malformed.status,body:await malformed.json()};if(malformed.status!==400)fail('GUIDE_MALFORMED_FAIL',backend.errors.malformed);

  async function htmlImage(html,width=900,height=650){const p=await browser.newPage({viewport:{width,height}});await p.setContent(`<html><body style="font-family:Arial,'PingFang TC',sans-serif;padding:48px;font-size:25px;line-height:1.5;color:#111">${html}</body></html>`);const png=await p.screenshot({type:'png'});await p.close();return png.toString('base64')}
  async function analyzeImage(label,imageBase64){const r=await fetch(`${root}/wrongbook-ai/analyze`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify({imageBase64,mimeType:'image/png',syllabus:{level:'高中'}})}),j=await r.json();backend.valid[label]={status:r.status,body:j};return{r,j}}
  const banned=/這題|上述|上圖|下圖|圖中|本題|選項/;

  const genericImage=await htmlImage('<b>生物問答題</b><p>粒線體的主要功能是什麼？</p><p style="color:#2233aa">學生作答：進行細胞呼吸並產生 ATP。</p>');
  const generic=await analyzeImage('generic_fact',genericImage),gr=generic.j?.result;
  const genericFacts=Array.isArray(gr?.genericFacts)?gr.genericFacts:[];
  if(!generic.r.ok||gr?.learningObjectType!=='generic_fact'||!genericFacts.length||genericFacts.some(x=>!x.standalone||!x.question||!x.answer||banned.test(x.question)||!x.sourceEvidence)||!Array.isArray(gr?.concepts)||!gr.concepts.length)fail('GENERIC_FACT_BACKEND_FAIL',generic.j);

  const dependentImage=await htmlImage('<b>數學圖形題</b><p>完全依下圖資訊回答：A 點的 y 座標是多少？離開此圖無法知道數值。</p><svg width="650" height="300" viewBox="0 0 650 300"><line x1="60" y1="250" x2="610" y2="250" stroke="black" stroke-width="3"/><line x1="90" y1="275" x2="90" y2="25" stroke="black" stroke-width="3"/><polyline points="90,230 220,170 360,90 560,140" fill="none" stroke="#222" stroke-width="5"/><circle cx="360" cy="90" r="9" fill="#111"/><text x="375" y="85" font-size="28">A</text><text x="65" y="120" font-size="24">刻度依圖示</text></svg><p style="color:#2233aa">學生作答：7</p>');
  const dependent=await analyzeImage('problem_dependent',dependentImage),dr=dependent.j?.result;
  if(!dependent.r.ok||dr?.learningObjectType!=='problem_dependent'||(dr?.genericFacts?.length||0)!==0||!Array.isArray(dr?.regions)||!dr.regions.length||dr.regions.some(x=>!x.bbox||x.bbox.x<0||x.bbox.y<0||x.bbox.x+x.bbox.width>100.01||x.bbox.y+x.bbox.height>100.01))fail('PROBLEM_DEPENDENT_BACKEND_FAIL',dependent.j);

  const mixedImage=await htmlImage('<b>物理選擇題</b><p>依下方受力情境判斷。物體目前保持靜止。</p><div style="border:3px solid #222;width:240px;height:100px;margin:20px 0;text-align:center;line-height:100px">方塊</div><p>A. 靜摩擦力一定等於最大靜摩擦力</p><p>B. 靜摩擦力會依維持靜止所需調整</p><p style="color:#2233aa">學生圈選：A</p>');
  const mixed=await analyzeImage('mixed',mixedImage),mr=mixed.j?.result;
  if(!mixed.r.ok||mr?.learningObjectType!=='mixed'||!Array.isArray(mr?.genericFacts)||!mr.genericFacts.length||!Array.isArray(mr?.regions)||!mr.regions.length||mr.genericFacts.some(x=>!x.standalone||banned.test(x.question)||!x.sourceEvidence))fail('MIXED_BACKEND_FAIL',mixed.j);

  const sheetImage=await htmlImage('<b>整張題目頁</b><p>1. 粒線體的主要功能是什麼？　學生：產生 ATP</p><hr><p>2. 依右圖判斷 A 點數值。　學生：7</p><svg width="420" height="160"><line x1="20" y1="130" x2="390" y2="30" stroke="black" stroke-width="4"/><circle cx="250" cy="70" r="7"/><text x="265" y="68" font-size="22">A</text></svg>',950,800);
  const sheet=await fetch(`${root}/wrongbook-sheet-ai`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify({imageBase64:sheetImage,mimeType:'image/png'})}),sj=await sheet.json();backend.valid.sheet={status:sheet.status,body:sj};const sq=sj?.result?.questions;
  if(!sheet.ok||!Array.isArray(sq)||sq.length<2||sq.some(q=>!['generic_fact','problem_dependent','mixed'].includes(q.learningObjectType)||!q.crop||q.crop.x<0||q.crop.y<0||q.crop.x+q.crop.width>100.01||q.crop.y+q.crop.height>100.01))fail('SHEET_CONTRACT_FAIL',sj);

  async function guideCall(label,body){const r=await fetch(`${root}/wrongbook-guide-ai`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify(body)}),j=await r.json();backend.valid[label]={status:r.status,body:j};return{r,j}}
  const guideBase={problemText:'物體在水平面上保持靜止。A 選項說靜摩擦力一定等於最大靜摩擦力。',studentAnswer:['A'],correctAnswer:['B'],subject:'物理',concepts:[{nameZh:'靜摩擦力'}],regions:[{id:'low-handwriting',kind:'student_handwriting',text:'模糊字跡',bbox:{x:20,y:55,width:25,height:8},confidence:.35},{id:'stem',kind:'key_phrase',text:'保持靜止',bbox:{x:20,y:18,width:20,height:7},confidence:.98}]};
  const guide=await guideCall('guide_start',{...guideBase,mode:'instructive',requestType:'start',question:'請先看我錯在哪裡，再只提示下一步。'}),gj=guide.j?.result;
  if(!guide.r.ok||!gj?.diagnosis||gj?.mode!=='instructive'||gj?.stages?.length!==1||gj.stages[0].revealFinalAnswer!==false||gj.stages[0].waitForStudent!==true||!gj.diagnosis.blindSpot)fail('GUIDE_START_FAIL',guide.j);
  const lowUnsafe=(gj?.stages?.[0]?.actions||[]).some(a=>a.targetRegionId==='low-handwriting'&&['circle','underline','strike','highlight','fade'].includes(a.kind));if(lowUnsafe)fail('GUIDE_LOW_CONFIDENCE_GEOMETRY_FAIL',guide.j);

  const evaluate=await guideCall('guide_evaluate',{...guideBase,imageBase64:mixedImage,mimeType:'image/png',mode:'instructive',requestType:'evaluate',studentAttemptNote:'我新寫了 ΣFₓ=0，並保留原本受力圖。',priorStages:gj?.stages||[],question:'我寫好了，幫我看。'}),er=evaluate.j?.result;
  if(!evaluate.r.ok||!er?.diagnosis||er?.mode!=='instructive'||er?.stages?.length!==1||er.stages[0].revealFinalAnswer!==false||er.stages[0].waitForStudent!==true)fail('GUIDE_REEVALUATE_FAIL',evaluate.j);

  const direct=await guideCall('guide_direct',{...guideBase,imageBase64:mixedImage,mimeType:'image/png',mode:'direct',requestType:'start',question:'直接給我逐步詳解。'}),dir=direct.j?.result;
  if(!direct.r.ok||dir?.mode!=='direct'||!Array.isArray(dir?.stages)||!dir.stages.length||dir.stages.slice(0,-1).some(s=>s.revealFinalAnswer===true)||!dir.stages.some(s=>s.revealFinalAnswer===true))fail('GUIDE_DIRECT_FAIL',direct.j);

  fs.writeFileSync(`${OUT}/backend.json`,JSON.stringify(backend,null,2));
}
await browser.close();if(failed)process.exit(1);
