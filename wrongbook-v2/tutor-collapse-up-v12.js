// Wrong Book V12c — true upward tutor expansion without collapsing into a 1px scrollbar.
// Measure the actual printed prompt, not the full-height paper-demo container. If a scanned image
// genuinely leaves no safe room, fall back to V8 normal flow instead of rendering a broken sliver.
(function(){
  const VERSION='2026-08-17-tutor-collapse-up-v12c';
  if(window.__wrongbookTutorCollapseUpV12===VERSION)return;
  try{window.__wrongbookTutorCollapseUpV12Observer?.disconnect?.()}catch{}
  document.getElementById('wrongbookTutorCollapseUpV12Style')?.remove();
  window.__wrongbookTutorCollapseUpV12=VERSION;

  const DESKTOP_BOTTOM=68;
  const GAP=12;
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
      animation:v13TutorRevealUp .17s cubic-bezier(.2,.72,.24,1) both;
    }
    @keyframes v13TutorRevealUp{
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
    const s=getComputedStyle(el);
    const r=el.getBoundingClientRect();
    return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
  }

  function semanticPromptNodes(paper){
    const demo=paper.querySelector('.paper-demo');
    if(demo){
      // paper-demo intentionally fills the worksheet. Never use its own bottom as prompt geometry.
      // Only printed question/answer-history content counts as the prompt ceiling.
      return [...demo.querySelectorAll(':scope > h4, :scope > .options, :scope > .hand-note, .paper-option')].filter(visible);
    }
    const scanPhoto=paper.querySelector('.scan-photo');
    const scanText=paper.querySelector('.scan-text');
    return [scanPhoto,scanText].filter(visible);
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
    paper.classList.remove('v12-tutor-up-open','v12-tutor-flow-fallback');
    paper.style.removeProperty('--v12-tutor-max-height');
    paper.style.removeProperty('--v12-tutor-mobile-max-height');
    delete paper.dataset.v12Available;
    delete paper.dataset.v12PromptBottom;
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
    const mobile=matchMedia('(max-width:700px)').matches;
    const anchorBottom=mobile?viewportBottomAnchor():paperRect.bottom-DESKTOP_BOTTOM;
    const safeTop=Math.max(mobile?8:paperRect.top+8,contentBottom+GAP);
    const available=Math.floor(anchorBottom-safeTop);
    const kind=sourceKind(paper);

    paper.dataset.v12Available=String(available);
    paper.dataset.v12PromptBottom=String(Math.round(contentBottom));
    paper.dataset.v12Mode=kind;

    if(available<MIN_OPEN_HEIGHT){
      // Never show a 1px/miniature overflow strip. A true full-page scan can legitimately leave
      // no blank region, so use V8's safe normal-flow card until the page offers enough space.
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
    const kind=sourceKind(paper);
    const available=Number(paper.dataset.v12Available||0);

    const bottomDelta=Math.abs(openRect.bottom-collapsedRect.bottom);
    const bottomAnchored=bottomDelta<=3;
    const growsUpward=openRect.top<collapsedRect.top-2;
    const noPromptOverlap=!overlap(openRect,{left:openRect.left,right:openRect.right,top:contentBottom-1,bottom:contentBottom});
    const noToolbarOverlap=!toolbarRect||!overlap(openRect,toolbarRect);
    const tooltipTop=parseFloat(pseudo.top),tooltipBottom=parseFloat(pseudo.bottom);
    const tooltipAbove=pseudo.position==='absolute'&&Number.isFinite(tooltipBottom)&&(!Number.isFinite(tooltipTop)||tooltipTop<0);
    const actualOpenPosition=getComputedStyle(dock).position;
    const geometryOwned=matchMedia('(max-width:700px)').matches?actualOpenPosition==='fixed':actualOpenPosition==='absolute';
    const notSliver=openRect.height>=Math.min(MIN_OPEN_HEIGHT,Math.max(1,available));
    const demoMustExpandUp=kind!=='demo'||!fallback;

    if(originallyCollapsed)dock.classList.add('v6-tutor-collapsed');
    else dock.classList.remove('v6-tutor-collapsed');
    syncDock(dock);

    const upwardPass=!fallback&&bottomAnchored&&growsUpward&&openRect.top>=contentBottom-1&&noToolbarOverlap&&tooltipAbove&&geometryOwned&&notSliver;
    const safeFallbackPass=fallback&&kind!=='demo'&&openRect.height>24;
    const pass=demoMustExpandUp&&(upwardPass||safeFallbackPass);
    return{
      pass,version:VERSION,mode:fallback?'safe-flow-fallback':'upward',sourceKind:kind,available,
      bottomAnchored,growsUpward,noPromptOverlap:openRect.top>=contentBottom-1,noToolbarOverlap,tooltipAbove,geometryOwned,notSliver,demoMustExpandUp,
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
      if(r&&!r.pass)console.warn('[Wrongbook tutor V12c upward expansion QA failed]',r);
    },180);
  }
  scheduleQA();
})();
