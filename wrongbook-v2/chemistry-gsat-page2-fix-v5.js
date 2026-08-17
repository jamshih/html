// GSAT Chemistry page-2 CJK wording refinement: same concepts/answers, less redundant prose.
(function chemistryGsatPage2CjkFix(){
  if(typeof CHEMISTRY_GSAT_PAGE_2==='undefined')return;
  const energy=CHEMISTRY_GSAT_PAGE_2.clusters?.find(c=>c.id==='energy');
  const bonding=CHEMISTRY_GSAT_PAGE_2.clusters?.find(c=>c.id==='bonding');
  const q5=energy?.questions?.find(q=>q.n===5);
  const q17=bonding?.questions?.find(q=>q.n===17);
  if(q5)q5.prompt='電池把 {{0}} 能轉為電能；燃燒常把化學能轉為 {{1}} 與光能。';
  if(q17)q17.prompt='比較 NaCl、H₂O 與金屬晶體時，應由「{{0}} → 結構 → 性質」建立因果關係。';
})();
