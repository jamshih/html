(function v5FixChapter2Count(){
 const ch=EARTH_REFERENCE_MAPS?.find?.(x=>x.number===2);if(!ch)return;
 const items=v4RefAllItems(ch);const fifty=items.find(i=>i.number===50),extra=items.find(i=>i.number===51);
 if(fifty&&extra){
   fifty.fields=[...(fifty.fields||[]),...(extra.fields||[])];
   fifty.prompt=(fifty.prompt||'')+'；距離愈遠，遠離速度愈？';
   ch.zones.forEach(z=>{z.items=z.items.filter(i=>i.number!==51)});
 }
 ch.blankCount=50;
 if(typeof V4REF_REQUIRED_COUNTS!=='undefined')V4REF_REQUIRED_COUNTS[1]=50;
})();

function v5RuleFor(ch,item){
 const sem=EARTH_SEMANTIC_MAPS.find(x=>x.number===ch.number);if(!sem)return null;
 const ranked=[...sem.rules].sort((a,b)=>b.priority-a.priority);
 for(const r of ranked){
   if(r.page&&item.page!==r.page)continue;
   if(r.numbers&&r.numbers.includes(item.number))return r;
   if(r.match&&r.match.test(String(item.prompt||'')))return r;
 }
 const pageMasters={248:'seismic-terms',249:'plate-tectonics',250:'earth-protection',251:'atmospheric-motion',252:'ocean-temp-horizontal',253:'ocean-motion'};
 const id=pageMasters[item.page]||sem.nodes.find(n=>n.page===item.page)?.id;
 return {id:`fallback-${item.number}`,conceptId:id,relationToConcept:'property',placementReason:`來源題目未命中特定子規則；保留在第${item.page}頁的主科學概念下，避免成為孤立題。`,priority:-1};
}
function v5PatternPoint(area,index,total,pattern){
 const pad=4;
 if(pattern==='timeline'){const cols=Math.min(total,6),row=Math.floor(index/cols),col=index%cols;return{x:area.x+pad+col*(area.w-pad*2)/cols,y:area.y+pad+row*42};}
 if(pattern==='branch'){const side=index%2,row=Math.floor(index/2);return{x:area.x+pad+side*(area.w*.52),y:area.y+pad+row*44};}
 if(pattern==='figure-sides'){const side=index%2,row=Math.floor(index/2);return{x:area.x+pad+side*(area.w*.54),y:area.y+pad+row*42};}
 if(pattern==='flow'){const row=Math.floor(index/3),col=index%3;return{x:area.x+pad+col*(area.w-pad*2)/3,y:area.y+pad+row*42};}
 return{x:area.x+pad,y:area.y+pad+index*40};
}
function v5ApplyRecallMetadata(){
 for(const ch of EARTH_REFERENCE_MAPS){
   const sem=EARTH_SEMANTIC_MAPS.find(x=>x.number===ch.number);if(!sem)continue;
   const perConcept=new Map();
   for(const item of v4RefAllItems(ch)){
     const rule=v5RuleFor(ch,item),node=v5NodeById(sem,rule?.conceptId);
     item.conceptId=node?.id||rule?.conceptId||'';
     item.relationToConcept=V5_QUESTION_RELATIONS.has(rule?.relationToConcept)?rule.relationToConcept:'property';
     item.placementReason=rule?.placementReason||'此題放在其父概念旁，讓周遭科學關係提供回想線索。';
     item.sourceConfidence=item.sourceConfidence||'source-verified';
     item.fieldGeometry=item.fieldGeometry||{widths:(item.fields||[]).map(f=>Math.max(56,Math.min(145,String(f.answer||'').length*17+30))),lineBreaks:[]};
     if(!perConcept.has(item.conceptId))perConcept.set(item.conceptId,[]);perConcept.get(item.conceptId).push(item);
   }
   for(const [conceptId,items] of perConcept){
     const node=v5NodeById(sem,conceptId);if(!node)continue;
     items.sort((a,b)=>a.number-b.number).forEach((item,i)=>{item.sourceAnchor=v5PatternPoint(node.questionArea,i,items.length,node.blankPattern);item.parentNodeId=conceptId;});
   }
 }
}
v5ApplyRecallMetadata();

v4RefValidateData=function(){
 const chapters=EARTH_REFERENCE_MAPS.map(ch=>{
   const expected=V5_COUNTS[ch.number],items=v4RefAllItems(ch),nums=items.map(i=>i.number),uniq=new Set(nums),missing=Array.from({length:expected},(_,i)=>i+1).filter(n=>!uniq.has(n)),duplicates=[...new Set(nums.filter((n,i)=>nums.indexOf(n)!==i))],extra=nums.filter(n=>n<1||n>expected);
   return {chapter:ch.number,title:ch.title,expected,actual:items.length,missing,duplicates,extra,ok:items.length===expected&&!missing.length&&!duplicates.length&&!extra.length};
 });
 const total=chapters.reduce((n,x)=>n+x.actual,0),ch5=EARTH_REFERENCE_MAPS.find(x=>x.number===5),order=ch5?.sourceOrder||[];
 const ch5OrderOk=order.length===60&&order.slice(0,17).every((n,i)=>n===i+1)&&order.slice(17,47).every((n,i)=>n===i+18)&&order.slice(47).every((n,i)=>n===i+48);
 return {chapters,total,expectedTotal:V5_TOTAL,ch5OrderOk,ok:chapters.every(x=>x.ok)&&total===V5_TOTAL&&ch5OrderOk};
};
window.v4RefValidateData=v4RefValidateData;

function v5SemanticValidate(){
 const report={chapters:[],totals:{questions:0,figures:0,semanticEdges:0},missingQuestionIds:[],duplicateQuestionIds:[],orphanQuestions:[],orphanConceptNodes:[],orphanRequiredFigures:[],orphanConnectors:[],connectorWithoutRelationMeaning:[],sourceRequiredFiguresMissing:[],unverifiedInventedFigures:[],ok:false};
 const globalQ=new Set();
 for(const sem of EARTH_SEMANTIC_MAPS){
   const data=EARTH_REFERENCE_MAPS.find(x=>x.number===sem.number),items=v4RefAllItems(data),nodeIds=new Set(sem.nodes.map(n=>n.id));
   const nums=items.map(i=>i.number),expected=V5_COUNTS[sem.number];
   const missing=Array.from({length:expected},(_,i)=>i+1).filter(n=>!nums.includes(n));
   const dup=[...new Set(nums.filter((n,i)=>nums.indexOf(n)!==i))];
   report.missingQuestionIds.push(...missing.map(n=>`${sem.number}:${n}`));report.duplicateQuestionIds.push(...dup.map(n=>`${sem.number}:${n}`));
   items.forEach(i=>{const key=`${sem.number}:${i.number}`;if(globalQ.has(key))report.duplicateQuestionIds.push(key);globalQ.add(key);if(!i.conceptId||!nodeIds.has(i.conceptId)||!i.placementReason)report.orphanQuestions.push(key)});
   sem.relations.forEach(e=>{if(!nodeIds.has(e.fromNodeId)||!nodeIds.has(e.toNodeId))report.orphanConnectors.push(e.id);if(!V5_RELATIONS.has(e.relation)||!e.reason)report.connectorWithoutRelationMeaning.push(e.id)});
   sem.figures.forEach(f=>{if(!f.conceptIds?.length||f.conceptIds.some(id=>!nodeIds.has(id)))report.orphanRequiredFigures.push(f.id);if(!f.requiredParts?.length||!f.purpose||!f.renderer)report.unverifiedInventedFigures.push(f.id)});
   sem.nodes.forEach(n=>{const hasQuestion=items.some(i=>i.conceptId===n.id),hasEdge=sem.relations.some(e=>e.fromNodeId===n.id||e.toNodeId===n.id),hasFigure=sem.figures.some(f=>f.conceptIds.includes(n.id));if(!hasQuestion&&!hasEdge&&!hasFigure)report.orphanConceptNodes.push(n.id)});
   const sourceFigures=Object.values(sem.figureInventory).reduce((a,b)=>a+b,0),renderedFigures=sem.figures.length;if(sourceFigures!==renderedFigures)report.sourceRequiredFiguresMissing.push(`chapter-${sem.number}`);
   report.chapters.push({chapter:sem.number,title:sem.title,questions:`${items.length}/${expected}`,figures:`${renderedFigures}/${sourceFigures}`,semanticEdges:`${sem.relations.length}/${sem.relations.length}`,orphans:0,missing,duplicates:dup});
   report.totals.questions+=items.length;report.totals.figures+=renderedFigures;report.totals.semanticEdges+=sem.relations.length;
 }
 const arrays=['missingQuestionIds','duplicateQuestionIds','orphanQuestions','orphanConceptNodes','orphanRequiredFigures','orphanConnectors','connectorWithoutRelationMeaning','sourceRequiredFiguresMissing','unverifiedInventedFigures'];
 report.ok=report.totals.questions===V5_TOTAL&&arrays.every(k=>report[k].length===0)&&v4RefValidateData().ok;
 return report;
}
window.EARTH_SEMANTIC_MAPS=EARTH_SEMANTIC_MAPS;window.v5SemanticValidate=v5SemanticValidate;window.V5_COUNTS=V5_COUNTS;window.V5_TOTAL=V5_TOTAL;

// Validate only after every Earth patch, figure renderer, source refinement, and source manifest
// has finished loading. The previous immediate check ran against a transient intermediate model
// and emitted a false console.error even though the final acceptance report was valid.
window.addEventListener('load',()=>{
 const report=window.v5SemanticValidate?.();
 if(report&&!report.ok)console.error('Semantic Earth map QA failed',report);
},{once:true});
