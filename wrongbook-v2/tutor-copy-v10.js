// Wrong Book V10 — clean tutor prose rendering + visible-copy QA.
(function(){
  const VERSION='2026-08-17-tutor-copy-v10';
  if(window.__wrongbookTutorCopyV10===VERSION)return;
  window.__wrongbookTutorCopyV10=VERSION;

  const SELECTOR=[
    '.v5-tutor-stage > p',
    '.v3-guide-caption',
    '.tutor-answer',
    '.tutor-step'
  ].join(',');

  function normalizeEscapedBreaks(value=''){
    return String(value)
      .replace(/\\n\\n/g,'\n\n')
      .replace(/\\n(?=[^A-Za-z])/g,'\n')
      .replace(/\r\n?/g,'\n')
      .replace(/[ \t]+\n/g,'\n')
      .replace(/\n[ \t]+/g,'\n')
      .replace(/\n{3,}/g,'\n\n');
  }
  function esc(value=''){
    return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  }
  function inline(value=''){
    let out=esc(value);
    out=out.replace(/\*\*([^*\n]+?)\*\*/g,'<strong>$1</strong>');
    return out;
  }
  function richHtml(value=''){
    const source=normalizeEscapedBreaks(value);
    const blocks=source.split(/\n\n+/).map(x=>x.trim()).filter(Boolean);
    if(!blocks.length)return'';
    return blocks.map(block=>{
      const lines=block.split('\n').map(x=>x.trim()).filter(Boolean);
      return `<span class="v10-copy-block">${lines.map(inline).join('<br>')}</span>`;
    }).join('<span class="v10-copy-gap" aria-hidden="true"></span>');
  }
  function signature(value=''){
    let h=2166136261;
    for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}
    return (h>>>0).toString(36);
  }
  function decorate(el){
    if(!el||el.closest('.katex'))return false;
    const source=el.textContent||'';
    const normalized=normalizeEscapedBreaks(source);
    const sig=signature(normalized);
    if(el.dataset.v10CopySig===sig)return false;
    el.dataset.v10CopySig=sig;
    el.classList.add('v10-tutor-copy');
    el.innerHTML=richHtml(normalized);
    return true;
  }
  function apply(root=document){
    const scope=root?.querySelectorAll?root:document;
    let changed=false;
    scope.querySelectorAll(SELECTOR).forEach(el=>{if(decorate(el))changed=true});
    if(changed&&typeof window.v5RenderTutorMath==='function')requestAnimationFrame(()=>window.v5RenderTutorMath(document));
    return changed;
  }

  let queued=false;
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply(document)})}
  const mount=()=>{
    const app=document.getElementById('app');
    if(!app)return setTimeout(mount,40);
    const observer=new MutationObserver(queue);
    observer.observe(app,{subtree:true,childList:true,characterData:true});
    window.__wrongbookTutorCopyV10Observer=observer;
    apply(document);
  };
  mount();

  window.runWrongbookTutorCopyQA=function(){
    const fixture=document.createElement('p');
    fixture.className='v5-tutor-stage-copy-fixture';
    fixture.textContent='第一步\\n\\n1. **合力**應為 0。\\n2. **靜摩擦力**重新平衡。';
    decorate(fixture);
    const text=fixture.textContent||'';
    const fixtureOk=!text.includes('\\n')&&!text.includes('**')&&fixture.querySelectorAll('strong').length===2&&fixture.querySelectorAll('.v10-copy-block').length===2;
    apply(document);
    const visible=[...document.querySelectorAll(SELECTOR)].filter(el=>el.offsetParent!==null);
    const rawNewlines=visible.filter(el=>(el.textContent||'').includes('\\n')).length;
    const rawBold=visible.filter(el=>(el.textContent||'').includes('**')).length;
    const pass=fixtureOk&&rawNewlines===0&&rawBold===0;
    return{pass,version:VERSION,fixtureOk,rawNewlines,rawBold,visibleCount:visible.length};
  };
  function scheduleQA(tries=0){
    setTimeout(()=>{
      const r=window.runWrongbookTutorCopyQA?.();
      if((!r||!r.visibleCount)&&tries<20)return scheduleQA(tries+1);
      window.__wrongbookTutorCopyV10QA=r;
      if(r&&!r.pass)console.warn('[Wrongbook tutor copy QA failed]',r);
    },150);
  }
  scheduleQA();
})();
