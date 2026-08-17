// Page 3 CJK geometry/wording refinement. Preserve diagrams and body font size.
(function chemistryGsatPage3FixV7(){
  if(typeof CHEMISTRY_GSAT_PAGE_3==='undefined')return;
  const cs=CHEMISTRY_GSAT_PAGE_3.clusters||[];
  const mole=cs.find(c=>c.id==='mole'),solution=cs.find(c=>c.id==='solution'),calc=cs.find(c=>c.id==='calc');
  const q11=mole?.questions?.find(q=>q.n===11),q21=calc?.questions?.find(q=>q.n===21);
  if(q11)q11.prompt='利用「質量 ↔ {{0}} ↔ 粒子數」轉換，可把反應式係數連到實際質量。';
  if(q21)q21.prompt='檢查答案要確認反應式已配平、單位一致，且符合 {{0}}。';
  if(mole)mole.h=322;
  if(solution){solution.y=790;solution.h=342;}
  if(calc)calc.h=208;
  const oldConnect=chemConnectorLayer;
  chemConnectorLayer=function(){const id=document.querySelector?.('.chem-paper')?.dataset?.chemPaper||state.chemistryPageId;if(id!==CHEMISTRY_GSAT_PAGE_3.id)return oldConnect();return `<svg class="chem-connectors" viewBox="0 0 1000 1414" aria-hidden="true"><defs><marker id="chem-page-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs><path d="M500 437V450"/><path d="M500 775V788"/><path d="M500 1133V1146"/></svg>`};
})();
