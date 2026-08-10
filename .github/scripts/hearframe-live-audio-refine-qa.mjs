import { webkit } from 'playwright';
import fs from 'node:fs';
const url='https://hearframe-grand-hello-world-v4.onrender.com/ai-refine.html?v=live-speech-qa';
const result={checkedAt:new Date().toISOString(),url,steps:[],consoleErrors:[],hello:null,world:null,pass:false};
async function waitContains(page,selector,text,timeout=30000){
  const started=Date.now();let last='';
  while(Date.now()-started<timeout){last=(await page.locator(selector).innerText()).trim();if(last.includes(text))return last;if(/failed|error|timed out|silent/i.test(last))throw new Error(`${selector}: ${last}`);await page.waitForTimeout(150)}
  throw new Error(`${selector} timed out waiting for ${text}; last=${last}`);
}
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:1194,height:834},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
const page=await context.newPage();
page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text())});
page.on('pageerror',e=>result.consoleErrors.push('pageerror: '+e.message));
try{
  const r=await page.goto(url,{waitUntil:'networkidle',timeout:45000});result.httpStatus=r?.status();
  await waitContains(page,'#corpusStatus','Real corpus loaded',20000);result.steps.push('real-corpus-loaded');
  await page.locator('#testBackend').click();await waitContains(page,'#backendStatus','Connected',30000);result.steps.push('gemini-backend-connected');
  await page.locator('#loadSources').click();await waitContains(page,'#criticStatus','Sources loaded',60000);result.steps.push('speech-sources-loaded');

  await page.locator('#refineHello').click();
  const hs=await waitContains(page,'#criticStatus','HELLO AI proposal applied',150000);
  const hpasses=(await page.locator('#passes').innerText()).trim();
  const htime=(await page.locator('#helloTime').innerText()).trim();
  if(!hpasses.includes('COARSE')||!hpasses.includes('FINE')||!hpasses.includes('MICRO'))throw new Error('HELLO did not complete all 3 refinement passes');
  result.hello={status:hs,time:htime,passes:hpasses};result.steps.push('hello-real-audio-refined');

  await page.locator('#refineWorld').click();
  const ws=await waitContains(page,'#criticStatus','WORLD AI proposal applied',180000);
  const wpasses=(await page.locator('#passes').innerText()).trim();
  const wtime=(await page.locator('#worldTime').innerText()).trim();
  if(!wpasses.includes('COARSE')||!wpasses.includes('FINE')||!wpasses.includes('MICRO'))throw new Error('WORLD did not complete all 3 refinement passes');
  result.world={status:ws,time:wtime,passes:wpasses};result.steps.push('world-real-audio-refined');

  if(result.consoleErrors.length)throw new Error('console errors: '+JSON.stringify(result.consoleErrors));
  result.pass=true;
}catch(e){result.error=String(e?.stack||e)}finally{await browser.close()}
fs.writeFileSync('hearframe-grand-v4/live-audio-refine-qa.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(!result.pass)process.exitCode=1;
