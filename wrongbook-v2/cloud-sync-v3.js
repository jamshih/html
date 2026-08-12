// Authenticated Supabase sync for Wrongbook V3. Only the publishable key is present client-side.
const V3_SB_URL='https://rfpkznuntzxfoeeavwwf.supabase.co';
const V3_AUTH_STORAGE='wrongbook-v3-auth-session';
const V3_IMAGE_HASH_STORAGE='wrongbook-v3-cloud-image-hashes';
let v3Session=null,v3CloudBusy=false,v3CloudTimer=null,v3CloudSuppress=false,v3CloudMessage='';

function v3LoadSession(){try{return JSON.parse(localStorage.getItem(V3_AUTH_STORAGE)||'null')}catch{return null}}
function v3StoreSession(s){v3Session=s||null;if(s)localStorage.setItem(V3_AUTH_STORAGE,JSON.stringify(s));else localStorage.removeItem(V3_AUTH_STORAGE)}
function v3AuthHeaders(token=v3Session?.access_token){const h={apikey:SUPABASE_PUBLISHABLE_KEY,'content-type':'application/json'};if(token)h.authorization='Bearer '+token;return h}
async function v3AuthFetch(path,init={}){const res=await fetch(V3_SB_URL+path,{...init,headers:{...v3AuthHeaders(),...(init.headers||{})}});const data=await res.json().catch(()=>null);if(!res.ok)throw new Error(data?.msg||data?.error_description||data?.message||data?.error||('HTTP '+res.status));return data}
async function v3EnsureSession(){
  if(!v3Session)v3Session=v3LoadSession();if(!v3Session)return null;
  const expires=(v3Session.expires_at||0)*1000;if(expires&&expires>Date.now()+60000)return v3Session;
  if(!v3Session.refresh_token){v3StoreSession(null);return null}
  try{const data=await v3AuthFetch('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:v3Session.refresh_token})});data.expires_at=Math.floor(Date.now()/1000)+(data.expires_in||3600);v3StoreSession(data);return data}catch{v3StoreSession(null);return null}
}
function v3ParseAuthCallback(){
  const raw=location.hash.startsWith('#')?location.hash.slice(1):'';if(!raw)return false;const p=new URLSearchParams(raw);const token=p.get('access_token');if(!token)return false;
  const s={access_token:token,refresh_token:p.get('refresh_token')||'',expires_in:Number(p.get('expires_in')||3600),expires_at:Math.floor(Date.now()/1000)+Number(p.get('expires_in')||3600),token_type:p.get('token_type')||'bearer'};v3StoreSession(s);history.replaceState(null,'',location.pathname+location.search);return true
}
async function v3CurrentUser(){const s=await v3EnsureSession();if(!s)return null;try{return await v3AuthFetch('/auth/v1/user',{headers:{authorization:'Bearer '+s.access_token}})}catch{return null}}
async function v3EmailLogin(){const email=document.getElementById('v3AuthEmail')?.value.trim(),password=document.getElementById('v3AuthPassword')?.value||'';if(!email||!password)return toast('請輸入 Email 與密碼');try{v3CloudMessage='登入中…';render();const data=await v3AuthFetch('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});data.expires_at=Math.floor(Date.now()/1000)+(data.expires_in||3600);v3StoreSession(data);v3CloudMessage='已登入，正在比對雲端進度…';await v3CloudReconcile();render();toast('已登入並完成跨裝置同步')}catch(e){v3CloudMessage='登入失敗：'+e.message;render()}}
async function v3EmailSignup(){const email=document.getElementById('v3AuthEmail')?.value.trim(),password=document.getElementById('v3AuthPassword')?.value||'';if(!email||password.length<6)return toast('請輸入 Email，密碼至少 6 碼');try{v3CloudMessage='建立帳號中…';render();const data=await v3AuthFetch('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password})});if(data?.access_token){data.expires_at=Math.floor(Date.now()/1000)+(data.expires_in||3600);v3StoreSession(data);await v3CloudPush()}v3CloudMessage=data?.access_token?'帳號已建立並同步':'帳號已建立；請依 Email 驗證後登入';render()}catch(e){v3CloudMessage='建立帳號失敗：'+e.message;render()}}
function v3GoogleLogin(){const redirect=location.origin+location.pathname;location.href=`${V3_SB_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirect)}`}
async function v3Logout(){const s=await v3EnsureSession();try{if(s)await fetch(V3_SB_URL+'/auth/v1/logout',{method:'POST',headers:v3AuthHeaders(s.access_token)})}catch{}v3StoreSession(null);v3CloudMessage='已登出；這台裝置的資料仍保留';render()}

function v3Base64Blob(base64,mime='image/jpeg'){const bin=atob(base64),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return new Blob([a],{type:mime})}
function v3BlobData(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const dataUrl=String(r.result);resolve({dataUrl,base64:dataUrl.split(',')[1],mimeType:blob.type||'image/jpeg'})};r.onerror=()=>reject(r.error);r.readAsDataURL(blob)})}
function v3ImageHashes(){try{return JSON.parse(localStorage.getItem(V3_IMAGE_HASH_STORAGE)||'{}')}catch{return{}}}
function v3SetImageHashes(x){localStorage.setItem(V3_IMAGE_HASH_STORAGE,JSON.stringify(x))}
async function v3UploadImages(user){
  const s=await v3EnsureSession();if(!s)return[];const images=await v3AllImages(),hashes=v3ImageHashes(),next={...hashes},ids=[];
  for(const img of images){if(!img.problemId||!img.base64)continue;ids.push(img.problemId);const hash=v3Hash(img.base64);if(hashes[img.problemId]===hash)continue;const blob=v3Base64Blob(img.base64,img.mimeType||'image/jpeg');const path=`${encodeURIComponent(user.id)}/${encodeURIComponent(img.problemId)}.jpg`;const res=await fetch(`${V3_SB_URL}/storage/v1/object/wrongbook-images/${path}`,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,authorization:'Bearer '+s.access_token,'content-type':'image/jpeg','x-upsert':'true'},body:blob});if(!res.ok)throw new Error('原題圖片同步失敗 '+res.status);next[img.problemId]=hash
  }
  v3SetImageHashes(next);return ids
}
async function v3DownloadImages(user,ids=[]){const s=await v3EnsureSession();if(!s)return;for(const id of ids){if(await v3GetImage(id))continue;const path=`${encodeURIComponent(user.id)}/${encodeURIComponent(id)}.jpg`;const res=await fetch(`${V3_SB_URL}/storage/v1/object/authenticated/wrongbook-images/${path}`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,authorization:'Bearer '+s.access_token}});if(!res.ok)continue;const blob=await res.blob(),data=await v3BlobData(blob);await v3PutImage(id,data)}}
function v3InkPayload(){try{return JSON.parse(storageGet('wrongbook-v2-ink')||'{}')}catch{return{}}}
async function v3CloudGet(user){const s=await v3EnsureSession();if(!s)return null;const res=await fetch(`${V3_SB_URL}/rest/v1/wb_user_state?select=payload,updated_at&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY,authorization:'Bearer '+s.access_token}});if(!res.ok)throw new Error('雲端讀取失敗 '+res.status);const rows=await res.json();return rows?.[0]||null}
async function v3CloudPush(){
  if(v3CloudBusy||v3CloudSuppress)return;const user=await v3CurrentUser();if(!user)return;v3CloudBusy=true;
  try{const imageProblemIds=await v3UploadImages(user);const payload={version:V3_VERSION,clientUpdatedAt:state.localUpdatedAt||Date.now(),state,ink:v3InkPayload(),imageProblemIds};const s=await v3EnsureSession();const res=await fetch(V3_SB_URL+'/rest/v1/wb_user_state?on_conflict=user_id',{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,authorization:'Bearer '+s.access_token,'content-type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:user.id,payload,updated_at:new Date().toISOString()})});if(!res.ok)throw new Error('雲端寫入失敗 '+res.status);v3CloudMessage='已同步 · '+new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit'})}catch(e){v3CloudMessage='同步失敗：'+e.message}finally{v3CloudBusy=false}
}
async function v3CloudPull(row,user){
  const payload=row?.payload;if(!payload?.state)return false;v3CloudSuppress=true;
  try{state={...state,...payload.state};if(payload.ink)storageSet('wrongbook-v2-ink',JSON.stringify(payload.ink));await v3DownloadImages(user,payload.imageProblemIds||[]);v3Migrate();save();v3CloudMessage='已載入雲端最新進度';render();return true}finally{v3CloudSuppress=false}
}
async function v3CloudReconcile(){const user=await v3CurrentUser();if(!user)return;const row=await v3CloudGet(user);if(!row){await v3CloudPush();return}const cloudTs=Number(row.payload?.clientUpdatedAt||0),localTs=Number(state.localUpdatedAt||0);if(cloudTs>localTs)await v3CloudPull(row,user);else await v3CloudPush()}
function v3QueueCloudSync(){if(v3CloudSuppress||!v3LoadSession())return;clearTimeout(v3CloudTimer);v3CloudTimer=setTimeout(()=>v3CloudPush(),1800)}
async function v3ManualCloudSync(){v3CloudMessage='正在比對雲端與這台裝置…';render();try{await v3CloudReconcile();render();toast('跨裝置同步完成')}catch(e){v3CloudMessage='同步失敗：'+e.message;render()}}

function v3CloudPanel(){const s=v3LoadSession();return `<section class="panel settings-panel v3-cloud-panel"><div class="panel-head" style="padding:0 0 12px"><div><h3>帳號與跨裝置同步</h3><span class="meta">${s?'已登入 Supabase 帳號':'登入後，錯題、修正敘述、心智圖進度、筆跡與原題照片都可跨裝置'}</span></div>${s?'<span class="due green">雲端同步開啟</span>':''}</div>${s?`<div class="v3-cloud-actions"><button class="primary-btn" data-action="cloudSync">立即同步</button><button class="soft-btn" data-action="cloudLogout">登出</button></div>`:`<div class="v3-auth-grid"><input id="v3AuthEmail" type="email" placeholder="Email" autocomplete="email"><input id="v3AuthPassword" type="password" placeholder="密碼" autocomplete="current-password"><button class="primary-btn" data-action="cloudLogin">登入</button><button class="soft-btn" data-action="cloudSignup">建立帳號</button><button class="soft-btn v3-google" data-action="cloudGoogle">使用 Google 登入</button></div>`}${v3CloudMessage?`<div class="callout" style="margin-top:10px">${esc(v3CloudMessage)}</div>`:''}<div class="meta" style="margin-top:10px">圖片存放在私人 Supabase Storage；資料列有 RLS，只允許登入者讀寫自己的資料。</div></section>`}
const v3CloudBaseSettings=settingsPage;
settingsPage=function(){const html=v3CloudBaseSettings();return html.replace('<div class="settings-grid">',v3CloudPanel()+'<div class="settings-grid">')};

const v3CloudBaseBind=bind;
bind=function(){v3CloudBaseBind();document.querySelector('[data-action="cloudLogin"]')?.addEventListener('click',v3EmailLogin);document.querySelector('[data-action="cloudSignup"]')?.addEventListener('click',v3EmailSignup);document.querySelector('[data-action="cloudGoogle"]')?.addEventListener('click',v3GoogleLogin);document.querySelector('[data-action="cloudLogout"]')?.addEventListener('click',v3Logout);document.querySelector('[data-action="cloudSync"]')?.addEventListener('click',v3ManualCloudSync)};
const v3CloudBaseSave=save;
save=function(){if(!v3CloudSuppress)state.localUpdatedAt=Date.now();v3CloudBaseSave();v3QueueCloudSync()};

(async()=>{const callback=v3ParseAuthCallback();v3Session=v3LoadSession();if(v3Session){try{await v3CloudReconcile()}catch(e){v3CloudMessage='雲端同步待重試：'+e.message}}if(callback||v3Session)render()})();
