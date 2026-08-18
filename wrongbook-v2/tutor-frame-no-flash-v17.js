// Wrong Book V17 — the tutor frame is a persistent surface, never an animated/revealed surface while paging.
(function(){
  const VERSION='2026-08-18-tutor-frame-no-flash-v17';
  if(window.__wrongbookTutorFrameNoFlashV17===VERSION)return;
  window.__wrongbookTutorFrameNoFlashV17=VERSION;

  const STYLE_ID='wrongbookTutorFrameNoFlashV17Style';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .v3-paper .v5-tutor-dock.v17-tutor-frame-fixed,
      .v3-paper.v12-tutor-up-open .v5-tutor-dock.v17-tutor-frame-fixed:not(.v6-tutor-collapsed),
      .v3-paper.v12-tutor-up-open.v8-tutor-open-flow .v5-tutor-dock.v17-tutor-frame-fixed:not(.v6-tutor-collapsed){animation:none!important;animation-name:none!important;animation-duration:0s!important;transition:none!important;transition-duration:0s!important;clip-path:none!important;opacity:1!important;transform:none!important}
      .v5-tutor-dock.v17-tutor-frame-fixed .v5-tutor-stage{contain:layout paint}
      .v5-tutor-dock.v17-tutor-frame-fixed.v15-inplace-stepping,.v5-tutor-dock.v17-tutor-frame-fixed.v15-inplace-stepping *{scroll-behavior:auto!important}
    `;
    document.head.appendChild(style);
  }

  let lastDock=null,lastProblemId='',replacementCount=0;
  function problemId(){try{return typeof selectedProblem==='function'?(selectedProblem()?.id||''):''}catch{return''}}
  function stabilize(){const dock=document.querySelector('.v5-tutor-dock');if(!dock)return null;const pid=problemId();if(pid!==lastProblemId){lastProblemId=pid;lastDock=dock;replacementCount=0}else if(lastDock&&lastDock!==dock){replacementCount++;lastDock=dock}else if(!lastDock)lastDock=dock;dock.classList.add('v17-tutor-frame-fixed','v15-tutor-frame-stable');if(!dock.dataset.v17FrameId)dock.dataset.v17FrameId=`frame-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;return dock}
  let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;stabilize()})}function mount(){const app=document.getElementById('app');if(!app)return setTimeout(mount,40);new MutationObserver(queue).observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});stabilize()}mount();
  window.wrongbookTutorFrameNoFlashQA=function(){const dock=stabilize();if(!dock)return{version:VERSION,pass:true,tutorMounted:false};const cs=getComputedStyle(dock),durations=String(cs.transitionDuration||'').split(',').map(x=>parseFloat(x)||0),animations=String(cs.animationDuration||'').split(',').map(x=>parseFloat(x)||0),noAnimation=cs.animationName==='none'&&animations.every(x=>x===0),noTransition=durations.every(x=>x===0),noClip=cs.clipPath==='none';return{version:VERSION,pass:noAnimation&&noTransition&&noClip&&replacementCount===0,tutorMounted:true,frameId:dock.dataset.v17FrameId,noAnimation,noTransition,noClip,replacementCount,sameFrameForCurrentProblem:replacementCount===0,stagePagingMustNotRecreateFrame:true}};
})();
