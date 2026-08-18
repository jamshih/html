// Keep AI region coordinates and the displayed/cropped source image in the same coordinate space.
(function(){
  if(window.__wrongbookNativeQuestionSourceAlignV1)return;
  window.__wrongbookNativeQuestionSourceAlignV1=true;
  if(typeof scanToProblem==='function'){
    const base=scanToProblem;
    scanToProblem=function(id,confirmed){
      const p=base(id,confirmed);
      if(p&&String(id||'').startsWith('scan-'))p.sourceImage=state.scanImage||p.sourceImage||'';
      return p;
    };
    try{window.scanToProblem=scanToProblem}catch{}
  }

  // This file is already the final production capture guard. Boot the scanner overhaul here
  // so it wins even when older app shells or cached bind() handlers still point at openCapture.
  const cssId='wrongbook-iscanner-capture-v2-css';
  if(!document.getElementById(cssId)){
    const link=document.createElement('link');link.id=cssId;link.rel='stylesheet';link.href='./iscanner-capture-v2.css?wb=20260818-1002';document.head.appendChild(link);
  }
  if(!document.querySelector('script[data-wb-iscanner-v2]')){
    const script=document.createElement('script');script.src='./iscanner-capture-v2.js?wb=20260818-1002';script.async=false;script.dataset.wbIscannerV2='1';document.body.appendChild(script);
  }
})();
