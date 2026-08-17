// Wrong Book V12 — Today review queue contains only items due today or overdue.
// A completed item scheduled for tomorrow / N days later disappears from 「今天要複習」 immediately.
(function(){
  const VERSION='2026-08-17-review-due-today-v12b';
  if(window.__wrongbookReviewDueTodayV12===VERSION)return;
  window.__wrongbookReviewDueTodayV12=VERSION;

  if(document.documentElement.dataset.paperFirstLegacy==='1')return;

  function appState(){try{return typeof state!=='undefined'?state:(window.state||{})}catch{return window.state||{}}}
  function localDateISO(d=new Date()){
    const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function ensureReview(item){
    try{if(typeof v3EnsureReview==='function')v3EnsureReview(item);else if(typeof window.v3EnsureReview==='function')window.v3EnsureReview(item)}catch{}
    return item;
  }
  function itemDueISO(item){
    ensureReview(item);
    if(/^\d{4}-\d{2}-\d{2}$/.test(String(item?.dueISO||'')))return String(item.dueISO);
    const label=String(item?.due||'').trim();
    const today=new Date();
    if(!label||label==='今天')return localDateISO(today);
    if(label==='明天'){today.setDate(today.getDate()+1);return localDateISO(today)}
    const m=label.match(/^(\d+)\s*天後$/);
    if(m){today.setDate(today.getDate()+Number(m[1]));return localDateISO(today)}
    return localDateISO(today);
  }
  function isDueToday(item,todayISO=localDateISO()){
    return itemDueISO(item)<=todayISO;
  }
  function rank(item,todayISO=localDateISO()){
    const iso=itemDueISO(item);
    return Math.round((new Date(`${iso}T12:00:00`)-new Date(`${todayISO}T12:00:00`))/86400000);
  }
  function buildTodayQueue(items,limit=10,todayISO=localDateISO()){
    return [...(items||[])]
      .map(ensureReview)
      .filter(item=>isDueToday(item,todayISO))
      .sort((a,b)=>rank(a,todayISO)-rank(b,todayISO))
      .slice(0,limit);
  }

  function todayDueProblems(){
    return buildTodayQueue(appState().problems||[],10,localDateISO());
  }

  // Override the V3 queue source used by both the standard and paper-first review renderers.
  window.dueProblems=todayDueProblems;
  try{dueProblems=todayDueProblems}catch{}

  window.__wrongbookReviewDueToday={version:VERSION,localDateISO,itemDueISO,isDueToday,buildTodayQueue};

  window.runWrongbookReviewDueTodayQA=function(){
    const today=localDateISO();
    const d=n=>{const x=new Date(`${today}T12:00:00`);x.setDate(x.getDate()+n);return localDateISO(x)};
    const fixture=[
      {id:'overdue',dueISO:d(-2),due:'今天'},
      {id:'today',dueISO:d(0),due:'今天'},
      {id:'tomorrow',dueISO:d(1),due:'明天'},
      {id:'two-days',dueISO:d(2),due:'2 天後'},
      {id:'three-days',dueISO:d(3),due:'3 天後'}
    ];
    const fixtureQueue=buildTodayQueue(fixture,10,today);
    const fixtureIds=fixtureQueue.map(x=>x.id);
    const fixtureCorrect=fixtureIds.join('|')==='overdue|today';

    const runtime=typeof dueProblems==='function'?dueProblems():todayDueProblems();
    const noFutureInRuntime=runtime.every(item=>isDueToday(item,today));

    const rendered=[...document.querySelectorAll('[data-review-problem]')];
    const renderedRows=rendered.map(el=>{
      const id=el.dataset.reviewProblem||'';
      const item=(appState().problems||[]).find(p=>String(p.id)===String(id));
      return {id,due:item?.due||'',dueISO:itemDueISO(item||{})};
    });
    const noFutureRendered=renderedRows.every(row=>row.dueISO<=today);

    // Regression from the reported UI: a selected/completed problem can remain as the main feedback card,
    // but once its next due date is future it must not remain in the Today sidebar.
    const st=appState();
    const current=(st.problems||[]).find(p=>String(p.id)===String(st.reviewProblemId||''));
    const currentFuture=Boolean(current&&itemDueISO(current)>today);
    const currentAbsentFromToday=!currentFuture||!rendered.some(el=>String(el.dataset.reviewProblem)===String(current.id));

    const pass=fixtureCorrect&&noFutureInRuntime&&noFutureRendered&&currentAbsentFromToday;
    return {pass,version:VERSION,today,fixtureCorrect,fixtureIds,noFutureInRuntime,noFutureRendered,currentFuture,currentAbsentFromToday,runtime:runtime.map(x=>({id:x.id,due:x.due,dueISO:itemDueISO(x)})),rendered:renderedRows};
  };

  // The compatibility layer renders once before this late production refinement loads.
  // If the user is already on Review, rerender once so future items disappear immediately instead of waiting for another click.
  try{
    const st=appState();
    if(st.page==='review'&&typeof render==='function')requestAnimationFrame(()=>render());
  }catch{}

  function scheduleQA(tries=0){
    setTimeout(()=>{
      const r=window.runWrongbookReviewDueTodayQA?.();
      window.__wrongbookReviewDueTodayQA=r;
      if(r&&!r.pass)console.warn('[Wrongbook today-review QA failed]',r);
      if(!document.querySelector('[data-review-problem]')&&tries<8)setTimeout(()=>scheduleQA(tries+1),240);
    },180);
  }
  scheduleQA();
})();
