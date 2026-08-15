// Final semantic corrections discovered by rendered QA.
V5_RELATIONS.add('feedback');
const v5C4=EARTH_SEMANTIC_MAPS.find(c=>c.number===4);
if(v5C4&&!v5NodeById(v5C4,'earthquake-event')){
 v5Node(v5C4,'earthquake-event',249,'地震事件',300,115,105,34,'#8b71a8','event',{questionArea:{x:300,y:155,w:10,h:10}});
 v5Edge(v5C4,'c4-e-event-location',249,'earthquake-event','earthquake-location','measured-by','同一地震事件可由多個測站的 P、S 波到時資料定位震央。','#5b83b6');
 v5Edge(v5C4,'c4-e-event-hazards',249,'earthquake-event','earthquake-hazards','results-in','地震事件可能造成海嘯、土壤液化等災害；這些是地震後果，不是 P、S 波力學的子類。','#8b71a8');
}

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

// Do not run a second historical E2E suite here. The former embedded runner predated the
// photographed-source renderer and asserted obsolete `.v5-recall/.v5-figure/.v5-edge-group`
// DOM counts. It also consumed `__v4StrictRunE2E`, preventing the final e2e-v4 suite from
// running. `e2e-v4.js` is now the single rendered historical regression runner; this file
// only patches semantic data/validation.
