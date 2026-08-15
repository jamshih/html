// Wrongbook V5 learning-object bridge: standalone generic facts + source-dependent problems.
// Keeps legacy corrected truths intact and uses the existing review/cloud/image infrastructure.
const V5_LEARNING_VERSION='2026-08-14-learning-objects-v5';

function v5EnsureLearningState(){
  state.genericFacts=Array.isArray(state.genericFacts)?state.genericFacts:[];
  state.factReviewUi=state.factReviewUi&&typeof state.factReviewUi==='object'?state.factReviewUi:{};
  state.conceptRelationships=Array.isArray(state.conceptRelationships)?state.conceptRelationships:[];
  for(const p of state.problems||[]){
    if(!['generic_fact','problem_dependent','mixed'].includes(p.learningObjectType))p.learningObjectType='problem_dependent';
    p.contextDependencyReason=String(p.contextDependencyReason||'舊資料：保留原題作為複習單位');
    p.genericFactIds=Array.isArray(p.genericFactIds)?p.genericFactIds:[];
    p.regions=Array.isArray(p.regions)?p.regions:[];
    p.tutorProgress=p.tutorProgress&&typeof p.tutorProgress==='object'?p.tutorProgress:{};
  }
  for(const f of state.genericFacts){
    f.sourceProblemIds=Array.isArray(f.sourceProblemIds)?[...new Set(f.sourceProblemIds.filter(Boolean))]:[];
    f.encounters=Math.max(1,Number(f.encounters)||f.sourceProblemIds.length||1);
    f.mastery=Number.isFinite(Number(f.mastery))?Number(f.mastery):40;
    if(typeof v3EnsureReview==='function')v3EnsureReview(f);
  }
  state.v5LearningVersion=V5_LEARNING_VERSION;
}

function v5FactNorm(v=''){
  const tw=typeof twTaiwanizeString==='function'?twTaiwanizeString(String(v)):String(v);
  return (typeof v3NormalizeText==='function'?v3NormalizeText(tw):tw.normalize('NFKC').toLowerCase().replace(/\s+/g,''));
}
function v5FactDedupeKey(raw={}){
  const supplied=String(raw.dedupeKey||'').trim();
  if(supplied)return supplied;
  return `fact-${typeof v3Hash==='function'?v3Hash(`${v5FactNorm(raw.question)}|${v5FactNorm(raw.answer)}`):v5FactNorm(raw.question+raw.answer)}`;
}
function v5StandaloneFact(raw){
  const q=String(raw?.question||'').trim(),a=String(raw?.answer||'').trim();
  if(!q||!a||raw?.standalone===false)return false;
  if(/(這題|本題|上述|上圖|下圖|圖中|選項|為什麼選|答案是多少|在這一題)/.test(q))return false;
  if(/^\s*[A-EＡ-Ｅ]\s*[選項項]\s*/i.test(q))return false;
  if(/^(\d+[\.,]?\d*|[-+]?\d+\s*(N|J|W|m\/s|kg|mol|V|A)?)$/i.test(a)&&/(答案|結果|多少)/.test(q))return false;
  return true;
}
function v5NormalizeBBox(b){
  if(!b||typeof b!=='object')return null;
  const x=clamp(Number(b.x)||0,0,100),y=clamp(Number(b.y)||0,0,100),width=clamp(Number(b.width)||0,0,100-x),height=clamp(Number(b.height)||0,0,100-y);
  if(width<=0||height<=0)return null;
  return{x,y,width,height};
}
function v5NormalizeRegions(raw=[]){
  return (Array.isArray(raw)?raw:[]).slice(0,80).map((r,i)=>({
    id:String(r?.id||`region-${i}`),kind:String(r?.kind||'unknown'),text:String(r?.text||'').slice(0,500),bbox:v5NormalizeBBox(r?.bbox),confidence:clamp(Number(r?.confidence)||0,0,1)
  })).filter(r=>r.bbox);
}

function v5CurriculumPointEntries(subjectId){
  const c=typeof twCurriculumSubject==='function'?twCurriculumSubject(subjectId):CURRICULUM_TW?.[subjectId];
  const out=[];
  for(const chapter of c?.chapters||[])for(const section of chapter.sections||[])for(const point of section.points||[])out.push({
    key:`${subjectId}:${chapter.id}:${section.id}:${point.id}`,subjectId,chapter,section,point,
    code:`${subjectId.toUpperCase()}-${String(chapter.id)}-${String(section.id)}-${String(point.id)}`
  });
  return out;
}
function v5ResolveFactOwner(raw,p){
  const sid=p?.subject||subjectIdFromText(raw?.subject||'')||state.subject;
  const entries=v5CurriculumPointEntries(sid);if(!entries.length)return{key:`${sid}:root`,subjectId:sid,chapterId:'',sectionId:'',pointId:'',label:raw?.conceptNameZh||p?.concept||subjectById(sid)?.name||sid};
  const code=v5FactNorm(raw?.conceptCode||p?.conceptCode||''),name=v5FactNorm(raw?.conceptNameZh||p?.concept||''),q=v5FactNorm(raw?.question||''),a=v5FactNorm(raw?.answer||'');
  let best=null,score=-1;
  for(const e of entries){let s=0;const pool=[v5FactNorm(e.point.q),v5FactNorm(e.point.a),v5FactNorm(e.point.truth),v5FactNorm(e.section.title),v5FactNorm(e.chapter.title),v5FactNorm(e.code)];
    if(code&&pool.some(x=>x&&x.includes(code)))s+=12;
    if(name&&pool.some(x=>x&&(x.includes(name)||name.includes(x))))s+=9;
    if(p?.chapter===e.chapter.title)s+=6;
    if(p?.concept&&v5FactNorm(p.concept).includes(v5FactNorm(e.section.title)))s+=5;
    if(q&&pool.some(x=>x&&(x.includes(q)||q.includes(x))))s+=8;
    if(a&&pool.some(x=>x&&(x===a||x.includes(a)||a.includes(x))))s+=7;
    if(s>score){score=s;best=e}
  }
  const e=best||entries[0];return{key:e.key,subjectId:sid,chapterId:e.chapter.id,sectionId:e.section.id,pointId:e.point.id,label:e.point.q,score};
}
function v5UpsertGenericFact(raw,p,{silent=true}={}){
  if(!v5StandaloneFact(raw))return null;
  v5EnsureLearningState();
  const owner=v5ResolveFactOwner(raw,p),key=v5FactDedupeKey(raw),q=typeof twTaiwanizeString==='function'?twTaiwanizeString(String(raw.question).trim()):String(raw.question).trim(),a=typeof twTaiwanizeString==='function'?twTaiwanizeString(String(raw.answer).trim()):String(raw.answer).trim();
  let fact=state.genericFacts.find(f=>f.dedupeKey===key||(f.ownerKey===owner.key&&v5FactNorm(f.question)===v5FactNorm(q)&&v5FactNorm(f.answer)===v5FactNorm(a)));
  if(fact){
    fact.sourceProblemIds=[...new Set([...(fact.sourceProblemIds||[]),p?.id].filter(Boolean))];fact.encounters=Math.max(Number(fact.encounters)||1,fact.sourceProblemIds.length);fact.lastEncounterAt=new Date().toISOString();
    if(raw.sourceEvidence&&!fact.sourceEvidence)fact.sourceEvidence=String(raw.sourceEvidence).slice(0,1000);
  }else{
    fact={id:`gf-${typeof v3Hash==='function'?v3Hash(`${owner.key}|${key}`):Date.now().toString(36)}`,dedupeKey:key,question:q,answer:a,subject:owner.subjectId,ownerKey:owner.key,conceptCode:String(raw.conceptCode||p?.conceptCode||''),conceptNameZh:String(raw.conceptNameZh||p?.concept||owner.label||''),chapterId:owner.chapterId,sectionId:owner.sectionId,pointId:owner.pointId,confidence:clamp(Number(raw.confidence)||0,0,1),sourceType:String(raw.sourceType||'other'),sourceEvidence:String(raw.sourceEvidence||'').slice(0,1000),standalone:true,sourceProblemIds:[p?.id].filter(Boolean),encounters:1,createdAt:new Date().toISOString(),lastEncounterAt:new Date().toISOString(),mastery:40,dueISO:typeof v3DateISO==='function'?v3DateISO(0):'',due:'今天',reviewData:null};
    if(typeof v3EnsureReview==='function')v3EnsureReview(fact);state.genericFacts.push(fact);
  }
  if(p&&fact&&!p.genericFactIds.includes(fact.id))p.genericFactIds.push(fact.id);
  if(!silent&&fact)toast('已加入可獨立複習的概念事實');
  return fact;
}
function v5ApplyAnalysisToProblem(p,analysis){
  if(!p||!analysis)return p;v5EnsureLearningState();
  const type=String(analysis.learningObjectType||'').toLowerCase();p.learningObjectType=['generic_fact','problem_dependent','mixed'].includes(type)?type:'problem_dependent';
  p.contextDependencyReason=String(analysis.contextDependencyReason||p.contextDependencyReason||'').slice(0,1000);
  p.regions=v5NormalizeRegions(analysis.regions||analysis.imageRegions||[]);
  p.genericFactIds=Array.isArray(p.genericFactIds)?p.genericFactIds:[];
  for(const raw of analysis.genericFacts||[])v5UpsertGenericFact(raw,p);
  if(p.learningObjectType==='generic_fact'&&!p.genericFactIds.length)p.learningObjectType='problem_dependent';
  if(p.learningObjectType==='mixed'&&!p.genericFactIds.length)p.learningObjectType='problem_dependent';
  return p;
}
function v5FactReview(factId,correct,assistance='none'){
  v5EnsureLearningState();const fact=state.genericFacts.find(x=>x.id===factId);if(!fact)return false;
  if(typeof v3Schedule==='function')v3Schedule(fact,Boolean(correct),assistance);else{fact.dueISO=v3DateISO(correct?3:1);fact.due=v3DueLabel(fact.dueISO)}
  state.factReviewUi[factId]={revealed:false,hint:false,lastResult:correct?'know':'weak'};save();return true;
}
function v5FactSources(fact){return (fact?.sourceProblemIds||[]).map(problemById).filter(Boolean)}

// Backward-compatible migration hook. Cloud pull calls v3Migrate dynamically, so this also covers another device.
if(typeof v3Migrate==='function'){
  const v5BaseMigrate=v3Migrate;
  v3Migrate=function(){v5BaseMigrate();v5EnsureLearningState();state.v5LearningVersion=V5_LEARNING_VERSION};
}
v5EnsureLearningState();

// Single-scan and sheet-scan conversion hooks keep all legacy fields while attaching V5 metadata.
if(typeof scanToProblem==='function'){
  const v5BaseScanToProblem=scanToProblem;
  scanToProblem=function(id,confirmed){const p=v5BaseScanToProblem(id,confirmed);return v5ApplyAnalysisToProblem(p,state.scan||{})};
}
if(typeof v3QuestionToProblem==='function'){
  const v5BaseQuestionToProblem=v3QuestionToProblem;
  v3QuestionToProblem=function(q,id){const p=v5BaseQuestionToProblem(q,id);return v5ApplyAnalysisToProblem(p,q||{})};
}
window.v5EnsureLearningState=v5EnsureLearningState;
window.v5UpsertGenericFact=v5UpsertGenericFact;
window.v5ApplyAnalysisToProblem=v5ApplyAnalysisToProblem;
window.v5FactReview=v5FactReview;
window.v5ResolveFactOwner=v5ResolveFactOwner;
