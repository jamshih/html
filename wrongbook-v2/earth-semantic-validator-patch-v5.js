// Specialized SVGs are preferred. A type-aware figure built from the source figure's requiredParts is still rendered, not missing.
const v5RendererAwareValidate=v5SemanticValidate;
v5SemanticValidate=function(){
 const r=v5RendererAwareValidate();
 r.specializedFigureRenderers=0;r.semanticFallbackFigures=0;
 for(const sem of EARTH_SEMANTIC_MAPS)for(const f of sem.figures){if(V5_RENDERERS[f.renderer])r.specializedFigureRenderers++;else r.semanticFallbackFigures++;}
 delete r.missingRendererFigures;
 const blocking=['missingQuestionIds','duplicateQuestionIds','orphanQuestions','orphanConceptNodes','orphanRequiredFigures','orphanConnectors','connectorWithoutRelationMeaning','sourceRequiredFiguresMissing','unverifiedInventedFigures'];
 r.ok=r.totals.questions===V5_TOTAL&&blocking.every(k=>(r[k]||[]).length===0)&&v4RefValidateData().ok;
 return r;
};
window.v5SemanticValidate=v5SemanticValidate;

(async()=>{
 if(!window.__v4StrictRunE2E)return;window.__v4StrictRunE2E=false;
 const sleep=ms=>new Promise(r=>setTimeout(r,ms)),results=[],check=(name,ok,detail='')=>results.push({name,ok:Boolean(ok),detail});
 try{
  await sleep(420);const clickPage=async page=>{const t=document.querySelector(`.sidebar [data-page="${page}"]`)||document.querySelector(`.mobile-drawer [data-page="${page}"]`);if(!t)throw Error(`missing ${page}`);t.click();await sleep(240)};
  await clickPage('mindmap');const earth=document.querySelector('[data-subject="earth"]');if(!earth)throw Error('earth tab missing');earth.click();await sleep(300);
  const data=v4RefValidateData(),sem=v5SemanticValidate();check('276 prompts',data.ok&&data.total===276,JSON.stringify(data));check('semantic model',sem.ok,JSON.stringify(sem));check('six chapters',EARTH_SEMANTIC_MAPS.length===6);check('two fixed pages',document.querySelectorAll('[data-semantic-page]').length===2);check('question parents',[...document.querySelectorAll('.v5-recall')].every(x=>x.dataset.concept&&x.dataset.placementReason));check('figure parents',[...document.querySelectorAll('.v5-figure')].every(x=>x.dataset.concepts&&x.dataset.purpose));check('edge meaning',[...document.querySelectorAll('.v5-edge-group')].every(x=>x.dataset.edge&&x.dataset.relation&&x.dataset.reason));
  for(const k of ['orphanQuestions','orphanConceptNodes','orphanRequiredFigures','orphanConnectors','connectorWithoutRelationMeaning','sourceRequiredFiguresMissing','unverifiedInventedFigures'])check(k,(sem[k]||[]).length===0,JSON.stringify(sem[k]));
  check('chapter 1 count',document.querySelectorAll('.v5-recall').length===48);document.querySelector('[data-v4ref-chapter="2"]')?.click();await sleep(180);check('chapter 2 count',document.querySelectorAll('.v5-recall').length===50);check('chapter 2 max number',!document.querySelector('[data-question="51"]'));
  for(const n of [3,4,5,6]){document.querySelector(`[data-v4ref-chapter="${n}"]`)?.click();await sleep(150);check(`chapter ${n} count`,document.querySelectorAll('.v5-recall').length===V5_COUNTS[n]);check(`chapter ${n} figures`,document.querySelectorAll('.v5-figure').length===EARTH_SEMANTIC_MAPS[n-1].figures.length);check(`chapter ${n} edges`,document.querySelectorAll('.v5-edge-group').length===EARTH_SEMANTIC_MAPS[n-1].relations.length)}
  check('chapter 5 order',v4RefValidateData().ch5OrderOk);check('pan zoom',document.querySelectorAll('[data-v4ref-zoom]').length===4);document.querySelector('[data-v4ref-source="curriculum"]')?.click();await sleep(160);check('canonical curriculum',Boolean(document.querySelector('.v4tb-sheet')));await clickPage('notes');check('notes',document.body.innerText.includes('獨立筆記系統'));await clickPage('analytics');check('analytics',document.body.innerText.includes('最需要處理的概念'));await clickPage('settings');check('sync',document.body.innerText.includes('帳號與跨裝置同步'));
  const failed=results.filter(x=>!x.ok),box=document.createElement('pre');box.id='e2e-results';box.dataset.status=failed.length?'FAIL':'PASS';box.textContent=JSON.stringify({status:failed.length?'FAIL':'PASS',semantic:sem,results},null,2);document.body.appendChild(box);
 }catch(err){const box=document.createElement('pre');box.id='e2e-results';box.dataset.status='FAIL';box.textContent=JSON.stringify({status:'FAIL',error:String(err),results},null,2);document.body.appendChild(box)}
})();
