import { chromium, webkit } from 'playwright';
import fs from 'node:fs';

const base = 'https://hearframe-grand-hello-world-v4.onrender.com';
const expectedMarker = 'v4.4 LIVE QA';
const routes = ['/', '/seamless/'];
const results = { checkedAt: new Date().toISOString(), expectedMarker, base, routes: {}, overall: 'pending' };

async function waitForDeploy(route) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const url = `${base}${route}?qa=${Date.now()}`;
  let lastTitle = '';
  try {
    for (let i = 0; i < 60; i++) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        lastTitle = await page.title();
        const body = await page.locator('body').innerText().catch(() => '');
        if (lastTitle.includes(expectedMarker) || body.includes(expectedMarker)) return;
      } catch {}
      await page.waitForTimeout(5000);
    }
    throw new Error(`Render never exposed marker ${expectedMarker}; last title=${lastTitle}`);
  } finally {
    await browser.close();
  }
}

async function waitForStatus(page, goodNeedle, timeout = 45000) {
  const started = Date.now();
  let last = '';
  while (Date.now() - started < timeout) {
    last = (await page.locator('#status').innerText()).trim();
    if (last.includes(goodNeedle)) return last;
    if (/timed out|failed|error|not supported|could not|seek landed/i.test(last)) throw new Error(`status failure: ${last}`);
    await page.waitForTimeout(250);
  }
  throw new Error(`status timeout waiting for ${goodNeedle}; last=${last}`);
}

async function runFlow(browserType, route) {
  const isWebkit = browserType === webkit;
  const browser = await browserType.launch({ headless: true });
  const context = await browser.newContext(isWebkit ? {
    viewport: { width: 1194, height: 834 },
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
  } : { viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => consoleErrors.push(`pageerror: ${err.message}`));
  const url = `${base}${route}?qa=${Date.now()}`;
  const record = { url, browser: isWebkit ? 'webkit-ipad' : 'chromium', steps: [], consoleErrors };
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    record.httpStatus = response?.status() ?? null;
    record.title = await page.title();
    if (!record.title.includes(expectedMarker)) throw new Error(`wrong deployed title: ${record.title}`);
    record.steps.push('page-loaded');

    await page.locator('#prepare').click();
    record.prepareStatus = await waitForStatus(page, 'Prepared.', 70000);
    record.steps.push('prepare-pass');

    await page.locator('#helloOnly').click();
    record.helloStatus = await waitForStatus(page, 'HELLO clip complete.', 20000);
    record.steps.push('hello-pass');

    await page.locator('#worldOnly').click();
    record.worldStatus = await waitForStatus(page, 'WORLD clip complete.', 20000);
    record.steps.push('world-pass');

    await page.locator('#grand').click();
    record.grandStatus = await waitForStatus(page, 'Patched Hello World complete', 25000);
    record.steps.push('grand-pass');

    record.finalStatus = (await page.locator('#status').innerText()).trim();
    record.pass = true;
  } catch (err) {
    record.pass = false;
    record.error = String(err?.stack || err);
    record.finalStatus = await page.locator('#status').innerText().catch(() => 'unavailable');
  } finally {
    await browser.close();
  }
  return record;
}

let failed = false;
try {
  for (const route of routes) await waitForDeploy(route);
  for (const route of routes) {
    results.routes[route] = {};
    for (const [name, type] of [['chromium', chromium], ['webkit-ipad', webkit]]) {
      const r = await runFlow(type, route);
      results.routes[route][name] = r;
      if (!r.pass) failed = true;
    }
  }
} catch (err) {
  failed = true;
  results.harnessError = String(err?.stack || err);
}
results.overall = failed ? 'fail' : 'pass';
fs.writeFileSync('hearframe-grand-v4/live-qa.json', JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (failed) process.exitCode = 1;
