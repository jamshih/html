// Small transcription correction applied after prompt manifests and before the v7 prompt renderer.
(function(){
 const m=window.SOURCE_PROMPTS_V7?.[243];
 const q=m?.find(x=>x.number===35);
 if(q){
   q.sourceAnswers=['母元素衰變為原來二分之一所需時間'];
   q.answerAliases=[['母元素數量衰變為原來一半所需時間']];
 }
})();
