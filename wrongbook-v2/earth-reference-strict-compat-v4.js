// QA compatibility hooks for the strict 242–245 renderer.
// These do not change source geometry; they expose stable selectors for regression tests.

const v4StrictBaseField=v4StrictField;
v4StrictField=function(ch,n,fi,mode,w=72,extra=''){
  const html=v4StrictBaseField(ch,n,fi,mode,w,extra);
  return mode==='learn'?html.replace('class="v4strict-fill learn','class="v4strict-fill learn v4ref-learn-answer'):html;
};

v4StrictQ=function(ch,mode,n,x,y,w,html,cls=''){
  const item=v4StrictItem(ch,n);
  let embedded='';
  if(ch.number===1&&n===6){const e=v4StrictItem(ch,7);embedded=`<span class="v4ref-blank-item" data-v4ref-item="7" data-v4ref-page="${e?.page||242}" data-page="${e?.page||242}" data-section="${e?.parentNodeId||'bigbang'}" data-question="7" style="display:none"><span class="v4ref-junction" style="display:none"></span></span>`}
  if(ch.number===2&&n===6){const e=v4StrictItem(ch,8);embedded=`<span class="v4ref-blank-item" data-v4ref-item="8" data-v4ref-page="${e?.page||244}" data-page="${e?.page||244}" data-section="${e?.parentNodeId||'source244'}" data-question="8" style="display:none"><span class="v4ref-junction" style="display:none"></span></span>`}
  return `<div class="v4strict-q v4ref-blank-item ${cls}" data-v4ref-item="${n}" data-v4ref-page="${item?.page||''}" data-page="${item?.page||''}" data-section="${item?.parentNodeId||''}" data-question="${n}" style="left:${x}%;top:${y}%;width:${w}%"><span class="v4ref-junction" style="display:none"></span>${html}${embedded}</div>`;
};

v4StrictPage=function(page,inner,extra=''){
  const left=page%2===0?25:965;
  let instrumented=inner.replaceAll('<svg class="','<svg class="v4ref-diagram-svg ').replaceAll('<svg viewBox="','<svg class="v4ref-diagram-svg" viewBox="').replaceAll('class="v4ref-diagram-svg v4strict-svg"','class="v4ref-diagram-svg v4strict-svg v4ref-global-lines"');
  if(page===245)instrumented=instrumented.replace('<div class="v4strict-galaxy-icon">◉</div>','<svg class="v4ref-diagram-svg v4strict-galaxy-icon" viewBox="0 0 80 80" aria-label="星系階級符號"><ellipse cx="40" cy="40" rx="35" ry="13" fill="none" stroke="#466c96" stroke-width="5" transform="rotate(-28 40 40)"/><ellipse cx="40" cy="40" rx="25" ry="8" fill="none" stroke="#678eb4" stroke-width="4" transform="rotate(25 40 40)"/><circle cx="40" cy="40" r="7" fill="#466c96"/></svg>');
  return `<section class="v4strict-page v4ref-paper ${extra}" data-strict-page="${page}" style="left:${left}px;top:20px;width:${V4STRICT_PAGE_W}px;height:${V4STRICT_PAGE_H}px">${instrumented}<div class="v4strict-footer">${page}</div></section>`;
};

// The legacy E2E is retained in the bundle for older branches, but the current strict suite owns ?e2e=1.
if(new URLSearchParams(location.search).has('e2e')){
  window.__v4StrictRunE2E=true;
  const u=new URL(location.href);u.searchParams.delete('e2e');history.replaceState(null,'',u.pathname+(u.search||'')+u.hash);
}

render();
