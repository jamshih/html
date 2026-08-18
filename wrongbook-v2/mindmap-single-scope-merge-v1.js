// Wrong Book radial map: merge redundant single curriculum scope into the root.
// Example: 108課綱 數學 -> 高中數學核心範圍 -> chapters
// becomes: 108課綱 / 高中數學核心範圍 -> chapters.
(function(){
  const VERSION='2026-08-18-single-scope-merge-v1';
  let token=0;

  function install(){
    if(typeof state!=='object'||state.page!=='mindmap')return;
    const svg=document.getElementById('mmSvg');
    const wrap=document.getElementById('mmWrap');
    if(!svg||!wrap||typeof d3==='undefined')return;
    const myToken=++token;

    function apply(){
      if(myToken!==token)return false;
      const root=svg.querySelector('g.node.root');
      const depth1=[...svg.querySelectorAll('g.node.depth1')];
      if(!root||depth1.length!==1){
        wrap.classList.remove('wbmm-single-scope');
        return false;
      }
      const scope=depth1[0];
      const scopeDatum=scope.__data__;
      const rootDatum=root.__data__;
      if(!scopeDatum||!rootDatum||scopeDatum.depth!==1||rootDatum.depth!==0)return false;

      const scopeLabel=String(scopeDatum.data?.name||'').trim();
      if(!scopeLabel)return false;
      wrap.classList.add('wbmm-single-scope');
      svg.dataset.scopeMerged=VERSION;

      // Merge the meaningful scope label into the root and remove the redundant subject-only line.
      const rootText=root.querySelector('text');
      if(rootText){
        rootText.textContent='';
        const lines=['108課綱',scopeLabel];
        lines.forEach((line,i)=>{
          const t=document.createElementNS('http://www.w3.org/2000/svg','tspan');
          t.setAttribute('x','10');
          t.setAttribute('dy',i===0?'0':'1.2em');
          t.textContent=line;
          rootText.appendChild(t);
        });
        rootText.setAttribute('x','10');
        rootText.setAttribute('text-anchor','start');
        rootText.removeAttribute('transform');
      }
      root.setAttribute('transform','translate(0,0)');
      d3.select(root).on('click',null);

      // Hide only the redundant wrapper node and its root->scope link.
      scope.style.display='none';
      const linkLayer=svg.querySelector('.link-layer');
      if(linkLayer){
        [...linkLayer.querySelectorAll('path.link')].forEach(path=>{
          const link=path.__data__;
          if(!link?.source||!link?.target)return;
          if(link.source===rootDatum&&link.target===scopeDatum){
            path.style.display='none';
            return;
          }
          if(link.source===scopeDatum&&link.target?.depth===2){
            path.style.display='';
            const radial=d3.linkRadial().angle(d=>d.x).radius(d=>d.y);
            path.setAttribute('d',radial({source:rootDatum,target:link.target}));
          }
        });
      }

      // A single scope does not need a separate legend entry.
      const legend=document.getElementById('mmLegend');
      if(legend)legend.style.display='none';
      return true;
    }

    // D3 updates animate for 550ms. Apply both immediately and after the transition settles.
    apply();
    setTimeout(apply,590);
    setTimeout(apply,700);

    svg.addEventListener('click',event=>{
      if(event.target.closest?.('.node'))setTimeout(apply,590);
    },true);
    ['mmExpandAll','mmCollapseAll','mmReset'].forEach(id=>{
      document.getElementById(id)?.addEventListener('click',()=>setTimeout(apply,590));
    });
  }

  if(typeof bind==='function'){
    const baseBind=bind;
    bind=function(){baseBind();setTimeout(install,0)};
  }
  setTimeout(install,0);
  window.WrongBookMindmapScopeMerge={version:VERSION,install};
})();
