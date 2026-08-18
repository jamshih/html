// Wrong Book V13b — unified tutor surface with an idempotent DOM normalizer.
// Scope intentionally limited to the problem worksheet + tutor surface.
(function(){
  const VERSION='2026-08-18-tutor-workspace-unify-v13b-idempotent';
  if(window.__wrongbookTutorWorkspaceUnifyV13===VERSION)return;
  window.__wrongbookTutorWorkspaceUnifyV13=VERSION;

  const STYLE_ID='wrongbookTutorWorkspaceUnifyV13Style';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .v3-paper{min-height:760px!important}
      .v3-paper .paper-demo{min-height:760px!important;padding-bottom:170px!important}
      .v5-tutor-history-nav,.v7-tutor-step-nav{display:none!important}
      .v5-tutor-step-nav{width:min(430px,100%)!important;margin:6px auto 5px!important;padding:5px 0!important;gap:6px!important}
      .v5-tutor-step-nav>button{min-width:64px!important;min-height:32px!important;padding:5px 8px!important;font-size:12px!important;border-radius:9px!important}
      .v5-tutor-step-track{gap:5px!important}.v5-tutor-step-dot{width:8px!important;height:8px!important}.v5-tutor-step-count{font-size:11px!important;margin-left:4px!important}
      @media(max-width:700px){.v3-paper{min-height:680px!important}.v3-paper .paper-demo{min-height:680px!important;padding-bottom:150px!important}.v5-tutor-step-nav{width:100%!important;max-width:390px!important}.v5-tutor-step-nav>button{min-width:56px!important;padding:5px 7px!important;font-size:11px!important}}
    `;
    document.head.appendChild(style);
  }

  const metrics=window.__wrongbookTutorWorkspaceV13Metrics={observerCallbacks:0,normalizationPasses:0,domChanges:0};
  const TEXT='✦ AI 家教看我的作答';
  const ARIA='讓 AI 家教讀取目前作答並給文字與題目上的提示';
  function currentSession(){try{const p=typeof selectedProblem==='function'?selectedProblem():null;if(!p)return null;return typeof v5TutorSession==='function'?v5TutorSession(p):(state?.tutorSessions?.[p.id]||null)}catch{return null}}
  async function runUnifiedOnPaperTutor(){
    try{
      const p=typeof selectedProblem==='function'?selectedProblem():null;if(!p){typeof toast==='function'&&toast('先選一題錯題');return false}
      if(typeof v5CancelGuidePlayback==='function')v5CancelGuidePlayback();if(typeof state!=='undefined')state.aiGuideMode='instructive';const s=currentSession();
      if(s&&s.mode==='instructive'&&Array.isArray(s.stages)&&s.stages.length){if(typeof v5TutorEvaluate==='function')await v5TutorEvaluate();else if(typeof v5TutorHint==='function')await v5TutorHint();else if(typeof v5TutorStart==='function')await v5TutorStart('instructive')}
      else if(typeof v5TutorStart==='function')await v5TutorStart('instructive');
      else{typeof toast==='function'&&toast('AI 家教尚未載入，請重新整理後再試');return false}
      setTimeout(()=>{const dock=document.querySelector('.v5-tutor-dock');if(dock?.classList.contains('v6-tutor-collapsed')){const toggle=dock.querySelector('.v6-tutor-collapse-button');if(toggle)toggle.click();else dock.classList.remove('v6-tutor-collapsed')}dock?.scrollIntoView?.({block:'nearest',behavior:'smooth'})},100);return true;
    }catch(e){typeof toast==='function'&&toast('AI 家教提示失敗：'+(e?.message||e));return false}
  }

  document.addEventListener('click',event=>{const button=event.target?.closest?.('[data-action="aiOnPaper"]');if(!button)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();runUnifiedOnPaperTutor()},true);

  function normalizeTutorDom(){
    metrics.normalizationPasses++;
    let changes=0;
    document.querySelectorAll('.v5-tutor-history-nav,.v7-tutor-step-nav').forEach(el=>{el.remove();changes++});
    document.querySelectorAll('[data-action="aiOnPaper"]').forEach(button=>{
      // Do not rewrite textContent on every observer pass. Replacing an identical text node creates a
      // childList mutation and previously produced a self-sustaining MutationObserver/rAF loop.
      if(button.textContent!==TEXT){button.textContent=TEXT;changes++}
      if(button.getAttribute('aria-label')!==ARIA){button.setAttribute('aria-label',ARIA);changes++}
      if(button.dataset.tutorOwner!=='v13'){button.dataset.tutorOwner='v13';changes++}
    });
    metrics.domChanges+=changes;
    return changes;
  }
  let queued=false;function queue(){metrics.observerCallbacks++;if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;normalizeTutorDom()})}
  const mount=()=>{const app=document.getElementById('app');if(!app)return setTimeout(mount,50);new MutationObserver(queue).observe(app,{subtree:true,childList:true});normalizeTutorDom()};mount();

  window.wrongbookTutorWorkspaceUnifyQA=function(){
    normalizeTutorDom();const before=metrics.domChanges;normalizeTutorDom();const idempotent=metrics.domChanges===before;
    const paper=document.querySelector('.v3-paper'),dock=document.querySelector('.v5-tutor-dock');const navs=dock?[...dock.querySelectorAll('.v5-tutor-step-nav,.v5-tutor-history-nav,.v7-tutor-step-nav')].filter(el=>getComputedStyle(el).display!=='none'):[];const canonical=dock?.querySelector('.v5-tutor-step-nav')||null,paperHeight=paper?parseFloat(getComputedStyle(paper).minHeight)||0:0,navWidth=canonical?canonical.getBoundingClientRect().width:0,onPaper=document.querySelector('[data-action="aiOnPaper"]'),session=currentSession();
    return{version:VERSION,pass:Boolean((!dock||navs.length<=1)&&(!canonical||navWidth<=432)&&(!paper||paperHeight>=680)&&(!onPaper||onPaper.dataset.tutorOwner==='v13')&&idempotent),visibleTutorNavCount:navs.length,canonicalNavPresent:Boolean(canonical),canonicalNavWidth:Math.round(navWidth),paperMinHeight:paperHeight,onPaperOwnedByUnifiedTutor:onPaper?.dataset.tutorOwner==='v13'||false,legacyHistoryNavPresent:Boolean(document.querySelector('.v5-tutor-history-nav')),legacyV7NavPresent:Boolean(document.querySelector('.v7-tutor-step-nav')),sessionMode:session?.mode||null,textStageAvailable:Boolean(session?.stages?.[session?.activeIndex]?.promptToStudent),observerIdempotent:idempotent,observerCallbacks:metrics.observerCallbacks,normalizationPasses:metrics.normalizationPasses,domChanges:metrics.domChanges};
  };
})();
