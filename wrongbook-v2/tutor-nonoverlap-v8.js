// Wrong Book V8 — keep the expanded AI tutor out of the problem prompt's visual space.
(function(){
  const VERSION='2026-08-17-tutor-nonoverlap-v8-v12b';
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

  function apply(){document.querySelectorAll('.v5-tutor-dock').forEach(syncDock)}
  let queued=false;
  function queueApply(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  function rectsOverlap(a,b){if(!a||!b||!a.width||!a.height||!b.width||!b.height)return false;return !(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom)}
  function problemContentBottom(paper){const nodes=[...paper.querySelectorAll('.paper-demo,.v3-scan-wrap,.scan-text')].filter(el=>getComputedStyle(el).display!=='none');if(!nodes.length)return paper.getBoundingClientRect().top;return Math.max(...nodes.map(el=>el.getBoundingClientRect().bottom))}

  window.runWrongbookTutorNonOverlapQA=function(){
    apply();
    const dock=document.querySelector('.v5-tutor-dock'),paper=dock?.closest('.v3-paper');
    if(!dock||!paper)return{pass:false,reason:'tutor-or-paper-not-mounted',version:VERSION};

    if(document.getElementById('tutorCollapseUpV12')){
      if(typeof window.runWrongbookTutorCollapseDirectionQA!=='function')return{pass:false,reason:'waiting-v12',version:VERSION};
      const up=window.runWrongbookTutorCollapseDirectionQA();
      if(up?.reason)return{pass:false,reason:up.reason,version:VERSION,upward:up};
      const pass=Boolean(up.bottomAnchored&&up.growsUpward&&up.noPromptOverlap&&up.noToolbarOverlap&&up.geometryOwned);
      return{pass,version:VERSION,mode:'upward-v12',...up};
    }

    const wasCollapsed=dock.classList.contains('v6-tutor-collapsed');dock.classList.remove('v6-tutor-collapsed');syncDock(dock);
    const style=getComputedStyle(dock),dockRect=dock.getBoundingClientRect(),contentBottom=problemContentBottom(paper),toolbar=paper.querySelector('.paper-toolbar'),toolbarRect=toolbar&&getComputedStyle(toolbar).display!=='none'?toolbar.getBoundingClientRect():null;
    const participatesInFlow=!['absolute','fixed'].includes(style.position),noPromptOverlap=dockRect.top>=contentBottom-1,noToolbarOverlap=!toolbarRect||!rectsOverlap(dockRect,toolbarRect),noInnerScroll=style.maxHeight==='none'&&style.overflowY!=='auto'&&style.overflowY!=='scroll',paperOwnsOpenState=paper.classList.contains('v8-tutor-open-flow');
    if(wasCollapsed)dock.classList.add('v6-tutor-collapsed');syncDock(dock);
    const pass=participatesInFlow&&noPromptOverlap&&noToolbarOverlap&&noInnerScroll&&paperOwnsOpenState;
    return{pass,version:VERSION,mode:'flow-fallback',participatesInFlow,noPromptOverlap,noToolbarOverlap,noInnerScroll,paperOwnsOpenState,position:style.position,dockTop:Math.round(dockRect.top),contentBottom:Math.round(contentBottom),dockHeight:Math.round(dockRect.height),viewportWidth:window.innerWidth};
  };

  const mount=()=>{
    const app=document.getElementById('app');if(!app)return setTimeout(mount,50);
    const observer=new MutationObserver(queueApply);observer.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});window.__wrongbookTutorNonOverlapV8Observer=observer;apply();
  };
  mount();
  function scheduleQA(tries=0){setTimeout(()=>{const result=window.runWrongbookTutorNonOverlapQA?.();if(['tutor-or-paper-not-mounted','waiting-v12'].includes(result?.reason)&&tries<30)return scheduleQA(tries+1);window.__wrongbookTutorNonOverlapV8QA=result;if(result&&!result.pass)console.warn('[Wrongbook tutor non-overlap QA failed]',result)},180)}
  scheduleQA();
})();

(function loadWrongbookPaperOverlayV9(){
  if(document.getElementById('paperOverlayV9')||document.getElementById('paperOverlayV9Css'))return;
  const loadJs=()=>{
    if(document.getElementById('paperOverlayV9'))return;
    const js=document.createElement('script');js.id='paperOverlayV9';js.src='./paper-overlay-v9.js?wb=20260817-3';js.async=false;document.head.appendChild(js);
  };
  const css=document.createElement('link');css.id='paperOverlayV9Css';css.rel='stylesheet';css.href='./paper-overlay-v9.css?wb=20260817-3';css.onload=css.onerror=loadJs;document.head.appendChild(css);
})();

// V12 owns actual geometry: same bottom edge, top moves upward, prompt remains a hard ceiling.
(function loadWrongbookTutorCollapseUpV12(){
  if(document.getElementById('tutorCollapseUpV12'))return;
  const js=document.createElement('script');
  js.id='tutorCollapseUpV12';
  js.src='./tutor-collapse-up-v12.js?wb=20260817-2';
  js.async=false;
  document.head.appendChild(js);
})();
