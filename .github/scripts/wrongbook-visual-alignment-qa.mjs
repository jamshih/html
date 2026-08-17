import { chromium } from 'playwright';
import fs from 'node:fs';

const ORIGIN=process.env.WB_LIVE_URL||'https://jamshih.github.io/html/wrongbook-v2/';
const OUT='.qa-artifacts/wrongbook-live';
fs.mkdirSync(OUT,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function waitForVisualPatch(){
  let detail='';
  for(let i=0;i<60;i++){
    try{
      const stamp=Date.now();
      const [guardRes,cssRes]=await Promise.all([
        fetch(new URL(`tw-ui-guard.js?visualdeploy=${stamp}`,ORIGIN),{cache:'no-store'}),
        fetch(new URL(`paper-first-visual-fix-20260817.css?visualdeploy=${stamp}`,ORIGIN),{cache:'no-store'})
      ]);
      const [guard,css]=await Promise.all([guardRes.text(),cssRes.text()]);
      detail=`guard=${guardRes.status}/${guard.includes('paperFirstVisualFix20260817')} css=${cssRes.status}/${css.includes('Sidebar scan CTA')}`;
      if(guardRes.ok&&cssRes.ok&&guard.includes('paperFirstVisualFix20260817')&&css.includes('Sidebar scan CTA'))return;
    }catch(e){detail=String(e)}
    if(i===59)throw new Error(`Visual patch not deployed: ${detail}`);
    await sleep(5000);
  }
}

async function loadRendered(page){
  await page.goto(`${ORIGIN}?visualqa=${Date.now()}`,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#app',{timeout:15000});
  await page.waitForFunction(()=>{
    const link=document.getElementById('paperFirstVisualFix20260817');
    if(!link)return false;
    return [...document.styleSheets].some(s=>String(s.href||'').includes('paper-first-visual-fix-20260817.css'));
  },{timeout:15000});
  await page.waitForTimeout(700);
}

const centerY=b=>b?b.y+b.height/2:null;

await waitForVisualPatch();
const browser=await chromium.launch({headless:true});
const results={desktop:{},phone:{}};
let failed=false;
const fail=(tag,value)=>{failed=true;console.error(tag,JSON.stringify(value,null,2))};

{
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});
  const page=await context.newPage();
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
  await loadRendered(page);
  const button=page.locator('.pf-sidebar .capture-btn').first();
  const icon=button.locator('svg').first();
  const label=button.locator('span').first();
  const [bb,ib,lb]=await Promise.all([button.boundingBox(),icon.boundingBox(),label.boundingBox()]);
  const display=await button.evaluate(el=>getComputedStyle(el).display).catch(()=>null);
  const alignItems=await button.evaluate(el=>getComputedStyle(el).alignItems).catch(()=>null);
  const iconLabelCenterDelta=(ib&&lb)?Math.abs(centerY(ib)-centerY(lb)):999;
  results.desktop={
    stylesheet:await page.locator('#paperFirstVisualFix20260817').count()===1,
    buttonVisible:await button.isVisible().catch(()=>false),
    display,alignItems,
    buttonBox:bb,iconBox:ib,labelBox:lb,
    iconLabelCenterDelta,
    aligned:display==='flex'&&alignItems==='center'&&iconLabelCenterDelta<=1,
    saneHeight:Boolean(bb&&bb.height>=40&&bb.height<=48),
    noOverflow:await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2),
    errors
  };
  await page.screenshot({path:`${OUT}/visual-desktop.png`,fullPage:false});
  if(await button.isVisible().catch(()=>false))await button.screenshot({path:`${OUT}/sidebar-scan-cta.png`});
  if(!results.desktop.stylesheet||!results.desktop.buttonVisible||!results.desktop.aligned||!results.desktop.saneHeight||!results.desktop.noOverflow||errors.length)fail('VISUAL_DESKTOP',results.desktop);
  await context.close();
}

{
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
  const page=await context.newPage();
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`));
  await loadRendered(page);
  const nav=page.locator('.pf-mobile-nav');
  const buttons=nav.locator(':scope > button');
  const boxes=[];
  for(let i=0;i<await buttons.count();i++)boxes.push(await buttons.nth(i).boundingBox());
  const scan=nav.locator('.capture-mobile').first();
  const scanBox=await scan.boundingBox();
  const peers=boxes.filter(Boolean);
  const centerYs=peers.map(centerY);
  const spread=centerYs.length?Math.max(...centerYs)-Math.min(...centerYs):999;
  const heights=peers.map(b=>b.height);
  const heightSpread=heights.length?Math.max(...heights)-Math.min(...heights):999;
  results.phone={
    navVisible:await nav.isVisible().catch(()=>false),
    scanVisible:await scan.isVisible().catch(()=>false),
    equalBaseline:spread<=1,
    equalHeight:heightSpread<=1,
    centerSpread:spread,heightSpread,
    scanBox,
    navBox:await nav.boundingBox(),
    noOverflow:await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+2),
    errors
  };
  await page.screenshot({path:`${OUT}/visual-phone.png`,fullPage:false});
  if(!results.phone.navVisible||!results.phone.scanVisible||!results.phone.equalBaseline||!results.phone.equalHeight||!results.phone.noOverflow||errors.length)fail('VISUAL_PHONE',results.phone);
  await context.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/visual-alignment.json`,JSON.stringify(results,null,2));
if(failed)process.exit(1);
