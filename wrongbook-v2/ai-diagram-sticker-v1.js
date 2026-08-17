// Wrongbook — movable AI diagram stickers.
// Explicit diagram cards use data-ai-diagram-card + data-ai-diagram-handle.
// When dragging starts the card is portaled to a fixed overlay so parent overflow/transforms
// cannot trap it. Generic "AI 圖解" cards still receive a conservative fallback upgrade.
(function(){
  if(window.__wrongbookAiDiagramStickerV1)return;
  window.__wrongbookAiDiagramStickerV1=true;

  const LABEL='AI 圖解';
  const READY='wbAiStickerReady';
  const INSET=12;
  const STORAGE_VERSION='v2';
  let topZ=100;
  let scanQueued=false;
  let activeDrag=null;

  const style=document.createElement('style');
  style.textContent=`
    #wb-ai-sticker-layer{
      position:fixed;inset:0;z-index:2147482000;pointer-events:none;
      width:100vw;height:100dvh;overflow:visible;
    }
    .wb-ai-sticker{
      position:relative;z-index:1;
      transition:box-shadow .14s ease,filter .14s ease;
    }
    #wb-ai-sticker-layer>.wb-ai-sticker.is-floating{
      position:absolute!important;right:auto!important;bottom:auto!important;
      margin:0!important;pointer-events:auto!important;
      max-width:calc(100vw - 24px)!important;
      max-height:calc(100dvh - 24px);
      overflow:auto;
      box-sizing:border-box;
    }
    .wb-ai-sticker.is-dragging{
      box-shadow:0 20px 52px rgba(37,32,26,.18)!important;
      filter:saturate(1.02);
    }
    .wb-ai-sticker-handle{
      cursor:grab!important;touch-action:none!important;
      -webkit-user-select:none!important;user-select:none!important;
    }
    .wb-ai-sticker.is-dragging .wb-ai-sticker-handle{cursor:grabbing!important}
    .wb-ai-sticker-placeholder{visibility:hidden!important;pointer-events:none!important}
    @media(prefers-reduced-motion:reduce){.wb-ai-sticker{transition:none}}
  `;
  document.head.appendChild(style);

  function norm(value){return String(value||'').replace(/\s+/g,' ').trim()}
  function clamp(n,min,max){return Math.min(Math.max(n,min),max)}
  function isInteractive(target){return Boolean(target?.closest?.('button,a,input,textarea,select,summary,[contenteditable="true"],[role="button"],[role="link"]'))}

  function layer(){
    let el=document.getElementById('wb-ai-sticker-layer');
    if(el)return el;
    el=document.createElement('div');
    el.id='wb-ai-sticker-layer';
    el.setAttribute('aria-live','off');
    document.body.appendChild(el);
    return el;
  }

  function textHash(value){
    let h=2166136261;
    for(const ch of value){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}
    return (h>>>0).toString(36);
  }

  function stickerTitle(card){
    const heading=[...card.querySelectorAll('h1,h2,h3,h4,strong,[class*="title" i]')]
      .map(el=>norm(el.textContent))
      .find(t=>t&&t!==LABEL&&!t.includes(LABEL)&&t.length<=90);
    return heading||norm(card.textContent).replace(LABEL,'').slice(0,90)||'diagram';
  }

  function storageKey(card){
    const stable=card.getAttribute('data-ai-diagram-card')||card.id||card.getAttribute('data-id')||card.getAttribute('data-key')||stickerTitle(card);
    return `wrongbook:ai-diagram-sticker:${STORAGE_VERSION}:${location.pathname}:${textHash(stable)}`;
  }

  function readSaved(card){
    try{
      const data=JSON.parse(localStorage.getItem(storageKey(card))||'null');
      if(!data||data.floating!==true||!Number.isFinite(data.left)||!Number.isFinite(data.top))return null;
      return data;
    }catch{return null}
  }

  function save(card){
    if(!card.classList.contains('is-floating'))return;
    const rect=card.getBoundingClientRect();
    try{
      localStorage.setItem(storageKey(card),JSON.stringify({
        floating:true,left:Math.round(rect.left),top:Math.round(rect.top),
        width:Math.round(rect.width),z:Number(card.style.zIndex)||topZ
      }));
    }catch{}
  }

  function bringForward(card,savedZ){
    topZ=Math.max(topZ+1,Number(savedZ)||0);
    card.style.zIndex=String(topZ);
  }

  function makePlaceholder(card,rect){
    const ph=document.createElement('div');
    ph.className='wb-ai-sticker-placeholder';
    ph.dataset.aiStickerPlaceholder='1';
    ph.style.width=`${Math.round(rect.width)}px`;
    ph.style.height=`${Math.round(rect.height)}px`;
    ph.style.maxWidth='100%';
    ph.style.flex='0 0 auto';
    const cs=getComputedStyle(card);
    ph.style.marginTop=cs.marginTop;
    ph.style.marginRight=cs.marginRight;
    ph.style.marginBottom=cs.marginBottom;
    ph.style.marginLeft=cs.marginLeft;
    return ph;
  }

  function floatCard(card,saved){
    if(card.classList.contains('is-floating'))return;
    const rect=card.getBoundingClientRect();
    const parent=card.parentNode;
    if(!parent)return;
    const ph=makePlaceholder(card,rect);
    parent.insertBefore(ph,card);
    card.__wbAiStickerAnchor=ph;
    card.__wbAiStickerOriginalParent=parent;
    layer().appendChild(card);
    card.classList.add('is-floating');
    card.style.width=`${Math.min(saved?.width||rect.width,Math.max(280,innerWidth-INSET*2))}px`;
    card.style.left=`${Math.round(saved?.left??rect.left)}px`;
    card.style.top=`${Math.round(saved?.top??rect.top)}px`;
    bringForward(card,saved?.z);
    keepVisible(card);
  }

  function keepVisible(card){
    if(!card.classList.contains('is-floating'))return;
    const rect=card.getBoundingClientRect();
    const maxWidth=Math.max(280,innerWidth-INSET*2);
    if(rect.width>maxWidth){
      card.style.width=`${maxWidth}px`;
    }
    const nextRect=card.getBoundingClientRect();
    const minLeft=INSET;
    const maxLeft=Math.max(INSET,innerWidth-nextRect.width-INSET);
    const minTop=INSET;
    const maxTop=Math.max(INSET,innerHeight-Math.min(nextRect.height,innerHeight-INSET*2)-INSET);
    const left=clamp(nextRect.left,minLeft,maxLeft);
    const top=clamp(nextRect.top,minTop,maxTop);
    card.style.left=`${Math.round(left)}px`;
    card.style.top=`${Math.round(top)}px`;
  }

  function labelNodes(root){
    const out=[];
    const base=root?.nodeType===1?root:document.body;
    const walker=document.createTreeWalker(base,NodeFilter.SHOW_TEXT,{acceptNode(node){
      const t=norm(node.nodeValue);
      if(!t||!t.includes(LABEL))return NodeFilter.FILTER_REJECT;
      const p=node.parentElement;
      if(!p||p.closest('script,style,template'))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    while(walker.nextNode())out.push(walker.currentNode.parentElement);
    return [...new Set(out)];
  }

  function looksLikeCard(el,label){
    if(!el||el===document.body||el===document.documentElement||el.id==='app'||!el.contains(label))return false;
    const rect=el.getBoundingClientRect();
    if(rect.width<260||rect.height<170)return false;
    if(rect.width>Math.max(innerWidth*.98,1200)||rect.height>Math.max(innerHeight*1.8,1400))return false;
    const cs=getComputedStyle(el);
    const radius=parseFloat(cs.borderTopLeftRadius)||0;
    return radius>=8||cs.boxShadow!=='none'||parseFloat(cs.borderTopWidth)>0||/card|panel|diagram|figure|visual/i.test(String(el.className||''));
  }

  function fallbackCard(label){
    let el=label;
    for(let i=0;i<10&&el&&el!==document.body;i++,el=el.parentElement){
      if(looksLikeCard(el,label))return el;
    }
    return null;
  }

  function fallbackHandle(card,label){
    const rect=card.getBoundingClientRect();
    let el=label;
    let best=label;
    while(el&&el!==card){
      const r=el.getBoundingClientRect();
      if(r.top<=rect.top+Math.min(120,rect.height*.3)&&r.height<=120){
        best=el;
        if(r.width>=rect.width*.55)break;
      }
      el=el.parentElement;
    }
    return best;
  }

  function beginDrag(card,handle,e){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    if(isInteractive(e.target))return;
    const saved=readSaved(card);
    floatCard(card,saved);
    const rect=card.getBoundingClientRect();
    bringForward(card);
    activeDrag={card,handle,id:e.pointerId,startX:e.clientX,startY:e.clientY,left:rect.left,top:rect.top,moved:false};
    card.classList.add('is-dragging');
    try{handle.setPointerCapture(e.pointerId)}catch{}
    e.preventDefault();
  }

  function moveDrag(e){
    const d=activeDrag;
    if(!d||e.pointerId!==d.id)return;
    const dx=e.clientX-d.startX;
    const dy=e.clientY-d.startY;
    if(Math.abs(dx)+Math.abs(dy)>2)d.moved=true;
    const rect=d.card.getBoundingClientRect();
    const minLeft=INSET;
    const maxLeft=Math.max(INSET,innerWidth-rect.width-INSET);
    const minTop=INSET;
    const visibleHeight=Math.min(rect.height,innerHeight-INSET*2);
    const maxTop=Math.max(INSET,innerHeight-visibleHeight-INSET);
    d.card.style.left=`${Math.round(clamp(d.left+dx,minLeft,maxLeft))}px`;
    d.card.style.top=`${Math.round(clamp(d.top+dy,minTop,maxTop))}px`;
    e.preventDefault();
  }

  function endDrag(e){
    const d=activeDrag;
    if(!d||e.pointerId!==d.id)return;
    activeDrag=null;
    d.card.classList.remove('is-dragging');
    try{d.handle.releasePointerCapture(e.pointerId)}catch{}
    keepVisible(d.card);
    save(d.card);
  }

  addEventListener('pointermove',moveDrag,{passive:false});
  addEventListener('pointerup',endDrag,{passive:true});
  addEventListener('pointercancel',endDrag,{passive:true});

  function upgradeCard(card,label){
    if(!card||card.dataset[READY]==='1')return;
    const handle=card.querySelector('[data-ai-diagram-handle]')||fallbackHandle(card,label||card);
    if(!handle)return;
    card.dataset[READY]='1';
    card.classList.add('wb-ai-sticker');
    handle.classList.add('wb-ai-sticker-handle');
    if(!handle.getAttribute('aria-label'))handle.setAttribute('aria-label','拖曳 AI 圖解');
    handle.addEventListener('pointerdown',e=>beginDrag(card,handle,e));
    const saved=readSaved(card);
    if(saved)requestAnimationFrame(()=>{if(card.isConnected){floatCard(card,saved);save(card)}});
  }

  function cleanOrphans(){
    const l=document.getElementById('wb-ai-sticker-layer');
    if(!l)return;
    for(const card of l.querySelectorAll('.wb-ai-sticker.is-floating')){
      const anchor=card.__wbAiStickerAnchor;
      if(anchor&&!anchor.isConnected){
        if(activeDrag?.card===card)activeDrag=null;
        card.remove();
      }
    }
  }

  function scan(root=document.getElementById('app')||document.body){
    cleanOrphans();
    const explicit=[];
    if(root.matches?.('[data-ai-diagram-card]'))explicit.push(root);
    explicit.push(...root.querySelectorAll?.('[data-ai-diagram-card]')||[]);
    for(const card of [...new Set(explicit)])upgradeCard(card);
    for(const label of labelNodes(root)){
      if(label.closest('[data-ai-diagram-card]'))continue;
      const card=fallbackCard(label);
      if(card)upgradeCard(card,label);
    }
  }

  function queueScan(){
    if(scanQueued)return;
    scanQueued=true;
    requestAnimationFrame(()=>{scanQueued=false;scan()});
  }

  scan();
  const app=document.getElementById('app')||document.body;
  new MutationObserver(queueScan).observe(app,{childList:true,subtree:true,characterData:true});

  addEventListener('resize',()=>{
    document.querySelectorAll('#wb-ai-sticker-layer>.wb-ai-sticker.is-floating').forEach(card=>{keepVisible(card);save(card)});
  },{passive:true});
})();