const { chromium } = require('playwright-core');
const assert = require('assert');

const URL='https://jamshih.github.io/html/wrongbook-v2/';
const CHROME=process.env.CHROMIUM_PATH||'/usr/bin/chromium';
const VERSION='2026-08-18-root-subject-gathering-v2';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function collectErrors(page,label){
  const errors=[];
  page.on('pageerror',e=>errors.push(`${label} pageerror: ${e.message}`));
  page.on('response',r=>{
    if(r.status()<400)return;
    const u=r.url();
    if(r.status()===404&&u.includes('iscanner-highlight-bridge-v3.js'))return;
    errors.push(`${label} http ${r.status()}: ${u}`);
  });
  page.on('console',msg=>{
    if(msg.type()!=='error')return;
    const text=msg.text();
    if(text.includes('Failed to load resource')&&text.includes('404'))return;
    errors.push(`${label} console: ${text}`);
  });
  return errors;
}

async function enter(page,subject='chemistry'){
  await page.evaluate(subjectId=>{
    const s=eval('state');
    s.page='mindmap';
    s.subject=subjectId;
    s.mobileMenu=false;
    eval('render')();
  },subject);
  await page.waitForSelector('#mmSvg g.node.root',{timeout:15000});
  await page.waitForFunction(v=>window.WrongBookMindmapRootSubjectNav?.version===v,VERSION,{timeout:20000});
  const prompt=page.locator('#mmHandednessPrompt');
  if(await prompt.count()){
    await prompt.locator('[data-mm-hand="right"]').click();
    await page.waitForFunction(()=>eval('state').mindMapHandedness==='right');
  }
  await sleep(1000);
}

async function collapseIntoGathering(page){
  await page.locator('#mmSvg g.node.root circle').click();
  await page.waitForFunction(()=>document.getElementById('mmWrap')?.classList.contains('wbmm-root-overview'),null,{timeout:7000});
  await page.waitForFunction(()=>{
    const n=document.getElementById('mmRootSubjectNav');
    return n?.getAttribute('aria-hidden')==='false'&&n.querySelectorAll('[data-mm-root-subject]').length===10;
  },null,{timeout:7000});
  await sleep(200);
}

async function assertGathering(page,current,viewportWidth){
  const qa=await page.evaluate(()=>window.WrongBookMindmapRootSubjectNav.qa());
  assert(qa.pass&&qa.collapsed&&qa.gatheringVisible,JSON.stringify(qa));
  assert.strictEqual(qa.subjectCount,10);
  assert.strictEqual(qa.nodeCount,10);
  assert.strictEqual(qa.currentCount,1);
  assert.strictEqual(await page.locator('#mmRootSubjectNav .mm-root-subject-list').count(),0,'old pill switcher present');
  assert.strictEqual(await page.locator('#mmRootSubjectNav').evaluate(el=>el.namespaceURI),'http://www.w3.org/2000/svg');
  const currentNode=page.locator(`#mmRootSubjectNav [data-mm-root-subject="${current}"]`);
  assert.strictEqual(await currentNode.getAttribute('aria-current'),'true');
  const hitRows=await page.locator('#mmRootSubjectNav .mm-root-subject-hit').evaluateAll(nodes=>nodes.map(n=>{
    const r=n.getBoundingClientRect();return{w:r.width,h:r.height,p:getComputedStyle(n).pointerEvents};
  }));
  assert.strictEqual(hitRows.length,10);
  hitRows.forEach(row=>{assert(row.w>=70&&row.h>=60);assert.strictEqual(row.p,'all')});
  const labels=await page.locator('#mmRootSubjectNav .mm-root-subject-name').allTextContents();
  const canonical=await page.evaluate(()=>SUBJECTS.map(s=>s.name));
  assert.deepStrictEqual([...labels].sort(),[...canonical].sort());
  const svgBox=await page.locator('#mmSvg').boundingBox();
  const boxes=await page.locator('#mmRootSubjectNav [data-mm-root-subject]').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height,id:n.dataset.mmRootSubject}}));
  assert(svgBox);
  boxes.forEach(b=>{
    assert(b.x>=svgBox.x-5&&b.x+b.w<=svgBox.x+svgBox.width+5,`${b.id} horizontal clipping`);
    assert(b.y>=svgBox.y-5&&b.y+b.h<=svgBox.y+svgBox.height+5,`${b.id} vertical clipping`);
  });
  if(viewportWidth<=760){
    const control=await page.locator('#mmHandednessSelect').boundingBox();
    assert(control&&control.x>=0&&control.x+control.width<=viewportWidth,'handedness selector clipped');
  }
  return qa;
}

(async()=>{
  const browser=await chromium.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--disable-gpu']});

  const desktopContext=await browser.newContext({viewport:{width:1280,height:900}});
  const desktop=await desktopContext.newPage();
  const desktopErrors=collectErrors(desktop,'desktop');
  await desktop.goto(`${URL}?liveqa=subject-gathering-v2-${Date.now()}`,{waitUntil:'domcontentloaded',timeout:40000});
  await desktop.evaluate(()=>localStorage.removeItem('wrongbook-v2-state'));
  await desktop.reload({waitUntil:'domcontentloaded'});
  await enter(desktop,'chemistry');
  await collapseIntoGathering(desktop);
  const chemistry=await assertGathering(desktop,'chemistry',1280);
  await desktop.screenshot({path:'/tmp/wrongbook-subject-gathering-live-chemistry.png',fullPage:false});
  await desktop.locator('#mmRootSubjectNav [data-mm-root-subject="biology"] .mm-root-subject-hit').click();
  await desktop.waitForFunction(()=>eval('state').subject==='biology');
  await desktop.waitForFunction(()=>!document.getElementById('mmWrap')?.classList.contains('wbmm-root-overview'));
  await desktop.waitForSelector('#mmSvg g.node.root');
  await sleep(800);
  assert((await desktop.locator('#mmSvg g.node').count())>1,'Biology tree did not expand');
  await collapseIntoGathering(desktop);
  const biology=await assertGathering(desktop,'biology',1280);
  await desktop.locator('#mmRootSubjectNav [data-mm-root-subject="biology"] .mm-root-subject-hit').click();
  await desktop.waitForFunction(()=>!document.getElementById('mmWrap')?.classList.contains('wbmm-root-overview'));
  assert.deepStrictEqual(desktopErrors,[],desktopErrors.join('\n'));

  const mobileContext=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
  const mobile=await mobileContext.newPage();
  const mobileErrors=collectErrors(mobile,'mobile');
  await mobile.goto(`${URL}?liveqa=subject-gathering-mobile-v2-${Date.now()}`,{waitUntil:'domcontentloaded',timeout:40000});
  await mobile.evaluate(()=>localStorage.removeItem('wrongbook-v2-state'));
  await mobile.reload({waitUntil:'domcontentloaded'});
  await enter(mobile,'chemistry');
  await collapseIntoGathering(mobile);
  const mobileQA=await assertGathering(mobile,'chemistry',390);
  await mobile.screenshot({path:'/tmp/wrongbook-subject-gathering-live-mobile.png',fullPage:false});
  assert.deepStrictEqual(mobileErrors,[],mobileErrors.join('\n'));

  console.log(JSON.stringify({pass:true,version:VERSION,chemistry,biology,mobile:mobileQA,desktopErrors,mobileErrors},null,2));
  await desktopContext.close();
  await mobileContext.close();
  await browser.close();
})().catch(err=>{console.error(err.stack||err);process.exit(1)});
