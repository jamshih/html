// Wrong Book V12 — true upward tutor expansion.
// The compact tutor is bottom-anchored. Opening it keeps the same bottom edge and grows the
// panel upward into the safe space above the control. The prompt is treated as a hard ceiling.
(function(){
  const VERSION='2026-08-17-tutor-collapse-up-v12';
  if(window.__wrongbookTutorCollapseUpV12===VERSION)return;
  window.__wrongbookTutorCollapseUpV12=VERSION;

  const DESKTOP_BOTTOM=68;
  const GAP=12;
  const MIN_OPEN_HEIGHT=96;

  const style=document.createElement('style');
  style.id='wrongbookTutorCollapseUpV12Style';
  style.textContent=`
    /* Real geometry: keep the bottom edge fixed and let height grow toward the top. */
    .v3-paper.v12-tutor-up-open .v5-tutor-dock:not(.v6-tutor-collapsed){
      position:absolute!important;
      left:12px!important;
      right:12px!important;
      top:auto!important;
      bottom:${DESKTOP_BOTTOM}px!important;
      width:auto!important;
      max-width:none!important;
      height:auto!important;
      max-height:var(--v12-tutor-max-height,360px)!important;
      margin:0!important;
      overflow-x:hidden!important;
      overflow-y:auto!important;
      overscroll-behavior:contain;
      z-index:30!important;
      transform-origin:100% 100%!important;
      animation:v12TutorRevealUp .17s cubic-bezier(.2,.72,.24,1) both;
    }
    @keyframes v12TutorRevealUp{
      from{opacity:.94;clip-path:inset(100% 0 0 0)}
      to{opacity:1;clip-path:inset(0 0 0 0)}
    }

    /* The hover label belongs above the anchor as well. */
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

    /* V8's open-flow margins must not reserve a second, downward-growing copy of the panel. */
    .v3-paper.v12-tutor-up-open.v8-tutor-open-flow .v5-tutor-dock:not(.v6-tutor-collapsed){
      margin:0!important;
    }

    @media(max-width:700px){
      /* On phones keep the same bottom anchor above the nav and reveal upward. */
      .v3-paper.v12-tutor-up-open .v5-tutor-dock:not(.v6-tutor-collapsed){
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

  function problemContentBottom(paper){
    const selectors=['.paper-demo','.v3-scan-wrap','.scan-text'];
    const nodes=[...paper.querySelectorAll(selectors.join(','))].filter(el=>{
      const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden';
    });
    if(!nodes.length)return paper.getBoundingClientRect().top;
    return Math.max(...nodes.map(el=>el.getBoundingClientRect().bottom));
  }

  function viewportBottomAnchor(){
    const probe=document.createElement('div');
    probe.style.cssText='position:fixed;bottom:calc(74px + env(safe-area-inset-bottom));height:0;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);
    const y=probe.getBoundingClientRect().top;
    probe.remove();
    return y;
  }

  function syncDock(dock){
    if(!dock)return;
    const paper=dock.closest('.v3-paper');
    if(!paper)return;
    const open=!dock.classList.contains('v6-tutor-collapsed');
    paper.classList.toggle('v12-tutor-up-open',open);
    if(!open){
      paper.style.removeProperty('--v12-tutor-max-height');
      paper.style.removeProperty('--v12-tutor-mobile-max-height');
      return;
    }

    const paperRect=paper.getBoundingClientRect();
    const contentBottom=problemContentBottom(paper);
    if(matchMedia('(max-width:700px)').matches){
      const anchorBottom=viewportBottomAnchor();
      const safeTop=Math.max(8,Math.min(anchorBottom-MIN_OPEN_HEIGHT,contentBottom+GAP));
      const available=Math.max(MIN_OPEN_HEIGHT,Math.floor(anchorBottom-safeTop));
      paper.style.setProperty('--v12-tutor-mobile-max-height',`${available}px`);
    }else{
      const anchorBottom=paperRect.bottom-DESKTOP_BOTTOM;
      const safeTop=Math.max(paperRect.top+8,contentBottom+GAP);
      const available=Math.max(MIN_OPEN_HEIGHT,Math.floor(anchorBottom-safeTop));
      paper.style.setProperty('--v12-tutor-max-height',`${available}px`);
    }
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

    // Measure the real collapsed anchor first.
    dock.classList.add('v6-tutor-collapsed');syncDock(dock);
    const collapsedRect=dock.getBoundingClientRect();

    // Then open the same DOM and verify that its bottom stays fixed while its top moves upward.
    dock.classList.remove('v6-tutor-collapsed');syncDock(dock);
    const openRect=dock.getBoundingClientRect();
    const contentBottom=problemContentBottom(paper);
    const toolbar=paper.querySelector('.paper-toolbar');
    const toolbarRect=toolbar&&getComputedStyle(toolbar).display!=='none'?toolbar.getBoundingClientRect():null;
    const pseudo=getComputedStyle(button,'::after');

    const bottomDelta=Math.abs(openRect.bottom-collapsedRect.bottom);
    const bottomAnchored=bottomDelta<=2;
    const growsUpward=openRect.top<collapsedRect.top-2;
    const noPromptOverlap=openRect.top>=contentBottom-1;
    const noToolbarOverlap=!toolbarRect||!overlap(openRect,toolbarRect);
    const tooltipAbove=pseudo.top==='auto'&&pseudo.bottom!=='auto';
    const actualOpenPosition=getComputedStyle(dock).position;
    const geometryOwned=matchMedia('(max-width:700px)').matches?actualOpenPosition==='fixed':actualOpenPosition==='absolute';

    if(originallyCollapsed)dock.classList.add('v6-tutor-collapsed');
    else dock.classList.remove('v6-tutor-collapsed');
    syncDock(dock);

    const pass=bottomAnchored&&growsUpward&&noPromptOverlap&&noToolbarOverlap&&tooltipAbove&&geometryOwned;
    return{
      pass,version:VERSION,bottomAnchored,growsUpward,noPromptOverlap,noToolbarOverlap,tooltipAbove,geometryOwned,
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
      if(r&&!r.pass)console.warn('[Wrongbook tutor true upward expansion QA failed]',r);
    },180);
  }
  scheduleQA();
})();
