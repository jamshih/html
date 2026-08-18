const { chromium }=require('playwright-core');
const assert=require('assert');
const BASE=process.env.WB_QA_URL||'http://127.0.0.1:8765/wrongbook-v2/index.html';
const CHROME=process.env.CHROMIUM_PATH||'/usr/bin/chromium';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const center=b=>({x:b.x+b.width/2,y:b.y+b.height/2});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
async function visible(page,selector){const all=page.locator(selector),out=[];for(let i=0,n=await all.count();i<n;i++)if(await all.nth(i).isVisible())out.push(all.nth(i));return out}
async function snap(page,node){return node.evaluate(n=>{const r=n.getBoundingClientRect(),world=document.querySelector('#mmSvg > g:not(#mmRootSubjectNav)');return{screen:{x:r.x+r.width/2,y:r.y+r.height/2},nodeTransform:n.getAttribute('transform'),worldTransform:world?.getAttribute('transform')||'',zoom:document.getElementById('mmSvg')?.__zoom?.toString?.()||'',key:(n.__data__?.ancestors?.()||[]).reverse().map(a=>String(a?.data?.name||'')).join(' › '),offsets:JSON.parse(JSON.stringify(window.state?.mindMapNodeOffsets||{})),suppress:document.getElementById('mmSvg')?.dataset.mmSuppressClickUntil||''}})}
(async()=>{
 const browser=await chromium.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--disable-gpu']});
 const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();
 await page.goto(`${BASE}?diag=${Date.now()}`,{waitUntil:'domcontentloaded',timeout:35000});await page.evaluate(()=>localStorage.removeItem('wrongbook-v2-state'));await page.reload({waitUntil:'domcontentloaded'});
 await page.evaluate(()=>{const s=eval('state');s.page='mindmap';s.subject='chemistry';s.mobileMenu=false;s.mindMapHandedness='right';s.mindMapNodeOffsets={right:{},left:{}};eval('render')()});
 await page.waitForFunction(()=>window.WrongBookMindmapHandedLayout?.version==='2026-08-18-handed-layout-v2',{timeout:20000});await sleep(1400);
 const expandable=await visible(page,'#mmSvg g.node.has-children:not(.root)');assert(expandable.length);await expandable[0].locator(':scope > .mm-node-drag-hit').click();await sleep(1450);
 const nodes=await visible(page,'#mmSvg g.node:not(.root)');assert(nodes.length>=2);const target=nodes[nodes.length-1],sibling=nodes[0];
 const beforeT=await snap(page,target),beforeS=await snap(page,sibling);const hit=await target.locator(':scope > .mm-node-drag-hit').boundingBox();assert(hit);const p=center(hit);
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+125,p.y+78,{steps:12});await page.mouse.up();await sleep(620);
 const afterT=await snap(page,target),afterS=await snap(page,sibling);
 const result={targetDelta:dist(beforeT.screen,afterT.screen),siblingDelta:dist(beforeS.screen,afterS.screen),beforeT,afterT,beforeS,afterS};
 console.log(JSON.stringify(result,null,2));
 await browser.close();
 if(result.siblingDelta>=3)process.exit(2);
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
