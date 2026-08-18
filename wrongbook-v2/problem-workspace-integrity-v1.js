/* Wrong Book problem-workspace integrity layer — 2026-08-18.
   Contract: every 錯題 detail owns one complete paper, a working ink canvas, reachable tools,
   a bounded AI tutor dock, and a reliable way back to the notebook index. */
(function(){
  'use strict';
  const VERSION='2026-08-18-problem-workspace-integrity-v1.4';
  if(window.__problemWorkspaceIntegrityV1===VERSION)return;
  window.__problemWorkspaceIntegrityV1=VERSION;
  document.documentElement.dataset.problemWorkspaceIntegrity=VERSION;

  const style=document.createElement('style');
  style.id='problemWorkspaceIntegrityV1Style';
  style.textContent=`
    .pf-problem-workspace .paper,
    .pf-problem-workspace .v3-paper{
      position:relative!important;
      box-sizing:border-box!important;
      height:auto!important;
      max-height:none!important;
      min-width:0!important;
      overflow:hidden!important;
    }
    .pf-problem-workspace .paper-demo{
      box-sizing:border-box!important;
      min-width:0!important;
      height:auto!important;
      max-height:none!important;
    }
    .pf-problem-workspace .paper-demo h4,
    .pf-problem-workspace .scan-text{
      display:block!important;
      width:auto!important;
      max-width:100%!important;
      height:auto!important;
      max-height:none!important;
      white-space:pre-wrap!important;
      overflow:visible!important;
      text-overflow:clip!important;
      overflow-wrap:anywhere!important;
      word-break:normal!important;
    }
    .pf-problem-workspace .paper-demo h4{margin-top:0!important}
    .pf-problem-workspace .paper-option{
      max-width:100%!important;
      white-space:normal!important;
      overflow:visible!important;
      text-overflow:clip!important;
      overflow-wrap:anywhere!important;
      word-break:normal!important;
    }

    /* The handwriting surface is the paper itself. Never let a later feature layer collapse it. */
    .pf-problem-workspace #drawCanvas{
      position:absolute!important;
      inset:0!important;
      width:100%!important;
      height:100%!important;
      display:block!important;
      visibility:visible!important;
      opacity:1!important;
      z-index:6!important;
      pointer-events:auto!important;
      touch-action:none!important;
    }
    .pf-problem-workspace .paper-toolbar{
      display:flex!important;
      visibility:visible!important;
      opacity:1!important;
      z-index:24!important;
      pointer-events:auto!important;
    }
    .pf-problem-workspace .paper-toolbar>.toolset:first-child{display:flex!important}

    /* Tutor stays available but is bounded to a reserved dock zone instead of covering the question. */
    .pf-problem-workspace .v3-guide-dock,
    .pf-problem-workspace .v5-tutor-dock{
      visibility:visible!important;
      opacity:1!important;
      z-index:23!important;
      pointer-events:auto!important;
      overflow:auto!important;
      overscroll-behavior:contain;
    }

    /* Free-response / calculation questions never show the student's presumed wrong result as an answer chip. */
    .pf-problem-workspace .pf-free-response-paper .hand-note{display:none!important}

    .pf-workspace-back{
      display:none;
      align-items:center;
      gap:5px;
      border:0;
      background:transparent;
      color:#555851;
      min-height:34px;
      padding:5px 8px 5px 2px;
      margin-right:8px;
      font:inherit;
      font-size:12px;
      font-weight:700;
      cursor:pointer;
      white-space:nowrap;
    }
    .pf-workspace-back:hover{color:#26352b}
    .pf-workspace-back:focus-visible{outline:3px solid rgba(85,123,86,.2);outline-offset:2px;border-radius:6px}

    @media (min-width:861px){
      body.pf-workspace-active .app-shell,
      body.pf-workspace-active .pf-app-shell{display:block!important}
      body.pf-workspace-active .sidebar,
      body.pf-workspace-active .pf-sidebar{display:none!important}
      body.pf-workspace-active .main{margin-left:0!important;width:100%!important;max-width:none!important}
      body.pf-workspace-active .content{max-width:none!important;padding:0 0 0 42px!important}
      .pf-workspace-back{display:inline-flex}
      .pf-problem-workspace{max-width:none!important;margin:0!important}
      /* Identity remains in the global breadcrumb bar; only its back action is promoted there. */
      .pf-problem-workspace .pf-problem-head{display:none!important}
      .pf-problem-workspace .pf-paper-column>.panel>.panel-head{display:none!important}
      .pf-problem-workspace .pf-workspace-layout{
        grid-template-columns:minmax(0,1fr) clamp(340px,27vw,420px)!important;
        gap:0!important;
        align-items:stretch!important;
      }
      .pf-problem-workspace .pf-context-rail{
        border-left:1px solid var(--line)!important;
        padding:16px 18px 0 24px!important;
        min-height:calc(100vh - 58px)!important;
        align-content:start!important;
        margin:0!important;
        width:100%!important;
        max-width:none!important;
      }
      .pf-problem-workspace .paper{
        min-height:max(760px,calc(100vh - 58px))!important;
        border-top:0!important;
        border-bottom:0!important;
        box-shadow:none!important;
      }
      .pf-problem-workspace .paper-demo{
        min-height:max(760px,calc(100vh - 58px))!important;
        padding:30px 68px 360px!important;
      }
      .pf-problem-workspace .paper.pf-scanned-paper{padding-bottom:320px!important}
      .pf-problem-workspace .paper-demo h4{font-size:18px!important;line-height:1.78!important}
      .pf-problem-workspace .paper-option{font-size:15px!important;line-height:1.68!important}
      .pf-problem-workspace .v3-guide-dock,
      .pf-problem-workspace .v5-tutor-dock{
        left:16px!important;
        right:16px!important;
        width:auto!important;
        max-width:none!important;
        bottom:68px!important;
        max-height:220px!important;
      }
    }

    @media (min-width:861px) and (max-width:1100px){
      body.pf-workspace-active .content{padding-left:24px!important}
      .pf-problem-workspace .pf-workspace-layout{grid-template-columns:minmax(0,1fr) 320px!important}
      .pf-problem-workspace .paper-demo{padding-left:42px!important;padding-right:42px!important}
    }
    @media (max-width:900px){
      .pf-problem-workspace .paper-demo h4{font-size:16px!important;line-height:1.7!important}
      .pf-problem-workspace .paper-option{font-size:14px!important}
    }
    @media (max-width:860px){
      .pf-problem-workspace .pf-problem-head{display:grid!important}
      .pf-problem-workspace .paper{min-height:620px!important}
      .pf-problem-workspace .paper-demo{min-height:620px!important;padding-bottom:250px!important}
    }
  `;
  document.getElementById(style.id)?.remove();
  document.head.appendChild(style);

  const redoByProblem=new Map();
  let patchQueued=false;

  function appState(){try{return state}catch{return null}}
  function inkState(){try{return drawing}catch{return null}}
  function problem(){try{return typeof selectedProblem==='function'?selectedProblem():null}catch{return null}}
  function problemId(){return problem()?.id||inkState()?.key||'current'}
  function hasChoices(p){return Array.isArray(p?.options)&&p.options.length>0}
  function isFreeResponse(p){return p?.responseType==='free_response'||!hasChoices(p)}

  function normalizedPromptSignature(text=''){
    return String(text)
      .normalize('NFKC')
      .replace(/[−–—]/g,'-')
      .replace(/[，、]/g,',')
      .replace(/\s+/g,'')
      .toLowerCase();
  }

  function isKnownCoordinatePrompt(text=''){
    const n=normalizedPromptSignature(text);
    return n.includes('a(1,5,-4)')&&
      n.includes('b(-14,15,6)')&&
      n.includes('p(-5,r,s)')&&
      n.includes('3x+by+cz+d=0');
  }

  function repairKnownCoordinatePrompt(){
    const s=appState(),problems=s?.problems;
    if(!Array.isArray(problems))return false;
    let changed=false;
    const canonical='10. 空間中有兩點 A(1, 5, -4)、B(-14, 15, 6)，已知點 P(-5, r, s) 在 AB 上。若平面通過 P 點且與直線 AB 垂直，且此平面方程式為 3x + by + cz + d = 0，求序組 (r, s, d)。';
    for(const p of problems){
      if(!isKnownCoordinatePrompt(p?.problemText||p?.title||''))continue;
      if(String(p.problemText||'')!==canonical){p.problemText=canonical;changed=true}
      if(p.responseType!=='free_response'){p.responseType='free_response';changed=true}
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

  function ensureTopbarBack(workspace){
    if(!workspace)return;
    const left=document.querySelector('.pf-topbar .topbar-left,.topbar .topbar-left');
    if(!left)return;
    let btn=left.querySelector('.pf-workspace-back');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className='pf-workspace-back';
      btn.dataset.integrityBack='1';
      btn.setAttribute('aria-label','返回錯題列表');
      btn.innerHTML='← <span>錯題</span>';
      left.prepend(btn);
      btn.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        const s=appState();if(!s)return;
        s.page='notebook';s.selectedProblemId=null;s.mobileMenu=false;
        try{save()}catch{}
        try{render()}catch{}
        try{window.scrollTo({top:0,behavior:'instant'})}catch{}
      });
    }
  }

  function ensureCanvas(paper){
    if(!paper)return null;
    let canvas=paper.querySelector('#drawCanvas');
    if(canvas)return canvas;
    canvas=document.createElement('canvas');
    canvas.id='drawCanvas';
    canvas.className='canvas-layer';
    const toolbar=paper.querySelector('.paper-toolbar');
    paper.insertBefore(canvas,toolbar||null);
    canvas.dataset.pfIntegritySynthesized='1';
    return canvas;
  }

  function ensurePaper(workspace,p){
    if(!workspace)return null;
    let paper=workspace.querySelector('.paper,.v3-paper');
    if(!paper){
      const column=workspace.querySelector('.pf-paper-column');
      if(column&&p&&typeof paperPanel==='function'){
        try{column.innerHTML=paperPanel(p);paper=column.querySelector('.paper,.v3-paper')}
        catch(e){console.warn('[problem-workspace-integrity] paper restore failed',e)}
      }
    }
    if(paper){
      paper.classList.toggle('pf-scanned-paper',Boolean(paper.querySelector('.v3-scan-wrap,.scan-photo')));
      ensureCanvas(paper);
    }
    return paper;
  }

  function makeCoreToolbar(paper){
    const bar=document.createElement('div');
    bar.className='paper-toolbar';
    bar.dataset.pfIntegritySynthesized='1';
    bar.innerHTML='<div class="toolset"><button class="tool active" type="button" data-tool="pen" aria-label="筆">✎</button><button class="tool" type="button" data-tool="eraser" aria-label="橡皮擦">⌫</button><button class="tool" type="button" data-action="undoInk" aria-label="復原">↶</button><button class="tool" type="button" data-action="redoInk" aria-label="重做">↷</button><button class="tool" type="button" data-action="clearInk">清除</button></div>';
    paper.appendChild(bar);
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
    if(undo&&!toolset.querySelector('[data-action="redoInk"]'))undo.insertAdjacentHTML('afterend','<button class="tool" type="button" data-action="redoInk" aria-label="重做">↷</button>');
    if(!toolset.querySelector('[data-action="clearInk"]'))toolset.insertAdjacentHTML('beforeend','<button class="tool" type="button" data-action="clearInk">清除</button>');
  }

  function ensureTutor(paper,p){
    if(!paper||paper.querySelector('[data-guide-dock],.v3-guide-dock,.v5-tutor-dock'))return;
    try{
      if(typeof v3GuideMarkup==='function'){
        const toolbar=paper.querySelector('.paper-toolbar');
        const holder=document.createElement('div');
        holder.innerHTML=v3GuideMarkup(p);
        for(const node of [...holder.childNodes])paper.insertBefore(node,toolbar||null);
      }
    }catch(e){console.warn('[problem-workspace-integrity] tutor restore failed',e)}
  }

  function dedupeRail(workspace){
    const rail=workspace?.querySelector('.pf-context-rail');
    if(!rail)return;
    const seen=new Set();
    for(const disclosure of rail.querySelectorAll('.pf-disclosure')){
      const label=String(disclosure.querySelector(':scope > summary')?.textContent||'').replace(/＋/g,'').trim();
      if(!label)continue;
      if(seen.has(label))disclosure.remove();else seen.add(label);
    }
  }

  function ensureCanvasBinding(paper){
    const canvas=paper?.querySelector('#drawCanvas');
    if(!canvas||typeof initCanvas!=='function')return;
    const ink=inkState();
    const key=problemId();
    const needs=ink?.canvas!==canvas||ink?.key!==key||!canvas.width||!canvas.height;
    if(!needs)return;
    setTimeout(()=>{
      if(!document.body.contains(canvas))return;
      try{
        const r=canvas.getBoundingClientRect();
        if(r.width>0&&r.height>0){initCanvas(key);canvas.dataset.pfIntegrityInk='ready'}
      }catch(e){console.warn('[problem-workspace-integrity] canvas rebind failed',e)}
    },40);
  }

  function patch(){
    patchQueued=false;
    repairKnownCoordinatePrompt();
    const workspace=document.querySelector('.pf-problem-workspace');
    if(!workspace)return;
    const p=problem();
    if(!p)return;
    ensureTopbarBack(workspace);
    const paper=ensurePaper(workspace,p);
    if(!paper)return;
    paper.classList.toggle('pf-free-response-paper',isFreeResponse(p));
    fullPrompt(p,paper);
    ensureToolbar(paper);
    ensureTutor(paper,p);
    dedupeRail(workspace);
    ensureCanvasBinding(paper);
    workspace.dataset.paperFirstIntegrity='ready';
    workspace.dataset.problemId=String(p.id||'');
  }
  function queuePatch(){if(patchQueued)return;patchQueued=true;queueMicrotask(patch)}

  document.addEventListener('click',function(e){
    const ink=inkState();
    const undo=e.target.closest?.('[data-action="undoInk"]');
    if(undo&&ink?.paths?.length){
      const key=problemId(),stack=redoByProblem.get(key)||[];
      stack.push(ink.paths[ink.paths.length-1]);
      redoByProblem.set(key,stack.slice(-50));
      return;
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
