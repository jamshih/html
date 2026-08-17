// Wrong Book V8 — keep the expanded AI tutor out of the problem prompt's visual space.
(function(){
  const VERSION='2026-08-17-tutor-nonoverlap-v8';
  if(window.__wrongbookTutorNonOverlapV8===VERSION)return;
  window.__wrongbookTutorNonOverlapV8=VERSION;

  function syncDock(dock){
    if(!dock)return;
    const paper=dock.closest('.v3-paper');
    if(!paper)return;
    const open=!dock.classList.contains('v6-tutor-collapsed');
    paper.classList.toggle('v8-tutor-open-flow',open);
    paper.classList.toggle('v8-tutor-compact-float',!open);
  }

  function apply(){
    document.querySelectorAll('.v5-tutor-dock').forEach(syncDock);
  }

  let queued=false;
  function queueApply(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply()});
  }

  function rectsOverlap(a,b){
    if(!a||!b||!a.width||!a.height||!b.width||!b.height)return false;
    return !(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom);
  }

  function problemContentBottom(paper){
    const nodes=[...paper.querySelectorAll('.paper-demo,.v3-scan-wrap,.scan-text')]
      .filter(el=>getComputedStyle(el).display!=='none');
    if(!nodes.length)return paper.getBoundingClientRect().top;
    return Math.max(...nodes.map(el=>el.getBoundingClientRect().bottom));
  }

  window.runWrongbookTutorNonOverlapQA=function(){
    apply();
    const dock=document.querySelector('.v5-tutor-dock');
    const paper=dock?.closest('.v3-paper');
    if(!dock||!paper)return{pass:false,reason:'tutor-or-paper-not-mounted',version:VERSION};

    const wasCollapsed=dock.classList.contains('v6-tutor-collapsed');
    dock.classList.remove('v6-tutor-collapsed');
    syncDock(dock);

    const style=getComputedStyle(dock);
    const dockRect=dock.getBoundingClientRect();
    const contentBottom=problemContentBottom(paper);
    const toolbar=paper.querySelector('.paper-toolbar');
    const toolbarRect=toolbar&&getComputedStyle(toolbar).display!=='none'?toolbar.getBoundingClientRect():null;

    const participatesInFlow=!['absolute','fixed'].includes(style.position);
    const noPromptOverlap=dockRect.top>=contentBottom-1;
    const noToolbarOverlap=!toolbarRect||!rectsOverlap(dockRect,toolbarRect);
    const noInnerScroll=style.maxHeight==='none'&&style.overflowY!=='auto'&&style.overflowY!=='scroll';
    const paperOwnsOpenState=paper.classList.contains('v8-tutor-open-flow');

    if(wasCollapsed)dock.classList.add('v6-tutor-collapsed');
    syncDock(dock);

    const pass=participatesInFlow&&noPromptOverlap&&noToolbarOverlap&&noInnerScroll&&paperOwnsOpenState;
    return{
      pass,
      version:VERSION,
      participatesInFlow,
      noPromptOverlap,
      noToolbarOverlap,
      noInnerScroll,
      paperOwnsOpenState,
      position:style.position,
      dockTop:Math.round(dockRect.top),
      contentBottom:Math.round(contentBottom),
      dockHeight:Math.round(dockRect.height),
      viewportWidth:window.innerWidth
    };
  };

  const mount=()=>{
    const app=document.getElementById('app');
    if(!app)return setTimeout(mount,50);
    const observer=new MutationObserver(queueApply);
    observer.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    window.__wrongbookTutorNonOverlapV8Observer=observer;
    apply();
  };
  mount();

  function scheduleQA(tries=0){
    setTimeout(()=>{
      const result=window.runWrongbookTutorNonOverlapQA?.();
      if(result?.reason==='tutor-or-paper-not-mounted'&&tries<30)return scheduleQA(tries+1);
      window.__wrongbookTutorNonOverlapV8QA=result;
      if(result&&!result.pass)console.warn('[Wrongbook tutor non-overlap QA failed]',result);
    },140);
  }
  scheduleQA();
})();

// V9: keep user ink in a stable worksheet coordinate frame and move AI diagrams/key concepts
// onto the worksheet only when a non-overlapping position is available.
(function loadWrongbookPaperOverlayV9(){
  if(document.getElementById('paperOverlayV9'))return;
  const css=document.createElement('link');
  css.id='paperOverlayV9Css';css.rel='stylesheet';css.href='./paper-overlay-v9.css?wb=20260817-2';
  document.head.appendChild(css);
  const js=document.createElement('script');
  js.id='paperOverlayV9';js.src='./paper-overlay-v9.js?wb=20260817-2';js.async=false;
  document.head.appendChild(js);
})();
