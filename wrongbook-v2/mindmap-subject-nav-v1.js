// Wrong Book radial mind-map subject navigation.
// Reuses the app's canonical SUBJECTS + setSubject() state flow.
(function(){
  const VERSION='2026-08-18-mindmap-subject-nav-v3';
  const ROOT_NAV_VERSION='2026-08-18-root-subject-nav-v1';
  const HANDED_LAYOUT_VERSION='2026-08-18-handed-layout-v1';
  let installToken=0;

  function ensureRootSubjectNavigation(){
    if(!document.querySelector('link[data-mm-root-subject-nav-style]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=`./mindmap-root-subject-nav-v1.css?wb=${ROOT_NAV_VERSION}`;
      link.dataset.mmRootSubjectNavStyle=ROOT_NAV_VERSION;
      document.head.appendChild(link);
    }
    if(window.WrongBookMindmapRootSubjectNav?.version===ROOT_NAV_VERSION){
      window.WrongBookMindmapRootSubjectNav.install?.();
      return;
    }
    if(document.querySelector('script[data-mm-root-subject-nav-loader]'))return;
    const script=document.createElement('script');
    script.src=`./mindmap-root-subject-nav-v1.js?wb=${ROOT_NAV_VERSION}`;
    script.dataset.mmRootSubjectNavLoader=ROOT_NAV_VERSION;
    document.body.appendChild(script);
  }

  function ensureHandedLayout(){
    if(!document.querySelector('link[data-mm-handed-layout-style]')){
      const link=document.createElement('link');
      link.rel='stylesheet';
      link.href=`./mindmap-handed-layout-v1.css?wb=${HANDED_LAYOUT_VERSION}`;
      link.dataset.mmHandedLayoutStyle=HANDED_LAYOUT_VERSION;
      document.head.appendChild(link);
    }
    if(window.WrongBookMindmapHandedLayout?.version===HANDED_LAYOUT_VERSION){
      window.WrongBookMindmapHandedLayout.install?.();
      return;
    }
    if(document.querySelector('script[data-mm-handed-layout-loader]'))return;
    const script=document.createElement('script');
    script.src=`./mindmap-handed-layout-v1.js?wb=${HANDED_LAYOUT_VERSION}`;
    script.dataset.mmHandedLayoutLoader=HANDED_LAYOUT_VERSION;
    document.body.appendChild(script);
  }

  function neutralizeMindmapSubjectContainer(){
    const wrap=document.getElementById('mmWrap');
    if(!wrap)return null;
    const current=String(wrap.getAttribute('data-subject')||state?.subject||'');
    if(current)wrap.dataset.mmSubject=current;
    // `data-subject` is reserved for actual subject controls by app-5.js.
    // Leaving it on the whole mind-map wrapper makes bind() attach an onclick
    // to the canvas; clicks on the nested <select> then re-render the page
    // before the native selection/change can complete.
    wrap.removeAttribute('data-subject');
    if(wrap.onclick)wrap.onclick=null;
    return wrap;
  }

  function install(){
    if(typeof state!=='object'||state.page!=='mindmap')return;
    ensureRootSubjectNavigation();
    neutralizeMindmapSubjectContainer();
    const toolbar=document.getElementById('mmToolbar');
    if(!toolbar||!Array.isArray(SUBJECTS)||typeof setSubject!=='function')return;
    const current=String(state.subject||SUBJECTS[0]?.id||'');
    const existing=toolbar.querySelector('[data-mm-subject-nav]');
    if(existing){
      if(existing.value!==current)existing.value=current;
      ensureHandedLayout();
      return;
    }
    const token=++installToken;
    const select=document.createElement('select');
    select.id='mmSubjectSelect';
    select.dataset.mmSubjectNav=VERSION;
    select.setAttribute('aria-label','切換心智圖科目');
    for(const subject of SUBJECTS){
      const option=document.createElement('option');
      option.value=subject.id;
      option.textContent=`${subject.symbol||''} ${subject.name}`.trim();
      option.selected=subject.id===current;
      select.appendChild(option);
    }
    // Defensive event isolation: the subject selector must never be owned by
    // a click handler on an ancestor, even if another runtime patch adds one.
    select.addEventListener('pointerdown',event=>event.stopPropagation());
    select.addEventListener('click',event=>event.stopPropagation());
    select.addEventListener('change',event=>{
      event.stopPropagation();
      if(token!==installToken)return;
      const next=select.value;
      if(!next||next===state.subject)return;
      setSubject(next);
    });
    const divider=document.createElement('span');
    divider.className='sep mm-subject-sep';
    divider.setAttribute('aria-hidden','true');
    toolbar.insertBefore(divider,toolbar.firstChild);
    toolbar.insertBefore(select,divider);
    ensureHandedLayout();
  }

  if(typeof bind==='function'){
    const baseBind=bind;
    bind=function(){
      baseBind();
      // Clear the accidental wrapper click handler synchronously, before the
      // user can interact with the freshly rendered mind-map.
      neutralizeMindmapSubjectContainer();
      setTimeout(install,0);
    };
  }
  setTimeout(install,0);
  window.WrongBookMindmapSubjectNav={
    version:VERSION,
    install,
    ensureRootSubjectNavigation,
    ensureHandedLayout,
    neutralizeMindmapSubjectContainer,
    qa(){
      const wrap=document.getElementById('mmWrap');
      const select=document.getElementById('mmSubjectSelect');
      const expected=String(state?.subject||'');
      const pass=Boolean(state?.page!=='mindmap'||(wrap&&select&&!wrap.hasAttribute('data-subject')&&!wrap.onclick&&select.value===expected));
      return{version:VERSION,pass,wrapperPresent:Boolean(wrap),wrapperHasInteractiveDataSubject:Boolean(wrap?.hasAttribute('data-subject')),wrapperHasClickHandler:Boolean(wrap?.onclick),selectPresent:Boolean(select),selectedValue:select?.value||null,expectedSubject:expected};
    }
  };
})();
