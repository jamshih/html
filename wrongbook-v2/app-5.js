function render(){
  document.getElementById('app').innerHTML=shell();
  bind();
  if(['notebook','tutor'].includes(state.page) && selectedProblem()) setTimeout(()=>initCanvas(selectedProblem().id),30);
}
function navigate(page){state.page=page;state.mobileMenu=false;if(page==='notebook'&&!state.selectedProblemId){const ps=state.problems.filter(p=>p.subject===state.subject);state.selectedProblemId=ps[0]?.id||null}save();render();window.scrollTo({top:0,behavior:'instant'})}
function setSubject(id,pageAfter){state.subject=id;state.mobileMenu=false;if(pageAfter==='notebook'||state.page==='notebook'){const ps=state.problems.filter(p=>p.subject===id);state.selectedProblemId=ps[0]?.id||null}save();render();if(pageAfter)navigate(pageAfter);if(state.page==='community')loadCommunity()}

function bind(){
  $$('[data-page]').forEach(el=>el.onclick=e=>{e.stopPropagation();navigate(el.dataset.page)});
  $$('[data-subject]').forEach(el=>el.onclick=e=>{e.stopPropagation();setSubject(el.dataset.subject,el.dataset.pageAfterSubject||null)});
  $$('[data-problem]').forEach(el=>el.onclick=()=>{const p=problemById(el.dataset.problem);if(!p)return;state.subject=p.subject;state.selectedProblemId=p.id;state.page='notebook';save();render();window.scrollTo(0,0)});
  $('[data-action="backNotebook"]')?.addEventListener('click',()=>{state.selectedProblemId=null;save();render()});
  $('[data-action="toggleMenu"]')?.addEventListener('click',()=>{state.mobileMenu=!state.mobileMenu;save();render()});
  $('[data-action="closeMenu"]')?.addEventListener('click',()=>{state.mobileMenu=false;save();render()});
  $('[data-action="share"]')?.addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:'錯題本 prototype',url:location.href});else{await navigator.clipboard.writeText(location.href);toast('已複製連結')}}catch{}});
  $$('[data-action="capture"]').forEach(el=>el.onclick=openCapture);
  $$('[data-chapter]').forEach(el=>el.onclick=()=>{const target=el.dataset.chapter;$$('[data-chapter]').forEach(b=>b.classList.toggle('active',b===el));$$('[data-problem-chapter]').forEach(row=>row.style.display=(target==='all'||row.dataset.problemChapter===target)?'table-row':'none')});
  $$('[data-concept-chapter]').forEach(el=>el.onclick=()=>{state.conceptChapter=el.dataset.conceptChapter;save();render()});
  $$('[data-scan-student]').forEach(el=>el.onclick=()=>{toggleArray('scanStudent',el.dataset.scanStudent);state.scanConfirmed=false;save();render()});
  $$('[data-scan-correct]').forEach(el=>el.onclick=()=>{toggleArray('scanCorrect',el.dataset.scanCorrect);state.scanConfirmed=false;save();render()});
  $('[data-action="confirmScan"]')?.addEventListener('click',confirmScan);
  $$('[data-correction]').forEach(el=>el.onchange=()=>{const p=selectedProblem();if(!p)return;p.corrections=p.corrections||{};p.corrections[el.dataset.correction]=el.value.trim();save()});
  $$('[data-ai-revise]').forEach(el=>el.onclick=()=>aiRevise(el.dataset.aiRevise));
  $('[data-action="saveTruths"]')?.addEventListener('click',()=>toast('已保存修正版本；複習時會優先叫你回想這些正確敘述'));
  $('[data-action="saveInsight"]')?.addEventListener('click',()=>{const p=selectedProblem();if(!p)return;p.insight=$('#insightText')?.value.trim()||'';save();toast('已保存你的個人洞察')});
  $('[data-action="cleanInsight"]')?.addEventListener('click',cleanInsight);
  $('[data-action="editBookLocation"]')?.addEventListener('click',editBookLocation);
  $('[data-action="askMiniTutor"]')?.addEventListener('click',()=>askTutor($('#miniTutorInput')?.value.trim(),true));
  $('[data-action="askTutor"]')?.addEventListener('click',()=>askTutor($('#tutorInput')?.value.trim(),false));
  $('[data-action="aiOnPaper"]')?.addEventListener('click',()=>askTutor('不要直接告訴我完整答案。請只給下一步提示，並在原題上標出我現在應該看的地方。',state.page!=='tutor'));
  $$('[data-review-mode]').forEach(el=>el.onclick=()=>{state.reviewMode=el.dataset.reviewMode;state.reviewSelections=[];state.reviewChecked=false;save();render()});
  $$('[data-review-problem]').forEach(el=>el.onclick=()=>{state.reviewProblemId=el.dataset.reviewProblem;state.reviewSelections=[];state.reviewChecked=false;save();render()});
  $$('[data-review-option]').forEach(el=>el.onclick=()=>{toggleArray('reviewSelections',el.dataset.reviewOption);save();render()});
  $('[data-action="reviewReset"]')?.addEventListener('click',()=>{state.reviewSelections=[];state.reviewChecked=false;save();render()});
  $('[data-action="checkReview"]')?.addEventListener('click',checkReview);
  $('[data-action="truthHint"]')?.addEventListener('click',()=>{$('#truthFeedback').innerHTML='<div class="callout">提示：先回想這句是從哪個錯誤選項修正來的，再想關鍵名詞。</div>';toast('已記錄一次提示使用')});
  $('[data-action="truthCheck"]')?.addEventListener('click',truthCheck);
  $('[data-action="nextTruth"]')?.addEventListener('click',()=>{state.truthIndex=((state.truthIndex||0)+1);save();render()});
  $$('[data-mind-key]').forEach(el=>el.onchange=()=>{state.mindAnswers=state.mindAnswers||{};state.mindAnswers[el.dataset.mindKey]=el.value.trim();const ok=el.value.trim().toLowerCase()===el.dataset.answer.trim().toLowerCase();const st=document.getElementById('status-'+el.dataset.mindKey);if(st){st.textContent=ok?'✓ 自己叫出來了':'再想一下';st.className='mind-status '+(ok?'good':'bad')}save()});
  $$('[data-mind-hint]').forEach(el=>el.onclick=()=>{state.mindHints=state.mindHints||{};state.mindHints[el.dataset.mindHint]=el.dataset.hint;save();render();toast('提示使用已記錄；之後會提高這個節點的複習權重')});
  $('[data-action="resetMind"]')?.addEventListener('click',()=>{const pre=state.subject+':';for(const k of Object.keys(state.mindAnswers||{}))if(k.startsWith(pre))delete state.mindAnswers[k];for(const k of Object.keys(state.mindHints||{}))if(k.startsWith(pre))delete state.mindHints[k];save();render()});
  $('[data-action="refreshCommunity"]')?.addEventListener('click',loadCommunity);
  $('[data-action="postCommunity"]')?.addEventListener('click',postCommunity);
  $$('[data-helpful]').forEach(el=>el.onclick=()=>markHelpful(el.dataset.helpful));
  $$('[data-action="deleteInsight"]').forEach(el=>el.onclick=()=>{const p=problemById(el.dataset.id);if(p){p.insight='';save();render();toast('已刪除私人筆記')}});
  $('[data-action="saveSettings"]')?.addEventListener('click',saveSettings);
  $('[data-action="exportData"]')?.addEventListener('click',exportData);
  $('[data-action="importData"]')?.addEventListener('click',()=>$('#importInput')?.click());
  $('#importInput')?.addEventListener('change',importData);
  $('[data-action="resetDemo"]')?.addEventListener('click',()=>{if(confirm('確定重設這台裝置上的 prototype 學習資料？')){localStorage.removeItem('wrongbook-v2-state');localStorage.removeItem('wrongbook-v2-ink');location.reload()}});
}
function toggleArray(key,val){const a=[...(state[key]||[])];state[key]=a.includes(val)?a.filter(x=>x!==val):[...a,val]}

function openCapture(){document.body.insertAdjacentHTML('beforeend',captureModal());const input=$('#globalPhotoInput');input.value='';$('#captureModal [data-action="closeCapture"]').onclick=()=>$('#captureModal').remove();$('#captureModal [data-action="analyzePhoto"]').onclick=()=>analyzePhoto();$('#captureModal [data-action="loadDemoScan"]').onclick=loadDemoScan;input.onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const img=await imageFileToData(f);state.scanImage=img.dataUrl;state.scanBase64=img.base64;state.scanMime=img.mimeType;save();const prev=$('#capturePreview');if(prev){prev.src=img.dataUrl;prev.style.display='block'}}catch(err){toast('圖片讀取失敗：'+err.message)}}}
function loadDemoScan(){state.scan=null;state.scanImage='';state.scanBase64='';state.subject='biology';state.selectedProblemId='bio-1';state.page='notebook';save();$('#captureModal')?.remove();render();toast('已載入生物示範題')}
async function analyzePhoto(){if(!state.scanBase64)return toast('請先拍照或選一張題目圖片');$('#captureModal')?.remove();state.aiLoading=true;state.aiError='';render();try{const r=await apiCall('/analyze',{imageBase64:state.scanBase64,mimeType:state.scanMime,syllabus:state.syllabus});state.scan=r.result;state.scanStudent=(r.result.recognizedUserAnswer||[]).map(x=>String(x).toUpperCase());state.scanCorrect=(r.result.correctAnswer||[]).map(x=>String(x).toUpperCase());state.scanConfirmed=false;state.subject=subjectIdFromText(r.result.subject);const id='scan-preview';const problem=scanToProblem(id,false);state.problems=state.problems.filter(x=>x.id!=='scan-preview');state.problems.unshift(problem);state.selectedProblemId=id;state.page='notebook';state.annotations=r.result.annotations||[];state.tutor=null;state.aiLoading=false;save();render();toast(`AI 辨識完成：你的作答 ${state.scanStudent.join('')||'未辨識'}，請先確認`)}catch(e){state.aiLoading=false;state.aiError=e.message;save();render();toast('AI 分析失敗：'+e.message)}}
function scanToProblem(id,confirmed){const a=state.scan||{};const sid=subjectIdFromText(a.subject);const first=a.concepts?.[0]||{};const corrections={};for(const c of a.corrections||[])if(c.label)corrections[String(c.label).toUpperCase()]=c.correctedStatement||c.original||'';return{id,subject:sid,title:(a.problemText||'AI 掃描題目').slice(0,32),concept:first.nameZh||a.subject||'待分類概念',conceptCode:first.code||sid.toUpperCase()+'-AI',chapter:first.chapterHint||subjectById(sid).chapters[0],student:[...state.scanStudent],correct:[...state.scanCorrect],mastery:confirmed?45:35,due:'今天',mistakeType:a.personalInsightSuggestion||'待確認錯因',attempts:1,problemText:a.problemText||'',options:(a.options||[]).map(o=>[String(o.label).toUpperCase(),o.text]),corrections,insight:a.personalInsightSuggestion||'',aiChapterHint:first.chapterHint||'',confirmed}}
function confirmScan(){const preview=problemById('scan-preview');if(!preview)return;preview.id=uid('scan');preview.student=[...state.scanStudent];preview.correct=[...state.scanCorrect];preview.confirmed=true;preview.title=(state.scan?.problemText||'AI 掃描題目').slice(0,32);state.problems=state.problems.filter(p=>p.id!=='scan-preview');state.problems.unshift(preview);state.selectedProblemId=preview.id;state.scanConfirmed=true;save();render();toast('已確認，現在才正式加入你的錯題歷史')}

async function aiRevise(label){const p=selectedProblem();if(!p)return;const option=(p.options||[]).find(o=>o[0]===label);if(!option)return;try{toast('AI 正在把這句最小幅度改成正確版本…');const r=await apiCall('/revise',{statement:option[1],problemText:p.problemText||''});p.corrections=p.corrections||{};p.corrections[label]=r.result.correctedStatement;save();render()}catch(e){toast('AI 修正失敗：'+e.message)}}
async function cleanInsight(){const p=selectedProblem();const text=$('#insightText')?.value.trim();if(!p||!text)return toast('先寫下你的想法');try{const r=await apiCall('/revise',{statement:`把以下學生個人錯因筆記去除口頭贅詞、保留原意，不要新增事實：${text}`,problemText:p.problemText||''});const cleaned=r.result.correctedStatement||text;$('#insightText').value=cleaned;toast('已整理；請確認仍是你自己的意思')}catch(e){toast('AI 整理失敗：'+e.message)}}
function editBookLocation(){const p=selectedProblem();if(!p)return;const v=prompt(`設定「${p.concept}」在你目前 ${activePublisher(p.subject)} 課本的位置，例如：第 2 章 3-1 / p.72–85`,p.bookLocation||'');if(v!==null){p.bookLocation=v.trim();save();render();toast('已保存這個概念的課本位置')}}
async function askTutor(question,rerender=true){const p=selectedProblem();if(!p)return toast('先選一題錯題');if(!question)return toast('先問一個問題');try{state.aiLoading=true;save();render();const body={problemText:p.problemText,question,studentAnswer:p.student,correctAnswer:p.correct};if(p.id.startsWith('scan-')&&state.scanBase64){body.imageBase64=state.scanBase64;body.mimeType=state.scanMime}const r=await apiCall('/tutor',body);state.tutor=r.result;state.annotations=r.result.annotations||[];state.aiLoading=false;save();render();toast('AI 已把提示放回題目工作區')}catch(e){state.aiLoading=false;save();render();toast('AI 家教失敗：'+e.message)}}
function checkReview(){const p=problemById(state.reviewProblemId)||selectedProblem();if(!p)return;state.reviewChecked=true;const ok=sameAnswers(state.reviewSelections,p.correct);p.mastery=clamp((p.mastery||50)+(ok?7:-3),10,99);p.due=ok?'3 天後':'明天';save();render();toast(ok?'答對了；掌握度上升':'還沒完全對；會更快排回來')}
function truthCheck(e){const expected=e.currentTarget.dataset.expected||'';const v=$('#truthAnswer')?.value.trim()||'';const fb=$('#truthFeedback');if(!fb)return;const ok=expected? v.toLowerCase().includes(expected.toLowerCase()):v.length>2;fb.innerHTML=ok?'<div class="callout success">✓ 有叫出來。記住的是修正後的正確版本。</div>':'<div class="callout warn">還不穩。先回想原本哪個字或概念被你改掉。</div>'}

async function loadCommunity(){state.communityLoading=true;save();render();try{state.community=await communityGet(activeSubject().name,'');state.communityLoading=false;save();render()}catch(e){state.communityLoading=false;save();render();toast('社群載入失敗：'+e.message)}}
async function postCommunity(){const text=$('#communityText')?.value.trim();if(!text)return toast('先寫點內容');try{await communityPost({action:'create',displayName:'林大同',body:text,subject:activeSubject().name,conceptCode:selectedProblem()?.conceptCode||''});toast('已發布到公開社群');await loadCommunity()}catch(e){toast('發布失敗：'+e.message)}}
async function markHelpful(id){if(!id)return;try{await communityPost({action:'helpful',id});toast('已標記「這讓我懂了」');await loadCommunity()}catch(e){toast('操作失敗：'+e.message)}}
function saveSettings(){state.syllabus.level=$('#levelSelect')?.value||state.syllabus.level;state.syllabus.grade=$('#gradeInput')?.value.trim()||state.syllabus.grade;$$('[data-publisher]').forEach(el=>state.syllabus.publishers[el.dataset.publisher]=el.value);save();render();toast('課綱與出版社已儲存')}
function exportData(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`wrongbook-backup-${todayISO()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('已匯出學習資料')}
async function importData(e){const f=e.target.files?.[0];if(!f)return;try{const obj=JSON.parse(await f.text());if(!obj||!Array.isArray(obj.problems))throw new Error('格式不正確');state={...state,...obj};save();render();toast('已匯入備份')}catch(err){toast('匯入失敗：'+err.message)}}

let drawing={canvas:null,ctx:null,paths:[],current:null,drawing:false,tool:'pen',key:''};
function initCanvas(problemId){const c=$('#drawCanvas');if(!c)return;drawing.canvas=c;drawing.key=problemId;const rect=c.getBoundingClientRect();const dpr=window.devicePixelRatio||1;c.width=Math.round(rect.width*dpr);c.height=Math.round(rect.height*dpr);drawing.ctx=c.getContext('2d');drawing.ctx.scale(dpr,dpr);drawing.ctx.lineCap='round';drawing.ctx.lineJoin='round';const all=JSON.parse(storageGet('wrongbook-v2-ink')||'{}');drawing.paths=all[problemId]||[];redrawCanvas();const pos=e=>{const r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};c.onpointerdown=e=>{c.setPointerCapture(e.pointerId);drawing.drawing=true;drawing.current={tool:drawing.tool,pts:[pos(e)]};drawing.paths.push(drawing.current)};c.onpointermove=e=>{if(!drawing.drawing)return;drawing.current.pts.push(pos(e));redrawCanvas()};c.onpointerup=()=>{drawing.drawing=false;saveInk()};$$('[data-tool]').forEach(b=>b.onclick=()=>{drawing.tool=b.dataset.tool;$$('[data-tool]').forEach(x=>x.classList.toggle('active',x===b))});$('[data-action="undoInk"]')?.addEventListener('click',()=>{drawing.paths.pop();redrawCanvas();saveInk()});$('[data-action="clearInk"]')?.addEventListener('click',()=>{drawing.paths=[];redrawCanvas();saveInk()})}
function redrawCanvas(){const c=drawing.canvas,ctx=drawing.ctx;if(!c||!ctx)return;const r=c.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);for(const p of drawing.paths){if(!p.pts||p.pts.length<2)continue;ctx.beginPath();ctx.strokeStyle=p.tool==='eraser'?'rgba(255,255,255,.96)':'#2a5fd2';ctx.lineWidth=p.tool==='eraser'?18:2.6;ctx.moveTo(p.pts[0].x,p.pts[0].y);for(const q of p.pts.slice(1))ctx.lineTo(q.x,q.y);ctx.stroke()}}
function saveInk(){let all={};try{all=JSON.parse(storageGet('wrongbook-v2-ink')||'{}')}catch{}all[drawing.key]=drawing.paths;storageSet('wrongbook-v2-ink',JSON.stringify(all))}

async function healthCheck(){try{const res=await fetch(API_BASE+'/health');state.aiOnline=res.ok;save();const dot=$('.ai-dot');if(dot)dot.style.background=res.ok?'var(--green)':'var(--red)'}catch{state.aiOnline=false;save()}}
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
render();healthCheck();if(state.page==='community')loadCommunity();
