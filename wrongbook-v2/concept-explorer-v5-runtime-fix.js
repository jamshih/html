// V5 concept explorer runtime compatibility and search lifecycle fixes.
(function(){
  if(window.__v5ConceptRuntimeFix)return;window.__v5ConceptRuntimeFix=true;

  // Generic facts store a stable curriculum owner key (`subject:chapter:section:point`),
  // while graph nodes also carry a UI-prefixed key. Expose both forms locally.
  if(typeof window.v5CeTree==='function'){
    const treeBase=window.v5CeTree;
    window.v5CeTree=function(subjectId){
      const tree=treeBase(subjectId);
      for(const node of tree?.nodes||[])if(node?.ownerKey&&!tree.byKey.has(node.ownerKey))tree.byKey.set(node.ownerKey,node);
      return tree;
    };
    try{v5CeTree=window.v5CeTree}catch{}
  }

  // Selecting a search result must dismiss its overlay. Otherwise, on portrait tablets the
  // still-open results can sit above the sticky pane tabs and intercept the next tap.
  if(typeof window.v5CeBindSearchResults==='function'){
    const bindBase=window.v5CeBindSearchResults;
    window.v5CeBindSearchResults=function(box){
      bindBase(box);
      box?.querySelectorAll('[data-ce-search-result]').forEach(el=>{
        const choose=el.onclick;
        el.onclick=event=>{
          const ce=typeof window.v5CeState==='function'?window.v5CeState():state.conceptExplorer;
          if(ce)ce.query='';
          return choose?.call(el,event);
        };
      });
    };
    try{v5CeBindSearchResults=window.v5CeBindSearchResults}catch{}
  }

  // V6 keeps the existing concept data/review logic, but replaces the deeply nested visual
  // explorer with a shallow navigator and a sparse Obsidian-style graph. Load it separately
  // so the redesign can be rolled back without touching the curriculum or study engine.
  const realmStamp='20260817-1';
  if(!document.querySelector('link[data-concept-realm-v6]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=`./concept-realm-v6.css?wb=${realmStamp}`;
    link.dataset.conceptRealmV6='1';
    document.head.appendChild(link);
  }
  if(!window.__wrongbookConceptRealmV6&&!document.querySelector('script[data-concept-realm-v6]')){
    const script=document.createElement('script');
    script.src=`./concept-realm-v6.js?wb=${realmStamp}`;
    script.async=false;
    script.dataset.conceptRealmV6='1';
    script.onerror=()=>console.error('[concept-realm-v6] failed to load');
    document.body.appendChild(script);
  }
})();