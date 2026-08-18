// Wrong Book — prevent tutor/annotation state from leaking between subjects or problems.
(function(){
  const VERSION='2026-08-18-problem-context-isolation-v1';
  if(window.__wrongbookProblemContextIsolation===VERSION)return;
  window.__wrongbookProblemContextIsolation=VERSION;
  if(typeof selectedProblem!=='function'||typeof render!=='function')return;

  state.tutorByProblem=state.tutorByProblem&&typeof state.tutorByProblem==='object'?state.tutorByProblem:{};

  function keyFor(p){return p?`${String(p.subject||'unknown')}::${String(p.id||'unknown')}`:''}
  function tutorMatches(t,p){return Boolean(t&&p&&String(t.problemId||'')===String(p.id)&&String(t.subject||'')===String(p.subject))}
  function storedTutor(p){
    if(!p)return null;
    if(tutorMatches(p.tutor,p))return p.tutor;
    const t=state.tutorByProblem[keyFor(p)];
    return tutorMatches(t,p)?t:null;
  }
  function syncProblemContext(){
    const p=selectedProblem();
    if(!p){state.tutor=null;state.annotations=[];state.activeProblemContextKey='';return null}
    const key=keyFor(p),t=storedTutor(p);
    state.activeProblemContextKey=key;
    state.tutor=t;
    state.annotations=Array.isArray(p.annotations)?p.annotations:[];
    return p;
  }

  const baseRender=render;
  render=function(){syncProblemContext();return baseRender.apply(this,arguments)};
  try{window.render=render}catch{}

  askTutor=async function(question,rerender=true){
    const p=selectedProblem();
    if(!p)return typeof toast==='function'&&toast('先選一題錯題');
    if(!question)return typeof toast==='function'&&toast('先問一個問題');
    const requestKey=keyFor(p);
    try{
      const workspace=typeof v3WorkspaceImage==='function'?await v3WorkspaceImage():null;
      const original=typeof v3GetImage==='function'?await v3GetImage(p.id):null;
      state.aiLoading=true;syncProblemContext();save();render();
      const body={problemText:p.problemText,question,studentAnswer:p.student,correctAnswer:p.correct};
      if(original?.base64){body.imageBase64=original.base64;body.mimeType=original.mimeType||'image/jpeg'}
      if(workspace?.base64){body.inkImageBase64=workspace.base64;body.inkMimeType=workspace.mimeType||'image/jpeg'}
      const r=await apiCall('/tutor',body),raw=r?.result||{};
      const result={...raw,problemId:p.id,subject:p.subject,contextKey:requestKey};
      p.tutor=result;
      p.annotations=Array.isArray(raw.annotations)?raw.annotations:[];
      state.tutorByProblem[requestKey]=result;
      const current=selectedProblem(),stillCurrent=keyFor(current)===requestKey;
      state.aiLoading=false;
      if(stillCurrent){state.tutor=result;state.annotations=p.annotations}else syncProblemContext();
      save();render();
      if(typeof toast==='function')toast(stillCurrent?(workspace?'AI 已讀取你現在寫在題目上的筆跡並回寫提示':'AI 已把提示放回題目工作區'):'上一題的 AI 提示已完成並保存在那一題，不會帶到目前題目');
      return result;
    }catch(e){
      state.aiLoading=false;syncProblemContext();save();render();
      typeof toast==='function'&&toast('AI 家教失敗：'+(e?.message||e));
      return null;
    }
  };
  try{window.askTutor=askTutor}catch{}

  const before=state.tutor;
  const current=syncProblemContext();
  if(before!==state.tutor||before&&!tutorMatches(before,current)){
    try{save()}catch{}
    try{baseRender()}catch{}
  }

  window.wrongbookProblemContextQA=function(){
    const p=selectedProblem(),t=state.tutor,key=keyFor(p);
    const fakeBio={id:'qa-bio',subject:'biology'},fakeMathTutor={problemId:'qa-math',subject:'math',reply:'stale'};
    return{
      version:VERSION,
      activeKey:key,
      selectedSubject:p?.subject||null,
      selectedProblemId:p?.id||null,
      activeTutorPresent:Boolean(t),
      activeTutorMatchesSelected:!t||tutorMatches(t,p),
      annotationsOwnedBySelected:Boolean(!p||state.annotations===p.annotations||(!state.annotations?.length&&!p.annotations?.length)),
      crossSubjectTutorRejected:!tutorMatches(fakeMathTutor,fakeBio),
      asyncRaceGuard:true,
      tutorStoredOnProblem:true,
      pass:Boolean((!t||tutorMatches(t,p))&&(!p||state.annotations===p.annotations||(!state.annotations?.length&&!p.annotations?.length))&&!tutorMatches(fakeMathTutor,fakeBio))
    };
  };
})();
