// V5 rendered regression checks. Runs only under the existing strict ?e2e flow.
(async()=>{
  if(!window.__v4StrictRunE2E)return;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms)),results=[];
  const check=(name,ok,detail='')=>results.push({name,ok:Boolean(ok),detail});
  const mobile=()=>innerWidth<=860;
  async function go(page){if(mobile()){document.querySelector('.mobile-nav [data-action="toggleMenu"]')?.click();await sleep(60);document.querySelector(`.mobile-drawer [data-page="${page}"]`)?.click()}else document.querySelector(`.sidebar [data-page="${page}"]`)?.click();await sleep(150)}
  try{
    await sleep(420);
    check('V5 learning object module loaded',typeof window.v5UpsertGenericFact==='function');
    check('V5 concept explorer module loaded',typeof window.v5CeTree==='function');
    check('V5 staged tutor module loaded',typeof window.v5TutorTestDemo==='function');
    await go('concepts');
    check('three concept panes render',Boolean(document.querySelector('[data-ce-pane="outline"]')&&document.querySelector('[data-ce-pane="graph"]')&&document.querySelector('[data-ce-pane="detail"]')));
    check('ten subject entries remain',new Set([...document.querySelectorAll('[data-subject]')].map(x=>x.dataset.subject).filter(Boolean)).size===10);
    document.querySelector('[data-subject="biology"]')?.click();await sleep(130);
    const count=document.querySelectorAll('.v5-graph-node').length;check('focused graph remains bounded',count>=1&&count<=25,String(count));
    const tree=v5CeTree('biology'),chapter=tree.nodes.find(n=>n.type==='chapter'),section=tree.nodes.find(n=>n.parentKey===chapter?.key&&n.type==='section'),point=tree.nodes.find(n=>n.parentKey===section?.key&&n.type==='point');
    if(chapter)v5CeSelect(chapter.key);await sleep(70);if(section)v5CeSelect(section.key);await sleep(70);if(point)v5CeSelect(point.key);await sleep(90);
    check('outline graph detail agree',Boolean(point&&document.querySelector('.v5-outline-node.is-selected')?.dataset.ceNode===point.key&&document.querySelector('.v5-graph-node.is-selected')?.dataset.ceNode===point.key&&document.querySelector('.v5-concept-detail h2')?.textContent.trim()===point.label));
    const search=document.querySelector('[data-ce-search]');if(search){search.value='靜摩擦';search.dispatchEvent(new Event('input',{bubbles:true}));await sleep(70)}
    const sr=document.querySelector('[data-ce-search-subject="physics"]');check('concept search finds static friction',Boolean(sr));sr?.click();await sleep(100);check('search opens matching physics path',state.subject==='physics'&&document.querySelector('.v5-concept-detail h2')?.textContent.includes('靜摩擦'));
    const fixture={id:'e2e-v5-static-friction',subject:'physics',title:'E2E 靜摩擦力',concept:'靜摩擦力',conceptCode:'PHY-NEWTON-STATIC-FRICTION',chapter:'牛頓運動定律',problemText:'測試用概念題',student:['A'],correct:['B'],genericFactIds:[],mastery:44,dueISO:v3DateISO(0),due:'今天',reviewData:null};v3EnsureReview(fixture);state.problems.unshift(fixture);
    const fact=v5UpsertGenericFact({question:'靜摩擦力一定等於最大靜摩擦力嗎？',answer:'不一定。靜摩擦力會依維持靜止所需調整，直到最大靜摩擦力。',conceptCode:'PHY-NEWTON-STATIC-FRICTION',conceptNameZh:'靜摩擦力',confidence:.99,sourceType:'corrected_option',sourceEvidence:'錯誤選項把靜摩擦力視為固定最大值',standalone:true,dedupeKey:'e2e-static-friction'},fixture);
    check('standalone generic fact accepted',Boolean(fact&&!/這題|選項/.test(fact.question)));
    const dup=v5UpsertGenericFact({question:'靜摩擦力一定等於最大靜摩擦力嗎？',answer:'不一定。靜摩擦力會依維持靜止所需調整，直到最大靜摩擦力。',conceptCode:'PHY-NEWTON-STATIC-FRICTION',conceptNameZh:'靜摩擦力',confidence:.99,sourceType:'solution_principle',sourceEvidence:'再次遇到',standalone:true,dedupeKey:'e2e-static-friction'},fixture);check('generic fact deduplicates',dup?.id===fact?.id);
    check('source-dependent generic prompt rejected',v5UpsertGenericFact({question:'這題 A 選項錯在哪裡？',answer:'靜摩擦力不是固定值',standalone:true,dedupeKey:'e2e-bad-source'},fixture)===null);
    check('one-off numeric generic prompt rejected',v5UpsertGenericFact({question:'這題答案是多少？',answer:'37.5',standalone:true,dedupeKey:'e2e-bad-number'},fixture)===null);
    const pd={...fixture,id:'e2e-v5-diagram',genericFactIds:[]};v5ApplyAnalysisToProblem(pd,{learningObjectType:'problem_dependent',contextDependencyReason:'需要原題圖與數值',genericFacts:[],regions:[{id:'diagram',kind:'diagram',text:'受力圖',bbox:{x:20,y:20,width:30,height:25},confidence:.95}]});check('problem dependent keeps normalized geometry',pd.learningObjectType==='problem_dependent'&&pd.regions[0]?.bbox.width===30);
    const mixed={...fixture,id:'e2e-v5-mixed',genericFactIds:[]};v5ApplyAnalysisToProblem(mixed,{learningObjectType:'mixed',contextDependencyReason:'原題可重做，也有可泛化通則',regions:[],genericFacts:[{question:'靜摩擦力一定等於最大靜摩擦力嗎？',answer:'不一定。',conceptCode:'PHY-NEWTON-STATIC-FRICTION',conceptNameZh:'靜摩擦力',confidence:.95,sourceType:'corrected_option',sourceEvidence:'錯誤選項',standalone:true,dedupeKey:'e2e-static-short'}]});check('mixed keeps source plus fact',mixed.learningObjectType==='mixed'&&mixed.genericFactIds.length===1);
    state.subject='physics';state.selectedProblemId=fixture.id;state.page='notebook';save();render();await sleep(100);window.v5TutorTestDemo({rightTrack:true,mode:'instructive'});await sleep(140);
    const session=state.tutorSessions[fixture.id],stage=session?.stages?.[0];check('tutor recognizes right-track state',session?.diagnosis?.studentOnRightTrack===true);check('first tutor stage is gated',session?.stages?.length===1&&stage?.waitForStudent===true&&stage?.revealFinalAnswer===false);check('source-paper guide controls render',Boolean(document.getElementById('aiGuideCanvas')&&document.querySelector('[data-v5-tutor-try]')));document.querySelector('[data-v5-tutor-try]')?.click();await sleep(55);check('student try exposes re-read action',Boolean(document.querySelector('[data-v5-tutor-evaluate]')));
    await go('concepts');for(let i=0;i<10;i++){const nodes=[...document.querySelectorAll('.v5-graph-node')];nodes[i%Math.max(1,nodes.length)]?.click();await sleep(12)}check('rapid concept navigation stays live',Boolean(document.querySelector('.v5-concept-detail h2')&&document.querySelector('.v5-graph-node.is-selected')));check('no horizontal body overflow',document.documentElement.scrollWidth<=document.documentElement.clientWidth+2,`${document.documentElement.scrollWidth}/${document.documentElement.clientWidth}`);
    state.problems=state.problems.filter(p=>!String(p.id).startsWith('e2e-v5-'));state.genericFacts=(state.genericFacts||[]).filter(f=>!String(f.dedupeKey||'').startsWith('e2e-'));delete state.tutorSessions['e2e-v5-static-friction'];save();
    const failed=results.filter(x=>!x.ok),box=document.createElement('pre');box.id='e2e-product-v5-results';box.dataset.status=failed.length?'FAIL':'PASS';box.textContent=JSON.stringify({status:failed.length?'FAIL':'PASS',viewport:{w:innerWidth,h:innerHeight},results},null,2);document.body.appendChild(box)
  }catch(err){const box=document.createElement('pre');box.id='e2e-product-v5-results';box.dataset.status='FAIL';box.textContent=JSON.stringify({status:'FAIL',viewport:{w:innerWidth,h:innerHeight},error:String(err),results},null,2);document.body.appendChild(box)}
})();
