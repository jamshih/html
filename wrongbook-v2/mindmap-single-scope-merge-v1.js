// Wrong Book radial map: merge redundant single curriculum scope into the root.
(function(){
  const VERSION='2026-08-18-single-scope-merge-v1';let token=0;
  function install(){
    if(typeof state!=='object'||state.page!=='mindmap')return;
    const svg=document.getElementById('mmSvg'),wrap=document.getElementById('mmWrap');if(!svg||!wrap||typeof d3==='undefined')return;
    const myToken=++token;
    function apply(){
      if(myToken!==token)return false;
      const root=svg.querySelector('g.node.root'),depth1=[...svg.querySelectorAll('g.node.depth1')];if(!root||depth1.length!==1){wrap.classList.remove('wbmm-single-scope');return false}
      const scope=depth1[0],scopeDatum=scope.__data__,rootDatum=root.__data__;if(!scopeDatum||!rootDatum||scopeDatum.depth!==1||rootDatum.depth!==0)return false;
      const scopeLabel=String(scopeDatum.data?.name||'').trim();if(!scopeLabel)return false;
      wrap.classList.add('wbmm-single-scope');svg.dataset.scopeMerged=VERSION;
      const rootText=root.querySelector('text');if(rootText){rootText.textContent='';['108課綱',scopeLabel].forEach((line,i)=>{const t=document.createElementNS('http://www.w3.org/2000/svg','tspan');t.setAttribute('x','10');t.setAttribute('dy',i===0?'0':'1.2em');t.textContent=line;rootText.appendChild(t)});rootText.setAttribute('x','10');rootText.setAttribute('text-anchor','start');rootText.removeAttribute('transform')}
      root.setAttribute('transform','translate(0,0)');d3.select(root).on('click',null);scope.style.display='none';
      const linkLayer=svg.querySelector('.link-layer');if(linkLayer)[...linkLayer.querySelectorAll('path.link')].forEach(path=>{const link=path.__data__;if(!link?.source||!link?.target)return;if(link.source===rootDatum&&link.target===scopeDatum){path.style.display='none';return}if(link.source===scopeDatum&&link.target?.depth===2){path.style.display='';const radial=d3.linkRadial().angle(d=>d.x).radius(d=>d.y);path.setAttribute('d',radial({source:rootDatum,target:link.target}))}});
      const legend=document.getElementById('mmLegend');if(legend)legend.style.display='none';return true;
    }
    apply();setTimeout(apply,590);setTimeout(apply,700);svg.addEventListener('click',event=>{if(event.target.closest?.('.node'))setTimeout(apply,590)},true);['mmExpandAll','mmCollapseAll','mmReset'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(apply,590)));
  }
  if(typeof bind==='function'){const baseBind=bind;bind=function(){baseBind();setTimeout(install,0)}}setTimeout(install,0);window.WrongBookMindmapScopeMerge={version:VERSION,install};
})();

// Final runtime owners for problem tutoring. V21 restores the proven V12h behavior and strict
// problem/session isolation; V22 writes that geometry as inline !important after all experimental layers.
(function(){
  if(document.querySelector('script[data-wb-tutor-stationary-v21]'))return;
  const loadLock=()=>{
    if(document.querySelector('script[data-wb-tutor-stationary-v22]'))return;
    const lock=document.createElement('script');lock.src='./tutor-stationary-inline-lock-v22.js?wb=20260818-2038-v22-1';lock.async=false;lock.setAttribute('data-wb-tutor-stationary-v22','1');document.body.appendChild(lock);
  };
  const script=document.createElement('script');script.src='./tutor-stationary-restore-v21.js?wb=20260818-2038-v12h';script.async=false;script.setAttribute('data-wb-tutor-stationary-v21','1');script.addEventListener('load',loadLock,{once:true});document.body.appendChild(script);
})();
