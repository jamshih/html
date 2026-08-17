import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const chrome=process.env.CHROME_BIN||process.env.CHROME||'/usr/bin/google-chrome';
const base=process.env.EARTH_QA_BASE||'http://127.0.0.1:4173/wrongbook-v2/';
const out=process.env.EARTH_QA_OUT||'/tmp/earth-cluster-qa';
const pages=[242,243,244,245,246,247,248,249,250,251,252,253];
const chapterFor=p=>Math.floor((p-242)/2)+1;
await fs.mkdir(out,{recursive:true});

const browser=await puppeteer.launch({
  executablePath:chrome,
  headless:true,
  args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--font-render-hinting=none']
});

const geometry=[];
const mobile=[];
const consoleErrors=[];
try{
  const tab=await browser.newPage();
  await tab.setViewport({width:2400,height:1550,deviceScaleFactor:1});
  tab.on('console',m=>{if(m.type()==='error')consoleErrors.push({type:'console',text:m.text(),url:tab.url()});});
  tab.on('pageerror',e=>consoleErrors.push({type:'pageerror',text:String(e),url:tab.url()}));

  for(const mode of ['recall','learn']){
    for(let chapter=1;chapter<=6;chapter++){
      const url=`${base}?refpreview=1&chapter=${chapter}&mode=${mode}&earthclusterqa=1`;
      await tab.goto(url,{waitUntil:'domcontentloaded',timeout:15000});
      await tab.waitForFunction(()=>Boolean(document.querySelector('[data-v4ref-viewport]')),{timeout:10000});
      await tab.evaluate(async()=>{
        if(document.fonts?.ready)await document.fonts.ready;
        const view=document.querySelector('[data-v4ref-viewport]');
        if(view&&typeof window.v4RefSetScale==='function')window.v4RefSetScale(view,1,{x:0,y:0});
        if(view){view.scrollLeft=0;view.scrollTop=0;}
        document.body.classList.add('earth-cluster-qa-capture');
        await new Promise(r=>setTimeout(r,180));
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      });

      for(const p of pages.filter(x=>chapterFor(x)===chapter)){
        const selector=`[data-strict-page="${p}"],[data-source-owned-page="${p}"],[data-source-trace-page="${p}"]`;
        const handle=await tab.$(selector);
        if(!handle)throw new Error(`page ${p} not found in ${mode}`);
        await handle.screenshot({path:path.join(out,`p${p}-${mode}-current.png`),type:'png'});
        const record=await handle.evaluate((root,{p,mode})=>{
          const rr=root.getBoundingClientRect();
          const rel=r=>({x:+(r.left-rr.left).toFixed(2),y:+(r.top-rr.top).toFixed(2),width:+r.width.toFixed(2),height:+r.height.toFixed(2),right:+(r.right-rr.left).toFixed(2),bottom:+(r.bottom-rr.top).toFixed(2)});
          const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity!==0&&r.width>.25&&r.height>.25};
          const objectSelector='[data-question],[data-source-object],[data-source-figure],[data-source-role],svg,.v6-p247-bottom,.v6-p247-insolation,.v6-p250-air-title,.v6-p250-method,.v6-p250-rh,.v6-p250-branches';
          const objects=[...new Set([...root.querySelectorAll(objectSelector)])].filter(visible).map((el,i)=>({
            id:el.dataset.sourceObject||el.dataset.sourceFigure||el.dataset.question||el.id||`${el.tagName.toLowerCase()}-${i}`,
            role:el.dataset.sourceRole||el.dataset.visualOwner||(/svg/i.test(el.tagName)?'figure':''),
            className:typeof el.className==='string'?el.className:(el.className?.baseVal||''),
            rect:rel(el.getBoundingClientRect()),
            text:(el.matches('[data-question],.v6-p247-bottom,.v6-p250-method,.v6-p250-rh,.v6-p250-air-title')?el.innerText:'').trim().slice(0,260)
          }));
          const questions=[...root.querySelectorAll('[data-question]')].filter(visible).map(el=>({
            n:Number(el.dataset.question),rect:rel(el.getBoundingClientRect()),
            lineRects:(()=>{const range=document.createRange();range.selectNodeContents(el);return [...range.getClientRects()].filter(r=>r.width>.25&&r.height>.25).map(rel)})(),
            text:el.innerText.trim().replace(/\s+/g,' ').slice(0,300)
          }));
          const clusters=[...root.querySelectorAll('[data-source-cluster]')].filter(visible).map(el=>({id:el.dataset.sourceCluster,rect:rel(el.getBoundingClientRect()),children:[...el.querySelectorAll(':scope > [data-source-object],:scope > [data-question],:scope > [data-source-role]')].filter(visible).map(x=>x.dataset.sourceObject||x.dataset.question||x.dataset.sourceRole||x.tagName)}));
          return {page:p,mode,root:{width:+rr.width.toFixed(2),height:+rr.height.toFixed(2)},objects,questions,clusters};
        },{p,mode});
        geometry.push(record);
      }
    }
  }

  // Persist canonical evidence before any later gate so a failing assertion still leaves diagnostics.
  await fs.writeFile(path.join(out,'geometry.json'),JSON.stringify({generatedAt:new Date().toISOString(),geometry,consoleErrors},null,2));

  // Existing E2E suites assume a clean initial app route/state. Run each in a fresh tab and clear
  // storage first so the preceding 12-page visual traversal cannot contaminate chapter/home state.
  async function runGate(name,query){
    const gate=await browser.newPage();
    try{
      await gate.setViewport({width:1600,height:1200,deviceScaleFactor:1});
      await gate.goto(base,{waitUntil:'domcontentloaded',timeout:15000});
      await gate.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
      await gate.goto(`${base}?${query}`,{waitUntil:'domcontentloaded',timeout:15000});
      await gate.waitForSelector('#e2e-results',{timeout:30000});
      const result=await gate.$eval('#e2e-results',el=>({status:el.dataset.status,text:el.textContent||''}));
      await fs.writeFile(path.join(out,`${name}.json`),result.text);
      if(result.status!=='PASS')throw new Error(`${name} failed: ${result.text.slice(0,2000)}`);
    } finally {
      await gate.close();
    }
  }
  await runGate('source-trace-e2e','sourcee2e=1');
  await runGate('source-refinement-e2e','refinee2e=1');

  // Mobile presentation audit. Do not force source scale=1 here: the product itself must fit/scale
  // the fixed source-space composition coherently at a phone viewport in both modes.
  await tab.setViewport({width:390,height:844,deviceScaleFactor:1});
  for(const mode of ['recall','learn']){
    for(let chapter=1;chapter<=6;chapter++){
      const url=`${base}?refpreview=1&chapter=${chapter}&mode=${mode}&earthclusterqa=1`;
      await tab.goto(url,{waitUntil:'domcontentloaded',timeout:15000});
      await tab.waitForFunction(()=>Boolean(document.querySelector('[data-v4ref-viewport]')),{timeout:10000});
      await tab.evaluate(async()=>{if(document.fonts?.ready)await document.fonts.ready;await new Promise(r=>setTimeout(r,180));});
      const state=await tab.evaluate(({chapter,mode})=>{
        const view=document.querySelector('[data-v4ref-viewport]');
        const roots=[...document.querySelectorAll('[data-strict-page],[data-source-owned-page],[data-source-trace-page]')].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return s.display!=='none'&&r.width>1&&r.height>1;});
        const vr=view?.getBoundingClientRect();
        return {
          chapter,mode,viewport:{width:innerWidth,height:innerHeight},
          view:vr?{left:vr.left,top:vr.top,width:vr.width,height:vr.height,scrollWidth:view.scrollWidth,scrollHeight:view.scrollHeight}:null,
          pageCount:roots.length,
          pages:roots.map(el=>{const r=el.getBoundingClientRect();return {page:el.dataset.strictPage||el.dataset.sourceOwnedPage||el.dataset.sourceTracePage,left:r.left,top:r.top,width:r.width,height:r.height};})
        };
      },{chapter,mode});
      if(!state.view||state.pageCount<2)throw new Error(`mobile chapter ${chapter} ${mode}: source pages missing`);
      if(!Number.isFinite(state.view.width)||state.view.width<=0)throw new Error(`mobile chapter ${chapter} ${mode}: invalid viewport geometry`);
      mobile.push(state);
      await tab.screenshot({path:path.join(out,`mobile-ch${chapter}-${mode}.png`),type:'png',fullPage:false});
    }
  }

  await fs.writeFile(path.join(out,'mobile.json'),JSON.stringify({generatedAt:new Date().toISOString(),mobile},null,2));
  if(consoleErrors.length)console.error(`Captured ${consoleErrors.length} browser errors; inspect geometry.json`);
  console.log(`Captured ${geometry.length} canonical renders, ${mobile.length} mobile states, and both source E2E gates to ${out}`);
} finally {
  await browser.close();
}