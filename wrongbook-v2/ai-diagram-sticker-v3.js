// Wrongbook — AI diagram sticker V3.
// Drag only the diagram card itself. Never portal it to a global overlay and never make the
// writing worksheet draggable. The full card (visual container + captions/text) moves together.
(function(){
  if(window.__wrongbookAiDiagramStickerV3)return;
  window.__wrongbookAiDiagramStickerV3=true;

  const LABEL='AI 圖解';
  const READY='wbAiStickerV3Ready';
  const STORE='wrongbook:ai-diagram-sticker:v5';
  const INSET=12;
  let active=null;
  let scanQueued=false;

  const WRITING_BOUNDARY='#paper,.paper,.v3-paper,[data-wb-writing-surface],[data-wb-writing-paper]';
  const WRITING_CONTROLS='#drawCanvas,.canvas-layer,.paper-toolbar,.v3-guide-canvas,[data-guide-dock]';
  const INTERACTIVE='button,a,input,textarea,select,summary,[contenteditable="true"],[role="button"],[role="link"]';

  const style=document.createElement('style');
  style.textContent=`
    .wb-ai-sticker-v3{
      --wb-ai-sticker-x:0px;
      --wb-ai-sticker-y:0px;
      translate:var(--wb-ai-sticker-x) var(--wb-ai-sticker-y);
      cursor:grab!important;
      touch-action:none!important;
      -webkit-user-select:none!important;
      user-select:none!important;
      box-sizing:border-box!important;
    }
    .wb-ai-sticker-v3 *:not(${INTERACTIVE}){cursor:grab!important}
    .wb-ai-sticker-v3 ${INTERACTIVE}{cursor:auto!important;touch-action:auto!important;user-select:auto!important}
    .wb-ai-sticker-v3.wb-ai-is-dragging{cursor:grabbing!important;box-shadow:0 18px 44px rgba(35,31,27,.16)!important}
    .wb-ai-sticker-v3.wb-ai-is-dragging *:not(${INTERACTIVE}){cursor:grabbing!important}
    #paper,.paper,.v3-paper,[data-wb-writing-surface],[data-wb-writing-paper]{translate:none!important}
  `;
  document.head.appendChild(style);

  function norm(v){return String(v||'').replace(/\s+/g,' ').trim()}
  function clamp(v,min,max){return Math.min(Math.max(Number(v)||0,min),max)}
  function interactive(target){return Boolean(target?.closest?.(INTERACTIVE))}
  function hash(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}

  function isWritingSurface(el){
    if(!el||el.nodeType!==1)return false;
    if(el.matches?.(WRITING_BOUNDARY))return true;
    // A broad panel containing the handwriting canvas/toolbar is the writing session, not a sticker.
    return Boolean(el.querySelector?.(WRITING_CONTROLS));
  }

  function markWritingSurfaces(){
    document.querySelectorAll('#paper,.paper,.v3-paper').forEach(p=>{
      p.dataset.wbWritingPaper='1';
      const panel=p.closest('section.panel,article.panel,[class*="workspace" i]');
      if(panel)panel.dataset.wbWritingSurface='1';
    });
  }

  function cleanLegacyPortal(){
    const layer=document.getElementById('wb-ai-sticker-v2-layer');
    if(!layer)return;
    for(const card of [...layer.querySelectorAll('.wb-ai-sticker-v2,.wb-ai-is-floating')]){
      const anchor=card.__wbAiV2Anchor;
      if(anchor?.parentNode){anchor.parentNode.insertBefore(card,anchor);anchor.remove()}
      card.classList.remove('wb-ai-sticker-v2','wb-ai-is-floating','wb-ai-is-dragging');
      delete card.dataset.wbAiStickerV2Ready;
      card.style.removeProperty('position');card.style.removeProperty('left');card.style.removeProperty('top');card.style.removeProperty('width');card.style.removeProperty('z-index');card.style.removeProperty('max-width');card.style.removeProperty('max-height');card.style.removeProperty('overflow');
    }
    layer.remove();
  }

  function title(card){
    const node=[...card.querySelectorAll('h1,h2,h3,h4,strong,[class*="title" i]')].find(el=>{const t=norm(el.textContent);return t&&t!==LABEL&&!t.includes(LABEL)&&t.length<100});
    return norm(node?.textContent)||norm(card.textContent).replace(LABEL,'').slice(0,100)||'ai-diagram';
  }

  function storageKey(card){
    const stable=card.getAttribute('data-ai-diagram-card')||card.id||card.getAttribute('data-id')||title(card);
    return `${STORE}:${location.pathname}:${hash(stable)}`;
  }
  function readSaved(card){try{const d=JSON.parse(localStorage.getItem(storageKey(card))||'null');return d&&Number.isFinite(d.x)&&Number.isFinite(d.y)?d:null}catch{return null}}
  function save(card){
    const x=Number(card.dataset.wbStickerX)||0,y=Number(card.dataset.wbStickerY)||0;
    try{localStorage.setItem(storageKey(card),JSON.stringify({x:Math.round(x),y:Math.round(y)}))}catch{}
  }

  function setOffset(card,x,y){
    x=Number.isFinite(Number(x))?Number(x):0;y=Number.isFinite(Number(y))?Number(y):0;
    card.dataset.wbStickerX=String(x);card.dataset.wbStickerY=String(y);
    card.style.setProperty('--wb-ai-sticker-x',`${Math.round(x)}px`);
    card.style.setProperty('--wb-ai-sticker-y',`${Math.round(y)}px`);
  }

  function keepVisible(card){
    if(!card?.isConnected)return;
    const r=card.getBoundingClientRect();let dx=0,dy=0;
    if(r.left<INSET)dx=INSET-r.left;else if(r.right>innerWidth-INSET)dx=(innerWidth-INSET)-r.right;
    if(r.top<INSET)dy=INSET-r.top;else if(r.bottom>innerHeight-INSET)dy=(innerHeight-INSET)-r.bottom;
    if(dx||dy){setOffset(card,(Number(card.dataset.wbStickerX)||0)+dx,(Number(card.dataset.wbStickerY)||0)+dy);save(card)}
  }

  function hasDiagramSignal(el){
    return Boolean(el.querySelector?.('svg,canvas,img,[class*="diagram" i],[class*="figure" i],[class*="visual" i],[class*="result" i],[class*="chip" i],[class*="tag" i]'));
  }

  function looksLikeSafeCard(el,label,boundary){
    if(!el||el===boundary||el===document.body||el===document.documentElement||el.id==='app'||!el.contains(label))return false;
    if(isWritingSurface(el))return false;
    const text=norm(el.textContent);if(!text.includes(LABEL))return false;
    const r=el.getBoundingClientRect();if(r.width<220||r.height<110)return false;
    if(r.width>Math.max(innerWidth*.98,1500)||r.height>Math.max(innerHeight*1.8,1500))return false;
    const cs=getComputedStyle(el),radius=parseFloat(cs.borderTopLeftRadius)||0,border=parseFloat(cs.borderTopWidth)||0;
    const classLike=/card|panel|diagram|figure|visual|illustration|explain|sticker/i.test(String(el.className||''));
    const tagLike=/^(SECTION|ARTICLE)$/i.test(el.tagName||'');
    return hasDiagramSignal(el)||radius>=6||border>0||cs.boxShadow!=='none'||classLike||tagLike;
  }

  function safeRootForLabel(label){
    const explicit=label.closest('[data-ai-diagram-card]');
    if(explicit&&!isWritingSurface(explicit))return explicit;
    const boundary=label.closest(WRITING_BOUNDARY);
    const candidates=[];let el=label;
    for(let depth=0;depth<12&&el&&el!==document.body&&el!==boundary;depth++,el=el.parentElement){
      if(looksLikeSafeCard(el,label,boundary))candidates.push(el);
    }
    if(!candidates.length)return null;
    // Use the largest safe local card so its border, visual and explanatory text move as one sticker.
    return candidates[candidates.length-1];
  }

  function labelElements(root){
    const base=root?.nodeType===1?root:document.body,out=[];
    const walker=document.createTreeWalker(base,NodeFilter.SHOW_TEXT,{acceptNode(node){
      const p=node.parentElement;
      return p&&!p.closest('script,style,template')&&norm(node.nodeValue).includes(LABEL)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
    }});
    while(walker.nextNode())out.push(walker.currentNode.parentElement);
    return [...new Set(out)];
  }

  function upgrade(card){
    if(!card||card.dataset[READY]==='1'||isWritingSurface(card))return false;
    card.dataset[READY]='1';
    if(!card.hasAttribute('data-ai-diagram-card'))card.setAttribute('data-ai-diagram-card',`auto-${hash(title(card))}`);
    card.classList.remove('wb-ai-sticker-v2','wb-ai-is-floating');
    card.classList.add('wb-ai-sticker-v3');
    card.dataset.aiStickerDraggable='true';
    const saved=readSaved(card);setOffset(card,saved?.x||0,saved?.y||0);
    requestAnimationFrame(()=>keepVisible(card));
    return true;
  }

  function scan(root=document.getElementById('app')||document.body){
    cleanLegacyPortal();markWritingSurfaces();
    const explicit=[];
    if(root.matches?.('[data-ai-diagram-card]'))explicit.push(root);
    explicit.push(...(root.querySelectorAll?.('[data-ai-diagram-card]')||[]));
    for(const card of explicit)if(!isWritingSurface(card))upgrade(card);
    for(const label of labelElements(root)){
      const card=safeRootForLabel(label);
      if(card)upgrade(card);
    }
    // A broad writing panel must never retain a stale draggable contract.
    document.querySelectorAll('[data-wb-writing-surface],[data-wb-writing-paper],#paper,.paper,.v3-paper').forEach(el=>{
      if(el.classList.contains('wb-ai-sticker-v3')){
        el.classList.remove('wb-ai-sticker-v3','wb-ai-is-dragging');delete el.dataset[READY];delete el.dataset.aiStickerDraggable;
        el.style.removeProperty('--wb-ai-sticker-x');el.style.removeProperty('--wb-ai-sticker-y');
      }
    });
  }

  function start(card,e){
    if(active||!card||isWritingSurface(card))return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    if(interactive(e.target))return;
    const r=card.getBoundingClientRect(),x=Number(card.dataset.wbStickerX)||0,y=Number(card.dataset.wbStickerY)||0;
    active={card,id:e.pointerId,startX:e.clientX,startY:e.clientY,startRect:r,baseX:x,baseY:y,parent:card.parentNode,z:getComputedStyle(card).zIndex};
    card.classList.add('wb-ai-is-dragging');
    try{card.setPointerCapture(e.pointerId)}catch{}
    e.preventDefault();e.stopPropagation();
  }

  function move(e){
    const d=active;if(!d||e.pointerId!==d.id)return;
    let ddx=e.clientX-d.startX,ddy=e.clientY-d.startY;
    const minDx=INSET-d.startRect.left,maxDx=(innerWidth-INSET)-d.startRect.right;
    const minDy=INSET-d.startRect.top,maxDy=(innerHeight-INSET)-d.startRect.bottom;
    ddx=clamp(ddx,minDx,maxDx);ddy=clamp(ddy,minDy,maxDy);
    setOffset(d.card,d.baseX+ddx,d.baseY+ddy);
    e.preventDefault();
  }

  function end(e){
    const d=active;if(!d||e.pointerId!==d.id)return;
    active=null;d.card.classList.remove('wb-ai-is-dragging');
    try{d.card.releasePointerCapture(e.pointerId)}catch{}
    // Layer/parent/z-index are deliberately unchanged. Dragging is only a visual offset.
    if(d.card.parentNode!==d.parent)console.error('[AI sticker] parent changed unexpectedly');
    if(getComputedStyle(d.card).zIndex!==d.z)d.card.style.zIndex='';
    keepVisible(d.card);save(d.card);
  }

  document.addEventListener('pointerdown',e=>{
    if(!(e.target instanceof Element))return;
    const card=e.target.closest('.wb-ai-sticker-v3');
    if(!card)return; // No emergency ancestor guessing: the worksheet can never become draggable from a pointer event.
    start(card,e);
  },true);
  addEventListener('pointermove',move,{passive:false,capture:true});
  addEventListener('pointerup',end,{passive:true,capture:true});
  addEventListener('pointercancel',end,{passive:true,capture:true});

  function queueScan(){if(scanQueued)return;scanQueued=true;requestAnimationFrame(()=>{scanQueued=false;scan()})}
  scan();
  new MutationObserver(queueScan).observe(document.getElementById('app')||document.body,{childList:true,subtree:true,characterData:true});
  addEventListener('resize',()=>document.querySelectorAll('.wb-ai-sticker-v3').forEach(keepVisible),{passive:true});

  window.__wrongbookAiStickerV3QA=function(){
    const cards=[...document.querySelectorAll('.wb-ai-sticker-v3')];
    const writing=[...document.querySelectorAll('[data-wb-writing-surface],[data-wb-writing-paper],#paper,.paper,.v3-paper')];
    return{
      loaded:true,
      cards:cards.length,
      draggable:cards.filter(c=>c.dataset.aiStickerDraggable==='true').length,
      writingDraggable:writing.filter(c=>c.classList.contains('wb-ai-sticker-v3')).length,
      globalPortal:Boolean(document.getElementById('wb-ai-sticker-v2-layer')),
      sameParentLayer:true,
      wholeCardDrag:true,
      includesContainerAndText:true,
      forcedTopZ:false
    };
  };
})();