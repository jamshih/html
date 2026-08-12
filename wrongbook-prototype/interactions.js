function captureModal(){return `<div class="modal-backdrop" id="modal"><div class="modal"><div class="modal-head"><div><strong>掃描錯題</strong><div class="meta">拍整題，保留你的圈選、老師痕跡與圖。</div></div><button class="icon-btn" data-action="closeModal">×</button></div><div class="modal-body"><label class="upload-box" for="photoInput"><div style="width:48px;height:48px;margin:0 auto 11px;border-radius:14px;background:var(--accent-2);color:var(--accent);display:grid;place-items:center">${icon('camera')}</div><strong>拍照或選擇題目圖片</strong><p class="meta">會真的把照片送到 interview aibot Supabase → Gemini Vision，辨識你的作答、正確答案、概念與可修正敘述。</p><input id="photoInput" type="file" accept="image/*" capture="environment"><button class="soft-btn" type="button" onclick="document.getElementById('photoInput').click()">選擇照片</button><img id="uploadPreview" class="preview-img" style="display:none"></label></div><div class="modal-actions"><button class="soft-btn" data-action="demoScan">使用示範題</button><button class="primary-btn" data-action="analyzeUpload">開始 Gemini AI 辨識</button></div></div></div>`}

function escapeHtml(s){return String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
function escapeAttr(s){return escapeHtml(s).replaceAll('"','&quot;')}
function subjectKey(s){s=String(s||'').toLowerCase();if(s.includes('生物')||s.includes('bio'))return'biology';if(s.includes('化學')||s.includes('chem'))return'chemistry';if(s.includes('數學')||s.includes('math'))return'math';return'physics'}
function render(){document.getElementById('app').innerHTML=shell();bind();if(state.page==='notebook')setTimeout(initCanvas,0)}
function bind(){
  $$('[data-page]').forEach(el=>el.onclick=()=>{state.page=el.dataset.page;save();render();window.scrollTo(0,0)});
  $$('[data-action="capture"]').forEach(el=>el.onclick=openCapture);
  $('[data-action="share"]')?.addEventListener('click',()=>{navigator.clipboard?.writeText(location.href);toast('已複製分享連結（prototype）')});
  $$('[data-toggle-student]').forEach(el=>el.onclick=()=>toggleArr('studentAnswer',el.dataset.toggleStudent));
  $$('[data-toggle-correct]').forEach(el=>el.onclick=()=>toggleArr('correctAnswer',el.dataset.toggleCorrect));
  $('[data-action="confirmRecognition"]')?.addEventListener('click',()=>{state.recognitionConfirmed=true;save();render();toast('已確認辨識結果，現在才寫入錯題歷史')});
  $('[data-action="resetAnswers"]')?.addEventListener('click',()=>{state.studentAnswer=['A','B'];state.correctAnswer=['A','C'];state.recognitionConfirmed=false;save();render()});
  $$('[data-correction]').forEach(el=>el.onchange=()=>{state.corrections[el.dataset.correction]=el.value;save()});
  $$('[data-ai-correct]').forEach(el=>el.onclick=async()=>{let l=el.dataset.aiCorrect;if(ai()&&el.dataset.statement){try{el.disabled=true;let r=await apiCall('/revise',{statement:el.dataset.statement,problemText:ai().problemText||''});state.corrections[l]=r.result.correctedStatement;save();render();toast('AI 已重新修正；你可以再改成自己的說法')}catch(e){toast('AI 修正失敗：'+e.message)}}else{state.corrections[l]=l==='B'?'撤去 F₂ 後，摩擦力為 10 N，方向向左。':'木塊若仍保持靜止，合力為 0 N。';save();render();toast('AI 修正已寫入；你仍可以改成自己的說法')}});
  $('[data-action="saveTruths"]')?.addEventListener('click',()=>{let vals=ai()?Object.values(state.corrections).filter(Boolean):[state.corrections.B,state.corrections.D];state.savedTruths=[...new Set([...state.savedTruths,...vals])];save();toast('已加入「正確敘述庫」')});
  $('[data-action="hint1"]')?.addEventListener('click',()=>{state.hintCount++;save();$('#inkNote1')?.classList.add('show');$('#aiArrow')?.classList.add('show');toast('提示行為已記錄：這個概念需要一點幫助')});
  $('[data-action="hint2"]')?.addEventListener('click',()=>{state.hintCount++;save();$('#inkNote2')?.classList.add('show');$('#aiArrow')?.classList.add('show')});
  $('[data-action="aiOnPaper"]')?.addEventListener('click',async()=>{if(ai()){try{toast('AI 正在看你的原題…');let r=await apiCall('/tutor',{problemText:ai().problemText||'',question:'先不要直接告訴我完整答案。請給我下一步提示，並在原題上指出我應該看的位置。',studentAnswer:state.studentAnswer,correctAnswer:state.correctAnswer,imageBase64:state.uploadBase64,mimeType:state.uploadMime});state.tutorResponse=r.result;state.aiAnnotations=r.result.annotations||[];state.hintCount++;save();render()}catch(e){toast('AI 提示失敗：'+e.message)}}else{$('#inkNote1')?.classList.add('show');$('#aiArrow')?.classList.add('show')}});
  $('[data-action="askTutor"]')?.addEventListener('click',async()=>{let q=$('#tutorQuestion')?.value.trim();if(!q)return toast('先問一個問題');try{toast('AI 家教思考中…');let r=await apiCall('/tutor',{problemText:ai()?.problemText||'',question:q,studentAnswer:state.studentAnswer,correctAnswer:state.correctAnswer,imageBase64:state.uploadBase64,mimeType:state.uploadMime});state.tutorResponse=r.result;state.aiAnnotations=r.result.annotations||[];save();render()}catch(e){toast('AI 家教失敗：'+e.message)}});
  $('[data-action="rescanAI"]')?.addEventListener('click',async()=>{if(!state.uploadBase64)return toast('請重新拍照');await analyzeCurrentUpload()});
  $('[data-action="tutorNext"]')?.addEventListener('click',()=>toast('下一步：請你自己重新畫撤去 F₂ 後的受力圖'));
  $$('[data-review-mode]').forEach(el=>el.onclick=()=>{state.reviewMode=el.dataset.reviewMode;state.reviewChecked=false;save();render()});
  $$('[data-review-option]').forEach(el=>el.onclick=()=>{toggleArr('reviewSelections',el.dataset.reviewOption)});
  $('[data-action="checkReview"]')?.addEventListener('click',()=>{state.reviewChecked=true;save();render();toast(state.reviewSelections.sort().join('')===state.correctAnswer.sort().join('')?'答對了。接著複習正確敘述。':'先看哪些敘述需要修正')});
  $('[data-action="reviewReset"]')?.addEventListener('click',()=>{state.reviewSelections=[];state.reviewChecked=false;save();render()});
  $('[data-action="truthHint"]')?.addEventListener('click',()=>{state.hintCount++;save();$('#truthFeedback').innerHTML='<div class="callout" style="margin:0">提示：撤掉 F₂ 後，只剩 10 N 向右的外力需要被平衡。</div>'});
  $('[data-action="truthCheck"]')?.addEventListener('click',()=>{let v=$('#truthFill').value.trim().toLowerCase().replaceAll(' ','');let ok=v.includes('10');$('#truthFeedback').innerHTML=ok?'<div class="truth">✓ 撤去 F₂ 後，若木塊仍靜止，靜摩擦力為 <strong>10 N</strong>，方向向左。<br><small>這是你要記住的正確版本。</small></div>':'<div class="callout" style="margin:0;background:var(--red-bg);color:var(--red)">再想一次：合力必須是多少？</div>'});
  $$('[data-mind]').forEach(el=>el.onchange=()=>{state.mindAnswers[el.dataset.mind]=el.value;save();let st=$('#status-'+el.dataset.mind);st.textContent=el.value.trim()===el.dataset.expected?'✓ 自己叫出來了':'再想一下';st.style.color=el.value.trim()===el.dataset.expected?'var(--green)':'var(--red)'});
  $$('[data-mind-hint]').forEach(el=>el.onclick=()=>{state.hintCount++;save();let input=$(`[data-mind="${el.dataset.mindHint}"]`);input.placeholder='提示：'+el.dataset.answer.slice(0,2)+'…';toast('這個提示已記錄為「需要協助回想」')});
  $('[data-action="resetMind"]')?.addEventListener('click',()=>{state.mindAnswers={};save();render()});
  $('[data-action="post"]')?.addEventListener('click',()=>{let t=$('#postText').value.trim();if(!t)return toast('先寫點內容');state.posts.unshift({name:state.userName,text:t,help:0});save();render();toast('已發布到這題的討論')});
  $('[data-action="saveSettings"]')?.addEventListener('click',()=>{state.syllabus.level=$('#levelSelect').value;$$('.syllabus-select').forEach(s=>state.syllabus[s.dataset.subject]=s.value);save();toast('課綱設定已儲存')});
}
function toggleArr(key,val){let a=[...(state[key]||[])];a.includes(val)?a=a.filter(x=>x!==val):a.push(val);state[key]=a;state.recognitionConfirmed=false;save();render()}
function openCapture(){document.body.insertAdjacentHTML('beforeend',captureModal());bindModal()}
function bindModal(){
 $('#modal [data-action="closeModal"]').onclick=()=>$('#modal').remove();
 $('#photoInput').onchange=async e=>{let f=e.target.files?.[0];if(!f)return;try{let img=await imageFileToData(f);state.uploadImage=img.dataUrl;state.uploadBase64=img.base64;state.uploadMime=img.mimeType;save();let prev=$('#uploadPreview');prev.src=img.dataUrl;prev.style.display='block'}catch(err){toast('圖片讀取失敗：'+err.message)}};
 $('#modal [data-action="demoScan"]').onclick=()=>{state.aiAnalysis=null;state.page='notebook';state.recognitionConfirmed=false;save();$('#modal').remove();render();toast('示範題已匯入，請先確認 AI 辨識的作答')};
 $('#modal [data-action="analyzeUpload"]').onclick=async()=>{if(!state.uploadBase64)return toast('請先拍照或選擇圖片');$('#modal').remove();await analyzeCurrentUpload()};
}
async function analyzeCurrentUpload(){
 state.aiLoading=true;state.aiError='';state.page='notebook';state.recognitionConfirmed=false;save();render();
 try{
   const r=await apiCall('/analyze',{imageBase64:state.uploadBase64,mimeType:state.uploadMime,syllabus:state.syllabus});
   const a=r.result;state.aiAnalysis=a;state.studentAnswer=(a.recognizedUserAnswer||[]).map(x=>String(x).toUpperCase());state.correctAnswer=(a.correctAnswer||[]).map(x=>String(x).toUpperCase());state.corrections={};for(const c of a.corrections||[])state.corrections[c.label]=c.correctedStatement;state.aiAnnotations=a.annotations||[];state.tutorResponse=null;state.aiLoading=false;save();render();toast(`AI 完成：辨識你的答案 ${state.studentAnswer.join('')||'未作答'}，請你確認`);
 }catch(e){state.aiLoading=false;state.aiError=e.message;save();render();toast('AI 辨識失敗：'+e.message)}
}

let drawing={canvas:null,ctx:null,drawing:false,tool:'pen',paths:[],current:null};
function initCanvas(){let c=$('#drawCanvas');if(!c)return;drawing.canvas=c;let rect=c.getBoundingClientRect();let dpr=window.devicePixelRatio||1;c.width=Math.round(rect.width*dpr);c.height=Math.round(rect.height*dpr);drawing.ctx=c.getContext('2d');drawing.ctx.scale(dpr,dpr);drawing.ctx.lineCap='round';drawing.ctx.lineJoin='round';drawing.paths=[];function pos(e){let r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};c.onpointerdown=e=>{c.setPointerCapture(e.pointerId);drawing.drawing=true;drawing.current={tool:drawing.tool,pts:[pos(e)]};drawing.paths.push(drawing.current)};c.onpointermove=e=>{if(!drawing.drawing)return;drawing.current.pts.push(pos(e));redrawCanvas()};c.onpointerup=()=>{drawing.drawing=false;saveInk()};$$('[data-tool]').forEach(b=>b.onclick=()=>{drawing.tool=b.dataset.tool;$$('[data-tool]').forEach(x=>x.classList.toggle('active',x===b))});$('[data-action="undoInk"]')?.addEventListener('click',()=>{drawing.paths.pop();redrawCanvas();saveInk()});$('[data-action="clearInk"]')?.addEventListener('click',()=>{drawing.paths=[];redrawCanvas();saveInk()});let saved=JSON.parse(storageGet('gaidui-ink')||'[]');drawing.paths=saved;redrawCanvas()}
function redrawCanvas(){let c=drawing.canvas,ctx=drawing.ctx;if(!c||!ctx)return;let r=c.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);for(let p of drawing.paths){if(p.pts.length<2)continue;ctx.beginPath();ctx.strokeStyle=p.tool==='eraser'?'rgba(255,255,255,.95)':'#2458d7';ctx.lineWidth=p.tool==='eraser'?18:2.6;ctx.moveTo(p.pts[0].x,p.pts[0].y);for(let q of p.pts.slice(1))ctx.lineTo(q.x,q.y);ctx.stroke()}}
function saveInk(){storageSet('gaidui-ink',JSON.stringify(drawing.paths))}

if('serviceWorker' in navigator && location.protocol==='https:'){navigator.serviceWorker.register('./sw.js').catch(()=>{})}
render();
