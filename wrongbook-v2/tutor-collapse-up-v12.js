// Wrong Book V12g — prompt-only upward tutor placement.
// Student ink no longer affects tutor geometry. The tutor behaves like the pre-protection version:
// full-width, bottom-anchored, grows upward, and only treats the printed problem prompt as protected.
(function(){
  const VERSION='2026-08-17-tutor-collapse-up-v12g';
  if(window.__wrongbookTutorCollapseUpV12===VERSION)return;
  try{window.__wrongbookTutorCollapseUpV12Observer?.disconnect?.()}catch{}
  document.getElementById('wrongbookTutorCollapseUpV12Style')?.remove();
  window.__wrongbookTutorCollapseUpV12=VERSION;

  const DESKTOP_BOTTOM=68;
  const PROMPT_GAP=12;
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
      animation:v12gTutorRevealUp .17s cubic-bezier(.2,.72,.24,1) both;
    }
    @keyframes v12gTutorRevealUp{
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
        width:auto!important;
        max-width:none!important;
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

  // IMPORTANT: paper-demo fills most of the worksheet and is not itself prompt geometry.
  // Only the actual printed question/options/answer-history line define the protected ceiling.
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

  function clearGeometry(paper){
    paper.classList.remove('v12-tutor-up-open','v12-tutor-flow-fallback','v12-tutor-safe-park','v12-tutor-no-space');
    paper.style.removeProperty('--v12-tutor-left');
    paper.style.removeProperty('--v12-tutor-width');
    paper.style.removeProperty('--v12-tutor-top');
    paper.style.removeProperty('--v12-tutor-max-height');
    paper.style.removeProperty('--v12-tutor-mobile-max-height');
    delete paper.dataset.v12Available;
    delete paper.dataset.v12PromptBottom;
    delete paper.dataset.v12Mode;
    delete paper.dataset.v12InkCount;
  }

  function syncDock(dock){
    if(!dock)return;
    const paper=dock.closest('.v3-paper');
    if(!paper)return;
    const open=!dock.classList.contains('v6-tutor-collapsed');
    if(!open){clearGeometry(paper);return}

    const paperRect=paper.getBoundingClientRect();
    const contentBottom=problemContentBottom(paper);
    const mobile=matchMedia('(max-width:700px)').matches;
    const anchorBottom=mobile?viewportBottomAnchor():paperRect.bottom-DESKTOP_BOTTOM;
    const safeTop=Math.max(mobile?8:paperRect.top+8,contentBottom+PROMPT_GAP);
    const available=Math.floor(anchorBottom-safeTop);

    paper.dataset.v12Available=String(available);
    paper.dataset.v12PromptBottom=String(Math.round(contentBottom));
    paper.dataset.v12Mode=sourceKind(paper);

    // Preserve the old safe behavior if the prompt genuinely occupies almost the entire sheet.
    // Never render a tiny scrollbar/sliver just to satisfy the upward rule.
    if(available<MIN_OPEN_HEIGHT){
      paper.classList.remove('v12-tutor-up-open','v12-tutor-safe-park','v12-tutor-no-space');
      paper.classList.add('v12-tutor-flow-fallback');
      paper.style.removeProperty('--v12-tutor-max-height');
      paper.style.removeProperty('--v12-tutor-mobile-max-height');
      return;
    }

    paper.classList.remove('v12-tutor-flow-fallback','v12-tutor-safe-park','v12-tutor-no-space');
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
      observer=new MutationObserver(records=>{
        // React to tutor rerenders/state changes, but never to our own paper geometry classes/styles.
        if(records.some(m=>m.type==='childList'||(m.type==='attributes'&&m.target?.classList?.contains('v5-tutor-dock'))))queueApply();
      });
      observer.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
      window.__wrongbookTutorCollapseUpV12Observer=observer;
    }
    window.addEventListener('resize',queueApply,{passive:true});
    apply();
  }
  mount();

  function overlap(a,b){return !(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom)}

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
    const toolbar=paper.querySelector('.paper-toolbar');
    const toolbarRect=toolbar&&visible(toolbar)?toolbar.getBoundingClientRect():null;
    const pseudo=getComputedStyle(button,'::after');
    const fallback=paper.classList.contains('v12-tutor-flow-fallback');
    const available=Number(paper.dataset.v12Available||0);

    const bottomDelta=Math.abs(openRect.bottom-collapsedRect.bottom);
    const bottomAnchored=fallback||bottomDelta<=3;
    const growsUpward=fallback||openRect.top<collapsedRect.top-2;
    const noPromptOverlap=fallback||openRect.top>=contentBottom-1;
    const noToolbarOverlap=!toolbarRect||fallback||!overlap(openRect,toolbarRect);
    const tooltipBottom=parseFloat(pseudo.bottom);
    const tooltipAbove=pseudo.position==='absolute'&&Number.isFinite(tooltipBottom);
    const actualOpenPosition=getComputedStyle(dock).position;
    const geometryOwned=fallback||((matchMedia('(max-width:700px)').matches&&actualOpenPosition==='fixed')||(!matchMedia('(max-width:700px)').matches&&actualOpenPosition==='absolute'));
    const notSliver=fallback?openRect.height>24:openRect.height>=Math.min(MIN_OPEN_HEIGHT,Math.max(1,available));
    const promptOnly=!('v12InkCount' in paper.dataset)&&typeof window.__wrongbookTutorSafePlanner==='undefined';

    // Deterministic geometry fixture: the full worksheet container must never be used as prompt bottom.
    const demo=paper.querySelector('.paper-demo');
    const semantic=semanticPromptNodes(paper);
    const semanticPromptMeasured=!demo||!visible(demo)||!semantic.length||problemContentBottom(paper)<demo.getBoundingClientRect().bottom-4;

    if(originallyCollapsed)dock.classList.add('v6-tutor-collapsed');
    else dock.classList.remove('v6-tutor-collapsed');
    syncDock(dock);

    const upwardPass=!fallback&&bottomAnchored&&growsUpward&&noPromptOverlap&&noToolbarOverlap&&tooltipAbove&&geometryOwned&&notSliver;
    const fallbackPass=fallback&&available<MIN_OPEN_HEIGHT&&notSliver;
    const pass=promptOnly&&semanticPromptMeasured&&(upwardPass||fallbackPass);
    return{
      pass,version:VERSION,mode:fallback?'safe-flow-fallback':'upward-prompt-only',sourceKind:sourceKind(paper),available,
      promptOnly,semanticPromptMeasured,bottomAnchored,growsUpward,noPromptOverlap,noToolbarOverlap,tooltipAbove,geometryOwned,notSliver,
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
      if(r&&!r.pass)console.warn('[Wrongbook tutor V12g prompt-only upward QA failed]',r);
    },180);
  }
  scheduleQA();
})();
