// GSAT Chemistry page-2 CJK wording/geometry refinement: same concepts and answers, no font shrinking.
(function chemistryGsatPage2CjkFix(){
  if(typeof CHEMISTRY_GSAT_PAGE_2==='undefined')return;
  const clusters=CHEMISTRY_GSAT_PAGE_2.clusters||[];
  const energy=clusters.find(c=>c.id==='energy');
  const separation=clusters.find(c=>c.id==='separation');
  const bonding=clusters.find(c=>c.id==='bonding');
  const gas=clusters.find(c=>c.id==='gas');
  const q5=energy?.questions?.find(q=>q.n===5);
  const q17=bonding?.questions?.find(q=>q.n===17);
  if(q5)q5.prompt='電池把 {{0}} 能轉為電能；燃燒常把化學能轉為 {{1}} 與光能。';
  if(q17)q17.prompt='比較 NaCl、H₂O 與金屬晶體時，應由「{{0}} → 結構 → 性質」建立因果關係。';

  // Reflow the photographed sheet vertically. Keep the full-size diagrams and readable 12.7–12.8 px body text.
  if(energy)energy.h=292;
  if(separation)separation.y=452;
  if(bonding){bonding.y=804;bonding.h=322;}
  if(gas){gas.y=1130;gas.h=218;}

  const previousConnectorLayer=chemConnectorLayer;
  chemConnectorLayer=function(){
    const targetId=document.querySelector?.('.chem-paper')?.dataset?.chemPaper||state.chemistryPageId;
    if(targetId!==CHEMISTRY_GSAT_PAGE_2.id)return previousConnectorLayer();
    return `<svg class="chem-connectors" viewBox="0 0 1000 1414" aria-hidden="true"><defs><marker id="chem-page-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs><path d="M500 447V450"/><path d="M500 789V802"/><path d="M500 1127V1129"/></svg>`;
  };
})();
