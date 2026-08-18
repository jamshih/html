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
  const cssId='wrongbook-iscanner-capture-v2-css';
  if(!document.getElementById(cssId)){
    const link=document.createElement('link');link.id=cssId;link.rel='stylesheet';link.href='./iscanner-capture-v2.css?wb=20260818-1002';document.head.appendChild(link);
  }
  if(!document.querySelector('script[data-wb-iscanner-v3]')){
    const script=document.createElement('script');script.src='./iscanner-capture-v3.js?wb=20260818-1010';script.async=false;script.dataset.wbIscannerV3='1';document.body.appendChild(script);
  }
})();
