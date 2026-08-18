// Wrong Book V10 — make worksheet AI diagrams draggable, persistent stickers.
(function(){
  const VERSION='2026-08-18-paper-overlay-sticker-v10d';
  if(window.__wrongbookPaperOverlayStickerV10===VERSION)return;
  window.__wrongbookPaperOverlayStickerV10=VERSION;

  const STORE_KEY='wrongbook-v10-ai-sticker-position';
  let observer=null,resizeQueued=false,restoreQueued=false;

  const style=document.createElement('style');
  style.id='wrongbookPaperOverlayStickerV10Style';
  style.textContent=`
    .v9-paper-ai-layer{z-index:12!important;pointer-events:none!important}
    .v9-sheet-ai-card{pointer-events:auto!important;cursor:grab!important;touch-action:none!important;user-select:none!important;-webkit-user-select:none!important;transition:box-shadow .14s ease,transform .14s ease!important}
    .v9-sheet-ai-card::after{content:'⠿';position:absolute;top:7px;right:9px;z-index:4;color:color-mix(in srgb,var(--ink,#2B2D29) 48%,transparent);font-size:13px;line-height:1;pointer-events:none;opacity:.72}
    .v9-sheet-ai-card:hover{box-shadow:0 11px 32px rgba(39,48,39,.13)!important}
    .v9-sheet-ai-card[data-v10-dragging='1']{cursor:grabbing!important;box-shadow:0 16px 38px rgba(39,48,39,.18)!important;transform:scale(1.008)}
    .v9-sheet-ai-card .v8-ai-diagram-head{padding-right:31px!important}
    html[data-theme='dark'] .v9-sheet-ai-card[data-v10-dragging='1'],body[data-theme='dark'] .v9-sheet-ai-card[data-v10-dragging='1'],html.dark .v9-sheet-ai-card[data-v10-dragging='1'],body.dark .v9-sheet-ai-card[data-v10-dragging='1']{box-shadow:0 16px 38px rgba(0,0,0,.34)!important}
  `;
  document.head.appendChild(style);

  function paper(){return document.getElementById('paper')||document.querySelector('.v3-paper,.paper')}
  function layer(){return paper()?.querySelector(':scope > .v9-paper-ai-layer')||document.querySelector('.v9-paper-ai-layer')}
  function card(){return layer()?.querySelector('.v9-sheet-ai-card')||document.querySelector('.v9-sheet-ai-card')}
  function currentProblemId(){try{return String(window.state?.selectedProblemId||window.selectedProblem?.()?.id||'current')}catch{return'current'}}
  function stickerKey(){return `${currentProblemId()}:worksheet-ai-sticker`}
  function readStore(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')||{}}catch{return{}}}
  function writeStore(obj){try{localStorage.setItem(STORE_KEY,JSON.stringify(obj));return true}catch{return false}}
  function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
  function limits(el,host){const hr=host.getBoundingClientRect(),er=el.getBoundingClientRect();return{maxX:Math.max(0,hr.width-er.width),maxY:Math.max(0,hr.height-er.height)}}
  function clampPosition(left,top,maxX,maxY){return{left:clamp(left,0,maxX),top:clamp(top,0,maxY)}}
  function persist(el,host){const {maxX,maxY}=limits(el,host),left=parseFloat(el.style.left)||0,top=parseFloat(el.style.top)||0;const store=readStore();store[stickerKey()]={x:maxX?clamp(left/maxX,0,1):0,y:maxY?clamp(top/maxY,0,1):0};return writeStore(store)}
  function restore(el,host){const saved=readStore()[stickerKey()];if(!saved)return false;const {maxX,maxY}=limits(el,host),pos=clampPosition(Number(saved.x||0)*maxX,Number(saved.y||0)*maxY,maxX,maxY),left=Math.round(pos.left),top=Math.round(pos.top);const currentLeft=Math.round(parseFloat(el.style.left)||0),currentTop=Math.round(parseFloat(el.style.top)||0);if(currentLeft!==left)el.style.left=`${left}px`;if(currentTop!==top)el.style.top=`${top}px`;if(el.style.visibility!=='visible')el.style.visibility='visible';el.dataset.v10UserPositioned='1';return true}
  function queueRestore(){if(restoreQueued)return;restoreQueued=true;requestAnimationFrame(()=>{restoreQueued=false;const el=card(),host=layer();if(el&&host&&el.dataset.v10UserPositioned==='1'&&el.dataset.v10Dragging!=='1')restore(el,host)})}

  function bind(el){
    if(!el||el.dataset.v10StickerBound==='1')return;el.dataset.v10StickerBound='1';el.setAttribute('aria-roledescription','可拖曳 AI 圖解貼紙');const host=el.closest('.v9-paper-ai-layer');if(!host)return;
    requestAnimationFrame(()=>{if(!restore(el,host))persist(el,host)});
    let drag=null;
    el.addEventListener('pointerdown',e=>{if(e.button!=null&&e.button!==0)return;if(e.target.closest('button,a,input,textarea,select'))return;const r=el.getBoundingClientRect(),hr=host.getBoundingClientRect();drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,left:r.left-hr.left,top:r.top-hr.top,moved:false};el.dataset.v10Dragging='1';try{el.setPointerCapture(e.pointerId)}catch{}e.preventDefault();e.stopPropagation()},true);
    el.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const {maxX,maxY}=limits(el,host),dx=e.clientX-drag.startX,dy=e.clientY-drag.startY,pos=clampPosition(drag.left+dx,drag.top+dy,maxX,maxY);el.style.left=`${Math.round(pos.left)}px`;el.style.top=`${Math.round(pos.top)}px`;el.style.visibility='visible';if(Math.abs(dx)>2||Math.abs(dy)>2){drag.moved=true;el.dataset.v10UserPositioned='1'}e.preventDefault();e.stopPropagation()},true);
    const finish=e=>{if(!drag||drag.id!==e.pointerId)return;try{el.releasePointerCapture(e.pointerId)}catch{}const moved=drag.moved;drag=null;delete el.dataset.v10Dragging;if(moved)persist(el,host);e.preventDefault();e.stopPropagation()};el.addEventListener('pointerup',finish,true);el.addEventListener('pointercancel',finish,true);
  }

  function apply(){const el=card();if(el)bind(el)}
  function queueResize(){if(resizeQueued)return;resizeQueued=true;requestAnimationFrame(()=>{resizeQueued=false;const el=card(),host=layer();if(el&&host&&el.dataset.v10UserPositioned==='1')restore(el,host);apply()})}
  function mount(){const app=document.getElementById('app');if(!app)return setTimeout(mount,50);if(!observer){observer=new MutationObserver(records=>{let needsBind=false,needsRestore=false;for(const r of records){if(r.type==='childList')needsBind=true;if(r.type==='attributes'&&r.target?.classList?.contains('v9-sheet-ai-card')&&r.attributeName==='style'&&r.target.dataset.v10UserPositioned==='1'&&r.target.dataset.v10Dragging!=='1')needsRestore=true}if(needsBind)requestAnimationFrame(apply);if(needsRestore)queueRestore()});observer.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['style']});window.__wrongbookPaperOverlayStickerV10Observer=observer}window.addEventListener('resize',queueResize,{passive:true});apply()}
  mount();

  window.__wrongbookAiStickerV10={version:VERSION,clampPosition,stickerKey,restore,persist};
  window.runWrongbookAiStickerQA=function(){apply();const el=card(),host=layer(),draw=paper()?.querySelector('#drawCanvas'),toolbar=paper()?.querySelector('.paper-toolbar');if(!el||!host)return{pass:false,reason:'sticker-not-mounted',version:VERSION};const cs=getComputedStyle(el),hs=getComputedStyle(host),ds=draw?getComputedStyle(draw):null,ts=toolbar?getComputedStyle(toolbar):null;const clampFixture=clampPosition(-15,999,320,240),clampOk=clampFixture.left===0&&clampFixture.top===240,pointerEnabled=cs.pointerEvents==='auto'&&cs.touchAction==='none',bound=el.dataset.v10StickerBound==='1',classMutationFree=!el.classList.contains('v10-sticker-dragging'),layerAboveInk=!ds||Number(hs.zIndex)>Number(ds.zIndex),layerBelowToolbar=!ts||!Number.isFinite(Number(ts.zIndex))||Number(hs.zIndex)<Number(ts.zIndex),stageStableKey=stickerKey().endsWith(':worksheet-ai-sticker')&&!stickerKey().includes(el.dataset.v9Signature||'__never__');let storageOk=false;try{const k=`${STORE_KEY}-qa`,v={x:.4,y:.6};localStorage.setItem(k,JSON.stringify(v));storageOk=JSON.parse(localStorage.getItem(k)||'{}').x===.4;localStorage.removeItem(k)}catch{}const persistentOverride=typeof restore==='function'&&typeof persist==='function'&&observer instanceof MutationObserver,pass=clampOk&&pointerEnabled&&bound&&classMutationFree&&layerAboveInk&&layerBelowToolbar&&storageOk&&persistentOverride&&stageStableKey;return{pass,version:VERSION,clampOk,pointerEnabled,bound,classMutationFree,layerAboveInk,layerBelowToolbar,storageOk,persistentOverride,stageStableKey,cursor:cs.cursor,layerZ:hs.zIndex,drawZ:ds?.zIndex||null,toolbarZ:ts?.zIndex||null}};
  function scheduleQA(tries=0){setTimeout(()=>{const r=window.runWrongbookAiStickerQA?.();if(r?.reason==='sticker-not-mounted'&&tries<30)return scheduleQA(tries+1);window.__wrongbookAiStickerV10QA=r;if(r&&!r.pass)console.warn('[Wrongbook AI sticker QA failed]',r)},180)}scheduleQA();
})();
