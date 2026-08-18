// Wrong Book V16e — single canonical compact tutor navigator, idempotent under DOM observers.
// Owns visual shape + persistence + in-place paging. Legacy navigators are removed and never allowed to flash back in.
(function(){
  const VERSION='2026-08-18-tutor-nav-visual-v16e-idempotent';
  if(window.__wrongbookTutorNavVisualV16===VERSION)return;
  window.__wrongbookTutorNavVisualV16=VERSION;

  const STYLE_ID='wrongbookTutorNavVisualV16Style';
  document.getElementById(STYLE_ID)?.remove();
  const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
    .v5-tutor-history-nav,.v7-tutor-step-nav,.v5-tutor-step-nav{display:none!important}
    .v14-tutor-nav.v15-tutor-nav.v16-canonical-nav{width:168px!important;height:44px!important;margin:8px auto 10px!important;display:grid!important;grid-template-columns:44px 52px 44px!important;align-items:center!important;justify-content:center!important;gap:14px!important;padding:0!important;border:0!important;background:transparent!important;flex:0 0 auto!important}
    .v14-tutor-nav.v15-tutor-nav.v16-canonical-nav button{box-sizing:border-box!important;width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;max-width:44px!important;max-height:44px!important;padding:0!important;display:grid!important;place-items:center!important;border:1px solid #deddd8!important;border-radius:13px!important;background:#fffdf9!important;color:#62665f!important;box-shadow:none!important;font-family:inherit!important;font-size:24px!important;font-weight:650!important;line-height:1!important;transform:none!important;transition:none!important}
    .v14-tutor-nav.v15-tutor-nav.v16-canonical-nav button:disabled{opacity:1!important;color:#d2d2ce!important;border-color:#ecebe7!important;cursor:default!important}
    .v14-tutor-nav.v15-tutor-nav.v16-canonical-nav .v14-tutor-nav-count{box-sizing:border-box!important;width:52px!important;min-width:52px!important;max-width:52px!important;height:44px!important;display:grid!important;place-items:center!important;padding:0!important;margin:0!important;color:#666a63!important;font-size:15px!important;font-weight:800!important;line-height:1!important;white-space:nowrap!important;text-align:center!important;font-variant-numeric:tabular-nums!important}
    .v5-tutor-dock.v16-canonical-frame:not(.v6-tutor-collapsed){animation:none!important;transition:none!important;clip-path:none!important;opacity:1!important;transform:none!important;overflow-anchor:none!important}
    .v5-tutor-dock.v16-inplace-step:not(.v6-tutor-collapsed){height:var(--v16-frame-height)!important;min-height:var(--v16-frame-height)!important;max-height:var(--v16-frame-height)!important}
    .v5-tutor-stage.v16-stable-stage{height:350px!important;min-height:350px!important;max-height:350px!important;display:grid!important;grid-template-rows:42px 142px 80px 72px!important;align-content:start!important;overflow:hidden!important}
    .v5-tutor-stage.v16-stable-stage>.v5-tutor-stage-head{min-height:42px!important;max-height:42px!important;overflow:hidden!important}
    .v5-tutor-stage.v16-stable-stage>p{min-height:142px!important;height:142px!important;max-height:142px!important;overflow:auto!important;margin:0!important;padding:12px 0 8px!important;scrollbar-gutter:stable!important}
    .v5-tutor-stage.v16-stable-stage>.v5-tutor-actions{min-height:72px!important;height:72px!important;max-height:72px!important;overflow:auto!important}
    @media(max-width:700px){.v14-tutor-nav.v15-tutor-nav.v16-canonical-nav{width:152px!important;height:40px!important;grid-template-columns:40px 48px 40px!important;gap:12px!important;margin:7px auto 9px!important}.v14-tutor-nav.v15-tutor-nav.v16-canonical-nav button{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important;max-width:40px!important;max-height:40px!important;border-radius:12px!important;font-size:22px!important}.v14-tutor-nav.v15-tutor-nav.v16-canonical-nav .v14-tutor-nav-count{width:48px!important;min-width:48px!important;max-width:48px!important;height:40px!important;font-size:14px!important}.v5-tutor-stage.v16-stable-stage{height:380px!important;min-height:380px!important;max-height:380px!important;grid-template-rows:42px 174px 74px 78px!important}.v5-tutor-stage.v16-stable-stage>p{min-height:174px!important;height:174px!important;max-height:174px!important}.v5-tutor-stage.v16-stable-stage>.v5-tutor-actions{min-height:78px!important;height:78px!important;max-height:78px!important}}
  `;document.head.appendChild(style);

  const metrics=window.__wrongbookTutorNavV16Metrics={observerCallbacks:0,normalizationPasses:0,domChanges:0,lastChangeAt:0};
  const currentProblem=()=>{try{return typeof selectedProblem==='function'?selectedProblem():null}catch{return null}};
  const currentSession=()=>{try{const p=currentProblem();if(!p)return null;return typeof v5TutorSession==='function'?v5TutorSession(p):(state?.tutorSessions?.[p.id]||null)}catch{return null}};
  function navMarkup(s){const total=Array.isArray(s?.stages)?s.stages.length:0;if(total<=1)return'';const current=Math.max(0,Math.min(total-1,Number(s.activeIndex)||0));return `<div class="v14-tutor-nav v15-tutor-nav v16-canonical-nav" role="group" aria-label="解題步驟導覽"><button type="button" data-v15-tutor-prev ${current<=0?'disabled':''} aria-label="上一步">‹</button><span class="v14-tutor-nav-count" aria-live="polite">${current+1} / ${total}</span><button type="button" data-v15-tutor-next ${current>=total-1?'disabled':''} aria-label="下一步">›</button></div>`}
  function installRenderer(){try{if(window.v5TutorStepNav!==navMarkup)window.v5TutorStepNav=navMarkup;if(typeof v5TutorStepNav==='function'&&v5TutorStepNav!==navMarkup)v5TutorStepNav=navMarkup}catch{}}
  function changed(){metrics.domChanges++;metrics.lastChangeAt=performance.now?.()||Date.now()}
  function removeLegacy(){let n=0;document.querySelectorAll('.v5-tutor-history-nav,.v7-tutor-step-nav,.v5-tutor-step-nav').forEach(el=>{el.remove();n++});if(n)changed();return n}
  function addClasses(el,...names){if(!el)return false;let did=false;for(const name of names){if(!el.classList.contains(name)){el.classList.add(name);did=true}}if(did)changed();return did}
  function ensureCanonical(){
    metrics.normalizationPasses++;
    installRenderer();removeLegacy();
    const dock=document.querySelector('.v5-tutor-dock'),stage=dock?.querySelector('.v5-tutor-stage'),s=currentSession();
    addClasses(dock,'v16-canonical-frame','v15-tutor-frame-stable','v17-tutor-frame-fixed');
    addClasses(stage,'v16-stable-stage');
    if(!stage)return null;
    const total=Array.isArray(s?.stages)?s.stages.length:0;
    let navs=[...stage.querySelectorAll(':scope > .v14-tutor-nav')];
    if(total<=1){if(navs.length){navs.forEach(el=>el.remove());changed()}return null}
    let nav=navs.find(el=>el.classList.contains('v16-canonical-nav'))||null;
    if(!nav){const holder=document.createElement('div');holder.innerHTML=navMarkup(s);nav=holder.firstElementChild;const old=navs[0];if(old)old.replaceWith(nav);else stage.insertBefore(nav,stage.querySelector(':scope > .v5-tutor-actions')||null);changed()}
    const extras=[...stage.querySelectorAll(':scope > .v14-tutor-nav')].filter(el=>el!==nav);if(extras.length){extras.forEach(el=>el.remove());changed()}
    addClasses(nav,'v15-tutor-nav','v16-canonical-nav');
    const index=Math.max(0,Math.min(total-1,Number(s.activeIndex)||0)),prev=nav.querySelector('[data-v15-tutor-prev]'),next=nav.querySelector('[data-v15-tutor-next]'),count=nav.querySelector('.v14-tutor-nav-count'),label=`${index+1} / ${total}`;
    const prevDisabled=index<=0,nextDisabled=index>=total-1;
    if(prev&&prev.disabled!==prevDisabled)prev.disabled=prevDisabled;
    if(next&&next.disabled!==nextDisabled)next.disabled=nextDisabled;
    // Critical: do not assign textContent when it is already correct. Replacing the text node on every
    // MutationObserver pass created a self-sustaining rAF/mutation loop that could freeze the problem page.
    if(count&&count.textContent!==label){count.textContent=label;changed()}
    return nav;
  }
  function bindActions(stageEl){if(!stageEl)return;stageEl.querySelector('[data-v5-tutor-try]')?.addEventListener('click',()=>v5TutorTry());stageEl.querySelector('[data-v5-tutor-evaluate]')?.addEventListener('click',()=>v5TutorEvaluate());stageEl.querySelector('[data-v5-tutor-hint]')?.addEventListener('click',()=>v5TutorHint());stageEl.querySelector('[data-v5-tutor-next]')?.addEventListener('click',()=>v5TutorNextDirect());stageEl.querySelector('[data-v5-tutor-latest]')?.addEventListener('click',()=>{const s=currentSession();if(s?.stages?.length)goInPlace(s.stages.length-1)})}
  function updateStageDom(p,s,guide){
    const dock=document.querySelector('.v5-tutor-dock'),stageEl=dock?.querySelector('.v5-tutor-stage');if(!dock||!stageEl)return false;
    const rect=dock.getBoundingClientRect(),scroll=dock.scrollTop;dock.style.setProperty('--v16-frame-height',`${Math.max(1,Math.round(rect.height))}px`);dock.classList.add('v16-canonical-frame','v16-inplace-step');stageEl.classList.add('v16-stable-stage');
    const stage=s.stages[s.activeIndex],head=stageEl.querySelector(':scope > .v5-tutor-stage-head'),headLabel=head?.querySelector('span'),nextHead=typeof v5TutorStageLabel==='function'?v5TutorStageLabel(stage,s.activeIndex,s.stages.length):'';if(headLabel&&headLabel.textContent!==nextHead)headLabel.textContent=nextHead;
    let prompt=stageEl.querySelector(':scope > p');if(!prompt){prompt=document.createElement('p');stageEl.insertBefore(prompt,stageEl.querySelector(':scope > .v5-tutor-actions')||null)}const promptText=stage?.promptToStudent||stage?.goal||'';if(prompt.textContent!==promptText)prompt.textContent=promptText;prompt.scrollTop=0;
    const actionMarkup=typeof v5TutorControls==='function'?v5TutorControls(s,stage):'';let actions=stageEl.querySelector(':scope > .v5-tutor-actions');if(actionMarkup){const holder=document.createElement('div');holder.innerHTML=actionMarkup;const replacement=holder.firstElementChild;if(actions&&replacement)actions.replaceWith(replacement);else if(!actions&&replacement)stageEl.appendChild(replacement)}else actions?.remove();
    removeLegacy();ensureCanonical();bindActions(stageEl);dock.scrollTop=scroll;
    requestAnimationFrame(()=>{dock.scrollTop=scroll;dock.classList.remove('v16-inplace-step');dock.style.removeProperty('--v16-frame-height');ensureCanonical()});
    return true;
  }
  function goInPlace(index){
    const p=currentProblem(),s=currentSession();if(!p||!s||!Array.isArray(s.stages)||!s.stages.length)return false;
    const next=Math.max(0,Math.min(s.stages.length-1,Math.trunc(Number(index)||0)));if(next===s.activeIndex)return false;
    try{window.__wrongbookTutorNavPaintLockTestApi?.begin?.('v16-canonical-step')}catch{}
    try{if(typeof v5CancelGuidePlayback==='function')v5CancelGuidePlayback()}catch{}
    let guide=null;try{guide=typeof v5BuildStageGuide==='function'?v5BuildStageGuide(p,s,next):null;if(!guide)s.activeIndex=next}catch{s.activeIndex=next}
    try{save()}catch{}
    const updated=updateStageDom(p,s,guide);if(guide&&typeof v3GuideReplay==='function')setTimeout(()=>v3GuideReplay(),45);return updated;
  }
  try{window.v5TutorGoTo=goInPlace;v5TutorGoTo=goInPlace;window.v5TutorPrev=()=>{const s=currentSession();return s?goInPlace(s.activeIndex-1):false};v5TutorPrev=window.v5TutorPrev;window.v5TutorNextExisting=()=>{const s=currentSession();return s?goInPlace(s.activeIndex+1):false};v5TutorNextExisting=window.v5TutorNextExisting;window.v5TutorLatest=()=>{const s=currentSession();return s?.stages?.length?goInPlace(s.stages.length-1):false};v5TutorLatest=window.v5TutorLatest}catch{}

  document.addEventListener('click',e=>{const prev=e.target?.closest?.('[data-v15-tutor-prev]'),next=e.target?.closest?.('[data-v15-tutor-next]');if(!prev&&!next)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const s=currentSession();if(s)goInPlace(s.activeIndex+(next?1:-1))},true);
  let queued=false;function queue(){metrics.observerCallbacks++;if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;ensureCanonical()})}
  const mount=()=>{const app=document.getElementById('app');if(!app)return setTimeout(mount,40);new MutationObserver(queue).observe(app,{subtree:true,childList:true});ensureCanonical()};mount();

  function boot(src,attr){if(document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute(attr,'1');document.body.appendChild(s)}
  boot('./tutor-nav-paint-lock-v18.js?wb=20260818-1908','data-wb-tutor-nav-paint-lock-v18');boot('./ink-history-v4.js?wb=20260818-1908','data-wb-ink-history-v4-v16');

  window.wrongbookTutorNavVisualQA=function(){
    const beforeChanges=metrics.domChanges,nav=ensureCanonical(),htmlBefore=nav?.outerHTML||'',sameNav=nav?ensureCanonical()===nav:true,htmlAfter=nav?.outerHTML||'',s=currentSession(),expected=Boolean(s?.stages?.length>1),visibleLegacy=[...document.querySelectorAll('.v5-tutor-history-nav,.v7-tutor-step-nav,.v5-tutor-step-nav')].filter(el=>getComputedStyle(el).display!=='none'),allCanonical=[...document.querySelectorAll('.v16-canonical-nav')],dock=document.querySelector('.v5-tutor-dock');
    const buttons=nav?[...nav.querySelectorAll('button')]:[],count=nav?.querySelector('.v14-tutor-nav-count')?.textContent?.trim()||'',mobile=matchMedia('(max-width:700px)').matches,nr=nav?.getBoundingClientRect(),br=buttons[0]?.getBoundingClientRect(),eb=mobile?40:44,en=mobile?152:168,close=(a,b)=>Math.abs((a||0)-b)<=1,idempotent=sameNav&&htmlBefore===htmlAfter&&metrics.domChanges===beforeChanges;
    return{version:VERSION,pass:Boolean(visibleLegacy.length===0&&allCanonical.length<2&&(!expected||(nav&&buttons.length===2&&count.includes('/')&&close(nr?.width,en)&&close(br?.width,eb)))&&(!dock||getComputedStyle(dock).animationName==='none')&&idempotent),expectedNavigator:expected,canonicalNavigatorCount:allCanonical.length,visibleLegacyNavigatorCount:visibleLegacy.length,navigatorPresent:Boolean(nav),buttonCount:buttons.length,count,navigatorWidth:Math.round(nr?.width||0),buttonSize:Math.round(br?.width||0),singleNavigationOwner:true,selfHealingAfterRender:true,inPlacePagingNoRender:true,outerFrameAnimationSuppressed:!dock||getComputedStyle(dock).animationName==='none',observerIdempotent:idempotent,observerCallbacks:metrics.observerCallbacks,normalizationPasses:metrics.normalizationPasses,domChanges:metrics.domChanges};
  };
  window.__wrongbookTutorNavV16TestApi={ensureCanonical,goInPlace,metrics};
})();
