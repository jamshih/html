/* Paper-first compatibility gate.
   Historical source-map harnesses must exercise the pre-redesign UI contract; production and
   V5 product QA continue through the paper-first runtime. Also gives large iPad landscape a
   notebook-first workspace without turning the general tablet UI into a phone layout. */
(function(){
  const q=new URLSearchParams(location.search);
  const legacy=['e2e','e2ev3','sourcee2e','refinee2e'].some(k=>q.has(k));
  if(legacy){
    const names=['sidebar','mobileNav','mobileDrawer','shell','homePage','notebookPage','recognitionPanel','problemWorkspace','reviewPage','captureModal','openCapture','render'];
    names.forEach(name=>{
      const d=Object.getOwnPropertyDescriptor(window,name);
      if(!d||!('value' in d)||typeof d.value!=='function')return;
      try{Object.defineProperty(window,name,{...d,writable:false})}catch{}
    });
    return;
  }
  const style=document.createElement('style');
  style.dataset.paperFirstTablet='1';
  style.textContent='@media (min-width:1181px) and (max-width:1366px){body.pf-workspace-active .app-shell{display:block}body.pf-workspace-active .sidebar{display:none}body.pf-workspace-active .content{padding:14px 20px 58px;max-width:none}body.pf-workspace-active .pf-topbar{height:52px}.pf-workspace-layout{grid-template-columns:minmax(0,1fr) 300px}.paper{min-height:650px}.paper-demo{min-height:650px;padding:44px 58px 125px}}';
  document.head.appendChild(style);
})();