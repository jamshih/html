import { chromium } from 'playwright';

const ORIGIN=process.env.WB_LIVE_URL||'https://jamshih.github.io/html/wrongbook-v2/';
const stamp=Date.now();
const htmlRes=await fetch(`${ORIGIN}?paperfirstdiag=${stamp}`,{cache:'no-store'});
const html=await htmlRes.text();
const build=html.match(/name="wrongbook-build" content="([^"]+)"/)?.[1]||null;
const runtimeSrc=html.match(/<script src="([^"]*tutor-runtime-guard-v5\.js[^"]*)"/)?.[1]||null;
const cssSrc=html.match(/<link rel="stylesheet" href="([^"]*tutor-stages-v5\.css[^"]*)"/)?.[1]||null;
console.log('LIVE_DIAG_INDEX',JSON.stringify({status:htmlRes.status,build,runtimeSrc,cssSrc}));
if(runtimeSrc){
  const runtimeUrl=new URL(runtimeSrc,ORIGIN).href;
  const r=await fetch(`${runtimeUrl}${runtimeUrl.includes('?')?'&':'?'}diag=${stamp}`,{cache:'no-store'});
  const text=await r.text();
  console.log('LIVE_DIAG_RUNTIME',JSON.stringify({status:r.status,url:runtimeUrl,length:text.length,paperFirst:text.includes('WRONGBOOK_PAPER_FIRST_VERSION'),sidebar:text.includes('pf-sidebar'),today:text.includes('今天，把錯的真的改會')}));
}
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
await page.goto(`${ORIGIN}?paperfirstbrowserdiag=${stamp}`,{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForSelector('#app',{timeout:15000});await page.waitForTimeout(1000);
const state=await page.evaluate(()=>({
  build:document.querySelector('meta[name="wrongbook-build"]')?.content||null,
  runtime:window.WRONGBOOK_PAPER_FIRST_VERSION||null,
  bodyClass:document.body.className,
  sidebarVisible:Boolean(document.querySelector('.sidebar'))&&getComputedStyle(document.querySelector('.sidebar')).display!=='none',
  sidebarText:document.querySelector('.sidebar')?.innerText||null,
  conceptsButtons:document.querySelectorAll('.sidebar [data-page="concepts"]').length,
  mobileMenuButtons:document.querySelectorAll('.mobile-nav [data-action="toggleMenu"]').length,
  homeHasPaperFirst:document.body.innerText.includes('今天，把錯的真的改會'),
  scripts:[...document.scripts].map(s=>s.src).filter(x=>x.includes('paper-first')||x.includes('tutor-runtime-guard'))
}));
console.log('LIVE_DIAG_BROWSER',JSON.stringify({...state,errors},null,2));
await browser.close();
