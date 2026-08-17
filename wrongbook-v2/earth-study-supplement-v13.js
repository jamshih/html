// Canonical Earth production renderer loader.
// V15 owns the user-facing Earth mind-map route; older source-trace/V11 renderers
// remain available only as data/QA dependencies and must not replace production.
(function(){
  const stamp='20260817-18';

  function installApprovedAssetAliases(){
    const placements=window.MINDMAP_ASSET_PLACEMENTS?.earth;
    if(!placements)return;

    // Source-trace refinement rewrites the original semantic zones into source-page
    // owners (source242...source253). Bridge those live owner IDs back to the
    // approved enhanced illustrations instead of falling back to generic diagrams.
    const aliases={
      '1:source244':['earth-science-01__star-cloud','earth-science-01__main-sequence-star','earth-science-01__red-giant','earth-science-01__white-dwarf'],
      '1:source245':['earth-science-01__solar-system-disk','earth-science-01__earth-globe','earth-science-01__spiral-galaxy'],
      '2:source246':['earth-science-02__telescope'],
      '2:source247':['earth-science-02__star-sparkles'],
      '3:source242':['earth-science-03__planetesimal'],
      '4:source248':['earth-science-04__seismograph'],
      '5:source250':['earth-science-05__sun']
    };
    for(const [key,ids] of Object.entries(aliases)){
      if(!Array.isArray(placements[key])||placements[key].length===0)placements[key]=ids;
    }
  }

  function installIllustrationPriorityStyle(){
    if(document.querySelector('style[data-earth15-approved-priority]'))return;
    const s=document.createElement('style');
    s.dataset.earth15ApprovedPriority='1';
    s.textContent=`
      /* Approved enhanced illustrations are the primary visual whenever present. */
      .earth15-zone-visual.has-assets{display:block;min-height:150px;margin:8px 0 15px}
      .earth15-zone-visual.has-assets>.earth15-native-diagram{display:none!important}
      .earth15-zone-visual.has-assets>.earth15-approved-assets{
        display:grid!important;
        grid-template-columns:repeat(auto-fit,minmax(112px,1fr));
        align-items:end;justify-items:center;gap:10px 12px;width:100%;min-height:145px
      }
      .earth15-zone-visual.has-assets .mindmap-asset{width:100%;max-width:190px;min-width:0;margin:0}
      .earth15-zone-visual.has-assets .mindmap-asset img{
        width:100%;height:145px!important;max-height:none!important;object-fit:contain;
        filter:drop-shadow(0 3px 3px rgba(76,57,45,.12))
      }
      .earth15-zone-visual.has-assets .mindmap-asset-group[aria-label*="概念插圖"]{background:transparent}
      @media(max-width:700px){
        .earth15-zone-visual.has-assets{min-height:0}
        .earth15-zone-visual.has-assets>.earth15-approved-assets{grid-template-columns:repeat(2,minmax(0,1fr));min-height:0}
        .earth15-zone-visual.has-assets .mindmap-asset img{height:132px!important}
      }
      @media(max-width:390px){
        .earth15-zone-visual.has-assets>.earth15-approved-assets{grid-template-columns:1fr}
        .earth15-zone-visual.has-assets .mindmap-asset img{height:150px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function style(){
    if(!document.querySelector('link[data-earth-png-board-v15]')){
      const l=document.createElement('link');
      l.rel='stylesheet';
      l.href=`./earth-png-board-v15.css?wb=${stamp}`;
      l.dataset.earthPngBoardV15='1';
      document.head.appendChild(l);
    }
    installIllustrationPriorityStyle();
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
    installApprovedAssetAliases();
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
