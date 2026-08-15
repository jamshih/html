// V5 concept explorer runtime compatibility: a generic fact stores the stable curriculum
// owner key (`subject:chapter:section:point`), while graph nodes use a UI-prefixed key.
// Expose both forms in the local tree map so fact review can open the exact concept directly.
(function(){
  if(typeof window.v5CeTree!=='function'||window.__v5ConceptOwnerAlias)return;
  window.__v5ConceptOwnerAlias=true;
  const base=window.v5CeTree;
  window.v5CeTree=function(subjectId){
    const tree=base(subjectId);
    for(const node of tree?.nodes||[]){
      if(node?.ownerKey&&!tree.byKey.has(node.ownerKey))tree.byKey.set(node.ownerKey,node);
    }
    return tree;
  };
  // Top-level functions in classic scripts resolve this mutable binding at call time.
  try{v5CeTree=window.v5CeTree}catch{}
})();
