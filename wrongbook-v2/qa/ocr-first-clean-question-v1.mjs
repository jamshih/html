import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const pre=read('on-device-image-preprocess-v2.js');
const hi=read('iscanner-highlight-bridge-v3.js');
const semantic=read('ocr-first-analysis-v1.js');
const display=read('ocr-clean-question-display-v1.js');
const persist=read('scan-persistence-lite-v1.js');
const loader=read('native-question-capture-source-align-v1.js');
const sw=read('sw.js');
const checks={
  highResolution:pre.includes('DEFAULT_MAX=2600')&&pre.includes('MAX_MAX=3200')&&pre.includes('no1500pxCap:true'),
  rebuildOriginal:hi.includes('rebuildHighResPage')&&hi.includes('state.scanOriginalImage'),
  ocrBeforeTrim:hi.includes("status(sel,'第一步：高解析 OCR'")&&hi.indexOf('const result=await ocr')<hi.indexOf('const analysis=cropNorm'),
  fullPromptFile:hi.includes('questionText')&&hi.includes('buildCleanFile')&&hi.includes('scanCleanFile=cleanFile.dataUrl'),
  printedFigurePreserved:hi.includes("b.kind==='printed_figure'")&&hi.includes('<image href='),
  uselessContentOmitted:hi.includes('analysisBounds')&&hi.includes('printedBounds'),
  secondStageNoFullPage:semantic.includes('fullPageVisionSecondPass:false')&&semantic.includes('figureOnlyWhenPresent:true'),
  ocrTextSource:semantic.includes('state.scanOCR.questionText')&&semantic.includes('result.problemText=String(state.scanOCR.questionText'),
  fullPromptNative:display.includes('fullPromptNativeText:true')&&display.includes('ocrq-prompt-text'),
  figureVisible:display.includes('題目的圖')&&display.includes('problemFiguresInline:true'),
  rawSecondary:display.includes('原始掃描對照')&&display.includes('rawScanSecondary:true'),
  cleanArtifactPersistence:persist.includes('cleanArtifactPersisted:true')&&persist.includes("state.scanBase64=''"),
  loaderOrder:['on-device-image-preprocess-v2.js','iscanner-highlight-bridge-v3.js','ocr-first-analysis-v1.js','ocr-clean-question-display-v1.js','scan-persistence-lite-v1.js'].every(x=>loader.includes(x)),
  cacheIncludes:['on-device-image-preprocess-v2.js','iscanner-highlight-bridge-v3.js','ocr-first-analysis-v1.js','ocr-clean-question-display-v1.js','ocr-clean-question-display-v1.css','scan-persistence-lite-v1.js'].every(x=>sw.includes(x))
};
for(const [k,v] of Object.entries(checks))console.log(`${v?'PASS':'FAIL'} ${k}`);
if(Object.values(checks).some(v=>!v))process.exit(1);
console.log('PASS OCR-first clean question contract');
