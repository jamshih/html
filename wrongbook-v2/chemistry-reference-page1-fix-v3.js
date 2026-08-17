// CJK layout fix for Chemistry GSAT page 1.
// Keep the same concepts and answers, but remove redundant wording so the real Traditional Chinese font fits naturally.
(function chemistryPage1CjkPromptFix(){
  if(typeof CHEMISTRY_GSAT_PAGE_1==='undefined')return;
  const cluster=CHEMISTRY_GSAT_PAGE_1.clusters?.find(c=>c.id==='classification');
  if(!cluster)return;
  const q15=cluster.questions?.find(q=>q.n===15);
  const q16=cluster.questions?.find(q=>q.n===16);
  if(q15)q15.prompt='密度、熔點是不改變組成即可觀察的 {{0}} 性質；可燃性涉及生成新物質，屬 {{1}} 性質。';
  if(q16)q16.prompt='冰融化沒有新物質生成，屬 {{0}} 變化；鐵生鏽生成新物質，屬 {{1}} 變化。';
})();
