// Animated AI guide layer. Guide scripts are generated once, cached with the learning state,
// and replayed as handwriting-like ink, circles, arrows, underlines and fades on the problem paper.
const V3_GUIDE_API='https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1/wrongbook-guide-ai';
const V3_GUIDE_VERSION='2026-08-12-guide-v1';
const v3GuideRuntime={key:'',playing:false,elapsed:0,startedAt:0,raf:0,lastSpeed:1};

function v3GuideEnsureState(){
  if(!state.aiGuides||typeof state.aiGuides!=='object'||Array.isArray(state.aiGuides))state.aiGuides={};
  if(!state.aiGuideMode)state.aiGuideMode='hint';
  if(![.75,1,1.5].includes(Number(state.aiGuideSpeed)))state.aiGuideSpeed=1;
  if(typeof state.aiGuideHidden!=='boolean')state.aiGuideHidden=false;
}
v3GuideEnsureState();

function v3GuideKey(p,mode=state.aiGuideMode||'hint'){
  if(!p)return'';
  const signature=`${V3_GUIDE_VERSION}|${v3ProblemKey(p)}|${mode}|${p.problemText||''}|${(p.student||[]).join(',')}|${(p.correct||[]).join(',')}|${v3Concepts(p).map(c=>c.code||c.nameZh||'').join('|')}`;
  return `guide-${v3Hash(signature)}`;
}
function v3GuideCurrent(p=selectedProblem(),mode=state.aiGuideMode||'hint'){
  v3GuideEnsureState();if(!p)return null;
  const active=state.aiGuideActiveKey&&state.aiGuides[state.aiGuideActiveKey];
  if(active?.problemId===p.id&&active?.mode===mode)return active;
  return state.aiGuides[v3GuideKey(p,mode)]||null;
}
function v3GuideTrimCache(){
  const entries=Object.entries(state.aiGuides||{}).sort((a,b)=>String(b[1]?.createdAt||'').localeCompare(String(a[1]?.createdAt||'')));
  for(const [key] of entries.slice(24))delete state.aiGuides[key];
}
function v3GuideDefaults(kind,text=''){
  if(kind==='write')return clamp(850+[...String(text)].length*95,900,3200);
  if(kind==='circle')return 900;if(kind==='arrow')return 760;if(kind==='underline'||kind==='strike')return 620;
  if(kind==='highlight'||kind==='fade')return 700;if(kind==='pause')return 450;return 700;
}
function v3GuideNormalizeActions(raw=[]){
  const allowed=new Set(['write','circle','arrow','underline','strike','highlight','fade','pause']);let cursor=0;
  return (Array.isArray(raw)?raw:[]).slice(0,18).map((a,i)=>{
    const kind=allowed.has(a?.kind)?a.kind:'write',text=String(a?.text||'').slice(0,80),delay=clamp(Number(a?.delayMs)||0,0,3000),duration=clamp(Number(a?.durationMs)||v3GuideDefaults(kind,text),120,6000);
    cursor+=delay;const out={id:`ga-${i}`,kind,text,x:clamp(Number(a?.x)||50,0,100),y:clamp(Number(a?.y)||50,0,100),x2:clamp(Number(a?.x2)||0,0,100),y2:clamp(Number(a?.y2)||0,0,100),w:clamp(Number(a?.w)||0,0,100),h:clamp(Number(a?.h)||0,0,100),tone:['guide','correct','warning','muted'].includes(a?.tone)?a.tone:'guide',size:['sm','md','lg'].includes(a?.size)?a.size:'md',caption:String(a?.caption||'').slice(0,80),startMs:cursor,durationMs:duration};cursor+=duration+110;return out
  });
}
function v3GuideBuild(result,p,mode,key,model=''){
  const actions=v3GuideNormalizeActions(result?.actions||[]),totalMs=actions.length?Math.max(...actions.map(a=>a.startMs+a.durationMs))+180:0;
  return{key,problemId:p.id,problemKey:v3ProblemKey(p),mode,guideVersion:V3_GUIDE_VERSION,model,explanation:String(result?.explanation||''),steps:Array.isArray(result?.steps)?result.steps.map(String).slice(0,8):[],actions,totalMs,createdAt:new Date().toISOString()};
}
async function v3GuideApi(body){
  const res=await fetch(V3_GUIDE_API,{method:'POST',headers:{'content-type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(body)});const data=await res.json().catch(()=>({error:'invalid_response'}));if(!res.ok)throw new Error(data.detail||data.error||('HTTP '+res.status));return data;
}
async function v3GuideVisual(p){
  try{if(typeof v3WorkspaceImage==='function'){const live=await v3WorkspaceImage();if(live?.base64)return live}}catch{}
  try{const original=await v3GetImage(p.id);if(original?.base64)return original}catch{}
  return null;
}
function v3GuideStatus(text,kind=''){
  const el=document.querySelector('[data-guide-status]');if(el){el.textContent=text||'';el.dataset.kind=kind||''}
}
function v3GuideLoading(on,p){
  state.aiGuideLoading=Boolean(on);state.aiGuideLoadingProblemId=on?p?.id||'':'';const btn=document.querySelector('[data-action="guideStart"]');if(btn){btn.disabled=Boolean(on);btn.textContent=on?'正在預先產生筆跡…':'✦ AI 手寫帶我看'}
}
async function v3GuidePrepare(mode=state.aiGuideMode||'hint',{autoplay=true,force=false,silent=false,question=''}={}){
  v3GuideEnsureState();const p=selectedProblem();if(!p)return null;state.aiGuideMode=mode;const key=v3GuideKey(p,mode),cached=!force&&state.aiGuides[key];
  if(cached){state.aiGuideActiveKey=key;save();v3GuideSyncControls();if(autoplay)setTimeout(()=>v3GuideReplay(),20);return cached}
  try{
    if(!silent){v3GuideLoading(true,p);v3GuideStatus('AI 正在把教學步驟預先轉成可重播的手寫動畫…','loading')}
    const visual=await v3GuideVisual(p),body={problemText:p.problemText||p.title||'',studentAnswer:p.student||[],correctAnswer:p.correct||[],concepts:v3Concepts(p),subject:subjectById(p.subject).name,mode,question:question||v3GuideModePrompt(mode)};
    if(visual?.base64){body.imageBase64=visual.base64;body.mimeType=visual.mimeType||'image/jpeg'}
    const res=await v3GuideApi(body),guide=v3GuideBuild(res.result,p,mode,key,res.model||'');state.aiGuides[key]=guide;state.aiGuideActiveKey=key;v3GuideTrimCache();save();
    if(!silent){v3GuideLoading(false,p);v3GuideStatus('筆跡已預先產生；之後重播不需要再等 AI。','ready');v3GuideSyncControls();toast('AI 手寫引導已準備好')}
    if(autoplay)setTimeout(()=>v3GuideReplay(),25);return guide;
  }catch(e){if(!silent){v3GuideLoading(false,p);v3GuideStatus('手寫引導產生失敗：'+e.message,'error');toast('AI 手寫引導失敗：'+e.message)}return null}
}
function v3GuideModePrompt(mode){
  if(mode==='explain')return'請逐步帶我解這題。把真正需要寫在紙上的關鍵式子、關鍵詞、箭頭與圈選做成手寫引導；長篇說明不要寫在紙上。';
  if(mode==='correction')return'請用手寫方式找出最關鍵的錯誤敘述或錯誤步驟，淡化或劃掉錯的部分，再把正確版本寫在旁邊。';
  return'不要直接把完整答案全部寫完。請只帶我走下一步：先圈出或指向我現在最該看的地方，再手寫一個短提示或關鍵式子。';
}

function v3GuideMarkup(p){
  const guide=v3GuideCurrent(p),hidden=Boolean(state.aiGuideHidden),speed=Number(state.aiGuideSpeed)||1;
  return `<canvas id="aiGuideCanvas" class="v3-guide-canvas ${hidden?'is-hidden':''}" aria-hidden="true"></canvas><div class="v3-guide-dock" data-guide-dock><div class="v3-guide-row"><select class="v3-guide-mode" data-guide-mode aria-label="AI 手寫引導模式"><option value="hint" ${state.aiGuideMode==='hint'?'selected':''}>只帶下一步</option><option value="explain" ${state.aiGuideMode==='explain'?'selected':''}>逐步講解</option><option value="correction" ${state.aiGuideMode==='correction'?'selected':''}>修正錯誤敘述</option></select><button class="primary-btn v3-guide-start" data-action="guideStart">✦ AI 手寫帶我看</button><button class="soft-btn" data-action="guidePlayPause" ${guide?'':'disabled'}>暫停</button><button class="soft-btn" data-action="guideReplay" ${guide?'':'disabled'}>重播</button><button class="soft-btn" data-action="guideSpeed" ${guide?'':'disabled'}>${speed}×</button><button class="soft-btn" data-action="guideHide" ${guide?'':'disabled'}>${hidden?'顯示 AI 筆跡':'隱藏 AI 筆跡'}</button></div><div class="v3-guide-meta"><span data-guide-status>${guide?'已預先產生 · 可以立即重播':'第一次會先產生這題的教學筆跡'}</span><span class="v3-guide-caption" data-guide-caption>${guide?.explanation?esc(guide.explanation.slice(0,88)):''}</span></div></div>`;
}
const v3GuideBasePaperPanel=paperPanel;
paperPanel=function(p){const html=v3GuideBasePaperPanel(p);return html.replace('<div class="paper-toolbar">',v3GuideMarkup(p)+'<div class="paper-toolbar">')};

function v3GuideCanvasInfo(){
  const c=document.getElementById('aiGuideCanvas');if(!c)return null;const rect=c.getBoundingClientRect();if(!rect.width||!rect.height)return null;const dpr=Math.min(3,window.devicePixelRatio||1),w=rect.width,h=rect.height,needW=Math.max(1,Math.round(w*dpr)),needH=Math.max(1,Math.round(h*dpr));if(c.width!==needW||c.height!==needH){c.width=needW;c.height=needH}const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{c,ctx,w,h,dpr};
}
function v3GuideTone(tone){return tone==='correct'?'#278a59':tone==='warning'?'#c65b43':tone==='muted'?'#7f8492':'#6658df'}
function v3GuideEase(p){p=clamp(p,0,1);return 1-Math.pow(1-p,3)}
function v3GuideRand(seed){const n=parseInt(v3Hash(seed),36)||1;return((n%1000)/1000)-.5}
function v3GuideActionProgress(a,t){return clamp((t-a.startMs)/Math.max(1,a.durationMs),0,1)}
function v3GuideActiveAction(guide,t){let out=null;for(const a of guide.actions||[])if(t>=a.startMs&&t<=a.startMs+a.durationMs)out=a;return out}
function v3GuideFontPx(a,w,h){const base=a.size==='sm'?18:a.size==='lg'?30:23;return clamp(base*Math.min(1.2,Math.max(.8,w/820)),16,36)}
function v3GuideWrapText(text,maxChars){const chars=[...String(text||'')],lines=[];for(let i=0;i<chars.length;i+=maxChars)lines.push(chars.slice(i,i+maxChars));return lines.length?lines:[[]]}
function v3DrawWrite(ctx,a,p,w,h){
  const text=String(a.text||'');if(!text||p<=0)return;const fontPx=v3GuideFontPx(a,w,h),color=v3GuideTone(a.tone),x=a.x/100*w,y=a.y/100*h,maxWidth=(a.w||34)/100*w,maxChars=clamp(Math.floor(maxWidth/(fontPx*.92)),4,20),lines=v3GuideWrapText(text,maxChars),all=lines.flat(),total=Math.max(1,all.length),global=p*total;ctx.save();ctx.font=`600 ${fontPx}px "Kaiti TC","DFKai-SB","STKaiti",serif`;ctx.textBaseline='alphabetic';ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineCap='round';ctx.lineJoin='round';let idx=0,cursor=null;
  for(let li=0;li<lines.length;li++){let px=x,py=y+li*fontPx*1.28;for(let ci=0;ci<lines[li].length;ci++,idx++){const ch=lines[li][ci],cw=Math.max(fontPx*.72,ctx.measureText(ch).width),cp=clamp(global-idx,0,1),j=v3GuideRand(text+idx);if(cp>0){ctx.save();ctx.translate(j*.8,j*.5);ctx.globalAlpha=.9+.1*cp;ctx.shadowColor=cp<1?'rgba(102,88,223,.22)':'transparent';ctx.shadowBlur=cp<1?5:0;if(cp<1){ctx.beginPath();ctx.rect(px-fontPx*.06,py-fontPx*1.05,cw*cp+fontPx*.16,fontPx*1.35);ctx.clip()}ctx.fillText(ch,px,py);ctx.restore();cursor={x:px+cw*cp,y:py-fontPx*.18,cp};}px+=cw*.98}}
  if(cursor&&p<.995){ctx.save();ctx.fillStyle=color;ctx.shadowColor='rgba(102,88,223,.34)';ctx.shadowBlur=8;ctx.beginPath();ctx.ellipse(cursor.x+2,cursor.y-1,2.8,4.8,-.35,0,Math.PI*2);ctx.fill();ctx.restore()}ctx.restore();
}
function v3DrawCircle(ctx,a,p,w,h){const x=a.x/100*w,y=a.y/100*h,rx=(a.w||16)/200*w,ry=(a.h||10)/200*h,q=v3GuideEase(p),color=v3GuideTone(a.tone);ctx.save();ctx.strokeStyle=color;ctx.lineWidth=2.7;ctx.lineCap='round';ctx.globalAlpha=.92;ctx.beginPath();ctx.ellipse(x,y,Math.max(10,rx),Math.max(7,ry),v3GuideRand(a.id)*.08,-Math.PI*.08,-Math.PI*.08+Math.PI*2*q);ctx.stroke();if(q>.75){ctx.globalAlpha=.28;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x+1.5,y-.8,Math.max(10,rx)*1.02,Math.max(7,ry)*.98,0,-Math.PI*.04,-Math.PI*.04+Math.PI*2*((q-.75)/.25));ctx.stroke()}ctx.restore()}
function v3DrawLineAction(ctx,a,p,w,h,kind){let x=a.x/100*w,y=a.y/100*h,x2=(a.x2||0)/100*w,y2=(a.y2||0)/100*h;if(!a.x2&&!a.y2){x2=x+(a.w||18)/100*w;y2=kind==='strike'?y:y+(a.h||0)/100*h}const q=v3GuideEase(p),ex=x+(x2-x)*q,ey=y+(y2-y)*q,color=v3GuideTone(a.tone);ctx.save();ctx.strokeStyle=color;ctx.lineWidth=kind==='arrow'?2.5:2.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);const bow=v3GuideRand(a.id)*7;ctx.quadraticCurveTo((x+ex)/2+bow,(y+ey)/2-bow,ex,ey);ctx.stroke();if(kind==='arrow'&&q>.82){const ang=Math.atan2(y2-y,x2-x),len=10*clamp((q-.82)/.18,0,1);ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-Math.cos(ang-.55)*len,ey-Math.sin(ang-.55)*len);ctx.moveTo(ex,ey);ctx.lineTo(ex-Math.cos(ang+.55)*len,ey-Math.sin(ang+.55)*len);ctx.stroke()}ctx.restore()}
function v3DrawArea(ctx,a,p,w,h,kind){const x=a.x/100*w,y=a.y/100*h,rw=(a.w||16)/100*w,rh=(a.h||7)/100*h,q=v3GuideEase(p);ctx.save();if(kind==='highlight'){ctx.fillStyle=a.tone==='correct'?'rgba(62,171,112,.16)':a.tone==='warning'?'rgba(221,123,83,.14)':'rgba(108,93,252,.12)';ctx.fillRect(x,y,rw*q,rh)}else{ctx.fillStyle=`rgba(255,255,255,${.75*q})`;ctx.filter=`blur(${2*q}px)`;ctx.fillRect(x,y,rw,rh)}ctx.restore()}
function v3GuideDraw(t){
  const p=selectedProblem(),guide=p?state.aiGuides?.[v3GuideRuntime.key||state.aiGuideActiveKey]:null,info=v3GuideCanvasInfo();if(!guide||!info)return;const{c,ctx,w,h}=info;ctx.clearRect(0,0,w,h);if(state.aiGuideHidden){c.dataset.guideRendered='0';return}let painted=false;
  for(const a of guide.actions||[]){if(t<a.startMs)continue;const prog=v3GuideActionProgress(a,t);if(prog<=0)continue;if(a.kind==='write')v3DrawWrite(ctx,a,prog,w,h);else if(a.kind==='circle')v3DrawCircle(ctx,a,prog,w,h);else if(['arrow','underline','strike'].includes(a.kind))v3DrawLineAction(ctx,a,prog,w,h,a.kind);else if(['highlight','fade'].includes(a.kind))v3DrawArea(ctx,a,prog,w,h,a.kind);painted=painted||a.kind!=='pause'}
  c.dataset.guideRendered=painted?'1':'0';const active=v3GuideActiveAction(guide,t),cap=document.querySelector('[data-guide-caption]');if(cap){cap.textContent=active?.caption||guide.explanation||'';cap.dataset.active=active?'1':'0'}
}
function v3GuideTick(now){
  if(!v3GuideRuntime.playing)return;const speed=Number(state.aiGuideSpeed)||1,t=v3GuideRuntime.elapsed+(now-v3GuideRuntime.startedAt)*speed;v3GuideDraw(t);const guide=state.aiGuides?.[v3GuideRuntime.key];if(!guide||t>=guide.totalMs){v3GuideRuntime.playing=false;v3GuideRuntime.elapsed=guide?.totalMs||t;v3GuideStatus('✓ AI 手寫引導完成 · 可以重播','done');v3GuideSyncControls();return}v3GuideRuntime.raf=requestAnimationFrame(v3GuideTick)
}
function v3GuidePlayPause(){
  const guide=v3GuideCurrent();if(!guide)return v3GuidePrepare(state.aiGuideMode||'hint',{autoplay:true});state.aiGuideActiveKey=guide.key;v3GuideRuntime.key=guide.key;
  if(v3GuideRuntime.playing){const now=performance.now(),speed=Number(state.aiGuideSpeed)||1;v3GuideRuntime.elapsed+=Math.max(0,now-v3GuideRuntime.startedAt)*speed;v3GuideRuntime.playing=false;cancelAnimationFrame(v3GuideRuntime.raf);v3GuideStatus('已暫停；可以繼續播放','paused')}
  else{if(v3GuideRuntime.elapsed>=guide.totalMs)v3GuideRuntime.elapsed=0;v3GuideRuntime.startedAt=performance.now();v3GuideRuntime.playing=true;v3GuideRuntime.raf=requestAnimationFrame(v3GuideTick);v3GuideStatus('AI 正在手寫帶你看…','playing')}v3GuideSyncControls();
}
function v3GuideReplay(){const guide=v3GuideCurrent();if(!guide)return v3GuidePrepare(state.aiGuideMode||'hint',{autoplay:true});cancelAnimationFrame(v3GuideRuntime.raf);state.aiGuideActiveKey=guide.key;state.aiGuideHidden=false;v3GuideRuntime.key=guide.key;v3GuideRuntime.elapsed=0;v3GuideRuntime.startedAt=performance.now();v3GuideRuntime.playing=true;v3GuideDraw(0);v3GuideRuntime.raf=requestAnimationFrame(v3GuideTick);v3GuideStatus('AI 正在手寫帶你看…','playing');v3GuideSyncControls()}
function v3GuideCycleSpeed(){const values=[.75,1,1.5],current=Number(state.aiGuideSpeed)||1,idx=values.indexOf(current),now=performance.now();if(v3GuideRuntime.playing){v3GuideRuntime.elapsed+=(now-v3GuideRuntime.startedAt)*current;v3GuideRuntime.startedAt=now}state.aiGuideSpeed=values[(idx+1)%values.length];save();v3GuideSyncControls()}
function v3GuideToggleHidden(){state.aiGuideHidden=!state.aiGuideHidden;save();if(!state.aiGuideHidden)v3GuideDraw(v3GuideRuntime.elapsed);else{const info=v3GuideCanvasInfo();if(info)info.ctx.clearRect(0,0,info.w,info.h)}v3GuideSyncControls()}
function v3GuideSyncControls(){
  const guide=v3GuideCurrent(),play=document.querySelector('[data-action="guidePlayPause"]'),replay=document.querySelector('[data-action="guideReplay"]'),speed=document.querySelector('[data-action="guideSpeed"]'),hide=document.querySelector('[data-action="guideHide"]');if(play){play.disabled=!guide;play.textContent=v3GuideRuntime.playing?'暫停':'繼續'}if(replay)replay.disabled=!guide;if(speed){speed.disabled=!guide;speed.textContent=`${Number(state.aiGuideSpeed)||1}×`}if(hide){hide.disabled=!guide;hide.textContent=state.aiGuideHidden?'顯示 AI 筆跡':'隱藏 AI 筆跡'}
}
function v3GuideMount(){const c=document.getElementById('aiGuideCanvas');if(!c)return;c.classList.toggle('is-hidden',Boolean(state.aiGuideHidden));v3GuideCanvasInfo();const guide=v3GuideCurrent();if(guide&&v3GuideRuntime.key===guide.key)v3GuideDraw(v3GuideRuntime.elapsed);v3GuideSyncControls();const img=document.querySelector('.v3-paper img.scan-photo');if(img&&!img.dataset.guideResizeBound){img.dataset.guideResizeBound='1';img.addEventListener('load',()=>{v3GuideCanvasInfo();v3GuideDraw(v3GuideRuntime.elapsed)})}}
function v3GuideBind(){
  document.querySelector('[data-action="guideStart"]')?.addEventListener('click',()=>v3GuidePrepare(state.aiGuideMode||'hint',{autoplay:true}));
  document.querySelector('[data-action="guidePlayPause"]')?.addEventListener('click',v3GuidePlayPause);document.querySelector('[data-action="guideReplay"]')?.addEventListener('click',v3GuideReplay);document.querySelector('[data-action="guideSpeed"]')?.addEventListener('click',v3GuideCycleSpeed);document.querySelector('[data-action="guideHide"]')?.addEventListener('click',v3GuideToggleHidden);
  document.querySelector('[data-guide-mode]')?.addEventListener('change',e=>{state.aiGuideMode=e.currentTarget.value;state.aiGuideActiveKey=v3GuideKey(selectedProblem(),state.aiGuideMode);v3GuideRuntime.playing=false;v3GuideRuntime.elapsed=0;cancelAnimationFrame(v3GuideRuntime.raf);save();v3GuideStatus(v3GuideCurrent()?'這個模式已有預先產生的筆跡，可直接播放':'這個模式尚未產生筆跡');v3GuideSyncControls()});
  v3GuideMount();
}
const v3GuideBaseBind=bind;
bind=function(){v3GuideBaseBind();v3GuideBind()};
window.addEventListener('resize',()=>{v3GuideCanvasInfo();if(v3GuideRuntime.key)v3GuideDraw(v3GuideRuntime.elapsed)});

// After a photographed question is confirmed, prepare the next-step guide quietly in the background.
const v3GuideBaseConfirmScan=confirmScan;
confirmScan=function(){v3GuideBaseConfirmScan();setTimeout(()=>v3GuidePrepare('hint',{autoplay:false,silent:true}),700)};

// Local deterministic smoke demo: verifies the player without calling the model.
window.v3GuideTestDemo=function(){
  v3GuideEnsureState();const p=selectedProblem();if(!p)return false;state.aiGuideMode='hint';const key=v3GuideKey(p,'hint'),result={explanation:'先看題目中的關鍵條件，再決定下一步。',steps:['找關鍵條件','圈出要看的位置','寫下一個提示'],actions:[{kind:'circle',text:'',x:48,y:32,x2:0,y2:0,w:24,h:14,durationMs:700,delayMs:0,tone:'guide',size:'md',caption:'先圈出關鍵條件'},{kind:'arrow',text:'',x:75,y:24,x2:56,y2:34,w:0,h:0,durationMs:650,delayMs:80,tone:'guide',size:'md',caption:'注意這個位置'},{kind:'write',text:'先看條件',x:58,y:48,x2:0,y2:0,w:28,h:0,durationMs:1500,delayMs:100,tone:'guide',size:'lg',caption:'AI 正在把下一步寫在題目旁'}]};state.aiGuides[key]=v3GuideBuild(result,p,'hint',key,'qa-demo');state.aiGuideActiveKey=key;save();render();setTimeout(v3GuideReplay,60);return true;
};

render();