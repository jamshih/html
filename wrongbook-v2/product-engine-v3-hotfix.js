// V3 compatibility layer for the existing wrongbook-ai API.
function v3ThreadCode(p){return p?`${p.conceptCode||'CONCEPT'}::${v3ProblemKey(p)}`:''}

async function v3HydrateSelectedImage(){
  const p=selectedProblem();if(!p||!p.imageKey)return;
  const img=document.querySelector(`[data-problem-image="${CSS.escape(p.id)}"]`);if(!img||img.getAttribute('src'))return;
  const rec=await v3GetImage(p.id);if(rec?.dataUrl){img.onload=()=>{try{if(['notebook','tutor'].includes(state.page)&&selectedProblem()?.id===p.id)initCanvas(p.id)}catch{}};img.src=rec.dataUrl}
}

async function v3ValidateCorrection(label){
  const p=selectedProblem();if(!p)return;const input=document.querySelector(`[data-correction="${CSS.escape(label)}"]`),proposed=input?.value.trim()||'';if(!proposed)return toast('先用你自己的話把這句改對');const original=(p.options||[]).find(o=>o[0]===label)?.[1]||'';
  try{
    toast('AI 正在核對你的修正…');
    // Existing backend's /revise endpoint returns a canonical correct version. Keep the student's own wording when equivalent.
    const r=await apiCall('/revise',{statement:original,problemText:p.problemText||''});
    const canonical=r.result.correctedStatement||p.aiCorrections?.[label]||'';
    const a=v3NormalizeText(proposed),b=v3NormalizeText(canonical);
    const key=v3ChangedSegment(original,canonical);const keyOk=key&&v3NormalizeText(proposed).includes(v3NormalizeText(key));
    const correct=v3Equivalent(proposed,canonical)||keyOk;
    p.corrections=p.corrections||{};p.corrections[label]=proposed;p.correctionStatus=p.correctionStatus||{};
    p.correctionStatus[label]={correct,feedback:correct?'你的版本保留，而且已核對到關鍵修正。':`再檢查一次。AI 的參考正確版本：${canonical}`,assistance:state.correctionHints?.[`${p.id}:${label}`]?'hint':'none',validatedAt:new Date().toISOString(),canonical};
    save();render();
  }catch(e){toast('檢查失敗：'+e.message)}
}

async function askTutor(question,rerender=true){
  const p=selectedProblem();if(!p)return toast('先選一題錯題');if(!question)return toast('先問一個問題');
  try{
    // Compose the original scan + the student's current ink into one image so the already-deployed vision endpoint really sees the handwriting.
    const workspace=await v3WorkspaceImage(),original=await v3GetImage(p.id);state.aiLoading=true;save();render();
    const body={problemText:p.problemText,question:`請把這張工作紙視為最新狀態；若上面有學生手寫計算、圈選或刪改，必須先讀那些筆跡再回答。${question}`,studentAnswer:p.student,correctAnswer:p.correct};
    const visual=workspace?.base64?workspace:original;if(visual?.base64){body.imageBase64=visual.base64;body.mimeType=visual.mimeType||'image/jpeg'}
    const r=await apiCall('/tutor',body);state.tutor=r.result;p.annotations=r.result.annotations||[];state.annotations=p.annotations;state.aiLoading=false;save();render();toast(workspace?'AI 已讀取你目前的手寫工作紙並回寫提示':'AI 已把提示放回題目工作區');
  }catch(e){state.aiLoading=false;save();render();toast('AI 家教失敗：'+e.message)}
}

async function loadCommunity(){
  state.communityLoading=true;save();render();
  try{const p=selectedProblem()?.subject===state.subject?selectedProblem():null;state.community=await communityGet(activeSubject().name,p?v3ThreadCode(p):'');state.communityLoading=false;save();render()}catch(e){state.communityLoading=false;save();render();toast('社群載入失敗：'+e.message)}
}
async function postCommunity(){
  const text=document.getElementById('communityText')?.value.trim();if(!text)return toast('先寫點內容');const p=selectedProblem()?.subject===state.subject?selectedProblem():null;
  try{await communityPost({action:'create',displayName:state.profile?.displayName||'同學',body:text,subject:activeSubject().name,conceptCode:p?v3ThreadCode(p):'',problemKey:p?v3ProblemKey(p):''});toast(p?'已發布到這一題專屬討論串':'已發布到這科社群');await loadCommunity()}catch(e){toast('發布失敗：'+e.message)}
}

// Rebind once so handlers capture the compatibility implementations above.
render();
