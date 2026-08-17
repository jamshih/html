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
const consoleErrors=[];
try{
  const tab=await browser.newPage();
  await tab.setViewport({width:2400,height:1550,deviceScaleFactor:1});
  tab.on('console',m=>{if(m.type()==='error')consoleErrors.push({type:'console',text:m.text(),url:tab.url()});});
  tab.on('pageerror',e=>consoleErrors.push({type:'pageerror',text:String(e),url:tab.url()}));

  for(const mode of ['recall','learn']){
    for(let chapter=1;chapter<=6;chapter++){
      const url=`${base}?refpreview=1&chapter=${chapter}&mode=${mode}&earthclusterqa=1`;
      await tab.goto(url,{waitUntil:'networkidle0',timeout:45000});
      await tab.evaluate(async()=>{
        if(document.fonts?.ready)await document.fonts.ready;
        const view=document.querySelector('[data-v4ref-viewport]');
        if(view&&typeof window.v4RefSetScale==='function')window.v4RefSetScale(view,1,{x:0,y:0});
        if(view){view.scrollLeft=0;view.scrollTop=0;}
        document.body.classList.add('earth-cluster-qa-capture');
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

  await fs.writeFile(path.join(out,'geometry.json'),JSON.stringify({generatedAt:new Date().toISOString(),geometry,consoleErrors},null,2));
  if(consoleErrors.length)console.error(`Captured ${consoleErrors.length} browser errors; inspect geometry.json`);
  console.log(`Captured ${geometry.length} Earth page/mode renders to ${out}`);
} finally {
  await browser.close();
}
