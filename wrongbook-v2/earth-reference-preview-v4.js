/* Legacy Earth V11 preview loader.
   Production Earth 心智圖 is owned by earth-png-board-v15.* (loaded by
   earth-study-supplement-v13.js). The older V11 renderer is intentionally
   available only behind an explicit QA/preview query so it can never race
   with or replace the production illustrated renderer. */
(function(){
  const VERSION='20260817-17';
  const qs=new URLSearchParams(location.search);
  const wantsLegacyPreview=qs.has('refpreview')||qs.get('earthrenderer')==='v11';

  // Critical production guard: V11 directly overrides mindmapPage(). Loading
  // it during normal app startup can steal Earth from the approved-asset V15
  // renderer depending on network timing. Keep it QA-only.
  if(!wantsLegacyPreview)return;

  if(!document.querySelector('link[data-earth-mindmap-v11]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=`./earth-mindmap-reference-v11.css?wb=${VERSION}`;
    link.dataset.earthMindmapV11='1';
    document.head.appendChild(link);
  }

  const afterLoad=()=>{
    const api=window.EARTH_REFERENCE_MINDMAP_V11;
    if(api?.pages?.length){
      const requested=Math.max(1,Math.min(api.pages.length,Number(qs.get('chapter')||1)));
      state.page='mindmap';
      state.subject='earth';
      state.conceptChapter=api.pages[requested-1].title;
      try{save()}catch{}
      try{render()}catch{}
      document.body.classList.add('earth-ref-v11-preview');
    }
  };

  const loadEclipse=()=>{
    if(window.EARTH_ECLIPSE_DIRECTION_V11){afterLoad();return;}
    const patch=document.createElement('script');
    patch.src=`./earth-mindmap-eclipse-v11.js?wb=${VERSION}`;
    patch.async=false;
    patch.dataset.earthEclipseV11='1';
    patch.addEventListener('load',afterLoad,{once:true});
    patch.addEventListener('error',()=>{console.error('[WrongBook] Earth eclipse-direction V11 failed to load.');afterLoad();},{once:true});
    document.head.appendChild(patch);
  };

  if(window.EARTH_REFERENCE_MINDMAP_V11){loadEclipse();return;}
  const script=document.createElement('script');
  script.src=`./earth-mindmap-reference-v11.js?wb=${VERSION}`;
  script.async=false;
  script.dataset.earthMindmapV11='1';
  script.addEventListener('load',loadEclipse,{once:true});
  script.addEventListener('error',()=>console.error('[WrongBook] Earth mind map V11 failed to load.'),{once:true});
  document.head.appendChild(script);
})();
