// Wrong Book: OCR-cleaned question file is the primary worksheet display.
(function(){
  const VERSION='2026-08-18-ocr-clean-question-display-v1';
  if(window.__wrongbookOCRCleanQuestionDisplay===VERSION)return;
  window.__wrongbookOCRCleanQuestionDisplay=VERSION;
  if(typeof paperPanel!=='function'||typeof scanToProblem!=='function')return;
  const basePaperPanel=paperPanel,baseScanToProblem=scanToProblem;
  const escH=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function embeddedFigures(dataUrl){
    if(!String(dataUrl||'').startsWith('data:image/svg+xml'))return[];
    try{const svg=decodeURIComponent(String(dataUrl).slice(String(dataUrl).indexOf(',')+1)),out=[];for(const m of svg.matchAll(/<image\s+href="(data:image\/(?:jpeg|jpg|png|webp);base64,[^"]+)"/gi))out.push(m[1]);return out.slice(0,3)}catch{return[]}
  }
  scanToProblem=function(id,confirmed){
    const p=baseScanToProblem(id,confirmed);
    if(p&&String(id||'').startsWith('scan-')){
      p.cleanQuestionFile=state.scanCleanFile||p.cleanQuestionFile||'';
      p.cleanQuestionFileMeta=state.scanCleanFileMeta||p.cleanQuestionFileMeta||null;
      p.ocrPrintedCrop=state.scanPrintedCrop||p.ocrPrintedCrop||'';
      p.ocrResult=state.scanOCR||p.ocrResult||null;
      p.sourceImage=state.scanDisplayImage||state.scanImage||p.sourceImage||'';
    }
    return p;
  };
  try{window.scanToProblem=scanToProblem}catch{}

  function qualityBadge(p){const q=Math.round(100*Number(p?.cleanQuestionFileMeta?.qualityScore??state.scanOCR?.qualityScore??0));return `<span class="ocrq-quality ${q&&q<72?'warn':''}">${q?`OCR ${q}%`:'OCR 清理版'}</span>`}
  function cleanFileFor(p){return p?.cleanQuestionFile||((String(p?.id||'').startsWith('scan-'))?state.scanCleanFile:'')||''}
  function rawFor(p){return p?.ocrPrintedCrop||((String(p?.id||'').startsWith('scan-'))?state.scanPrintedCrop:'')||p?.sourceImage||''}
  function warningsFor(p){const w=p?.cleanQuestionFileMeta?.warnings||p?.ocrResult?.warnings||[];return Array.isArray(w)?w.filter(Boolean).slice(0,4):[]}

  paperPanel=function(p){
    const file=cleanFileFor(p);if(!String(p?.id||'').startsWith('scan-')||(!file&&!p?.problemText))return basePaperPanel(p);
    const figs=embeddedFigures(file),raw=rawFor(p),warn=warningsFor(p),overlays=(state.annotations||[]).map(a=>`<div class="ai-overlay-note" style="left:${clamp(Number(a.x)||8,2,78)}%;top:${clamp(Number(a.y)||8,2,86)}%">${escH(a.text||'')}</div>`).join('');
    const main=file?`<img src="${file}" alt="OCR 清理後完整題目">`:`<div class="ocrq-native-fallback"><div class="prompt">${escH(p.problemText||'')}</div></div>`;
    return `<section class="panel ocrq-panel"><div class="panel-head"><div><h3>題目</h3><span class="meta">OCR 後排除鄰題、頁邊與無用背景</span></div>${qualityBadge(p)}</div><div class="ocrq-paper"><div class="ocrq-sheet" id="paper">${main}${overlays}<canvas id="drawCanvas" class="canvas-layer"></canvas><div class="ocrq-file-note"><strong>清楚題目檔</strong> · 完整題幹與題圖優先用這份；原始掃描只留作核對。</div><div class="ocrq-toolbar"><div class="toolset"><button class="tool active" data-tool="pen">✎</button><button class="tool" data-tool="eraser">⌫</button><button class="tool" data-action="undoInk">↶</button><button class="tool" data-action="clearInk">清除</button></div><div class="toolset"><button class="tool" data-action="aiOnPaper">✦ AI 在題目上提示</button></div></div></div></div>${figs.length?`<div class="ocrq-figure"><h4>題目的圖</h4>${figs.map((u,i)=>`<div class="ocrq-figure-frame" ${i?'style="margin-top:10px"':''}><img src="${u}" alt="題目的圖 ${i+1}"></div>`).join('')}</div>`:''}${warn.length?`<div class="ocrq-warnings">${warn.map(x=>`• ${escH(x)}`).join('<br>')}</div>`:''}${raw?`<details class="ocrq-source"><summary>原始掃描對照</summary><img src="${raw}" alt="原始題目掃描對照"></details>`:''}</section>`;
  };
  try{window.paperPanel=paperPanel}catch{}
  window.wrongbookOCRDisplayQA=()=>({version:VERSION,cleanFilePrimary:true,fullPrompt:true,problemFiguresSeparate:true,rawScanSecondary:true,usesVectorText:Boolean(state.scanCleanFile?.startsWith('data:image/svg+xml')),figureCount:embeddedFigures(state.scanCleanFile).length});
})();
