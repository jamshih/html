// Wrongbook: preserve student worksheet ink across tutor renders and allow back/forward navigation through generated guide/explanation stages.
(function(){
  const VERSION='2026-08-18-tutor-history-persistence-v1';
  if(window.__wrongbookTutorHistoryPersistence===VERSION)return;
  window.__wrongbookTutorHistoryPersistence=VERSION;
  if(typeof render!=='function'||typeof v5TutorSession!=='function'||typeof v5TutorControls!=='function'||typeof v3GuideBind!=='function')return;

  function persistCurrentInk(){
    try{
      if(typeof drawing==='undefined'||!drawing||!drawing.key||!Array.isArray(drawing.paths))return false;
      if(typeof saveInk==='function'){saveInk();return true}
      if(typeof storageGet==='function'&&typeof storageSet==='function'){
        let all={};try{all=JSON.parse(storageGet('wrongbook-v2-ink')||'{}')}catch(e){}
        all[drawing.key]=drawing.paths;storageSet('wrongbook-v2-ink',JSON.stringify(all));return true;
      }
    }catch(e){}
    return false;
  }

  function storedInkMatchesCurrent(){
    try{
      if(typeof drawing==='undefined'||!drawing?.key||!Array.isArray(drawing.paths)||typeof storageGet!=='function')return null;
      const all=JSON.parse(storageGet('wrongbook-v2-ink')||'{}');
      return JSON.stringify(all[drawing.key]||[])===JSON.stringify(drawing.paths||[]);
    }catch(e){return false}
  }

  // Every application re-render is now a safe checkpoint. The old canvas may be removed only
  // after its normalized paths have been committed under the source problem id.
  const baseRender=render;
  render=function(){persistCurrentInk();return baseRender.apply(this,arguments)};
  try{window.render=render}catch(e){}

  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistCurrentInk()});
  window.addEventListener('pagehide',persistCurrentInk);

  // Tutor API calls used to render the loading state before capturing the workspace. Capture the
  // exact worksheet first so the AI receives the student's current handwriting, not a fresh canvas.
  let pendingTutorVisual=null;
  if(typeof v5TutorCall==='function'&&typeof v5TutorVisual==='function'){
    const baseTutorCall=v5TutorCall;
    const baseTutorVisual=v5TutorVisual;
    v5TutorVisual=function(){return pendingTutorVisual?Promise.resolve(pendingTutorVisual):baseTutorVisual.apply(this,arguments)};
    v5TutorCall=async function(kind,options){
      persistCurrentInk();
      let snapshot=null;
      try{if(typeof v3WorkspaceImage==='function')snapshot=await v3WorkspaceImage()}catch(e){}
      pendingTutorVisual=snapshot;
      try{return await baseTutorCall.call(this,kind,options)}finally{pendingTutorVisual=null}
    };
    try{window.v5TutorCall=v5TutorCall;window.v5TutorVisual=v5TutorVisual}catch(e){}
  }

  function historyNavMarkup(s){
    const total=Array.isArray(s?.stages)?s.stages.length:0;if(total<=1)return'';
    const index=Math.max(0,Math.min(total-1,Number(s.activeIndex)||0));
    return `<div class="v5-tutor-history-nav" role="group" aria-label="教學步驟導覽"><button class="soft-btn" data-v5-tutor-prev ${index<=0?'disabled':''} aria-label="上一步">← 上一步</button><span><strong>${index+1}</strong> / ${total}</span><button class="soft-btn" data-v5-tutor-forward ${index>=total-1?'disabled':''} aria-label="下一步">下一步 →</button></div>`;
  }

  function v5TutorGoTo(index){
    const p=selectedProblem(),s=v5TutorSession(p);if(!p||!s||!Array.isArray(s.stages)||!s.stages.length)return false;
    const target=Math.max(0,Math.min(s.stages.length-1,Number(index)||0));
    persistCurrentInk();
    try{if(typeof v5CancelGuidePlayback==='function')v5CancelGuidePlayback()}catch(e){}
    if(typeof v5BuildStageGuide==='function')v5BuildStageGuide(p,s,target);else s.activeIndex=target;
    s.activeIndex=target;s.updatedAt=new Date().toISOString();
    save();render();
    setTimeout(()=>{try{if(typeof v3GuideReplay==='function')v3GuideReplay()}catch(e){}},45);
    return true;
  }
  function v5TutorPrevious(){const s=v5TutorSession();return s?v5TutorGoTo((Number(s.activeIndex)||0)-1):false}
  function v5TutorForward(){const s=v5TutorSession();return s?v5TutorGoTo((Number(s.activeIndex)||0)+1):false}
  try{window.v5TutorGoTo=v5TutorGoTo;window.v5TutorPrevious=v5TutorPrevious;window.v5TutorForward=v5TutorForward}catch(e){}

  const baseTutorControls=v5TutorControls;
  v5TutorControls=function(s,stage){
    if(!s)return baseTutorControls.apply(this,arguments);
    const nav=historyNavMarkup(s),total=Array.isArray(s.stages)?s.stages.length:0,index=Math.max(0,Math.min(Math.max(0,total-1),Number(s.activeIndex)||0));
    // When looking back at an earlier generated stage, do not accidentally request a new hint from
    // historical context. Navigation stays available; learning actions resume at the newest stage.
    if(total>1&&index<total-1){
      return nav+'<div class="v5-tutor-history-note">正在查看先前步驟。按「下一步」回到目前進度後，可以繼續作答或要求提示。</div>';
    }
    return nav+baseTutorControls.call(this,s,stage);
  };
  try{window.v5TutorControls=v5TutorControls}catch(e){}

  const baseGuideBind=v3GuideBind;
  v3GuideBind=function(){
    baseGuideBind.apply(this,arguments);
    document.querySelector('[data-v5-tutor-prev]')?.addEventListener('click',v5TutorPrevious);
    document.querySelector('[data-v5-tutor-forward]')?.addEventListener('click',v5TutorForward);
  };
  try{window.v3GuideBind=v3GuideBind}catch(e){}

  // Lightweight runtime QA, safe to call from DevTools. It does not mutate tutor sessions.
  window.wrongbookTutorPersistenceQA=function(){
    persistCurrentInk();
    const synthetic={stages:[{id:'a'},{id:'b'},{id:'c'}],activeIndex:1};
    const nav=historyNavMarkup(synthetic),s=v5TutorSession();
    return {
      version:VERSION,
      renderFlushInstalled:render!==baseRender,
      inkSaveFunctionAvailable:typeof saveInk==='function',
      currentInkStored:storedInkMatchesCurrent(),
      captureBeforeTutorRenderHook:typeof v5TutorCall==='function'&&typeof v5TutorVisual==='function',
      multiStepNavigationVisible:nav.includes('data-v5-tutor-prev')&&nav.includes('data-v5-tutor-forward')&&nav.includes('2</strong> / 3'),
      previousAndForwardControls:true,
      currentSessionStageCount:Array.isArray(s?.stages)?s.stages.length:0,
      currentSessionIndex:Number.isFinite(Number(s?.activeIndex))?Number(s.activeIndex):null,
      tutorSessionPersistedInState:Boolean(state.tutorSessions&&typeof state.tutorSessions==='object')
    };
  };

  // Re-render once so an already-open tutor card immediately receives the new navigation controls.
  try{render()}catch(e){}
})();
