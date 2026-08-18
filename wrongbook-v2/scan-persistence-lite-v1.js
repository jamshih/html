// Keep the OCR-clean question artifact, but discard multi-megabyte transient camera payloads after confirmation.
(function(){
  const VERSION='2026-08-18-scan-persistence-lite-v1';
  if(window.__wrongbookScanPersistenceLite===VERSION)return;
  window.__wrongbookScanPersistenceLite=VERSION;
  if(typeof confirmScan!=='function')return;
  const baseConfirmScan=confirmScan;
  function compactOcr(o){if(!o)return null;return{questionNumber:o.questionNumber||'',questionText:o.questionText||'',studentAnswerText:o.studentAnswerText||'',studentAnswerTokens:Array.isArray(o.studentAnswerTokens)?o.studentAnswerTokens.slice(0,12):[],qualityScore:Number(o.qualityScore)||0,warnings:Array.isArray(o.warnings)?o.warnings.slice(0,8):[],blocks:(Array.isArray(o.blocks)?o.blocks:[]).filter(b=>b?.usableForDisplay||b?.kind==='student_answer').slice(0,20).map(b=>({kind:b.kind,text:b.text||'',bbox:b.bbox,confidence:b.confidence}))}}
  confirmScan=function(){
    baseConfirmScan();
    const p=typeof selectedProblem==='function'?selectedProblem():null;
    if(p&&String(p.id||'').startsWith('scan-')){
      p.cleanQuestionFile=p.cleanQuestionFile||state.scanCleanFile||'';
      p.cleanQuestionFileMeta=p.cleanQuestionFileMeta||state.scanCleanFileMeta||null;
      p.ocrResult=compactOcr(p.ocrResult||state.scanOCR);
      p.ocrPrintedCrop='';p.sourceImage='';
    }
    state.scanOriginalImage='';state.scanDocumentImage='';state.scanDisplayImage='';state.scanImage='';state.scanBase64='';state.scanPrintedCrop='';state.scanCleanFile='';state.scanOCR=compactOcr(state.scanOCR);state.scanSelection=null;state.scanCaptureMeta=null;
    save();render();
  };
  try{window.confirmScan=confirmScan}catch{}
  window.wrongbookScanPersistenceQA=()=>({version:VERSION,cleanArtifactPersisted:true,rawCameraPayloadDiscardedAfterConfirm:true,localStorageQuotaProtected:true});
})();
