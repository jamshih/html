// Wrongbook — V4 compatibility shim.
// V4 used to bind the nested diagram and could move it independently from the visible card footer.
// The full-card contract now lives in Scope Guard V3 + Sticker V5.
(function(){
  if(window.__wrongbookAiDiagramStickerV4)return;
  window.__wrongbookAiDiagramStickerV4=true;

  function load(id,src){
    return new Promise((resolve,reject)=>{
      const existing=document.getElementById(id);
      if(existing){if(existing.dataset.loaded==='1'||(id.includes('ScopeGuardV3')&&window.__wrongbookAiDiagramScopeGuardV3)||(id.includes('StickerV5')&&window.__wrongbookAiDiagramStickerV5))return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}
      const s=document.createElement('script');s.id=id;s.src=src;s.async=false;s.onload=()=>{s.dataset.loaded='1';resolve()};s.onerror=reject;document.head.appendChild(s);
    });
  }

  document.querySelectorAll('.wb-ai-sticker-v4').forEach(el=>{
    el.classList.remove('wb-ai-sticker-v4','wb-ai-is-dragging');delete el.dataset.aiStickerDraggable;
    el.style.removeProperty('--wb-ai-sticker-x');el.style.removeProperty('--wb-ai-sticker-y');
  });

  load('wrongbookAiDiagramScopeGuardV3','./ai-diagram-scope-guard-v3.js?wb=20260818-1124-full-card-2')
    .then(()=>load('wrongbookAiDiagramStickerV5','./ai-diagram-sticker-v5.js?wb=20260818-1124-full-card-2'))
    .catch(err=>console.error('[Wrongbook V4 compatibility shim]',err));
})();