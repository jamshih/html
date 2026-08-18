// Wrongbook — compatibility bootstrap for the full-card AI sticker contract.
// V2 previously selected the smallest nested visual card. That split the diagram from its outer
// container/key-concept footer. V3 + Sticker V5 make the complete visible card one draggable unit.
(function(){
  if(window.__wrongbookAiDiagramScopeGuardV2)return;
  window.__wrongbookAiDiagramScopeGuardV2=true;

  // The parser loads ai-diagram-sticker-v4.js later. Block that legacy runtime before it can bind
  // pointer listeners to the nested SVG/diagram node.
  window.__wrongbookAiDiagramStickerV4=true;

  function loadScript(id,src){
    return new Promise((resolve,reject)=>{
      const existing=document.getElementById(id);
      if(existing){if(existing.dataset.loaded==='1')return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}
      const script=document.createElement('script');script.id=id;script.src=src;script.async=false;
      script.addEventListener('load',()=>{script.dataset.loaded='1';resolve()},{once:true});script.addEventListener('error',reject,{once:true});document.head.appendChild(script);
    });
  }

  loadScript('wrongbookAiDiagramScopeGuardV3','./ai-diagram-scope-guard-v3.js?wb=20260818-1124-full-card-1')
    .then(()=>loadScript('wrongbookAiDiagramStickerV5','./ai-diagram-sticker-v5.js?wb=20260818-1124-full-card-1'))
    .catch(err=>console.error('[Wrongbook full-card sticker bootstrap]',err));

  window.__wrongbookAiDiagramScopeV2Compat={version:'2026-08-18-full-card-bootstrap',legacyV4Blocked:true};
})();