// V5 product QA, isolated from historical ?e2e source-map suites. Runs only with ?e2eproduct=1.
(async()=>{
  if(!new URLSearchParams(location.search).has('e2eproduct'))return;
  if(window.__v5ProductE2ERunning)return;window.__v5ProductE2ERunning=true;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms)),results=[];
  const check=(name,ok,detail='')=>results.push({name,ok:Boolean(ok),detail});
  const mobile=()=>innerWidth<=860;
  async function go(page){if(mobile()){document.querySelector('.mobile-nav [data-action="toggleMenu"]')?.click();await sleep(60);document.querySelector(`.mobile-drawer [data-page="${page}"]`)?.click()}else document.querySelector(`.sidebar [data-page="${page}"]`)?.click();await sleep(150)}
  try{
    await sleep(420);
    check('V5 learning object module loaded',typeof window.v5UpsertGenericFact==='function');
    check('V5 concept explorer module loaded',typeof window.v5CeTree==='function');
    check('V5 staged tutor module loaded',typeof window.v5TutorTestDemo==='function');
    check('V5 product QA executes once',document.querySelectorAll('#e2e-product-v5-results').length===0);

    await go('concepts');
    check('three concept panes render',Boolean(document.querySelector('[data-ce-pane="outline"]')&&document.querySelector('[data-ce-pane="graph"]')&&document.querySelector('[data-ce-pane="detail"]')));
    check('ten subject entries remain',new Set([...document.querySelectorAll('[data-subject]')].map(x=>x.dataset.subject).filter(Boolean)).size===10);
    document.querySelector('[data-subject="biology"]')?.click();await sleep(130);
    check('subject drill-down selects biology',state.subject==='biology');
    const count=document.querySelectorAll('.v5-graph-node').length;check('focused graph remains bounded',count>=1&&count<=25,String(count));
    const tree=v5CeTree('biology'),chapter=tree.nodes.find(n=>n.type==='chapter'),section=tree.nodes.find(n=>n.parentKey===chapter?.key&&n.type==='section'),point=tree.nodes.find(n=>n.parentKey===section?.key&&n.type==='point');
    check('hierarchical outline has chapter section point',Boolean(chapter&&section&&point));
    if(chapter)v5CeSelect(chapter.key);await sleep(70);if(section)v5CeSelect(section.key);await sleep(70);if(point)v5CeSelect(point.key);await sleep(90);
    check('outline graph detail agree',Boolean(point&&document.querySelector('.v5-outline-node.is-selected')?.dataset.ceNode===point.key&&document.querySelector('.v5-graph-node.is-selected')?.dataset.ceNode===point.key&&document.querySelector('.v5-concept-detail h2')?.textContent.trim()===point.label));
    check('graph detail breadcrumb preserves hierarchy',Boolean(point&&document.querySelector('.v5-breadcrumb')?.innerText.includes(chapter.label)&&document.querySelector('.v5-breadcrumb')?.innerText.includes(section.label)));
    const search=document.querySelector('[data-ce-search]');if(search){search.value='靜摩擦';search.dispatchEvent(new Event('input',{bubbles:true}));await sleep(70)}
    const sr=document.querySelector('[data-ce-search-subject="physics"]');check('concept search finds static friction',Boolean(sr));sr?.click();await sleep(100);check('search opens matching physics path',state.subject==='physics'&&document.querySelector('.v5-concept-detail h2')?.textContent.includes('靜摩擦'));

    const fixture={id:'e2e-v5-static-friction',subject:'physics',title:'E2E 靜摩擦力',concept:'靜摩擦力',conceptCode:'PHY-NEWTON-STATIC-FRICTION',chapter:'牛頓運動定律',problemText:'測試用概念題',student:['A'],correct:['B'],genericFactIds:[],mastery:44,dueISO:v3DateISO(0),due:'今天',reviewData:null};v3EnsureReview(fixture);state.problems.unshift(fixture);
    const fixture2={...fixture,id:'e2e-v5-static-friction-2',title:'E2E 靜摩擦力第二次',genericFactIds:[],reviewData:null};v3EnsureReview(fixture2);state.problems.unshift(fixture2);
    const fact=v5UpsertGenericFact({question:'靜摩擦力一定等於最大靜摩擦力嗎？',answer:'不一定。靜摩擦力會依維持靜止所需調整，直到最大靜摩擦力。',conceptCode:'PHY-NEWTON-STATIC-FRICTION',conceptNameZh:'靜摩擦力',confidence:.99,sourceType:'corrected_option',sourceEvidence:'錯誤選項把靜摩擦力視為固定最大值',standalone:true,dedupeKey:'e2e-static-friction'},fixture);
    check('standalone generic fact accepted',Boolean(fact&&!/這題|上述|上圖|下圖/.test(fact.question)));
    const dup=v5UpsertGenericFact({question:'靜摩擦力一定等於最大靜摩擦力嗎？',answer:'不一定。靜摩擦力會依維持靜止所需調整，直到最大靜摩擦力。',conceptCode:'PHY-NEWTON-STATIC-FRICTION',conceptNameZh:'靜摩擦力',confidence:.99,sourceType:'solution_principle',sourceEvidence:'再次遇到',standalone:true,dedupeKey:'e2e-static-friction'},fixture2);check('generic fact deduplicates',dup?.id===fact?.id);
    check('fact provenance keeps both source problems',Boolean(fact?.sourceProblemIds?.includes(fixture.id)&&fact?.sourceProblemIds?.includes(fixture2.id)&&fact?.sourceEvidence&&fact.encounters>=2),JSON.stringify(fact?.sourceProblemIds));
    check('source-dependent generic prompt rejected',v5UpsertGenericFact({question:'這題 A 選項錯在哪裡？',answer:'靜摩擦力不是固定值',standalone:true,dedupeKey:'e2e-bad-source'},fixture)===null);
    check('one-off numeric generic prompt rejected',v5UpsertGenericFact({question:'這題答案是多少？',answer:'37.5',standalone:true,dedupeKey:'e2e-bad-number'},fixture)===null);

    const factTree=v5CeTree('physics'),factNode=factTree.byKey.get(fact.ownerKey);state.subject='physics';if(factNode)v5CeSelect(factNode.key);await sleep(100);
    const factCard=()=>document.querySelector(`[data-fact-id="${fact.id}"]`);
    check('fact active recall starts with answer hidden',Boolean(factCard()&&factCard().querySelector('[data-fact-reveal]')&&!factCard().querySelector('.v5-fact-answer')));
    factCard()?.querySelector('[data-fact-reveal]')?.click();await sleep(70);
    check('fact reveal shows reusable answer only after action',Boolean(factCard()?.querySelector('.v5-fact-answer')?.innerText.includes('不一定')));
    const historyBefore=fact.reviewData?.history?.length||0;factCard()?.querySelector('[data-fact-rate="know"]')?.click();await sleep(80);
    check('fact review schedules next review and hides answer again',Boolean((fact.reviewData?.history?.length||0)>historyBefore&&fact.dueISO&&!state.factReviewUi[fact.id]?.revealed));

    const gf={...fixture,id:'e2e-v5-generic-only',genericFactIds:[],reviewData:null};v5ApplyAnalysisToProblem(gf,{learningObjectType:'generic_fact',contextDependencyReason:'不需原題即可複習',regions:[],genericFacts:[{question:'最大靜摩擦力與正向力的關係為何？',answer:'最大靜摩擦力等於靜摩擦係數乘以正向力。',conceptNameZh:'靜摩擦力',standalone:true,dedupeKey:'e2e-generic-only',sourceEvidence:'來源題目的通則'}]});check('generic_fact classification creates standalone review object',gf.learningObjectType==='generic_fact'&&gf.genericFactIds.length===1);
    const pd={...fixture,id:'e2e-v5-diagram',genericFactIds:[],reviewData:null};v5ApplyAnalysisToProblem(pd,{learningObjectType:'problem_dependent',contextDependencyReason:'需要原題圖與數值',genericFacts:[],regions:[{id:'diagram',kind:'diagram',text:'受力圖',bbox:{x:-12,y:95,width:130,height:30},confidence:.95},{id:'empty',kind:'unknown',bbox:{x:10,y:10,width:0,height:2},confidence:.5}]});
    check('problem dependent preserves source dependency and clamps normalized geometry',pd.learningObjectType==='problem_dependent'&&pd.genericFactIds.length===0&&pd.regions.length===1&&pd.regions[0].bbox.x===0&&pd.regions[0].bbox.y===95&&pd.regions[0].bbox.width===100&&pd.regions[0].bbox.height===5,JSON.stringify(pd.regions));
    check('multiple-choice student and correct answers survive V5 analysis',pd.student?.[0]==='A'&&pd.correct?.[0]==='B');
    const mixed={...fixture,id:'e2e-v5-mixed',genericFactIds:[],reviewData:null};v5ApplyAnalysisToProblem(mixed,{learningObjectType:'mixed',contextDependencyReason:'原題可重做，也有可泛化通則',regions:[{id:'stem',kind:'question',text:'靜止',bbox:{x:20,y:20,width:25,height:8},confidence:.9}],genericFacts:[{question:'靜摩擦力何時等於最大靜摩擦力？',answer:'只有在恰好達到即將滑動的臨界狀態。',conceptCode:'PHY-NEWTON-STATIC-FRICTION',conceptNameZh:'靜摩擦力',confidence:.95,sourceType:'corrected_option',sourceEvidence:'錯誤選項',standalone:true,dedupeKey:'e2e-static-short'}]});check('mixed keeps source problem regions plus generic fact',mixed.learningObjectType==='mixed'&&mixed.genericFactIds.length===1&&mixed.regions.length===1);
    const low={...pd,regions:[{id:'low',kind:'answer',text:'模糊字跡',bbox:{x:20,y:20,width:20,height:8},confidence:.4},{id:'high',kind:'answer',text:'清楚字跡',bbox:{x:40,y:40,width:20,height:8},confidence:.95}]};
    check('low-confidence geometry refuses confident annotation',v5ResolveAction({kind:'underline',targetRegionId:'low'},low)===null);
    const highAction=v5ResolveAction({kind:'underline',targetRegionId:'high'},low);check('high-confidence geometry can ground annotation',Boolean(highAction&&highAction.x===40&&highAction.x2===60));

    state.subject='physics';state.selectedProblemId=fixture.id;state.page='notebook';save();render();await sleep(100);
    const originalGuideApi=v3GuideApi,apiCalls=[];
    v3GuideApi=async body=>{apiCalls.push({...body});if(body.mode==='direct')return{result:{mode:'direct',diagnosis:{studentOnRightTrack:false,blindSpot:'需要先辨認靜止條件',evidence:'QA direct',confidence:.99},stages:[{id:'direct-1',goal:'列出條件',stageType:'worked_step',promptToStudent:'先寫 ΣFₓ=0',waitForStudent:false,actions:[],successCriteria:'列式',revealFinalAnswer:false},{id:'direct-2',goal:'完成詳解',stageType:'final_explanation',promptToStudent:'靜摩擦力會依需求調整，直到最大值。',waitForStudent:false,actions:[],successCriteria:'理解結論',revealFinalAnswer:true}]}};const evaluated=body.requestType==='evaluate';return{result:{mode:'instructive',diagnosis:{studentOnRightTrack:evaluated,blindSpot:evaluated?'':'先辨認「保持靜止」代表什麼',evidence:evaluated?'新筆跡已有 ΣFₓ=0':'原作答把靜摩擦力視為固定最大值',confidence:.99},stages:[{id:`${body.requestType||'start'}-1`,goal:'只處理下一步',stageType:'hint',promptToStudent:evaluated?'方向對了，下一步比較所需摩擦力與最大值。':'保持靜止時，水平方向合力是多少？',waitForStudent:true,actions:[],expectedStudentEvidence:'寫出 ΣFₓ=0',successCriteria:'辨認靜止代表加速度為零',fallbackHint:'想牛頓第二運動定律',revealFinalAnswer:false}]}}};
    state.tutorSessions[fixture.id]=null;state.aiGuideMode='instructive';save();render();await sleep(40);document.querySelector('[data-action="guideStart"]')?.click();await sleep(240);
    let session=state.tutorSessions[fixture.id],stage=session?.stages?.[0];check('one tutor start click creates one request',apiCalls.length===1,String(apiCalls.length));check('blind-spot-first diagnosis exists',Boolean(session?.diagnosis?.blindSpot&&!session?.diagnosis?.studentOnRightTrack));check('first instructive tutor stage is gated',session?.stages?.length===1&&stage?.waitForStudent===true&&stage?.revealFinalAnswer===false);check('source-paper guide controls render',Boolean(document.getElementById('aiGuideCanvas')&&document.querySelector('[data-v5-tutor-try]')));
    document.querySelector('[data-v5-tutor-hint]')?.click();await sleep(220);session=state.tutorSessions[fixture.id];check('hint escalation sends exactly one additional request',apiCalls.length===2&&apiCalls.at(-1)?.requestType==='hint',String(apiCalls.length));check('hint escalation still does not reveal final answer',session?.assistanceLevel==='hint'&&session.stages.every(x=>x.revealFinalAnswer===false));
    document.querySelector('[data-v5-tutor-try]')?.click();await sleep(60);check('student try exposes re-read action',Boolean(document.querySelector('[data-v5-tutor-evaluate]')));
    if(window.drawing?.canvas){drawing.paths.push({tool:'pen',normalized:true,pts:[{x:.25,y:.55,p:.6},{x:.38,y:.55,p:.6},{x:.48,y:.6,p:.6}]});redrawCanvas();saveInk()}
    document.querySelector('[data-v5-tutor-evaluate]')?.click();await sleep(240);session=state.tutorSessions[fixture.id];const evalBody=apiCalls.at(-1);check('re-read new student work triggers one reevaluation request',apiCalls.length===3&&evalBody?.requestType==='evaluate'&&session?.attempts===1,String(apiCalls.length));check('reevaluation uses current worksheet image when available',Boolean(evalBody&&('imageBase64' in evalBody)));check('right-track reevaluation responds adaptively',session?.diagnosis?.studentOnRightTrack===true&&session?.stages?.at(-1)?.revealFinalAnswer===false);
    document.querySelector('[data-v5-tutor-mode="direct"]')?.click();await sleep(240);session=state.tutorSessions[fixture.id];check('direct solution is a deliberate separate mode',session?.mode==='direct'&&session?.stages?.length===2&&session.stages[0].revealFinalAnswer===false&&session.stages[1].revealFinalAnswer===true);check('direct mode start is one intentional request',apiCalls.length===4&&apiCalls.at(-1)?.mode==='direct',String(apiCalls.length));document.querySelector('[data-v5-tutor-next]')?.click();await sleep(80);session=state.tutorSessions[fixture.id];check('direct solution advances one gated step at a time',session?.activeIndex===1&&session?.stages?.[1]?.revealFinalAnswer===true);
    v3GuideApi=originalGuideApi;

    const domCounts=[];for(let cycle=0;cycle<6;cycle++){
      await go('concepts');const sid=['biology','physics','chemistry'][cycle%3];document.querySelector(`[data-subject="${sid}"]`)?.click();await sleep(35);const nodes=[...document.querySelectorAll('.v5-graph-node')];nodes[cycle%Math.max(1,nodes.length)]?.click();await sleep(30);await go('notebook');state.selectedProblemId=fixture.id;render();await sleep(30);window.v5TutorTestDemo({rightTrack:cycle%2===0,mode:'instructive'});await sleep(45);await go('concepts');await sleep(30);domCounts.push(document.querySelectorAll('*').length);check(`stress cycle ${cycle+1} cancels tutor animation`,v3GuideRuntime.playing===false)}
    const domSpread=Math.max(...domCounts)-Math.min(...domCounts);check('repeated concept tutor cycles do not grow DOM unbounded',domSpread<250,JSON.stringify(domCounts));check('rapid navigation leaves one selected graph node',document.querySelectorAll('.v5-graph-node.is-selected').length<=1);check('no horizontal body overflow',document.documentElement.scrollWidth<=document.documentElement.clientWidth+2,`${document.documentElement.scrollWidth}/${document.documentElement.clientWidth}`);

    state.v5QaPersistence={factId:fact.id,subject:state.subject,at:Date.now()};save();
    state.problems=state.problems.filter(p=>!String(p.id).startsWith('e2e-v5-'));state.genericFacts=(state.genericFacts||[]).filter(f=>!String(f.dedupeKey||'').startsWith('e2e-'));for(const k of Object.keys(state.tutorSessions||{}))if(String(k).startsWith('e2e-v5-'))delete state.tutorSessions[k];save();
    const failed=results.filter(x=>!x.ok),box=document.createElement('pre');box.id='e2e-product-v5-results';box.dataset.status=failed.length?'FAIL':'PASS';box.textContent=JSON.stringify({status:failed.length?'FAIL':'PASS',viewport:{w:innerWidth,h:innerHeight},domCounts,results},null,2);document.body.appendChild(box)
  }catch(err){try{if(typeof originalGuideApi!=='undefined')v3GuideApi=originalGuideApi}catch{}const box=document.createElement('pre');box.id='e2e-product-v5-results';box.dataset.status='FAIL';box.textContent=JSON.stringify({status:'FAIL',viewport:{w:innerWidth,h:innerHeight},error:String(err),results},null,2);document.body.appendChild(box)}finally{window.__v5ProductE2ERunning=false}
})();
