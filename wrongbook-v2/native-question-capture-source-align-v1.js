// Final Wrong Book scan boot order: high-resolution preprocess -> scanner -> OCR -> clean question -> single stable tutor navigator.
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
  function revealTutorWhenStable(attempt=0){
    if(window.__wrongbookTutorNavVisualV16){
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        try{window.wrongbookTutorNavVisualQA?.()}catch{}
        document.documentElement.classList.add('wb-tutor-ready');
      }));
      return;
    }
    if(attempt<180)setTimeout(()=>revealTutorWhenStable(attempt+1),16);
  }
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

  // One tutor navigator owner. The tutor remains visibility:hidden (with final geometry reserved)
  // until V16 has normalized the DOM, so there is no loading-time navigator/frame handoff.
  loadScript('./tutor-nav-visual-v16.js?wb=20260818-1356','data-wb-tutor-nav-visual-v16');
  revealTutorWhenStable();
  loadScript('./tutor-workspace-unify-v13.js?wb=20260818-1356','data-wb-tutor-workspace-unify-v13');
  loadScript('./problem-context-isolation-v1.js?wb=20260818-1356','data-wb-problem-context-isolation-v1');
  loadScript('./tutor-frame-no-flash-v17.js?wb=20260818-1356','data-wb-tutor-frame-no-flash-v17');
  loadScript('./tutor-nav-paint-lock-v18.js?wb=20260818-1356','data-wb-tutor-nav-paint-lock-v18-loader');
  loadScript('./ink-history-v4.js?wb=20260818-1356','data-wb-ink-history-v4');
})();
