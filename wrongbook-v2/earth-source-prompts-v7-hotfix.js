// Small transcription/data-shape corrections applied after all prompt manifests and before the v7 prompt renderer.
(function(){
 const M=window.SOURCE_PROMPTS_V7||{};
 const q=(page,n)=>M[page]?.find(x=>x.number===n);
 let r=q(243,35); if(r){r.sourceAnswers=['母元素衰變為原來二分之一所需時間'];r.answerAliases=[['母元素數量衰變為原來一半所需時間']];}
 // Source 36/37 are daughter/mother respectively; the old normalized dataset had them reversed.
 r=q(243,36); if(r)r.dropOldAlias=true;
 r=q(243,37); if(r)r.dropOldAlias=true;
 // Source q13 has two blanks (冬至點 / 夏季); old normalized q13 only stored the season field.
 r=q(246,13); if(r){r.replaceFields=true;r.keepOldAsAliases=false;r.ensureFields=false;r.answerAliases=[[],['夏季']];}
 // Source p247 q18/q19 were reversed in the old normalized mapping.
 r=q(247,18); if(r){r.replaceFields=true;r.keepOldAsAliases=false;r.ensureFields=false;}
 r=q(247,19); if(r){r.replaceFields=true;r.keepOldAsAliases=false;r.ensureFields=false;}
 // Source q10/q11 have four blanks each; normalized data omitted the 大陸/海洋 first blank and shifted the rest.
 r=q(248,10); if(r){r.replaceFields=true;r.keepOldAsAliases=false;r.ensureFields=false;}
 r=q(248,11); if(r){r.replaceFields=true;r.keepOldAsAliases=false;r.ensureFields=false;}
})();
