const { chromium } = require('playwright-core');
const assert = require('assert');

const BASE = process.env.WB_QA_URL || 'http://127.0.0.1:8765/index.html';
const CHROME = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function parseTranslate(raw='') {
  const m = String(raw).match(/translate\(\s*([-+]?\d*\.?\d+)[, ]+([-+]?\d*\.?\d+)/);
  return m ? { x: Number(m[1]), y: Number(m[2]) } : null;
}

async function enterMindmap(page, subject='biology') {
  await page.evaluate(subjectId => {
    const s = eval('state');
    s.subject = subjectId;
    s.page = 'mindmap';
    s.mobileMenu = false;
    eval('render')();
  }, subject);
  await page.waitForSelector('#mmSvg g.node.root', { timeout: 12000 });
  await page.waitForSelector('#mmSubjectSelect', { timeout: 12000 });
  await page.waitForFunction(() => Boolean(window.WrongBookMindmapHandedLayout), null, { timeout: 12000 });
  await sleep(1050);
}

async function nodePositions(page) {
  return page.evaluate(() => [...document.querySelectorAll('#mmSvg g.node:not(.root)')].map(node => ({
    cls: node.getAttribute('class') || '',
    transform: node.getAttribute('transform') || '',
    text: node.textContent || ''
  })));
}

async function assertSide(page, side) {
  const rows = await nodePositions(page);
  assert(rows.length > 0, 'expected visible non-root nodes');
  const xs = rows.map(r => {
    const m = r.transform.match(/translate\(\s*([-+]?\d*\.?\d+)/);
    return Number(m?.[1]);
  });
  assert(xs.every(Number.isFinite), 'every node should use Cartesian translate');
  if (side === 'right') assert(xs.every(x => x >= 71), `right-handed nodes crossed root: ${xs.join(',')}`);
  else assert(xs.every(x => x <= -71), `left-handed nodes crossed root: ${xs.join(',')}`);
  return xs;
}

async function dragFirstBranch(page, dx, dy) {
  const node = page.locator('#mmSvg g.node.depth1').first();
  await node.waitFor({ state: 'visible', timeout: 10000 });
  const beforeTransform = await node.getAttribute('transform');
  const beforeClass = await node.getAttribute('class');
  const beforeCount = await page.locator('#mmSvg g.node').count();
  const box = await node.boundingBox();
  assert(box && box.width > 2 && box.height > 2, 'draggable node must have a box');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y + dy, { steps: 8 });
  await page.mouse.up();
  await sleep(300);
  const afterTransform = await node.getAttribute('transform');
  const afterClass = await node.getAttribute('class');
  const afterCount = await page.locator('#mmSvg g.node').count();
  assert.notStrictEqual(afterTransform, beforeTransform, 'node transform should change after drag');
  assert.strictEqual(afterCount, beforeCount, 'drag must not expand/collapse the tree');
  assert.strictEqual(afterClass.includes('collapsed'), beforeClass.includes('collapsed'), 'drag must not toggle collapsed state');
  const offsets = await page.evaluate(() => eval('state').mindMapNodeOffsets);
  assert(offsets && typeof offsets === 'object', 'drag offsets must persist in app state');
  return { beforeTransform, afterTransform };
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const runtimeErrors = [];
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', e => runtimeErrors.push(`pageerror: ${e.message}`));
  page.on('console', msg => { if (msg.type() === 'error') runtimeErrors.push(`console: ${msg.text()}`); });
  await page.goto(`${BASE}?qa=handed-layout-desktop`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.evaluate(() => localStorage.removeItem('wrongbook-v2-state'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await enterMindmap(page, 'biology');

  // First-run prompt and unchanged existing controls.
  const prompt = page.locator('#mmHandednessPrompt');
  await prompt.waitFor({ state: 'visible' });
  assert((await prompt.textContent()).includes('你是右撇子還是左撇子？'), 'first-run handedness question missing');
  assert.strictEqual(await page.locator('#mmSubjectSelect').count(), 1, 'existing subject selector missing');
  assert.strictEqual(await page.locator('#mmDraw').count(), 1, 'existing pen control missing');
  assert.strictEqual(await page.locator('#mmAiCheck').count(), 1, 'existing AI control missing');

  // Right-handed layout.
  await prompt.locator('[data-mm-hand="right"]').click();
  await page.waitForFunction(() => eval('state').mindMapHandedness === 'right');
  await sleep(1100);
  await assertSide(page, 'right');
  const rightQA = await page.evaluate(() => window.WrongBookMindmapHandedLayout.qa());
  assert(rightQA.sidePass && rightQA.side === 'right' && rightQA.controlPresent, JSON.stringify(rightQA));
  await page.screenshot({ path: '/tmp/wrongbook-handed-right.png', fullPage: false });

  // Real mouse drag; click must be suppressed and offsets must persist.
  const dragRight = await dragFirstBranch(page, 125, 92);
  await assertSide(page, 'right');
  const savedRight = await page.evaluate(() => JSON.parse(localStorage.getItem('wrongbook-v2-state') || '{}'));
  assert.strictEqual(savedRight.mindMapHandedness, 'right', 'right-handed preference not saved');
  assert(savedRight.mindMapNodeOffsets?.right?.biology, 'right-handed biology offsets not saved');

  // Reload and ensure preference/offsets survive.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await enterMindmap(page, 'biology');
  assert.strictEqual(await page.locator('#mmHandednessPrompt').count(), 0, 'prompt should not repeat after preference saved');
  assert.strictEqual(await page.locator('#mmHandednessSelect').inputValue(), 'right', 'toolbar preference did not restore');
  await assertSide(page, 'right');

  // Switch to left-handed; all nodes mirror to the left.
  await page.locator('#mmHandednessSelect').selectOption('left');
  await page.waitForFunction(() => eval('state').mindMapHandedness === 'left');
  await sleep(1100);
  await assertSide(page, 'left');
  const leftQA = await page.evaluate(() => window.WrongBookMindmapHandedLayout.qa());
  assert(leftQA.sidePass && leftQA.side === 'left', JSON.stringify(leftQA));
  await page.screenshot({ path: '/tmp/wrongbook-handed-left.png', fullPage: false });

  const dragLeft = await dragFirstBranch(page, 90, -80);
  await assertSide(page, 'left');
  const savedLeft = await page.evaluate(() => JSON.parse(localStorage.getItem('wrongbook-v2-state') || '{}'));
  assert.strictEqual(savedLeft.mindMapHandedness, 'left', 'left-handed preference not saved');
  assert(savedLeft.mindMapNodeOffsets?.left?.biology, 'left-handed biology offsets not saved');

  // Existing root subject navigator must still work.
  await page.locator('#mmSvg g.node.root circle').click();
  await page.waitForFunction(() => document.querySelector('#mmSvg g.node.root')?.classList.contains('collapsed'));
  await page.waitForSelector('#mmRootSubjectNav:not([hidden])', { timeout: 5000 });
  assert.strictEqual(await page.locator('#mmRootSubjectNav [data-mm-root-subject]').count(), 10, 'root subject navigator changed');
  await page.locator('#mmSvg g.node.root circle').click();
  await sleep(800);

  // Existing subject switching remains intact and inherits handedness without sharing offsets.
  await page.locator('#mmSubjectSelect').selectOption('math');
  await page.waitForFunction(() => eval('state').subject === 'math');
  await page.waitForSelector('#mmSvg g.node.root');
  await sleep(1050);
  assert.strictEqual(await page.locator('#mmHandednessSelect').inputValue(), 'left');
  await assertSide(page, 'left');
  assert.strictEqual(await page.locator('#mmDraw').count(), 1, 'pen missing after subject switch');

  // Other pages must not receive handedness UI.
  await page.evaluate(() => { const s = eval('state'); s.page = 'dashboard'; eval('render')(); });
  await sleep(150);
  assert.strictEqual(await page.locator('#mmHandednessPrompt').count(), 0, 'handedness prompt leaked outside mindmap');
  assert.strictEqual(await page.locator('#mmHandednessSelect').count(), 0, 'handedness control leaked outside mindmap');

  // Mobile: same prompt + one-sided layout, no clipping of the control.
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const mobile = await mobileContext.newPage();
  mobile.on('pageerror', e => runtimeErrors.push(`mobile pageerror: ${e.message}`));
  mobile.on('console', msg => { if (msg.type() === 'error') runtimeErrors.push(`mobile console: ${msg.text()}`); });
  await mobile.goto(`${BASE}?qa=handed-layout-mobile`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mobile.evaluate(() => localStorage.removeItem('wrongbook-v2-state'));
  await mobile.reload({ waitUntil: 'domcontentloaded' });
  await enterMindmap(mobile, 'biology');
  await mobile.locator('#mmHandednessPrompt [data-mm-hand="left"]').click();
  await mobile.waitForFunction(() => eval('state').mindMapHandedness === 'left');
  await sleep(1050);
  await assertSide(mobile, 'left');
  const handedBox = await mobile.locator('#mmHandednessSelect').boundingBox();
  assert(handedBox && handedBox.x >= 0 && handedBox.x + handedBox.width <= 390, 'mobile handedness control clipped');
  await mobile.screenshot({ path: '/tmp/wrongbook-handed-mobile.png', fullPage: false });

  assert.deepStrictEqual(runtimeErrors, [], `runtime errors: ${runtimeErrors.join(' | ')}`);
  const result = {
    pass: true,
    rightQA,
    leftQA,
    dragRight,
    dragLeft,
    runtimeErrors,
    productScope: ['mindmap-handed-layout-v1.js', 'mindmap-handed-layout-v1.css', 'mindmap-subject-nav-v1.js']
  };
  console.log(JSON.stringify(result, null, 2));
  await mobileContext.close();
  await context.close();
  await browser.close();
})().catch(err => {
  console.error(err.stack || err);
  process.exit(1);
});
