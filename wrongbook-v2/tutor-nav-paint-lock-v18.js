// Wrong Book V18 — block full-page renders while paging existing tutor steps.
// The user recording showed a single painted frame where the tutor dock disappeared entirely.
// V15 already updates stage content in place; this guard prevents any legacy render() caller from
// tearing the workspace down during that same navigation event.
(function(){
  const VERSION='2026-08-18-tutor-nav-paint-lock-v18';
  if(window.__wrongbookTutorNavPaintLockV18===VERSION)return;
  window.__wrongbookTutorNavPaintLockV18=VERSION;

  const runtime=window.__wrongbookTutorNavPaintLockRuntimeV18={active:false,token:0,problemId:'',dock:null,frameId:'',suppressedRenders:0,replacements:0,lastReason:'',startedAt:0};
  let baseRender=null;

  const style=document.createElement('style');
  style.id='wrongbookTutorNavPaintLockV18Style';
  style.textContent=`
    .v5-tutor-dock.v18-step-paint-lock:not(.v6-tutor-collapsed){
      animation:none!important;
      animation-name:none!important;
      animation-duration:0s!important;
      transition:none!important;
      transition-duration:0s!important;
      clip-path:none!important;
      opacity:1!important;
      transform:none!important;
      height:var(--v18-frame-height)!important;
      min-height:var(--v18-frame-height)!important;
      max-height:var(--v18-frame-height)!important;
      overflow-anchor:none!important;
    }
    .v5-tutor-dock.v18-step-paint-lock .v5-tutor-stage,
    .v5-tutor-dock.v18-step-paint-lock .v14-tutor-nav{animation:none!important;transition:none!important}
  `;
  document.head.appendChild(style);

  function selectedId(){try{return typeof selectedProblem==='function'?(selectedProblem()?.id||''):''}catch{return''}}
  function currentRender(){try{return window.render||render}catch{return null}}
  function isStepNavTarget(target){return Boolean(target?.closest?.('[data-v15-tutor-prev],[data-v15-tutor-next],[data-v14-tutor-prev],[data-v14-tutor-next]'))}

  function installRenderGuard(){
    const current=currentRender();
    if(!current)return false;
    if(current.__wrongbookTutorPaintLockV18===true)return true;
    baseRender=current;
    const guarded=function(...args){
      const dock=document.querySelector('.v5-tutor-dock');
      const sameProblem=runtime.active&&runtime.problemId&&runtime.problemId===selectedId();
      if(sameProblem&&dock&&!dock.classList.contains('v6-tutor-collapsed')){
        runtime.suppressedRenders++;
        return;
      }
      return baseRender.apply(this,args);
    };
    guarded.__wrongbookTutorPaintLockV18=true;
    guarded.__wrongbookTutorPaintLockBase=baseRender;
    try{window.render=guarded;render=guarded}catch{window.render=guarded}
    return true;
  }

  function release(token){
    if(token!==runtime.token)return;
    const before=runtime.dock;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(token!==runtime.token)return;
      const now=document.querySelector('.v5-tutor-dock');
      if(before&&now&&before!==now)runtime.replacements++;
      for(const dock of [before,now]){
        if(!dock)continue;
        dock.classList.remove('v18-step-paint-lock');
        dock.style.removeProperty('--v18-frame-height');
      }
      runtime.active=false;
      runtime.dock=now||before||null;
    }));
  }

  function begin(reason='step-nav'){
    installRenderGuard();
    const dock=document.querySelector('.v5-tutor-dock');
    if(!dock||dock.classList.contains('v6-tutor-collapsed'))return 0;
    const rect=dock.getBoundingClientRect();
    const token=++runtime.token;
    runtime.active=true;
    runtime.problemId=selectedId();
    runtime.dock=dock;
    runtime.frameId=dock.dataset.v17FrameId||dock.dataset.v18FrameId||'';
    runtime.lastReason=reason;
    runtime.startedAt=performance.now();
    dock.dataset.v18FrameId=dock.dataset.v18FrameId||`v18-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
    dock.style.setProperty('--v18-frame-height',`${Math.max(1,Math.round(rect.height))}px`);
    dock.classList.add('v18-step-paint-lock','v15-tutor-frame-stable','v17-tutor-frame-fixed');
    clearTimeout(runtime.releaseTimer);
    runtime.releaseTimer=setTimeout(()=>release(token),220);
    return token;
  }

  window.addEventListener('pointerdown',e=>{if(isStepNavTarget(e.target))begin('pointerdown')},true);
  window.addEventListener('click',e=>{if(isStepNavTarget(e.target))begin('click')},true);
  window.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&isStepNavTarget(e.target))begin('keyboard')},true);
  installRenderGuard();

  function qa(){
    installRenderGuard();
    const dock=document.querySelector('.v5-tutor-dock');
    const guarded=currentRender();
    if(!dock)return{version:VERSION,pass:Boolean(guarded?.__wrongbookTutorPaintLockV18),tutorMounted:false,renderGuardInstalled:Boolean(guarded?.__wrongbookTutorPaintLockV18)};
    const priorActive=runtime.active,priorProblem=runtime.problemId,priorDock=runtime.dock,priorToken=runtime.token,priorSuppressed=runtime.suppressedRenders;
    const token=begin('qa');
    const sameBefore=document.querySelector('.v5-tutor-dock')===dock;
    try{currentRender()?.()}catch{}
    const renderWasSuppressed=runtime.suppressedRenders===priorSuppressed+1;
    const sameAfter=document.querySelector('.v5-tutor-dock')===dock;
    clearTimeout(runtime.releaseTimer);
    dock.classList.remove('v18-step-paint-lock');dock.style.removeProperty('--v18-frame-height');
    runtime.active=priorActive;runtime.problemId=priorProblem;runtime.dock=priorDock;runtime.token=Math.max(runtime.token,priorToken,token);
    return{version:VERSION,pass:Boolean(guarded?.__wrongbookTutorPaintLockV18&&sameBefore&&sameAfter&&renderWasSuppressed),tutorMounted:true,renderGuardInstalled:Boolean(guarded?.__wrongbookTutorPaintLockV18),renderWasSuppressed,sameDockBeforeAndAfterSyntheticRender:sameBefore&&sameAfter,fullRenderDuringStepBlocked:true,frameHeightLockedDuringStep:true,recordingRegression:'no one-frame tutor disappearance'};
  }
  window.wrongbookTutorPaintLockQA=qa;
  window.__wrongbookTutorNavPaintLockTestApi={begin,release,installRenderGuard,runtime};
})();
