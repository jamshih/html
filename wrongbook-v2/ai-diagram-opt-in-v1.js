// Wrong Book — AI diagram opt-in visibility gate.
// Keeps legacy paper hints from sticking to the workspace and only reveals AI diagrams after an explicit user action.
(function(){
  'use strict';
  const VERSION='2026-08-18-ai-diagram-opt-in-v1.1';
  if(window.__wrongbookAiDiagramOptInV1===VERSION)return;
  window.__wrongbookAiDiagramOptInV1=VERSION;

  const STYLE_ID='wrongbookAiDiagramOptInV1Style';
  const CONTROL='[data-wb-diagram-opt-in-control="1"]';
  const BUTTON='[data-wb-diagram-opt-in="1"]';
  const LEGACY_OVERLAY='.ai-overlay-note,[data-ai-overlay-note]';
  const CARD_SELECTORS=[
    '.ai-problem-diagram-main',
    '.v9-sheet-ai-card',
    '[data-wb-dedicated-diagram="1"]',
    '.v8-ai-diagram',
    '[data-wb-ai-sticker-scope="full"]',
    '[data-wb-ai-diagram-scope="full"]'
  ].join(',');
  const openProblems=new Set();
  let queued=false;

  const scoped=(prefix,selectors)=>selectors.split(',').map(selector=>`${prefix} ${selector.trim()}`).join(',');
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    const overlayCss=[scoped('.pf-problem-workspace',LEGACY_OVERLAY),scoped('.problem-details',LEGACY_OVERLAY)].join(',');
    const closedCss=[
      scoped('.pf-problem-workspace:not([data-wb-diagram-opt-in-open="1"])',CARD_SELECTORS),
      scoped('.problem-details:not([data-wb-diagram-opt-in-open="1"])',CARD_SELECTORS)
    ].join(',');
    style.textContent=`
      ${overlayCss}{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important}
      ${closedCss}{display:none!important;visibility:hidden!important;pointer-events:none!important}
      .wb-diagram-opt-in-control{display:flex;align-items:center;justify-content:flex-start;padding:0 0 12px;margin:0}
      .wb-diagram-opt-in-control .soft-btn{min-height:38px;white-space:nowrap}
    `;
    document.head.appendChild(style);
  }

  const norm=value=>String(value||'').replace(/\s+/g,' ').trim();
  const root=()=>document.querySelector('.pf-problem-workspace')||document.querySelector('.problem-details');
  function problemKey(workspace=root()){
    try{
      const p=typeof selectedProblem==='function'?selectedProblem():null;
      if(p?.id)return String(p.id);
    }catch{}
    try{
      const id=window.state?.selectedProblemId||window.state?.activeProblemId;
      if(id)return String(id);
    }catch{}
    return String(workspace?.dataset?.problemId||'current');
  }

  function isDiagramCard(el){
    if(!(el instanceof Element))return false;
    if(el.matches(CARD_SELECTORS))return true;
    if(!el.matches('[data-ai-diagram-card]'))return false;
    const text=norm(el.textContent);
    return text.includes('AI 圖解')||text.includes('圖解')||Boolean(el.querySelector('svg,img,canvas,[data-diagram-visual]'));
  }

  function collectDiagramCards(workspace){
    if(!workspace)return[];
    const out=new Set();
    if(isDiagramCard(workspace))out.add(workspace);
    workspace.querySelectorAll(CARD_SELECTORS+', [data-ai-diagram-card]').forEach(el=>{if(isDiagramCard(el))out.add(el)});
    // If a nested selector and its full-card parent both matched, keep only the outer visible contract.
    return[...out].filter(el=>![...out].some(other=>other!==el&&other.contains(el)&&isDiagramCard(other)));
  }

  function suppressLegacyOverlays(workspace){
    if(!workspace)return 0;
    const nodes=[...workspace.querySelectorAll(LEGACY_OVERLAY)];
    for(const node of nodes){
      node.hidden=true;
      node.setAttribute('aria-hidden','true');
      node.style.setProperty('display','none','important');
      node.style.setProperty('visibility','hidden','important');
      node.style.setProperty('pointer-events','none','important');
      node.replaceChildren();
    }
    return nodes.length;
  }

  function setCardVisible(card,visible){
    if(!card)return;
    card.dataset.wbDiagramOptIn=visible?'open':'closed';
    card.setAttribute('aria-hidden',visible?'false':'true');
    if(visible){
      card.hidden=false;
      card.removeAttribute('hidden');
      card.style.removeProperty('display');
      card.style.removeProperty('visibility');
      card.style.removeProperty('pointer-events');
    }else{
      card.hidden=true;
      card.style.setProperty('display','none','important');
      card.style.setProperty('visibility','hidden','important');
      card.style.setProperty('pointer-events','none','important');
    }
  }

  function controlHost(workspace){
    return workspace?.querySelector('.pf-context-rail')||workspace?.querySelector('.problem-context-rail')||workspace;
  }

  function ensureControl(workspace){
    if(!workspace)return null;
    const host=controlHost(workspace);if(!host)return null;
    let control=workspace.querySelector(CONTROL);
    if(!control){
      control=document.createElement('div');
      control.className='wb-diagram-opt-in-control';
      control.dataset.wbDiagramOptInControl='1';
      control.innerHTML='<button type="button" class="soft-btn" data-wb-diagram-opt-in="1" aria-expanded="false">開始圖解</button>';
      host.prepend(control);
    }else if(control.parentElement!==host){host.prepend(control)}
    return control.querySelector(BUTTON);
  }

  function updateButton(button,open){
    if(!button)return;
    button.textContent=open?'收起圖解':'開始圖解';
    button.setAttribute('aria-expanded',open?'true':'false');
    button.setAttribute('aria-pressed',open?'true':'false');
  }

  function apply(){
    queued=false;
    const workspace=root();if(!workspace)return;
    const key=problemKey(workspace),open=openProblems.has(key);
    workspace.dataset.wbDiagramOptInOpen=open?'1':'0';
    suppressLegacyOverlays(workspace);
    const cards=collectDiagramCards(workspace);
    cards.forEach(card=>setCardVisible(card,open));
    updateButton(ensureControl(workspace),open);
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(apply)}

  document.addEventListener('click',event=>{
    const button=event.target?.closest?.(BUTTON);if(!button)return;
    const workspace=root();if(!workspace)return;
    event.preventDefault();event.stopPropagation();
    const key=problemKey(workspace),next=!openProblems.has(key);
    if(next)openProblems.add(key);else openProblems.delete(key);
    workspace.dataset.wbDiagramOptInOpen=next?'1':'0';
    suppressLegacyOverlays(workspace);
    collectDiagramCards(workspace).forEach(card=>setCardVisible(card,next));
    updateButton(button,next);
    window.dispatchEvent(new CustomEvent('wrongbook:ai-diagram-opt-in',{detail:{problemId:key,open:next}}));
  },true);

  function mount(){
    const app=document.getElementById('app')||document.body;
    if(!app)return setTimeout(mount,40);
    apply();
    const observer=new MutationObserver(queue);
    observer.observe(app,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','hidden','style','data-ai-diagram-card','data-wb-dedicated-diagram','data-wb-ai-sticker-scope','data-wb-ai-diagram-scope','data-problem-id']});
    window.__wrongbookAiDiagramOptInObserver=observer;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();

  function actuallyVisible(el){
    if(!el||el.hidden)return false;
    const css=getComputedStyle(el),r=el.getBoundingClientRect();
    return css.display!=='none'&&css.visibility!=='hidden'&&Number(css.opacity||1)>0&&r.width>0&&r.height>0;
  }
  window.wrongbookAiDiagramOptInQA=function(){
    const workspace=root();
    if(!workspace)return{version:VERSION,workspace:false,pass:false};
    apply();
    const cards=collectDiagramCards(workspace),overlays=[...workspace.querySelectorAll(LEGACY_OVERLAY)],buttons=[...workspace.querySelectorAll(BUTTON)],open=openProblems.has(problemKey(workspace));
    const overlaysHidden=overlays.every(node=>!actuallyVisible(node));
    const cardsRespectState=cards.every(card=>actuallyVisible(card)===open);
    const oneControl=buttons.length===1;
    return{version:VERSION,workspace:true,problemId:problemKey(workspace),open,diagramCards:cards.length,visibleDiagramCards:cards.filter(actuallyVisible).length,legacyOverlays:overlays.length,visibleLegacyOverlays:overlays.filter(actuallyVisible).length,oneControl,overlaysHidden,cardsRespectState,pass:oneControl&&overlaysHidden&&cardsRespectState};
  };
})();