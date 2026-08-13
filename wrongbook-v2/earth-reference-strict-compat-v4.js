// QA compatibility hooks for the strict 242–245 renderer.
// These do not change source geometry; they expose stable selectors for regression tests.

const v4StrictBaseField=v4StrictField;
v4StrictField=function(ch,n,fi,mode,w=72,extra=''){
  const html=v4StrictBaseField(ch,n,fi,mode,w,extra);
  return mode==='learn'?html.replace('class="v4strict-fill learn','class="v4strict-fill learn v4ref-learn-answer'):html;
};

v4StrictQ=function(ch,mode,n,x,y,w,html,cls=''){
  const item=v4StrictItem(ch,n);
  return `<div class="v4strict-q v4ref-blank-item ${cls}" data-v4ref-item="${n}" data-v4ref-page="${item?.page||''}" data-page="${item?.page||''}" data-section="${item?.parentNodeId||''}" data-question="${n}" style="left:${x}%;top:${y}%;width:${w}%"><span class="v4ref-junction" style="display:none"></span>${html}</div>`;
};

v4StrictPage=function(page,inner,extra=''){
  const left=page%2===0?25:965;
  const instrumented=inner.replaceAll('<svg class="','<svg class="v4ref-diagram-svg ').replaceAll('class="v4ref-diagram-svg v4strict-svg"','class="v4ref-diagram-svg v4strict-svg v4ref-global-lines"');
  return `<section class="v4strict-page v4ref-paper ${extra}" data-strict-page="${page}" style="left:${left}px;top:20px;width:${V4STRICT_PAGE_W}px;height:${V4STRICT_PAGE_H}px">${instrumented}<div class="v4strict-footer">${page}</div></section>`;
};

// The legacy E2E is retained in the bundle for older branches, but the current strict suite owns ?e2e=1.
if(new URLSearchParams(location.search).has('e2e')){
  window.__v4StrictRunE2E=true;
  const u=new URL(location.href);u.searchParams.delete('e2e');history.replaceState(null,'',u.pathname+(u.search||'')+u.hash);
}

render();
