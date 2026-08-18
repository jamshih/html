const { chromium } = require('playwright-core');
const assert = require('assert');

const BASE=process.env.WB_QA_URL||'http://127.0.0.1:8765/wrongbook-v2/index.html';
const CHROME=process.env.CHROMIUM_PATH||'/usr/bin/chromium';
const V={geometry:'2026-08-18-radial-readable-labels-v7',subject:'2026-08-18-mindmap-subject-nav-v4',root:'2026-08-18-root-subject-gathering-v3',drag:'2026-08-18-handed-layout-v2'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const center=b=>({x:b.x+b.width/2,y:b.y+b.height/2});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

function errorsFor(page,label){
  const errors=[];
  page.on('pageerror',e=>errors.push(`${label}:pageerror:${e.message}`));
  page.on('response',r=>{
    if(r.status()<400)return;
    const u=r.url();
    if(r.status()===404&&(u.includes('iscanner-highlight-bridge-v3.js')||u.endsWith('/favicon.ico')))return;
    errors.push(`${label}:http:${r.status()}:${u}`);
  });
  page.on('console',msg=>{
    if(msg.type()!=='error')return;
    const text=msg.text();
    if(text.includes('Failed to load resource')&&text.includes('404'))return;
    errors.push(`${label}:console:${text}`);
  });
  return errors;
}

async function enter(page,subject='chemistry'){
  await page.evaluate(subjectId=>{
    const s=eval('state');
    s.page='mindmap';s.subject=subjectId;s.mobileMenu=false;s.mindMapHandedness='right';
    s.mindMapNodeOffsets={right:{},left:{}};
    eval('render')();
  },subject);
  await page.waitForSelector('#mmSvg g.node.root',{timeout:15000});
  await page.waitForFunction(v=>window.WrongBookMindmapGeometryFix?.version===v.geometry&&window.WrongBookMindmapSubjectNav?.version===v.subject&&window.WrongBookMindmapRootSubjectNav?.version===v.root&&window.WrongBookMindmapHandedLayout?.version===v.drag,V,{timeout:20000});
  await sleep(1250);
  const qa=await page.evaluate(()=>({drag:window.WrongBookMindmapHandedLayout.qa(),subject:window.WrongBookMindmapSubjectNav.qa(),root:window.WrongBookMindmapRootSubjectNav.qa(),geometry:window.WrongBookMindmapGeometryFix}));
  assert.strictEqual(qa.drag.pass,true,JSON.stringify(qa.drag));
  assert.strictEqual(qa.drag.rootDraggable,true);
  assert.strictEqual(qa.drag.draggableCount,qa.drag.nodeCount);
  assert.strictEqual(qa.drag.hitTargetCount,qa.drag.nodeCount);
  assert.strictEqual(qa.drag.freeDrag,true);
  assert.strictEqual(qa.drag.singleNodeDrag,true);
  assert.strictEqual(qa.drag.viewportStableOnNodeClick,true);
  assert.strictEqual(qa.drag.touchDragUsesLocalCoordinates,true);
  assert.strictEqual(qa.subject.pass,true,JSON.stringify(qa.subject));
  assert.strictEqual(qa.geometry.ownsNodeTransforms,false);
  return qa;
}

async function nodeState(page,selector){
  return page.locator(selector).evaluate(node=>({
    transform:node.getAttribute('transform'),
    className:node.getAttribute('class'),
    key:(node.__data__?.ancestors?.()||[]).reverse().map(a=>String(a?.data?.name||'')).join(' › '),
    childCount:Array.isArray(node.__data__?.children)?node.__data__.children.length:0,
    hiddenChildCount:Array.isArray(node.__data__?._children)?node.__data__._children.length:0
  }));
}

async function worldTransform(page){return page.locator('#mmSvg > g').getAttribute('transform')}

async function mouseDrag(page,selector,dx,dy,steps=10){
  const hit=page.locator(`${selector} > .mm-node-drag-hit`);
  const box=await hit.boundingBox();assert(box,`missing drag hit ${selector}`);
  const p=center(box);
  await page.mouse.move(p.x,p.y);
  await page.mouse.down();
  await page.mouse.move(p.x+dx,p.y+dy,{steps});
  await page.mouse.up();
  await sleep(150);
}

async function touchDrag(page,selector,dx,dy){
  const hit=page.locator(`${selector} > .mm-node-drag-hit`);
  const box=await hit.boundingBox();assert(box,`missing touch hit ${selector}`);
  const p=center(box),cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y,id:1,radiusX:4,radiusY:4,force:1}]});
  for(let i=1;i<=8;i++){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+dx*i/8,y:p.y+dy*i/8,id:1,radiusX:4,radiusY:4,force:1}]});
    await sleep(18);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await sleep(220);
}

async function clickStability(page){
  const candidate=page.locator('#mmSvg g.node.has-children:not(.root)').first();
  await candidate.waitFor({state:'visible'});
  const beforeWorld=await worldTransform(page),before=await nodeState(page,'#mmSvg g.node.has-children:not(.root)');
  await candidate.locator(':scope > .mm-node-drag-hit').click();
  await sleep(90);
  const afterEarlyWorld=await worldTransform(page),early=await nodeState(page,'#mmSvg g.node.has-children:not(.root)');
  await sleep(1250);
  const afterLateWorld=await worldTransform(page),late=await nodeState(page,'#mmSvg g.node.has-children:not(.root)');
  assert.strictEqual(afterEarlyWorld,beforeWorld,'ordinary node click changed viewport immediately');
  assert.strictEqual(afterLateWorld,beforeWorld,'late focus/recenter changed viewport after node click');
  assert.strictEqual(late.transform,early.transform,'node position jumped after click settled');
  assert.notStrictEqual(late.className,before.className,'node expand/collapse class did not change');
}

async function singleNodeDrag(page){
  const nodes=page.locator('#mmSvg g.node:not(.root)');
  assert((await nodes.count())>=3,'need several visible nodes');
  const target=nodes.nth((await nodes.count())-1),targetSelector=`#mmSvg g.node:not(.root):nth-of-type(${await nodes.count()})`;
  const targetKey=await target.evaluate(n=>(n.__data__?.ancestors?.()||[]).reverse().map(a=>String(a?.data?.name||'')).join(' › '));
  const sibling=nodes.first();
  const beforeTarget=center(await target.boundingBox()),beforeSibling=center(await sibling.boundingBox());
  const beforeChildState=await target.evaluate(n=>({children:Array.isArray(n.__data__?.children)?n.__data__.children.length:0,hidden:Array.isArray(n.__data__?._children)?n.__data__._children.length:0}));
  const linkBefore=await page.locator('#mmSvg .link-layer path.link').evaluateAll((paths,key)=>{const p=paths.find(path=>{const d=path.__data__?.target;const k=(d?.ancestors?.()||[]).reverse().map(a=>String(a?.data?.name||'')).join(' › ');return k===key});return p?.getAttribute('d')||''},targetKey);
  const box=await target.locator(':scope > .mm-node-drag-hit').boundingBox();assert(box);const p=center(box);
  await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+125,p.y+78,{steps:12});await page.mouse.up();await sleep(700);
  const afterTarget=center(await target.boundingBox()),afterSibling=center(await sibling.boundingBox());
  assert(distance(beforeTarget,afterTarget)>70,'dragged node did not move meaningfully');
  assert(distance(beforeSibling,afterSibling)<3,'dragging one node moved a sibling');
  const afterChildState=await target.evaluate(n=>({children:Array.isArray(n.__data__?.children)?n.__data__.children.length:0,hidden:Array.isArray(n.__data__?._children)?n.__data__._children.length:0}));
  assert.deepStrictEqual(afterChildState,beforeChildState,'drag release toggled node expansion');
  const linkAfter=await page.locator('#mmSvg .link-layer path.link').evaluateAll((paths,key)=>{const p=paths.find(path=>{const d=path.__data__?.target;const k=(d?.ancestors?.()||[]).reverse().map(a=>String(a?.data?.name||'')).join(' › ');return k===key});return p?.getAttribute('d')||''},targetKey);
  if(linkBefore)assert.notStrictEqual(linkAfter,linkBefore,'link path did not update during node drag');
  return target;
}

async function parentOnlyDrag(page){
  const parent=page.locator('#mmSvg g.node.has-children:not(.root)').filter({has:page.locator(':scope')}).first();
  await parent.waitFor({state:'visible'});
  const child=page.locator('#mmSvg g.node').evaluateHandle((nodes,parentKey)=>{
    const p=[...nodes].find(n=>(n.__data__?.ancestors?.()||[]).reverse().map(a=>String(a?.data?.name||'')).join(' › ')===parentKey);
    const d=p?.__data__?.children?.[0];
    return d?[...nodes].find(n=>n.__data__===d)||null:null;
  },await parent.evaluate(n=>(n.__data__?.ancestors?.()||[]).reverse().map(a=>String(a?.data?.name||'')).join(' › ')));
  const childEl=child.asElement();
  if(!childEl){return {skipped:true}}
  const beforeParent=center(await parent.boundingBox());
  const beforeChild=await childEl.boundingBox();assert(beforeChild);
  const hit=await parent.locator(':scope > .mm-node-drag-hit').boundingBox();assert(hit);const p=center(hit);
  await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+95,p.y-65,{steps:10});await page.mouse.up();await sleep(600);
  const afterParent=center(await parent.boundingBox());
  const afterChildBox=await childEl.boundingBox();assert(afterChildBox);
  assert(distance(beforeParent,afterParent)>55,'parent did not move');
  assert(distance(center(beforeChild),center(afterChildBox))<4,'dragging parent moved descendant; should be single-node drag');
  return {skipped:false};
}

async function crossCenter(page){
  const svgBox=await page.locator('#mmSvg').boundingBox();assert(svgBox);const mid=svgBox.x+svgBox.width/2;
  const candidates=page.locator('#mmSvg g.node:not(.root)');
  let chosen=null;
  for(let i=0;i<await candidates.count();i++){
    const b=await candidates.nth(i).boundingBox();if(b&&center(b).x>mid+40){chosen=candidates.nth(i);break}
  }
  if(!chosen)return {skipped:true};
  const b=await chosen.locator(':scope > .mm-node-drag-hit').boundingBox();assert(b);const p=center(b),targetX=mid-110,dx=targetX-p.x;
  await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x+dx,p.y+20,{steps:14});await page.mouse.up();await sleep(500);
  const after=center(await chosen.boundingBox());
  assert(after.x<mid-40,`node was clamped and could not cross center: ${after.x} >= ${mid-40}`);
  return {skipped:false};
}

async function rootDragThenClick(page){
  const root=page.locator('#mmSvg g.node.root');
  const before=center(await root.boundingBox());
  await mouseDrag(page,'#mmSvg g.node.root',105,65,12);
  await sleep(650);
  const after=center(await root.boundingBox());
  assert(distance(before,after)>55,'root is not draggable');
  assert.strictEqual(await page.locator('#mmWrap').evaluate(el=>el.classList.contains('wbmm-root-overview')),false,'dragging root accidentally opened subject gathering');
  await root.locator(':scope > .mm-node-drag-hit').click();
  await page.waitForFunction(()=>document.getElementById('mmWrap')?.classList.contains('wbmm-root-overview'),null,{timeout:7000});
  const rootQA=await page.evaluate(()=>window.WrongBookMindmapRootSubjectNav.qa());
  assert(rootQA.pass&&rootQA.gatheringVisible&&rootQA.nodeCount===10,JSON.stringify(rootQA));
  await page.locator('#mmRootSubjectNav [data-mm-root-subject="biology"] .mm-root-subject-hit').click();
  await page.waitForFunction(()=>eval('state').subject==='biology');
  await page.waitForFunction(()=>!document.getElementById('mmWrap')?.classList.contains('wbmm-root-overview'));
  await sleep(850);
  assert((await page.locator('#mmSvg g.node').count())>1,'biology tree did not reopen after gathering');
}

async function runDesktop(browser){
  const context=await browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage(),errors=errorsFor(page,'desktop');
  await page.goto(`${BASE}?qa=stable-free-drag-${Date.now()}`,{waitUntil:'domcontentloaded',timeout:35000});
  await page.evaluate(()=>localStorage.removeItem('wrongbook-v2-state'));await page.reload({waitUntil:'domcontentloaded'});
  const runtime=await enter(page,'chemistry');
  await clickStability(page);
  await singleNodeDrag(page);
  const parent=await parentOnlyDrag(page);
  const crossed=await crossCenter(page);
  await rootDragThenClick(page);
  await page.screenshot({path:'/tmp/wrongbook-stable-free-drag-desktop.png',fullPage:false});
  assert.deepStrictEqual(errors,[],errors.join('\n'));
  await context.close();return{runtime,parent,crossed};
}

async function runMobile(browser){
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),page=await context.newPage(),errors=errorsFor(page,'mobile');
  await page.goto(`${BASE}?qa=stable-free-drag-mobile-${Date.now()}`,{waitUntil:'domcontentloaded',timeout:35000});
  await page.evaluate(()=>localStorage.removeItem('wrongbook-v2-state'));await page.reload({waitUntil:'domcontentloaded'});
  const runtime=await enter(page,'chemistry');
  const target=page.locator('#mmSvg g.node:not(.root)').last();
  const before=center(await target.boundingBox()),childState=await target.evaluate(n=>({children:Array.isArray(n.__data__?.children)?n.__data__.children.length:0,hidden:Array.isArray(n.__data__?._children)?n.__data__._children.length:0}));
  await touchDrag(page,'#mmSvg g.node:not(.root):last-of-type',70,-52);
  await sleep(650);
  const after=center(await target.boundingBox()),afterState=await target.evaluate(n=>({children:Array.isArray(n.__data__?.children)?n.__data__.children.length:0,hidden:Array.isArray(n.__data__?._children)?n.__data__._children.length:0}));
  assert(distance(before,after)>35,'real touch drag did not move node');
  assert.deepStrictEqual(afterState,childState,'touch drag release toggled expansion');
  const root=page.locator('#mmSvg g.node.root'),rootBefore=center(await root.boundingBox());
  await touchDrag(page,'#mmSvg g.node.root',58,46);await sleep(650);
  const rootAfter=center(await root.boundingBox());assert(distance(rootBefore,rootAfter)>28,'root touch drag did not move');
  assert.strictEqual(await page.locator('#mmWrap').evaluate(el=>el.classList.contains('wbmm-root-overview')),false,'root touch drag opened gathering');
  const hitSizes=await page.locator('#mmSvg .mm-node-drag-hit').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return{w:r.width,h:r.height}}));
  assert(hitSizes.length>0&&hitSizes.every(r=>r.w>=20&&r.h>=20),'mobile drag hit target missing/zero-sized');
  await page.screenshot({path:'/tmp/wrongbook-stable-free-drag-mobile.png',fullPage:false});
  assert.deepStrictEqual(errors,[],errors.join('\n'));
  await context.close();return runtime;
}

(async()=>{
  const browser=await chromium.launch({executablePath:CHROME,headless:true,args:['--no-sandbox','--disable-gpu']});
  const desktop=await runDesktop(browser),mobile=await runMobile(browser);await browser.close();
  console.log(JSON.stringify({pass:true,versions:V,desktop,mobile},null,2));
})().catch(err=>{console.error(err.stack||err);process.exit(1)});
