// Visual-QA-only query route. Normal navigation is unchanged.
if(new URLSearchParams(location.search).has('refpreview')){
  state.page='mindmap';
  state.subject='earth';
  state.earthMindSource='reference';
  state.refEarthChapter=Number(new URLSearchParams(location.search).get('chapter')||1);
  state.refEarthStudyMode=new URLSearchParams(location.search).get('mode')||'recall';
  render();
  document.body.classList.add('v4ref-preview-shot');
  const view=document.querySelector('[data-v4ref-viewport]');
  if(view)requestAnimationFrame(()=>{v4RefSetScale(view,.86,{x:0,y:0});view.scrollLeft=0;view.scrollTop=0});
}

// V5 product modules are loaded exactly once by index.html after the complete Earth/source stack.
// Keep this file limited to the visual preview route: dynamically injecting V5 scripts here caused
// duplicate binders, duplicate QA execution, and duplicate animation/runtime state.
