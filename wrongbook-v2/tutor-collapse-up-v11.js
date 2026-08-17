// Wrong Book V11 — upward tutor expansion from the compact corner control.
(function(){
  const VERSION='2026-08-17-tutor-collapse-up-v11';
  if(window.__wrongbookTutorCollapseUpV11===VERSION)return;
  window.__wrongbookTutorCollapseUpV11=VERSION;

  const style=document.createElement('style');
  style.id='wrongbookTutorCollapseUpV11Style';
  style.textContent=`
    /* Hover/focus label belongs above the control, not beside/below it. */
    .v6-tutor-collapse-button::after{
      right:0!important;
      left:auto!important;
      top:auto!important;
      bottom:calc(100% + 8px)!important;
      transform:translateY(4px)!important;
      transform-origin:bottom right!important;
    }
    .v6-tutor-collapse-button:hover::after,
    .v6-tutor-collapse-button:focus-visible::after{
      transform:translateY(0)!important;
    }

    /* The layout still participates in normal flow (V8 non-overlap guarantee), but the visual
       reveal is bottom-anchored so opening reads as "expanding upward" from the compact control. */
    .v5-tutor-dock.v11-tutor-expanding:not(.v6-tutor-collapsed){
      transform-origin:100% 100%!important;
      animation:v11TutorRevealUp .18s cubic-bezier(.2,.72,.24,1) both;
    }
    @keyframes v11TutorRevealUp{
      from{opacity:.88;clip-path:inset(100% 0 0 0);transform:translateY(5px) scaleY(.985)}
      to{opacity:1;clip-path:inset(0 0 0 0);transform:translateY(0) scaleY(1)}
    }
    @media(prefers-reduced-motion:reduce){
      .v5-tutor-dock.v11-tutor-expanding:not(.v6-tutor-collapsed){animation:none!important}
    }
    @media(max-width:700px){
      .v6-tutor-collapse-button::after{display:none!important}
    }
  `;
  document.head.appendChild(style);

  const previous=new WeakMap();
  function inspect(dock){
    if(!dock)return;
    const collapsed=dock.classList.contains('v6-tutor-collapsed');
    const before=previous.get(dock);
    previous.set(dock,collapsed);
    if(before===true&&collapsed===false){
      dock.classList.remove('v11-tutor-expanding');
      // force a new animation even if the user opens repeatedly
      void dock.offsetWidth;
      dock.classList.add('v11-tutor-expanding');
      setTimeout(()=>dock.classList.remove('v11-tutor-expanding'),230);
    }
  }
  function apply(){document.querySelectorAll('.v5-tutor-dock').forEach(inspect)}
  let queued=false;
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  const mount=()=>{
    const app=document.getElementById('app');
    if(!app)return setTimeout(mount,40);
    const observer=new MutationObserver(queue);
    observer.observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    window.__wrongbookTutorCollapseUpV11Observer=observer;
    apply();
  };
  mount();

  window.runWrongbookTutorCollapseDirectionQA=function(){
    const button=document.querySelector('.v6-tutor-collapse-button');
    const dock=document.querySelector('.v5-tutor-dock');
    if(!button||!dock)return{pass:false,reason:'tutor-not-mounted',version:VERSION};
    const pseudo=getComputedStyle(button,'::after');
    const tooltipAbove=pseudo.top==='auto'&&pseudo.bottom!=='auto';
    const tooltipRightAnchored=pseudo.right==='0px';
    const dockStyle=getComputedStyle(dock);
    const origin=dockStyle.transformOrigin||'';
    const flowSafe=!['absolute','fixed'].includes(dockStyle.position)||dock.classList.contains('v6-tutor-collapsed');
    const pass=Boolean(tooltipAbove&&tooltipRightAnchored&&flowSafe);
    return{pass,version:VERSION,tooltipAbove,tooltipRightAnchored,flowSafe,pseudoTop:pseudo.top,pseudoBottom:pseudo.bottom,pseudoRight:pseudo.right,transformOrigin:origin,position:dockStyle.position};
  };
  function scheduleQA(tries=0){setTimeout(()=>{const r=window.runWrongbookTutorCollapseDirectionQA?.();if(r?.reason==='tutor-not-mounted'&&tries<20)return scheduleQA(tries+1);window.__wrongbookTutorCollapseDirectionQA=r;if(r&&!r.pass)console.warn('[Wrongbook tutor upward expansion QA failed]',r)},160)}
  scheduleQA();
})();
