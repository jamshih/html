// Wrongbook — AI diagram scope guard V3.
// One draggable contract = one complete visible AI card: header + diagram + footer text/chips + border.
(function(){
  if(window.__wrongbookAiDiagramScopeGuardV3)return;
  window.__wrongbookAiDiagramScopeGuardV3=true;

  const LABEL='AI 圖解';
  const FULL='full';
  const WRITING='#paper,.paper,.v3-paper,[data-wb-writing-surface],[data-wb-writing-paper]';
  const VISUAL='svg,img,canvas:not(#drawCanvas):not(.canvas-layer):not(.v3-guide-canvas),[data-diagram-visual],[class*="diagram" i],[class*="figure" i],[class*="visual" i],[class*="illustration" i]';
  let queued=false;

  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const rect=el=>el?.getBoundingClientRect?.()||null;
  const area=el=>{const r=rect(el);return r&&r.width>0&&r.height>0?r.width*r.height:Infinity};
  function hash(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
  function isWritingRoot(el){return Boolean(el?.matches?.(WRITING))}
  function hasVisual(el){return Boolean(el?.querySelector?.(VISUAL))}

  function markWriting(){
    document.querySelectorAll('#paper,.paper,.v3-paper').forEach(p=>{
      p.dataset.wbWritingPaper='1';
      const panel=p.closest('section.panel,article.panel,[class*="workspace" i]');
      if(panel)panel.dataset.wbWritingSurface='1';
    });
  }

  function labels(root){
    const out=[],base=root?.nodeType===1?root:document.body;
    const walker=document.createTreeWalker(base,NodeFilter.SHOW_TEXT,{acceptNode(n){
      const p=n.parentElement;
      return p&&!p.closest('script,style,template')&&norm(n.nodeValue).includes(LABEL)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
    }});
    while(walker.nextNode())out.push(walker.currentNode.parentElement);
    return [...new Set(out)];
  }

  function cardSurface(el,label,boundary){
    if(!el||el===boundary||el===document.body||el===document.documentElement||el.id==='app'||!el.contains(label)||isWritingRoot(el))return false;
    if(!hasVisual(el))return false;
    const r=rect(el);if(!r||r.width<180||r.height<90)return false;
    const cs=getComputedStyle(el),radius=parseFloat(cs.borderTopLeftRadius)||0,border=parseFloat(cs.borderTopWidth)||0;
    const classLike=/card|panel|diagram|figure|visual|illustration|explain|sticker/i.test(String(el.className||''));
    const tagLike=/^(SECTION|ARTICLE)$/i.test(el.tagName||'');
    return radius>=5||border>0||cs.boxShadow!=='none'||classLike||tagLike;
  }

  function fullRootFor(label){
    // Worksheet overlay V9 already has the exact product contract the user sees: the outer card
    // contains the cloned AI diagram AND the key-concept chips. Never select its nested V8 diagram.
    const sheetCard=label.closest('.v9-sheet-ai-card');
    if(sheetCard&&hasVisual(sheetCard))return sheetCard;

    // Dedicated renderers may explicitly mark their outer visible card. Trust that contract unless
    // it is literally the writing surface itself.
    const explicit=label.closest('[data-wb-ai-sticker-scope="full"],[data-ai-diagram-card]');
    if(explicit&&!isWritingRoot(explicit)&&hasVisual(explicit))return explicit;

    const boundary=label.closest(WRITING),candidates=[];
    let el=label;
    for(let i=0;i<14&&el&&el!==document.body&&el!==boundary;i++,el=el.parentElement){
      if(cardSurface(el,label,boundary))candidates.push(el);
    }
    if(!candidates.length)return null;

    // Start at the tight visual card, then grow only to a LOCAL card shell. This intentionally
    // allows the footer/chip strip (roughly +35–60% height) while rejecting worksheet/window wrappers.
    candidates.sort((a,b)=>area(a)-area(b));
    const tight=candidates[0],tr=rect(tight),ta=area(tight);
    if(!tr||!Number.isFinite(ta))return tight;
    const local=candidates.filter(c=>{
      const r=rect(c),a=area(c);if(!r||!Number.isFinite(a))return false;
      return a<=ta*2.35&&r.width<=tr.width*1.45&&r.height<=tr.height*2.05;
    });
    return local.length?local[local.length-1]:tight;
  }

  function clearGenerated(root=document){
    root.querySelectorAll?.('[data-wb-ai-sticker-scope],[data-wb-ai-diagram-scope]').forEach(el=>{
      el.removeAttribute('data-wb-ai-sticker-scope');
      el.removeAttribute('data-wb-ai-diagram-scope');
      if(/^(scoped-|full-)/.test(String(el.getAttribute('data-ai-diagram-card')||'')))el.removeAttribute('data-ai-diagram-card');
    });
  }

  function stripNestedContracts(card){
    if(!card)return;
    card.querySelectorAll('[data-wb-ai-sticker-scope],[data-wb-ai-diagram-scope]').forEach(el=>{
      el.removeAttribute('data-wb-ai-sticker-scope');el.removeAttribute('data-wb-ai-diagram-scope');
    });
    card.querySelectorAll('[data-ai-diagram-card]').forEach(el=>{
      if(/^(scoped-|full-)/.test(String(el.getAttribute('data-ai-diagram-card')||'')))el.removeAttribute('data-ai-diagram-card');
    });
    // Remove the obsolete visual-only draggable class. V5 captures the outer card at document level,
    // so any already-bound legacy listener can no longer win pointerdown on the inner diagram.
    card.querySelectorAll('.wb-ai-sticker-v2,.wb-ai-sticker-v3,.wb-ai-sticker-v4').forEach(el=>{
      el.classList.remove('wb-ai-sticker-v2','wb-ai-sticker-v3','wb-ai-sticker-v4','wb-ai-is-dragging');
      delete el.dataset.aiStickerDraggable;
      el.style.removeProperty('--wb-ai-sticker-x');el.style.removeProperty('--wb-ai-sticker-y');
    });
  }

  function markFull(card){
    if(!card||isWritingRoot(card)||!hasVisual(card))return false;
    stripNestedContracts(card);
    card.dataset.wbAiStickerScope=FULL;
    card.dataset.wbAiDiagramScope=FULL;
    if(!card.hasAttribute('data-ai-diagram-card'))card.setAttribute('data-ai-diagram-card',`full-${hash(norm(card.textContent).slice(0,320))}`);
    return true;
  }

  function scan(root=document.getElementById('app')||document.body){
    markWriting();
    const cleanupRoot=root===document.body?document:root;
    clearGenerated(cleanupRoot);

    // Explicit worksheet overlay cards are always one complete sticker, even if text nodes mutate.
    root.querySelectorAll?.('.v9-sheet-ai-card').forEach(markFull);
    for(const label of labels(root))markFull(fullRootFor(label));
  }

  function queue(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan()})}
  scan();
  new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true,characterData:true});

  window.__wrongbookAiDiagramScopeQA=()=>{
    const full=[...document.querySelectorAll('[data-wb-ai-sticker-scope="full"]')];
    const sheet=[...document.querySelectorAll('.v9-sheet-ai-card')];
    return{
      loaded:true,version:3,fullCards:full.length,
      sheetCards:sheet.length,
      sheetCardsAreFull:sheet.every(card=>card.dataset.wbAiStickerScope==='full'),
      nestedLegacyDraggables:full.reduce((n,card)=>n+card.querySelectorAll('.wb-ai-sticker-v2,.wb-ai-sticker-v3,.wb-ai-sticker-v4').length,0),
      writingRootMarked:full.some(isWritingRoot),
      completeCardContract:full.every(card=>hasVisual(card)&&norm(card.textContent).includes(LABEL))
    };
  };
})();