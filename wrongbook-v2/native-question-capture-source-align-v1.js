// Final Wrong Book scan boot order: high-resolution preprocess -> scanner -> highlighter -> OCR -> compact semantic AI -> clean question display.
(function(){
  if(window.__wrongbookNativeQuestionSourceAlignV2)return;
  window.__wrongbookNativeQuestionSourceAlignV2=true;
  if(typeof scanToProblem==='function'){
    const base=scanToProblem;
    scanToProblem=function(id,confirmed){const p=base(id,confirmed);if(p&&String(id||'').startsWith('scan-'))p.sourceImage=state.scanDisplayImage||state.scanImage||p.sourceImage||'';return p};
    try{window.scanToProblem=scanToProblem}catch{}
  }
  function loadStyle(href,id){if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;document.head.appendChild(l)}
  function loadScript(src,attr){if(document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute(attr,'1');document.body.appendChild(s)}
  loadStyle('./iscanner-capture-v2.css?wb=20260818-1124','wrongbook-iscanner-capture-v2-css');
  loadStyle('./ocr-clean-question-display-v1.css?wb=20260818-1124','wrongbook-ocr-clean-display-css');
  loadScript('./on-device-image-preprocess-v2.js?wb=20260818-1124','data-wb-preprocess-v2');
  loadScript('./iscanner-capture-v3.js?wb=20260818-1124','data-wb-iscanner-v3');
  loadScript('./iscanner-live-autocapture-v1.js?wb=20260818-1124','data-wb-iscanner-live');
  loadScript('./iscanner-highlight-bridge-v3.js?wb=20260818-1124','data-wb-ocr-first-highlight');
  loadScript('./ocr-first-analysis-v1.js?wb=20260818-1124','data-wb-ocr-first-analysis');
  loadScript('./ocr-clean-question-display-v1.js?wb=20260818-1124','data-wb-ocr-clean-display');
  loadScript('./scan-persistence-lite-v1.js?wb=20260818-1124','data-wb-scan-persistence-lite');
  loadScript('./tutor-clean-figure-v1.js?wb=20260818-1124','data-wb-tutor-clean-figure');
  loadScript('./tutor-workspace-unify-v13.js?wb=20260818-1203','data-wb-tutor-workspace-unify-v13');
})();
