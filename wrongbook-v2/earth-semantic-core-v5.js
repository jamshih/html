// Semantic reconstruction model for Earth Science textbook maps, pages 242–253.
// Source order: science relationship -> concept/figure/question placement -> source-like coordinates.

const V5_COUNTS={1:48,2:50,3:41,4:27,5:60,6:50};
const V5_TOTAL=276;
const V5_PAGE_W=910,V5_PAGE_H=1270;
const V5_RELATIONS=new Set(['causes','results-in','evidence-for','explains','part-of','contains','example-of','classified-into','measured-by','derived-from','depends-on','increases','decreases','sequence','chronology','comparison','corresponds-to','located-in','observed-by']);
const V5_QUESTION_RELATIONS=new Set(['definition','property','cause','effect','comparison','label','calculation','sequence','diagram-reading']);
const EARTH_SEMANTIC_MAPS=[];

function v5Chapter(number,title,pages){const ch={number,title,pages,nodes:[],relations:[],figures:[],rules:[],figureInventory:{}};EARTH_SEMANTIC_MAPS.push(ch);return ch}
function v5Node(ch,id,page,label,x,y,w,h,color='#627fa6',kind='concept',opts={}){const n={id,page,label,x,y,w,h,color,kind,questionArea:opts.questionArea||{x,y:y+h+8,w,h:Math.max(70,opts.qh||120)},blankPattern:opts.blankPattern||'stack',purpose:opts.purpose||''};ch.nodes.push(n);return n}
function v5Edge(ch,id,page,fromNodeId,toNodeId,relation,reason,color='#777',direction='forward',via=[]){ch.relations.push({id,page,fromNodeId,toNodeId,relation,direction,sourcePage:page,reason,color,via});}
function v5Figure(ch,id,page,conceptIds,purpose,type,requiredParts,x,y,w,h,renderer){const f={id,sourcePage:page,conceptIds,purpose,type,requiredParts,sourceRect:{x,y,width:w,height:h},renderer};ch.figures.push(f);ch.figureInventory[page]=(ch.figureInventory[page]||0)+1;return f}
function v5Rule(ch,id,conceptId,relationToConcept,placementReason,opts={}){ch.rules.push({id,conceptId,relationToConcept,placementReason,numbers:opts.numbers||null,page:opts.page||null,match:opts.match||null,priority:opts.priority||0});}
function v5Nums(a,b){return Array.from({length:b-a+1},(_,i)=>a+i)}
function v5NodeById(ch,id){return ch.nodes.find(n=>n.id===id)}
function v5GlobalPoint(node,p){const ox=node.page%2===0?25:965;return{x:ox+p.x,y:20+p.y}}
