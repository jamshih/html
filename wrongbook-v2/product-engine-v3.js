// Wrongbook V3 learning engine: fixes scan ownership, corrected truths, review scheduling,
// handwriting-aware tutoring, progressive mind-map hints, concept analytics, and threaded community UX.

const V3_VERSION='2026-08-12-learning-engine-v3';
const V3_DB='wrongbook-v3-assets';
const V3_DB_VERSION=1;
let v3DbPromise=null;

function v3OpenDb(){
  if(v3DbPromise)return v3DbPromise;
  v3DbPromise=new Promise((resolve,reject)=>{
    const req=indexedDB.open(V3_DB,V3_DB_VERSION);
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('images'))db.createObjectStore('images',{keyPath:'problemId'})};
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
  });
  return v3DbPromise;
}
async function v3PutImage(problemId,image){const db=await v3OpenDb();return new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').put({problemId,...image,updatedAt:Date.now()});tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error)})}
async function v3GetImage(problemId){try{const db=await v3OpenDb();return await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const req=tx.objectStore('images').get(problemId);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error)})}catch{return null}}
async function v3AllImages(){try{const db=await v3OpenDb();return await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const req=tx.objectStore('images').getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)})}catch{return []}}
async function v3DeleteImage(problemId){try{const db=await v3OpenDb();return await new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').delete(problemId);tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error)})}catch{return false}}

function v3NormalizeText(v=''){
  return String(v).normalize('NFKC').toLowerCase().replace(/[\s，。！？、；：,.!?;:'"「」『』（）()\[\]{}\-_\/\\]/g,'')
    .replaceAll('線粒體','粒線體').replaceAll('高爾基體','高基氏體').replaceAll('概率','機率').replaceAll('數據','資料').replaceAll('網絡','網路');
}
function v3Equivalent(a,b){
  const x=v3NormalizeText(a),y=v3NormalizeText(b);if(!x||!y)return false;if(x===y)return true;
  const shorter=x.length<y.length?x:y,longer=x.length<y.length?y:x;
  return shorter.length>=2&&longer.includes(shorter)&&shorter.length/longer.length>=.72;
}
function v3DateISO(offsetDays=0){const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+offsetDays);return d.toISOString().slice(0,10)}
function v3DueLabel(iso){if(!iso)return'今天';const today=v3DateISO(0),tom=v3DateISO(1);if(iso<=today)return'今天';if(iso===tom)return'明天';const diff=Math.max(1,Math.round((new Date(iso+'T12:00:00')-new Date(today+'T12:00:00'))/86400000));return `${diff} 天後`}
function v3EnsureReview(item){
  if(!item.reviewData)item.reviewData={reps:0,lapses:0,interval:0,ease:2.3,lastQuality:null,history:[]};
  if(!item.dueISO)item.dueISO=item.due==='明天'?v3DateISO(1):item.due&&/^\d+ 天後$/.test(item.due)?v3DateISO(parseInt(item.due)):v3DateISO(0);
  item.due=v3DueLabel(item.dueISO);return item.reviewData;
}
function v3Schedule(item,correct,assistance='none'){
  const r=v3EnsureReview(item);let q=correct?(assistance==='none'?5:assistance==='hint'?4:3):1;
  if(q<3){r.lapses++;r.reps=0;r.interval=1;r.ease=Math.max(1.3,(r.ease||2.3)-.2)}
  else{r.reps++;r.ease=Math.max(1.3,(r.ease||2.3)+(q===5?.08:q===4?0:-.05));r.interval=r.reps===1?1:r.reps===2?3:Math.max(4,Math.round(Math.max(1,r.interval)*r.ease))}
  r.lastQuality=q;r.history.push({at:new Date().toISOString(),correct,assistance,quality:q,interval:r.interval});r.history=r.history.slice(-40);
  item.dueISO=v3DateISO(r.interval);item.due=v3DueLabel(item.dueISO);
  if('mastery'in item)item.mastery=clamp(Math.round(32+r.reps*11+(r.ease-1.3)*15-r.lapses*8-(assistance==='ai'?10:assistance==='hint'?4:0)),10,99);
  return r;
}
function v3Concepts(p){return Array.isArray(p?.concepts)&&p.concepts.length?p.concepts:[{code:p?.conceptCode||'',nameZh:p?.concept||'',chapterHint:p?.chapter||''}]}
function v3ProblemKey(p){return p?.problemKey||('q-'+v3Hash(`${p?.subject}|${p?.problemText}|${(p?.options||[]).map(x=>x.join(':')).join('|')}`))}
function v3Hash(s=''){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
function v3StableShuffle(arr,seed=''){const out=[...arr];let h=parseInt(v3Hash(seed),36)||1;for(let i=out.length-1;i>0;i--){h=(Math.imul(h,1664525)+1013904223)>>>0;const j=h%(i+1);[out[i],out[j]]=[out[j],out[i]]}return out}
function v3CorrectionAssistance(p,label){return p?.correctionStatus?.[label]?.assistance||'none'}

function v3CreateTruth(p,label,original,corrected,assistance='legacy'){
  const id=`truth-${p.id}-${label}`;let t=(state.truths||[]).find(x=>x.id===id);
  if(!t){t={id,problemId:p.id,subject:p.subject,conceptCode:p.conceptCode,concept:p.concept,label,original,corrected,assistance,mastery:assistance==='none'?72:assistance==='hint'?58:45,dueISO:v3DateISO(1),due:'明天',reviewData:null,hintUsed:false,createdAt:new Date().toISOString()};state.truths.push(t)}
  else{t.original=original;t.corrected=corrected;t.assistance=assistance}
  v3EnsureReview(t);return t;
}
function v3SaveTruthsForProblem(p,{silent=false}={}){
  state.truths=Array.isArray(state.truths)?state.truths:[];let saved=0;
  for(const [label,text] of p.options||[]){
    const isCorrect=(p.correct||[]).includes(label);const corrected=isCorrect?text:(p.corrections||{})[label];
    const status=p.correctionStatus?.[label];
    if(!corrected)continue;
    if(!isCorrect&&p.id.startsWith('scan-')&&status&&!status.correct)continue;
    if(!isCorrect&&p.id.startsWith('scan-')&&!status)continue;
    v3CreateTruth(p,label,text,corrected,isCorrect?'preserved':v3CorrectionAssistance(p,label));saved++;
  }
  save();if(!silent)toast(saved?`已存入 ${saved} 個「修正後正確敘述」；它們有自己的複習紀錄`:'先把錯誤敘述修正並確認，再存入正確敘述庫');return saved;
}
function v3Migrate(){
  state.truths=Array.isArray(state.truths)?state.truths:[];state.mindHintLevels=state.mindHintLevels||{};state.mindEvidence=state.mindEvidence||{};state.correctionHints=state.correctionHints||{};state.communityUnlocked=state.communityUnlocked||{};state.profile=state.profile||{displayName:'同學'};state.reviewShuffleSeed=state.reviewShuffleSeed||Date.now().toString(36);
  for(const p of state.problems||[]){
    p.concepts=v3Concepts(p);p.problemKey=v3ProblemKey(p);p.aiCorrections=p.aiCorrections||{};p.aiCorrectionMeta=p.aiCorrectionMeta||{};p.correctionStatus=p.correctionStatus||{};p.annotations=p.annotations||[];v3EnsureReview(p);
    // Existing seeded corrections are trusted legacy content; migrate them into first-class truths.
    if(!p.id.startsWith('scan-'))v3SaveTruthsForProblem(p,{silent:true});
  }
  state.v3Version=V3_VERSION;save();
}

async function v3HydrateSelectedImage(){const p=selectedProblem();if(!p||!p.imageKey)return;const img=document.querySelector(`[data-problem-image="${CSS.escape(p.id)}"]`);if(!img||img.src)return;const rec=await v3GetImage(p.id);if(rec?.dataUrl)img.src=rec.dataUrl}
function v3AnnotationLayer(p){
  const anns=p.annotations||state.annotations||[];if(!anns.length)return'';
  const shapes=anns.map((a,i)=>{const x=clamp(Number(a.x)||50,2,98),y=clamp(Number(a.y)||50,2,98);if(a.kind==='circle')return `<ellipse cx="${x}" cy="${y}" rx="8" ry="5.5"/>`;if(a.kind==='arrow')return `<path d="M ${clamp(x-14,1,99)} ${clamp(y-12,1,99)} L ${x} ${y}" marker-end="url(#v3arrow)"/>`;return `<circle cx="${x}" cy="${y}" r="1.2"/>`}).join('');
  const notes=anns.filter(a=>a.text).map(a=>`<div class="v3-ai-note" style="left:${clamp(Number(a.x)||50,4,82)}%;top:${clamp(Number(a.y)||50,4,88)}%">${esc(a.text)}</div>`).join('');
  return `<svg class="v3-ai-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><marker id="v3arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 z"/></marker></defs>${shapes}</svg>${notes}`;
}

function paperPanel(p){
  const hasImage=Boolean(p.imageKey||p.imageDataUrl||(p.id==='scan-preview'&&state.scanImage));
  const opts=(p.options||[]).map(([l,t])=>`<div class="paper-option ${(p.student||[]).includes(l)?'student':''}"><strong>${esc(l)}.</strong> ${esc(t)}</div>`).join('');
  const imageSrc=p.imageDataUrl||(p.id==='scan-preview'?state.scanImage:'')||'';
  return `<section class="panel"><div class="panel-head"><h3>原題就是工作紙</h3><div class="meta">Apple Pencil / 觸控 / 滑鼠 · AI 讀得到你的筆跡</div></div><div class="paper v3-paper" id="paper">${hasImage?`<div class="v3-scan-wrap"><img data-problem-image="${esc(p.id)}" class="scan-photo" src="${imageSrc}" alt="掃描題目">${v3AnnotationLayer(p)}</div><div class="scan-text"><strong>AI 辨識文字：</strong> ${esc(p.problemText)}</div>`:`<div class="paper-demo"><h4>${esc(p.problemText)}</h4><div class="options">${opts}</div><div class="hand-note">我的答案：${esc((p.student||[]).join('')||'未作答')}</div>${v3AnnotationLayer(p)}</div>`}<canvas id="drawCanvas" class="canvas-layer"></canvas><div class="paper-toolbar"><div class="toolset"><button class="tool active" data-tool="pen">✎</button><button class="tool" data-tool="eraser">⌫</button><button class="tool" data-action="undoInk">↶</button><button class="tool" data-action="clearInk">清除</button></div><div class="toolset"><button class="tool" data-action="aiOnPaper">✦ AI 看我的筆跡並提示</button></div></div></div></section>`;
}

function recognitionPanel(p,labels,isScan){
  const student=isScan?state.scanStudent:p.student||[],correct=isScan?state.scanCorrect:p.correct||[];
  const editable=isScan&&!p.confirmed;
  const optionsEditor=editable?`<details class="v3-ocr-edit"><summary>檢查 AI 辨識到的題目文字／選項</summary><label>題幹<textarea data-scan-problem-text>${esc(p.problemText||'')}</textarea></label>${(p.options||[]).map(([l,t],i)=>`<label>${esc(l)}<input data-scan-option-index="${i}" value="${esc(t)}"></label>`).join('')}</details>`:'';
  return `<section class="panel"><div class="panel-head"><h3>答案辨識 ${isScan?'· 必須確認':''}</h3><span class="meta">${isScan?'AI ≠ 真相，題目文字也能改':'已確認紀錄'}</span></div><div class="recognition"><div class="recognition-row"><div class="recognition-label"><strong>我們辨識到你作答</strong><span class="confidence">${isScan?`${Math.round((state.scan?.recognizedAnswerConfidence||0)*100)}% 信心`:'已確認'}</span></div><div class="chips">${labels.map(l=>`<button class="chip student ${student.includes(l)?'on':''}" ${editable?`data-scan-student="${esc(l)}"`:'disabled'}>${esc(l)}</button>`).join('')}</div></div><div class="recognition-row"><div class="recognition-label"><strong>正確答案</strong><span class="confidence">${isScan?`${Math.round((state.scan?.correctAnswerConfidence||0)*100)}% 信心`:'已確認'}</span></div><div class="chips">${labels.map(l=>`<button class="chip ${correct.includes(l)?'on':''}" ${editable?`data-scan-correct="${esc(l)}"`:'disabled'}>${esc(l)}</button>`).join('')}</div></div>${isScan&&state.scan?.recognitionNote?`<div class="callout warn" style="margin-top:10px">${esc(state.scan.recognitionNote)}</div>`:''}${optionsEditor}</div>${editable?`<div class="confirm-box"><button class="primary-btn" data-action="confirmScan">我確認題目、我的作答與正解</button></div>`:''}</section>`;
}

function correctionPanel(p){
  const opts=p.options||[],corr=p.corrections||{};if(!opts.length)return `<section class="panel"><div class="panel-head"><h3>修正 → 記住正確</h3></div><div class="empty">這題不是敘述型題目；會以原題重做、步驟與錯因安排複習。</div></section>`;
  const rows=opts.map(([l,text])=>{const isCorrect=(p.correct||[]).includes(l),status=p.correctionStatus?.[l],hint=state.correctionHints?.[`${p.id}:${l}`]||'';const fixed=isCorrect?text:(corr[l]||'');return `<div class="statement"><div class="statement-label ${isCorrect?'good':'bad'}">${esc(l)}</div><div><div class="original">${isCorrect?'原句已正確':'原句（錯誤）：'} ${esc(text)}</div>${isCorrect?`<div class="v3-preserved-truth">✓ ${esc(text)}</div>`:`<textarea class="corrected-input" data-correction="${esc(l)}" placeholder="先自己把這句改成正確版本">${esc(fixed)}</textarea><div class="v3-correction-status ${status?.correct?'good':status?'bad':''}">${status?esc(status.feedback|| (status.correct?'已確認正確':'還需要修正')):'先自己改；需要時再叫提示或 AI'}</div>${hint?`<div class="mind-hint-box"><span>提示</span>${esc(hint)}</div>`:''}`}</div><div class="statement-actions">${isCorrect?'':`<button class="soft-btn" data-correction-hint="${esc(l)}">提示</button><button class="soft-btn" data-validate-correction="${esc(l)}">檢查我的修正</button><button class="text-btn" data-ai-revise="${esc(l)}">AI 直接修正</button>`}</div></div>`}).join('');
  const saved=(state.truths||[]).filter(t=>t.problemId===p.id).length;
  return `<section class="panel"><div class="panel-head"><div><h3>你先把錯誤敘述改成正確的</h3><span class="meta">自己修正 > 提示後修正 > AI 直接給答案；三者掌握證據不同</span></div><button class="text-btn" data-action="saveTruths">存入正確敘述庫${saved?` · 已存 ${saved}`:''}</button></div><div class="correction-list">${rows}</div><div class="callout success" style="margin:0 15px 15px">原題仍保留錯誤選項供你重做；記憶庫只保存你確認過的正確版本。</div></section>`;
}

function scanToProblem(id,confirmed){
  const a=state.scan||{},sid=subjectIdFromText(a.subject),concepts=(a.concepts||[]).map(c=>({code:c.code||'',nameZh:c.nameZh||'',nameEn:c.nameEn||'',chapterHint:c.chapterHint||''})),first=concepts[0]||{};
  const aiCorrections={},aiCorrectionMeta={};for(const c of a.corrections||[]){if(!c.label)continue;const l=String(c.label).toUpperCase();aiCorrections[l]=c.correctedStatement||'';aiCorrectionMeta[l]={whyWrong:c.whyWrong||'',meaningful:c.meaningful!==false,isCorrect:Boolean(c.isCorrect)}}
  const p={id,subject:sid,title:(a.problemText||'AI 掃描題目').slice(0,32),concept:first.nameZh||a.subject||'待分類概念',conceptCode:first.code||sid.toUpperCase()+'-AI',concepts,chapter:first.chapterHint||subjectById(sid).chapters[0],student:[...state.scanStudent],correct:[...state.scanCorrect],mastery:confirmed?45:30,dueISO:v3DateISO(0),due:'今天',mistakeType:a.personalInsightSuggestion||'待確認錯因',attempts:1,problemText:a.problemText||'',options:(a.options||[]).map(o=>[String(o.label).toUpperCase(),o.text]),corrections:{},aiCorrections,aiCorrectionMeta,correctionStatus:{},insight:a.personalInsightSuggestion||'',aiChapterHint:first.chapterHint||'',questionType:a.questionType||'unknown',confirmed,annotations:a.annotations||[],problemKey:''};
  p.problemKey=v3ProblemKey(p);v3EnsureReview(p);return p;
}
async function confirmScan(){
  const preview=problemById('scan-preview');if(!preview)return;
  const textEdit=document.querySelector('[data-scan-problem-text]');if(textEdit)preview.problemText=textEdit.value.trim();document.querySelectorAll('[data-scan-option-index]').forEach(el=>{const i=Number(el.dataset.scanOptionIndex);if(preview.options?.[i])preview.options[i][1]=el.value.trim()});
  const newId=uid('scan');preview.id=newId;preview.student=[...state.scanStudent];preview.correct=[...state.scanCorrect];preview.confirmed=true;preview.title=(preview.problemText||'AI 掃描題目').slice(0,32);preview.problemKey=v3ProblemKey(preview);
  if(state.scanImage&&state.scanBase64){await v3PutImage(newId,{dataUrl:state.scanImage,base64:state.scanBase64,mimeType:state.scanMime||'image/jpeg'});preview.imageKey=newId}
  state.problems=state.problems.filter(p=>p.id!=='scan-preview');state.problems.unshift(preview);state.selectedProblemId=newId;state.scanConfirmed=true;state.scanImage='';state.scanBase64='';save();render();toast('已確認並保存；這張原題現在只屬於這一題，不會被下一次掃描覆蓋');
}

async function aiRevise(label){const p=selectedProblem();if(!p)return;const option=(p.options||[]).find(o=>o[0]===label);if(!option)return;try{toast('AI 正在把這句最小幅度改成正確版本…');const r=await apiCall('/revise',{statement:option[1],problemText:p.problemText||''});p.corrections=p.corrections||{};p.correctionStatus=p.correctionStatus||{};p.corrections[label]=r.result.correctedStatement;p.correctionStatus[label]={correct:true,feedback:r.result.whyWrong||'AI 已提供正確版本',assistance:'ai',validatedAt:new Date().toISOString()};save();render()}catch(e){toast('AI 修正失敗：'+e.message)}}
async function v3ValidateCorrection(label){const p=selectedProblem();if(!p)return;const input=document.querySelector(`[data-correction="${CSS.escape(label)}"]`),proposed=input?.value.trim()||'';if(!proposed)return toast('先用你自己的話把這句改對');const original=(p.options||[]).find(o=>o[0]===label)?.[1]||'';try{toast('AI 正在檢查你的修正是否真的正確…');const r=await apiCall('/evaluate',{kind:'correction',problemText:p.problemText||'',originalStatement:original,proposedAnswer:proposed,referenceAnswer:p.aiCorrections?.[label]||''});p.corrections[label]=proposed;p.correctionStatus=p.correctionStatus||{};p.correctionStatus[label]={correct:Boolean(r.result.isCorrect),feedback:r.result.feedback||'',assistance:state.correctionHints?.[`${p.id}:${label}`]?'hint':'none',validatedAt:new Date().toISOString()};save();render()}catch(e){toast('檢查失敗：'+e.message)}}
function v3CorrectionHint(label){const p=selectedProblem();if(!p)return;const key=`${p.id}:${label}`,meta=p.aiCorrectionMeta?.[label];state.correctionHints[key]=meta?.whyWrong||'找出原句中最可能錯的名詞、位置、方向或條件，只改必要的部分。';save();render();toast('已記錄：這次修正使用了提示')}

async function v3WorkspaceImage(){
  const paper=document.getElementById('paper'),ink=document.getElementById('drawCanvas');if(!paper||!ink)return null;const r=paper.getBoundingClientRect();if(!r.width||!r.height)return null;const dpr=Math.min(2,window.devicePixelRatio||1),out=document.createElement('canvas');out.width=Math.round(r.width*dpr);out.height=Math.round(r.height*dpr);const ctx=out.getContext('2d');ctx.scale(dpr,dpr);ctx.fillStyle='#fff';ctx.fillRect(0,0,r.width,r.height);
  const img=paper.querySelector('.scan-photo');if(img&&img.complete&&img.naturalWidth){const ir=img.getBoundingClientRect();ctx.drawImage(img,ir.left-r.left,ir.top-r.top,ir.width,ir.height)}
  ctx.drawImage(ink,0,0,ink.width,ink.height,0,0,r.width,r.height);const url=out.toDataURL('image/jpeg',.78);return{base64:url.split(',')[1],mimeType:'image/jpeg'};
}
async function askTutor(question,rerender=true){const p=selectedProblem();if(!p)return toast('先選一題錯題');if(!question)return toast('先問一個問題');try{const workspace=await v3WorkspaceImage();const original=await v3GetImage(p.id);state.aiLoading=true;save();render();const body={problemText:p.problemText,question,studentAnswer:p.student,correctAnswer:p.correct};if(original?.base64){body.imageBase64=original.base64;body.mimeType=original.mimeType||'image/jpeg'}if(workspace?.base64){body.inkImageBase64=workspace.base64;body.inkMimeType=workspace.mimeType}const r=await apiCall('/tutor',body);state.tutor=r.result;p.annotations=r.result.annotations||[];state.annotations=p.annotations;state.aiLoading=false;save();render();toast(workspace?'AI 已讀取你現在寫在題目上的筆跡並回寫提示':'AI 已把提示放回題目工作區')}catch(e){state.aiLoading=false;save();render();toast('AI 家教失敗：'+e.message)}}

function dueRank(d,item){const iso=item?.dueISO;if(iso)return Math.round((new Date(iso+'T12:00:00')-new Date(v3DateISO(0)+'T12:00:00'))/86400000);return d==='今天'?0:d==='明天'?1:parseInt(d)||9}
function dueProblems(){return [...state.problems].map(p=>(v3EnsureReview(p),p)).sort((a,b)=>dueRank(a.due,a)-dueRank(b.due,b)).slice(0,10)}
function checkReview(){const p=problemById(state.reviewProblemId)||selectedProblem();if(!p)return;state.reviewChecked=true;const ok=sameAnswers(state.reviewSelections,p.correct);v3Schedule(p,ok,'none');p.attempts=(p.attempts||0)+1;state.reviewHistory=state.reviewHistory||[];state.reviewHistory.push({type:'problem',id:p.id,at:new Date().toISOString(),correct:ok});state.reviewHistory=state.reviewHistory.slice(-200);save();render();toast(ok?`答對了；依這次表現排到 ${p.due}`:`還沒完全對；明天再遇到這個概念`)}
function redoProblem(p){const opts=v3StableShuffle(p.options||[],`${p.id}:${state.reviewShuffleSeed||'v3'}`);return `<div style="max-width:760px;margin:0 auto"><div class="meta">${subjectById(p.subject).name} · ${esc(p.concept)} · 選項順序每輪會重新排列</div><h2 style="margin:7px 0 16px">${esc(p.problemText)}</h2>${opts.length?opts.map(([l,t])=>{const sel=(state.reviewSelections||[]).includes(l);let cl=sel?'selected':'';if(state.reviewChecked)cl=(p.correct||[]).includes(l)?'correct':sel?'incorrect':'';return `<button class="redo-option ${cl}" data-review-option="${esc(l)}"><strong>${esc(l)}.</strong> ${esc(t)}</button>`}).join(''):`<div class="callout">這題不是選擇題。請在原題工作紙重做，再讓 AI 讀你的筆跡核對步驟。</div>`}<div class="page-actions" style="justify-content:flex-end;margin-top:14px"><button class="soft-btn" data-action="reviewReset">清除</button><button class="primary-btn" data-action="checkReview">提交答案</button></div>${state.reviewChecked?`<div class="callout ${sameAnswers(state.reviewSelections,p.correct)?'success':'warn'}" style="margin-top:16px">你的答案：<strong>${esc((state.reviewSelections||[]).slice().sort().join('')||'未作答')}</strong> · 正確：<strong>${esc((p.correct||[]).slice().sort().join(''))}</strong>。${sameAnswers(state.reviewSelections,p.correct)?`下一次：${esc(p.due)}`:'這題會更快排回來。'}</div>`:''}</div>`}
function v3ChangedSegment(original,corrected){
  const a=String(original||''),b=String(corrected||'');let pre=0;while(pre<a.length&&pre<b.length&&a[pre]===b[pre])pre++;let sa=a.length-1,sb=b.length-1;while(sa>=pre&&sb>=pre&&a[sa]===b[sb]){sa--;sb--}let seg=b.slice(pre,sb+1).replace(/^[\s，。；：、]+|[\s，。；：、]+$/g,'');if(seg.length>=1&&seg.length<=16)return seg;
  const zh=[...b.matchAll(/[\u3400-\u9fff]{2,8}/g)].map(m=>m[0]).filter(x=>!['這個','一個','進行','主要','可以','以及','因為'].includes(x));return zh[Math.floor(zh.length/2)]||b.split(/\s+/).filter(Boolean).sort((x,y)=>y.length-x.length)[0]||b;
}
function truthReview(p){
  let truths=(state.truths||[]).filter(t=>t.problemId===p.id);if(!truths.length){v3SaveTruthsForProblem(p,{silent:true});truths=(state.truths||[]).filter(t=>t.problemId===p.id)}if(!truths.length)return `<div class="empty">這題還沒有「修正後正確敘述」。回原題先把錯誤敘述改對並確認。</div>`;
  const idx=((state.truthIndex||0)%truths.length+truths.length)%truths.length,t=truths[idx],expected=v3ChangedSegment(t.original,t.corrected),blank=t.corrected.replace(expected,'＿＿＿＿');return `<div class="fill-card"><div class="truth-label">✓ 修正後正確敘述 · ${esc(t.concept||p.concept)} · 掌握 ${t.mastery||50}%</div><div class="fill-sentence">${esc(blank)}</div><div class="tutor-input"><input id="truthAnswer" placeholder="把真正改正的關鍵內容叫回來"><button class="primary-btn" data-action="truthCheck" data-truth-id="${esc(t.id)}" data-expected="${esc(expected)}">檢查</button></div><div id="truthFeedback" style="margin-top:16px"></div><div class="page-actions" style="margin-top:15px"><button class="soft-btn" data-action="truthHint" data-truth-id="${esc(t.id)}">給提示</button><button class="soft-btn" data-action="nextTruth">下一句</button></div><div class="meta" style="margin-top:12px">下次複習：${esc(t.due||'今天')} · 原題與正確敘述有各自的複習紀錄</div></div>`}
async function truthCheck(e){const id=e.currentTarget.dataset.truthId,expected=e.currentTarget.dataset.expected||'',t=(state.truths||[]).find(x=>x.id===id),v=document.getElementById('truthAnswer')?.value.trim()||'',fb=document.getElementById('truthFeedback');if(!t||!fb)return;const ok=v3Equivalent(v,expected)||v3Equivalent(v,t.corrected);v3Schedule(t,ok,t.hintUsed?'hint':'none');t.mastery=clamp((t.mastery||50)+(ok?(t.hintUsed?4:9):-6),10,99);t.hintUsed=false;save();fb.innerHTML=ok?`<div class="callout success">✓ 有叫出來。完整正確版本：<strong>${esc(t.corrected)}</strong><br><small>下一次：${esc(t.due)}</small></div>`:`<div class="callout warn">還不穩。你真正要修正的關鍵是「${esc(expected)}」。完整版本：${esc(t.corrected)}</div>`}
function v3TruthHint(id){const t=(state.truths||[]).find(x=>x.id===id);if(!t)return;const expected=v3ChangedSegment(t.original,t.corrected);t.hintUsed=true;save();const fb=document.getElementById('truthFeedback');if(fb)fb.innerHTML=`<div class="callout">提示：答案是 ${expected.length} 個字左右，開頭是「${esc(expected.slice(0,1))}…」。提示使用會降低這次掌握證據。</div>`}

function v3MindHint(p,level){if(level<=1)return p.h||'先找這個概念的條件、位置、方向或關係。';if(level===2)return `答案共約 ${String(p.a).replace(/\s/g,'').length} 個字／符號，開頭是「${esc(String(p.a).slice(0,1))}…」。`;const a=String(p.a);return `再強一點：${[...a].map((ch,i)=>i%2===0?ch:'＿').join('')}`}
function mindPointV2(subjectId,chapter,p){
  const key=`${subjectId}:${chapter.id}:${p.id}`,val=state.mindAnswers?.[key]||'',ok=v3Equivalent(val,p.a),level=state.mindHintLevels?.[key]||0,hasAttempt=Boolean(val.trim()),related=(state.problems||[]).filter(x=>x.subject===subjectId&&(x.chapter===chapter.title||v3NormalizeText(x.concept).includes(v3NormalizeText(p.a)))).length;
  return `<article class="mind-point-v2 ${ok?'mastered':level?'hinted':hasAttempt?'missed':''}"><div class="point-top"><span class="point-kind">${esc(p.kind||'核心觀念')}</span><span class="point-state">${ok?'✓ 已會':level?`提示 ${level}/3`:hasAttempt?'再想一次':'未作答'}</span></div><div class="point-question">${esc(p.q)}</div><input class="mind-answer-v2" data-mind-key="${esc(key)}" data-answer="${esc(p.a)}" value="${esc(val)}" placeholder="先自己寫出來" autocomplete="off"><div class="point-actions"><button class="hint-link" data-mind-hint="${esc(key)}" data-hint="${esc(p.h||'')}">${level>=3?'已到最強提示':'圈這題，給我下一層提示'}</button></div>${level?`<div class="mind-hint-box"><span>提示 ${level}/3</span>${v3MindHint(p,level)}</div>`:''}<div class="mind-status ${ok?'good':hasAttempt?'bad':''}" id="status-${esc(key)}">${ok?'✓ 自己叫出來了':hasAttempt?'再想一下':''}</div>${(ok||level)?`<div class="correct-memory"><span>要記住的正確版本</span><strong>${esc(p.truth||p.a)}</strong></div>`:''}${related?`<button class="v3-related" data-page="notebook">相關錯題 ${related} 題 →</button>`:''}</article>`;
}

function conceptsPage(){
  const s=activeSubject(),all=state.problems.filter(p=>p.subject===s.id),currentChapter=state.conceptChapter||s.chapters[0],ps=all.filter(p=>p.chapter===currentChapter||v3Concepts(p).some(c=>c.chapterHint===currentChapter)),concepts=ps.flatMap(v3Concepts),codes=[...new Set(concepts.map(c=>c.code).filter(Boolean))],truths=(state.truths||[]).filter(t=>t.subject===s.id&&(ps.some(p=>p.id===t.problemId))).slice(0,10),mastery=ps.length?Math.round(ps.reduce((a,p)=>a+(p.mastery||50),0)/ps.length):0,hints=Object.keys(state.mindHintLevels||{}).filter(k=>k.startsWith(`${s.id}:`)&&(state.mindHintLevels[k]||0)>0).length;
  return `<div class="page-head"><div><h2>各科概念地圖</h2><p>這裡只計算目前選到的章節／概念，不再拿整科資料冒充這個概念的掌握度。</p></div></div>${subjectTabs()}<div style="height:14px"></div><div class="chapter-layout"><aside class="panel chapter-tree"><div class="chapter-subject">${s.name} · 108 課綱概念樹</div>${s.chapters.map(ch=>`<button class="chapter-node ${currentChapter===ch?'active':''}" data-concept-chapter="${esc(ch)}">${esc(ch)} <span class="meta">${all.filter(p=>p.chapter===ch).length}</span></button>`).join('')}</aside><section class="panel concept-detail"><span class="concept-code">${esc(codes[0]||s.id.toUpperCase()+'-CORE')}</span><h2>${esc(currentChapter)}</h2><div class="v3-concept-chips">${concepts.slice(0,8).map(c=>`<span>${esc(c.nameZh||c.code)}</span>`).join('')||'<span>尚無個人錯題概念</span>'}</div><div class="concept-metrics"><div class="metric"><strong>${ps.length}</strong><span>這章相關錯題</span></div><div class="metric"><strong>${ps.reduce((a,p)=>a+(p.attempts||1),0)}</strong><span>錯誤事件</span></div><div class="metric"><strong>${mastery}%</strong><span>這章掌握度</span></div><div class="metric"><strong>${hints}</strong><span>這科曾用提示節點</span></div></div><div class="grid-2"><div><h3>你的課本</h3><div class="mapping-row"><span class="publisher">出版社</span><span>${esc(activePublisher(s.id))}</span></div><div class="mapping-row"><span class="publisher">位置</span><span class="mapping-unknown">只顯示已驗證／你確認的位置；不讓 AI 猜出版社章號。</span></div></div><div><h3>跨題型訊號</h3><p class="concept-summary">${ps.length?`這一章目前有 ${ps.length} 題個人錯題，平均掌握 ${mastery}%。`:'還沒有個人錯題；心智圖仍可先做主動回想。'}</p></div></div><div class="truths"><h3>這一章已修正的正確敘述</h3>${truths.length?truths.map(t=>`<div class="truth">✓ ${esc(t.corrected)}</div>`).join(''):'<div class="empty">這一章還沒有保存的修正敘述。</div>'}</div><div class="page-actions" style="margin-top:18px"><button class="soft-btn" data-page="notebook">看這科錯題</button><button class="primary-btn" data-page="mindmap">做這科心智圖</button></div></section></div>`;
}

function communityPage(){
  const s=activeSubject(),p=selectedProblem()?.subject===s.id?selectedProblem():null,key=p?v3ProblemKey(p):'',unlocked=!p||state.communityUnlocked[key];const posts=state.community||[];
  return `<div class="page-head"><div><h2>社群討論</h2><p>${p?`目前討論附著在「${esc(p.title)}」與 ${esc(p.concept)}。`:'先選一題錯題，可以進入更精準的題目討論串。'} 私人筆記不會自動公開。</p></div><div class="page-actions"><button class="soft-btn" data-action="refreshCommunity">重新整理</button></div></div>${subjectTabs()}<div style="height:14px"></div><div class="community-layout"><div class="stack">${p&&!unlocked?`<section class="panel v3-spoiler"><h3>先保留自己的思考</h3><p>討論內容先遮住，避免一進來就看到別人的解法。你已經做過這題時，可以直接解鎖。</p><button class="primary-btn" data-action="unlockCommunity" data-problem-key="${esc(key)}">我已先作答，顯示討論</button></section>`:`<section class="panel composer"><textarea id="communityText" placeholder="分享你的解法、卡住的點，或一個真的有幫助的記法…"></textarea><div class="composer-foot"><span class="meta">公開內容 · ${esc(state.profile?.displayName||'同學')}</span><button class="primary-btn" data-action="postCommunity">發布</button></div></section><section class="panel"><div class="panel-head"><h3>${p?'這題的討論':s.name+'社群'}</h3><span class="meta">${state.communityLoading?'載入中…':posts.length+' 則'}</span></div>${state.communityLoading?'<div class="empty">載入社群中…</div>':posts.length?posts.map(postCard).join(''):'<div class="empty">目前還沒有討論。</div>'}</section>`}</div><aside class="stack"><section class="panel"><div class="panel-head"><h3>社群要回到學習</h3></div><div class="mapping"><div class="callout">先作答 → 修正 → 再看別人的思路。不是另一個無限滑動的動態牆。</div></div></section>${p?`<section class="panel"><div class="panel-head"><h3>目前題目</h3></div><div class="mapping"><strong>${esc(p.title)}</strong><div class="meta">${esc(p.concept)} · ${esc(p.conceptCode)}</div><button class="soft-btn" data-problem="${esc(p.id)}" style="width:100%;margin-top:10px">回原題</button></div></section>`:''}</aside></div>`;
}
async function loadCommunity(){state.communityLoading=true;save();render();try{const p=selectedProblem()?.subject===state.subject?selectedProblem():null;state.community=await communityGet(activeSubject().name,p?.conceptCode||'');state.communityLoading=false;save();render()}catch(e){state.communityLoading=false;save();render();toast('社群載入失敗：'+e.message)}}
async function postCommunity(){const text=document.getElementById('communityText')?.value.trim();if(!text)return toast('先寫點內容');const p=selectedProblem()?.subject===state.subject?selectedProblem():null;try{await communityPost({action:'create',displayName:state.profile?.displayName||'同學',body:text,subject:activeSubject().name,conceptCode:p?.conceptCode||'',problemKey:p?v3ProblemKey(p):''});toast('已發布到這個學習討論串');await loadCommunity()}catch(e){toast('發布失敗：'+e.message)}}

function analyticsPage(){
  const subjectRows=SUBJECTS.map(s=>{const ps=state.problems.filter(p=>p.subject===s.id),truths=(state.truths||[]).filter(t=>t.subject===s.id),mindKeys=Object.keys(state.mindEvidence||{}).filter(k=>k.startsWith(s.id+':')),mindOk=mindKeys.filter(k=>state.mindEvidence[k]?.correct).length;const problemM=ps.length?ps.reduce((a,p)=>a+(p.mastery||50),0)/ps.length:0,truthM=truths.length?truths.reduce((a,t)=>a+(t.mastery||50),0)/truths.length:problemM,mindM=mindKeys.length?mindOk/mindKeys.length*100:problemM;return{s,mastery:Math.round(problemM*.5+truthM*.3+mindM*.2),count:ps.length}});
  const concepts=new Map();for(const p of state.problems){for(const c of v3Concepts(p)){const key=c.code||`${p.subject}:${p.concept}`,r=concepts.get(key)||{name:c.nameZh||p.concept,subject:p.subject,sum:0,n:0,attempts:0};r.sum+=p.mastery||50;r.n++;r.attempts+=p.attempts||1;concepts.set(key,r)}}const weakest=[...concepts.values()].map(r=>({...r,mastery:Math.round(r.sum/r.n)})).sort((a,b)=>a.mastery-b.mastery||b.attempts-a.attempts).slice(0,12);
  return `<div class="page-head"><div><h2>弱點分析</h2><p>現在使用真實錯題掌握、修正敘述複習、心智圖回想訊號；不再用示範公式畫假的熱度。</p></div></div><div class="analytics-grid"><section class="panel"><div class="panel-head"><h3>各科綜合掌握</h3><span class="meta">錯題 50% · 正確敘述 30% · 心智圖 20%</span></div><div class="weakness-bars">${subjectRows.map(({s,mastery})=>`<div class="bar-row" style="${subjectStyle(s.id)}"><span>${s.name}</span><div class="bar"><span style="width:${mastery}%"></span></div><strong>${mastery}%</strong></div>`).join('')}</div></section><section class="panel"><div class="panel-head"><h3>最需要處理的概念</h3></div><div class="v3-weak-list">${weakest.map(r=>`<div><span>${esc(subjectById(r.subject).name)} · ${esc(r.name)}</span><strong>${r.mastery}%</strong><small>${r.attempts} 次錯誤事件</small></div>`).join('')||'<div class="empty">需要更多個人錯題資料</div>'}</div></section><section class="panel" style="grid-column:1/-1"><div class="panel-head"><h3>真實學習訊號</h3></div><div class="stat-strip"><div class="stat-card"><strong>${state.reviewHistory?.length||0}</strong><span>複習紀錄</span></div><div class="stat-card"><strong>${state.truths?.length||0}</strong><span>正確敘述</span></div><div class="stat-card"><strong>${Object.values(state.mindHintLevels||{}).filter(Boolean).length}</strong><span>曾需提示節點</span></div><div class="stat-card"><strong>${state.problems.filter(p=>p.reviewData?.lapses).reduce((n,p)=>n+p.reviewData.lapses,0)}</strong><span>複習後仍失誤</span></div></div></section></div>`;
}

function settingsPage(){
  const pubs=['龍騰','翰林','南一','自訂'];return `<div class="page-head"><div><h2>課綱、出版社與資料</h2><p>目前完整內容層是高中 108 課綱。國中課綱不再用一個下拉選單假裝已完成。</p></div></div><div class="settings-grid"><section class="panel settings-panel"><div class="grid-2"><div class="field"><label>學制</label><select id="levelSelect"><option selected>高中</option><option disabled>國中（課綱資料建置中）</option></select></div><div class="field"><label>年級</label><input id="gradeInput" value="${esc(state.syllabus.grade)}" placeholder="例如 高二"></div></div><div class="field" style="margin-top:12px"><label>社群顯示名稱</label><input id="profileName" value="${esc(state.profile?.displayName||'同學')}" maxlength="20"></div><div class="section-title"><h3>各科出版社</h3><small>可每科不同</small></div><div class="publisher-grid">${SUBJECTS.map(s=>`<div class="publisher-field"><strong>${s.name}</strong><select data-publisher="${s.id}">${pubs.map(p=>`<option ${activePublisher(s.id)===p?'selected':''}>${p}</option>`).join('')}</select></div>`).join('')}</div><button class="primary-btn" data-action="saveSettings" style="width:100%;margin-top:14px">儲存設定</button><div class="callout" style="margin-top:12px">精確的龍騰／翰林／南一冊別、章節、頁碼只會使用已驗證資料或你親自確認的資料。資料表已預留 verified 狀態，不讓 AI 猜章號。</div></section><aside class="stack"><section class="panel settings-panel"><h3 style="margin-top:0">完整資料備份</h3><p class="meta">現在匯出會連同每一題自己的掃描原圖與手寫筆跡一起備份，不再只有文字 state。</p><div class="data-actions"><button class="soft-btn" data-action="exportData">${icon('download')} 匯出完整備份</button><button class="soft-btn" data-action="importData">${icon('upload')} 匯入完整備份</button><input id="importInput" class="hidden-input" type="file" accept="application/json"><button class="danger-btn" data-action="resetDemo">重設示範資料</button></div></section><section class="panel settings-panel"><h3 style="margin-top:0">目前後端</h3><div class="mapping-row"><span class="publisher">AI</span><span>Supabase Edge Function · Gemini</span></div><div class="mapping-row"><span class="publisher">原圖</span><span>每題獨立 IndexedDB 儲存</span></div><div class="mapping-row"><span class="publisher">手寫</span><span>每題獨立筆跡 + AI 可讀工作紙快照</span></div><div class="mapping-row"><span class="publisher">社群</span><span>Supabase 概念／題目脈絡討論</span></div></section></aside></div>`;
}
async function exportData(){const images=await v3AllImages();let ink={};try{ink=JSON.parse(storageGet('wrongbook-v2-ink')||'{}')}catch{}const payload={format:'wrongbook-v3-backup',version:V3_VERSION,exportedAt:new Date().toISOString(),state,images,ink};const blob=new Blob([JSON.stringify(payload)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`wrongbook-full-backup-${todayISO()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast(`已匯出完整備份：${images.length} 張原題 + 筆跡 + 學習紀錄`)}
async function importData(e){const f=e.target.files?.[0];if(!f)return;try{const obj=JSON.parse(await f.text());const payload=obj.format==='wrongbook-v3-backup'?obj:{state:obj,images:[],ink:{}};if(!payload.state||!Array.isArray(payload.state.problems))throw new Error('格式不正確');state={...state,...payload.state};for(const img of payload.images||[])if(img.problemId)await v3PutImage(img.problemId,img);if(payload.ink)storageSet('wrongbook-v2-ink',JSON.stringify(payload.ink));v3Migrate();save();render();toast('完整備份已匯入')}catch(err){toast('匯入失敗：'+err.message)}}

// Wrap existing bind/render so existing controls keep working while V3 replaces the critical learning actions.
const v3LegacyBind=bind;
bind=function(){
  v3LegacyBind();
  document.querySelector('[data-action="saveTruths"]')?.addEventListener('click',()=>v3SaveTruthsForProblem(selectedProblem()));
  document.querySelectorAll('[data-validate-correction]').forEach(el=>el.onclick=()=>v3ValidateCorrection(el.dataset.validateCorrection));
  document.querySelectorAll('[data-correction-hint]').forEach(el=>el.onclick=()=>v3CorrectionHint(el.dataset.correctionHint));
  document.querySelectorAll('[data-mind-key]').forEach(el=>el.onchange=()=>{state.mindAnswers=state.mindAnswers||{};state.mindEvidence=state.mindEvidence||{};state.mindAnswers[el.dataset.mindKey]=el.value.trim();const ok=v3Equivalent(el.value,el.dataset.answer);state.mindEvidence[el.dataset.mindKey]={correct:ok,hintLevel:state.mindHintLevels?.[el.dataset.mindKey]||0,at:new Date().toISOString()};save();render()});
  document.querySelectorAll('[data-mind-hint]').forEach(el=>el.onclick=()=>{const key=el.dataset.mindHint;state.mindHintLevels=state.mindHintLevels||{};state.mindHintLevels[key]=Math.min(3,(state.mindHintLevels[key]||0)+1);state.mindHints=state.mindHints||{};state.mindHints[key]=el.dataset.hint||'提示';save();render();toast(`已記錄提示層級 ${state.mindHintLevels[key]}/3；掌握證據會降低`)});
  const th=document.querySelector('[data-action="truthHint"]');if(th)th.onclick=()=>v3TruthHint(th.dataset.truthId);
  const tc=document.querySelector('[data-action="truthCheck"]');if(tc)tc.onclick=e=>truthCheck(e);
  document.querySelector('[data-action="unlockCommunity"]')?.addEventListener('click',e=>{state.communityUnlocked[e.currentTarget.dataset.problemKey]=true;save();loadCommunity()});
  document.querySelectorAll('[data-scan-problem-text]').forEach(el=>el.onchange=()=>{const p=selectedProblem();if(p){p.problemText=el.value.trim();if(state.scan)state.scan.problemText=p.problemText;save()}});
  document.querySelectorAll('[data-scan-option-index]').forEach(el=>el.onchange=()=>{const p=selectedProblem(),i=Number(el.dataset.scanOptionIndex);if(p?.options?.[i]){p.options[i][1]=el.value.trim();if(state.scan?.options?.[i])state.scan.options[i].text=el.value.trim();save()}});
  const profile=document.getElementById('profileName');if(profile)profile.onchange=()=>{state.profile.displayName=profile.value.trim()||'同學';save()};
};
const v3LegacyRender=render;
render=function(){v3LegacyRender();setTimeout(v3HydrateSelectedImage,0)};

v3Migrate();
render();
healthCheck();
