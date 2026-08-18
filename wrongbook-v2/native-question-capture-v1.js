// Wrongbook — targeted question capture + native constructed-response question UI.
// Loaded last so this layer owns the upload/confirmation path without rewriting the legacy engine.
(function(){
  const VERSION='2026-08-18-native-question-capture-v1';
  if(window.__wrongbookNativeQuestionCapture===VERSION)return;
  window.__wrongbookNativeQuestionCapture=VERSION;
  if(typeof openCapture!=='function'||typeof paperPanel!=='function'||typeof recognitionPanel!=='function')return;

  const DIAGRAM_API='https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1/wrongbook-diagram-ai';
  const API_KEY=typeof SUPABASE_PUBLISHABLE_KEY==='string'?SUPABASE_PUBLISHABLE_KEY:'';
  const baseOpenCapture=openCapture;
  const basePaperPanel=paperPanel;
  const baseRecognitionPanel=recognitionPanel;
  const baseScanToProblem=typeof scanToProblem==='function'?scanToProblem:null;
  const baseBind=typeof bind==='function'?bind:null;
  let pendingFile=null;
  let selectorUrl='';

  const clamp=(v,a=0,b=1)=>Math.min(Math.max(Number(v)||0,a),b);
  const escHtml=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const dataPart=url=>String(url||'').split(',')[1]||'';

  function fileKey(file){return [file?.name||'',file?.size||0,file?.lastModified||0].join(':')}
  function readFileUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(r.error||new Error('file_read_failed'));r.readAsDataURL(file)})}
  function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('image_decode_failed'));im.src=src})}
  function canvasBlob(canvas,type='image/jpeg',quality=.84){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('image_encode_failed')),type,quality))}

  function closeSelector(){document.getElementById('nqcTargetSelector')?.remove();if(selectorUrl){try{URL.revokeObjectURL(selectorUrl)}catch{}selectorUrl=''}}

  async function launchTargetSelector(file){
    if(!file||!file.type?.startsWith('image/'))return;
    pendingFile=file;
    closeSelector();
    selectorUrl=URL.createObjectURL(file);
    const modal=document.createElement('div');modal.id='nqcTargetSelector';modal.className='nqc-target-backdrop';
    modal.innerHTML=`<section class="nqc-target-shell" role="dialog" aria-modal="true" aria-label="圈出要辨識的題目"><header class="nqc-target-head"><div><h2>圈出你要整理的那一題</h2><p>用半透明畫筆塗過題號、題幹、題圖與你的作答。AI 只會讀你圈出的範圍。</p></div><button class="icon-btn" data-nqc-target-close aria-label="關閉">×</button></header><div class="nqc-target-stage"><img id="nqcTargetImage" alt="待圈選的題目照片"><canvas id="nqcTargetCanvas"></canvas><div class="nqc-target-tip">半透明畫筆 · 可以直接畫過題目</div></div><footer class="nqc-target-actions"><div class="nqc-target-tools"><button class="soft-btn" data-nqc-undo>↶ 上一步</button><button class="soft-btn" data-nqc-clear>清除</button><button class="text-btn" data-nqc-whole>整頁就是這題</button></div><button class="primary-btn" data-nqc-use disabled>使用圈選範圍</button></footer></section>`;
    document.body.appendChild(modal);
    const img=modal.querySelector('#nqcTargetImage'),canvas=modal.querySelector('#nqcTargetCanvas'),useBtn=modal.querySelector('[data-nqc-use]');
    img.src=selectorUrl;
    const strokes=[];let current=null;
    await new Promise(resolve=>{if(img.complete&&img.naturalWidth)resolve();else img.onload=resolve});
    const aspect=img.naturalHeight/Math.max(1,img.naturalWidth),cw=1200,ch=Math.max(300,Math.round(cw*aspect));canvas.width=cw;canvas.height=ch;
    function renderStrokes(){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,cw,ch);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.max(18,Math.round(cw*.026));ctx.strokeStyle='rgba(47,103,205,.32)';for(const stroke of strokes){if(!stroke.length)continue;ctx.beginPath();stroke.forEach((p,i)=>{const x=p.x*cw,y=p.y*ch;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});if(stroke.length===1){ctx.lineTo(stroke[0].x*cw+.1,stroke[0].y*ch+.1)}ctx.stroke()}useBtn.disabled=!strokes.some(s=>s.length)}
    function point(e){const r=canvas.getBoundingClientRect();return{x:clamp((e.clientX-r.left)/Math.max(1,r.width)),y:clamp((e.clientY-r.top)/Math.max(1,r.height))}}
    canvas.addEventListener('pointerdown',e=>{e.preventDefault();current=[point(e)];strokes.push(current);canvas.setPointerCapture?.(e.pointerId);renderStrokes()});
    canvas.addEventListener('pointermove',e=>{if(!current)return;e.preventDefault();const p=point(e),last=current[current.length-1];if(!last||Math.hypot((p.x-last.x)*cw,(p.y-last.y)*ch)>3){current.push(p);renderStrokes()}});
    const finish=()=>{current=null};canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
    modal.querySelector('[data-nqc-target-close]').onclick=closeSelector;
    modal.querySelector('[data-nqc-undo]').onclick=()=>{strokes.pop();renderStrokes()};
    modal.querySelector('[data-nqc-clear]').onclick=()=>{strokes.length=0;renderStrokes()};
    modal.querySelector('[data-nqc-whole]').onclick=()=>commitSelection(file,{x:0,y:0,width:1,height:1},[],true);
    useBtn.onclick=()=>{const pts=strokes.flat();if(!pts.length)return;let x1=1,y1=1,x2=0,y2=0;for(const p of pts){x1=Math.min(x1,p.x);y1=Math.min(y1,p.y);x2=Math.max(x2,p.x);y2=Math.max(y2,p.y)}const pad=.035;commitSelection(file,{x:clamp(x1-pad),y:clamp(y1-pad),width:clamp(x2-x1+pad*2,.04,1),height:clamp(y2-y1+pad*2,.04,1)},strokes,false)};
  }

  async function cropForDisplay(file,bbox){
    const raw=await readFileUrl(file),img=await loadImage(raw),sx=Math.round(bbox.x*img.naturalWidth),sy=Math.round(bbox.y*img.naturalHeight),sw=Math.max(1,Math.round(Math.min(1-bbox.x,bbox.width)*img.naturalWidth)),sh=Math.max(1,Math.round(Math.min(1-bbox.y,bbox.height)*img.naturalHeight));
    const maxSide=1450,scale=Math.min(1,maxSide/Math.max(sw,sh)),ow=Math.max(1,Math.round(sw*scale)),oh=Math.max(1,Math.round(sh*scale)),canvas=document.createElement('canvas');canvas.width=ow;canvas.height=oh;const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,ow,oh);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.filter='contrast(1.07) brightness(1.035)';ctx.drawImage(img,sx,sy,sw,sh,0,0,ow,oh);ctx.filter='none';return{dataUrl:canvas.toDataURL('image/jpeg',.82),canvas,width:ow,height:oh}}

  async function commitSelection(file,bbox,strokes,whole){
    const btn=document.querySelector('[data-nqc-use]');if(btn){btn.disabled=true;btn.textContent='正在清理影像…'}
    try{
      const display=await cropForDisplay(file,bbox),displayBlob=await canvasBlob(display.canvas,'image/jpeg',.9),analysisFile=new File([displayBlob],`selected-${file.name||'question.jpg'}`,{type:'image/jpeg',lastModified:Date.now()});
      const processed=typeof wbPreprocessImageFile==='function'?await wbPreprocessImageFile(analysisFile,1500,.84):{dataUrl:display.dataUrl,base64:dataPart(display.dataUrl),mimeType:'image/jpeg'};
      state.scanDisplayImage=display.dataUrl;state.scanImage=processed.dataUrl;state.scanBase64=processed.base64;state.scanMime=processed.mimeType||'image/jpeg';state.scanSelection={version:VERSION,fileKey:fileKey(file),bbox,whole:Boolean(whole),strokeCount:strokes.length,confirmed:true,preprocess:processed.preprocess||window.__wrongbookLastImagePreprocess||null};
      save();closeSelector();const prev=document.getElementById('capturePreview');if(prev){prev.src=display.dataUrl;prev.style.display='block'}const analyze=document.querySelector('#captureModal [data-action="analyzePhoto"]');if(analyze){analyze.disabled=false;analyze.textContent='辨識這一題'}toast('已圈出題目；AI 只會分析這個範圍');
    }catch(e){if(btn){btn.disabled=false;btn.textContent='使用圈選範圍'}toast('圈題處理失敗：'+(e?.message||e))}
  }

  openCapture=function(){
    baseOpenCapture();
    state.scanSelection=null;state.scanDisplayImage='';pendingFile=null;save();
    const input=document.getElementById('globalPhotoInput'),analyze=document.querySelector('#captureModal [data-action="analyzePhoto"]');
    if(analyze){analyze.disabled=true;analyze.textContent='先圈出題目';const oldAnalyze=analyze.onclick;analyze.onclick=()=>{if(!state.scanSelection?.confirmed){if(pendingFile)launchTargetSelector(pendingFile);else toast('請先拍照或選一張題目圖片');return}return oldAnalyze?.()}}
    if(input){const old=input.onchange;input.onchange=async e=>{state.scanSelection=null;state.scanDisplayImage='';pendingFile=e.target.files?.[0]||null;if(old)await old.call(input,e);if(pendingFile)await launchTargetSelector(pendingFile)}}
  };
  try{window.openCapture=openCapture}catch{}

  function tupleVariables(text){
    const s=String(text||'').replace(/（/g,'(').replace(/）/g,')');
    const candidates=[...s.matchAll(/\(\s*([A-Za-z][A-Za-z0-9']*(?:\s*,\s*[A-Za-z][A-Za-z0-9']*){1,5})\s*\)\s*(?:=|＝|為|是|\?|？)/g)];
    for(let i=candidates.length-1;i>=0;i--){const labels=candidates[i][1].split(',').map(x=>x.trim()).filter(Boolean);if(labels.length>=2&&labels.length<=6)return labels}
    return null;
  }
  function splitParts(values,arity){
    const vals=(Array.isArray(values)?values:[values]).map(v=>String(v??'').trim()).filter(Boolean);
    for(const v of vals){const m=v.replace(/（/g,'(').replace(/）/g,')').match(/\(([^()]+)\)/);if(m){const p=m[1].split(/[,，]/).map(x=>x.trim()).filter(Boolean);if(!arity||p.length===arity)return p}}
    if(arity&&vals.length===arity)return vals;
    if(arity&&vals.length===1){const p=vals[0].split(/[,，]/).map(x=>x.trim()).filter(Boolean);if(p.length===arity)return p}
    return arity?Array.from({length:arity},(_,i)=>vals[i]||''):vals.slice(0,1);
  }
  function inferAnswerSchema(problemText,questionType,student,correct){
    const labels=tupleVariables(problemText);if(labels){return{kind:'tuple',labels,arity:labels.length,template:`(${labels.join(', ')}) = (${labels.map(()=> '__').join(', ')})`,studentParts:splitParts(student,labels.length),correctParts:splitParts(correct,labels.length)}}
    const qt=String(questionType||'');if(qt==='single_choice'||qt==='multiple_choice')return{kind:qt};
    const text=String(problemText||'');
    if(/座標|坐標/.test(text)){const arity=/空間|三維|三次元|\(x\s*,\s*y\s*,\s*z\)/i.test(text)?3:2;const labels2=arity===3?['x','y','z']:['x','y'];return{kind:'coordinates',labels:labels2,arity,template:`(${labels2.join(', ')}) = (${labels2.map(()=> '__').join(', ')})`,studentParts:splitParts(student,arity),correctParts:splitParts(correct,arity)}}
    if(qt==='numeric'||/(數值|多少|長度|面積|體積|機率|斜率|角度|求\s*\w+\s*[=＝]?)/.test(text))return{kind:'numeric',labels:['答案'],arity:1,template:'答案 = __',studentParts:splitParts(student,1),correctParts:splitParts(correct,1)};
    if(/方程式|函數|式子|表示式|關係式|化簡|因式分解/.test(text))return{kind:'expression',labels:['式子'],arity:1,template:'答案：__',studentParts:splitParts(student,1),correctParts:splitParts(correct,1)};
    return{kind:'written',labels:['作答'],arity:1,template:'作答：__',studentParts:splitParts(student,1),correctParts:splitParts(correct,1)};
  }
  window.wbInferAnswerSchema=inferAnswerSchema;

  if(baseScanToProblem){
    scanToProblem=function(id,confirmed){
      const p=baseScanToProblem(id,confirmed),a=state.scan||{};p.answerSchema=inferAnswerSchema(a.problemText||p.problemText,a.questionType,state.scanStudent,state.scanCorrect);p.sourceImage=state.scanDisplayImage||state.scanImage||p.sourceImage||'';p.sourceSelection=state.scanSelection||null;p.scanQuestionType=a.questionType||'';p.figureMeta=figureMeta(p,a);return p;
    };
    try{window.scanToProblem=scanToProblem}catch{}
  }

  function regionUnion(regions){if(!regions.length)return null;let x1=100,y1=100,x2=0,y2=0,confidence=1;for(const r of regions){const b=r.bbox||{};x1=Math.min(x1,Number(b.x)||0);y1=Math.min(y1,Number(b.y)||0);x2=Math.max(x2,(Number(b.x)||0)+(Number(b.width)||0));y2=Math.max(y2,(Number(b.y)||0)+(Number(b.height)||0));confidence=Math.min(confidence,Number(r.confidence)||0)}return{x:clamp(x1/100)*100,y:clamp(y1/100)*100,width:clamp((x2-x1)/100)*100,height:clamp((y2-y1)/100)*100,confidence}}
  function figureMeta(p,a=state.scan||{}){
    const rs=(Array.isArray(p?.regions)?p.regions:Array.isArray(a?.regions)?a.regions:[]).filter(r=>/^(diagram|graph|axis|table)$/i.test(String(r?.kind||''))&&r?.bbox);
    if(!rs.length)return{present:false};const diagram=rs.filter(r=>/^(diagram|graph|axis)$/i.test(String(r.kind))),table=rs.some(r=>String(r.kind)==='table'),box=regionUnion(diagram.length?diagram:rs);return{present:true,bbox:box,confidence:box?.confidence||0,kind:table&&!diagram.length?'table':diagram.some(r=>String(r.kind)==='graph')?'graph':'diagram',redrawEligible:Boolean(diagram.length&&!table&&(box?.confidence||0)>=.48)}
  }

  function nativeQuestionPanel(p){
    const isScan=p?.id?.startsWith('scan-');if(!isScan)return'';const meta=p.figureMeta?.present?p.figureMeta:figureMeta(p),src=p.sourceImage||state.scanDisplayImage||state.scanImage||'',bbox=meta.bbox||null;
    const figure=meta.present&&src?`<div class="nqc-native-figure" data-nqc-figure-card><div class="nqc-native-subhead"><strong>題目的圖</strong><div class="nqc-figure-tabs"><button class="nqc-tab active" data-nqc-figure-view="source">原圖</button>${meta.redrawEligible?'<button class="nqc-tab" data-nqc-figure-view="redraw">AI 忠實重繪</button>':''}</div></div><div class="nqc-source-figure" data-nqc-source-wrap><canvas data-nqc-figure-crop data-src="${escHtml(src)}" data-bbox="${escHtml(JSON.stringify(bbox))}"></canvas></div>${meta.redrawEligible?`<div class="nqc-redraw-wrap" data-nqc-redraw-wrap hidden><div class="nqc-redraw-stage" data-nqc-redraw-stage><div class="nqc-redraw-loading">AI 正在依原圖重繪…</div></div><div class="nqc-figure-status" data-nqc-figure-status>只有在 AI 能忠實保留原圖關係時才會取代裁切圖。</div></div>`:''}</div>`:'';
    return `<section class="panel nqc-native-question" data-nqc-native-question="${escHtml(p.id)}"><div class="panel-head"><h3>題目</h3><span class="meta">由掃描重建 · 原圖仍可對照</span></div><div class="nqc-question-body"><div class="nqc-question-text">${escHtml(p.problemText||p.title||'')}</div>${figure}</div></section>`;
  }

  paperPanel=function(p){const base=basePaperPanel(p);if(!p?.id?.startsWith('scan-'))return base;return nativeQuestionPanel(p)+base.replace('原題就是工作紙','原始掃描對照').replace('AI 辨識文字：','掃描文字對照：')};
  try{window.paperPanel=paperPanel}catch{}

  function schemaFor(p){return p.answerSchema||inferAnswerSchema(p.problemText,p.scanQuestionType||state.scan?.questionType,p.id==='scan-preview'?state.scanStudent:p.student,p.id==='scan-preview'?state.scanCorrect:p.correct)}
  function structuredInputs(prefix,schema,values,editable){const labels=schema.labels||Array.from({length:schema.arity||1},(_,i)=>`答案 ${i+1}`),parts=splitParts(values,labels.length);if(labels.length>1)return `<div class="nqc-tuple" aria-label="${escHtml(prefix)}">${labels.map((l,i)=>`<label><span>${escHtml(l)}</span><input data-nqc-answer="${prefix}" data-nqc-index="${i}" value="${escHtml(parts[i]||'')}" ${editable?'':'readonly'} autocomplete="off" inputmode="text"></label>`).join('<b>,</b>')}</div>`;return `<input class="nqc-single-answer" data-nqc-answer="${prefix}" data-nqc-index="0" value="${escHtml(parts[0]||'')}" ${editable?'':'readonly'} autocomplete="off">`}
  recognitionPanel=function(p,labels,isScan){
    if(!isScan)return baseRecognitionPanel(p,labels,isScan);const schema=schemaFor(p);if(['single_choice','multiple_choice'].includes(schema.kind))return baseRecognitionPanel(p,labels,isScan);
    const preview=p.id==='scan-preview'&&!p.confirmed,student=preview?state.scanStudent:(p.student||[]),correct=preview?state.scanCorrect:(p.correct||[]),conf=Math.round(Number(state.scan?.recognizedAnswerConfidence||0)*100),cc=Math.round(Number(state.scan?.correctAnswerConfidence||0)*100);
    return `<section class="panel nqc-answer-panel"><div class="panel-head"><h3>答案格式辨識 ${preview?'· 必須確認':''}</h3><span class="meta">${preview?'依題幹期待的作答格式，不當成選擇題':'已確認紀錄'}</span></div><div class="nqc-answer-format"><div class="nqc-format-label">題目期待格式</div><strong>${escHtml(schema.template||'作答：__')}</strong></div><div class="recognition"><div class="recognition-row"><div class="recognition-label"><strong>你的作答</strong><span class="confidence">${preview?`${conf}% 信心`:'已確認'}</span></div>${structuredInputs('student',schema,student,preview)}</div><div class="recognition-row"><div class="recognition-label"><strong>正確答案</strong><span class="confidence">${preview?`${cc}% 信心`:'已確認'}</span></div>${structuredInputs('correct',schema,correct,preview)}</div>${preview&&state.scan?.recognitionNote?`<div class="callout warn" style="margin-top:10px">${escHtml(state.scan.recognitionNote)}</div>`:''}</div>${preview?'<div class="confirm-box"><button class="primary-btn" data-nqc-confirm>確認，開始弄懂這題</button></div>':''}</section>`;
  };
  try{window.recognitionPanel=recognitionPanel}catch{}

  function valuesFromInputs(kind){return [...document.querySelectorAll(`[data-nqc-answer="${kind}"]`)].sort((a,b)=>Number(a.dataset.nqcIndex)-Number(b.dataset.nqcIndex)).map(x=>x.value.trim()).filter((x,i,all)=>x||all.length===1)}
  function bindNative(){
    document.querySelector('[data-nqc-confirm]')?.addEventListener('click',()=>{state.scanStudent=valuesFromInputs('student');state.scanCorrect=valuesFromInputs('correct');const p=problemById('scan-preview');if(p){p.student=[...state.scanStudent];p.correct=[...state.scanCorrect];p.answerSchema=schemaFor(p)}save();confirmScan()});
    document.querySelectorAll('[data-nqc-answer]').forEach(x=>x.addEventListener('change',()=>{if(x.dataset.nqcAnswer==='student')state.scanStudent=valuesFromInputs('student');else state.scanCorrect=valuesFromInputs('correct');state.scanConfirmed=false;save()}));
    document.querySelectorAll('[data-nqc-figure-view]').forEach(btn=>btn.addEventListener('click',()=>{const card=btn.closest('[data-nqc-figure-card]');if(!card)return;card.querySelectorAll('[data-nqc-figure-view]').forEach(b=>b.classList.toggle('active',b===btn));const redraw=btn.dataset.nqcFigureView==='redraw';card.querySelector('[data-nqc-source-wrap]')?.toggleAttribute('hidden',redraw);card.querySelector('[data-nqc-redraw-wrap]')?.toggleAttribute('hidden',!redraw);if(redraw)requestFigureRedraw(card)}));
    paintFigureCrops();
  }
  if(baseBind){bind=function(){baseBind();bindNative()};try{window.bind=bind}catch{}}

  async function paintFigureCrops(){for(const c of document.querySelectorAll('[data-nqc-figure-crop]')){if(c.dataset.painted)return;c.dataset.painted='1';try{const img=await loadImage(c.dataset.src),b=JSON.parse(c.dataset.bbox||'{}'),sx=Math.max(0,Math.round((Number(b.x)||0)/100*img.naturalWidth)),sy=Math.max(0,Math.round((Number(b.y)||0)/100*img.naturalHeight)),sw=Math.max(1,Math.round((Number(b.width)||100)/100*img.naturalWidth)),sh=Math.max(1,Math.round((Number(b.height)||100)/100*img.naturalHeight)),scale=Math.min(1,1000/Math.max(sw,sh));c.width=Math.max(1,Math.round(sw*scale));c.height=Math.max(1,Math.round(sh*scale));const ctx=c.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(img,sx,sy,Math.min(sw,img.naturalWidth-sx),Math.min(sh,img.naturalHeight-sy),0,0,c.width,c.height)}catch(e){c.closest('[data-nqc-source-wrap]')?.classList.add('nqc-figure-failed')}}}

  async function cropFigureData(canvas){if(!canvas?.width)return null;const max=1050,scale=Math.min(1,max/Math.max(canvas.width,canvas.height)),out=document.createElement('canvas');out.width=Math.max(1,Math.round(canvas.width*scale));out.height=Math.max(1,Math.round(canvas.height*scale));const ctx=out.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,out.width,out.height);ctx.drawImage(canvas,0,0,out.width,out.height);const url=out.toDataURL('image/jpeg',.84);return{base64:dataPart(url),mimeType:'image/jpeg'}}
  async function requestFigureRedraw(card){
    const host=card.querySelector('[data-nqc-redraw-stage]');if(!host||host.dataset.requested)return;host.dataset.requested='1';const status=card.querySelector('[data-nqc-figure-status]'),sourceCanvas=card.querySelector('[data-nqc-figure-crop]'),p=typeof selectedProblem==='function'?selectedProblem():null;if(!p)return;
    try{const source=await cropFigureData(sourceCanvas);if(!source)throw new Error('source_crop_unavailable');const res=await fetch(DIAGRAM_API,{method:'POST',headers:{'content-type':'application/json',apikey:API_KEY},body:JSON.stringify({subject:p.subject,title:p.title,concept:p.concept,problemText:p.problemText,sourceFigureBase64:source.base64,sourceFigureMimeType:source.mimeType,mode:'source-reproduction'})}),data=await res.json();if(!res.ok||!data?.result?.elements?.length)throw new Error(data?.detail||data?.error||`HTTP ${res.status}`);const spec=data.result;if(spec.sourceFaithful!==true||Number(spec.confidence||0)<.7)throw new Error('low_source_fidelity');if(typeof wbRenderDiagramSpec!=='function')throw new Error('renderer_unavailable');wbRenderDiagramSpec(host,spec,{subject:p.subject,title:'題目的圖',concept:p.concept,problemText:p.problemText});if(status)status.textContent=`AI 忠實重繪 · 信心 ${Math.round(Number(spec.confidence)*100)}% · 可隨時切回原圖`;host.dataset.reproduced='1'}catch(e){if(status)status.textContent='AI 無法可靠重繪這張題圖，因此保留原圖，不會猜。';card.querySelector('[data-nqc-source-wrap]')?.removeAttribute('hidden');card.querySelector('[data-nqc-redraw-wrap]')?.setAttribute('hidden','');card.querySelectorAll('[data-nqc-figure-view]').forEach(b=>b.classList.toggle('active',b.dataset.nqcFigureView==='source'));host.dataset.failed='1'}}

  window.wrongbookNativeQuestionCaptureQA=function(){
    const tuple=inferAnswerSchema('若此平面方程式為 3x+by+cz+d=0，則 (r, s, d)=？','written',['(-7,2,33)'],['(-4,11,-5)']);
    const choice=inferAnswerSchema('下列何者正確？','single_choice',['B'],['C']);
    const selected=state.scanSelection||{};
    return{version:VERSION,targetingInstalled:typeof openCapture==='function',semiTransparentBrush:true,brushOpacity:.32,selectionRequiredBeforeAnalyze:true,selectedRegionConfirmed:Boolean(selected.confirmed),selectedCropPreprocessed:Boolean(selected.preprocess),nativeQuestionRenderer:paperPanel!==basePaperPanel,structuredAnswerRenderer:recognitionPanel!==baseRecognitionPanel,tupleFixtureKind:tuple.kind,tupleFixtureLabels:tuple.labels,tupleFixtureArity:tuple.arity,choiceStillUsesChoiceUI:choice.kind==='single_choice',diagramSourceCrop:true,diagramFaithfulnessThreshold:.7,diagramFallbackToSource:true,diagramEndpointMode:'source-faithful-multimodal'};
  };

  try{render()}catch(e){console.warn('[native-question-capture] initial render',e)}
})();
