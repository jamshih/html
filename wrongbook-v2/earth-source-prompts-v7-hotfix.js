// Small transcription/data-shape corrections applied after all prompt manifests and before the v7 prompt renderer.
(function(){
 const M=window.SOURCE_PROMPTS_V7||{};
 const q=(page,n)=>M[page]?.find(x=>x.number===n);
 let r=q(243,35); if(r){r.sourceAnswers=['母元素衰變為原來二分之一所需時間'];r.answerAliases=[['母元素數量衰變為原來一半所需時間']];}
 r=q(243,36); if(r)r.dropOldAlias=true;
 r=q(243,37); if(r)r.dropOldAlias=true;
 r=q(245,31); if(r){r.replaceFields=true;r.keepOldAsAliases=false;}
 r=q(245,32); if(r){r.replaceFields=true;r.keepOldAsAliases=false;}
 r=q(245,50); if(r){r.replaceFields=true;r.keepOldAsAliases=false;}
 // Annual-motion source panel carries two/three/two blanks; normalized data had one each.
 for(const n of [10,11,12]){r=q(246,n);if(r){r.replaceFields=true;r.keepOldAsAliases=false;r.ensureFields=false;}}
 r=q(246,13); if(r){r.replaceFields=true;r.keepOldAsAliases=false;r.ensureFields=false;r.answerAliases=[[],['夏季']];}
 r=q(247,18); if(r){r.replaceFields=true;r.keepOldAsAliases=false;r.ensureFields=false;}
 r=q(247,19); if(r){r.replaceFields=true;r.keepOldAsAliases=false;r.ensureFields=false;}
 r=q(247,20); if(r){r.replaceFields=true;r.keepOldAsAliases=false;r.ensureFields=false;}
 r=q(248,10); if(r){r.replaceFields=true;r.keepOldAsAliases=false;r.ensureFields=false;}
 r=q(248,11); if(r){r.replaceFields=true;r.keepOldAsAliases=false;r.ensureFields=false;}
})();
