const { chromium } = require('playwright-core');
const assert = require('assert');

const URL = 'https://jamshih.github.io/html/wrongbook-v2/';
const CHROME = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const allowed404 = 'iscanner-highlight-bridge-v3.js?wb=20260818-1124';

function xFromTransform(raw='') {
  const m = String(raw).match(/translate\(\s*([-+]?\d*\.?\d+)/);
  return Number(m?.[1]);
}

async function enterMindmap(page) {
  await page.evaluate(() => {
    const s = eval('state');
    s.subject = 'biology';
    s.page = 'mindmap';
    s.mobileMenu = false;
    eval('render')();
  });
  await page.waitForSelector('#mmSvg g.node.root', { timeout: 15000 });
  await page.waitForSelector('#mmSubjectSelect', { timeout: 15000 });
  await page.waitForFunction(() => window.WrongBookMindmapHandedLayout?.version === '2026-08-18-handed-layout-v1', null, { timeout: 15000 });
  await sleep(1100);
}

async function assertSide(page, side) {
  const xs = await page.locator('#mmSvg g.node:not(.root)').evaluateAll(nodes => nodes.map(n => {
    const m = (n.getAttribute('transform') || '').match(/translate\(\s*([-+]?\d*\.?\d+)/);
    return Number(m?.[1]);
  }));
  assert(xs.length > 0 && xs.every(Number.isFinite), 'nodes must have Cartesian positions');
  if (side === 'right') assert(xs.every(x => x >= 71), `right layout crossed root: ${xs.join(',')}`);
  else assert(xs.every(x => x <= -71), `left layout crossed root: ${xs.join(',')}`);
}

async function runViewport(browser, viewport, label) {
  const context = await browser.newContext({ viewport, hasTouch: label === 'mobile' });
  const page = await context.newPage();
  const runtimeErrors = [];
  const httpErrors = [];
  page.on('pageerror', e => runtimeErrors.push(e.message));
  page.on('console', msg => { if (msg.type() === 'error' && !msg.text().includes('Failed to load resource')) runtimeErrors.push(msg.text()); });
  page.on('response', response => {
    if (response.status() < 400) return;
    if (response.status() === 404 && response.url().includes(allowed404)) return;
    httpErrors.push(`${response.status()} ${response.url()}`);
  });

  await page.goto(`${URL}?qa=handed-live-${label}&t=${Date.now()}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.evaluate(() => localStorage.removeItem('wrongbook-v2-state'));
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 });
  await enterMindmap(page);

  const prompt = page.locator('#mmHandednessPrompt');
  await prompt.waitFor({ state: 'visible', timeout: 10000 });
  assert((await prompt.textContent()).includes('你是右撇子還是左撇子？'));

  await prompt.locator('[data-mm-hand="right"]').click();
  await page.waitForFunction(() => eval('state').mindMapHandedness === 'right');
  await sleep(900);
  await assertSide(page, 'right');

  if (label === 'desktop') {
    const node = page.locator('#mmSvg g.node.depth1').first();
    const before = await node.getAttribute('transform');
    const count = await page.locator('#mmSvg g.node').count();
    const box = await node.boundingBox();
    assert(box, 'drag node box missing');
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 110, box.y + box.height / 2 + 70, { steps: 8 });
    await page.mouse.up();
    await sleep(250);
    assert.notStrictEqual(await node.getAttribute('transform'), before, 'live node drag did not move');
    assert.strictEqual(await page.locator('#mmSvg g.node').count(), count, 'drag changed tree expansion');
  }

  await page.locator('#mmHandednessSelect').selectOption('left');
  await page.waitForFunction(() => eval('state').mindMapHandedness === 'left');
  await sleep(900);
  await assertSide(page, 'left');

  const controlBox = await page.locator('#mmHandednessSelect').boundingBox();
  assert(controlBox && controlBox.x >= 0 && controlBox.x + controlBox.width <= viewport.width, `${label} handedness control clipped`);
  await page.screenshot({ path: `/tmp/wrongbook-handed-live-${label}.png`, fullPage: false });

  assert.deepStrictEqual(runtimeErrors, [], `${label} runtime errors: ${runtimeErrors.join(' | ')}`);
  assert.deepStrictEqual(httpErrors, [], `${label} unexpected HTTP errors: ${httpErrors.join(' | ')}`);
  const qa = await page.evaluate(() => window.WrongBookMindmapHandedLayout.qa());
  await context.close();
  return { label, qa };
}

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-gpu'] });
  const desktop = await runViewport(browser, { width: 1280, height: 900 }, 'desktop');
  const mobile = await runViewport(browser, { width: 390, height: 844 }, 'mobile');
  await browser.close();
  console.log(JSON.stringify({ pass: true, liveUrl: URL, desktop, mobile }, null, 2));
})().catch(err => { console.error(err.stack || err); process.exit(1); });
