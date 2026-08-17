// Wrongbook V5 handwriting-aware tutor state bridge.
// Marks fresh student ink as unreviewed, switches the tutor CTA to re-evaluate,
// invalidates stale guide cache keys, and tells the guide model that the latest
// workspace image is authoritative over the historical/original answer field.
const V5_INK_DIRTY_VERSION='2026-08-17-handwriting-dirty-v5';
const V5_INK_DIRTY_STORAGE='wrongbook-v5-tutor-ink-revisions';
window.__v5TutorInkReviewing=window.__v5TutorInkReviewing||{};

function v5InkLedger(){
  try{
    const raw=typeof storageGet==='function'?storageGet(V5_INK_DIRTY_STORAGE):localStorage.getItem(V5_INK_DIRTY_STORAGE);
    const parsed=raw?JSON.parse(raw):{};
    return{rev:parsed?.rev&&typeof parsed.rev==='object'?parsed.rev:{},checked:parsed?.checked&&typeof parsed.checked==='object'?parsed.checked:{}};
  }catch{return{rev:{},checked:{}}}
}
function v5InkWriteLedger(ledger){
  try{const raw=JSON.stringify(ledger);if(typeof storageSet==='function')storageSet(V5_INK_DIRTY_STORAGE,raw);else localStorage.setItem(V5_INK_DIRTY_STORAGE,raw)}catch{}
}
function v5InkRevision(problemId){if(!problemId)return 0;const n=Number(v5InkLedger().rev?.[problemId]);return Number.isFinite(n)&&n>0?Math.floor(n):0}
function v5InkCheckedRevision(problemId){if(!problemId)return 0;const n=Number(v5InkLedger().checked?.[problemId]);return Number.isFinite(n)&&n>0?Math.floor(n):0}
function v5InkEffectiveChecked(problemId){return Math.max(v5InkCheckedRevision(problemId),Number(window.__v5TutorInkReviewing?.[problemId])||0)}
function v5InkDirty(p=typeof selectedProblem==='function'?selectedProblem():null){return Boolean(p?.id&&v5InkRevision(p.id)>v5InkEffectiveChecked(p.id))}
function v5InkBump(problemId){
  if(!problemId)return 0;const ledger=v5InkLedger(),next=(Number(ledger.rev[problemId])||0)+1;ledger.rev[problemId]=next;v5InkWriteLedger(ledger);return next;
}
function v5InkMarkChecked(problemId,revision){
  if(!problemId)return;const ledger=v5InkLedger(),seen=Math.max(Number(ledger.checked[problemId])||0,Number(revision)||0);ledger.checked[problemId]=seen;v5InkWriteLedger(ledger);
}
function v5InkDirtyActionsMarkup(){return `<div class="v5-tutor-actions"><button class="primary-btn" data-v5-tutor-evaluate>我寫好了，幫我看</button><button class="soft-btn" data-v5-tutor-hint>再給我一點提示</button><button class="v5-link-btn" data-v5-tutor-mode="direct">直接看詳解</button></div>`}
function v5InkBindDirtyActions(root=document){
  root.querySelector('[data-v5-tutor-evaluate]')?.addEventListener('click',()=>v5TutorEvaluate());
  root.querySelector('[data-v5-tutor-hint]')?.addEventListener('click',()=>v5TutorHint());
  root.querySelector('[data-v5-tutor-mode="direct"]')?.addEventListener('click',()=>{if(state.aiGuideMode!=='direct')v5TutorStart('direct');else v5TutorSwitchMode('direct')});
}
function v5InkRefreshDirtyUi(){
  const p=typeof selectedProblem==='function'?selectedProblem():null,s=p&&typeof v5TutorSession==='function'?v5TutorSession(p):null,dirty=v5InkDirty(p),status=document.querySelector('[data-guide-status]');
  if(dirty&&status){status.textContent=s?'有新的筆跡尚未檢查':'已記錄新筆跡；開始引導時 AI 會讀取最新工作紙';status.dataset.kind='dirty'}
  if(!dirty||!s||s.mode!=='instructive'||s.status==='loading'||s.status==='error')return;
  const actions=document.querySelector('.v5-tutor-actions');if(!actions)return;actions.outerHTML=v5InkDirtyActionsMarkup();v5InkBindDirtyActions(document);
}

if(typeof saveInk==='function'&&!window.__v5InkDirtySaveWrapped){
  window.__v5InkDirtySaveWrapped=true;const baseSaveInk=saveInk;
  saveInk=function(){const problemId=typeof drawing==='object'?drawing?.key:'';const out=baseSaveInk.apply(this,arguments);if(problemId){v5InkBump(problemId);requestAnimationFrame(v5InkRefreshDirtyUi)}return out};
}

if(typeof v5TutorControls==='function'&&!window.__v5InkDirtyControlsWrapped){
  window.__v5InkDirtyControlsWrapped=true;const baseTutorControls=v5TutorControls;
  v5TutorControls=function(s,stage){const p=typeof selectedProblem==='function'?selectedProblem():null;if(p&&s?.mode==='instructive'&&v5InkDirty(p)&&s.status!=='loading'&&s.status!=='error')return v5InkDirtyActionsMarkup();return baseTutorControls.apply(this,arguments)};
}

if(typeof v3GuideKey==='function'&&!window.__v5InkDirtyGuideKeyWrapped){
  window.__v5InkDirtyGuideKeyWrapped=true;const baseGuideKey=v3GuideKey;
  v3GuideKey=function(p,mode){const key=baseGuideKey.apply(this,arguments);return p?.id?`${key}-ink${v5InkRevision(p.id)}`:key};
}

if(typeof v3GuideApi==='function'&&!window.__v5InkDirtyGuideApiWrapped){
  window.__v5InkDirtyGuideApiWrapped=true;const baseGuideApi=v3GuideApi;
  v3GuideApi=function(body){
    const p=typeof selectedProblem==='function'?selectedProblem():null,revision=p?.id?v5InkRevision(p.id):0,next={...(body||{}),workspaceInkRevision:revision};
    if(next.imageBase64){const rule='【最新工作紙規則】這次附帶的工作紙圖片是學生目前最新狀態；studentAnswer / 學生原作答只代表歷史作答。若兩者衝突，必須以圖片中最新可見的手寫、刪除、圈選與修正為準。若學生已經寫對，不可再要求他重寫同一步；要明確保留正確推理，再從目前真正的下一個盲點繼續。';next.latestWorkspaceAuthoritative=true;next.question=[String(next.question||'').trim(),rule].filter(Boolean).join('\n')}
    return baseGuideApi.call(this,next);
  };
}

if(typeof v5TutorCall==='function'&&!window.__v5InkDirtyTutorCallWrapped){
  window.__v5InkDirtyTutorCallWrapped=true;const baseTutorCall=v5TutorCall;
  v5TutorCall=async function(kind,opts){
    const p=typeof selectedProblem==='function'?selectedProblem():null,problemId=p?.id||'',revision=problemId?v5InkRevision(problemId):0;if(problemId)window.__v5TutorInkReviewing[problemId]=revision;
    try{const result=await baseTutorCall.call(this,kind,opts);if(result&&problemId)v5InkMarkChecked(problemId,revision);return result}
    finally{if(problemId)delete window.__v5TutorInkReviewing[problemId];requestAnimationFrame(v5InkRefreshDirtyUi)}
  };
}

window.v5TutorInkState=function(problemId=selectedProblem()?.id||''){return{version:V5_INK_DIRTY_VERSION,problemId,revision:v5InkRevision(problemId),checkedRevision:v5InkCheckedRevision(problemId),reviewingRevision:Number(window.__v5TutorInkReviewing?.[problemId])||0,dirty:problemId?v5InkRevision(problemId)>v5InkEffectiveChecked(problemId):false}};
