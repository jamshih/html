import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT='.qa-artifacts/wrongbook-v5';fs.mkdirSync(OUT,{recursive:true});
const viewports=[['desktop',1440,900],['tablet-landscape',1366,1024],['ipad-portrait',1024,1366],['phone',390,844],['small-phone',375,667]];
const browser=await chromium.launch({headless:true});let failed=false;
const local='http://127.0.0.1:8000/wrongbook-v2/';

async function productViewport(name,width,height){
  const page=await browser.newPage({viewport:{width,height}}),errors=[],badResponses=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push('pageerror: '+e.message));page.on('response',r=>{if(r.status()>=400)badResponses.push(`${r.status()} ${r.url()}`)});
  await page.goto(local+'?e2eproduct=1',{waitUntil:'domcontentloaded',timeout:20000});
  await page.waitForSelector('#e2e-product-v5-results',{timeout:25000});
  const status=await page.locator('#e2e-product-v5-results').getAttribute('data-status'),text=await page.locator('#e2e-product-v5-results').textContent(),result=JSON.parse(text);
  await page.screenshot({path:`${OUT}/${name}.png`,fullPage:true});fs.writeFileSync(`${OUT}/${name}.json`,JSON.stringify({status,result,errors,badResponses},null,2));
  const badNetwork=badResponses.filter(x=>!x.includes('favicon'));if(status!=='PASS'||errors.length||badNetwork.length){failed=true;console.error('VIEWPORT_FAIL',name,JSON.stringify({status,errors,badNetwork,result},null,2))}
  await page.close();
}
for(const v of viewports)await productViewport(...v);

// Historical suite: includes Earth source-fidelity and old product regression checks.
{
  const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push('pageerror: '+e.message));
  await page.goto(local+'?e2e=1',{waitUntil:'domcontentloaded',timeout:20000});await page.waitForSelector('#e2e-results',{timeout:30000});await page.waitForTimeout(5000);
  const status=await page.locator('#e2e-results').getAttribute('data-status'),text=await page.locator('#e2e-results').textContent(),result=JSON.parse(text);
  await page.screenshot({path:`${OUT}/legacy.png`,fullPage:true});fs.writeFileSync(`${OUT}/legacy.json`,JSON.stringify({status,result,errors},null,2));
  if(status!=='PASS'||errors.length){failed=true;console.error('LEGACY_FAIL',JSON.stringify({status,errors,result},null,2))}await page.close();
}

// Live backend QA: active versions, auth/client errors, and actual Gemini structured-output calls.
{
  const key='sb_publishable_Nt8ik0KBWLdi8hucG9oDRQ_cnMyQ9Gx',root='https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1',backend={health:{},errors:{},valid:{}};
  for(const [slug,expect] of [['wrongbook-ai','v3-learning-objects-regions'],['wrongbook-sheet-ai','2-learning-objects-regions'],['wrongbook-guide-ai','guide-v2-staged']]){const r=await fetch(`${root}/${slug}${slug==='wrongbook-ai'?'/health':''}`),j=await r.json();backend.health[slug]={status:r.status,body:j};if(!r.ok||!JSON.stringify(j).includes(expect)){failed=true;console.error('HEALTH_FAIL',slug,j)}}
  const unauth=await fetch(`${root}/wrongbook-guide-ai`,{method:'POST',headers:{'content-type':'application/json'},body:'{}'});backend.errors.unauthorized={status:unauth.status,body:await unauth.json()};if(unauth.status!==401)failed=true;
  const missingAi=await fetch(`${root}/wrongbook-ai/analyze`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:'{}'});backend.errors.missingAnalyze={status:missingAi.status,body:await missingAi.json()};if(missingAi.status!==400)failed=true;
  const missingGuide=await fetch(`${root}/wrongbook-guide-ai`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify({mode:'instructive'})});backend.errors.missingGuide={status:missingGuide.status,body:await missingGuide.json()};if(missingGuide.status!==400)failed=true;
  const malformed=await fetch(`${root}/wrongbook-guide-ai`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:'{bad'});backend.errors.malformed={status:malformed.status,body:await malformed.json()};if(malformed.status!==400)failed=true;
  const fixture=await browser.newPage({viewport:{width:900,height:650}});await fixture.setContent(`<html><body style="font-family:sans-serif;padding:55px;font-size:26px"><b>物理選擇題</b><p>物體在水平面上保持靜止。下列敘述何者正確？</p><p>A. 靜摩擦力一定等於最大靜摩擦力</p><p>B. 靜摩擦力會依維持靜止所需調整</p><p style="color:#2233aa">學生作答：A</p></body></html>`);const png=await fixture.screenshot({type:'png'});await fixture.close();const imageBase64=png.toString('base64');
  const analyze=await fetch(`${root}/wrongbook-ai/analyze`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify({imageBase64,mimeType:'image/png',syllabus:{level:'高中'}})}),aj=await analyze.json();backend.valid.analyze={status:analyze.status,body:aj};if(!analyze.ok||!['generic_fact','problem_dependent','mixed'].includes(aj?.result?.learningObjectType)||!Array.isArray(aj?.result?.genericFacts)||!Array.isArray(aj?.result?.regions)){failed=true;console.error('ANALYZE_CONTRACT_FAIL',aj)}
  const sheet=await fetch(`${root}/wrongbook-sheet-ai`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify({imageBase64,mimeType:'image/png'})}),sj=await sheet.json();backend.valid.sheet={status:sheet.status,body:sj};if(!sheet.ok||!Array.isArray(sj?.result?.questions)){failed=true;console.error('SHEET_CONTRACT_FAIL',sj)}
  const guide=await fetch(`${root}/wrongbook-guide-ai`,{method:'POST',headers:{'content-type':'application/json',apikey:key},body:JSON.stringify({problemText:'物體在水平面上保持靜止。A 選項說靜摩擦力一定等於最大靜摩擦力。',studentAnswer:['A'],correctAnswer:['B'],subject:'物理',concepts:[{nameZh:'靜摩擦力'}],mode:'instructive',requestType:'start',question:'請先看我錯在哪裡，再只提示下一步。',regions:[]})}),gj=await guide.json();backend.valid.guide={status:guide.status,body:gj};if(!guide.ok||!gj?.result?.diagnosis||gj?.result?.mode!=='instructive'||gj?.result?.stages?.length!==1||gj.result.stages[0].revealFinalAnswer!==false){failed=true;console.error('GUIDE_CONTRACT_FAIL',gj)}
  fs.writeFileSync(`${OUT}/backend.json`,JSON.stringify(backend,null,2));
}
await browser.close();if(failed)process.exit(1);
