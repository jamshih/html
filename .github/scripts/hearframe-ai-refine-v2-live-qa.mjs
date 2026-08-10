import { webkit } from 'playwright';
import fs from 'node:fs';
const url='https://hearframe-grand-hello-world-v4.onrender.com/ai-refine-v2.html?v=qa-02e8aa20';
const result={checkedAt:new Date().toISOString(),url,steps:[],consoleErrors:[],director:null,hello:null,world:null,pass:false};
async function waitContains(page,selector,text,timeout=30000){const start=Date.now();let last='';while(Date.now()-start<timeout){last=(await page.locator(selector).innerText()).trim();if(last.includes(text))return last;if(/failed|error|silent|timed out/i.test(last))throw Error(`${selector}: ${last}`);await page.waitForTimeout(150)}throw Error(`${selector} timed out for ${text}; last=${last}`)}
const browser=await webkit.launch({headless:true});
const ctx=await browser.newContext({viewport:{width:1194,height:834},userAgent:'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
const page=await ctx.newPage();page.on('console',m=>{if(m.type()==='error')result.consoleErrors.push(m.text())});page.on('pageerror',e=>result.consoleErrors.push('pageerror: '+e.message));
try{
 const r=await page.goto(url,{waitUntil:'networkidle',timeout:45000});result.httpStatus=r?.status();if(result.httpStatus!==200)throw Error(`HTTP ${result.httpStatus}`);
 await waitContains(page,'#corpusStatus','1635 indexed words',20000);result.steps.push('real-corpus-loaded');
 await page.locator('#testBackend').click();await waitContains(page,'#backendStatus','Connected',30000);result.steps.push('gemini-backend-connected');
 await page.locator('#question').fill('can you say something longer and inspiring');await page.locator('#runDirector').click();const ds=await waitContains(page,'#directorStatus','ANSWER:',90000);result.director=ds;const answer=ds.split('\n')[0].replace(/^ANSWER:\s*/,'');const tokens=(answer.toLowerCase().match(/[a-z0-9']+/g)||[]);if(tokens.length<8)throw Error(`director too short: ${answer}`);result.steps.push('long-director-passed');
 await page.locator('#loadAudio').click();await waitContains(page,'#criticStatus','Audio contexts ready',30000);result.steps.push('same-origin-audio-decoded');
 await page.locator('#refineHello').click();const hs=await waitContains(page,'#criticStatus','HELLO AI proposal applied',150000);const hp=(await page.locator('#passes').innerText()).trim();if(!/COARSE[\s\S]*FINE[\s\S]*MICRO/.test(hp))throw Error('HELLO three-pass trace missing');result.hello={status:hs,time:(await page.locator('#helloTime').innerText()).trim(),passes:hp};result.steps.push('hello-refined');
 await page.locator('#refineWorld').click();const ws=await waitContains(page,'#criticStatus','WORLD AI proposal applied',150000);const wp=(await page.locator('#passes').innerText()).trim();if(!/COARSE[\s\S]*FINE[\s\S]*MICRO/.test(wp))throw Error('WORLD three-pass trace missing');result.world={status:ws,time:(await page.locator('#worldTime').innerText()).trim(),passes:wp};result.steps.push('world-refined');
 if(result.consoleErrors.length)throw Error('console errors '+JSON.stringify(result.consoleErrors));result.pass=true;
}catch(e){result.error=String(e?.stack||e)}finally{await browser.close()}
fs.writeFileSync('hearframe-grand-v4/ai-refine-v2-live-qa.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(!result.pass)process.exitCode=1;
