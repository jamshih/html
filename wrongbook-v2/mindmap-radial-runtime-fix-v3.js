// Wrong Book radial mind-map geometry regression guard.
// Keeps radial geometry intact while enforcing readable labels and stable root orientation.
(function(){
  const VERSION='2026-08-18-radial-readable-labels-v6';
  const SUBJECT_NAV_VERSION='2026-08-18-mindmap-subject-nav-v2';
  const SHELL_MAP_HOTFIX_VERSION='2026-08-18-shell-map-hotfix-v1';

  // Visual parameters: requested readability changes live here and nowhere else.
  const VIEW=Object.freeze({
    labelOffsetPx:14,
    fontPx:Object.freeze({root:20,depth1:18,depth2:16,depth3:15,default:15}),
    nodeRadiusPx:Object.freeze({root:10,depth1:9,depth2:7,depth3:6,default:6})
  });

  let installToken=0;

  function ensureShellMapHotfix(){
    if(window.__wrongbookShellMapHotfix===SHELL_MAP_HOTFIX_VERSION){
      window.WrongBookShellMapHotfix?.bindHotfix?.();
      return;
    }
    if(document.querySelector('script[data-wb-shell-map-hotfix]'))return;
    const script=document.createElement('script');
    script.src=`./wrongbook-shell-map-hotfix-v1.js?wb=${SHELL_MAP_HOTFIX_VERSION}`;
    script.dataset.wbShellMapHotfix=SHELL_MAP_HOTFIX_VERSION;
    document.body.appendChild(script);
  }

  function neutralizeSubjectContainer(){
    const wrap=document.getElementById('mmWrap');
    if(!wrap)return null;
    const current=String(wrap.getAttribute('data-subject')||state?.subject||'');
    if(current)wrap.dataset.mmSubject=current;
    wrap.removeAttribute('data-subject');
    if(wrap.onclick)wrap.onclick=null;
    return wrap;
  }

  function ensureSubjectNavigation(){
    neutralizeSubjectContainer();
    if(!document.querySelector('link[data-mm-subject-nav-style]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=`./mindmap-subject-nav-v1.css?wb=${SUBJECT_NAV_VERSION}`;
      link.dataset.mmSubjectNavStyle=SUBJECT_NAV_VERSION;
      document.head.appendChild(link);
    }
    const loadedVersion=window.WrongBookMindmapSubjectNav?.version||'';
    const loader=document.querySelector('script[data-mm-subject-nav-loader]');
    if(loadedVersion!==SUBJECT_NAV_VERSION&&!loader){
      const script=document.createElement('script');
      script.src=`./mindmap-subject-nav-v1.js?wb=${SUBJECT_NAV_VERSION}`;
      script.dataset.mmSubjectNavLoader=SUBJECT_NAV_VERSION;
      document.body.appendChild(script);
    }else if(loadedVersion===SUBJECT_NAV_VERSION){
      window.WrongBookMindmapSubjectNav?.install?.();
    }
  }

  function install(){
    ensureShellMapHotfix();
    ensureSubjectNavigation();
    if(typeof state!=='object'||state.page!=='mindmap')return;
    const wrap=neutralizeSubjectContainer();
    const svg=document.getElementById('mmSvg');
    if(!wrap||!svg||typeof d3==='undefined')return;
    if(svg.dataset.geometryFix===VERSION)return;
    svg.dataset.geometryFix=VERSION;
    const token=++installToken;
    let userMoved=false;

    const world=()=>svg.querySelector(':scope > g');
    const nodeLayer=()=>svg.querySelector('.node-layer');

    const safeAttr=(el,name,value)=>{
      if(!el)return;
      if(value==null){
        if(el.hasAttribute(name))el.removeAttribute(name);
        return;
      }
      const next=String(value);
      if(el.getAttribute(name)!==next)el.setAttribute(name,next);
    };

    const nodeDepth=node=>{
      const datum=node?.__data__;
      if(Number.isFinite(Number(datum?.depth)))return Number(datum.depth);
      if(node?.classList?.contains('root'))return 0;
      for(let depth=1;depth<=9;depth++)if(node?.classList?.contains(`depth${depth}`))return depth;
      return 0;
    };

    const parameterFor=(table,depth)=>{
      if(depth===0)return table.root;
      const named=table[`depth${depth}`];
      return Number.isFinite(named)?named:table.default;
    };

    function rotationDeg(node){
      const raw=String(node?.getAttribute('transform')||'');
      const rotate=raw.match(/rotate\(\s*([-+]?\d*\.?\d+(?:e[-+]?\d+)?)/i);
      if(rotate){
        const value=Number(rotate[1]);
        if(Number.isFinite(value))return value;
      }
      const matrix=raw.match(/matrix\(\s*([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*[, ]\s*([-+]?\d*\.?\d+(?:e[-+]?\d+)?)/i);
      if(matrix){
        const a=Number(matrix[1]),b=Number(matrix[2]);
        if(Number.isFinite(a)&&Number.isFinite(b))return Math.atan2(b,a)*180/Math.PI;
      }
      return 0;
    }

    function applyNodePresentation(node){
      if(!node?.matches?.('g.node'))return false;
      const depth=nodeDepth(node);
      const circle=node.querySelector('circle');
      const text=node.querySelector('text');
      if(circle)safeAttr(circle,'r',parameterFor(VIEW.nodeRadiusPx,depth));
      if(!text)return true;

      const fontPx=parameterFor(VIEW.fontPx,depth);
      if(text.style.fontSize!==`${fontPx}px`)text.style.fontSize=`${fontPx}px`;

      if(depth===0){
        safeAttr(node,'transform','translate(0,0)');
        safeAttr(text,'x',VIEW.labelOffsetPx);
        safeAttr(text,'text-anchor','start');
        safeAttr(text,'transform',null);
        text.querySelectorAll('tspan').forEach(t=>safeAttr(t,'x',VIEW.labelOffsetPx));
        return true;
      }

      const datum=node.__data__;
      const rightSide=Number.isFinite(Number(datum?.x))?Number(datum.x)<Math.PI:true;
      const x=rightSide?VIEW.labelOffsetPx:-VIEW.labelOffsetPx;
      const angle=rotationDeg(node);
      const counter=Number((-angle).toFixed(4));
      safeAttr(text,'x',x);
      safeAttr(text,'text-anchor',rightSide?'start':'end');
      safeAttr(text,'transform',`rotate(${counter})`);
      text.querySelectorAll('tspan').forEach(t=>safeAttr(t,'x',x));
      return true;
    }

    function applyPresentation(){
      svg.querySelectorAll('g.node').forEach(applyNodePresentation);
    }

    function fixRootOrientation(){
      const root=svg.querySelector('g.node.root');
      return root?applyNodePresentation(root):false;
    }

    function installPresentationObserver(){
      const layer=nodeLayer();
      if(!layer||typeof MutationObserver==='undefined')return;
      const observer=new MutationObserver(records=>{
        const touched=new Set();
        let structural=false;
        records.forEach(record=>{
          if(record.type==='childList'){
            structural=true;
            return;
          }
          const target=record.target;
          const node=target?.matches?.('g.node')?target:target?.closest?.('g.node');
          if(node)touched.add(node);
        });
        touched.forEach(applyNodePresentation);
        if(structural)requestAnimationFrame(applyPresentation);
      });
      observer.observe(layer,{subtree:true,childList:true,attributes:true,attributeFilter:['transform','x','text-anchor']});
    }

    function fitVisibleTree(){
      if(token!==installToken)return false;
      const layer=nodeLayer(),g=world();
      if(!layer||!g)return false;
      applyPresentation();
      let bbox;
      try{bbox=layer.getBBox()}catch{return false}
      const w=svg.clientWidth,h=svg.clientHeight;
      if(!bbox||!Number.isFinite(bbox.x)||!Number.isFinite(bbox.y)||bbox.width<1||bbox.height<1||w<1||h<1)return false;
      const fit=Math.min(w/bbox.width,h/bbox.height,1);
      const margin=w<=760?.76:.84;
      const scale=Math.max(.15,Math.min(1,fit*margin));
      const tx=w/2-(bbox.x+bbox.width/2)*scale;
      const ty=h/2-(bbox.y+bbox.height/2)*scale;
      const transform=d3.zoomIdentity.translate(tx,ty).scale(scale);
      svg.__zoom=transform;
      g.setAttribute('transform',transform.toString());
      return true;
    }

    function settleInitial(){
      applyPresentation();
      setTimeout(()=>{if(!userMoved){applyPresentation();fitVisibleTree()}},680);
      if(document.fonts?.ready){
        document.fonts.ready.then(()=>setTimeout(()=>{if(token===installToken&&!userMoved){applyPresentation();fitVisibleTree()}},0)).catch(()=>{});
      }
    }

    const markMoved=()=>{userMoved=true};
    svg.addEventListener('pointerdown',markMoved,{passive:true});
    svg.addEventListener('wheel',markMoved,{passive:true});

    svg.addEventListener('click',event=>{
      if(event.target.closest?.('.node')){
        requestAnimationFrame(applyPresentation);
        setTimeout(()=>{applyPresentation();fixRootOrientation()},590);
      }
    },true);

    ['mmExpandAll','mmCollapseAll','mmReset'].forEach(id=>{
      const button=document.getElementById(id);
      if(!button)return;
      button.addEventListener('click',()=>{
        userMoved=false;
        requestAnimationFrame(applyPresentation);
        setTimeout(()=>{applyPresentation();fitVisibleTree()},660);
      });
    });

    let resizeTimer=0;
    window.addEventListener('resize',()=>{
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(()=>{if(!userMoved){applyPresentation();fitVisibleTree()}},180);
    },{passive:true});

    installPresentationObserver();
    settleInitial();
  }

  if(typeof bind==='function'){
    const baseBind=bind;
    bind=function(){
      baseBind();
      neutralizeSubjectContainer();
      setTimeout(install,0);
    };
  }
  ensureShellMapHotfix();
  ensureSubjectNavigation();
  setTimeout(install,0);
  window.WrongBookMindmapGeometryFix={version:VERSION,install,neutralizeSubjectContainer,view:VIEW};
})();
