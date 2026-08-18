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
  function loadScript(src,attr){if(document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute(attr,'1');document.body.appendChild(s)}
  loadScript('./iscanner-capture-v3.js?wb=20260818-1010','data-wb-iscanner-v3');
  loadScript('./iscanner-live-autocapture-v1.js?wb=20260818-1031','data-wb-iscanner-live');
  loadScript('./iscanner-highlight-bridge-v2.js?wb=20260818-1024','data-wb-iscanner-highlight-v2');
})();
