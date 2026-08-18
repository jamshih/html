// Wrong Book V22 — final geometry lock for the restored V12h tutor.
// Later tutor layers use !important rules, so the stable V12h geometry is written as inline !important
// after all modules load. This prevents the panel from drifting, shrinking to an experimental max-width,
// or overlapping the bottom pen/eraser controls.
(function(){
  'use strict';
  const VERSION='2026-08-18-tutor-stationary-inline-lock-v22';
  if(window.__wrongbookTutorStationaryInlineLock===VERSION)return;
  window.__wrongbookTutorStationaryInlineLock=VERSION;

  const GAP=12;
  const metrics=window.__wrongbookTutorStationaryV22Metrics={passes:0,changes:0,calibrations:0,observerCallbacks:0};
  let queued=false,observer=null;

  function setImportant(el,name,value){
    if(!el)return false;
    const current=el.style.getPropertyValue(name),priority=el.style.getPropertyPriority(name);
    if(current===value&&priority==='important')return false;
    el.style.setProperty(name,value,'important');metrics.changes++;return true;
  }
  function clearImportant(el,name){
    if(!el||!el.style.getPropertyValue(name))return false;
    el.style.removeProperty(name);metrics.changes++;return true;
  }
  function directToolbar(paper){return paper?.querySelector(':scope > .paper-toolbar,:scope > .ocrq-toolbar')||null}
  function calibrate(paper,dock,toolbar,attempt=0){
    if(!paper||!dock||!toolbar||matchMedia('(max-width:700px)').matches)return;
    const dr=dock.getBoundingClientRect(),tr=toolbar.getBoundingClientRect();
    const gap=tr.top-dr.bottom;
    if(Math.abs(gap-GAP)<=1){dock.dataset.wbV22ToolbarGap=String(Math.round(gap));return}
    const current=parseFloat(getComputedStyle(dock).bottom)||82;
    // Positive adjustment raises the dock; negative lowers it. Iterating on measured geometry avoids
    // border/padding containing-block offsets and remains correct if the toolbar height changes.
    const adjustment=GAP-gap;
    const next=Math.max(72,Math.min(260,current+adjustment));
    setImportant(dock,'bottom',`${Math.round(next*10)/10}px`);metrics.calibrations++;
    if(attempt<4)requestAnimationFrame(()=>calibrate(paper,dock,toolbar,attempt+1));
  }
  function lockDock(dock){
    const paper=dock?.closest('.v3-paper');if(!paper)return;
    const toolbar=directToolbar(paper),mobile=matchMedia('(max-width:700px)').matches;
    if(mobile){
      setImportant(dock,'position','fixed');setImportant(dock,'left','7px');setImportant(dock,'right','7px');
      setImportant(dock,'top','auto');setImportant(dock,'bottom','calc(74px + env(safe-area-inset-bottom))');
      setImportant(dock,'width','auto');setImportant(dock,'max-width','none');setImportant(dock,'margin','0');setImportant(dock,'transform','none');
    }else{
      setImportant(dock,'position','absolute');setImportant(dock,'left','12px');setImportant(dock,'right','12px');
      setImportant(dock,'top','auto');setImportant(dock,'width','auto');setImportant(dock,'max-width','none');
      setImportant(dock,'min-width','0');setImportant(dock,'margin','0');setImportant(dock,'transform','none');
      if(!dock.style.getPropertyValue('bottom')||dock.style.getPropertyValue('bottom').includes('calc('))setImportant(dock,'bottom','96px');
      if(toolbar&&!dock.classList.contains('v6-tutor-collapsed'))requestAnimationFrame(()=>calibrate(paper,dock,toolbar));
    }
    dock.dataset.wbV22Stationary='1';
  }
  function apply(){
    queued=false;metrics.passes++;
    document.querySelectorAll('.pf-problem-workspace .v5-tutor-dock').forEach(lockDock);
  }
  function queue(){metrics.observerCallbacks++;if(queued)return;queued=true;requestAnimationFrame(apply)}
  function mount(){
    const app=document.getElementById('app');if(!app)return setTimeout(mount,40);
    if(!observer&&typeof MutationObserver==='function'){
      observer=new MutationObserver(records=>{
        if(records.some(r=>r.type==='childList'||(r.type==='attributes'&&r.target?.classList?.contains('v5-tutor-dock'))))queue();
      });
      observer.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
      window.__wrongbookTutorStationaryV22Observer=observer;
    }
    window.addEventListener('resize',queue,{passive:true});
    apply();
  }

  window.wrongbookTutorStationaryInlineQA=function(){
    apply();
    const dock=document.querySelector('.pf-problem-workspace .v5-tutor-dock'),paper=dock?.closest('.v3-paper'),toolbar=directToolbar(paper);
    if(!dock||!paper)return{version:VERSION,pass:true,tutorMounted:false};
    if(toolbar&&!dock.classList.contains('v6-tutor-collapsed'))calibrate(paper,dock,toolbar);
    const dr=dock.getBoundingClientRect(),pr=paper.getBoundingClientRect(),tr=toolbar?.getBoundingClientRect(),mobile=matchMedia('(max-width:700px)').matches,cs=getComputedStyle(dock);
    const toolbarGap=!toolbar?999:tr.top-dr.bottom;
    const leftGap=dr.left-pr.left,rightGap=pr.right-dr.right;
    const pass=Boolean((mobile?cs.position==='fixed':cs.position==='absolute')&&(mobile||toolbarGap>=GAP-2)&&(mobile||Math.abs(leftGap-12)<=3&&Math.abs(rightGap-12)<=3)&&dr.height<=422);
    return{version:VERSION,pass,tutorMounted:true,mobile,position:cs.position,toolbarGap:Math.round(toolbarGap),leftGap:Math.round(leftGap),rightGap:Math.round(rightGap),dockWidth:Math.round(dr.width),dockHeight:Math.round(dr.height),metrics:{...metrics}};
  };

  mount();
})();
