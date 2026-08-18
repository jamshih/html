// Wrongbook — AI diagram sticker V2.
// Contract: every rendered card containing the visible label "AI 圖解" is draggable from
// ANY non-interactive point on the card. We intentionally do not rely on a tiny header handle.
(function(){
  if(window.__wrongbookAiDiagramStickerV2)return;
  window.__wrongbookAiDiagramStickerV2=true;

  const LABEL='AI 圖解';
  const INSET=12;
  const READY='wbAiStickerV2Ready';
  const STORE='wrongbook:ai-diagram-sticker:v4';
  let topZ=2147482100;
  let active=null;
  let scanQueued=false;

  const style=document.createElement('style');
  style.textContent=`
    #wb-ai-sticker-v2-layer{
      position:fixed!important;
      inset:0!important;
      width:100vw!important;
      height:100dvh!important;
      pointer-events:none!important;
      overflow:visible!important;
      z-index:2147482000!important;
    }
    .wb-ai-sticker-v2{
      cursor:grab!important;
      touch-action:none!important;
      -webkit-user-select:none!important;
      user-select:none!important;
    }
    .wb-ai-sticker-v2 *:not(button):not(a):not(input):not(textarea):not(select):not(summary):not([contenteditable="true"]){cursor:grab!important}
    .wb-ai-sticker-v2 button,.wb-ai-sticker-v2 a,.wb-ai-sticker-v2 input,.wb-ai-sticker-v2 textarea,.wb-ai-sticker-v2 select,.wb-ai-sticker-v2 summary,.wb-ai-sticker-v2 [contenteditable="true"]{
      touch-action:auto!important;
      user-select:auto!important;
    }
    #wb-ai-sticker-v2-layer>.wb-ai-sticker-v2.wb-ai-is-floating{
      position:absolute!important;
      right:auto!important;
      bottom:auto!important;
      margin:0!important;
      pointer-events:auto!important;
      box-sizing:border-box!important;
      max-width:calc(100vw - 24px)!important;
      max-height:calc(100dvh - 24px)!important;
      overflow:auto!important;
      transform:none!important;
      translate:none!important;
    }
    .wb-ai-sticker-v2.wb-ai-is-dragging{
      cursor:grabbing!important;
      box-shadow:0 22px 56px rgba(35,31,27,.22)!important;
      filter:saturate(1.02);
    }
    .wb-ai-sticker-v2.wb-ai-is-dragging *{cursor:grabbing!important}
    .wb-ai-sticker-v2-placeholder{visibility:hidden!important;pointer-events:none!important}
  `;
  document.head.appendChild(style);

  function norm(v){return String(v||'').replace(/\s+/g,' ').trim()}
  function clamp(v,min,max){return Math.min(Math.max(v,min),max)}
  function interactive(target){return Boolean(target?.closest?.('button,a,input,textarea,select,summary,[contenteditable="true"],[role="button"],[role="link"]'))}

  function layer(){
    let el=document.getElementById('wb-ai-sticker-v2-layer');
    if(el)return el;
    el=document.createElement('div');
    el.id='wb-ai-sticker-v2-layer';
    document.body.appendChild(el);
    return el;
  }

  function hash(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}

  function title(card){
    const node=[...card.querySelectorAll('h1,h2,h3,h4,strong,[class*="title" i]')].find(el=>{const t=norm(el.textContent);return t&&t!==LABEL&&!t.includes(LABEL)&&t.length<100});
    return norm(node?.textContent)||norm(card.textContent).replace(LABEL,'').slice(0,100)||'ai-diagram';
  }

  function storageKey(card){const stable=card.getAttribute('data-ai-diagram-card')||card.id||card.getAttribute('data-id')||title(card);return `${STORE}:${location.pathname}:${hash(stable)}`}
  function readSaved(card){try{const data=JSON.parse(localStorage.getItem(storageKey(card))||'null');return data&&data.floating===true&&Number.isFinite(data.left)&&Number.isFinite(data.top)?data:null}catch{return null}}
  function save(card){if(!card.classList.contains('wb-ai-is-floating'))return;const r=card.getBoundingClientRect();try{localStorage.setItem(storageKey(card),JSON.stringify({floating:true,left:Math.round(r.left),top:Math.round(r.top),width:Math.round(r.width),z:Number(card.style.zIndex)||topZ}))}catch{}}
  function bringFront(card,z){topZ=Math.max(topZ+1,Number(z)||0);card.style.zIndex=String(topZ)}

  function placeholder(card,rect){
    const ph=document.createElement('div');
    ph.className='wb-ai-sticker-v2-placeholder';
    ph.style.width=`${Math.round(rect.width)}px`;ph.style.height=`${Math.round(rect.height)}px`;ph.style.maxWidth='100%';
    const cs=getComputedStyle(card);ph.style.margin=cs.margin;ph.style.flex=cs.flex;
    return ph;
  }

  function float(card,saved){
    if(card.classList.contains('wb-ai-is-floating'))return;
    const rect=card.getBoundingClientRect(),parent=card.parentNode;if(!parent)return;
    const ph=placeholder(card,rect);parent.insertBefore(ph,card);card.__wbAiV2Anchor=ph;layer().appendChild(card);card.classList.add('wb-ai-is-floating');
    const width=Math.min(Number(saved?.width)||rect.width,Math.max(280,innerWidth-INSET*2));
    card.style.width=`${Math.round(width)}px`;card.style.left=`${Math.round(saved?.left??rect.left)}px`;card.style.top=`${Math.round(saved?.top??rect.top)}px`;
    bringFront(card,saved?.z);keepVisible(card);
  }

  function keepVisible(card){
    if(!card.classList.contains('wb-ai-is-floating'))return;
    let r=card.getBoundingClientRect();const maxWidth=Math.max(280,innerWidth-INSET*2);
    if(r.width>maxWidth){card.style.width=`${maxWidth}px`;r=card.getBoundingClientRect()}
    const visibleHeight=Math.min(r.height,Math.max(80,innerHeight-INSET*2));
    card.style.left=`${Math.round(clamp(r.left,INSET,Math.max(INSET,innerWidth-r.width-INSET)))}px`;
    card.style.top=`${Math.round(clamp(r.top,INSET,Math.max(INSET,innerHeight-visibleHeight-INSET)))}px`;
  }

  function cleanOrphans(){
    const l=document.getElementById('wb-ai-sticker-v2-layer');if(!l)return;
    for(const card of l.querySelectorAll('.wb-ai-sticker-v2.wb-ai-is-floating')){
      const anchor=card.__wbAiV2Anchor;
      if(anchor&&!anchor.isConnected){
        if(active?.card===card)active=null;
        card.remove();
      }
    }
  }

  function labelElements(root){
    const base=root?.nodeType===1?root:document.body,out=[];
    const walker=document.createTreeWalker(base,NodeFilter.SHOW_TEXT,{acceptNode(node){const p=node.parentElement;return p&&!p.closest('script,style,template')&&norm(node.nodeValue).includes(LABEL)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
    while(walker.nextNode())out.push(walker.currentNode.parentElement);
    return [...new Set(out)];
  }

  function looksLikeCard(el,label){
    if(!el||el===document.body||el===document.documentElement||el.id==='app'||!el.contains(label))return false;
    const r=el.getBoundingClientRect();if(r.width<240||r.height<150)return false;if(r.width>Math.max(innerWidth*.99,1500)||r.height>Math.max(innerHeight*2,1800))return false;
    const cs=getComputedStyle(el),radius=parseFloat(cs.borderTopLeftRadius)||0,border=parseFloat(cs.borderTopWidth)||0;
    const classLike=/card|panel|diagram|figure|visual|illustration|explain/i.test(String(el.className||''));
    const tagLike=/^(SECTION|ARTICLE)$/i.test(el.tagName||'');
    const surface=radius>=6||border>0||cs.boxShadow!=='none'||classLike||tagLike;
    return surface;
  }

  function cardForLabel(label){
    const explicit=label.closest('[data-ai-diagram-card]');if(explicit)return explicit;
    let el=label;const candidates=[];
    for(let i=0;i<12&&el&&el!==document.body;i++,el=el.parentElement)if(looksLikeCard(el,label))candidates.push(el);
    return candidates[0]||null;
  }

  function upgrade(card){
    if(!card||card.dataset[READY]==='1')return;
    card.dataset[READY]='1';
    if(!card.hasAttribute('data-ai-diagram-card'))card.setAttribute('data-ai-diagram-card',`generic-${hash(title(card))}`);
    card.classList.add('wb-ai-sticker-v2');card.setAttribute('data-ai-sticker-draggable','true');
    const saved=readSaved(card);if(saved)requestAnimationFrame(()=>{if(card.isConnected){float(card,saved);save(card)}});
  }

  function scan(root=document.getElementById('app')||document.body){
    cleanOrphans();
    const explicit=[];if(root.matches?.('[data-ai-diagram-card]'))explicit.push(root);explicit.push(...(root.querySelectorAll?.('[data-ai-diagram-card]')||[]));for(const card of explicit)upgrade(card);
    for(const label of labelElements(root)){const card=cardForLabel(label);if(card)upgrade(card)}
  }

  function cardFromPointer(target){
    if(!(target instanceof Element))return null;
    const ready=target.closest('.wb-ai-sticker-v2,[data-ai-diagram-card]');if(ready){upgrade(ready);return ready}
    // Emergency path: if observer/DOM heuristics have not run yet, climb from the exact pointer
    // and take the smallest card-like ancestor whose text includes AI 圖解. No SVG/image requirement.
    let el=target;
    for(let i=0;i<12&&el&&el!==document.body;i++,el=el.parentElement){
      if(!norm(el.textContent).includes(LABEL))continue;
      const r=el.getBoundingClientRect();if(r.width<240||r.height<150)continue;
      const cs=getComputedStyle(el),radius=parseFloat(cs.borderTopLeftRadius)||0,border=parseFloat(cs.borderTopWidth)||0;
      if(radius>=6||border>0||cs.boxShadow!=='none'||/card|panel|diagram|figure|visual|illustration|explain/i.test(String(el.className||''))||/^(SECTION|ARTICLE)$/i.test(el.tagName||'')){
        upgrade(el);return el;
      }
    }
    return null;
  }

  function start(card,e){
    if(active)return;if(e.pointerType==='mouse'&&e.button!==0)return;if(interactive(e.target))return;
    const saved=readSaved(card);float(card,saved);const r=card.getBoundingClientRect();bringFront(card);
    active={card,id:e.pointerId,startX:e.clientX,startY:e.clientY,left:r.left,top:r.top};card.classList.add('wb-ai-is-dragging');
    try{card.setPointerCapture(e.pointerId)}catch{}
    e.preventDefault();e.stopPropagation();
  }

  function move(e){
    const d=active;if(!d||e.pointerId!==d.id)return;
    const r=d.card.getBoundingClientRect(),visibleHeight=Math.min(r.height,Math.max(80,innerHeight-INSET*2));
    d.card.style.left=`${Math.round(clamp(d.left+(e.clientX-d.startX),INSET,Math.max(INSET,innerWidth-r.width-INSET)))}px`;
    d.card.style.top=`${Math.round(clamp(d.top+(e.clientY-d.startY),INSET,Math.max(INSET,innerHeight-visibleHeight-INSET)))}px`;
    e.preventDefault();
  }

  function end(e){
    const d=active;if(!d||e.pointerId!==d.id)return;active=null;d.card.classList.remove('wb-ai-is-dragging');
    try{d.card.releasePointerCapture(e.pointerId)}catch{}keepVisible(d.card);save(d.card);
  }

  // Entire-card delegated drag in capture phase. The generated diagram can change its internal
  // markup without breaking drag: any non-interactive pixel on the AI card starts the sticker.
  document.addEventListener('pointerdown',e=>{const card=cardFromPointer(e.target);if(card)start(card,e)},true);
  addEventListener('pointermove',move,{passive:false,capture:true});
  addEventListener('pointerup',end,{passive:true,capture:true});
  addEventListener('pointercancel',end,{passive:true,capture:true});

  function queueScan(){if(scanQueued)return;scanQueued=true;requestAnimationFrame(()=>{scanQueued=false;scan()})}
  scan();new MutationObserver(queueScan).observe(document.getElementById('app')||document.body,{childList:true,subtree:true,characterData:true});
  addEventListener('resize',()=>document.querySelectorAll('#wb-ai-sticker-v2-layer>.wb-ai-sticker-v2').forEach(card=>{keepVisible(card);save(card)}),{passive:true});

  window.__wrongbookAiStickerV2QA=function(){
    const cards=[...document.querySelectorAll('.wb-ai-sticker-v2')];
    return {loaded:true,cards:cards.length,draggable:cards.filter(c=>c.dataset.aiStickerDraggable==='true').length,floating:cards.filter(c=>c.classList.contains('wb-ai-is-floating')).length,layer:Boolean(document.getElementById('wb-ai-sticker-v2-layer')),wholeCardDrag:true,orphanGuard:true};
  };
})();