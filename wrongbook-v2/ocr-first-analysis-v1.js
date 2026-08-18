// Wrong Book semantic analysis after OCR.
// Avoids paying a second full-page vision bill: the AI receives OCR text, plus only an extracted printed figure when the problem truly has one.
(function(){
  const VERSION='2026-08-18-ocr-first-analysis-v1';
  if(window.__wrongbookOCRFirstAnalysis===VERSION)return;
  window.__wrongbookOCRFirstAnalysis=VERSION;
  if(typeof analyzePhoto!=='function'||typeof scanToProblem!=='function')return;
  const baseAnalyzePhoto=analyzePhoto;
  const API='https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1/wrongbook-semantic-ai';
  const API_KEY=typeof SUPABASE_PUBLISHABLE_KEY==='string'?SUPABASE_PUBLISHABLE_KEY:'';

  function extractFigure(){
    const url=String(state.scanCleanFile||'');
    if(!url.startsWith('data:image/svg+xml'))return null;
    try{
      const svg=decodeURIComponent(url.slice(url.indexOf(',')+1));
      const m=svg.match(/<image\s+href="(data:image\/(?:jpeg|jpg|png|webp);base64,[^"]+)"/i);
      if(!m)return null;
      const data=m[1],comma=data.indexOf(','),head=data.slice(0,comma),base64=data.slice(comma+1),mime=(head.match(/^data:([^;]+)/)||[])[1]||'image/jpeg';
      return{base64,mime};
    }catch{return null}
  }
  async function callSemantic(){
    const figure=extractFigure();
    const body={ocr:state.scanOCR||{},syllabus:state.syllabus||{}};
    if(figure){body.visualBase64=figure.base64;body.visualMimeType=figure.mime}
    const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json','apikey':API_KEY},body:JSON.stringify(body)});
    const data=await r.json().catch(()=>({}));if(!r.ok||!data?.result)throw new Error(data?.error||'semantic_analysis_failed');
    return data;
  }
  analyzePhoto=async function(){
    if(!state.scanOCR?.questionText)return baseAnalyzePhoto();
    state.aiLoading=true;state.aiError='';try{render()}catch{}
    try{
      const data=await callSemantic(),result=data.result||{};
      result.problemText=String(state.scanOCR.questionText||result.problemText||'').trim();
      if(Array.isArray(state.scanOCR.studentAnswerTokens)&&state.scanOCR.studentAnswerTokens.length)result.recognizedUserAnswer=[...state.scanOCR.studentAnswerTokens];
      else if(state.scanOCR.studentAnswerText&&!Array.isArray(result.recognizedUserAnswer))result.recognizedUserAnswer=[String(state.scanOCR.studentAnswerText)];
      result.ocrQuality=Number(state.scanOCR.qualityScore)||0;result.ocrWarnings=Array.isArray(state.scanOCR.warnings)?state.scanOCR.warnings:[];
      state.scan=result;state.scanStudent=(result.recognizedUserAnswer||[]).map(x=>String(x));state.scanCorrect=(result.correctAnswer||[]).map(x=>String(x));state.scanConfirmed=false;state.subject=typeof subjectIdFromText==='function'?subjectIdFromText(result.subject):state.subject;
      const id='scan-preview',problem=scanToProblem(id,false);state.problems=state.problems.filter(x=>x.id!==id);state.problems.unshift(problem);state.selectedProblemId=id;state.page='notebook';state.annotations=result.annotations||[];state.tutor=null;state.aiLoading=false;state.scanSemanticMeta={version:VERSION,mode:data.mode||'ocr-text-first',model:data.model||'',visualUsed:Boolean(data.visualUsed),fullPageVisionSecondPass:false};save();render();toast(`OCR + 題目分析完成${data.visualUsed?' · 只另送題圖':' · 第二階段沒有再送圖片'}`);
    }catch(e){state.aiLoading=false;state.aiError=e?.message||String(e);save();try{render()}catch{}toast('OCR 後題目分析失敗：'+(e?.message||e))}
  };
  try{window.analyzePhoto=analyzePhoto}catch{}
  window.wrongbookOCRCostQA=()=>({version:VERSION,ocrFirst:true,fullPageVisionSecondPass:false,textOnlyWhenNoFigure:true,figureOnlyWhenPresent:true,semanticEndpoint:'wrongbook-semantic-ai',ocrTextIsPromptSource:true});
})();
