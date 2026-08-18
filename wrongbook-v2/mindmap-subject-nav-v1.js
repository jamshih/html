// Wrong Book radial mind-map subject navigation.
// Reuses the app's canonical SUBJECTS + setSubject() state flow.
(function(){
  const VERSION='2026-08-18-mindmap-subject-nav-v4';
  const ROOT_NAV_VERSION='2026-08-18-root-subject-gathering-v3';
  const HANDED_LAYOUT_VERSION='2026-08-18-handed-layout-v2';
  let installToken=0;

  function ensureStylesheet(selector,href,version,datasetKey){
    let link=document.querySelector(selector);
    if(!link){link=document.createElement('link');link.rel='stylesheet';document.head.appendChild(link)}
    if(link.getAttribute('href')!==href)link.href=href;
    link.dataset[datasetKey]=version;
    return link;
  }

  function ensureRootSubjectNavigation(){
    const href=`./mindmap-root-subject-nav-v1.css?wb=${ROOT_NAV_VERSION}`;
    ensureStylesheet('link[data-mm-root-subject-nav-style]',href,ROOT_NAV_VERSION,'mmRootSubjectNavStyle');
    if(window.WrongBookMindmapRootSubjectNav?.version===ROOT_NAV_VERSION){window.WrongBookMindmapRootSubjectNav.install?.();return}
    const existing=document.querySelector('script[data-mm-root-subject-nav-loader]');
    if(existing&&existing.dataset.mmRootSubjectNavLoader!==ROOT_NAV_VERSION)existing.remove();
    if(document.querySelector(`script[data-mm-root-subject-nav-loader="${ROOT_NAV_VERSION}"]`))return;
    const script=document.createElement('script');script.src=`./mindmap-root-subject-nav-v1.js?wb=${ROOT_NAV_VERSION}`;script.dataset.mmRootSubjectNavLoader=ROOT_NAV_VERSION;document.body.appendChild(script);
  }

  function ensureHandedLayout(){
    const href=`./mindmap-handed-layout-v2.css?wb=${HANDED_LAYOUT_VERSION}`;
    ensureStylesheet('link[data-mm-handed-layout-style]',href,HANDED_LAYOUT_VERSION,'mmHandedLayoutStyle');
    if(window.WrongBookMindmapHandedLayout?.version===HANDED_LAYOUT_VERSION){window.WrongBookMindmapHandedLayout.install?.();return}
    const existing=document.querySelector('script[data-mm-handed-layout-loader]');
    if(existing&&existing.dataset.mmHandedLayoutLoader!==HANDED_LAYOUT_VERSION)existing.remove();
    if(document.querySelector(`script[data-mm-handed-layout-loader="${HANDED_LAYOUT_VERSION}"]`))return;
    const script=document.createElement('script');script.src=`./mindmap-handed-layout-v2.js?wb=${HANDED_LAYOUT_VERSION}`;script.dataset.mmHandedLayoutLoader=HANDED_LAYOUT_VERSION;document.body.appendChild(script);
  }

  function neutralizeMindmapSubjectContainer(){
    const wrap=document.getElementById('mmWrap');if(!wrap)return null;
    const current=String(wrap.getAttribute('data-subject')||state?.subject||'');if(current)wrap.dataset.mmSubject=current;
    wrap.removeAttribute('data-subject');if(wrap.onclick)wrap.onclick=null;return wrap;
  }

  function install(){
    if(typeof state!=='object'||state.page!=='mindmap')return;
    ensureRootSubjectNavigation();neutralizeMindmapSubjectContainer();
    const toolbar=document.getElementById('mmToolbar');if(!toolbar||!Array.isArray(SUBJECTS)||typeof setSubject!=='function')return;
    const current=String(state.subject||SUBJECTS[0]?.id||''),existing=toolbar.querySelector('[data-mm-subject-nav]');
    if(existing){if(existing.value!==current)existing.value=current;ensureHandedLayout();return}
    const token=++installToken,select=document.createElement('select');select.id='mmSubjectSelect';select.dataset.mmSubjectNav=VERSION;select.setAttribute('aria-label','切換心智圖科目');
    for(const subject of SUBJECTS){const option=document.createElement('option');option.value=subject.id;option.textContent=`${subject.symbol||''} ${subject.name}`.trim();option.selected=subject.id===current;select.appendChild(option)}
    select.addEventListener('pointerdown',event=>event.stopPropagation());select.addEventListener('click',event=>event.stopPropagation());select.addEventListener('change',event=>{event.stopPropagation();if(token!==installToken)return;const next=select.value;if(!next||next===state.subject)return;setSubject(next)});
    const divider=document.createElement('span');divider.className='sep mm-subject-sep';divider.setAttribute('aria-hidden','true');toolbar.insertBefore(divider,toolbar.firstChild);toolbar.insertBefore(select,divider);ensureHandedLayout();
  }

  if(typeof bind==='function'){const baseBind=bind;bind=function(){baseBind();neutralizeMindmapSubjectContainer();setTimeout(install,0)}}
  setTimeout(install,0);
  window.WrongBookMindmapSubjectNav={version:VERSION,install,ensureRootSubjectNavigation,ensureHandedLayout,neutralizeMindmapSubjectContainer,qa(){
    const wrap=document.getElementById('mmWrap'),select=document.getElementById('mmSubjectSelect'),expected=String(state?.subject||'');
    const handed=window.WrongBookMindmapHandedLayout?.version||'',rootNav=window.WrongBookMindmapRootSubjectNav?.version||'';
    const pass=Boolean(state?.page!=='mindmap'||(wrap&&select&&!wrap.hasAttribute('data-subject')&&!wrap.onclick&&select.value===expected&&handed===HANDED_LAYOUT_VERSION&&rootNav===ROOT_NAV_VERSION));
    return{version:VERSION,pass,wrapperPresent:Boolean(wrap),selectPresent:Boolean(select),selectedValue:select?.value||null,expectedSubject:expected,handedLayout:handed,rootNavigation:rootNav};
  }};
})();
