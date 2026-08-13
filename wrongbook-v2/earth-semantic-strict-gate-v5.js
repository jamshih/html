// Final acceptance gate: source inventory and dedicated renderers are mandatory.
const v5StrictPrevValidate=v5SemanticValidate;
v5SemanticValidate=function(){
 const r=v5StrictPrevValidate();
 r.pageFigures={};r.missingRendererFigures=[];r.sourceRequiredFiguresMissing=[];r.unverifiedInventedFigures=[];
 let expectedTotal=0,renderedModelTotal=0;
 for(const page of Object.keys(V5_SOURCE_FIGURE_INVENTORY).map(Number)){
  const expected=V5_SOURCE_FIGURE_INVENTORY[page];expectedTotal+=expected.length;
  const sem=EARTH_SEMANTIC_MAPS.find(c=>c.pages.includes(page));
  const actual=(sem?.figures||[]).filter(f=>f.sourcePage===page);
  const actualIds=actual.map(f=>f.id);renderedModelTotal+=actual.length;
  const missing=expected.filter(id=>!actualIds.includes(id));
  const invented=actualIds.filter(id=>!expected.includes(id));
  const missingRenderers=actual.filter(f=>typeof V5_RENDERERS[f.renderer]!=='function').map(f=>f.id);
  r.sourceRequiredFiguresMissing.push(...missing.map(id=>`${page}:${id}`));
  r.unverifiedInventedFigures.push(...invented.map(id=>`${page}:${id}`));
  r.missingRendererFigures.push(...missingRenderers.map(id=>`${page}:${id}`));
  r.pageFigures[page]={expected:expected.length,model:actual.length,missing,invented,missingRenderers,ok:!missing.length&&!invented.length&&!missingRenderers.length};
 }
 r.totals.sourceFiguresExpected=expectedTotal;r.totals.sourceFiguresModel=renderedModelTotal;
 r.semanticFallbackFigures=r.missingRendererFigures.length;
 r.specializedFigureRenderers=renderedModelTotal-r.missingRendererFigures.length;
 const blockers=['missingQuestionIds','duplicateQuestionIds','orphanQuestions','orphanConceptNodes','orphanRequiredFigures','orphanConnectors','connectorWithoutRelationMeaning','sourceRequiredFiguresMissing','unverifiedInventedFigures','missingRendererFigures'];
 r.ok=r.totals.questions===V5_TOTAL&&expectedTotal===renderedModelTotal&&blockers.every(k=>(r[k]||[]).length===0)&&v4RefValidateData().ok;
 return r;
};
window.v5SemanticValidate=v5SemanticValidate;

v5FigureSvg=function(f){const fn=V5_RENDERERS[f.renderer];if(!fn){console.error('Missing source-specific figure renderer',f.id,f.renderer);return '';}return fn();};
window.v5StrictAcceptanceReport=()=>v5SemanticValidate();
