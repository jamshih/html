// Wrong Book V5 — collapsible tutor dialogue UI + neutral answer wording.
// The tutor is a dialogue surface. Visible copy should talk about answers, progress and AI hints,
// not imply that the interaction itself is a handwriting-only workflow.
(function(){
  const VERSION='2026-08-17-tutor-dialog-ui-v5d';
  if(window.__wrongbookTutorDialogUI===VERSION)return;
  window.__wrongbookTutorDialogUI=VERSION;

  const COLLAPSE_KEY='wrongbook-v5-tutor-collapse';
  const copyRules=[
    ['直接在原題上寫；寫好後按「我寫好了，幫我看」','完成你的回答後，按「我答好了，幫我看」'],
    ['AI 正在看你的題目與筆跡…','AI 正在看你的題目與作答…'],
    ['AI 筆跡會直接畫在原題上','AI 提示會顯示在題目上'],
    ['AI 讀得到你的筆跡','AI 會參考你的作答'],
    ['AI 也寫在這裡','AI 提示也會顯示在這裡'],
    ['顯示 AI 筆跡','顯示 AI 提示'],
    ['隱藏 AI 筆跡','隱藏 AI 提示'],
    ['顯示筆跡','顯示提示'],
    ['隱藏筆跡','隱藏提示'],
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
  function installToastWrapper(){
    if(window.__wrongbookTutorDialogToastWrapped)return true;
    if(typeof window.toast!=='function')return false;
    window.__wrongbookTutorDialogToastWrapped=true;
    const baseToast=window.toast;
    window.toast=function(message){return baseToast.call(this,normalizeText(message))};
    try{toast=window.toast}catch{}
    return true;
  }
  if(!installToastWrapper()){
    let tries=0;const timer=setInterval(()=>{tries++;if(installToastWrapper()||tries>80)clearInterval(timer)},100);
  }

  function selectedId(){
    try{
      const fromState=window.state?.selectedProblemId||'';
      if(fromState)return String(fromState);
      if(typeof selectedProblem==='function')return String(selectedProblem()?.id||'');
    }catch{}
    return '';
  }
  function readPrefs(){
    try{const raw=localStorage.getItem(COLLAPSE_KEY);const parsed=raw?JSON.parse(raw):{};return parsed&&typeof parsed==='object'?parsed:{}}catch{return {}}
  }
  function writePrefs(prefs){try{localStorage.setItem(COLLAPSE_KEY,JSON.stringify(prefs))}catch{}}
  function collapsedFor(id){if(!id)return false;return Boolean(readPrefs()[id])}
  function persistCollapsed(id,next){
    if(!id)return;
    const prefs=readPrefs();prefs[id]=Boolean(next);writePrefs(prefs);
    try{
      if(window.state){if(!state.tutorUiCollapsed||typeof state.tutorUiCollapsed!=='object')state.tutorUiCollapsed={};state.tutorUiCollapsed[id]=Boolean(next);typeof save==='function'&&save()}
    }catch{}
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

  function iconMarkup(){
    return '<svg class="v5-dialog-collapse-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path class="v5-collapse-path-a" d="M9 5H5v4"/><path class="v5-collapse-path-b" d="M15 19h4v-4"/></svg>';
  }
  function setToggleVisual(toggle,collapsed){
    if(!toggle)return;
    const action=collapsed?'展開 AI 家教':'收合 AI 家教';
    toggle.setAttribute('aria-label',action);
    toggle.setAttribute('aria-expanded',String(!collapsed));
    toggle.dataset.tooltip=action;
    toggle.dataset.collapsed=collapsed?'1':'0';
    const a=toggle.querySelector('.v5-collapse-path-a');
    const b=toggle.querySelector('.v5-collapse-path-b');
    if(collapsed){
      a?.setAttribute('d','M9 5H5v4');
      b?.setAttribute('d','M15 19h4v-4');
    }else{
      a?.setAttribute('d','M8 4v4H4');
      b?.setAttribute('d','M16 20v-4h4');
    }
  }
  function applyCollapsedState(dock,next,{persist=true}={}){
    if(!dock)return;
    const id=dock.dataset.problemId||selectedId();
    if(id)dock.dataset.problemId=id;
    dock.classList.toggle('is-dialog-collapsed',Boolean(next));
    const bar=dock.querySelector(':scope > .v5-dialog-collapse-bar');
    const toggle=bar?.querySelector('.v5-dialog-collapse-toggle');
    setToggleVisual(toggle,Boolean(next));
    if(persist&&id)persistCollapsed(id,next);
  }

  function ensureCollapseBar(dock){
    const id=selectedId();if(id)dock.dataset.problemId=id;
    let bar=dock.querySelector(':scope > .v5-dialog-collapse-bar');
    if(!bar){
      bar=document.createElement('div');
      bar.className='v5-dialog-collapse-bar';
      bar.innerHTML=`<span class="v5-dialog-collapse-summary">AI 家教</span><button type="button" class="v5-dialog-collapse-toggle" data-tooltip="收合 AI 家教" aria-label="收合 AI 家教" aria-expanded="true">${iconMarkup()}</button>`;
      dock.prepend(bar);
    }
    const summary=bar.querySelector('.v5-dialog-collapse-summary');
    if(summary){const next=summaryFor(dock);if(summary.textContent!==next)summary.textContent=next}
    applyCollapsedState(dock,collapsedFor(dock.dataset.problemId||id),{persist:false});
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
    app.querySelectorAll('.v5-tutor-dock').forEach(ensureCollapseBar);
  }

  // Capture-phase delegation makes the control reliable even when later runtime layers rerender
  // or attach broad click handlers to the tutor dock.
  if(!window.__wrongbookTutorDialogCollapseBound){
    window.__wrongbookTutorDialogCollapseBound=true;
    document.addEventListener('click',event=>{
      const toggle=event.target.closest?.('.v5-dialog-collapse-toggle');
      if(!toggle)return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const dock=toggle.closest('.v5-tutor-dock');
      if(!dock)return;
      applyCollapsedState(dock,!dock.classList.contains('is-dialog-collapsed'),{persist:true});
    },true);
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

  window.wrongbookTutorDialogState=()=>{
    const dock=document.querySelector('.v5-tutor-dock');
    return{version:VERSION,problemId:dock?.dataset.problemId||selectedId(),collapsed:Boolean(dock?.classList.contains('is-dialog-collapsed'))};
  };
})();
