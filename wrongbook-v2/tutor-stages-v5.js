// Wrongbook V5 staged tutor. Reuses guide-v3's canvas renderer; changes pedagogy, gating and reevaluation.
const V5_TUTOR_VERSION='2026-08-18-tutor-stages-v5-step-nav';
state.tutorSessions=state.tutorSessions&&typeof state.tutorSessions==='object'?state.tutorSessions:{};
state.aiGuideMode=['instructive','direct'].includes(state.aiGuideMode)?state.aiGuideMode:'instructive';

if(!document.getElementById('v5-tutor-step-nav-style')){const style=document.createElement('style');style.id='v5-tutor-step-nav-style';style.textContent=`
.v5-tutor-step-nav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0 8px;padding:8px 0;border-top:1px solid rgba(51,49,45,.08);border-bottom:1px solid rgba(51,49,45,.08)}
.v5-tutor-step-nav>button{min-width:82px;white-space:nowrap}
.v5-tutor-step-track{display:flex;align-items:center;justify-content:center;gap:6px;min-width:0;flex:1}
.v5-tutor-step-dot{width:9px;height:9px;padding:0;border:0;border-radius:999px;background:#d7d3cc;cursor:pointer;transition:transform .15s ease,background .15s ease;flex:0 0 auto}
.v5-tutor-step-dot:hover{transform:scale(1.18)}
.v5-tutor-step-dot.active{background:#557a5d;transform:scale(1.3)}
.v5-tutor-step-count{margin-left:6px;color:#777169;font-size:12px;font-weight:800;white-space:nowrap}
@media(max-width:640px){.v5-tutor-step-nav{gap:6px}.v5-tutor-step-nav>button{min-width:0;padding-inline:10px}.v5-tutor-step-track{gap:5px}.v5-tutor-step-count{font-size:11px}}
`;document.head.appendChild(style)}

function v5TutorSession(p=selectedProblem()){if(!p)return null;return state.tutorSessions[p.id]||null}
function v5TutorEnsureSession(p,mode=state.aiGuideMode){if(!p)return null;let s=state.tutorSessions[p.id];if(!s||s.mode!==mode){s={id:`ts-${p.id}-${Date.now().toString(36)}`,problemId:p.id,mode,stages:[],activeIndex:0,status:'idle',diagnosis:null,assistanceLevel:'none',attempts:0,requestCount:0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};state.tutorSessions[p.id]=s}return s}
function v5CancelGuidePlayback(){cancelAnimationFrame(v3GuideRuntime.raf);v3GuideRuntime.playing=false;v3GuideRuntime.elapsed=0;v3GuideRuntime.key=''}
function v5StageKey(p,s,i){return `v5stage-${v3Hash(`${V5_TUTOR_VERSION}|${p.id}|${s.id}|${s.mode}|${i}|${s.stages[i]?.id||''}`)}`}
function v5RegionById(p,id){return (p?.regions||[]).find(r=>r.id===id)||null}
function v5ResolveAction(a,p){
  const out={...a};const r=a?.targetRegionId?v5RegionById(p,a.targetRegionId):null;if(r){if((r.confidence||0)<.62&&['circle','underline','strike','arrow','highlight'].includes(a.kind))return null;const b=r.bbox;if(!b)return null;const cx=b.x+b.width/2,cy=b.y+b.height/2;out.x=cx;out.y=cy;out.w=b.width;out.h=b.height;if(['underline','strike'].includes(a.kind)){out.x=b.x;out.x2=b.x+b.width;out.y=out.y2=a.kind==='strike'?cy:b.y+b.height*.92}else if(a.kind==='highlight'){out.x=b.x;out.y=b.y;out.w=b.width;out.h=b.height}}
  if(a.kind==='strike')out.tone='warning';if(a.kind==='highlight'&&!a.tone)out.tone='guide';return out
}
function v5StageActions(stage,p){return (stage?.actions||[]).map(a=>v5ResolveAction(a,p)).filter(Boolean)}
function v5BuildStageGuide(p,s,index){const stage=s.stages[index];if(!stage)return null;const key=v5StageKey(p,s,index),result={explanation:stage.promptToStudent||stage.goal||'',steps:[stage.goal||'',stage.successCriteria||''].filter(Boolean),actions:v5StageActions(stage,p)};const guide=v3GuideBuild(result,p,s.mode,key,'wrongbook-guide-ai-v5');guide.stageId=stage.id;guide.stageIndex=index;guide.waitForStudent=Boolean(stage.waitForStudent);state.aiGuides[key]=guide;state.aiGuideActiveKey=key;state.aiGuideMode=s.mode;s.activeIndex=index;s.updatedAt=new Date().toISOString();v3GuideTrimCache();return guide}
function v5TutorVisual(){const p=selectedProblem();return p?v3GuideVisual(p):Promise.resolve(null)}
function v5TutorSummary(s){return (s?.stages||[]).slice(-4).map(x=>({id:x.id,stageType:x.stageType,goal:x.goal,promptToStudent:x.promptToStudent,successCriteria:x.successCriteria}))}
function v5SanitizeStages(incoming,mode,kind){const xs=(Array.isArray(incoming)?incoming:[]).map(x=>({...x}));if(mode==='instructive'&&kind==='start'){for(const x of xs){x.revealFinalAnswer=false;if(x.stageType==='final_explanation')x.stageType='hint'}return xs.slice(0,1)}if(mode==='instructive'&&kind!=='start')return xs.slice(0,1);return xs.slice(0,8)}
async function v5TutorCall(kind,{mode=state.aiGuideMode,note=''}={}){
  const p=selectedProblem();if(!p)return null;const s=v5TutorEnsureSession(p,mode);s.status='loading';s.requestCount++;s.updatedAt=new Date().toISOString();save();render();
  try{const visual=await v5TutorVisual(),body={problemText:p.problemText||p.title||'',studentAnswer:p.student||[],correctAnswer:p.correct||[],concepts:v3Concepts(p),subject:subjectById(p.subject).name,mode,requestType:kind,question:kind==='start'?'先檢查學生已經寫了什麼，再從最有用的一個線索開始。':kind==='evaluate'?'重新閱讀學生剛剛新增的筆跡，只針對最新進度決定下一步。':kind==='hint'?'在不洩漏完整答案的前提下，只多給一層提示。':'依目前進度提供下一個階段。',priorStages:v5TutorSummary(s),stageIndex:s.activeIndex,studentAttemptNote:note||'',regions:p.regions||[],learningObjectType:p.learningObjectType||'problem_dependent'};if(visual?.base64){body.imageBase64=visual.base64;body.mimeType=visual.mimeType||'image/jpeg'}
    const res=await v3GuideApi(body),result=res.result||{};s.diagnosis=result.diagnosis||s.diagnosis||null;s.mode=result.mode||mode;
    let incoming=v5SanitizeStages(result.stages,s.mode,kind);if(!incoming.length&&Array.isArray(result.actions))incoming=[{id:`legacy-${Date.now()}`,goal:result.explanation||'下一步',stageType:'hint',promptToStudent:result.explanation||'',waitForStudent:mode!=='direct',actions:result.actions,expectedStudentEvidence:'',successCriteria:'',fallbackHint:'',revealFinalAnswer:mode==='direct'}];
    if(kind==='start'){s.stages=incoming;s.activeIndex=0}else if(mode==='direct'&&kind==='next'&&incoming.length){s.stages.push(...incoming);s.activeIndex=Math.min(s.activeIndex+1,s.stages.length-1)}else{s.stages.push(...incoming);s.activeIndex=Math.max(0,s.stages.length-incoming.length)}
    s.status='ready';s.updatedAt=new Date().toISOString();if(kind==='hint')s.assistanceLevel='hint';if(kind==='evaluate')s.attempts++;
    const guide=v5BuildStageGuide(p,s,s.activeIndex);save();render();if(guide)setTimeout(()=>v3GuideReplay(),50);return s
  }catch(e){s.status='error';s.error=e.message;s.updatedAt=new Date().toISOString();save();render();toast('AI 引導失敗：'+e.message);return null}
}
function v5TutorStart(mode=state.aiGuideMode){const p=selectedProblem();if(!p)return;v5CancelGuidePlayback();state.aiGuideMode=mode;state.tutorSessions[p.id]=null;save();return v5TutorCall('start',{mode})}
function v5TutorTry(){const s=v5TutorSession();if(!s)return;s.status='student_try';s.updatedAt=new Date().toISOString();save();render();toast('直接在原題上寫；寫好後按「我寫好了，幫我看」')}
function v5TutorEvaluate(){const s=v5TutorSession();if(!s)return;v5CancelGuidePlayback();return v5TutorCall('evaluate',{mode:'instructive',note:'學生已在工作紙加入新筆跡，請以最新圖片為準。'})}
function v5TutorHint(){const s=v5TutorSession();if(!s)return;v5CancelGuidePlayback();return v5TutorCall('hint',{mode:'instructive'})}
function v5TutorGoTo(index){const p=selectedProblem(),s=v5TutorSession(p);if(!p||!s||!s.stages.length)return;const next=Math.max(0,Math.min(s.stages.length-1,Math.trunc(Number(index)||0)));if(next===s.activeIndex)return;v5CancelGuidePlayback();const g=v5BuildStageGuide(p,s,next);save();render();if(g)setTimeout(()=>v3GuideReplay(),45)}
function v5TutorPrev(){const s=v5TutorSession();if(s)v5TutorGoTo(s.activeIndex-1)}
function v5TutorNextExisting(){const s=v5TutorSession();if(s&&s.activeIndex<s.stages.length-1)v5TutorGoTo(s.activeIndex+1)}
function v5TutorLatest(){const s=v5TutorSession();if(s?.stages?.length)v5TutorGoTo(s.stages.length-1)}
function v5TutorNextDirect(){const p=selectedProblem(),s=v5TutorSession(p);if(!p||!s)return;const next=s.activeIndex+1;if(next<s.stages.length){v5TutorGoTo(next)}else if(!s.stages[s.activeIndex]?.revealFinalAnswer)v5TutorCall('next',{mode:'direct'})}
function v5TutorSwitchMode(mode){if(!['instructive','direct'].includes(mode))return;state.aiGuideMode=mode;const p=selectedProblem();if(p&&state.tutorSessions[p.id]?.mode!==mode)state.tutorSessions[p.id]=null;v5CancelGuidePlayback();save();render()}
function v5TutorCurrentStage(){const s=v5TutorSession();return s?.stages?.[s.activeIndex]||null}
function v5TutorStageLabel(stage,index,total){if(!stage)return'';const names={observe:'觀察',question:'提問',hint:'提示',worked_step:'解題步驟',correction:'修正',final_explanation:'詳解'};return `${names[stage.stageType]||'引導'} ${Math.min(index+1,total)}/${Math.max(1,total)}`}
function v5TutorStepNav(s){const total=s?.stages?.length||0;if(total<=1)return'';const current=Math.max(0,Math.min(total-1,s.activeIndex));return `<div class="v5-tutor-step-nav" role="group" aria-label="解題步驟導覽"><button class="soft-btn" type="button" data-v5-tutor-prev ${current<=0?'disabled':''} aria-label="上一步">← 上一步</button><div class="v5-tutor-step-track">${s.stages.map((stage,i)=>`<button type="button" class="v5-tutor-step-dot ${i===current?'active':''}" data-v5-tutor-step="${i}" aria-label="前往步驟 ${i+1}：${esc(stage?.goal||stage?.promptToStudent||'解題步驟')}" aria-current="${i===current?'step':'false'}"></button>`).join('')}<span class="v5-tutor-step-count" aria-live="polite">${current+1} / ${total}</span></div><button class="soft-btn" type="button" data-v5-tutor-existing-next ${current>=total-1?'disabled':''} aria-label="下一步">下一步 →</button></div>`}
function v5TutorControls(s,stage){
  if(!s)return'';if(s.status==='loading')return `<div class="v5-tutor-actions"><button class="primary-btn" disabled>AI 正在看你的題目與筆跡…</button></div>`;
  if(s.status==='error')return `<div class="v5-tutor-actions"><button class="soft-btn" data-action="guideStart">重新開始</button></div>`;
  const atLatest=s.activeIndex>=s.stages.length-1;
  if(!atLatest)return `<div class="v5-tutor-actions"><button class="v5-link-btn" data-v5-tutor-latest>回到最新步驟</button></div>`;
  if(s.mode==='direct'){if(stage?.revealFinalAnswer)return `<div class="v5-tutor-actions"><button class="primary-btn" disabled>詳解完成</button></div>`;return `<div class="v5-tutor-actions"><button class="primary-btn" data-v5-tutor-next>繼續下一步</button></div>`}
  if(s.status==='student_try')return `<div class="v5-tutor-actions"><button class="primary-btn" data-v5-tutor-evaluate>我寫好了，幫我看</button><button class="soft-btn" data-v5-tutor-hint>再給我一點提示</button><button class="v5-link-btn" data-v5-tutor-mode="direct">直接看詳解</button></div>`;
  if(stage?.waitForStudent!==false)return `<div class="v5-tutor-actions"><button class="primary-btn" data-v5-tutor-try>我來試試</button><button class="soft-btn" data-v5-tutor-hint>再給我一點提示</button><button class="v5-link-btn" data-v5-tutor-mode="direct">直接看詳解</button></div>`;
  return `<div class="v5-tutor-actions"><button class="primary-btn" data-v5-tutor-hint>下一步</button></div>`
}

v3GuideMarkup=function(p){
  const s=v5TutorSession(p),stage=s?.stages?.[s.activeIndex],guide=v3GuideCurrent(p,state.aiGuideMode),hidden=Boolean(state.aiGuideHidden),speed=Number(state.aiGuideSpeed)||1,diagnosis=s?.diagnosis;
  return `<canvas id="aiGuideCanvas" class="v3-guide-canvas ${hidden?'is-hidden':''}" aria-hidden="true"></canvas><div class="v3-guide-dock v5-tutor-dock" data-guide-dock><div class="v5-tutor-mode-switch" role="group" aria-label="AI 家教模式"><button class="${state.aiGuideMode==='instructive'?'active':''}" data-v5-tutor-mode="instructive">引導我解題</button><button class="${state.aiGuideMode==='direct'?'active':''}" data-v5-tutor-mode="direct">直接看詳解</button></div>${s?`<div class="v5-tutor-stage"><div class="v5-tutor-stage-head"><span>${v5TutorStageLabel(stage,s.activeIndex,s.stages.length)}</span>${diagnosis?.studentOnRightTrack===true?'<strong class="is-right">✓ 目前方向正確</strong>':diagnosis?.blindSpot?`<strong>${esc(diagnosis.blindSpot)}</strong>`:''}</div>${stage?.promptToStudent?`<p>${esc(stage.promptToStudent)}</p>`:''}${v5TutorStepNav(s)}${v5TutorControls(s,stage)}</div>`:`<div class="v5-tutor-empty"><div><strong>先看你已經寫到哪裡，再只帶下一步。</strong><span>預設不會把完整答案一次揭露。</span></div><button class="primary-btn" data-action="guideStart">開始引導</button></div>`}<div class="v5-guide-utility"><span data-guide-status>${guide?'這一步可以重播':'AI 筆跡會直接畫在原題上'}</span><span class="v3-guide-caption" data-guide-caption>${guide?.explanation?esc(guide.explanation.slice(0,88)):''}</span><div><button class="soft-btn" data-action="guideReplay" ${guide?'':'disabled'}>重播</button><button class="soft-btn" data-action="guideSpeed" ${guide?'':'disabled'}>${speed}×</button><button class="soft-btn" data-action="guideHide" ${guide?'':'disabled'}>${hidden?'顯示筆跡':'隱藏筆跡'}</button></div></div></div>`;
};

const v5BaseDrawArea=v3DrawArea;
v3DrawArea=function(ctx,a,p,w,h,kind){if(kind!=='highlight')return v5BaseDrawArea(ctx,a,p,w,h,kind);const x=a.x/100*w,y=a.y/100*h,rw=(a.w||16)/100*w,rh=(a.h||7)/100*h,q=v3GuideEase(p);ctx.save();ctx.fillStyle=a.tone==='correct'?'rgba(62,171,112,.17)':a.tone==='warning'?'rgba(221,90,79,.14)':'rgba(245,199,66,.24)';ctx.fillRect(x,y,rw*q,rh);ctx.restore()};

v3GuideBind=function(){
  document.querySelector('[data-action="guideStart"]')?.addEventListener('click',()=>v5TutorStart(state.aiGuideMode||'instructive'));
  document.querySelector('[data-action="guidePlayPause"]')?.addEventListener('click',v3GuidePlayPause);document.querySelector('[data-action="guideReplay"]')?.addEventListener('click',v3GuideReplay);document.querySelector('[data-action="guideSpeed"]')?.addEventListener('click',v3GuideCycleSpeed);document.querySelector('[data-action="guideHide"]')?.addEventListener('click',v3GuideToggleHidden);
  document.querySelectorAll('[data-v5-tutor-mode]').forEach(el=>el.addEventListener('click',()=>{const mode=el.dataset.v5TutorMode;if(mode==='direct'&&state.aiGuideMode!=='direct')v5TutorStart('direct');else v5TutorSwitchMode(mode)}));
  document.querySelector('[data-v5-tutor-try]')?.addEventListener('click',v5TutorTry);document.querySelector('[data-v5-tutor-evaluate]')?.addEventListener('click',v5TutorEvaluate);document.querySelector('[data-v5-tutor-hint]')?.addEventListener('click',v5TutorHint);document.querySelector('[data-v5-tutor-next]')?.addEventListener('click',v5TutorNextDirect);document.querySelector('[data-v5-tutor-prev]')?.addEventListener('click',v5TutorPrev);document.querySelector('[data-v5-tutor-existing-next]')?.addEventListener('click',v5TutorNextExisting);document.querySelector('[data-v5-tutor-latest]')?.addEventListener('click',v5TutorLatest);document.querySelectorAll('[data-v5-tutor-step]').forEach(el=>el.addEventListener('click',()=>v5TutorGoTo(Number(el.dataset.v5TutorStep))));v3GuideMount();
};

if(typeof v3GuideBaseConfirmScan==='function')confirmScan=(function(base){return function(){v5CancelGuidePlayback();return base.apply(this,arguments)}})(v3GuideBaseConfirmScan);

if(!window.__v5TutorGlobalCancelBound){window.__v5TutorGlobalCancelBound=true;document.addEventListener('click',e=>{if(e.target.closest('[data-problem],[data-page]'))v5CancelGuidePlayback()},{capture:true});window.addEventListener('pagehide',v5CancelGuidePlayback)}

window.v5TutorTestDemo=function({rightTrack=false,mode='instructive'}={}){const p=selectedProblem();if(!p)return false;state.aiGuideMode=mode;const s=v5TutorEnsureSession(p,mode);s.diagnosis={studentOnRightTrack:rightTrack,blindSpot:rightTrack?'':'先確認你是否把可調整的量當成固定值',evidence:'QA fixture',confidence:.99};s.stages=[{id:'qa-clue',goal:'找關鍵條件',stageType:'hint',promptToStudent:'看到「仍保持靜止」，水平方向合力應該是多少？',waitForStudent:true,actions:[{kind:'highlight',text:'',x:22,y:26,x2:0,y2:0,w:25,h:6,durationMs:650,delayMs:0,tone:'guide',size:'md',caption:'先找關鍵條件'},{kind:'circle',text:'',x:35,y:29,x2:0,y2:0,w:25,h:8,durationMs:720,delayMs:80,tone:'guide',size:'md',caption:'圈出「仍保持靜止」'},{kind:'write',text:'ΣFₓ = 0 ?',x:58,y:48,x2:0,y2:0,w:25,h:0,durationMs:1200,delayMs:100,tone:'guide',size:'lg',caption:'只寫下一個提示'}],expectedStudentEvidence:'寫出或表達合力為零',successCriteria:'辨識靜止代表加速度為零',fallbackHint:'先想牛頓第二運動定律',revealFinalAnswer:false}];s.activeIndex=0;s.status='ready';const g=v5BuildStageGuide(p,s,0);save();render();if(g)setTimeout(()=>v3GuideReplay(),50);return true};
window.v5TutorStart=v5TutorStart;window.v5TutorEvaluate=v5TutorEvaluate;window.v5TutorHint=v5TutorHint;window.v5TutorGoTo=v5TutorGoTo;window.v5CancelGuidePlayback=v5CancelGuidePlayback;