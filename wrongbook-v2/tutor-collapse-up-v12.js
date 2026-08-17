// Wrong Book V12e — true upward tutor expansion with user-ink clearance.
// The tutor remains bottom-anchored, grows upward, and treats both printed prompt content and
// student ink/graphs as protected geometry. If there is not enough safe room, it falls back to
// V8 normal flow instead of covering the student's work or collapsing into a sliver.
(function(){
  const VERSION='2026-08-17-tutor-collapse-up-v12e';
  if(window.__wrongbookTutorCollapseUpV12===VERSION)return;
  try{window.__wrongbookTutorCollapseUpV12Observer?.disconnect?.()}catch{}
  document.getElementById('wrongbookTutorCollapseUpV12Style')?.remove();
  window.__wrongbookTutorCollapseUpV12=VERSION;

  const DESKTOP_BOTTOM=68;
  const PROMPT_GAP=12;
  const INK_MARGIN=20;
  const MIN_OPEN_HEIGHT=150;
  const MAX_OPEN_HEIGHT=420;

  const style=document.createElement('style');
  style.id='wrongbookTutorCollapseUpV12Style';
  style.textContent=`
    .v3-paper.v12-tutor-up-open .v5-tutor-dock:not(.v6-tutor-collapsed),
    .v3-paper.v12-tutor-up-open.v8-tutor-open-flow .v5-tutor-dock:not(.v6-tutor-collapsed){
      position:absolute!important;
      left:12px!important;
      right:12px!important;
      top:auto!important;
      bottom:${DESKTOP_BOTTOM}px!important;
      width:auto!important;
      max-width:none!important;
      height:auto!important;
      min-height:0!important;
      max-height:var(--v12-tutor-max-height,${MAX_OPEN_HEIGHT}px)!important;
      margin:0!important;
      overflow-x:hidden!important;
      overflow-y:auto!important;
      overscroll-behavior:contain;
      z-index:30!important;
      transform-origin:100% 100%!important;
      animation:v12eTutorRevealUp .17s cubic-bezier(.2,.72,.24,1) both;
    }
    @keyframes v12eTutorRevealUp{
      from{opacity:.94;clip-path:inset(100% 0 0 0)}
      to{opacity:1;clip-path:inset(0 0 0 0)}
    }

    .v6-tutor-collapse-button::after{
      right:0!important;
      left:auto!important;
      top:auto!important;
      bottom:calc(100% + 8px)!important;
      transform:translateY(4px)!important;
      transform-origin:bottom right!important;
    }
    .v6-tutor-collapse-button:hover::after,
    .v6-tutor-collapse-button:focus-visible::after{transform:translateY(0)!important}

    @media(max-width:700px){
      .v3-paper.v12-tutor-up-open .v5-tutor-dock:not(.v6-tutor-collapsed),
      .v3-paper.v12-tutor-up-open.v8-tutor-open-flow .v5-tutor-dock:not(.v6-tutor-collapsed){
        position:fixed!important;
        left:7px!important;
        right:7px!important;
        top:auto!important;
        bottom:calc(74px + env(safe-area-inset-bottom))!important;
        max-height:var(--v12-tutor-mobile-max-height,42vh)!important;
        margin:0!important;
        border-radius:15px!important;
      }
      .v6-tutor-collapse-button::after{display:none!important}
    }
    @media(prefers-reduced-motion:reduce){
      .v3-paper.v12-tutor-up-open .v5-tutor-dock:not(.v6-tutor-collapsed){animation:none!important}
    }
  `;
  document.head.appendChild(style);

  let observer=null,queued=false;

  function visible(el){
    if(!el)return false;
    const s=getComputedStyle(el),r=el.getBoundingClientRect();
    return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
  }

  function semanticPromptNodes(paper){
    const demo=paper.querySelector('.paper-demo');
    if(demo){
      return [...demo.querySelectorAll(':scope > h4, :scope > .options, :scope > .hand-note, .paper-option')].filter(visible);
    }
    return [paper.querySelector('.scan-photo'),paper.querySelector('.scan-text')].filter(visible);
  }

  function problemContentBottom(paper){
    const nodes=semanticPromptNodes(paper);
    if(!nodes.length)return paper.getBoundingClientRect().top+8;
    return Math.max(...nodes.map(el=>el.getBoundingClientRect().bottom));
  }

  function drawingPaths(){
    try{return Array.isArray(drawing?.paths)?drawing.paths:[]}catch{return[]}
  }

  function inkBottomFromPaths(paper){
    const canvas=paper.querySelector('#drawCanvas');
    if(!canvas||!visible(canvas))return null;
    const cr=canvas.getBoundingClientRect();
    let maxY=null;
    for(const path of drawingPaths()){
      if(path?.tool==='eraser')continue;
      const pts=path?.pts||path?.points||[];
      for(const pt of pts){
        const y=Number(pt?.y);
        if(!Number.isFinite(y))continue;
        // Current ink-v3 paths are normalized. Keep a defensive pixel fallback for legacy data.
        const normalized=path?.normalized!==false&&y>=0&&y<=1.001;
        const cssY=normalized?cr.top+y*cr.height:cr.top+(y/Math.max(1,canvas.height))*cr.height;
        maxY=maxY==null?cssY:Math.max(maxY,cssY);
      }
    }
    return maxY;
  }

  function inkBottomFromCanvas(paper){
    const canvas=paper.querySelector('#drawCanvas');
    if(!canvas||!visible(canvas)||!canvas.width||!canvas.height)return null;
    try{
      const ctx=canvas.getContext('2d',{willReadFrequently:true});
      const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
      for(let y=canvas.height-1;y>=0;y--){
        const row=y*canvas.width*4;
        for(let x=0;x<canvas.width;x++)if(data[row+x*4+3]>8){
          const cr=canvas.getBoundingClientRect();
          return cr.top+(y/Math.max(1,canvas.height))*cr.height;
        }
      }
    }catch{}
    return null;
  }

  function userInkBottom(paper){
    const fromPaths=inkBottomFromPaths(paper);
    return fromPaths==null?inkBottomFromCanvas(paper):fromPaths;
  }

  function sourceKind(paper){
    if(paper.querySelector('.paper-demo'))return'demo';
    if(paper.querySelector('.scan-photo'))return'scan';
    return'unknown';
  }

  function viewportBottomAnchor(){
    const probe=document.createElement('div');
    probe.style.cssText='position:fixed;bottom:calc(74px + env(safe-area-inset-bottom));height:0;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    const y=probe.getBoundingClientRect().top;
    probe.remove();
    return y;
  }

  function safeTopFor({paperTop,contentBottom,inkBottom}){
    return Math.max(paperTop+8,contentBottom+PROMPT_GAP,Number.isFinite(inkBottom)?inkBottom+INK_MARGIN:-Infinity);
  }

  function clearGeometry(paper){
    paper.classList.remove('v12-tutor-up-open','v12-tutor-flow-fallback');
    paper.style.removeProperty('--v12-tutor-max-height');
    paper.style.removeProperty('--v12-tutor-mobile-max-height');
    delete paper.dataset.v12Available;
    delete paper.dataset.v12PromptBottom;
    delete paper.dataset.v12InkBottom;
    delete paper.dataset.v12SafeTop;
    delete paper.dataset.v12Mode;
  }

  function syncDock(dock){
    if(!dock)return;
    const paper=dock.closest('.v3-paper');
    if(!paper)return;
    const open=!dock.classList.contains('v6-tutor-collapsed');
    if(!open){clearGeometry(paper);return}

    const paperRect=paper.getBoundingClientRect();
    const contentBottom=problemContentBottom(paper);
    const inkBottom=userInkBottom(paper);
    const mobile=matchMedia('(max-width:700px)').matches;
    const anchorBottom=mobile?viewportBottomAnchor():paperRect.bottom-DESKTOP_BOTTOM;
    const safeTop=safeTopFor({paperTop:mobile?0:paperRect.top,contentBottom,inkBottom});
    const available=Math.floor(anchorBottom-safeTop);
    const kind=sourceKind(paper);

    paper.dataset.v12Available=String(available);
    paper.dataset.v12PromptBottom=String(Math.round(contentBottom));
    paper.dataset.v12InkBottom=Number.isFinite(inkBottom)?String(Math.round(inkBottom)):'';
    paper.dataset.v12SafeTop=String(Math.round(safeTop));
    paper.dataset.v12Mode=kind;

    if(available<MIN_OPEN_HEIGHT){
      paper.classList.remove('v12-tutor-up-open');
      paper.classList.add('v12-tutor-flow-fallback');
      paper.style.removeProperty('--v12-tutor-max-height');
      paper.style.removeProperty('--v12-tutor-mobile-max-height');
      return;
    }

    paper.classList.remove('v12-tutor-flow-fallback');
    paper.classList.add('v12-tutor-up-open');
    const cap=Math.min(MAX_OPEN_HEIGHT,available);
    if(mobile)paper.style.setProperty('--v12-tutor-mobile-max-height',`${cap}px`);
    else paper.style.setProperty('--v12-tutor-max-height',`${cap}px`);
  }

  function apply(){document.querySelectorAll('.v5-tutor-dock').forEach(syncDock)}
  function queueApply(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}

  function mount(){
    const app=document.getElementById('app');
    if(!app)return setTimeout(mount,40);
    if(!observer){
      observer=new MutationObserver(queueApply);
      observer.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
      window.__wrongbookTutorCollapseUpV12Observer=observer;
    }
    window.addEventListener('resize',queueApply,{passive:true});
    // Ink changes do not necessarily mutate DOM. saveInk already exists in the worksheet runtime,
    // so a lightweight pointer-up listener guarantees the clearance is recomputed immediately.
    app.addEventListener('pointerup',queueApply,{passive:true});
    app.addEventListener('pointercancel',queueApply,{passive:true});
    apply();
  }
  mount();

  window.runWrongbookTutorCollapseDirectionQA=function(){
    apply();
    const dock=document.querySelector('.v5-tutor-dock');
    const paper=dock?.closest('.v3-paper');
    const button=dock?.querySelector('.v6-tutor-collapse-button');
    if(!dock||!paper||!button)return{pass:false,reason:'tutor-not-mounted',version:VERSION};

    const originallyCollapsed=dock.classList.contains('v6-tutor-collapsed');
    dock.classList.add('v6-tutor-collapsed');syncDock(dock);
    const collapsedRect=dock.getBoundingClientRect();

    dock.classList.remove('v6-tutor-collapsed');syncDock(dock);
    const openRect=dock.getBoundingClientRect();
    const contentBottom=problemContentBottom(paper);
    const inkBottom=userInkBottom(paper);
    const requiredTop=safeTopFor({paperTop:matchMedia('(max-width:700px)').matches?0:paper.getBoundingClientRect().top,contentBottom,inkBottom});
    const toolbar=paper.querySelector('.paper-toolbar');
    const toolbarRect=toolbar&&visible(toolbar)?toolbar.getBoundingClientRect():null;
    const pseudo=getComputedStyle(button,'::after');
    const fallback=paper.classList.contains('v12-tutor-flow-fallback');
    const available=Number(paper.dataset.v12Available||0);

    const bottomDelta=Math.abs(openRect.bottom-collapsedRect.bottom);
    const bottomAnchored=bottomDelta<=3;
    const growsUpward=openRect.top<collapsedRect.top-2;
    const noPromptOverlap=fallback||openRect.top>=contentBottom-1;
    const inkClearance=fallback||!Number.isFinite(inkBottom)||openRect.top>=inkBottom+INK_MARGIN-1;
    const noToolbarOverlap=!toolbarRect||fallback||!(openRect.right>toolbarRect.left&&openRect.left<toolbarRect.right&&openRect.bottom>toolbarRect.top&&openRect.top<toolbarRect.bottom);
    const tooltipBottom=parseFloat(pseudo.bottom);
    const tooltipAbove=pseudo.position==='absolute'&&Number.isFinite(tooltipBottom);
    const actualOpenPosition=getComputedStyle(dock).position;
    const geometryOwned=matchMedia('(max-width:700px)').matches?actualOpenPosition==='fixed':actualOpenPosition==='absolute';
    const notSliver=fallback?openRect.height>24:openRect.height>=Math.min(MIN_OPEN_HEIGHT,Math.max(1,available));
    const fallbackExpected=available<MIN_OPEN_HEIGHT;

    // Deterministic fixture: ink at y=300 must push the safe top to 320, not merely avoid overlap.
    const syntheticSafeTop=safeTopFor({paperTop:0,contentBottom:120,inkBottom:300});
    const syntheticInkMargin=Math.abs(syntheticSafeTop-(300+INK_MARGIN))<.01;

    if(originallyCollapsed)dock.classList.add('v6-tutor-collapsed');
    else dock.classList.remove('v6-tutor-collapsed');
    syncDock(dock);

    const upwardPass=!fallback&&bottomAnchored&&growsUpward&&noPromptOverlap&&inkClearance&&noToolbarOverlap&&tooltipAbove&&geometryOwned&&notSliver;
    const fallbackPass=fallback&&fallbackExpected&&notSliver;
    const pass=syntheticInkMargin&&(upwardPass||fallbackPass);
    return{
      pass,version:VERSION,mode:fallback?'safe-flow-fallback':'upward',sourceKind:sourceKind(paper),available,
      inkMargin:INK_MARGIN,inkBottom:Number.isFinite(inkBottom)?Math.round(inkBottom):null,requiredTop:Math.round(requiredTop),
      inkClearance,syntheticInkMargin,bottomAnchored,growsUpward,noPromptOverlap,noToolbarOverlap,tooltipAbove,geometryOwned,notSliver,fallbackExpected,
      bottomDelta:Number(bottomDelta.toFixed(2)),collapsedTop:Math.round(collapsedRect.top),openTop:Math.round(openRect.top),
      collapsedBottom:Math.round(collapsedRect.bottom),openBottom:Math.round(openRect.bottom),contentBottom:Math.round(contentBottom),
      openHeight:Math.round(openRect.height),openPosition:actualOpenPosition
    };
  };

  function scheduleQA(tries=0){
    setTimeout(()=>{
      const r=window.runWrongbookTutorCollapseDirectionQA?.();
      if(r?.reason==='tutor-not-mounted'&&tries<25)return scheduleQA(tries+1);
      window.__wrongbookTutorCollapseDirectionQA=r;
      if(r&&!r.pass)console.warn('[Wrongbook tutor V12e ink-clearance QA failed]',r);
    },180);
  }
  scheduleQA();
})();
