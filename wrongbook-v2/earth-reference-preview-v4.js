/* Earth mind-map entrypoint.
   The old p242–253 reconstruction files remain available for historical QA, but
   production Earth 心智圖 is now owned by earth-mindmap-reference-v11.*.
   This loader is intentionally binder-free: the V11 module only replaces
   mindmapPage for subject=earth and reuses the app's existing bind()/state flow. */
(function(){
  const VERSION='20260817-1';
  const qs=new URLSearchParams(location.search);

  if(!document.querySelector('link[data-earth-mindmap-v11]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=`./earth-mindmap-reference-v11.css?wb=${VERSION}`;
    link.dataset.earthMindmapV11='1';
    document.head.appendChild(link);
  }

  const afterLoad=()=>{
    const api=window.EARTH_REFERENCE_MINDMAP_V11;
    if(qs.has('refpreview')&&api?.pages?.length){
      const requested=Math.max(1,Math.min(api.pages.length,Number(qs.get('chapter')||1)));
      state.page='mindmap';
      state.subject='earth';
      state.conceptChapter=api.pages[requested-1].title;
      try{save()}catch{}
      try{render()}catch{}
      document.body.classList.add('earth-ref-v11-preview');
      return;
    }
    try{
      if(state.page==='mindmap'&&activeSubject?.()?.id==='earth')render();
    }catch{}
  };

  if(window.EARTH_REFERENCE_MINDMAP_V11){afterLoad();return;}
  const script=document.createElement('script');
  script.src=`./earth-mindmap-reference-v11.js?wb=${VERSION}`;
  script.async=false;
  script.dataset.earthMindmapV11='1';
  script.addEventListener('load',afterLoad,{once:true});
  script.addEventListener('error',()=>console.error('[WrongBook] Earth mind map V11 failed to load.'),{once:true});
  document.head.appendChild(script);
})();
