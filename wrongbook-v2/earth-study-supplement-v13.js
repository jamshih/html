// v13 loader upgraded on 2026-08-17: the old add-on-card approach is retired.
// Load the v14 source-faithful workbook-sheet renderer after v11/v12 so v14 becomes canonical.
(function(){
  const stamp='20260817-2';
  function addStyle(){
    if(document.querySelector('link[data-earth-reference-v14]'))return;
    const l=document.createElement('link');
    l.rel='stylesheet';l.href=`./earth-reference-sheet-v14.css?wb=${stamp}`;l.dataset.earthReferenceV14='1';
    document.head.appendChild(l);
  }
  function load(src,done){
    const existing=[...document.scripts].find(s=>s.src&&s.src.includes(src));
    if(existing){if(done)done();return;}
    const s=document.createElement('script');s.src=`./${src}?wb=${stamp}`;s.async=false;
    s.onload=()=>done&&done();
    s.onerror=()=>console.error('[earth-v14] failed to load',src);
    document.body.appendChild(s);
  }
  addStyle();
  if(window.EARTH_REFERENCE_SHEET_V14){render();return;}
  load('earth-reference-sheet-v14-data.js',()=>load('earth-reference-sheet-v14.js'));
})();
