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

  // V7 deliberately removes the graph/realm experiment. Concepts are now organized directly
  // by the Taiwan 108 curriculum: subject -> chapter -> section -> concept, with no graph view.
  const chapterStamp='20260817-1';
  if(!document.querySelector('link[data-concept-chapters-v7]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=`./concept-chapters-v7.css?wb=${chapterStamp}`;
    link.dataset.conceptChaptersV7='1';
    document.head.appendChild(link);
  }
  if(!window.__wrongbookConceptChaptersV7&&!document.querySelector('script[data-concept-chapters-v7]')){
    const script=document.createElement('script');
    script.src=`./concept-chapters-v7.js?wb=${chapterStamp}`;
    script.async=false;
    script.dataset.conceptChaptersV7='1';
    script.onerror=()=>console.error('[concept-chapters-v7] failed to load');
    document.body.appendChild(script);
  }

  // Keep the existing Earth-specific dedicated renderer. The generic legacy sticker loader was
  // intentionally removed: ai-diagram-sticker-v2.js is now the single drag owner, loaded directly
  // from index.html. Running V1 and V2 together caused competing pointer/portal behavior.
  const dedicatedDiagramStamp='20260817-2';
  if(!window.__wrongbookDedicatedAiDiagramsV1&&!document.querySelector('script[data-ai-dedicated-diagrams-v1]')){
    const script=document.createElement('script');
    script.src=`./ai-dedicated-diagrams-v1.js?wb=${dedicatedDiagramStamp}`;
    script.async=false;
    script.dataset.aiDedicatedDiagramsV1='1';
    script.onerror=()=>console.error('[ai-dedicated-diagrams-v1] failed to load');
    document.body.appendChild(script);
  }
})();