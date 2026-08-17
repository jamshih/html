// Wrongbook — movable AI diagram stickers.
// Only cards explicitly labeled "AI 圖解" are upgraded. Other cards remain untouched.
(function(){
  if(window.__wrongbookAiDiagramStickerV1)return;
  window.__wrongbookAiDiagramStickerV1=true;

  const READY='wbAiStickerReady';
  const LABEL='AI 圖解';
  const INSET=12;
  let topZ=80;
  let scanQueued=false;

  const style=document.createElement('style');
  style.textContent=`
    .wb-ai-sticker{
      --wb-ai-sticker-x:0px;
      --wb-ai-sticker-y:0px;
      --wb-ai-sticker-z:80;
      position:relative;
      z-index:var(--wb-ai-sticker-z);
      translate:var(--wb-ai-sticker-x) var(--wb-ai-sticker-y);
      will-change:translate;
      transition:box-shadow .16s ease,filter .16s ease;
    }
    .wb-ai-sticker.is-dragging{
      box-shadow:0 18px 46px rgba(37,32,26,.16)!important;
      filter:saturate(1.015);
    }
    .wb-ai-sticker-handle{
      cursor:grab!important;
      touch-action:none;
      -webkit-user-select:none;
      user-select:none;
    }
    .wb-ai-sticker.is-dragging .wb-ai-sticker-handle{cursor:grabbing!important}
    @media (prefers-reduced-motion:reduce){
      .wb-ai-sticker{transition:none}
    }
  `;
  document.head.appendChild(style);

  function norm(value){return String(value||'').replace(/\s+/g,' ').trim()}
  function clamp(n,min,max){return Math.min(Math.max(n,min),max)}
  function numberVar(card,name){const n=parseFloat(card.style.getPropertyValue(name));return Number.isFinite(n)?n:0}
  function isInteractive(target){return Boolean(target?.closest?.('button,a,input,textarea,select,summary,[contenteditable="true"],[role="button"],[role="link"]'))}

  function textHash(value){
    let h=2166136261;
    for(const ch of value){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}
    return (h>>>0).toString(36);
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
    if(base.matches?.('*')&&norm(base.textContent)===LABEL)out.push(base);
    return [...new Set(out)];
  }

  function looksLikeCard(el,label){
    if(!el||el===document.body||el===document.documentElement||el.id==='app')return false;
    if(!el.contains(label))return false;
    const rect=el.getBoundingClientRect();
    if(rect.width<260||rect.height<170)return false;
    if(rect.width>Math.max(innerWidth*0.96,1100)||rect.height>Math.max(innerHeight*1.5,1100))return false;
    const visual=el.querySelector('svg,canvas,img,picture,[class*="diagram" i],[class*="figure" i],[class*="graphic" i],[class*="visual" i]');
    if(!visual)return false;
    const cs=getComputedStyle(el);
    const radius=parseFloat(cs.borderTopLeftRadius)||0;
    const cardLike=radius>=8||cs.boxShadow!=='none'||parseFloat(cs.borderTopWidth)>0||/card|panel|diagram|figure|visual/i.test(el.className||'');
    return cardLike;
  }

  function findCard(label){
    let el=label;
    const candidates=[];
    for(let i=0;i<9&&el&&el!==document.body;i++,el=el.parentElement){
      if(looksLikeCard(el,label))candidates.push(el);
    }
    if(!candidates.length)return null;
    // The first matching ancestor is the smallest card enclosing the label + diagram.
    return candidates[0];
  }

  function findHandle(card,label){
    const cardRect=card.getBoundingClientRect();
    let el=label;
    let best=null;
    while(el&&el!==card){
      const r=el.getBoundingClientRect();
      const nearTop=r.top<=cardRect.top+Math.min(110,cardRect.height*.26);
      const wide=r.width>=Math.min(220,cardRect.width*.45);
      const shallow=r.height<=Math.min(110,cardRect.height*.28);
      if(nearTop&&wide&&shallow)best=el;
      el=el.parentElement;
    }
    if(best)return best;
    // Fallback to the label's closest non-interactive wrapper; pointer start is still top-gated.
    return label.parentElement&&card.contains(label.parentElement)?label.parentElement:label;
  }

  function stickerTitle(card){
    const heading=[...card.querySelectorAll('h1,h2,h3,h4,strong,[class*="title" i]')]
      .map(el=>norm(el.textContent))
      .find(t=>t&&t!==LABEL&&!t.includes(LABEL)&&t.length<=90);
    if(heading)return heading;
    return norm(card.textContent).replace(LABEL,'').slice(0,90)||'diagram';
  }

  function storageKey(card){
    const stable=card.id||card.getAttribute('data-id')||card.getAttribute('data-key')||stickerTitle(card);
    return `wrongbook:ai-diagram-sticker:v1:${location.pathname}:${textHash(stable)}`;
  }

  function readSaved(card){
    try{
      const data=JSON.parse(localStorage.getItem(storageKey(card))||'null');
      return data&&Number.isFinite(data.x)&&Number.isFinite(data.y)?data:null;
    }catch{return null}
  }

  function save(card){
    try{
      localStorage.setItem(storageKey(card),JSON.stringify({
        x:numberVar(card,'--wb-ai-sticker-x'),
        y:numberVar(card,'--wb-ai-sticker-y'),
        z:Number(card.style.getPropertyValue('--wb-ai-sticker-z'))||topZ
      }));
    }catch{}
  }

  function setPos(card,x,y){
    card.style.setProperty('--wb-ai-sticker-x',`${Math.round(x)}px`);
    card.style.setProperty('--wb-ai-sticker-y',`${Math.round(y)}px`);
  }

  function bringForward(card,z){
    topZ=Math.max(topZ+1,Number(z)||0);
    card.style.setProperty('--wb-ai-sticker-z',String(topZ));
  }

  function usefulBounds(card){
    const cardRect=card.getBoundingClientRect();
    let el=card.parentElement;
    while(el&&el!==document.body&&el.id!=='app'){
      const r=el.getBoundingClientRect();
      const cls=String(el.className||'');
      const named=/workspace|stage|canvas|content|study|tutor|detail|sheet|page|learning|mind/i.test(cls);
      const roomy=r.width>=cardRect.width+100&&r.height>=cardRect.height+90;
      if(named&&roomy)return {left:r.left,top:r.top,right:r.right,bottom:r.bottom};
      el=el.parentElement;
    }
    return {left:0,top:0,right:document.documentElement.clientWidth,bottom:document.documentElement.clientHeight};
  }

  function keepVisible(card){
    const rect=card.getBoundingClientRect();
    const b=usefulBounds(card);
    let dx=0,dy=0;
    if(rect.left<b.left+INSET)dx=(b.left+INSET)-rect.left;
    if(rect.right>b.right-INSET)dx=(b.right-INSET)-rect.right;
    if(rect.top<b.top+INSET)dy=(b.top+INSET)-rect.top;
    if(rect.bottom>b.bottom-INSET)dy=(b.bottom-INSET)-rect.bottom;
    if(dx||dy)setPos(card,numberVar(card,'--wb-ai-sticker-x')+dx,numberVar(card,'--wb-ai-sticker-y')+dy);
  }

  function upgrade(label){
    if(!label?.isConnected)return;
    const card=findCard(label);
    if(!card||card.dataset[READY]==='1')return;
    const handle=findHandle(card,label);
    if(!handle)return;

    card.dataset[READY]='1';
    card.classList.add('wb-ai-sticker');
    handle.classList.add('wb-ai-sticker-handle');
    if(!handle.getAttribute('aria-label')&&!isInteractive(handle))handle.setAttribute('aria-label','拖曳 AI 圖解');

    const saved=readSaved(card);
    if(saved){setPos(card,saved.x,saved.y);bringForward(card,saved.z)}
    else bringForward(card);
    requestAnimationFrame(()=>keepVisible(card));

    let drag=null;
    handle.addEventListener('pointerdown',e=>{
      if(e.pointerType==='mouse'&&e.button!==0)return;
      // Buttons/menus inside the header keep their normal action. The rest of the header drags.
      if(isInteractive(e.target)&&!e.target.closest('[data-ai-sticker-handle],[aria-label*="拖曳"]'))return;
      const rect=card.getBoundingClientRect();
      if(e.clientY>rect.top+Math.min(115,rect.height*.3))return;
      const bounds=usefulBounds(card);
      drag={
        id:e.pointerId,startX:e.clientX,startY:e.clientY,
        x:numberVar(card,'--wb-ai-sticker-x'),y:numberVar(card,'--wb-ai-sticker-y'),
        minDX:bounds.left+INSET-rect.left,maxDX:bounds.right-INSET-rect.right,
        minDY:bounds.top+INSET-rect.top,maxDY:bounds.bottom-INSET-rect.bottom
      };
      bringForward(card);
      card.classList.add('is-dragging');
      try{handle.setPointerCapture(e.pointerId)}catch{}
      e.preventDefault();
    });

    handle.addEventListener('pointermove',e=>{
      if(!drag||drag.id!==e.pointerId)return;
      const dx=clamp(e.clientX-drag.startX,drag.minDX,drag.maxDX);
      const dy=clamp(e.clientY-drag.startY,drag.minDY,drag.maxDY);
      setPos(card,drag.x+dx,drag.y+dy);
      e.preventDefault();
    });

    function finish(e){
      if(!drag||e.pointerId!==drag.id)return;
      drag=null;
      card.classList.remove('is-dragging');
      try{handle.releasePointerCapture(e.pointerId)}catch{}
      keepVisible(card);
      save(card);
    }
    handle.addEventListener('pointerup',finish);
    handle.addEventListener('pointercancel',finish);
  }

  function scan(root=document.body){
    requestAnimationFrame(()=>{
      for(const label of labelNodes(root))upgrade(label);
    });
  }

  function queueScan(){
    if(scanQueued)return;
    scanQueued=true;
    requestAnimationFrame(()=>{scanQueued=false;scan(document.getElementById('app')||document.body)});
  }

  scan(document.getElementById('app')||document.body);
  const observer=new MutationObserver(queueScan);
  observer.observe(document.getElementById('app')||document.body,{childList:true,subtree:true,characterData:true});

  addEventListener('resize',()=>{
    document.querySelectorAll('.wb-ai-sticker').forEach(card=>{keepVisible(card);save(card)});
  },{passive:true});
})();