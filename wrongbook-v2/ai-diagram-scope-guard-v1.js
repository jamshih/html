// Wrongbook — scope every AI diagram to its own local card before renderer/drag runtimes run.
// Prevents generic AI-label heuristics from ever selecting the handwriting worksheet panel.
(function(){
  if(window.__wrongbookAiDiagramScopeGuardV1)return;
  window.__wrongbookAiDiagramScopeGuardV1=true;
  const LABEL='AI 圖解';
  const WRITING='#paper,.paper,.v3-paper,[data-wb-writing-surface],[data-wb-writing-paper]';
  const WRITING_CONTROLS='#drawCanvas,.canvas-layer,.paper-toolbar,.v3-guide-canvas,[data-guide-dock]';
  let queued=false;
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  function hash(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
  function writingSurface(el){return Boolean(el&&(el.matches?.(WRITING)||el.querySelector?.(WRITING_CONTROLS)))}
  function markWriting(){document.querySelectorAll('#paper,.paper,.v3-paper').forEach(p=>{p.dataset.wbWritingPaper='1';const panel=p.closest('section.panel,article.panel,[class*="workspace" i]');if(panel)panel.dataset.wbWritingSurface='1'})}
  function labels(root){const out=[],base=root?.nodeType===1?root:document.body,walker=document.createTreeWalker(base,NodeFilter.SHOW_TEXT,{acceptNode(n){const p=n.parentElement;return p&&!p.closest('script,style,template')&&norm(n.nodeValue).includes(LABEL)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});while(walker.nextNode())out.push(walker.currentNode.parentElement);return[...new Set(out)]}
  function signal(el){return Boolean(el.querySelector?.('svg,canvas,img,[class*="diagram" i],[class*="figure" i],[class*="visual" i],[class*="illustration" i],[class*="result" i],[class*="chip" i],[class*="tag" i]'))}
  function safe(el,label,boundary){if(!el||el===boundary||el===document.body||el===document.documentElement||el.id==='app'||!el.contains(label)||writingSurface(el))return false;const r=el.getBoundingClientRect();if(r.width<220||r.height<100)return false;const cs=getComputedStyle(el),radius=parseFloat(cs.borderTopLeftRadius)||0,border=parseFloat(cs.borderTopWidth)||0;return signal(el)||radius>=6||border>0||cs.boxShadow!=='none'||/card|panel|diagram|figure|visual|illustration|explain|sticker/i.test(String(el.className||''))||/^(SECTION|ARTICLE)$/i.test(el.tagName||'')}
  function rootFor(label){const explicit=label.closest('[data-ai-diagram-card]');if(explicit&&!writingSurface(explicit))return explicit;const boundary=label.closest(WRITING),candidates=[];let el=label;for(let i=0;i<12&&el&&el!==document.body&&el!==boundary;i++,el=el.parentElement)if(safe(el,label,boundary))candidates.push(el);return candidates.length?candidates[candidates.length-1]:null}
  function scan(root=document.getElementById('app')||document.body){markWriting();document.querySelectorAll('[data-ai-diagram-card]').forEach(el=>{if(writingSurface(el)){el.removeAttribute('data-ai-diagram-card');el.removeAttribute('data-wb-ai-diagram-scope')}});for(const label of labels(root)){const card=rootFor(label);if(!card)continue;if(!card.hasAttribute('data-ai-diagram-card'))card.setAttribute('data-ai-diagram-card',`scoped-${hash(norm(card.textContent).slice(0,220))}`);card.dataset.wbAiDiagramScope='1'}}
  function queue(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan()})}
  scan();new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true,characterData:true});
  window.__wrongbookAiDiagramScopeQA=()=>({loaded:true,writingMarked:document.querySelectorAll('[data-wb-writing-surface],[data-wb-writing-paper]').length,scoped:document.querySelectorAll('[data-wb-ai-diagram-scope="1"]').length,broadWritingDiagramContracts:[...document.querySelectorAll('[data-ai-diagram-card]')].filter(writingSurface).length});
})();