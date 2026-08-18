// Wrong Book V21.2 — restore the proven V12h stationary tutor geometry and harden problem/session isolation.
// Product contract: the tutor is one bottom-anchored dialog inside the worksheet, grows upward only,
// never becomes a second page, never covers the pen toolbar, and never reuses another problem's answer.
(function(){
  'use strict';
  const VERSION='2026-08-18-tutor-stationary-restore-v21.2-v12h';
  if(window.__wrongbookTutorStationaryV21===VERSION)return;
  window.__wrongbookTutorStationaryV21=VERSION;
  document.documentElement.dataset.wbTutorStationary='v12h-restored';

  const MAX_OPEN_HEIGHT=420;
  const MIN_OPEN_HEIGHT=148;
  const PROMPT_GAP=32;
  const TOOLBAR_GAP=12;
  const DEFAULT_BOTTOM=82;
  const metrics=window.__wrongbookTutorStationaryV21Metrics={observerCallbacks:0,passes:0,domChanges:0,sessionRejects:0,calibrations:0};
  let saveQueued=false,geometryQueued=false,observer=null,sessionWrapped=false,purgeRenderQueued=false;

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
  function queueSave(){
    if(saveQueued)return;saveQueued=true;
    queueMicrotask(()=>{saveQueued=false;try{if(typeof save==='function')save()}catch{}});
  }
  function queuePurgeRender(){
    if(purgeRenderQueued)return;purgeRenderQueued=true;
    requestAnimationFrame(()=>{purgeRenderQueued=false;try{if(typeof render==='function')render()}catch{}});
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
        sessions[p.id]=null;metrics.sessionRejects++;queueSave();queuePurgeRender();
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
      overflow:hidden!important;
    }

    /* Restore V12h: one stationary dialog, full worksheet width, natural height, grows upward. */
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock{
      box-sizing:border-box!important;
      animation:none!important;
      transition:none!important;
      clip-path:none!important;
      transform:none!important;
      transform-origin:center bottom!important;
      scroll-behavior:auto!important;
      overscroll-behavior:contain!important;
      z-index:40!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock:not(.v6-tutor-collapsed){
      height:auto!important;
      min-height:0!important;
      max-height:var(--wb-v21-tutor-max-height,${MAX_OPEN_HEIGHT}px)!important;
      overflow-x:hidden!important;
      overflow-y:auto!important;
      border-radius:16px!important;
    }

    /* Undo the later V16/V20 fixed-height frame that produced the giant blank dialog in the screenshots. */
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock .v5-tutor-stage.v16-stable-stage,
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock .v5-tutor-stage{
      display:flex!important;
      flex-direction:column!important;
      height:auto!important;
      min-height:0!important;
      max-height:none!important;
      grid-template-rows:none!important;
      align-content:initial!important;
      overflow:visible!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-stage.v16-stable-stage>.v5-tutor-stage-head,
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-stage>.v5-tutor-stage-head{
      height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;flex:0 0 auto!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-stage.v16-stable-stage>p,
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-stage>p{
      height:auto!important;min-height:0!important;max-height:164px!important;overflow:auto!important;margin:8px 0!important;padding:4px 0!important;flex:0 1 auto!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-stage.v16-stable-stage>.v5-tutor-actions,
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-stage>.v5-tutor-actions{
      height:auto!important;min-height:0!important;max-height:112px!important;overflow:auto!important;flex:0 1 auto!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v16-canonical-nav{
      flex:0 0 auto!important;margin-top:6px!important;margin-bottom:4px!important;
    }

    /* Diagram stays inside the dialog. It cannot turn the tutor into a second scrolling page. */
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock .v8-ai-diagram,
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock [data-wb-dedicated-diagram="1"]{
      box-sizing:border-box!important;max-height:216px!important;overflow:hidden!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock .v8-ai-diagram>svg,
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock .wb-dd-stage{
      display:block!important;width:100%!important;height:176px!important;max-height:176px!important;min-height:0!important;aspect-ratio:auto!important;overflow:hidden!important;
    }
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock .wb-dd-body{max-height:206px!important;overflow:hidden!important}
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock .wb-diagram-page-nav{position:static!important;inset:auto!important;margin:5px auto 0!important;transform:none!important}

    /* Optional AI diagram remains the small draggable sticker. */
    html body .pf-problem-workspace .v9-sheet-ai-card{box-sizing:border-box!important;width:min(360px,calc(100% - 24px))!important;max-width:360px!important;max-height:310px!important;overflow:hidden!important}
    html body .pf-problem-workspace .v9-sheet-ai-card .v8-ai-diagram>svg,
    html body .pf-problem-workspace .v9-sheet-ai-card .wb-dd-stage{width:100%!important;height:auto!important;max-height:220px!important;aspect-ratio:auto!important}
    html body .pf-problem-workspace .v9-sheet-ai-card .wb-diagram-page-nav{position:static!important;margin:5px auto 0!important}

    /* Pen/eraser controls own the paper's actual bottom edge. */
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper>.paper-toolbar,
    html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper>.ocrq-toolbar{
      position:absolute!important;left:12px!important;right:auto!important;top:auto!important;bottom:12px!important;margin:0!important;z-index:50!important;transform:none!important;
    }

    @media(min-width:701px){
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock{
        position:absolute!important;
        left:12px!important;
        right:12px!important;
        top:auto!important;
        bottom:var(--wb-v21-tutor-bottom,${DEFAULT_BOTTOM}px)!important;
        width:auto!important;
        max-width:none!important;
        min-width:0!important;
        margin:0!important;
      }
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock.v6-tutor-collapsed{
        left:auto!important;right:12px!important;width:min(440px,calc(100% - 24px))!important;height:auto!important;min-height:0!important;max-height:72px!important;
      }
    }
    @media(max-width:700px){
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock{
        position:fixed!important;left:7px!important;right:7px!important;top:auto!important;bottom:calc(74px + env(safe-area-inset-bottom))!important;width:auto!important;max-width:none!important;margin:0!important;transform:none!important;
      }
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper .v5-tutor-dock:not(.v6-tutor-collapsed){max-height:min(var(--wb-v21-tutor-max-height,${MAX_OPEN_HEIGHT}px),42dvh)!important}
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper>.paper-toolbar,
      html body .pf-problem-workspace .v3-paper.wb-v21-stationary-paper>.ocrq-toolbar{left:8px!important;bottom:10px!important}
    }
  `;
  document.head.appendChild(style);

  function visible(el){
    if(!el)return false;
    const cs=getComputedStyle(el),r=el.getBoundingClientRect();
    return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0;
  }
  function promptBottom(paper){
    const selectors=['.ocrq-prompt-card','.paper-demo>h4','.paper-demo>.options','.paper-demo>.hand-note','.paper-demo .paper-option','.scan-text','.scan-photo'];
    const pr=paper.getBoundingClientRect();let bottom=0;
    for(const el of paper.querySelectorAll(selectors.join(','))){
      if(!visible(el)||el.closest('.v5-tutor-dock'))continue;
      bottom=Math.max(bottom,el.getBoundingClientRect().bottom-pr.top);
    }
    return bottom||24;
  }
  function directToolbar(paper){return paper.querySelector(':scope > .paper-toolbar,:scope > .ocrq-toolbar')}
  function setClass(el,name,on){
    if(!el)return false;const has=el.classList.contains(name);if(has===on)return false;
    el.classList.toggle(name,on);metrics.domChanges++;return true;
  }
  function setProp(el,name,value){
    if(!el)return false;const current=el.style.getPropertyValue(name);if(current===value)return false;
    el.style.setProperty(name,value);metrics.domChanges++;return true;
  }
  function naturalDockHeight(dock){
    if(!dock)return MIN_OPEN_HEIGHT;
    const r=dock.getBoundingClientRect();
    return Math.max(MIN_OPEN_HEIGHT,Math.min(MAX_OPEN_HEIGHT,Math.ceil(Math.max(r.height,dock.scrollHeight||0))));
  }
  function calibrateBottom(paper,dock,toolbar,attempt=0){
    if(!paper||!dock||!toolbar||matchMedia('(max-width:700px)').matches)return;
    const dr=dock.getBoundingClientRect(),tr=toolbar.getBoundingClientRect();
    const target=tr.top-TOOLBAR_GAP;
    const delta=dr.bottom-target;
    if(Math.abs(delta)<=1)return;
    const raw=parseFloat(paper.style.getPropertyValue('--wb-v21-tutor-bottom'))||DEFAULT_BOTTOM;
    const next=Math.max(72,Math.min(220,raw+delta));
    if(setProp(paper,'--wb-v21-tutor-bottom',`${Math.round(next*10)/10}px`))metrics.calibrations++;
    if(attempt<2)requestAnimationFrame(()=>calibrateBottom(paper,dock,toolbar,attempt+1));
  }
  function syncOne(dock){
    const paper=dock?.closest('.v3-paper');if(!paper)return;
    setClass(paper,'wb-v21-stationary-paper',true);
    const p=problem(),s=p&&typeof window.v5TutorSession==='function'?window.v5TutorSession(p):null;
    const hasSession=Boolean(s&&Array.isArray(s.stages)&&s.stages.length);
    setClass(dock,'wb-v21-session',hasSession);setClass(dock,'wb-v21-empty',!hasSession);
    const toolbar=directToolbar(paper);
    const toolbarHeight=toolbar&&visible(toolbar)?Math.ceil(toolbar.getBoundingClientRect().height):54;
    const open=!dock.classList.contains('v6-tutor-collapsed');
    const budget=open?naturalDockHeight(dock):72;
    const min=Math.max(760,Math.ceil(promptBottom(paper)+PROMPT_GAP+budget+toolbarHeight+54));
    setProp(paper,'--wb-v21-paper-min-height',`${min}px`);
    setProp(paper,'--wb-v21-tutor-max-height',`${Math.min(MAX_OPEN_HEIGHT,Math.max(MIN_OPEN_HEIGHT,budget))}px`);
    if(!paper.style.getPropertyValue('--wb-v21-tutor-bottom'))setProp(paper,'--wb-v21-tutor-bottom',`${DEFAULT_BOTTOM}px`);
    paper.dataset.wbV21Tutor='stationary-v12h';dock.dataset.wbV21Tutor='stationary-v12h';
    if(toolbar&&open)requestAnimationFrame(()=>calibrateBottom(paper,dock,toolbar));
  }
  function syncGeometry(){
    geometryQueued=false;metrics.passes++;installSessionGuard();
    document.querySelectorAll('.pf-problem-workspace .v5-tutor-dock').forEach(syncOne);
  }
  function queueGeometry(){metrics.observerCallbacks++;if(geometryQueued)return;geometryQueued=true;requestAnimationFrame(syncGeometry)}
  function mount(){
    installSessionGuard();
    const app=document.getElementById('app');if(!app)return setTimeout(mount,40);
    if(!observer&&typeof MutationObserver==='function'){
      observer=new MutationObserver(records=>{
        if(records.some(r=>r.type==='childList'||(r.type==='attributes'&&r.target?.classList?.contains('v5-tutor-dock'))))queueGeometry();
      });
      observer.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
      window.__wrongbookTutorStationaryV21Observer=observer;
    }
    window.addEventListener('resize',queueGeometry,{passive:true});
    syncGeometry();
  }

  window.wrongbookTutorContextGuardQA=function(){
    const p=problem();if(!p)return{version:VERSION,pass:true,noProblem:true};
    const sig=problemSignature(p),good={problemId:p.id,subject:p.subject,problemSignature:sig},wrongSubject={problemId:p.id,subject:p.subject==='math'?'biology':'math',problemSignature:sig},wrongText={problemId:p.id,subject:p.subject,problemSignature:'stale-'+sig},legacy={problemId:p.id};
    const pass=sessionMatchesProblem(good,p)&&!sessionMatchesProblem(wrongSubject,p)&&!sessionMatchesProblem(wrongText,p)&&!sessionMatchesProblem(legacy,p);
    return{version:VERSION,acceptsExact:sessionMatchesProblem(good,p),rejectsWrongSubject:!sessionMatchesProblem(wrongSubject,p),rejectsWrongProblemText:!sessionMatchesProblem(wrongText,p),rejectsLegacyUnscoped:!sessionMatchesProblem(legacy,p),pass};
  };

  window.wrongbookTutorStationaryQA=function(){
    syncGeometry();
    const dock=document.querySelector('.pf-problem-workspace .v5-tutor-dock'),paper=dock?.closest('.v3-paper');
    if(!dock||!paper)return{version:VERSION,pass:true,tutorMounted:false};
    const toolbar=directToolbar(paper);if(toolbar&&!dock.classList.contains('v6-tutor-collapsed'))calibrateBottom(paper,dock,toolbar);
    const before=metrics.domChanges;syncGeometry();const idempotent=metrics.domChanges===before;
    const dr=dock.getBoundingClientRect(),pr=paper.getBoundingClientRect(),tr=toolbar?.getBoundingClientRect();
    const mobile=matchMedia('(max-width:700px)').matches,collapsed=dock.classList.contains('v6-tutor-collapsed'),cs=getComputedStyle(dock);
    const stationary=mobile?cs.position==='fixed':cs.position==='absolute';
    const toolbarAtBottom=!toolbar||Math.abs(pr.bottom-tr.bottom-(mobile?10:12))<=5;
    const toolbarGap=!toolbar||collapsed?999:tr.top-dr.bottom;
    const toolbarClear=!toolbar||collapsed||toolbarGap>=TOOLBAR_GAP-2;
    const promptGap=dr.top-(pr.top+promptBottom(paper));
    const noPromptOverlap=collapsed||promptGap>=PROMPT_GAP-2;
    const heightOk=collapsed||dr.height<=MAX_OPEN_HEIGHT+2;
    const widthOk=mobile||dr.width<=pr.width-20;
    const p=problem(),s=p&&typeof window.v5TutorSession==='function'?window.v5TutorSession(p):null,contextOk=!s||sessionMatchesProblem(s,p);
    const stickers=[...paper.querySelectorAll('.v9-sheet-ai-card')],stickerOk=stickers.every(el=>{const r=el.getBoundingClientRect();return r.width<=362&&r.height<=312});
    const children=[...dock.children].filter(visible),lastBottom=children.length?Math.max(...children.map(el=>el.getBoundingClientRect().bottom)):dr.top,deadSpace=Math.max(0,dr.bottom-lastBottom);
    const compactEnough=collapsed||deadSpace<=84;
    const ctxQA=window.wrongbookTutorContextGuardQA?.();
    const pass=Boolean(stationary&&toolbarAtBottom&&toolbarClear&&noPromptOverlap&&heightOk&&widthOk&&contextOk&&stickerOk&&compactEnough&&idempotent&&ctxQA?.pass!==false);
    return{version:VERSION,restoredFrom:'v12h',pass,tutorMounted:true,mobile,collapsed,position:cs.position,dockWidth:Math.round(dr.width),dockHeight:Math.round(dr.height),stationary,toolbarAtBottom,toolbarGap:Math.round(toolbarGap),toolbarClear,promptGap:Math.round(promptGap),noPromptOverlap,heightOk,widthOk,deadSpace:Math.round(deadSpace),compactEnough,contextOk,stickerOk,idempotent,sessionRejects:metrics.sessionRejects,metrics:{...metrics},contextQA:ctxQA};
  };

  mount();
})();
