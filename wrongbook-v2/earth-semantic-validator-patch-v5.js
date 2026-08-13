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
