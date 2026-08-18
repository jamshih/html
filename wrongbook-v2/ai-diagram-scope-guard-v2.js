// Wrongbook — AI diagram scope guard V2.
// The draggable contract must belong to the tight visible diagram card, never to an oversized
// worksheet/window wrapper. The card still includes its border, visual, captions and text.
(function(){
  if(window.__wrongbookAiDiagramScopeGuardV2)return;
  window.__wrongbookAiDiagramScopeGuardV2=true;

  const LABEL='AI 圖解';
  const WRITING='#paper,.paper,.v3-paper,[data-wb-writing-surface],[data-wb-writing-paper]';
  const WRITING_CONTROLS='#drawCanvas,.canvas-layer,.paper-toolbar,.v3-guide-canvas,[data-guide-dock]';
  const VISUAL='svg,img,canvas:not(#drawCanvas):not(.canvas-layer):not(.v3-guide-canvas),[data-diagram-visual],[class*="diagram" i],[class*="figure" i],[class*="visual" i],[class*="illustration" i]';
  let queued=false;

  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const area=el=>{const r=el?.getBoundingClientRect?.();return r&&r.width>0&&r.height>0?r.width*r.height:Infinity};
  function hash(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
  function writingSurface(el){return Boolean(el&&(el.matches?.(WRITING)||el.querySelector?.(WRITING_CONTROLS)))}
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
    if(!el||el===boundary||el===document.body||el===document.documentElement||el.id==='app'||!el.contains(label)||writingSurface(el))return false;
    if(!hasVisual(el))return false; // header-only nodes and text-only wrappers are not diagram stickers.
    const r=el.getBoundingClientRect();if(r.width<180||r.height<90)return false;
    const cs=getComputedStyle(el),radius=parseFloat(cs.borderTopLeftRadius)||0,border=parseFloat(cs.borderTopWidth)||0;
    const classLike=/card|panel|diagram|figure|visual|illustration|explain|sticker/i.test(String(el.className||''));
    const tagLike=/^(SECTION|ARTICLE)$/i.test(el.tagName||'');
    return radius>=5||border>0||cs.boxShadow!=='none'||classLike||tagLike;
  }

  function tightRootFor(label){
    const boundary=label.closest(WRITING),candidates=[];
    let el=label;
    for(let i=0;i<14&&el&&el!==document.body&&el!==boundary;i++,el=el.parentElement){
      if(cardSurface(el,label,boundary))candidates.push(el);
    }
    if(!candidates.length)return null;
    // The former implementation selected the largest ancestor. That created the giant invisible
    // drag "window" seen around the small sticker. Pick the smallest complete visual card instead.
    candidates.sort((a,b)=>area(a)-area(b));
    const tight=candidates[0];
    const explicit=label.closest('[data-ai-diagram-card]');
    if(explicit&&!writingSurface(explicit)&&hasVisual(explicit)){
      const ea=area(explicit),ta=area(tight);
      // Keep a deliberate explicit card only when its box is essentially the same local card.
      if(Number.isFinite(ea)&&Number.isFinite(ta)&&ea<=ta*1.35)return explicit;
    }
    return tight;
  }

  function clearAutoContracts(root=document){
    root.querySelectorAll?.('[data-wb-ai-diagram-scope]').forEach(el=>{
      el.removeAttribute('data-wb-ai-diagram-scope');
      if(String(el.getAttribute('data-ai-diagram-card')||'').startsWith('scoped-'))el.removeAttribute('data-ai-diagram-card');
    });
    root.querySelectorAll?.('[data-ai-diagram-card]').forEach(el=>{
      if(writingSurface(el))el.removeAttribute('data-ai-diagram-card');
    });
  }

  function scan(root=document.getElementById('app')||document.body){
    markWriting();
    clearAutoContracts(root===document.body?document:root);
    for(const label of labels(root)){
      const card=tightRootFor(label);if(!card)continue;
      if(!card.hasAttribute('data-ai-diagram-card'))card.setAttribute('data-ai-diagram-card',`scoped-${hash(norm(card.textContent).slice(0,260))}`);
      card.dataset.wbAiDiagramScope='tight';
    }
  }

  function queue(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan()})}
  scan();
  new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true,characterData:true});

  window.__wrongbookAiDiagramScopeQA=()=>{
    const scoped=[...document.querySelectorAll('[data-wb-ai-diagram-scope="tight"]')];
    return{
      loaded:true,
      version:2,
      writingMarked:document.querySelectorAll('[data-wb-writing-surface],[data-wb-writing-paper]').length,
      scoped:scoped.length,
      broadWritingDiagramContracts:[...document.querySelectorAll('[data-ai-diagram-card]')].filter(writingSurface).length,
      tightRoots:scoped.every(card=>{
        const a=area(card);if(!Number.isFinite(a))return false;
        return ![...card.children].some(ch=>norm(ch.textContent).includes(LABEL)&&hasVisual(ch)&&area(ch)<a*.72);
      })
    };
  };
})();