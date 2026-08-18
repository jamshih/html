// Wrong Book V21 — restore the proven bottom-anchored tutor behavior and harden problem/session isolation.
// This is intentionally a final compatibility layer: later feature modules may decorate the tutor,
// but they must not move the dialog, enlarge it into the page flow, or reuse another problem's answer.
(function(){
  'use strict';
  const VERSION='2026-08-18-tutor-stationary-restore-v21';
  if(window.__wrongbookTutorStationaryV21===VERSION)return;
  window.__wrongbookTutorStationaryV21=VERSION;

  const metrics=window.__wrongbookTutorStationaryV21Metrics={observerCallbacks:0,passes:0,domChanges:0,sessionRejects:0};
  let saveQueued=false,geometryQueued=false,observer=null,sessionWrapped=false;

  function problem(){try{return typeof selectedProblem==='function'?selectedProblem():null}catch{return null}}
  function normalizeText(value=''){return String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim()}
  function simpleHash(text=''){
    let h=2166136261;
    for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}
    return (h>>>0).toString(36);
  }
  function problemSignature(p){
    if(!p)return'';
    const source=[p.id||'',p.subject||'',p.conceptCode||'',normalizeText(p.problemText||p.title||'')].join('|');
    try{return typeof v3Hash==='function'?String(v3Hash(source)):simpleHash(source)}catch{return simpleHash(source)}
  }
  function sessionMatchesProblem(s,p){
    if(!s||!p)return false;
    return String(s.problemId||'')===String(p.id||'')&&String(s.subject||'')===String(p.subject||'')&&String(s.problemSignature||'')===problemSignature(p);
  }
  function stampSession(s,p){
    if(!s||!p)return s;
    const sig=problemSignature(p);let changed=false;
    if(String(s.problemId||'')!==String(p.id||'')){s.problemId=p.id;changed=true}
    if(String(s.subject||'')!==String(p.subject||'')){s.subject=p.subject;changed=true}
    if(String(s.problemSignature||'')!==sig){s.problemSignature=sig;changed=true}
    const snapshot=normalizeText(p.problemText||p.title||'').slice(0,240);
    if(String(s.problemTextSnapshot||'')!==snapshot){s.problemTextSnapshot=snapshot;changed=true}
    if(changed)queueSave();
    return s;
  }
  function queueSave(){
    if(saveQueued)return;saveQueued=true;
    queueMicrotask(()=>{saveQueued=false;try{if(typeof save==='function')save()}catch{}});
  }

  function installSessionGuard(){
    if(sessionWrapped)return true;
    if(typeof window.v5TutorSession!=='function'||typeof window.v5TutorEnsureSession!=='function')return false;
    const baseEnsure=window.v5TutorEnsureSession;
    const guardedSession=function(p=problem()){
      if(!p)return null;
      const sessions=(typeof state==='object'&&state&&state.tutorSessions&&typeof state.tutorSessions==='object')?state.tutorSessions:null;
      const s=sessions?.[p.id]||null;
      if(!s)return null;
      if(!sessionMatchesProblem(s,p)){
        sessions[p.id]=null;metrics.sessionRejects++;queueSave();
        return null;
      }
      return s;
    };
    const guardedEnsure=function(p,mode=(typeof state==='object'&&state?.aiGuideMode)||'instructive'){
      if(!p)return null;
      let s=guardedSession(p);
      if(!s||s.mode!==mode){
        if(state?.tutorSessions)state.tutorSessions[p.id]=null;
        s=baseEnsure.call(this,p,mode);
      }
      return stampSession(s,p);
    };
    window.v5TutorSession=guardedSession;
    window.v5TutorEnsureSession=guardedEnsure;
    try{v5TutorSession=guardedSession;v5TutorEnsureSession=guardedEnsure}catch{}
    sessionWrapped=true;
    window.__wrongbookTutorSessionIsolationV21=true;
    // Purge a legacy unscoped session immediately so stale content can never flash on first render.
    try{guardedSession(problem())}catch{}
    return true;
  }

  const STYLE_ID='wrongbookTutorStationaryV21Style';
  document.getElementById(STYLE_ID)?.remove();
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper{
      position:relative!important;
      box-sizing:border-box!important;
      min-height:var(--wb-v21-paper-min-height,760px)!important;
      height:auto!important;
      max-height:none!important;
      padding-bottom:520px!important;
      overflow:hidden!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock{
      box-sizing:border-box!important;
      animation:none!important;
      transition:none!important;
      clip-path:none!important;
      transform-origin:center bottom!important;
      scroll-behavior:auto!important;
      overscroll-behavior:contain!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock:not(.v6-tutor-collapsed){
      overflow:hidden!important;
      border-radius:16px!important;
      z-index:40!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock.wb-v21-session:not(.v6-tutor-collapsed){
      height:430px!important;
      min-height:430px!important;
      max-height:430px!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock.wb-v21-empty:not(.v6-tutor-collapsed){
      height:176px!important;
      min-height:176px!important;
      max-height:176px!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-stage{
      min-height:0!important;
      max-height:330px!important;
      overflow:hidden!important;
      align-content:start!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-stage>p{
      overflow:auto!important;
      overscroll-behavior:contain!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock .v8-ai-diagram,
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock [data-wb-dedicated-diagram="1"]{
      box-sizing:border-box!important;
      max-height:224px!important;
      overflow:hidden!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock .v8-ai-diagram>svg,
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock .wb-dd-stage{
      display:block!important;
      width:100%!important;
      height:184px!important;
      max-height:184px!important;
      min-height:0!important;
      aspect-ratio:auto!important;
      overflow:hidden!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock .wb-dd-body{
      max-height:214px!important;
      overflow:hidden!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock .wb-diagram-page-nav{
      position:static!important;
      inset:auto!important;
      margin:6px auto 0!important;
      transform:none!important;
    }

    /* The optional AI diagram remains a small draggable sticker, never a second page-sized panel. */
    html body .pf-problem-workspace .v9-sheet-ai-card{
      box-sizing:border-box!important;
      width:min(360px,calc(100% - 24px))!important;
      max-width:360px!important;
      max-height:310px!important;
      overflow:hidden!important;
    }
    html body .pf-problem-workspace .v9-sheet-ai-card .v8-ai-diagram>svg,
    html body .pf-problem-workspace .v9-sheet-ai-card .wb-dd-stage{
      width:100%!important;
      height:auto!important;
      max-height:220px!important;
      aspect-ratio:auto!important;
    }
    html body .pf-problem-workspace .v9-sheet-ai-card .wb-diagram-page-nav{position:static!important;margin:5px auto 0!important}

    /* Pen/eraser controls own the actual bottom edge. Tutor stays immediately above them. */
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper>.paper-toolbar,
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper>.ocrq-toolbar{
      position:absolute!important;
      left:12px!important;
      right:auto!important;
      top:auto!important;
      bottom:12px!important;
      margin:0!important;
      z-index:50!important;
      transform:none!important;
    }

    @media(min-width:701px){
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock{
        position:absolute!important;
        left:50%!important;
        right:auto!important;
        top:auto!important;
        bottom:76px!important;
        width:min(760px,calc(100% - 28px))!important;
        max-width:760px!important;
        min-width:0!important;
        margin:0!important;
        transform:translateX(-50%)!important;
      }
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock.v6-tutor-collapsed{
        width:min(440px,calc(100% - 28px))!important;
        min-height:0!important;
        height:auto!important;
        max-height:72px!important;
      }
    }
    @media(max-width:700px){
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper{padding-bottom:390px!important}
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock{
        position:fixed!important;
        left:8px!important;
        right:8px!important;
        top:auto!important;
        bottom:calc(74px + env(safe-area-inset-bottom))!important;
        width:auto!important;
        max-width:none!important;
        margin:0!important;
        transform:none!important;
      }
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock.wb-v21-session:not(.v6-tutor-collapsed){
        height:min(430px,48dvh)!important;
        min-height:min(330px,48dvh)!important;
        max-height:48dvh!important;
      }
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock.wb-v21-empty:not(.v6-tutor-collapsed){
        height:164px!important;min-height:164px!important;max-height:164px!important;
      }
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper>.paper-toolbar,
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper>.ocrq-toolbar{
        position:absolute!important;left:8px!important;bottom:10px!important;
      }
    }
  `;
  document.head.appendChild(style);

  function visible(el){
    if(!el)return false;
    const cs=getComputedStyle(el),r=el.getBoundingClientRect();
    return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0;
  }
  function promptBottom(paper){
    const selectors=['.ocrq-prompt-card','.paper-demo h4','.paper-demo .paper-option','.paper-demo .hand-note','.scan-text','.scan-photo'];
    const pr=paper.getBoundingClientRect();let bottom=0;
    for(const el of paper.querySelectorAll(selectors.join(','))){
      if(!visible(el)||el.closest('.v5-tutor-dock'))continue;
      bottom=Math.max(bottom,el.getBoundingClientRect().bottom-pr.top);
    }
    return bottom||24;
  }
  function setClass(el,name,on){
    if(!el)return;
    const has=el.classList.contains(name);if(has===on)return;
    el.classList.toggle(name,on);metrics.domChanges++;
  }
  function setProp(el,name,value){
    if(!el)return;
    const current=el.style.getPropertyValue(name);if(current===value)return;
    el.style.setProperty(name,value);metrics.domChanges++;
  }
  function syncGeometry(){
    geometryQueued=false;metrics.passes++;
    installSessionGuard();
    document.querySelectorAll('.pf-problem-workspace .v5-tutor-dock').forEach(dock=>{
      const paper=dock.closest('.v3-paper');if(!paper)return;
      setClass(paper,'wb-v21-stationary-paper',true);
      const p=problem(),s=p&&typeof window.v5TutorSession==='function'?window.v5TutorSession(p):null;
      const hasSession=Boolean(s&&Array.isArray(s.stages)&&s.stages.length);
      setClass(dock,'wb-v21-session',hasSession);
      setClass(dock,'wb-v21-empty',!hasSession);
      const open=!dock.classList.contains('v6-tutor-collapsed');
      const reserve=open?(hasSession?430:176):72;
      const min=Math.max(760,Math.ceil(promptBottom(paper)+30+reserve+92));
      setProp(paper,'--wb-v21-paper-min-height',`${min}px`);
      paper.dataset.wbV21Tutor='stationary';
      dock.dataset.wbV21Tutor='stationary';
    });
  }
  function queueGeometry(){
    metrics.observerCallbacks++;if(geometryQueued)return;
    geometryQueued=true;requestAnimationFrame(syncGeometry);
  }
  function mount(){
    installSessionGuard();
    const app=document.getElementById('app');if(!app)return setTimeout(mount,40);
    if(!observer&&typeof MutationObserver==='function'){
      observer=new MutationObserver(records=>{
        // Only child changes or tutor class changes can affect geometry. Ignore our paper style writes.
        if(records.some(r=>r.type==='childList'||(r.type==='attributes'&&r.target?.classList?.contains('v5-tutor-dock'))))queueGeometry();
      });
      observer.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
      window.__wrongbookTutorStationaryV21Observer=observer;
    }
    window.addEventListener('resize',queueGeometry,{passive:true});
    syncGeometry();
  }

  window.wrongbookTutorContextGuardQA=function(){
    const p=problem();
    if(!p)return{version:VERSION,pass:true,noProblem:true};
    const sig=problemSignature(p);
    const good={problemId:p.id,subject:p.subject,problemSignature:sig};
    const wrongSubject={problemId:p.id,subject:p.subject==='math'?'biology':'math',problemSignature:sig};
    const wrongText={problemId:p.id,subject:p.subject,problemSignature:'stale-'+sig};
    const legacy={problemId:p.id};
    return{version:VERSION,acceptsExact:sessionMatchesProblem(good,p),rejectsWrongSubject:!sessionMatchesProblem(wrongSubject,p),rejectsWrongProblemText:!sessionMatchesProblem(wrongText,p),rejectsLegacyUnscoped:!sessionMatchesProblem(legacy,p),pass:Boolean(sessionMatchesProblem(good,p)&&!sessionMatchesProblem(wrongSubject,p)&&!sessionMatchesProblem(wrongText,p)&&!sessionMatchesProblem(legacy,p))};
  };

  window.wrongbookTutorStationaryQA=function(){
    syncGeometry();
    const before=metrics.domChanges;syncGeometry();const idempotent=metrics.domChanges===before;
    const dock=document.querySelector('.pf-problem-workspace .v5-tutor-dock');
    const paper=dock?.closest('.v3-paper');
    if(!dock||!paper)return{version:VERSION,pass:true,tutorMounted:false,idempotent};
    const toolbar=paper.querySelector(':scope > .paper-toolbar,:scope > .ocrq-toolbar');
    const dr=dock.getBoundingClientRect(),pr=paper.getBoundingClientRect(),tr=toolbar?.getBoundingClientRect();
    const mobile=matchMedia('(max-width:700px)').matches,collapsed=dock.classList.contains('v6-tutor-collapsed');
    const cs=getComputedStyle(dock),expectedBottom=mobile?null:pr.bottom-76;
    const anchored=mobile?cs.position==='fixed':cs.position==='absolute'&&Math.abs(dr.bottom-expectedBottom)<=3;
    const widthOk=mobile||dr.width<=762;
    const toolbarAtBottom=!toolbar||Math.abs(pr.bottom-tr.bottom-12)<=4;
    const toolbarBelowTutor=!toolbar||collapsed||dr.bottom<=tr.top+2;
    const promptGap=dr.top-(pr.top+promptBottom(paper));
    const noPromptOverlap=collapsed||promptGap>=18;
    const p=problem(),s=p&&typeof window.v5TutorSession==='function'?window.v5TutorSession(p):null;
    const contextOk=!s||sessionMatchesProblem(s,p);
    const stickers=[...paper.querySelectorAll('.v9-sheet-ai-card')];
    const stickerOk=stickers.every(el=>el.getBoundingClientRect().width<=362&&el.getBoundingClientRect().height<=312);
    const ctxQA=window.wrongbookTutorContextGuardQA?.();
    const pass=Boolean(anchored&&widthOk&&toolbarAtBottom&&toolbarBelowTutor&&noPromptOverlap&&contextOk&&stickerOk&&idempotent&&ctxQA?.pass!==false);
    return{version:VERSION,pass,tutorMounted:true,mobile,collapsed,position:cs.position,dockWidth:Math.round(dr.width),dockHeight:Math.round(dr.height),anchored,widthOk,toolbarAtBottom,toolbarBelowTutor,promptGap:Math.round(promptGap),noPromptOverlap,contextOk,stickerOk,idempotent,sessionRejects:metrics.sessionRejects,metrics:{...metrics},contextQA:ctxQA};
  };

  mount();
})();
