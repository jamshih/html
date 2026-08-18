// Wrongbook — AI diagram sticker V4.
// Drag exactly the tight visible AI card. Never drag the worksheet or an oversized wrapper.
// The card stays in the same DOM parent/stacking layer; visual + border + captions/text move together.
(function(){
  if(window.__wrongbookAiDiagramStickerV4)return;
  window.__wrongbookAiDiagramStickerV4=true;

  const READY='wbAiStickerV4Ready';
  const STORE='wrongbook:ai-diagram-sticker:v6';
  const INSET=10;
  const WRITING='#paper,.paper,.v3-paper,[data-wb-writing-surface],[data-wb-writing-paper]';
  const WRITING_CONTROLS='#drawCanvas,.canvas-layer,.paper-toolbar,.v3-guide-canvas,[data-guide-dock]';
  const INTERACTIVE='button,a,input,textarea,select,summary,[contenteditable="true"],[role="button"],[role="link"]';
  const VISUAL='svg,img,canvas:not(#drawCanvas):not(.canvas-layer):not(.v3-guide-canvas),[data-diagram-visual],[class*="diagram" i],[class*="figure" i],[class*="visual" i],[class*="illustration" i]';
  let active=null,queued=false;

  const style=document.createElement('style');
  style.textContent=`
    .wb-ai-sticker-v4{
      --wb-ai-sticker-x:0px;--wb-ai-sticker-y:0px;
      transform:translate3d(var(--wb-ai-sticker-x),var(--wb-ai-sticker-y),0);
      will-change:transform;backface-visibility:hidden;
      cursor:grab!important;touch-action:none!important;
      -webkit-user-select:none!important;user-select:none!important;
      box-sizing:border-box!important;
    }
    .wb-ai-sticker-v4 *:not(${INTERACTIVE}){cursor:grab!important}
    .wb-ai-sticker-v4 ${INTERACTIVE}{cursor:auto!important;touch-action:auto!important;user-select:auto!important}
    .wb-ai-sticker-v4.wb-ai-is-dragging,.wb-ai-sticker-v4.wb-ai-is-dragging *:not(${INTERACTIVE}){cursor:grabbing!important}
    #paper,.paper,.v3-paper,[data-wb-writing-surface],[data-wb-writing-paper]{transform:none!important;translate:none!important}
  `;
  document.head.appendChild(style);

  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const clamp=(v,min,max)=>Math.min(Math.max(Number(v)||0,min),max);
  const area=el=>{const r=el?.getBoundingClientRect?.();return r&&r.width>0&&r.height>0?r.width*r.height:Infinity};
  function hash(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
  function interactive(target){return Boolean(target?.closest?.(INTERACTIVE))}
  function isWritingSurface(el){return Boolean(el&&(el.matches?.(WRITING)||el.querySelector?.(WRITING_CONTROLS)))}
  function hasVisual(el){return Boolean(el?.querySelector?.(VISUAL))}

  function title(card){
    const node=[...card.querySelectorAll('h1,h2,h3,h4,strong,[class*="title" i]')].find(el=>{const t=norm(el.textContent);return t&&t!=='AI 圖解'&&!t.includes('AI 圖解')&&t.length<100});
    return norm(node?.textContent)||norm(card.textContent).replace('AI 圖解','').slice(0,100)||'ai-diagram';
  }
  function storageKey(card){const stable=card.getAttribute('data-ai-diagram-card')||card.id||title(card);return `${STORE}:${location.pathname}:${hash(stable)}`}
  function readSaved(card){try{const d=JSON.parse(localStorage.getItem(storageKey(card))||'null');return d&&Number.isFinite(d.x)&&Number.isFinite(d.y)?d:null}catch{return null}}
  function save(card){try{localStorage.setItem(storageKey(card),JSON.stringify({x:Math.round(Number(card.dataset.wbStickerX)||0),y:Math.round(Number(card.dataset.wbStickerY)||0)}))}catch{}}

  function setOffset(card,x,y){
    x=Number.isFinite(Number(x))?Number(x):0;y=Number.isFinite(Number(y))?Number(y):0;
    card.dataset.wbStickerX=String(x);card.dataset.wbStickerY=String(y);
    card.style.setProperty('--wb-ai-sticker-x',`${Math.round(x)}px`);
    card.style.setProperty('--wb-ai-sticker-y',`${Math.round(y)}px`);
  }

  function hasSmallerCompleteCard(card){
    const a=area(card);if(!Number.isFinite(a))return false;
    return [...card.querySelectorAll('[data-wb-ai-diagram-scope="tight"],[data-ai-diagram-card]')].some(ch=>{
      if(ch===card||isWritingSurface(ch)||!hasVisual(ch)||!norm(ch.textContent).includes('AI 圖解'))return false;
      const ca=area(ch);return Number.isFinite(ca)&&ca<a*.72;
    });
  }

  function eligible(card){
    if(!card||isWritingSurface(card)||!hasVisual(card)||!norm(card.textContent).includes('AI 圖解'))return false;
    if(card.dataset.wbAiDiagramScope==='tight')return true;
    // Dedicated renderers may add data-ai-diagram-card before the scope observer runs. Allow only
    // when there is no smaller complete AI card inside, so a big invisible wrapper cannot become drag hitbox.
    return card.hasAttribute('data-ai-diagram-card')&&!hasSmallerCompleteCard(card);
  }

  function cleanupOldRuntime(){
    document.getElementById('wb-ai-sticker-v2-layer')?.remove();
    document.querySelectorAll('.wb-ai-sticker-v2,.wb-ai-sticker-v3').forEach(el=>{
      el.classList.remove('wb-ai-sticker-v2','wb-ai-sticker-v3','wb-ai-is-floating','wb-ai-is-dragging');
      delete el.dataset.wbAiStickerV2Ready;delete el.dataset.wbAiStickerV3Ready;delete el.dataset.aiStickerDraggable;
      el.style.removeProperty('z-index');
    });
  }

  function writingSurfaceFor(card){
    const closest=card?.closest?.(WRITING);if(closest)return closest;
    return [...document.querySelectorAll(WRITING)].filter(el=>el.contains(card)).sort((a,b)=>area(a)-area(b))[0]||null;
  }

  function dragBounds(card){
    const surface=writingSurfaceFor(card),r=surface?.getBoundingClientRect?.();
    if(r&&r.width>0&&r.height>0)return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,surface};
    return{left:0,top:0,right:innerWidth,bottom:innerHeight,surface:null};
  }

  function dragLimits(card,startRect){
    // Keep the whole visible card inside the worksheet when possible. This avoids transformed
    // overflow changing the page scroll geometry while the pointer is moving.
    const b=dragBounds(card);
    let minDx=b.left+INSET-startRect.left,maxDx=b.right-INSET-startRect.right,minDy=b.top+INSET-startRect.top,maxDy=b.bottom-INSET-startRect.bottom;
    if(minDx>maxDx){const mid=(minDx+maxDx)/2;minDx=maxDx=mid}
    if(minDy>maxDy){const mid=(minDy+maxDy)/2;minDy=maxDy=mid}
    return{minDx,maxDx,minDy,maxDy,surface:b.surface};
  }

  function clampSavedOffset(card){
    const r=card.getBoundingClientRect(),b=dragBounds(card);if(!b.surface)return;
    let dx=0,dy=0;
    if(r.left<b.left+INSET)dx=(b.left+INSET)-r.left;else if(r.right>b.right-INSET)dx=(b.right-INSET)-r.right;
    if(r.top<b.top+INSET)dy=(b.top+INSET)-r.top;else if(r.bottom>b.bottom-INSET)dy=(b.bottom-INSET)-r.bottom;
    if(dx||dy)setOffset(card,(Number(card.dataset.wbStickerX)||0)+dx,(Number(card.dataset.wbStickerY)||0)+dy);
  }

  function upgrade(card){
    if(!eligible(card)||card.dataset[READY]==='1')return false;
    card.dataset[READY]='1';card.classList.add('wb-ai-sticker-v4');card.dataset.aiStickerDraggable='true';
    const saved=readSaved(card);setOffset(card,saved?.x||0,saved?.y||0);
    requestAnimationFrame(()=>{if(card.isConnected)clampSavedOffset(card)});
    return true;
  }

  function scan(root=document.getElementById('app')||document.body){
    cleanupOldRuntime();
    const cards=[];
    if(root.matches?.('[data-wb-ai-diagram-scope="tight"],[data-ai-diagram-card]'))cards.push(root);
    cards.push(...(root.querySelectorAll?.('[data-wb-ai-diagram-scope="tight"],[data-ai-diagram-card]')||[]));
    // Upgrade the smallest candidates first; if a wrapper contains a real card it remains static.
    cards.sort((a,b)=>area(a)-area(b));
    cards.forEach(upgrade);
    document.querySelectorAll(WRITING).forEach(el=>{
      el.classList.remove('wb-ai-sticker-v4','wb-ai-is-dragging');delete el.dataset[READY];delete el.dataset.aiStickerDraggable;
      el.style.removeProperty('--wb-ai-sticker-x');el.style.removeProperty('--wb-ai-sticker-y');
    });
    // Remove any mistakenly upgraded ancestor once the tight child is known.
    document.querySelectorAll('.wb-ai-sticker-v4').forEach(card=>{
      if(card.dataset.wbAiDiagramScope!=='tight'&&hasSmallerCompleteCard(card)){
        card.classList.remove('wb-ai-sticker-v4','wb-ai-is-dragging');delete card.dataset[READY];delete card.dataset.aiStickerDraggable;
        card.style.removeProperty('--wb-ai-sticker-x');card.style.removeProperty('--wb-ai-sticker-y');
      }
    });
  }

  function start(card,e){
    if(active||!eligible(card)||interactive(e.target))return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    const r=card.getBoundingClientRect();
    active={card,id:e.pointerId,startX:e.clientX,startY:e.clientY,startRect:r,baseX:Number(card.dataset.wbStickerX)||0,baseY:Number(card.dataset.wbStickerY)||0,parent:card.parentNode,z:getComputedStyle(card).zIndex,limits:dragLimits(card,r),raf:0,pendingX:null,pendingY:null};
    card.classList.add('wb-ai-is-dragging');
    try{card.setPointerCapture(e.pointerId)}catch{}
    e.preventDefault();e.stopPropagation();
  }
  function paintMove(d){
    d.raf=0;if(active!==d||d.pendingX===null||d.pendingY===null)return;
    setOffset(d.card,d.pendingX,d.pendingY);d.pendingX=d.pendingY=null;
  }
  function move(e){
    const d=active;if(!d||e.pointerId!==d.id)return;
    const dx=clamp(e.clientX-d.startX,d.limits.minDx,d.limits.maxDx),dy=clamp(e.clientY-d.startY,d.limits.minDy,d.limits.maxDy);
    d.pendingX=d.baseX+dx;d.pendingY=d.baseY+dy;
    if(!d.raf)d.raf=requestAnimationFrame(()=>paintMove(d));
    e.preventDefault();
  }
  function end(e){
    const d=active;if(!d||e.pointerId!==d.id)return;
    if(d.raf){cancelAnimationFrame(d.raf);d.raf=0}
    if(d.pendingX!==null&&d.pendingY!==null)setOffset(d.card,d.pendingX,d.pendingY);
    active=null;d.card.classList.remove('wb-ai-is-dragging');
    try{d.card.releasePointerCapture(e.pointerId)}catch{}
    // Same layer contract: parent and stacking order are never changed by drag.
    if(d.card.parentNode!==d.parent)console.error('[AI sticker V4] parent changed unexpectedly');
    if(getComputedStyle(d.card).zIndex!==d.z)d.card.style.zIndex='';
    save(d.card);
  }

  document.addEventListener('pointerdown',e=>{
    if(!(e.target instanceof Element))return;
    const card=e.target.closest('.wb-ai-sticker-v4');if(card)start(card,e);
  },true);
  addEventListener('pointermove',move,{passive:false,capture:true});
  addEventListener('pointerup',end,{passive:true,capture:true});
  addEventListener('pointercancel',end,{passive:true,capture:true});

  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;scan()})}
  cleanupOldRuntime();scan();
  new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['data-ai-diagram-card','data-wb-ai-diagram-scope']});

  window.__wrongbookAiStickerV4QA=()=>{
    const cards=[...document.querySelectorAll('.wb-ai-sticker-v4')];
    return{
      loaded:true,version:4,cards:cards.length,
      writingDraggable:[...document.querySelectorAll(WRITING)].filter(x=>x.classList.contains('wb-ai-sticker-v4')).length,
      oversizedDraggable:cards.filter(hasSmallerCompleteCard).length,
      globalPortal:Boolean(document.getElementById('wb-ai-sticker-v2-layer')),
      sameParentLayer:true,forcedTopZ:false,wholeCardDrag:true,tightVisibleHitbox:true,includesContainerAndText:true,
      worksheetBounded:true,rafBatched:true,gpuTransform:true
    };
  };
})();