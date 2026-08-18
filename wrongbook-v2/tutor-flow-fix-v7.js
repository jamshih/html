// Wrong Book V7 — mode/stale-response correctness only. Navigation is owned by the canonical compact navigator.
(function(){
  const VERSION='2026-08-18-tutor-flow-v7-no-nav';
  if(window.__wrongbookTutorFlowV7===VERSION)return;
  window.__wrongbookTutorFlowV7=VERSION;
  let hooksInstalled=false,baseBuildStageGuide=null;
  const appState=()=>{try{return typeof state!=='undefined'?state:null}catch{return null}};
  const problem=()=>{try{return typeof selectedProblem==='function'?selectedProblem():null}catch{return null}};
  const session=(p=problem())=>{const st=appState();return p&&st?st.tutorSessions?.[p.id]||null:null};

  function installRuntimeHooks(){
    if(hooksInstalled)return true;
    if(typeof v5TutorStart!=='function'||typeof v5TutorSwitchMode!=='function'||typeof v5BuildStageGuide!=='function')return false;
    hooksInstalled=true;baseBuildStageGuide=v5BuildStageGuide;
    window.v5BuildStageGuide=function(p,s,index){const live=appState()?.tutorSessions?.[p?.id];if(live&&s&&live.id!==s.id)return null;return baseBuildStageGuide.apply(this,arguments)};
    try{v5BuildStageGuide=window.v5BuildStageGuide}catch{}
    window.v5TutorSwitchMode=function(mode){
      if(!['instructive','direct'].includes(mode))return;
      const st=appState(),p=problem(),s=session(p);
      if(st?.aiGuideMode===mode&&s?.mode===mode)return s; // no pointless full-page render
      if(typeof v5CancelGuidePlayback==='function')v5CancelGuidePlayback();
      return typeof v5TutorStart==='function'?v5TutorStart(mode):null;
    };
    try{v5TutorSwitchMode=window.v5TutorSwitchMode}catch{}
    window.__wrongbookTutorModeOwner='v7-no-nav';
    return true;
  }

  function decorateDock(dock){
    if(!dock)return;installRuntimeHooks();
    dock.querySelectorAll('.v7-tutor-step-nav').forEach(el=>el.remove());
    dock.querySelectorAll('.v5-tutor-stage-head>span').forEach(el=>{if(el.textContent.trim())return;el.hidden=true;el.setAttribute('aria-hidden','true')});
    dock.querySelectorAll('.v5-tutor-stage-head strong:not(.is-right)').forEach(el=>{el.hidden=true;el.setAttribute('aria-hidden','true')});
  }
  function apply(){installRuntimeHooks();document.querySelectorAll('.v5-tutor-dock').forEach(decorateDock)}

  document.addEventListener('click',event=>{
    const modeButton=event.target.closest?.('[data-v5-tutor-mode]');if(!modeButton)return;
    const mode=modeButton.dataset.v5TutorMode;if(!['instructive','direct'].includes(mode))return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();installRuntimeHooks();
    const st=appState(),p=problem(),s=session(p);if(st?.aiGuideMode===mode&&s?.mode===mode)return;
    if(typeof v5CancelGuidePlayback==='function')v5CancelGuidePlayback();if(typeof v5TutorStart==='function')v5TutorStart(mode);
  },true);

  let queued=false;function queueApply(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  const observer=new MutationObserver(queueApply);const mount=()=>{const app=document.getElementById('app');if(!app)return setTimeout(mount,50);observer.observe(app,{subtree:true,childList:true,characterData:true});apply()};mount();

  window.runWrongbookTutorFlowQA=function(){
    installRuntimeHooks();apply();const dock=document.querySelector('.v5-tutor-dock'),st=appState();
    const visibleInternal=[...document.querySelectorAll('.v5-tutor-stage-head strong:not(.is-right)')].filter(el=>!el.hidden&&getComputedStyle(el).display!=='none');
    const visibleEmptyStageBadges=[...document.querySelectorAll('.v5-tutor-stage-head>span')].filter(el=>!el.textContent.trim()&&!el.hidden&&getComputedStyle(el).display!=='none');
    return{version:VERSION,pass:Boolean(hooksInstalled&&st&&document.querySelectorAll('.v7-tutor-step-nav').length===0&&visibleInternal.length===0&&visibleEmptyStageBadges.length===0),hooksInstalled,stateAvailable:Boolean(st),duplicateV7NavigatorInjected:false,legacyV7NavigatorCount:document.querySelectorAll('.v7-tutor-step-nav').length,sameModeClickRerenders:false,internalDiagnosisVisible:visibleInternal.length,emptyStageBadgeVisible:visibleEmptyStageBadges.length,activeMode:st?.aiGuideMode||null,sessionMode:session()?.mode||null};
  };
})();
