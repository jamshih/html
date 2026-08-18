// Wrongbook: preserve worksheet ink across tutor renders without owning tutor navigation.
(function(){
  const VERSION='2026-08-18-tutor-history-persistence-v2-no-nav';
  if(window.__wrongbookTutorHistoryPersistence===VERSION)return;
  window.__wrongbookTutorHistoryPersistence=VERSION;
  if(typeof render!=='function'||typeof v5TutorSession!=='function')return;

  function persistCurrentInk(){
    try{
      if(typeof drawing==='undefined'||!drawing||!drawing.key||!Array.isArray(drawing.paths))return false;
      if(typeof saveInk==='function'){saveInk();return true}
      if(typeof storageGet==='function'&&typeof storageSet==='function'){
        let all={};try{all=JSON.parse(storageGet('wrongbook-v2-ink')||'{}')}catch{}
        all[drawing.key]=drawing.paths;storageSet('wrongbook-v2-ink',JSON.stringify(all));return true;
      }
    }catch{}
    return false;
  }

  function storedInkMatchesCurrent(){
    try{
      if(typeof drawing==='undefined'||!drawing?.key||!Array.isArray(drawing.paths)||typeof storageGet!=='function')return null;
      const all=JSON.parse(storageGet('wrongbook-v2-ink')||'{}');
      return JSON.stringify(all[drawing.key]||[])===JSON.stringify(drawing.paths||[]);
    }catch{return false}
  }

  // Keep the safe ink checkpoint, but do not trigger an extra boot render.
  const baseRender=render;
  const wrappedRender=function(){persistCurrentInk();return baseRender.apply(this,arguments)};
  wrappedRender.__wrongbookInkCheckpoint=true;
  render=wrappedRender;
  try{window.render=wrappedRender}catch{}
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistCurrentInk()});
  window.addEventListener('pagehide',persistCurrentInk);

  // Capture the student's exact worksheet before tutor API calls redraw anything.
  let pendingTutorVisual=null;
  if(typeof v5TutorCall==='function'&&typeof v5TutorVisual==='function'){
    const baseTutorCall=v5TutorCall,baseTutorVisual=v5TutorVisual;
    v5TutorVisual=function(){return pendingTutorVisual?Promise.resolve(pendingTutorVisual):baseTutorVisual.apply(this,arguments)};
    v5TutorCall=async function(kind,options){
      persistCurrentInk();
      let snapshot=null;
      try{if(typeof v3WorkspaceImage==='function')snapshot=await v3WorkspaceImage()}catch{}
      pendingTutorVisual=snapshot;
      try{return await baseTutorCall.call(this,kind,options)}finally{pendingTutorVisual=null}
    };
    try{window.v5TutorCall=v5TutorCall;window.v5TutorVisual=v5TutorVisual}catch{}
  }

  // Navigation belongs to the single compact canonical navigator. Remove stale legacy copies if a cached DOM has one.
  function removeLegacyNavigation(){document.querySelectorAll('.v5-tutor-history-nav').forEach(el=>el.remove())}
  removeLegacyNavigation();
  let queued=false;
  const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;removeLegacyNavigation()})};
  const app=document.getElementById('app');if(app)new MutationObserver(queue).observe(app,{subtree:true,childList:true});

  window.wrongbookTutorPersistenceQA=function(){
    persistCurrentInk();
    const s=v5TutorSession();
    return{
      version:VERSION,
      pass:document.querySelectorAll('.v5-tutor-history-nav').length===0,
      renderFlushInstalled:Boolean(window.render?.__wrongbookInkCheckpoint),
      inkSaveFunctionAvailable:typeof saveInk==='function',
      currentInkStored:storedInkMatchesCurrent(),
      captureBeforeTutorRenderHook:typeof v5TutorCall==='function'&&typeof v5TutorVisual==='function',
      legacyHistoryNavigatorInjected:false,
      bootRenderTriggered:false,
      navigationOwner:'canonical-compact-only',
      currentSessionStageCount:Array.isArray(s?.stages)?s.stages.length:0,
      currentSessionIndex:Number.isFinite(Number(s?.activeIndex))?Number(s.activeIndex):null
    };
  };
})();
