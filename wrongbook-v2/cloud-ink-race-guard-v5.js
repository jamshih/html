// Wrongbook V5 cloud/ink race guard.
// A delayed Supabase reconcile can finish seconds after page load. Historically, handwriting
// did not advance state.localUpdatedAt, so a cloud pull could replace fresh local ink and then
// render a blank canvas. Fresh pen edits now participate in the same last-write-wins clock.
const V5_CLOUD_INK_GUARD_VERSION='2026-08-17-cloud-ink-race-guard-v5';
const V5_LOCAL_INK_UPDATED_AT='wrongbook-v5-local-ink-updated-at';

function v5CloudInkLocalTs(){
  let inkTs=0;try{inkTs=Number(localStorage.getItem(V5_LOCAL_INK_UPDATED_AT)||0)||0}catch{}
  return Math.max(Number(typeof state==='object'&&state?.localUpdatedAt)||0,inkTs);
}
function v5CloudInkMarkLocal(){
  const now=Date.now();
  try{localStorage.setItem(V5_LOCAL_INK_UPDATED_AT,String(now))}catch{}
  try{if(typeof state==='object'&&state)state.localUpdatedAt=Math.max(Number(state.localUpdatedAt)||0,now)}catch{}
  // Persist the state clock without calling render. save() is safe here and also schedules sync,
  // but avoid recursion when this mark was itself reached through saveInk -> save wrappers.
  try{
    if(typeof storageSet==='function'&&typeof state==='object'&&state)storageSet('wrongbook-v2-state',JSON.stringify(state));
  }catch{}
  return now;
}
function v5CloudInkCloudTs(row){
  const payloadTs=Number(row?.payload?.clientUpdatedAt||0)||0;
  const rowTs=Date.parse(String(row?.updated_at||''))||0;
  return Math.max(payloadTs,rowTs);
}

// saveInk is called once a stroke/erase/undo/clear is committed. Mark that moment as a real
// local modification so a reconcile already in flight cannot decide that the cloud is newer.
if(typeof saveInk==='function'&&!window.__v5CloudInkSaveWrapped){
  window.__v5CloudInkSaveWrapped=true;const baseSaveInk=saveInk;
  saveInk=function(){const out=baseSaveInk.apply(this,arguments);v5CloudInkMarkLocal();return out};
}

// If a cloud pull was selected using an older timestamp, re-check immediately before it is
// allowed to replace state/localStorage. This also protects a reconcile that started before
// this guard finished loading.
if(typeof v3CloudPull==='function'&&!window.__v5CloudInkPullWrapped){
  window.__v5CloudInkPullWrapped=true;const baseCloudPull=v3CloudPull;
  v3CloudPull=async function(row,user){
    const cloudTs=v5CloudInkCloudTs(row),localTs=v5CloudInkLocalTs();
    if(localTs>cloudTs){
      console.info('[wrongbook] skipped stale cloud pull; fresh local handwriting wins',{localTs,cloudTs});
      try{setTimeout(()=>{try{v3CloudPush()}catch{}},0)}catch{}
      return false;
    }
    return baseCloudPull.apply(this,arguments);
  };
}

// Future reconciles use the unified state+ink clock from the start instead of state only.
if(typeof v3CloudReconcile==='function'&&!window.__v5CloudInkReconcileWrapped){
  window.__v5CloudInkReconcileWrapped=true;
  v3CloudReconcile=async function(){
    const user=await v3CurrentUser();if(!user)return 'none';
    const row=await v3CloudGet(user);if(!row){await v3CloudPush();return 'pushed'}
    const cloudTs=v5CloudInkCloudTs(row),localTs=v5CloudInkLocalTs();
    if(cloudTs>localTs){const pulled=await v3CloudPull(row,user);return pulled===false?'skipped':'pulled'}
    await v3CloudPush();return 'pushed';
  };
}

// v3CloudPush serializes state.localUpdatedAt into payload.clientUpdatedAt. Ensure a local ink
// marker surviving a reload is folded back into state before every push.
if(typeof v3CloudPush==='function'&&!window.__v5CloudInkPushWrapped){
  window.__v5CloudInkPushWrapped=true;const baseCloudPush=v3CloudPush;
  v3CloudPush=async function(){
    try{if(typeof state==='object'&&state)state.localUpdatedAt=Math.max(Number(state.localUpdatedAt)||0,v5CloudInkLocalTs())}catch{}
    return baseCloudPush.apply(this,arguments);
  };
}

// Preserve any in-progress stroke if an unrelated async subsystem renders the app mid-stroke.
if(typeof render==='function'&&!window.__v5CloudInkRenderWrapped){
  window.__v5CloudInkRenderWrapped=true;const baseRender=render;
  render=function(){
    try{
      if(typeof drawing==='object'&&drawing?.drawing&&Array.isArray(drawing?.paths)&&drawing?.key){
        let all={};try{all=JSON.parse(storageGet('wrongbook-v2-ink')||'{}')}catch{}
        all[drawing.key]=drawing.paths;storageSet('wrongbook-v2-ink',JSON.stringify(all));v5CloudInkMarkLocal();
      }
    }catch{}
    return baseRender.apply(this,arguments);
  };
}

window.v5CloudInkGuardState=function(){return{version:V5_CLOUD_INK_GUARD_VERSION,localTimestamp:v5CloudInkLocalTs(),cloudBusy:typeof v3CloudBusy==='boolean'?v3CloudBusy:null,selectedProblemId:typeof selectedProblem==='function'?selectedProblem()?.id||'':''}};