// Cross-subject QA for the Earth-derived Wrongbook Mind Map Making Skill.
// Runs only with ?mindmapskillqa=1. Earth Science has its own source-truth gate,
// so this gate covers the remaining curriculum-driven subjects and every chapter.
(function(){
  const params=new URLSearchParams(location.search);
  if(params.get('mindmapskillqa')!=='1')return;

  const NON_EARTH=['chinese','english','math','physics','chemistry','biology','history','geography','civics'];
  const EPS=1.5;
  const viewportKind=innerWidth<=720?'mobile':'desktop';
  const rect=o=>{const r=o.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
  const visible=o=>{const s=getComputedStyle(o),r=o.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>0.5&&r.height>0.5};
  const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>EPS&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>EPS;
  const cssPx=(o,p)=>parseFloat(getComputedStyle(o)[p])||0;
  const within=(a,b,t=2)=>a.left>=b.left-t&&a.right<=b.right+t&&a.top>=b.top-t&&a.bottom<=b.bottom+t;
  // requestAnimationFrame can remain suspended in headless --dump-dom runs. A short
  // timer settles synchronous render/CSS layout reliably in both CI and browsers.
  const wait=()=>new Promise(r=>setTimeout(r,24));
  const forbiddenSelectors=['.v4tb-mascot','.v4tb-page-number','.v4tb-page-carry','.v4tb-continuation','.v4tb-blank-no','.v4tb-book-badge','.v4tb-paper-strip'];

  function addIssue(report,type,node,extra={}){
    report.issues.push({type,id:node?.dataset?.v4tbPoint||node?.dataset?.v4tbSection||node?.dataset?.v4tbFigureOwner||node?.className||'',...extra});
    report.totals[type]=(report.totals[type]||0)+1;
  }

  function inspect(subjectId,chapter,curriculum){
    const report={subject:subjectId,chapter:chapter.id||chapter.title,chapterTitle:chapter.title,expectedPoints:0,renderedPoints:0,expectedSections:(chapter.sections||[]).length,renderedSections:0,issues:[],totals:{}};
    report.expectedPoints=(chapter.sections||[]).reduce((n,s)=>n+(s.points||[]).length,0);
    const sheet=document.querySelector('.v4tb-knowledge-map');
    if(!sheet){addIssue(report,'missingMindMap',null);return report;}
    const sheetRect=rect(sheet);
    const recalls=[...sheet.querySelectorAll('.v4tb-recall')].filter(visible);
    const sections=[...sheet.querySelectorAll('.v4tb-branch')].filter(visible);
    const figures=[...sheet.querySelectorAll('.v4tb-center-visual,.v4tb-flow-visual')].filter(visible);
    const inputs=[...sheet.querySelectorAll('.v4tb-answer')].filter(visible);
    report.renderedPoints=recalls.length;
    report.renderedSections=sections.length;
    if(recalls.length!==report.expectedPoints)addIssue(report,'canonicalCountMismatch',sheet,{expected:report.expectedPoints,actual:recalls.length});
    if(inputs.length!==report.expectedPoints)addIssue(report,'inputCountMismatch',sheet,{expected:report.expectedPoints,actual:inputs.length});
    if(sections.length!==report.expectedSections)addIssue(report,'sectionCountMismatch',sheet,{expected:report.expectedSections,actual:sections.length});

    const ids=recalls.map(x=>x.dataset.v4tbPoint).filter(Boolean);
    const dups=[...new Set(ids.filter((x,i)=>ids.indexOf(x)!==i))];
    for(const id of dups)addIssue(report,'duplicatePointOwner',sheet,{point:id});

    for(const sel of forbiddenSelectors){
      for(const n of [...document.querySelectorAll(sel)].filter(visible))addIssue(report,'forbiddenArtifact',n,{selector:sel});
    }
    const bodyText=sheet.innerText||'';
    if(/(?:^|\s)(?:Page|頁)\s*\d+/i.test(bodyText))addIssue(report,'pageIndexText',sheet);

    if(sheet.scrollWidth>sheet.clientWidth+2)addIssue(report,'horizontalOverflow',sheet,{scrollWidth:sheet.scrollWidth,clientWidth:sheet.clientWidth});
    if(sheetRect.left<-2||sheetRect.right>innerWidth+2)addIssue(report,'viewportOverflow',sheet,{left:sheetRect.left,right:sheetRect.right,viewport:innerWidth});

    for(const input of inputs){
      const ir=rect(input),owner=input.closest('.v4tb-recall');
      if(!within(ir,sheetRect,2))addIssue(report,'inputOutsideMap',input,{rect:ir});
      if(owner&&!within(ir,rect(owner),4))addIssue(report,'inputOutsideOwner',input,{owner:owner.dataset.v4tbPoint});
      if(cssPx(input,'fontSize')<(viewportKind==='mobile'?12:13))addIssue(report,'microFont',input,{fontSize:cssPx(input,'fontSize')});
    }

    for(const q of [...sheet.querySelectorAll('.v4tb-question')].filter(visible)){
      const qr=rect(q),owner=q.closest('.v4tb-recall');
      if(owner&&!within(qr,rect(owner),4))addIssue(report,'textOutsideOwner',q,{owner:owner.dataset.v4tbPoint});
      if(!within(qr,sheetRect,2))addIssue(report,'textOutsideMap',q);
      if(cssPx(q,'fontSize')<(viewportKind==='mobile'?11.5:12.5))addIssue(report,'microFont',q,{fontSize:cssPx(q,'fontSize')});
    }

    for(let i=0;i<recalls.length;i++)for(let j=i+1;j<recalls.length;j++){
      const a=recalls[i],b=recalls[j];
      if(a.closest('.v4tb-branch')!==b.closest('.v4tb-branch'))continue;
      if(overlap(rect(a),rect(b)))addIssue(report,'recallRecallCollision',a,{a:a.dataset.v4tbPoint,b:b.dataset.v4tbPoint});
    }
    for(const q of recalls)for(const f of figures){
      if(q.closest('.v4tb-branch')!==f.closest('.v4tb-branch'))continue;
      if(overlap(rect(q),rect(f)))addIssue(report,'recallFigureCollision',q,{point:q.dataset.v4tbPoint,figure:f.dataset.v4tbFigureOwner||''});
    }

    for(const sec of sections){
      const ribbon=sec.querySelector('.v4tb-section-ribbon');
      if(!ribbon||!visible(ribbon))continue;
      const rr=rect(ribbon);
      for(const q of [...sec.querySelectorAll('.v4tb-recall')].filter(visible))if(overlap(rr,rect(q)))addIssue(report,'ribbonContentCollision',q,{point:q.dataset.v4tbPoint});
      for(const f of [...sec.querySelectorAll('.v4tb-center-visual,.v4tb-flow-visual')].filter(visible))if(overlap(rr,rect(f)))addIssue(report,'ribbonFigureCollision',f,{figure:f.dataset.v4tbFigureOwner||''});
    }

    for(const n of [...sheet.querySelectorAll('.v4tb-inline-line,.v4tb-hint,.v4tb-truth,.v4tb-section-ribbon span')].filter(visible)){
      if(n.scrollWidth>n.clientWidth+3&&getComputedStyle(n).whiteSpace==='nowrap')addIssue(report,'clippedText',n,{scrollWidth:n.scrollWidth,clientWidth:n.clientWidth});
    }
    return report;
  }

  async function run(){
    const previous={page:state.page,subject:state.subject,conceptChapter:state.conceptChapter};
    const results=[];
    if(document.fonts?.ready)await document.fonts.ready;
    for(const subjectId of NON_EARTH){
      const curriculum=twCurriculumSubject(subjectId);
      if(!curriculum||!(curriculum.chapters||[]).length){results.push({subject:subjectId,chapter:null,issues:[{type:'missingCurriculum'}],totals:{missingCurriculum:1}});continue;}
      for(const chapter of curriculum.chapters){
        state.page='mindmap';state.subject=subjectId;state.conceptChapter=chapter.title;
        render();await wait();
        results.push(inspect(subjectId,chapter,curriculum));
      }
    }
    const totals={};
    for(const r of results)for(const [k,v] of Object.entries(r.totals||{}))totals[k]=(totals[k]||0)+v;
    const chaptersExpected=NON_EARTH.reduce((n,id)=>n+(twCurriculumSubject(id)?.chapters?.length||0),0);
    const chaptersRendered=results.filter(r=>r.chapter).length;
    const canonicalExpected=results.reduce((n,r)=>n+(r.expectedPoints||0),0);
    const canonicalRendered=results.reduce((n,r)=>n+(r.renderedPoints||0),0);
    const status=(chaptersRendered===chaptersExpected&&canonicalExpected===canonicalRendered&&Object.values(totals).every(v=>v===0))?'PASS':'FAIL';
    state.page=previous.page;state.subject=previous.subject;state.conceptChapter=previous.conceptChapter;
    const payload={status,viewport:viewportKind,width:innerWidth,height:innerHeight,subjects:NON_EARTH,subjectsExpected:NON_EARTH.length,chaptersExpected,chaptersRendered,canonicalExpected,canonicalRendered,totals,reports:results};
    document.documentElement.innerHTML=`<head><meta charset="utf-8"><title>Mind Map Skill QA ${status}</title></head><body><pre id="mindmap-skill-qa-results" data-status="${status}">${esc(JSON.stringify(payload,null,2))}</pre></body>`;
  }
  run().catch(err=>{
    const payload={status:'FAIL',fatal:String(err?.stack||err)};
    document.documentElement.innerHTML=`<head><meta charset="utf-8"><title>Mind Map Skill QA FAIL</title></head><body><pre id="mindmap-skill-qa-results" data-status="FAIL">${esc(JSON.stringify(payload,null,2))}</pre></body>`;
  });
})();
