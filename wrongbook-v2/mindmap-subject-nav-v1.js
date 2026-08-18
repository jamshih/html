// Wrong Book radial mind-map subject navigation.
// Reuses the app's canonical SUBJECTS + setSubject() state flow.
(function(){
  const VERSION='2026-08-18-mindmap-subject-nav-v1';
  let installToken=0;

  function install(){
    if(typeof state!=='object'||state.page!=='mindmap')return;
    const toolbar=document.getElementById('mmToolbar');
    if(!toolbar||!Array.isArray(SUBJECTS)||typeof setSubject!=='function')return;
    if(toolbar.querySelector('[data-mm-subject-nav]'))return;
    const token=++installToken;
    const current=String(state.subject||SUBJECTS[0]?.id||'');
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
    select.addEventListener('change',()=>{
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
  }

  if(typeof bind==='function'){
    const baseBind=bind;
    bind=function(){baseBind();setTimeout(install,0)};
  }
  setTimeout(install,0);
  window.WrongBookMindmapSubjectNav={version:VERSION,install};
})();
