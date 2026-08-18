// Keep AI region coordinates and the displayed/cropped source image in the same coordinate space.
(function(){
  if(window.__wrongbookNativeQuestionSourceAlignV1)return;
  window.__wrongbookNativeQuestionSourceAlignV1=true;
  if(typeof scanToProblem!=='function')return;
  const base=scanToProblem;
  scanToProblem=function(id,confirmed){
    const p=base(id,confirmed);
    if(p&&String(id||'').startsWith('scan-'))p.sourceImage=state.scanImage||p.sourceImage||'';
    return p;
  };
  try{window.scanToProblem=scanToProblem}catch{}
})();
