const { chromium } = require('playwright-core');
const assert = require('assert');

const BASE = process.env.WB_QA_URL || 'http://127.0.0.1:8765/wrongbook-v2/index.html';
const CHROME = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const VERSION = '2026-08-18-root-subject-gathering-v2';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function enterMindmap(page, subject='chemistry') {
  await page.evaluate(subjectId => {
    const s = eval('state');
    s.subject = subjectId;
    s.page = 'mindmap';
    s.mobileMenu = false;
    eval('render')();
  }, subject);
  await page.waitForSelector('#mmSvg g.node.root', { timeout: 15000 });
  await page.waitForSelector('#mmSubjectSelect', { timeout: 15000 });
  await page.waitForFunction(v => window.WrongBookMindmapRootSubjectNav?.version === v, VERSION, { timeout: 15000 });
  const prompt = page.locator('#mmHandednessPrompt');
  if (await prompt.count()) {
    await prompt.locator('[data-mm-hand="right"]').click();
    await page.waitForFunction(() => eval('state').mindMapHandedness === 'right');
  }
  await sleep(1100);
}

async function collapseRoot(page) {
  const root = page.locator('#mmSvg g.node.root');
  await root.waitFor({ state: 'visible' });
  await root.locator('circle').click();
  await page.waitForFunction(() => document.getElementById('mmWrap')?.classList.contains('wbmm-root-overview'), null, { timeout: 7000 });
  await page.waitForFunction(() => {
    const nav = document.getElementById('mmRootSubjectNav');
    return nav && nav.namespaceURI === 'http://www.w3.org/2000/svg' && nav.getAttribute('aria-hidden') === 'false';
  }, null, { timeout: 7000 });
  await sleep(250);
}

async function assertGathering(page, expectedCurrent, viewportWidth) {
  const qa = await page.evaluate(() => window.WrongBookMindmapRootSubjectNav.qa());
  assert.strictEqual(qa.pass, true, `gathering QA failed: ${JSON.stringify(qa)}`);
  assert.strictEqual(qa.collapsed, true, 'visual root must be collapsed into gathering');
  assert.strictEqual(qa.subjectCount, 10, 'expected canonical 10 subjects');
  assert.strictEqual(qa.nodeCount, 10, 'all subjects must render as nodes');
  assert.strictEqual(qa.currentCount, 1, 'exactly one current subject node');
  assert.strictEqual(await page.locator('#mmRootSubjectNav .mm-root-subject-list').count(), 0, 'old pill switcher must not exist');
  assert.strictEqual(await page.locator('#mmRootSubjectNav').evaluate(el => el.namespaceURI), 'http://www.w3.org/2000/svg', 'gathering must live inside SVG canvas');

  const expectedNames = await page.evaluate(() => SUBJECTS.map(subject => subject.name));
  const renderedNames = await page.locator('#mmRootSubjectNav .mm-root-subject-name').allTextContents();
  assert.deepStrictEqual([...renderedNames].sort(), [...expectedNames].sort(), 'subject gathering names must match canonical SUBJECTS');

  const current = page.locator(`#mmRootSubjectNav [data-mm-root-subject="${expectedCurrent}"]`);
  assert.strictEqual(await current.getAttribute('aria-current'), 'true', 'current subject must be emphasized');
  const svgBox = await page.locator('#mmSvg').boundingBox();
  const currentBox = await current.boundingBox();
  assert(svgBox && currentBox, 'SVG and current node must have boxes');
  const svgCenter = { x: svgBox.x + svgBox.width / 2, y: svgBox.y + svgBox.height / 2 + 8 };
  const currentCenter = { x: currentBox.x + currentBox.width / 2, y: currentBox.y + currentBox.height / 2 };
  assert(Math.abs(currentCenter.x - svgCenter.x) < (viewportWidth <= 760 ? 70 : 95), 'current subject must remain near canvas center');
  assert(Math.abs(currentCenter.y - svgCenter.y) < 65, 'current subject must remain near canvas center vertically');

  const nodeBoxes = await page.locator('#mmRootSubjectNav [data-mm-root-subject]').evaluateAll(nodes => nodes.map(node => {
    const r = node.getBoundingClientRect();
    return { id: node.getAttribute('data-mm-root-subject'), x:r.x, y:r.y, width:r.width, height:r.height };
  }));
  assert.strictEqual(nodeBoxes.length, 10);
  for (const box of nodeBoxes) {
    assert(box.width > 4 && box.height > 4, `subject ${box.id} must be visibly rendered`);
    assert(box.x >= svgBox.x - 5 && box.x + box.width <= svgBox.x + svgBox.width + 5, `subject ${box.id} clipped horizontally`);
    assert(box.y >= svgBox.y - 5 && box.y + box.height <= svgBox.y + svgBox.height + 5, `subject ${box.id} clipped vertically`);
    if (box.id !== expectedCurrent) {
      const c = { x: box.x + box.width/2, y: box.y + box.height/2 };
      const distance = Math.hypot(c.x - currentCenter.x, c.y - currentCenter.y);
      assert(distance >= (viewportWidth <= 760 ? 78 : 150), `peer ${box.id} is not an outer node: ${distance}`);
    }
  }

  const labelBoxes = await page.locator('#mmRootSubjectNav .mm-root-subject-name').evaluateAll(nodes => nodes.map(node => {
    const r=node.getBoundingClientRect();
    return { text:node.textContent||'', x:r.x, y:r.y, width:r.width, height:r.height };
  }));
  for (let i=0;i<labelBoxes.length;i++) for (let j=i+1;j<labelBoxes.length;j++) {
    const a=labelBoxes[i],b=labelBoxes[j];
    const iw=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x));
    const ih=Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
    const intersection=iw*ih;
    const minArea=Math.max(1,Math.min(a.width*a.height,b.width*b.height));
    assert(intersection/minArea < .18, `subject labels overlap: ${a.text}/${b.text}`);
  }

  const nodeLayerOpacity = await page.locator('#mmSvg .node-layer').evaluate(el => getComputedStyle(el).opacity);
  assert.strictEqual(Number(nodeLayerOpacity), 0, 'expanded tree nodes must be hidden in subject gathering');
  return qa;
}

async function runDesktop(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const errors=[];
  page.on('pageerror', e => errors.push(`pageerror:${e.message}`));
  page.on('response', r => {
    if (r.status() < 400) return;
    const url=r.url();
    if (r.status()===404 && url.includes('iscanner-highlight-bridge-v3.js')) return;
    errors.push(`http:${r.status()}:${url}`);
  });
  page.on('console', msg => {
    if(msg.type()!=='error')return;
    const text=msg.text();
    if(text.includes('404') && text.includes('Failed to load resource'))return;
    errors.push(`console:${text}`);
  });

  await page.goto(`${BASE}?qa=subject-gathering-desktop`, { waitUntil:'domcontentloaded', timeout:30000 });
  await page.evaluate(() => localStorage.removeItem('wrongbook-v2-state'));
  await page.reload({ waitUntil:'domcontentloaded' });
  await enterMindmap(page,'chemistry');

  assert.strictEqual(await page.locator('#mmRootSubjectNav').count(),1,'subject gathering runtime missing');
  assert.strictEqual(await page.locator('#mmRootSubjectNav').getAttribute('aria-hidden'),'true','gathering should be hidden while tree expanded');
  assert.strictEqual(await page.locator('#mmHandednessSelect').count(),1,'handedness control changed');
  assert.strictEqual(await page.locator('#mmSubjectSelect').count(),1,'subject selector changed');

  await collapseRoot(page);
  const chemistryQA=await assertGathering(page,'chemistry',1280);
  await page.screenshot({path:'/tmp/wrongbook-subject-gathering-chemistry.png',fullPage:false});

  await page.locator('#mmRootSubjectNav [data-mm-root-subject="biology"]').click();
  await page.waitForFunction(() => eval('state').subject==='biology');
  await page.waitForSelector('#mmSvg g.node.root');
  await page.waitForFunction(() => !document.getElementById('mmWrap')?.classList.contains('wbmm-root-overview'));
  await sleep(950);
  assert.strictEqual(await page.locator('#mmRootSubjectNav').getAttribute('aria-hidden'),'true','gathering must hide after opening another subject');
  assert((await page.locator('#mmSvg g.node').count())>1,'selected subject tree must expand');

  await collapseRoot(page);
  const biologyQA=await assertGathering(page,'biology',1280);
  await page.screenshot({path:'/tmp/wrongbook-subject-gathering-biology.png',fullPage:false});

  await page.locator('#mmRootSubjectNav [data-mm-root-subject="biology"]').click();
  await page.waitForFunction(() => !document.getElementById('mmWrap')?.classList.contains('wbmm-root-overview'));
  await sleep(700);
  assert((await page.locator('#mmSvg g.node').count())>1,'current subject node must re-expand its own tree');
  assert.strictEqual(await page.locator('#mmRootSubjectNav').getAttribute('aria-hidden'),'true');
  assert.deepStrictEqual(errors,[],`desktop errors: ${errors.join(' | ')}`);
  await context.close();
  return {chemistryQA,biologyQA};
}

async function runMobile(browser) {
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(`pageerror:${e.message}`));
  page.on('response',r=>{
    if(r.status()<400)return;
    const url=r.url();
    if(r.status()===404&&url.includes('iscanner-highlight-bridge-v3.js'))return;
    errors.push(`http:${r.status()}:${url}`);
  });
  page.on('console',msg=>{
    if(msg.type()!=='error')return;
    const text=msg.text();
    if(text.includes('404')&&text.includes('Failed to load resource'))return;
    errors.push(`console:${text}`);
  });
  await page.goto(`${BASE}?qa=subject-gathering-mobile`,{waitUntil:'domcontentloaded',timeout:30000});
  await page.evaluate(()=>localStorage.removeItem('wrongbook-v2-state'));
  await page.reload({waitUntil:'domcontentloaded'});
  await enterMindmap(page,'chemistry');
  await collapseRoot(page);
  const qa=await assertGathering(page,'chemistry',390);
  await page.screenshot({path:'/tmp/wrongbook-subject-gathering-mobile.png',fullPage:false});
  assert.deepStrictEqual(errors,[],`mobile errors: ${errors.join(' | ')}`);
  await context.close();
  return qa;
}

(async()=>{
  const browser=await chromium.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--disable-gpu']});
  const desktop=await runDesktop(browser);
  const mobile=await runMobile(browser);
  await browser.close();
  console.log(JSON.stringify({pass:true,version:VERSION,desktop,mobile},null,2));
})().catch(err=>{console.error(err.stack||err);process.exit(1)});
