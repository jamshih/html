// Canonical Earth production renderer loader.
// V15 owns the user-facing Earth mind-map route; older source-trace/V11 renderers
// remain available only as data/QA dependencies and must not replace production.
(function(){
  const stamp='20260817-17';

  function style(){
    if(document.querySelector('link[data-earth-png-board-v15]'))return;
    const l=document.createElement('link');
    l.rel='stylesheet';
    l.href=`./earth-png-board-v15.css?wb=${stamp}`;
    l.dataset.earthPngBoardV15='1';
    document.head.appendChild(l);
  }

  function installProductionOwner(){
    const api=window.EARTH_PNG_BOARD_V15;
    if(!api?.render)return;

    // Capture the complete existing router once so Chemistry, Biology, and every
    // non-Earth subject continue through their current production implementations.
    if(!window.__EARTH_V15_PRODUCTION_OWNER__){
      const previousMindmapPage=typeof mindmapPage==='function'?mindmapPage:null;
      window.__EARTH_V15_PRODUCTION_OWNER__=true;
      window.__EARTH_V15_PREVIOUS_MINDMAP_PAGE__=previousMindmapPage;

      mindmapPage=function(){
        const subject=typeof activeSubject==='function'?activeSubject():null;
        if(subject?.id!=='earth'){
          return typeof window.__EARTH_V15_PREVIOUS_MINDMAP_PAGE__==='function'
            ? window.__EARTH_V15_PREVIOUS_MINDMAP_PAGE__()
            : '';
        }

        // Keep the explicit 108-curriculum switch functional, but make the
        // illustrated approved-asset board the production/default Earth surface.
        if(state?.earthMindSource==='curriculum'&&typeof v4RefGenericMindmapPage==='function'){
          const switcher=typeof v4RefCurriculumSwitch==='function'?v4RefCurriculumSwitch():'';
          return switcher+v4RefGenericMindmapPage();
        }
        return api.render();
      };
    }

    // v4RefReferencePage is kept aligned for legacy bind/QA helpers that call it.
    v4RefReferencePage=api.render;
    try{render()}catch(error){console.error('[earth-v15] render failed',error)}
  }

  function script(){
    if(window.EARTH_PNG_BOARD_V15){installProductionOwner();return;}
    const s=document.createElement('script');
    s.src=`./earth-png-board-v15.js?wb=${stamp}`;
    s.async=false;
    s.addEventListener('load',installProductionOwner,{once:true});
    s.onerror=()=>console.error('[earth-v15] failed to load');
    document.body.appendChild(s);
  }

  style();
  script();
})();
