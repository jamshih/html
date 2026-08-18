// Wrong Book radial mind-map geometry regression guard.
// Fixes first-frame fit and the zero-radius root orientation without replacing the renderer.
(function(){
  const VERSION='2026-08-18-radial-geometry-fix-v3';
  let installToken=0;

  function install(){
    if(typeof state!=='object'||state.page!=='mindmap')return;
    const wrap=document.getElementById('mmWrap');
    const svg=document.getElementById('mmSvg');
    if(!wrap||!svg||typeof d3==='undefined')return;
    if(svg.dataset.geometryFix===VERSION)return;
    svg.dataset.geometryFix=VERSION;
    const token=++installToken;
    let userMoved=false;

    const world=()=>svg.querySelector(':scope > g');
    const nodeLayer=()=>svg.querySelector('.node-layer');

    function fixRootOrientation(){
      const root=svg.querySelector('g.node.root');
      if(!root)return false;
      if(root.getAttribute('transform')!=='translate(0,0)')root.setAttribute('transform','translate(0,0)');
      const text=root.querySelector('text');
      if(text){
        text.setAttribute('x','10');
        text.setAttribute('text-anchor','start');
        text.removeAttribute('transform');
        text.querySelectorAll('tspan').forEach(t=>t.setAttribute('x','10'));
      }
      return true;
    }

    function fitVisibleTree(){
      if(token!==installToken)return false;
      const layer=nodeLayer(),g=world();
      if(!layer||!g)return false;
      fixRootOrientation();
      let bbox;
      try{bbox=layer.getBBox()}catch{return false}
      const w=svg.clientWidth,h=svg.clientHeight;
      if(!bbox||!Number.isFinite(bbox.x)||!Number.isFinite(bbox.y)||bbox.width<1||bbox.height<1||w<1||h<1)return false;
      const fit=Math.min(w/bbox.width,h/bbox.height,1);
      const margin=w<=760?.76:.84;
      const scale=Math.max(.15,Math.min(1,fit*margin));
      const tx=w/2-(bbox.x+bbox.width/2)*scale;
      const ty=h/2-(bbox.y+bbox.height/2)*scale;
      const transform=d3.zoomIdentity.translate(tx,ty).scale(scale);
      svg.__zoom=transform;
      g.setAttribute('transform',transform.toString());
      return true;
    }

    function settleInitial(){
      setTimeout(()=>{if(!userMoved){fixRootOrientation();fitVisibleTree()}},680);
      if(document.fonts?.ready){
        document.fonts.ready.then(()=>setTimeout(()=>{if(token===installToken&&!userMoved){fixRootOrientation();fitVisibleTree()}},0)).catch(()=>{});
      }
    }

    const markMoved=()=>{userMoved=true};
    svg.addEventListener('pointerdown',markMoved,{passive:true});
    svg.addEventListener('wheel',markMoved,{passive:true});

    svg.addEventListener('click',event=>{
      if(event.target.closest?.('.node'))setTimeout(fixRootOrientation,590);
    },true);

    ['mmExpandAll','mmCollapseAll','mmReset'].forEach(id=>{
      const button=document.getElementById(id);
      if(!button)return;
      button.addEventListener('click',()=>{
        userMoved=false;
        setTimeout(()=>{fixRootOrientation();fitVisibleTree()},660);
      });
    });

    let resizeTimer=0;
    window.addEventListener('resize',()=>{
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(()=>{if(!userMoved){fixRootOrientation();fitVisibleTree()}},180);
    },{passive:true});

    settleInitial();
  }

  if(typeof bind==='function'){
    const baseBind=bind;
    bind=function(){baseBind();setTimeout(install,0)};
  }
  setTimeout(install,0);
  window.WrongBookMindmapGeometryFix={version:VERSION,install};
})();
