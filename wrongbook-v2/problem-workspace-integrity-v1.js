/* Wrong Book problem-workspace integrity layer — 2026-08-18.
   Keeps every 錯題 detail screen paper-first: full prompt, writable sheet, AI tutor and pen tools.
   Also repairs the known coordinate-geometry prompt and adds safe ink redo without replacing the ink engine. */
(function(){
  'use strict';
  const VERSION='2026-08-18-problem-workspace-integrity-v1.1';
  if(window.__problemWorkspaceIntegrityV1===VERSION)return;
  window.__problemWorkspaceIntegrityV1=VERSION;
  document.documentElement.dataset.problemWorkspaceIntegrity=VERSION;

  const style=document.createElement('style');
  style.id='problemWorkspaceIntegrityV1Style';
  style.textContent=`
    /* The question itself must never be ellipsized or clipped inside the working sheet. */
    .pf-problem-workspace .paper,
    .pf-problem-workspace .v3-paper{height:auto!important;max-height:none!important;min-width:0!important}
    .pf-problem-workspace .paper-demo{box-sizing:border-box;min-width:0!important;height:auto!important;max-height:none!important;padding-bottom:clamp(190px,24vh,270px)!important}
    .pf-problem-workspace .paper-demo h4,
    .pf-problem-workspace .scan-text{display:block!important;width:auto!important;max-width:100%!important;height:auto!important;max-height:none!important;white-space:pre-wrap!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:anywhere!important;word-break:normal!important}
    .pf-problem-workspace .paper-demo h4{margin-top:0!important}
    .pf-problem-workspace .paper-option{max-width:100%!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:anywhere!important;word-break:normal!important}

    /* The core tools are part of the sheet, not optional cards. */
    .pf-problem-workspace .paper-toolbar{display:flex!important;visibility:visible!important;opacity:1!important;z-index:24!important;pointer-events:auto!important}
    .pf-problem-workspace .paper-toolbar>.toolset:first-child{display:flex!important}
    .pf-problem-workspace .v3-guide-dock,
    .pf-problem-workspace .v5-tutor-dock{display:grid!important;visibility:visible!important;opacity:1!important;z-index:23!important;pointer-events:auto!important;max-width:calc(100% - 24px)!important}
    .pf-problem-workspace #drawCanvas{display:block!important;visibility:visible!important;opacity:1!important;z-index:6!important;touch-action:none!important}

    /* Free-response/calculation questions should not surface a presumed wrong answer on the paper. */
    .pf-problem-workspace .pf-free-response-paper .hand-note{display:none!important}

    /* Keep a long tutor step above the ink toolbar instead of covering it. */
    .pf-problem-workspace .v5-tutor-dock{max-height:min(38vh,310px)!important;overflow:auto!important}

    @media (max-width:900px){
      .pf-problem-workspace .paper-demo{padding:28px 26px 265px!important}
      .pf-problem-workspace .paper-demo h4{font-size:16px!important;line-height:1.7!important}
      .pf-problem-workspace .paper-option{font-size:14px!important}
    }
    @media (max-width:700px){
      .pf-problem-workspace .paper{min-height:calc(100dvh - 150px)!important}
      .pf-problem-workspace .paper-demo{min-height:calc(100dvh - 150px)!important;padding:24px 18px 310px!important}
      .pf-problem-workspace .v5-tutor-dock{left:8px!important;right:8px!important;width:auto!important;bottom:74px!important;max-height:34vh!important}
      .pf-problem-workspace .paper-toolbar{left:8px!important;right:8px!important;bottom:10px!important;overflow-x:auto!important;flex-wrap:nowrap!important}
      .pf-problem-workspace .paper-toolbar .toolset{flex:0 0 auto!important}
    }
  `;
  document.head.appendChild(style);

  const redoByProblem=new Map();
  let patchQueued=false;

  function appState(){try{return state}catch{return null}}
  function inkState(){try{return drawing}catch{return null}}
  function problem(){
    try{return typeof selectedProblem==='function'?selectedProblem():null}catch{return null}
  }
  function problemId(){return problem()?.id||inkState()?.key||'current'}
  function hasChoices(p){return Array.isArray(p?.options)&&p.options.length>0}

  function repairKnownCoordinatePrompt(){
    const s=appState(),problems=s?.problems;
    if(!Array.isArray(problems))return false;
    let changed=false;
    const prefix='10. 空間中有兩點 A(1, 5, -4)、B(-14, 15';
    const canonical='10. 空間中有兩點 A(1, 5, -4)、B(-14, 15, 6)，已知點 P(-5, r, s) 在 AB 上。若平面通過 P 點且與直線 AB 垂直，且此平面方程式為 3x + by + cz + d = 0，求序組 (r, s, d)。';
    for(const p of problems){
      const text=String(p?.problemText||'');
      if(!text.startsWith(prefix))continue;
      /* The tuple previously shown at the end was the student's presumed wrong answer, not prompt text. */
      if(text!==canonical){p.problemText=canonical;changed=true}
      p.responseType='free_response';
    }
    if(changed){try{save()}catch{}}
    return changed;
  }

  function fullPrompt(p,paper){
    if(!p||!paper)return;
    const text=String(p.problemText||p.title||'').trim();
    if(!text)return;
    const h4=paper.querySelector('.paper-demo h4');
    if(h4&&h4.textContent.trim()!==text)h4.textContent=text;
    const scanned=paper.querySelector('.scan-text');
    if(scanned&&String(scanned.textContent||'').includes('AI 辨識文字：')){
      const expected='AI 辨識文字： '+text;
      if(scanned.textContent.trim()!==expected)scanned.textContent=expected;
    }
  }

  function makeCoreToolbar(paper){
    const bar=document.createElement('div');
    bar.className='paper-toolbar';
    bar.dataset.pfIntegritySynthesized='1';
    bar.innerHTML='<div class="toolset"><button class="tool active" type="button" data-tool="pen" aria-label="筆">✎</button><button class="tool" type="button" data-tool="eraser" aria-label="橡皮擦">⌫</button><button class="tool" type="button" data-action="undoInk" aria-label="復原">↶</button><button class="tool" type="button" data-action="redoInk" aria-label="重做">↷</button><button class="tool" type="button" data-action="clearInk">清除</button></div>';
    paper.appendChild(bar);
    try{if(typeof initCanvas==='function')initCanvas(problemId())}catch(e){console.warn('[problem-workspace-integrity] canvas rebind failed',e)}
    return bar;
  }

  function ensureToolbar(paper){
    let toolbar=paper.querySelector('.paper-toolbar');
    if(!toolbar)toolbar=makeCoreToolbar(paper);
    let toolset=toolbar.querySelector('.toolset');
    if(!toolset){toolset=document.createElement('div');toolset.className='toolset';toolbar.prepend(toolset)}
    if(!toolset.querySelector('[data-tool="pen"]'))toolset.insertAdjacentHTML('afterbegin','<button class="tool active" type="button" data-tool="pen" aria-label="筆">✎</button>');
    if(!toolset.querySelector('[data-tool="eraser"]'))toolset.insertAdjacentHTML('beforeend','<button class="tool" type="button" data-tool="eraser" aria-label="橡皮擦">⌫</button>');
    let undo=toolset.querySelector('[data-action="undoInk"]');
    if(!undo){toolset.insertAdjacentHTML('beforeend','<button class="tool" type="button" data-action="undoInk" aria-label="復原">↶</button>');undo=toolset.querySelector('[data-action="undoInk"]')}
    if(!toolset.querySelector('[data-action="redoInk"]'))undo.insertAdjacentHTML('afterend','<button class="tool" type="button" data-action="redoInk" aria-label="重做">↷</button>');
    if(!toolset.querySelector('[data-action="clearInk"]'))toolset.insertAdjacentHTML('beforeend','<button class="tool" type="button" data-action="clearInk">清除</button>');
  }

  function ensureTutor(paper,p){
    if(!paper||paper.querySelector('[data-guide-dock],.v3-guide-dock,.v5-tutor-dock'))return;
    try{
      if(typeof v3GuideMarkup==='function'){
        const toolbar=paper.querySelector('.paper-toolbar');
        const holder=document.createElement('div');
        holder.innerHTML=v3GuideMarkup(p);
        const nodes=[...holder.childNodes];
        for(const node of nodes)paper.insertBefore(node,toolbar||null);
      }
    }catch(e){console.warn('[problem-workspace-integrity] tutor restore failed',e)}
  }

  function patch(){
    patchQueued=false;
    repairKnownCoordinatePrompt();
    const workspace=document.querySelector('.pf-problem-workspace');
    if(!workspace)return;
    const p=problem();
    const paper=workspace.querySelector('.paper,.v3-paper');
    if(!paper)return;
    paper.classList.toggle('pf-free-response-paper',!hasChoices(p));
    fullPrompt(p,paper);
    ensureToolbar(paper);
    ensureTutor(paper,p);
    workspace.dataset.paperFirstIntegrity='ready';
  }
  function queuePatch(){if(patchQueued)return;patchQueued=true;queueMicrotask(patch)}

  document.addEventListener('click',function(e){
    const ink=inkState();
    const undo=e.target.closest?.('[data-action="undoInk"]');
    if(undo&&ink?.paths?.length){
      const key=problemId(),stack=redoByProblem.get(key)||[];
      stack.push(ink.paths[ink.paths.length-1]);
      redoByProblem.set(key,stack.slice(-50));
      return; /* existing ink-v3 undo listener owns the actual pop/save */
    }
    const redo=e.target.closest?.('[data-action="redoInk"]');
    if(redo){
      e.preventDefault();e.stopPropagation();
      const key=problemId(),stack=redoByProblem.get(key)||[],path=stack.pop(),current=inkState();
      if(!path||!current)return;
      current.paths=Array.isArray(current.paths)?current.paths:[];
      current.paths.push(path);redoByProblem.set(key,stack);
      try{redrawCanvas()}catch{}
      try{saveInk()}catch{}
      return;
    }
    if(e.target.closest?.('[data-action="clearInk"]'))redoByProblem.delete(problemId());
  },true);

  document.addEventListener('pointerdown',function(e){
    if(e.target?.id==='drawCanvas')redoByProblem.delete(problemId());
  },true);

  const app=document.getElementById('app');
  if(app)new MutationObserver(queuePatch).observe(app,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queuePatch,{once:true});else queuePatch();
})();
