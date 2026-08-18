// For confirmed scanned questions, tutor from OCR text and only the extracted problem figure instead of the full camera image.
(function(){
  const VERSION='2026-08-18-tutor-clean-figure-v1';
  if(window.__wrongbookTutorCleanFigure===VERSION)return;
  window.__wrongbookTutorCleanFigure=VERSION;
  if(typeof askTutor!=='function')return;
  const baseAskTutor=askTutor;
  function figureFrom(file){if(!String(file||'').startsWith('data:image/svg+xml'))return null;try{const svg=decodeURIComponent(String(file).slice(String(file).indexOf(',')+1)),m=svg.match(/<image\s+href="data:(image\/(?:jpeg|jpg|png|webp));base64,([^"]+)"/i);return m?{mimeType:m[1],base64:m[2]}:null}catch{return null}}
  askTutor=async function(question,rerender=true){
    const p=typeof selectedProblem==='function'?selectedProblem():null;
    if(!p||!String(p.id||'').startsWith('scan-')||!p.cleanQuestionFile)return baseAskTutor(question,rerender);
    if(!question)return toast('先問一個問題');
    try{state.aiLoading=true;save();render();const body={problemText:p.problemText,question,studentAnswer:p.student,correctAnswer:p.correct},fig=figureFrom(p.cleanQuestionFile);if(fig){body.imageBase64=fig.base64;body.mimeType=fig.mimeType}const r=await apiCall('/tutor',body);state.tutor=r.result;state.annotations=r.result.annotations||[];state.aiLoading=false;save();render();toast(fig?'AI 家教只參考題目文字 + 題圖':'AI 家教只參考 OCR 題目文字')}
    catch(e){state.aiLoading=false;save();render();toast('AI 家教失敗：'+e.message)}
  };
  try{window.askTutor=askTutor}catch{}
  window.wrongbookTutorTokenQA=()=>({version:VERSION,fullCameraImage:false,textOnlyWithoutFigure:true,figureOnlyWhenNeeded:true});
})();
