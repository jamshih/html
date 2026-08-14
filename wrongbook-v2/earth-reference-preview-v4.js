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

// V5 product modules intentionally load after the existing V4/Earth stack so they can extend,
// rather than replace, the source-faithful mind-map implementation. There is no service worker
// in wrongbook-v2; the query token prevents stale browser/CDN copies of these new modules.
(()=>{
  const build='2026-08-14-wrongbook-concepts-tutor-v5';
  const meta=document.querySelector('meta[name="wrongbook-build"]');if(meta)meta.content=build;
  const token='20260814-v5';
  document.write(`<link rel="stylesheet" href="./concept-explorer-v5.css?v=${token}"><link rel="stylesheet" href="./tutor-stages-v5.css?v=${token}">`);
  document.write(`<script src="./learning-objects-v5.js?v=${token}"><\/script><script src="./concept-explorer-v5.js?v=${token}"><\/script><script src="./tutor-stages-v5.js?v=${token}"><\/script><script src="./e2e-product-v5-run.js?v=${token}"><\/script>`);
})();
