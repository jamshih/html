// Wrong Book V5 — collapsible tutor dialogue UI + neutral answer wording.
// The tutor is a dialogue surface. Visible copy should talk about answers, progress and AI marks,
// not imply that the interaction itself is a handwriting-only workflow.
(function(){
  const VERSION='2026-08-17-tutor-dialog-ui-v5b';
  if(window.__wrongbookTutorDialogUI===VERSION)return;
  window.__wrongbookTutorDialogUI=VERSION;

  const copyRules=[
    ['直接在原題上寫；寫好後按「我寫好了，幫我看」','完成你的回答後，按「我答好了，幫我看」'],
    ['AI 正在看你的題目與筆跡…','AI 正在看你的題目與作答…'],
    ['AI 筆跡會直接畫在原題上','AI 提示會顯示在題目上'],
    ['AI 讀得到你的筆跡','AI 會參考你的作答'],
    ['AI 也寫在這裡','AI 提示也會顯示在這裡'],
    ['顯示 AI 筆跡','顯示 AI 標記'],
    ['隱藏 AI 筆跡','隱藏 AI 標記'],
    ['顯示筆跡','顯示標記'],
    ['隱藏筆跡','隱藏標記'],
    ['我寫好了，幫我看','我答好了，幫我看'],
    ['新增的筆跡','更新的作答'],
    ['新筆跡','新作答'],
    ['筆跡','作答內容'],
    ['手寫內容','作答內容'],
    ['手寫','作答']
  ];

  function normalizeText(value=''){
    let text=String(value);
    for(const [from,to] of copyRules)text=text.split(from).join(to);
    return text;
  }
  function normalizeDeep(value){
    if(typeof value==='string')return normalizeText(value);
    if(Array.isArray(value))return value.map(normalizeDeep);
    if(value&&typeof value==='object'){
      const out={};for(const [k,v] of Object.entries(value))out[k]=normalizeDeep(v);return out;
    }
    return value;
  }

  function installApiWrapper(){
    if(window.__wrongbookTutorDialogApiWrapped)return true;
    if(typeof window.v3GuideApi!=='function')return false;
    window.__wrongbookTutorDialogApiWrapped=true;
    const baseApi=window.v3GuideApi;
    window.v3GuideApi=async function(body){
      const res=await baseApi.call(this,normalizeDeep(body));
      return normalizeDeep(res);
    };
    try{v3GuideApi=window.v3GuideApi}catch{}
    return true;
  }
  if(!installApiWrapper()){
    let tries=0;const timer=setInterval(()=>{tries++;if(installApiWrapper()||tries>80)clearInterval(timer)},100);
  }

  // Toasts live outside #app, so normalize them at the source as well.
  if(typeof window.toast==='function'&&!window.__wrongbookTutorDialogToastWrapped){
    window.__wrongbookTutorDialogToastWrapped=true;
    const baseToast=window.toast;
    window.toast=function(message){return baseToast.call(this,normalizeText(message))};
    try{toast=window.toast}catch{}
  }

  function selectedId(){
    try{return typeof selectedProblem==='function'?(selectedProblem()?.id||''):''}catch{return ''}
  }
  function collapsedMap(){
    if(!window.state)return {};
    if(!state.tutorUiCollapsed||typeof state.tutorUiCollapsed!=='object')state.tutorUiCollapsed={};
    return state.tutorUiCollapsed;
  }
  function isCollapsed(){const id=selectedId();return Boolean(id&&collapsedMap()[id])}
  function setCollapsed(next){
    const id=selectedId();if(!id)return;
    collapsedMap()[id]=Boolean(next);
    try{typeof save==='function'&&save()}catch{}
    apply();
  }

  function summaryFor(dock){
    const direct=dock.querySelector('[data-v5-tutor-mode="direct"]')?.classList.contains('active');
    const finished=[...dock.querySelectorAll('button')].some(b=>b.disabled&&b.textContent.trim()==='詳解完成');
    const stage=dock.querySelector('.v5-tutor-stage-head>span')?.textContent?.trim()||'';
    const right=Boolean(dock.querySelector('.v5-tutor-stage-head .is-right'));
    if(finished)return 'AI 家教 · 詳解完成';
    if(direct)return `AI 家教 · ${stage||'直接詳解'}`;
    return `AI 家教 · ${right?'目前方向正確':stage||'引導中'}`;
  }

  function ensureCollapseBar(dock){
    let bar=dock.querySelector(':scope > .v5-dialog-collapse-bar');
    if(!bar){
      bar=document.createElement('div');
      bar.className='v5-dialog-collapse-bar';
      bar.innerHTML='<span class="v5-dialog-collapse-summary">AI 家教</span><button type="button" class="v5-dialog-collapse-toggle" aria-expanded="true"><span class="v5-dialog-collapse-label">收合</span><span class="v5-dialog-collapse-chevron" aria-hidden="true">⌃</span></button>';
      dock.prepend(bar);
      bar.querySelector('.v5-dialog-collapse-toggle')?.addEventListener('click',()=>setCollapsed(!isCollapsed()));
    }
    const collapsed=isCollapsed();
    dock.classList.toggle('is-dialog-collapsed',collapsed);
    const toggle=bar.querySelector('.v5-dialog-collapse-toggle');
    const label=bar.querySelector('.v5-dialog-collapse-label');
    const chevron=bar.querySelector('.v5-dialog-collapse-chevron');
    const summary=bar.querySelector('.v5-dialog-collapse-summary');
    if(toggle)toggle.setAttribute('aria-expanded',String(!collapsed));
    if(label)label.textContent=collapsed?'展開':'收合';
    if(chevron)chevron.textContent=collapsed?'⌄':'⌃';
    if(summary)summary.textContent=summaryFor(dock);
  }

  function normalizeVisibleCopy(root=document){
    const selectors=[
      '.v5-tutor-dock button','.v5-tutor-dock p','.v5-tutor-dock strong','.v5-tutor-dock span',
      '.paper .panel-head .meta','.v3-guide-caption','[data-guide-status]'
    ];
    root.querySelectorAll?.(selectors.join(',')).forEach(el=>{
      if(el.closest('.katex'))return;
      for(const node of el.childNodes){
        if(node.nodeType===Node.TEXT_NODE){const next=normalizeText(node.nodeValue||'');if(next!==node.nodeValue)node.nodeValue=next}
      }
    });
  }

  function apply(){
    const app=document.getElementById('app');if(!app)return;
    normalizeVisibleCopy(app);
    const dock=app.querySelector('.v5-tutor-dock');if(dock)ensureCollapseBar(dock);
  }

  let queued=false;
  function queueApply(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  const app=document.getElementById('app');
  if(app&&typeof MutationObserver==='function'){
    const observer=new MutationObserver(queueApply);observer.observe(app,{subtree:true,childList:true,characterData:true});
    window.__wrongbookTutorDialogObserver=observer;
  }
  document.addEventListener('DOMContentLoaded',queueApply,{once:true});
  queueApply();

  window.wrongbookTutorDialogState=()=>({version:VERSION,problemId:selectedId(),collapsed:isCollapsed()});
})();
