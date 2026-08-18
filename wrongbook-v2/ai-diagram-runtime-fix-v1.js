// Wrongbook — one-time migration for the new 1000x625 diagram contract.
(function(){
  if(window.__wrongbookAiDiagramRuntimeFixV1)return;
  window.__wrongbookAiDiagramRuntimeFixV1=true;
  const marker='wrongbook:diagram-cache-migrated:20260818-625';
  try{
    if(localStorage.getItem(marker)!=='1'){
      const stale=[];
      for(let i=0;i<localStorage.length;i++){
        const key=localStorage.key(i);
        if(key&&key.startsWith('wrongbook:diagram-spec:v1:'))stale.push(key);
      }
      stale.forEach(key=>localStorage.removeItem(key));
      localStorage.setItem(marker,'1');
      window.__wrongbookDiagramCacheMigration={cleared:stale.length,done:true};
    }
  }catch{}
  const style=document.createElement('style');
  style.textContent='.wb-dd-svg text{fill:#282724!important;stroke:none!important;paint-order:normal!important}';
  document.head.appendChild(style);
})();