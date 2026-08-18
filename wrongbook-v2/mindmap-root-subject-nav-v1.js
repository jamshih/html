// Wrong Book root-level subject navigator.
// Visible only when the radial mind-map root is collapsed into the single-subject overview.
(function(){
  const VERSION='2026-08-18-root-subject-nav-v1';
  let observer=null;

  function currentSubjectId(){
    return String((typeof state==='object'&&state?.subject)||'');
  }

  function subjectRegistry(){
    return typeof SUBJECTS!=='undefined'&&Array.isArray(SUBJECTS)?SUBJECTS:[];
  }

  function createNavigator(wrap){
    let nav=document.getElementById('mmRootSubjectNav');
    if(nav)return nav;
    const subjects=subjectRegistry();
    if(!subjects.length||typeof setSubject!=='function')return null;

    nav=document.createElement('div');
    nav.id='mmRootSubjectNav';
    nav.hidden=true;
    nav.setAttribute('aria-label','切換其他科目');
    nav.dataset.version=VERSION;

    const label=document.createElement('div');
    label.className='mm-root-subject-label';
    label.textContent='切換科目';

    const list=document.createElement('div');
    list.className='mm-root-subject-list';
    list.setAttribute('role','group');
    list.setAttribute('aria-label','108課綱科目');

    subjects.forEach(subject=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='mm-root-subject-button';
      button.dataset.mmRootSubject=subject.id;
      button.textContent=`${subject.symbol||''} ${subject.name}`.trim();
      button.addEventListener('pointerdown',event=>event.stopPropagation());
      button.addEventListener('click',event=>{
        event.preventDefault();
        event.stopPropagation();
        const next=String(subject.id||'');
        if(!next||next===currentSubjectId())return;
        setSubject(next);
      });
      list.appendChild(button);
    });

    nav.append(label,list);
    wrap.appendChild(nav);
    return nav;
  }

  function sync(){
    if(typeof state!=='object'||state.page!=='mindmap')return false;
    const wrap=document.getElementById('mmWrap');
    const root=document.querySelector('#mmSvg g.node.root');
    if(!wrap||!root)return false;
    const nav=createNavigator(wrap);
    if(!nav)return false;

    const current=currentSubjectId();
    nav.querySelectorAll('[data-mm-root-subject]').forEach(button=>{
      const active=button.dataset.mmRootSubject===current;
      button.toggleAttribute('aria-current',active);
      button.setAttribute('aria-pressed',active?'true':'false');
    });

    const collapsed=root.classList.contains('collapsed');
    nav.hidden=!collapsed;
    wrap.classList.toggle('wbmm-root-overview',collapsed);
    return collapsed;
  }

  function observeRoot(){
    const layer=document.querySelector('#mmSvg .node-layer');
    if(!layer||typeof MutationObserver==='undefined')return;
    observer?.disconnect?.();
    observer=new MutationObserver(records=>{
      if(records.some(record=>record.type==='childList'||record.attributeName==='class')){
        requestAnimationFrame(sync);
      }
    });
    observer.observe(layer,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  }

  function install(){
    if(typeof state!=='object'||state.page!=='mindmap')return;
    const wrap=document.getElementById('mmWrap');
    const svg=document.getElementById('mmSvg');
    if(!wrap||!svg)return;
    createNavigator(wrap);
    observeRoot();
    sync();

    if(svg.dataset.rootSubjectNav!==VERSION){
      svg.dataset.rootSubjectNav=VERSION;
      svg.addEventListener('click',event=>{
        if(!event.target.closest?.('g.node.root'))return;
        setTimeout(sync,0);
        setTimeout(sync,620);
      },true);
    }
  }

  if(typeof bind==='function'){
    const baseBind=bind;
    bind=function(){
      baseBind();
      install();
    };
  }

  setTimeout(install,0);
  window.WrongBookMindmapRootSubjectNav={version:VERSION,install,sync};
})();
