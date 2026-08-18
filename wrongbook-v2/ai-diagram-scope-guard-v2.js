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

  // Independent final visibility guard: it must load even if an optional diagram renderer fails.
  loadScript('wrongbookHumanVisibilityV22','./tutor-human-visibility-v22.js?wb=20260818-2059')
    .catch(err=>console.error('[Wrongbook human visibility guard]',err));

  // AI diagrams are opt-in. Load this independently so later async diagram renderers cannot
  // resurrect a sticky overlay or reveal a diagram before the user presses 「開始圖解」.
  loadScript('wrongbookAiDiagramOptInV1','./ai-diagram-opt-in-v1.js?wb=20260818-1')
    .catch(err=>console.error('[Wrongbook AI diagram opt-in guard]',err));

  loadScript('wrongbookAiDiagramScopeGuardV3','./ai-diagram-scope-guard-v3.js?wb=20260818-1124-full-card-1')
    .then(()=>loadScript('wrongbookAiDiagramStickerV5','./ai-diagram-sticker-v5.js?wb=20260818-1124-full-card-1'))
    .then(()=>loadScript('wrongbookTutorDiagramPageUxV19','./tutor-diagram-page-ux-v19.js?wb=20260818-1430'))
    .then(()=>loadScript('wrongbookTikzSpatialGeometryV1','./tikz-spatial-geometry-v1.js?wb=20260818-1527'))
    .catch(err=>console.error('[Wrongbook full-card sticker bootstrap]',err));

  window.__wrongbookAiDiagramScopeV2Compat={version:'2026-08-18-full-card-bootstrap-v22-human-visibility-diagram-opt-in',legacyV4Blocked:true,diagramPageUx:true,tikzSpatial:true,humanVisibilityGuard:true,diagramOptIn:true};
})();