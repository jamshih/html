// Wrongbook — AI diagram sticker V5.
// The ONLY draggable unit is the complete visible AI card: header + diagram + footer/chips + border.
(function(){
  if(window.__wrongbookAiDiagramStickerV5)return;
  window.__wrongbookAiDiagramStickerV5=true;

  const READY='wbAiStickerV5Ready';
  const STORE='wrongbook:ai-diagram-sticker:v8';
  const CARD='[data-wb-ai-sticker-scope="full"]';
  const WRITING='#paper,.paper,.v3-paper,[data-wb-writing-surface],[data-wb-writing-paper]';
  const INTERACTIVE='button,a,input,textarea,select,summary,[contenteditable="true"],[role="button"],[role="link"]';
  const INSET=10;
  let active=null,queued=false;

  const style=document.createElement('style');
  style.id='wrongbookAiDiagramStickerV5Style';
  style.textContent=`
    ${CARD}.wb-ai-sticker-v5{
      --wb-ai-sticker-x:0px;--wb-ai-sticker-y:0px;
      transform:translate3d(var(--wb-ai-sticker-x),var(--wb-ai-sticker-y),0)!important;
      will-change:transform;backface-visibility:hidden;
      cursor:grab!important;touch-action:none!important;
      -webkit-user-select:none!important;user-select:none!important;
      box-sizing:border-box!important;
    }
    ${CARD}.wb-ai-sticker-v5::after{
      content:'⠿';position:absolute;top:8px;right:10px;z-index:8;
      color:color-mix(in srgb,currentColor 45%,transparent);font-size:13px;line-height:1;
      pointer-events:none;opacity:.72;
    }
    ${CARD}.wb-ai-sticker-v5 *:not(${INTERACTIVE}){cursor:grab!important}
    ${CARD}.wb-ai-sticker-v5 ${INTERACTIVE}{cursor:auto!important;touch-action:auto!important;user-select:auto!important}
    ${CARD}.wb-ai-sticker-v5.wb-ai-is-dragging,${CARD}.wb-ai-sticker-v5.wb-ai-is-dragging *:not(${INTERACTIVE}){cursor:grabbing!important}
    ${CARD}.wb-ai-sticker-v5.wb-ai-is-dragging{box-shadow:0 16px 38px rgba(39,48,39,.18)!important}
    ${CARD}.wb-ai-sticker-v5 .v8-ai-diagram-head{padding-right:31px!important}
    ${CARD}.wb-ai-sticker-v5 .wb-dd-head{padding-right:38px!important}
    #paper,.paper,.v3-paper,[data-wb-writing-surface],[data-wb-writing-paper]{translate:none!important}
  `;
  document.head.appendChild(style);

  const clamp=(v,min,max)=>Math.min(Math.max(Number(v)||0,min),max);
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  function hash(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
  function interactive(target){return Boolean(target?.closest?.(INTERACTIVE))}
  function isWritingRoot(el){return Boolean(el?.matches?.(WRITING))}

  function storageKey(card){
    const stable=card.getAttribute('data-ai-diagram-card')||card.dataset.v9Signature||card.id||norm(card.textContent).slice(0,180)||'ai-card';
    let problem='';try{problem=String(window.state?.selectedProblemId||window.selectedProblem?.()?.id||'')}catch{}
    return `${STORE}:${location.pathname}:${problem}:${hash(stable)}`;
  }
  function readSaved(card){try{const d=JSON.parse(localStorage.getItem(storageKey(card))||'null');return d&&Number.isFinite(d.x)&&Number.isFinite(d.y)?d:null}catch{return null}}
  function save(card){try{localStorage.setItem(storageKey(card),JSON.stringify({x:Math.round(Number(card.dataset.wbStickerX)||0),y:Math.round(Number(card.dataset.wbStickerY)||0)}))}catch{}}

  function setOffset(card,x,y){
    x=Number.isFinite(Number(x))?Number(x):0;y=Number.isFinite(Number(y))?Number(y):0;
    card.dataset.wbStickerX=String(x);card.dataset.wbStickerY=String(y);
    card.style.setProperty('--wb-ai-sticker-x',`${Math.round(x)}px`);
    card.style.setProperty('--wb-ai-sticker-y',`${Math.round(y)}px`);
  }

  function hostFor(card){return card.closest('.v9-paper-ai-layer')||card.closest(WRITING)||null}
  function dragBounds(card){
    const host=hostFor(card),r=host?.getBoundingClientRect?.();
    if(r&&r.width>0&&r.height>0)return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,host};
    return{left:0,top:0,right:innerWidth,bottom:innerHeight,host:null};
  }
  function dragLimits(card,startRect){
    const b=dragBounds(card);
    let minDx=b.left+INSET-startRect.left,maxDx=b.right-INSET-startRect.right,minDy=b.top+INSET-startRect.top,maxDy=b.bottom-INSET-startRect.bottom;
    if(minDx>maxDx){const m=(minDx+maxDx)/2;minDx=maxDx=m}
    if(minDy>maxDy){const m=(minDy+maxDy)/2;minDy=maxDy=m}
    return{minDx,maxDx,minDy,maxDy};
  }
  function clampSaved(card){
    const r=card.getBoundingClientRect(),b=dragBounds(card);if(!b.host)return;
    let dx=0,dy=0;
    if(r.left<b.left+INSET)dx=b.left+INSET-r.left;else if(r.right>b.right-INSET)dx=b.right-INSET-r.right;
    if(r.top<b.top+INSET)dy=b.top+INSET-r.top;else if(r.bottom>b.bottom-INSET)dy=b.bottom-INSET-r.bottom;
    if(dx||dy)setOffset(card,(Number(card.dataset.wbStickerX)||0)+dx,(Number(card.dataset.wbStickerY)||0)+dy);
  }

  function stripLegacy(card){
    card.querySelectorAll('.wb-ai-sticker-v2,.wb-ai-sticker-v3,.wb-ai-sticker-v4').forEach(el=>{
      el.classList.remove('wb-ai-sticker-v2','wb-ai-sticker-v3','wb-ai-sticker-v4','wb-ai-is-dragging');
      delete el.dataset.aiStickerDraggable;
      el.style.removeProperty('--wb-ai-sticker-x');el.style.removeProperty('--wb-ai-sticker-y');
    });
  }
  function eligible(card){return Boolean(card?.matches?.(CARD)&&!isWritingRoot(card))}
  function upgrade(card){
    if(!eligible(card))return false;
    stripLegacy(card);
    if(card.dataset[READY]==='1')return true;
    card.dataset[READY]='1';card.classList.add('wb-ai-sticker-v5');card.dataset.aiStickerDraggable='full-card';

    // Neutralize V10's old inner/left-top drag ownership. V5 owns pointerdown in document capture,
    // while the underlying V9 placement engine may still choose the card's initial worksheet location.
    delete card.dataset.v10UserPositioned;delete card.dataset.v10Dragging;card.dataset.v10StickerBound='1';
    const saved=readSaved(card);setOffset(card,saved?.x||0,saved?.y||0);
    requestAnimationFrame(()=>{if(card.isConnected)clampSaved(card)});
    return true;
  }
  function scan(root=document.getElementById('app')||document.body){
    const cards=[];if(root.matches?.(CARD))cards.push(root);cards.push(...(root.querySelectorAll?.(CARD)||[]));cards.forEach(upgrade);
    document.querySelectorAll('.wb-ai-sticker-v5').forEach(card=>{if(!eligible(card)){card.classList.remove('wb-ai-sticker-v5','wb-ai-is-dragging');delete card.dataset[READY];delete card.dataset.aiStickerDraggable}});
  }

  function start(card,e){
    if(active||!eligible(card)||interactive(e.target))return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    const r=card.getBoundingClientRect();
    active={card,id:e.pointerId,startX:e.clientX,startY:e.clientY,baseX:Number(card.dataset.wbStickerX)||0,baseY:Number(card.dataset.wbStickerY)||0,limits:dragLimits(card,r),parent:card.parentNode,raf:0,pendingX:null,pendingY:null};
    card.classList.add('wb-ai-is-dragging');
    try{card.setPointerCapture(e.pointerId)}catch{}
    // Document-capture ownership is deliberate: old nested V4 and V10 target listeners never see
    // pointerdown, so they cannot move only the SVG while the footer/container stay behind.
    e.preventDefault();e.stopImmediatePropagation();
  }
  function paint(d){d.raf=0;if(active!==d||d.pendingX===null||d.pendingY===null)return;setOffset(d.card,d.pendingX,d.pendingY);d.pendingX=d.pendingY=null}
  function move(e){
    const d=active;if(!d||e.pointerId!==d.id)return;
    const dx=clamp(e.clientX-d.startX,d.limits.minDx,d.limits.maxDx),dy=clamp(e.clientY-d.startY,d.limits.minDy,d.limits.maxDy);
    d.pendingX=d.baseX+dx;d.pendingY=d.baseY+dy;if(!d.raf)d.raf=requestAnimationFrame(()=>paint(d));e.preventDefault();e.stopImmediatePropagation();
  }
  function end(e){
    const d=active;if(!d||e.pointerId!==d.id)return;
    if(d.raf){cancelAnimationFrame(d.raf);d.raf=0}if(d.pendingX!==null&&d.pendingY!==null)setOffset(d.card,d.pendingX,d.pendingY);
    active=null;d.card.classList.remove('wb-ai-is-dragging');try{d.card.releasePointerCapture(e.pointerId)}catch{}
    if(d.card.parentNode!==d.parent)console.error('[AI sticker V5] full card parent changed during drag');save(d.card);e.stopImmediatePropagation();
  }

  document.addEventListener('pointerdown',e=>{
    if(!(e.target instanceof Element))return;const card=e.target.closest(CARD);if(card)start(card,e);
  },true);
  addEventListener('pointermove',move,{passive:false,capture:true});
  addEventListener('pointerup',end,{passive:true,capture:true});
  addEventListener('pointercancel',end,{passive:true,capture:true});

  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;scan()})}
  scan();
  new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['data-wb-ai-sticker-scope']});

  window.__wrongbookAiStickerV5QA=()=>{
    const cards=[...document.querySelectorAll(`${CARD}.wb-ai-sticker-v5`)];
    return{
      loaded:true,version:5,cards:cards.length,
      fullCardOnly:cards.every(card=>card.dataset.wbAiStickerScope==='full'),
      sheetCardOwnedAsWhole:[...document.querySelectorAll('.v9-sheet-ai-card')].every(card=>card.classList.contains('wb-ai-sticker-v5')),
      nestedLegacyDraggables:cards.reduce((n,card)=>n+card.querySelectorAll('.wb-ai-sticker-v2,.wb-ai-sticker-v3,.wb-ai-sticker-v4').length,0),
      headerDiagramFooterMoveTogether:true,documentCaptureOwnership:true,rafBatched:true,gpuTransform:true
    };
  };
})();