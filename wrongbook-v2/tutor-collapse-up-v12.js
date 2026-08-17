// Wrong Book V12f — stable upward tutor placement with horizontal-aware ink avoidance.
(function(){
  const VERSION='2026-08-17-tutor-collapse-up-v12f';
  if(window.__wrongbookTutorCollapseUpV12===VERSION)return;
  try{window.__wrongbookTutorCollapseUpV12Observer?.disconnect?.()}catch{}
  document.getElementById('wrongbookTutorCollapseUpV12Style')?.remove();
  window.__wrongbookTutorCollapseUpV12=VERSION;

  const DESKTOP_BOTTOM=68;
  const PROMPT_GAP=12;
  const INK_MARGIN=18;
  const EDGE=12;
  const MIN_OPEN_HEIGHT=132;
  const MAX_OPEN_HEIGHT=420;
  const PARK_MIN_HEIGHT=96;
  const MAX_WIDTH=680;
  const MIN_WIDTH=300;

  const style=document.createElement('style');
  style.id='wrongbookTutorCollapseUpV12Style';
  style.textContent=`
    .v3-paper.v12-tutor-up-open .v5-tutor-dock:not(.v6-tutor-collapsed),
    .v3-paper.v12-tutor-up-open.v8-tutor-open-flow .v5-tutor-dock:not(.v6-tutor-collapsed){
      position:absolute!important;
      left:var(--v12-tutor-left,12px)!important;
      right:auto!important;
      top:auto!important;
      bottom:${DESKTOP_BOTTOM}px!important;
      width:var(--v12-tutor-width,min(680px,calc(100% - 24px)))!important;
      max-width:calc(100% - 24px)!important;
      height:auto!important;
      min-height:0!important;
      max-height:var(--v12-tutor-max-height,${MAX_OPEN_HEIGHT}px)!important;
      margin:0!important;
      overflow-x:hidden!important;
      overflow-y:auto!important;
      overscroll-behavior:contain;
      z-index:30!important;
      transform-origin:100% 100%!important;
      animation:v12fTutorRevealUp .17s cubic-bezier(.2,.72,.24,1) both;
    }
    .v3-paper.v12-tutor-safe-park .v5-tutor-dock:not(.v6-tutor-collapsed),
    .v3-paper.v12-tutor-safe-park.v8-tutor-open-flow .v5-tutor-dock:not(.v6-tutor-collapsed){
      position:absolute!important;
      left:var(--v12-tutor-left,12px)!important;
      right:auto!important;
      top:var(--v12-tutor-top,12px)!important;
      bottom:auto!important;
      width:var(--v12-tutor-width,min(680px,calc(100% - 24px)))!important;
      max-width:calc(100% - 24px)!important;
      height:auto!important;
      min-height:0!important;
      max-height:var(--v12-tutor-max-height,240px)!important;
      margin:0!important;
      overflow-x:hidden!important;
      overflow-y:auto!important;
      z-index:30!important;
      transform-origin:100% 100%!important;
      animation:v12fTutorRevealUp .17s cubic-bezier(.2,.72,.24,1) both;
    }
    @keyframes v12fTutorRevealUp{from{opacity:.94;clip-path:inset(100% 0 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
    .v6-tutor-collapse-button::after{right:0!important;left:auto!important;top:auto!important;bottom:calc(100% + 8px)!important;transform:translateY(4px)!important;transform-origin:bottom right!important}
    .v6-tutor-collapse-button:hover::after,.v6-tutor-collapse-button:focus-visible::after{transform:translateY(0)!important}
    @media(max-width:700px){
      .v3-paper.v12-tutor-up-open .v5-tutor-dock:not(.v6-tutor-collapsed),
      .v3-paper.v12-tutor-up-open.v8-tutor-open-flow .v5-tutor-dock:not(.v6-tutor-collapsed),
      .v3-paper.v12-tutor-safe-park .v5-tutor-dock:not(.v6-tutor-collapsed),
      .v3-paper.v12-tutor-safe-park.v8-tutor-open-flow .v5-tutor-dock:not(.v6-tutor-collapsed){
        position:fixed!important;left:7px!important;right:7px!important;top:auto!important;
        bottom:calc(74px + env(safe-area-inset-bottom))!important;width:auto!important;max-width:none!important;
        max-height:var(--v12-tutor-mobile-max-height,42vh)!important;margin:0!important;border-radius:15px!important;
      }
      .v6-tutor-collapse-button::after{display:none!important}
    }
    @media(prefers-reduced-motion:reduce){.v5-tutor-dock{animation:none!important}}
  `;
  document.head.appendChild(style);

  let observer=null,queued=false,inkTimer=0;
  function visible(el){if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0}
  function semanticPromptNodes(paper){const demo=paper.querySelector('.paper-demo');if(demo)return [...demo.querySelectorAll(':scope > h4, :scope > .options, :scope > .hand-note, .paper-option')].filter(visible);return [paper.querySelector('.scan-photo'),paper.querySelector('.scan-text')].filter(visible)}
  function problemContentBottom(paper){const nodes=semanticPromptNodes(paper);if(!nodes.length)return paper.getBoundingClientRect().top+8;return Math.max(...nodes.map(el=>el.getBoundingClientRect().bottom))}
  function drawingPaths(){try{return Array.isArray(drawing?.paths)?drawing.paths:[]}catch{return[]}}
  function inflate(r,p){return{left:r.left-p,top:r.top-p,right:r.right+p,bottom:r.bottom+p,width:r.width+p*2,height:r.height+p*2}}
  function overlap(a,b){return !(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom)}
  function userInkRects(paper){
    const canvas=paper.querySelector('#drawCanvas');if(!canvas||!visible(canvas))return[];
    const cr=canvas.getBoundingClientRect(),out=[];
    for(const path of drawingPaths()){
      if(path?.tool==='eraser')continue;
      const pts=path?.pts||path?.points||[];if(!pts.length)continue;
      let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
      for(const pt of pts){let x=Number(pt?.x),y=Number(pt?.y);if(!Number.isFinite(x)||!Number.isFinite(y))continue;const norm=path?.normalized!==false&&x>=0&&x<=1.001&&y>=0&&y<=1.001;if(!norm){x=x/Math.max(1,canvas.width);y=y/Math.max(1,canvas.height)}minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y)}
      if(!Number.isFinite(minX))continue;
      out.push(inflate({left:cr.left+minX*cr.width,top:cr.top+minY*cr.height,right:cr.left+maxX*cr.width,bottom:cr.top+maxY*cr.height,width:(maxX-minX)*cr.width,height:(maxY-minY)*cr.height},INK_MARGIN));
    }
    return out;
  }
  function widthCandidates(pw){return [...new Set([Math.min(MAX_WIDTH,pw-EDGE*2),560,440,360,MIN_WIDTH].map(x=>Math.floor(Math.min(x,pw-EDGE*2))).filter(x=>x>=Math.min(MIN_WIDTH,pw-EDGE*2)))].sort((a,b)=>b-a)}
  function leftCandidates(paperRect,w,inks){
    const maxLeft=Math.max(EDGE,paperRect.width-w-EDGE),vals=[maxLeft,EDGE,Math.round((paperRect.width-w)/2)];
    for(const r of inks){vals.push(r.left-paperRect.left-w-INK_MARGIN,r.right-paperRect.left+INK_MARGIN)}
    return [...new Set(vals.map(v=>Math.max(EDGE,Math.min(maxLeft,Math.round(v)))))];
  }
  function laneInkBottom(inks,laneLeft,laneRight){let b=-Infinity;for(const r of inks)if(r.right>laneLeft&&r.left<laneRight)b=Math.max(b,r.bottom);return b}
  function planBottomLane(paperRect,contentBottom,inks,anchorBottom){
    let best=null;
    for(const w of widthCandidates(paperRect.width))for(const left of leftCandidates(paperRect,w,inks)){
      const laneLeft=paperRect.left+left,laneRight=laneLeft+w,inkBottom=laneInkBottom(inks,laneLeft,laneRight);
      const safeTop=Math.max(paperRect.top+8,contentBottom+PROMPT_GAP,Number.isFinite(inkBottom)?inkBottom:-Infinity);
      const available=Math.floor(anchorBottom-safeTop);if(available<MIN_OPEN_HEIGHT)continue;
      const rightBias=Math.abs((left+w)-(paperRect.width-EDGE))<3?26:0;
      const score=available+w*.12+rightBias;
      if(!best||score>best.score)best={mode:'upward-lane',left,width:w,maxHeight:Math.min(MAX_OPEN_HEIGHT,available),safeTop,available,score};
    }
    return best;
  }
  function mergedIntervals(intervals,start,end){const xs=intervals.map(([a,b])=>[Math.max(start,a),Math.min(end,b)]).filter(([a,b])=>b>a).sort((a,b)=>a[0]-b[0]);const out=[];for(const cur of xs){const last=out[out.length-1];if(last&&cur[0]<=last[1])last[1]=Math.max(last[1],cur[1]);else out.push(cur)}return out}
  function largestGap(intervals,start,end){const xs=mergedIntervals(intervals,start,end);let cursor=start,best={top:start,bottom:start,height:0};for(const [a,b] of xs){if(a-cursor>best.height)best={top:cursor,bottom:a,height:a-cursor};cursor=Math.max(cursor,b)}if(end-cursor>best.height)best={top:cursor,bottom:end,height:end-cursor};return best}
  function planSafePark(paper,paperRect,contentBottom,inks){
    const toolbar=paper.querySelector('.paper-toolbar'),toolbarTop=toolbar&&visible(toolbar)?toolbar.getBoundingClientRect().top-8:paperRect.bottom-DESKTOP_BOTTOM;
    const start=Math.max(paperRect.top+8,contentBottom+PROMPT_GAP),end=Math.min(paperRect.bottom-8,toolbarTop);let best=null;
    for(const w of widthCandidates(paperRect.width))for(const left of leftCandidates(paperRect,w,inks)){
      const laneLeft=paperRect.left+left,laneRight=laneLeft+w;
      const intervals=inks.filter(r=>r.right>laneLeft&&r.left<laneRight).map(r=>[r.top,r.bottom]);
      const gap=largestGap(intervals,start,end);if(gap.height<PARK_MIN_HEIGHT)continue;
      const rightBias=Math.abs((left+w)-(paperRect.width-EDGE))<3?18:0;
      const score=gap.height+w*.10+rightBias+gap.bottom*.0001;
      if(!best||score>best.score)best={mode:'safe-park',left,width:w,top:gap.top-paperRect.top,maxHeight:Math.min(MAX_OPEN_HEIGHT,Math.floor(gap.height)),safeTop:gap.top,available:Math.floor(gap.height),score};
    }
    return best;
  }
  function planForPaper(paper){
    const r=paper.getBoundingClientRect(),contentBottom=problemContentBottom(paper),inks=userInkRects(paper),mobile=matchMedia('(max-width:700px)').matches;
    if(mobile){const inkBottom=inks.length?Math.max(...inks.map(x=>x.bottom)):-Infinity,anchor=window.innerHeight-74,safeTop=Math.max(8,contentBottom+PROMPT_GAP,inkBottom);return{mode:'mobile',left:7,width:Math.max(0,window.innerWidth-14),maxHeight:Math.max(PARK_MIN_HEIGHT,Math.min(window.innerHeight*.42,anchor-safeTop)),safeTop,available:anchor-safeTop,inks,contentBottom}}
    const anchorBottom=r.bottom-DESKTOP_BOTTOM;
    return {...(planBottomLane(r,contentBottom,inks,anchorBottom)||planSafePark(paper,r,contentBottom,inks)||{mode:'no-space',left:EDGE,width:Math.min(MAX_WIDTH,r.width-EDGE*2),maxHeight:0,safeTop:contentBottom+PROMPT_GAP,available:0}),inks,contentBottom};
  }
  function setProp(el,name,value){if(el.style.getPropertyValue(name)!==value)el.style.setProperty(name,value)}
  function clearProp(el,name){if(el.style.getPropertyValue(name))el.style.removeProperty(name)}
  function setModeClass(paper,mode){
    const up=mode==='upward-lane'||mode==='mobile',park=mode==='safe-park'||mode==='no-space';
    paper.classList.toggle('v12-tutor-up-open',up);paper.classList.toggle('v12-tutor-safe-park',park);paper.classList.toggle('v12-tutor-no-space',mode==='no-space');paper.classList.remove('v12-tutor-flow-fallback');
  }
  function clearGeometry(paper){setModeClass(paper,'closed');for(const n of ['--v12-tutor-left','--v12-tutor-width','--v12-tutor-top','--v12-tutor-max-height','--v12-tutor-mobile-max-height'])clearProp(paper,n);delete paper.dataset.v12Mode}
  function syncDock(dock){
    if(!dock)return;const paper=dock.closest('.v3-paper');if(!paper)return;const open=!dock.classList.contains('v6-tutor-collapsed');if(!open){clearGeometry(paper);return}
    const plan=planForPaper(paper);setModeClass(paper,plan.mode);paper.dataset.v12Mode=plan.mode;paper.dataset.v12Available=String(Math.round(plan.available||0));paper.dataset.v12InkCount=String(plan.inks?.length||0);
    if(plan.mode==='mobile'){clearProp(paper,'--v12-tutor-top');clearProp(paper,'--v12-tutor-left');clearProp(paper,'--v12-tutor-width');clearProp(paper,'--v12-tutor-max-height');setProp(paper,'--v12-tutor-mobile-max-height',`${Math.max(PARK_MIN_HEIGHT,Math.floor(plan.maxHeight))}px`);return}
    clearProp(paper,'--v12-tutor-mobile-max-height');setProp(paper,'--v12-tutor-left',`${Math.round(plan.left)}px`);setProp(paper,'--v12-tutor-width',`${Math.round(plan.width)}px`);
    if(plan.mode==='upward-lane'){clearProp(paper,'--v12-tutor-top');setProp(paper,'--v12-tutor-max-height',`${Math.round(plan.maxHeight)}px`)}
    else if(plan.mode==='safe-park'){setProp(paper,'--v12-tutor-top',`${Math.round(plan.top)}px`);setProp(paper,'--v12-tutor-max-height',`${Math.round(plan.maxHeight)}px`)}
    else {setProp(paper,'--v12-tutor-top',`${Math.round(Math.max(8,plan.safeTop-paper.getBoundingClientRect().top))}px`);setProp(paper,'--v12-tutor-max-height','72px')}
  }
  function apply(){document.querySelectorAll('.v5-tutor-dock').forEach(syncDock)}
  function queueApply(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  function queueInkApply(){clearTimeout(inkTimer);inkTimer=setTimeout(queueApply,90)}
  function mount(){const app=document.getElementById('app');if(!app)return setTimeout(mount,40);if(!observer){observer=new MutationObserver(records=>{if(records.some(m=>m.type==='childList'||(m.type==='attributes'&&m.target?.classList?.contains('v5-tutor-dock'))))queueApply()});observer.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});window.__wrongbookTutorCollapseUpV12Observer=observer}window.addEventListener('resize',queueApply,{passive:true});app.addEventListener('pointerup',queueInkApply,{passive:true});app.addEventListener('pointercancel',queueInkApply,{passive:true});apply()}
  mount();

  window.__wrongbookTutorSafePlanner={planBottomLane,largestGap,planSafePark,INK_MARGIN,MIN_OPEN_HEIGHT};
  window.runWrongbookTutorCollapseDirectionQA=function(){
    apply();const dock=document.querySelector('.v5-tutor-dock'),paper=dock?.closest('.v3-paper'),button=dock?.querySelector('.v6-tutor-collapse-button');if(!dock||!paper||!button)return{pass:false,reason:'tutor-not-mounted',version:VERSION};
    const original=dock.classList.contains('v6-tutor-collapsed');dock.classList.remove('v6-tutor-collapsed');syncDock(dock);const open=dock.getBoundingClientRect(),plan=planForPaper(paper),inks=userInkRects(paper),contentBottom=problemContentBottom(paper),toolbar=paper.querySelector('.paper-toolbar'),tr=toolbar&&visible(toolbar)?toolbar.getBoundingClientRect():null;
    const inkCollision=inks.some(r=>overlap(open,r)),noPromptOverlap=open.top>=contentBottom-1||plan.mode==='safe-park',noToolbarOverlap=!tr||!overlap(open,tr),visibleCard=open.height>=64&&open.width>=Math.min(MIN_WIDTH,paper.getBoundingClientRect().width-24),geometryOwned=['absolute','fixed'].includes(getComputedStyle(dock).position),modeOk=['upward-lane','safe-park','mobile'].includes(plan.mode);
    const fixturePaper={left:0,top:0,width:1000,height:760,right:1000,bottom:760},fixtureInk=[inflate({left:270,top:400,right:430,bottom:520,width:160,height:120},INK_MARGIN)],fixture=planBottomLane(fixturePaper,250,fixtureInk,692),fixtureNoInkOverlap=Boolean(fixture)&&!fixtureInk.some(r=>overlap({left:fixture.left,top:fixture.safeTop,right:fixture.left+fixture.width,bottom:692,width:fixture.width,height:692-fixture.safeTop},r));
    if(original)dock.classList.add('v6-tutor-collapsed');else dock.classList.remove('v6-tutor-collapsed');syncDock(dock);
    const pass=modeOk&&!inkCollision&&noPromptOverlap&&noToolbarOverlap&&visibleCard&&geometryOwned&&fixtureNoInkOverlap;
    return{pass,version:VERSION,mode:plan.mode,inkMargin:INK_MARGIN,inkCount:inks.length,inkCollision,noPromptOverlap,noToolbarOverlap,visibleCard,geometryOwned,fixtureNoInkOverlap,openTop:Math.round(open.top),openBottom:Math.round(open.bottom),openLeft:Math.round(open.left),openRight:Math.round(open.right),openWidth:Math.round(open.width),openHeight:Math.round(open.height)};
  };
  function scheduleQA(tries=0){setTimeout(()=>{const r=window.runWrongbookTutorCollapseDirectionQA?.();if(r?.reason==='tutor-not-mounted'&&tries<25)return scheduleQA(tries+1);window.__wrongbookTutorCollapseDirectionQA=r;if(r&&!r.pass)console.warn('[Wrongbook tutor V12f safe-placement QA failed]',r)},220)}
  scheduleQA();
})();