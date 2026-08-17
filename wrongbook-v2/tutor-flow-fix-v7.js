// Wrong Book V7 — tutor flow correctness patch.
// 1) "引導我解題" must always enter instructive mode, never reuse a direct-answer session.
// 2) stale responses from an abandoned mode may not take ownership of the visible tutor.
// 3) students can move backward/forward through already-generated steps without another AI call.
(function(){
  const VERSION='2026-08-17-tutor-flow-v7';
  if(window.__wrongbookTutorFlowV7===VERSION)return;
  window.__wrongbookTutorFlowV7=VERSION;

  let hooksInstalled=false;
  let baseBuildStageGuide=null;
  let baseSwitchMode=null;

  function problem(){
    try{return typeof window.selectedProblem==='function'?window.selectedProblem():null}catch{return null}
  }
  function session(p=problem()){
    if(!p)return null;
    return window.state?.tutorSessions?.[p.id]||null;
  }

  function installRuntimeHooks(){
    if(hooksInstalled)return true;
    if(typeof window.v5TutorStart!=='function'||typeof window.v5TutorSwitchMode!=='function'||typeof window.v5BuildStageGuide!=='function')return false;

    hooksInstalled=true;
    baseBuildStageGuide=window.v5BuildStageGuide;
    baseSwitchMode=window.v5TutorSwitchMode;

    // A response from a session that is no longer the selected problem's live session must never
    // set state.aiGuideMode or replace the visible guide. This closes the direct→instructive race.
    window.v5BuildStageGuide=function(p,s,index){
      const live=p?.id?window.state?.tutorSessions?.[p.id]:null;
      if(live&&s&&live.id!==s.id)return null;
      return baseBuildStageGuide.apply(this,arguments);
    };
    try{v5BuildStageGuide=window.v5BuildStageGuide}catch{}

    // Switching tabs starts that tab's own session. The old implementation only nulled the session
    // when moving to instructive mode, which allowed direct-mode state/results to remain authoritative.
    window.v5TutorSwitchMode=function(mode){
      if(!['instructive','direct'].includes(mode))return;
      const p=problem(),s=session(p);
      if(window.state?.aiGuideMode===mode&&s?.mode===mode){
        window.render?.();
        return s;
      }
      window.v5CancelGuidePlayback?.();
      return window.v5TutorStart(mode);
    };
    try{v5TutorSwitchMode=window.v5TutorSwitchMode}catch{}

    window.__wrongbookTutorModeOwner='v7';
    return true;
  }

  function moveToStep(delta){
    installRuntimeHooks();
    const p=problem(),s=session(p);
    if(!p||!s||!Array.isArray(s.stages)||!s.stages.length)return false;
    const target=Math.max(0,Math.min(s.stages.length-1,(Number(s.activeIndex)||0)+delta));
    if(target===s.activeIndex)return false;
    window.v5CancelGuidePlayback?.();
    const guide=window.v5BuildStageGuide?.(p,s,target);
    window.save?.();
    window.render?.();
    if(guide)setTimeout(()=>window.v3GuideReplay?.(),45);
    return true;
  }

  function decorateDock(dock){
    if(!dock)return;
    installRuntimeHooks();

    // Never surface internal diagnosis/blind-spot prose to the student.
    dock.querySelectorAll('.v5-tutor-stage-head strong:not(.is-right)').forEach(el=>{
      el.hidden=true;
      el.setAttribute('aria-hidden','true');
    });

    const s=session();
    const head=dock.querySelector('.v5-tutor-stage-head');
    if(!head||!s||!Array.isArray(s.stages)||s.stages.length<2){
      dock.querySelectorAll('.v7-tutor-step-nav').forEach(el=>el.remove());
      return;
    }

    let nav=head.querySelector(':scope > .v7-tutor-step-nav');
    if(!nav){
      nav=document.createElement('div');
      nav.className='v7-tutor-step-nav';
      nav.setAttribute('aria-label','AI 家教步驟導覽');
      nav.innerHTML='<button type="button" data-v7-tutor-step="prev" aria-label="上一步">‹</button><span></span><button type="button" data-v7-tutor-step="next" aria-label="下一步">›</button>';
      head.appendChild(nav);
    }
    const index=Math.max(0,Math.min(s.stages.length-1,Number(s.activeIndex)||0));
    const prev=nav.querySelector('[data-v7-tutor-step="prev"]');
    const next=nav.querySelector('[data-v7-tutor-step="next"]');
    if(prev)prev.disabled=index<=0;
    if(next)next.disabled=index>=s.stages.length-1;
    const label=nav.querySelector('span');
    if(label)label.textContent=`${index+1} / ${s.stages.length}`;
  }

  function apply(){
    installRuntimeHooks();
    document.querySelectorAll('.v5-tutor-dock').forEach(decorateDock);
  }

  // Capture before the legacy bubble listeners. Each mode tab has exactly one semantic route.
  document.addEventListener('click',event=>{
    const step=event.target.closest?.('[data-v7-tutor-step]');
    if(step){
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
      moveToStep(step.dataset.v7TutorStep==='prev'?-1:1);
      return;
    }

    const modeButton=event.target.closest?.('[data-v5-tutor-mode]');
    if(!modeButton)return;
    const mode=modeButton.dataset.v5TutorMode;
    if(!['instructive','direct'].includes(mode))return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    installRuntimeHooks();
    const p=problem(),s=session(p);
    if(window.state?.aiGuideMode===mode&&s?.mode===mode){
      window.render?.();
      return;
    }
    window.v5CancelGuidePlayback?.();
    window.v5TutorStart?.(mode);
  },true);

  let queued=false;
  function queueApply(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply()});
  }

  const observer=new MutationObserver(queueApply);
  const mount=()=>{
    const app=document.getElementById('app');
    if(!app)return setTimeout(mount,50);
    observer.observe(app,{subtree:true,childList:true,characterData:true});
    apply();
  };
  mount();

  // Lightweight runtime QA. It does not call the API or alter the student's current session.
  window.runWrongbookTutorFlowQA=function(){
    installRuntimeHooks();apply();
    const dock=document.querySelector('.v5-tutor-dock');
    const instructive=dock?.querySelector('[data-v5-tutor-mode="instructive"]');
    const direct=dock?.querySelector('[data-v5-tutor-mode="direct"]');
    const visibleInternal=[...document.querySelectorAll('.v5-tutor-stage-head strong:not(.is-right)')].filter(el=>!el.hidden&&getComputedStyle(el).display!=='none');
    const s=session();
    const nav=dock?.querySelector('.v7-tutor-step-nav');
    const navExpected=Boolean(s?.stages?.length>1);
    const navOk=navExpected?Boolean(nav):!nav;
    const routesOk=instructive?.dataset.v5TutorMode==='instructive'&&direct?.dataset.v5TutorMode==='direct'&&window.__wrongbookTutorModeOwner==='v7';
    return{
      pass:Boolean(routesOk&&visibleInternal.length===0&&navOk&&hooksInstalled),
      version:VERSION,
      hooksInstalled,
      routesOk,
      internalDiagnosisVisible:visibleInternal.length,
      navExpected,
      navPresent:Boolean(nav),
      activeMode:window.state?.aiGuideMode||null,
      sessionMode:s?.mode||null,
      activeIndex:s?.activeIndex??null,
      stageCount:s?.stages?.length||0
    };
  };

  function scheduleQA(tries=0){
    setTimeout(()=>{
      const result=window.runWrongbookTutorFlowQA?.();
      if((!result||!result.hooksInstalled)&&tries<30)return scheduleQA(tries+1);
      window.__wrongbookTutorFlowV7QA=result;
      if(result&&!result.pass)console.warn('[Wrongbook tutor flow QA failed]',result);
    },120);
  }
  scheduleQA();
})();
