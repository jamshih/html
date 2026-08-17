// Wrong Book V6 — final tutor dialog collapse control.
// This is loaded directly after all paper-first/runtime compatibility layers so no legacy
// collapse UI can win the final render. It also neutralizes handwriting-only wording.
(function(){
  const VERSION='2026-08-17-tutor-dialog-control-v6-theme1';
  if(window.__wrongbookTutorDialogControlV6===VERSION)return;
  window.__wrongbookTutorDialogControlV6=VERSION;

  try{window.__wrongbookTutorDialogObserver?.disconnect?.()}catch{}
  window.__wrongbookTutorDialogUI='superseded-by-v6';

  const PREF_KEY='wrongbook-v6-tutor-collapse';
  const runtimeCollapsed=new Map();
  const COPY_RULES=[
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
    ['手寫內容','作答內容'],
    ['手寫','作答'],
    ['筆跡','作答內容']
  ];

  function normalizeText(value=''){
    let text=String(value);
    for(const [from,to] of COPY_RULES)text=text.split(from).join(to);
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

  if(typeof window.v3GuideApi==='function'&&!window.__wrongbookTutorDialogV6ApiWrapped){
    window.__wrongbookTutorDialogV6ApiWrapped=true;
    const base=window.v3GuideApi;
    window.v3GuideApi=async function(body){return normalizeDeep(await base.call(this,normalizeDeep(body)))};
    try{v3GuideApi=window.v3GuideApi}catch{}
  }

  function currentProblemId(){
    try{
      const id=window.state?.selectedProblemId;
      if(id)return String(id);
      if(typeof window.selectedProblem==='function')return String(window.selectedProblem()?.id||'');
    }catch{}
    return 'current';
  }
  function readPrefs(){try{return JSON.parse(localStorage.getItem(PREF_KEY)||'{}')||{}}catch{return {}}}
  function isCollapsed(id){if(runtimeCollapsed.has(id))return runtimeCollapsed.get(id);return Boolean(readPrefs()[id])}
  function storeCollapsed(id,value){
    runtimeCollapsed.set(id,Boolean(value));
    try{const prefs=readPrefs();prefs[id]=Boolean(value);localStorage.setItem(PREF_KEY,JSON.stringify(prefs))}catch{}
  }

  function summaryFor(dock){
    const direct=dock.querySelector('[data-v5-tutor-mode="direct"]')?.classList.contains('active');
    const finished=[...dock.querySelectorAll('button')].some(b=>b.disabled&&b.textContent.trim()==='詳解完成');
    const stage=dock.querySelector('.v5-tutor-stage-head>span')?.textContent?.trim()||'';
    const right=Boolean(dock.querySelector('.v5-tutor-stage-head .is-right'));
    if(finished)return 'AI 家教 · 詳解完成';
    if(direct)return `AI 家教 · ${stage||'直接詳解'}`;
    if(right)return 'AI 家教 · 目前方向正確';
    return `AI 家教 · ${stage||'引導中'}`;
  }

  function buttonMarkup(){
    return `<button type="button" class="v6-tutor-collapse-button" aria-expanded="true" aria-label="收合 AI 家教" data-tooltip="收合 AI 家教">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path class="corner corner-a" d="M9 5H5v4"/>
        <path class="corner corner-b" d="M15 19h4v-4"/>
      </svg>
    </button>`;
  }

  function setButtonState(button,collapsed){
    if(!button)return;
    const label=collapsed?'展開 AI 家教':'收合 AI 家教';
    button.setAttribute('aria-expanded',String(!collapsed));
    button.setAttribute('aria-label',label);
    button.dataset.tooltip=label;
    button.dataset.state=collapsed?'collapsed':'expanded';
  }

  function applyCollapsedState(dock,collapsed,{persist=false}={}){
    if(!dock)return;
    const id=dock.dataset.v6ProblemId||currentProblemId();
    dock.dataset.v6ProblemId=id;
    dock.classList.toggle('v6-tutor-collapsed',Boolean(collapsed));
    setButtonState(dock.querySelector(':scope > .v6-tutor-collapse-bar .v6-tutor-collapse-button'),Boolean(collapsed));
    if(persist)storeCollapsed(id,collapsed);
  }

  function installBar(dock){
    if(!dock)return;
    dock.querySelectorAll(':scope > .v5-dialog-collapse-bar').forEach(el=>el.remove());
    dock.querySelectorAll(':scope > .v6-tutor-collapse-bar').forEach((el,i)=>{if(i>0)el.remove()});

    let bar=dock.querySelector(':scope > .v6-tutor-collapse-bar');
    if(!bar){
      bar=document.createElement('div');
      bar.className='v6-tutor-collapse-bar';
      bar.innerHTML=`<span class="v6-tutor-collapse-summary">AI 家教</span>${buttonMarkup()}`;
      dock.prepend(bar);
    }
    const id=currentProblemId();
    dock.dataset.v6ProblemId=id;
    const summary=bar.querySelector('.v6-tutor-collapse-summary');
    const nextSummary=summaryFor(dock);
    if(summary&&summary.textContent!==nextSummary)summary.textContent=nextSummary;
    applyCollapsedState(dock,isCollapsed(id));
  }

  function normalizeVisibleCopy(root){
    root.querySelectorAll?.('.v5-tutor-dock button,.v5-tutor-dock p,.v5-tutor-dock strong,.v5-tutor-dock span,.paper .panel-head .meta,.v3-guide-caption,[data-guide-status]').forEach(el=>{
      if(el.closest('.katex'))return;
      [...el.childNodes].forEach(node=>{
        if(node.nodeType!==Node.TEXT_NODE)return;
        const next=normalizeText(node.nodeValue||'');
        if(next!==node.nodeValue)node.nodeValue=next;
      });
    });
  }

  function apply(){
    const app=document.getElementById('app');if(!app)return;
    normalizeVisibleCopy(app);
    app.querySelectorAll('.v5-tutor-dock').forEach(installBar);
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest?.('.v6-tutor-collapse-button');
    if(!button)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    const dock=button.closest('.v5-tutor-dock');if(!dock)return;
    applyCollapsedState(dock,!dock.classList.contains('v6-tutor-collapsed'),{persist:true});
  },true);

  document.addEventListener('pointerover',event=>{
    const button=event.target.closest?.('.v6-tutor-collapse-button');
    if(button)button.title=button.dataset.tooltip||button.getAttribute('aria-label')||'';
  },true);

  let queued=false;
  function queueApply(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  const app=document.getElementById('app');
  if(app&&typeof MutationObserver==='function'){
    const observer=new MutationObserver(queueApply);
    observer.observe(app,{subtree:true,childList:true,characterData:true});
    window.__wrongbookTutorDialogV6Observer=observer;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queueApply,{once:true});
  else queueApply();

  window.wrongbookTutorDialogV6State=function(){
    const dock=document.querySelector('.v5-tutor-dock');
    return{version:VERSION,problemId:dock?.dataset.v6ProblemId||currentProblemId(),collapsed:Boolean(dock?.classList.contains('v6-tutor-collapsed')),buttonCount:document.querySelectorAll('.v6-tutor-collapse-button').length,legacyBarCount:document.querySelectorAll('.v5-dialog-collapse-bar').length};
  };

  function rgbBrightness(value=''){
    const nums=String(value).match(/[\d.]+/g)?.slice(0,3).map(Number)||[];
    return nums.length===3?(nums[0]*.2126+nums[1]*.7152+nums[2]*.0722):NaN;
  }
  window.runWrongbookTutorCollapseQA=function(){
    apply();
    const dock=document.querySelector('.v5-tutor-dock');
    const button=dock?.querySelector(':scope > .v6-tutor-collapse-bar .v6-tutor-collapse-button');
    if(!dock||!button)return{pass:false,reason:'tutor-not-mounted'};

    const root=document.documentElement;
    const hadTheme=root.hasAttribute('data-theme');
    const oldTheme=root.getAttribute('data-theme');
    const sample=theme=>{
      root.setAttribute('data-theme',theme);
      const s=getComputedStyle(button);
      return{width:parseFloat(s.width),height:parseFloat(s.height),background:s.backgroundColor,color:s.color,border:s.borderColor};
    };
    const light=sample('light');
    const dark=sample('dark');
    if(hadTheme)root.setAttribute('data-theme',oldTheme||'');else root.removeAttribute('data-theme');

    const wasCollapsed=dock.classList.contains('v6-tutor-collapsed');
    applyCollapsedState(dock,true,{persist:false});
    const collapsedChildren=[...dock.children].filter(el=>!el.classList.contains('v6-tutor-collapse-bar'));
    const contentHidden=collapsedChildren.every(el=>getComputedStyle(el).display==='none');
    applyCollapsedState(dock,wasCollapsed,{persist:false});

    const mobile=matchMedia('(max-width:700px)').matches;
    const expectedSize=mobile?36:30;
    const buttonCount=document.querySelectorAll('.v6-tutor-collapse-button').length;
    const legacyBarCount=document.querySelectorAll('.v5-dialog-collapse-bar').length;
    const lightIsLight=rgbBrightness(light.background)>180;
    const darkIsDark=rgbBrightness(dark.background)<90;
    const sizeOk=Math.abs(light.width-expectedSize)<.6&&Math.abs(light.height-expectedSize)<.6&&Math.abs(dark.width-expectedSize)<.6&&Math.abs(dark.height-expectedSize)<.6;
    const pass=buttonCount===1&&legacyBarCount===0&&contentHidden&&sizeOk&&lightIsLight&&darkIsDark&&light.background!==dark.background;
    return{pass,version:VERSION,mobile,expectedSize,buttonCount,legacyBarCount,contentHidden,sizeOk,lightIsLight,darkIsDark,light,dark};
  };

  function scheduleRuntimeQA(tries=0){
    requestAnimationFrame(()=>{
      const result=window.runWrongbookTutorCollapseQA?.();
      if(result?.reason==='tutor-not-mounted'&&tries<20)return setTimeout(()=>scheduleRuntimeQA(tries+1),150);
      window.__wrongbookTutorDialogV6QA=result;
      if(result&&!result.pass)console.warn('[Wrongbook tutor collapse QA failed]',result);
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>scheduleRuntimeQA(),{once:true});
  else scheduleRuntimeQA();
})();
