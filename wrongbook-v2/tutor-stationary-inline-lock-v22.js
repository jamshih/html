// Wrong Book V22.1 — final geometry + pager lock for the restored V12h tutor.
// Later tutor layers use !important rules, so stable V12h geometry is written as inline !important.
// The canonical Previous/Next pager is also synchronized from the scoped session and kept reachable
// at the bottom of the stationary tutor instead of drifting with diagram content.
(function(){
  'use strict';
  const VERSION='2026-08-18-tutor-stationary-inline-lock-v22.1';
  if(window.__wrongbookTutorStationaryInlineLock===VERSION)return;
  window.__wrongbookTutorStationaryInlineLock=VERSION;

  const GAP=12;
  const metrics=window.__wrongbookTutorStationaryV22Metrics={passes:0,changes:0,calibrations:0,observerCallbacks:0,pagerSyncs:0};
  let queued=false,observer=null;

  const style=document.createElement('style');
  style.id='wrongbookTutorStationaryV22Style';
  style.textContent=`
    html body .pf-problem-workspace .v5-tutor-dock .v16-canonical-nav{
      position:sticky!important;bottom:4px!important;z-index:60!important;
      background:rgba(255,253,249,.96)!important;border-radius:14px!important;
      backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
    }
  `;
  document.getElementById(style.id)?.remove();document.head.appendChild(style);

  function setImportant(el,name,value){
    if(!el)return false;
    const current=el.style.getPropertyValue(name),priority=el.style.getPropertyPriority(name);
    if(current===value&&priority==='important')return false;
    el.style.setProperty(name,value,'important');metrics.changes++;return true;
  }
  function directToolbar(paper){return paper?.querySelector(':scope > .paper-toolbar,:scope > .ocrq-toolbar')||null}
  function selected(){try{return typeof selectedProblem==='function'?selectedProblem():null}catch{return null}}
  function scopedSession(){
    const p=selected();if(!p)return null;
    try{if(typeof window.v5TutorSession==='function')return window.v5TutorSession(p)}catch{}
    return state?.tutorSessions?.[p.id]||null;
  }
  function syncPager(){
    const s=scopedSession(),nav=document.querySelector('.pf-problem-workspace .v16-canonical-nav');
    if(!s||!nav||!Array.isArray(s.stages)||s.stages.length<2)return false;
    const total=s.stages.length,index=Math.max(0,Math.min(total-1,Number(s.activeIndex)||0)),label=`${index+1} / ${total}`;
    const count=nav.querySelector('.v14-tutor-nav-count'),prev=nav.querySelector('[data-v15-tutor-prev]'),next=nav.querySelector('[data-v15-tutor-next]');
    let changed=false;
    if(count&&count.textContent.trim()!==label){count.textContent=label;changed=true}
    if(prev&&prev.disabled!==(index<=0)){prev.disabled=index<=0;changed=true}
    if(next&&next.disabled!==(index>=total-1)){next.disabled=index>=total-1;changed=true}
    if(changed){metrics.changes++;metrics.pagerSyncs++}
    return changed;
  }
  function calibrate(paper,dock,toolbar,attempt=0){
    if(!paper||!dock||!toolbar||matchMedia('(max-width:700px)').matches)return;
    const dr=dock.getBoundingClientRect(),tr=toolbar.getBoundingClientRect(),gap=tr.top-dr.bottom;
    if(Math.abs(gap-GAP)<=1){dock.dataset.wbV22ToolbarGap=String(Math.round(gap));return}
    const current=parseFloat(getComputedStyle(dock).bottom)||96,adjustment=GAP-gap,next=Math.max(72,Math.min(320,current+adjustment));
    setImportant(dock,'bottom',`${Math.round(next*10)/10}px`);metrics.calibrations++;
    if(attempt<5)requestAnimationFrame(()=>calibrate(paper,dock,toolbar,attempt+1));
  }
  function lockDock(dock){
    const paper=dock?.closest('.v3-paper');if(!paper)return;
    const toolbar=directToolbar(paper),mobile=matchMedia('(max-width:700px)').matches;
    if(mobile){
      setImportant(dock,'position','fixed');setImportant(dock,'left','7px');setImportant(dock,'right','7px');setImportant(dock,'top','auto');setImportant(dock,'bottom','calc(74px + env(safe-area-inset-bottom))');setImportant(dock,'width','auto');setImportant(dock,'max-width','none');setImportant(dock,'margin','0');setImportant(dock,'transform','none');
    }else{
      setImportant(dock,'position','absolute');setImportant(dock,'left','12px');setImportant(dock,'right','12px');setImportant(dock,'top','auto');setImportant(dock,'width','auto');setImportant(dock,'max-width','none');setImportant(dock,'min-width','0');setImportant(dock,'margin','0');setImportant(dock,'transform','none');
      if(!dock.style.getPropertyValue('bottom')||dock.style.getPropertyValue('bottom').includes('calc('))setImportant(dock,'bottom','96px');
      if(toolbar&&!dock.classList.contains('v6-tutor-collapsed'))requestAnimationFrame(()=>calibrate(paper,dock,toolbar));
    }
    dock.dataset.wbV22Stationary='1';
  }
  function apply(){
    queued=false;metrics.passes++;
    document.querySelectorAll('.pf-problem-workspace .v5-tutor-dock').forEach(lockDock);
    syncPager();
  }
  function queue(){metrics.observerCallbacks++;if(queued)return;queued=true;requestAnimationFrame(apply)}
  function mount(){
    const app=document.getElementById('app');if(!app)return setTimeout(mount,40);
    if(!observer&&typeof MutationObserver==='function'){
      observer=new MutationObserver(records=>{if(records.some(r=>r.type==='childList'||r.type==='characterData'||(r.type==='attributes'&&r.target?.classList?.contains('v5-tutor-dock'))))queue()});
      observer.observe(app,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
      window.__wrongbookTutorStationaryV22Observer=observer;
    }
    window.addEventListener('resize',queue,{passive:true});apply();
  }

  window.wrongbookTutorStationaryInlineQA=function(){
    apply();
    const dock=document.querySelector('.pf-problem-workspace .v5-tutor-dock'),paper=dock?.closest('.v3-paper'),toolbar=directToolbar(paper);
    if(!dock||!paper)return{version:VERSION,pass:true,tutorMounted:false};
    if(toolbar&&!dock.classList.contains('v6-tutor-collapsed'))calibrate(paper,dock,toolbar);
    syncPager();
    const dr=dock.getBoundingClientRect(),pr=paper.getBoundingClientRect(),tr=toolbar?.getBoundingClientRect(),mobile=matchMedia('(max-width:700px)').matches,cs=getComputedStyle(dock),toolbarGap=!toolbar?999:tr.top-dr.bottom,leftGap=dr.left-pr.left,rightGap=pr.right-dr.right,s=scopedSession(),count=dock.querySelector('.v14-tutor-nav-count')?.textContent.trim()||'',expected=s?.stages?.length>1?`${(Number(s.activeIndex)||0)+1} / ${s.stages.length}`:'';
    const pagerOk=!expected||count===expected;
    const pass=Boolean((mobile?cs.position==='fixed':cs.position==='absolute')&&(mobile||toolbarGap>=GAP-2)&&(mobile||Math.abs(leftGap-12)<=3&&Math.abs(rightGap-12)<=3)&&dr.height<=422&&pagerOk);
    return{version:VERSION,pass,tutorMounted:true,mobile,position:cs.position,toolbarGap:Math.round(toolbarGap),leftGap:Math.round(leftGap),rightGap:Math.round(rightGap),dockWidth:Math.round(dr.width),dockHeight:Math.round(dr.height),pagerOk,count,expected,metrics:{...metrics}};
  };

  mount();
})();
