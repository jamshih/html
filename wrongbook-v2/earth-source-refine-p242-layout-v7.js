// p242 local refinement: keep q18's three printed cause blanks vertically grouped, away from q19/q20.
(function(){
  const prev=window.v5PageHtml;
  if(typeof prev!=='function')return;
  window.v5PageHtml=function(ch,sem,page,mode){
    let html=prev(ch,sem,page,mode);
    if(page!==242)return html;
    const t=document.createElement('template');t.innerHTML=html;
    const el=t.content.querySelector('[data-question="18"]');
    if(el&&typeof window.v4StrictField==='function'){
      const f=i=>window.v4StrictField(ch,18,i,mode,150);
      el.innerHTML=`<b class="v4strict-num">(18)</b> 3大主因<div style="display:grid;grid-template-columns:18px 1fr;gap:5px 7px;margin-top:4px;align-items:center"><span>1.</span>${f(0)}<span>2.</span>${f(1)}<span>3.</span>${f(2)}</div>`;
      el.style.width='270px';
      el.style.lineHeight='1.25';
      el.dataset.v7PromptStatus='verified';
      el.dataset.v7SourcePrompt='true';
      el.dataset.v7SourceBlankCount='3';
    }
    return t.innerHTML;
  };
  if(typeof window.render==='function')window.render();
})();
