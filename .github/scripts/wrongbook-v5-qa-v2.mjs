import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT='.qa-artifacts/wrongbook-v5-v2';fs.mkdirSync(OUT,{recursive:true});
const LOCAL='http://127.0.0.1:8000/wrongbook-v2/';
const RUN_PROVIDER=process.env.WB_REAL_PROVIDER!=='0';
const browser=await chromium.launch({headless:true});let failed=false;
const viewports=[['desktop',1440,900],['tablet-landscape',1366,1024],['ipad-portrait',1024,1366],['phone',390,844],['small-phone',375,667]];
const fail=(tag,detail)=>{failed=true;console.error(tag,typeof detail==='string'?detail:JSON.stringify(detail,null,2))};
const cleanNetwork=xs=>xs.filter(x=>!x.includes('favicon'));

function watch(page){const errors=[],badResponses=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('response',r=>{if(r.status()>=400)badResponses.push(`${r.status()} ${r.url()}`)});return{errors,badResponses}}
async function hideMarker(page,id){const l=page.locator(id);if(await l.count())await l.evaluate(el=>el.style.display='none')}
async function rect(page,selector){const l=page.locator(selector);return await l.count()&&await l.isVisible()?await l.boundingBox():null}
async function paneShot(page,name,pane){const tab=page.locator(`[data-ce-mobile="${pane}"]`);if(await tab.count()&&await tab.isVisible()){await tab.click();await page.waitForTimeout(90)}const r=await rect(page,`[data-ce-pane="${pane}"]`);await page.screenshot({path:`${OUT}/${name}-concept-${pane}.png`,fullPage:false});return r}

async function tutorShot(page,name,width,height){
  const setup=await page.evaluate(()=>{const p=(state.problems||[]).find(x=>x&&x.id);if(!p)return{ok:false};state.page='notebook';state.selectedProblemId=p.id;save();render();const ok=typeof v5TutorTestDemo==='function'&&v5TutorTestDemo({rightTrack:false,mode:'instructive'});return{ok:Boolean(ok),id:p.id}});
  if(!setup.ok)return{ok:false,reason:'no tutor fixture'};await page.waitForTimeout(160);
  const dock=page.locator('.v5-tutor-dock');if(await dock.count())await dock.scrollIntoViewIfNeeded();await page.waitForTimeout(80);
  const dockRect=await rect(page,'.v5-tutor-dock'),canvasRect=await rect(page,'#aiGuideCanvas'),tryRect=await rect(page,'[data-v5-tutor-try]');
  const navRect=await rect(page,'.mobile-nav');
  const overlap=Boolean(dockRect&&navRect&&Math.max(dockRect.x,navRect.x)<Math.min(dockRect.x+dockRect.width,navRect.x+navRect.width)&&Math.max(dockRect.y,navRect.y)<Math.min(dockRect.y+dockRect.height,navRect.y+navRect.height));
  const reachable=Boolean(dockRect&&dockRect.x>=-2&&dockRect.x+dockRect.width<=width+2&&tryRect&&tryRect.x>=-2&&tryRect.x+tryRect.width<=width+2);
  await page.screenshot({path:`${OUT}/${name}-tutor.png`,fullPage:false});await page.evaluate(()=>window.v5CancelGuidePlayback?.());
  return{ok:Boolean(dockRect&&canvasRect&&tryRect&&reachable&&!overlap),dockRect,canvasRect,tryRect,navRect,overlap,reachable};
}

async function productViewport(name,width,height){
  const page=await browser.newPage({viewport:{width,height}}),obs=watch(page);
  await page.goto(LOCAL+'?e2eproduct=1',{waitUntil:'domcontentloaded',timeout:20000});await page.waitForSelector('#e2e-product-v5-results',{timeout:40000});
  const marker=page.locator('#e2e-product-v5-results'),markerCount=await marker.count(),status=await marker.first().getAttribute('data-status'),result=JSON.parse(await marker.first().textContent());
  const build=await page.locator('meta[name="wrongbook-build"]').getAttribute('content');await hideMarker(page,'#e2e-product-v5-results');
  const visual={};if(width<=1180){for(const pane of ['outline','graph','detail'])visual[pane]=await paneShot(page,name,pane);const min=width>700?Math.min(520,width*.55):Math.min(300,width*.72);for(const [pane,r] of Object.entries(visual))if(!r||r.width<min)fail('PANE_READABILITY_FAIL',{name,pane,min,rect:r})}
  const doc=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  const tutor=await tutorShot(page,name,width,height);if(!tutor.ok)fail('TUTOR_RESPONSIVE_FAIL',{name,tutor});
  await page.evaluate(()=>{state.page='concepts';save();render()});await page.waitForTimeout(80);await page.screenshot({path:`${OUT}/${name}.png`,fullPage:true});
  const before=await page.evaluate(()=>state.v5QaPersistence||null);await page.goto(LOCAL+'?persistcheck=1',{waitUntil:'domcontentloaded',timeout:20000});await page.waitForTimeout(220);const after=await page.evaluate(()=>state.v5QaPersistence||null);const persisted=Boolean(before?.at&&after?.at===before.at&&after?.factId===before.factId);
  const bad=cleanNetwork(obs.badResponses);fs.writeFileSync(`${OUT}/${name}.json`,JSON.stringify({status,markerCount,build,result,errors:obs.errors,badNetwork:bad,doc,visual,tutor,before,after,persisted},null,2));
  if(markerCount!==1||status!=='PASS'||obs.errors.length||bad.length||doc.scrollWidth>doc.clientWidth+2||!persisted||!String(build).includes('wrongbook-v5'))fail('VIEWPORT_FAIL',{name,status,markerCount,build,errors:obs.errors,bad,doc,persisted,result});await page.close();
}
for(const v of viewports)await productViewport(...v);

const V4_STALE=new Set(['chapter one contains 48 source items exactly once','chapter two canonical learning-item count is 50','chapter five remains 60 numbered recall items','chapter five still contains every number 1 through 60']);
const V3_STALE=new Set(['chapter one reproduces exactly 48 numbered recall items','source spread has branch connectors and junction dots','chapter five has exactly 60 numbered recall items','chapter five contains every number 1 through 60']);
async function historical(label,query,allowedStale,wait=1600){
  const page=await browser.newPage({viewport:{width:1440,height:900}}),obs=watch(page);await page.goto(LOCAL+query,{waitUntil:'domcontentloaded',timeout:20000});await page.waitForSelector('#e2e-results',{timeout:45000});await page.waitForTimeout(wait);
  const marker=page.locator('#e2e-results'),markerCount=await marker.count(),rawStatus=await marker.first().getAttribute('data-status'),result=JSON.parse(await marker.first().textContent());
  const earth=await page.evaluate(()=>({source:window.v8EarthSourceIntegrity?.(),semantic:window.v5StrictAcceptanceReport?.()||window.v5SemanticValidate?.()}));const fails=(result.results||[]).filter(x=>!x.ok),unexpected=fails.filter(x=>!allowedStale.has(x.name)),stale=fails.filter(x=>allowedStale.has(x.name));
  const source=earth.source,structural=Boolean(source?.ok&&source.expectedQuestions===276&&source.canonicalQuestionCount===276&&source.uniqueQuestionCount===276&&source.registeredQuestionCount===276&&source.registeredUniqueQuestionCount===276&&source.missingQuestionIds?.length===0&&source.duplicateQuestionIds?.length===0&&source.orphanQuestionIds?.length===0&&source.expectedFigures===56&&source.actualFigures===56&&source.missingFigures?.length===0&&source.orphanFigures?.length===0&&source.ch5OrderOk&&earth.semantic?.ok);
  const normalizedPass=markerCount===1&&unexpected.length===0&&structural&&obs.errors.length===0&&cleanNetwork(obs.badResponses).length===0;
  await hideMarker(page,'#e2e-results');await page.screenshot({path:`${OUT}/${label}.png`,fullPage:true});fs.writeFileSync(`${OUT}/${label}.json`,JSON.stringify({rawStatus,normalizedPass,markerCount,result,staleSuperseded:stale.map(x=>x.name),unexpected:unexpected.map(x=>x.name),earth,errors:obs.errors,badNetwork:cleanNetwork(obs.badResponses)},null,2));
  if(!normalizedPass)fail(`${label.toUpperCase()}_FAIL`,{rawStatus,markerCount,stale:stale.map(x=>x.name),unexpected:unexpected.map(x=>x.name),structural,errors:obs.errors,bad:cleanNetwork(obs.badResponses),earth});await page.close();
}
await historical('legacy-v4','?e2e=1',V4_STALE,5500);await historical('legacy-v3','?e2ev3=1',V3_STALE,5200);

async function exactSuite(label,query,wait=1800){const page=await browser.newPage({viewport:{width:1440,height:900}}),obs=watch(page);await page.goto(LOCAL+query,{waitUntil:'domcontentloaded',timeout:20000});await page.waitForSelector('#e2e-results',{timeout:45000});await page.waitForTimeout(wait);const marker=page.locator('#e2e-results'),count=await marker.count(),status=await marker.first().getAttribute('data-status'),result=JSON.parse(await marker.first().textContent()),bad=cleanNetwork(obs.badResponses);await hideMarker(page,'#e2e-results');await page.screenshot({path:`${OUT}/${label}.png`,fullPage:true});fs.writeFileSync(`${OUT}/${label}.json`,JSON.stringify({status,count,result,errors:obs.errors,bad},null,2));if(count!==1||status!=='PASS'||obs.errors.length||bad.length)fail(`${label.toUpperCase()}_FAIL`,{status,count,result,errors:obs.errors,bad});await page.close()}
await exactSuite('source-trace-v6','?sourcee2e=1');await exactSuite('source-refinement-v7','?refinee2e=1');

async function backendQa(){
  const key='sb_publishable_Nt8ik0KBWLdi8hucG9oDRQ_cnMyQ9Gx',root='https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1',out={health:{},errors:{},valid:{},providerSkipped:!RUN_PROVIDER};
  for(const [slug,expect] of [['wrongbook-ai','v3-learning-objects-regions'],['wrongbook-sheet-ai','2-learning-objects-regions'],['wrongbook-guide-ai','guide-v2-staged']]){const r=await fetch(`${root}/${slug}${slug==='wrongbook-ai'?'/health':''}`),j=await r.json();out.health[slug]={status:r.status,body:j};if(!r.ok||!JSON.stringify(j).includes(expect))fail('HEALTH_FAIL',{slug,j})}
  const u=await fetch(`${root}/wrongbook-guide-ai`,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});out.errors.unauthorized={status:u.status,body:await u.json()};if(u.status!==401)fail('AUTH_FAIL',out.errors.unauthorized);
  const ma=await fetch(`${root}/wrongbook-ai/analyze`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:'{}'});out.errors.missingAnalyze={status:ma.status,body:await ma.json()};if(ma.status!==400)fail('ANALYZE_400_FAIL',out.errors.missingAnalyze);
  const mg=await fetch(`${root}/wrongbook-guide-ai`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify({mode:'instructive'})});out.errors.missingGuide={status:mg.status,body:await mg.json()};if(mg.status!==400)fail('GUIDE_400_FAIL',out.errors.missingGuide);
  if(!RUN_PROVIDER){fs.writeFileSync(`${OUT}/backend.json`,JSON.stringify(out,null,2));return}
  async function htmlImage(html,w=900,h=650){const p=await browser.newPage({viewport:{width:w,height:h}});await p.setContent(`<html><body style="font-family:Arial,'PingFang TC',sans-serif;padding:48px;font-size:25px;line-height:1.5;color:#111">${html}</body></html>`);const b=await p.screenshot({type:'png'});await p.close();return b.toString('base64')}
  async function call(label,url,body){let last;for(let i=0;i<3;i++){const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify(body)}),j=await r.json();last={status:r.status,body:j};if(r.ok){out.valid[label]=last;return{r,j}}const s=JSON.stringify(j);if(!/RESOURCE_EXHAUSTED|quota|429/i.test(s))break;await new Promise(res=>setTimeout(res,8000*(i+1)))}out.valid[label]=last;return{r:{ok:false,status:last?.status},j:last?.body}}
  const banned=/這題|上述|上圖|下圖|圖中|本題|選項/;
  const genericImage=await htmlImage('<b>生物問答題</b><p>粒線體的主要功能是什麼？</p><p style="color:#2233aa">學生作答：進行細胞呼吸並產生 ATP。</p>');const generic=await call('generic_fact',`${root}/wrongbook-ai/analyze`,{imageBase64:genericImage,mimeType:'image/png',syllabus:{level:'高中'}}),gr=generic.j?.result,gf=gr?.genericFacts||[];if(!generic.r.ok||gr?.learningObjectType!=='generic_fact'||!gf.length||gf.some(x=>!x.standalone||!x.question||!x.answer||banned.test(x.question)||!x.sourceEvidence)||!gr?.concepts?.length)fail('GENERIC_BACKEND_FAIL',generic.j);
  const depImage=await htmlImage('<b>數學圖形題</b><p>完全依下圖資訊回答：A 點的 y 座標是多少？離開此圖無法知道數值。</p><svg width="650" height="300"><line x1="60" y1="250" x2="610" y2="250" stroke="black" stroke-width="3"/><line x1="90" y1="275" x2="90" y2="25" stroke="black" stroke-width="3"/><polyline points="90,230 220,170 360,90 560,140" fill="none" stroke="#222" stroke-width="5"/><circle cx="360" cy="90" r="9"/><text x="375" y="85" font-size="28">A</text></svg><p style="color:#2233aa">學生作答：7</p>');const dep=await call('problem_dependent',`${root}/wrongbook-ai/analyze`,{imageBase64:depImage,mimeType:'image/png',syllabus:{level:'高中'}}),dr=dep.j?.result;if(!dep.r.ok||dr?.learningObjectType!=='problem_dependent'||(dr?.genericFacts?.length||0)!==0||!dr?.regions?.length||dr.regions.some(x=>!x.bbox||x.bbox.x<0||x.bbox.y<0||x.bbox.x+x.bbox.width>100.01||x.bbox.y+x.bbox.height>100.01))fail('DEPENDENT_BACKEND_FAIL',dep.j);
  const mixedImage=await htmlImage('<b>物理選擇題</b><p>依下方受力情境判斷。物體目前保持靜止。</p><div style="border:3px solid #222;width:240px;height:100px;text-align:center;line-height:100px">方塊</div><p>A. 靜摩擦力一定等於最大靜摩擦力</p><p>B. 靜摩擦力會依維持靜止所需調整</p><p style="color:#2233aa">學生圈選：A</p>');const mix=await call('mixed',`${root}/wrongbook-ai/analyze`,{imageBase64:mixedImage,mimeType:'image/png',syllabus:{level:'高中'}}),mr=mix.j?.result;if(!mix.r.ok||mr?.learningObjectType!=='mixed'||!mr?.genericFacts?.length||!mr?.regions?.length||mr.genericFacts.some(x=>!x.standalone||banned.test(x.question)||!x.sourceEvidence))fail('MIXED_BACKEND_FAIL',mix.j);
  const sheetImage=await htmlImage('<b>整張題目頁</b><p>1. 粒線體的主要功能是什麼？ 學生：產生 ATP</p><hr><p>2. 依右圖判斷 A 點數值。 學生：7</p><svg width="420" height="160"><line x1="20" y1="130" x2="390" y2="30" stroke="black" stroke-width="4"/><circle cx="250" cy="70" r="7"/><text x="265" y="68" font-size="22">A</text></svg>',950,800);const sh=await call('sheet',`${root}/wrongbook-sheet-ai`,{imageBase64:sheetImage,mimeType:'image/png'}),qs=sh.j?.result?.questions;if(!sh.r.ok||!Array.isArray(qs)||qs.length<2||qs.some(q=>!['generic_fact','problem_dependent','mixed'].includes(q.learningObjectType)||!q.crop||q.crop.x<0||q.crop.y<0||q.crop.x+q.crop.width>100.01||q.crop.y+q.crop.height>100.01))fail('SHEET_BACKEND_FAIL',sh.j);
  const base={problemText:'物體在水平面上保持靜止。A 選項說靜摩擦力一定等於最大靜摩擦力。',studentAnswer:['A'],correctAnswer:['B'],subject:'物理',concepts:[{nameZh:'靜摩擦力'}],regions:[{id:'low-handwriting',kind:'student_handwriting',text:'模糊字跡',bbox:{x:20,y:55,width:25,height:8},confidence:.35},{id:'stem',kind:'key_phrase',text:'保持靜止',bbox:{x:20,y:18,width:20,height:7},confidence:.98}]};const gs=await call('guide_start',`${root}/wrongbook-guide-ai`,{...base,mode:'instructive',requestType:'start',question:'請先看我錯在哪裡，再只提示下一步。'}),g=gs.j?.result;if(!gs.r.ok||!g?.diagnosis||g?.mode!=='instructive'||g?.stages?.length!==1||g.stages[0].revealFinalAnswer!==false||g.stages[0].waitForStudent!==true||!g.diagnosis.blindSpot)fail('GUIDE_START_FAIL',gs.j);if((g?.stages?.[0]?.actions||[]).some(a=>a.targetRegionId==='low-handwriting'&&['circle','underline','strike','highlight','fade'].includes(a.kind)))fail('GUIDE_LOW_CONFIDENCE_FAIL',gs.j);
  const ge=await call('guide_evaluate',`${root}/wrongbook-guide-ai`,{...base,imageBase64:mixedImage,mimeType:'image/png',mode:'instructive',requestType:'evaluate',studentAttemptNote:'我新寫了 ΣFₓ=0。',priorStages:g?.stages||[],question:'我寫好了，幫我看。'}),er=ge.j?.result;if(!ge.r.ok||!er?.diagnosis||er?.mode!=='instructive'||er?.stages?.length!==1||er.stages[0].revealFinalAnswer!==false||er.stages[0].waitForStudent!==true)fail('GUIDE_EVALUATE_FAIL',ge.j);
  const gd=await call('guide_direct',`${root}/wrongbook-guide-ai`,{...base,imageBase64:mixedImage,mimeType:'image/png',mode:'direct',requestType:'start',question:'直接給我逐步詳解。'}),dir=gd.j?.result;if(!gd.r.ok||dir?.mode!=='direct'||!dir?.stages?.length||dir.stages.slice(0,-1).some(s=>s.revealFinalAnswer===true)||!dir.stages.some(s=>s.revealFinalAnswer===true))fail('GUIDE_DIRECT_FAIL',gd.j);
  fs.writeFileSync(`${OUT}/backend.json`,JSON.stringify(out,null,2));
}
await backendQa();
await browser.close();if(failed)process.exit(1);
