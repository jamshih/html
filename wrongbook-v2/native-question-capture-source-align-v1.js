// Final Wrong Book scan boot order: high-resolution preprocess -> scanner -> OCR -> clean question -> single stable tutor navigator.
// V3 also enforces a product-level contract: every selected problem has AI tutor access, regardless of subject,
// question type, scan confirmation state, handwriting presence, or whether the problem came from OCR/demo/history.
(function(){
  if(window.__wrongbookNativeQuestionSourceAlignV3)return;
  window.__wrongbookNativeQuestionSourceAlignV3=true;
  window.__wrongbookNativeQuestionSourceAlignV2=true;

  if(typeof scanToProblem==='function'){
    const base=scanToProblem;
    scanToProblem=function(id,confirmed){const p=base(id,confirmed);if(p&&String(id||'').startsWith('scan-'))p.sourceImage=state.scanDisplayImage||state.scanImage||p.sourceImage||'';return p};
    try{window.scanToProblem=scanToProblem}catch{}
  }

  const selected=()=>{try{return typeof selectedProblem==='function'?selectedProblem():null}catch{return null}};
  const tutorSession=p=>{try{return p&&typeof v5TutorSession==='function'?v5TutorSession(p):(p&&state?.tutorSessions?.[p.id])||null}catch{return null}};
  const escTutor=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function tutorDisclosure(p){
    const awaiting=String(p?.id||'').startsWith('scan-')&&!p?.confirmed;
    const note=awaiting?'<div class="callout warn wb-universal-tutor-note">這題尚未確認；AI 家教會先依目前 OCR 題幹與作答辨識提供提示，確認後會自動使用正式題目資料。</div>':'';
    const body=typeof tutorMiniPanel==='function'?tutorMiniPanel(p):`<section class="panel"><div class="panel-head"><h3>AI 家教</h3></div><div class="tutor"><div class="callout">AI 家教可以讀取這一題與目前筆跡，先給下一步提示。</div><div class="tutor-input"><input id="miniTutorInput" placeholder="例如：我卡在哪一步？"><button class="primary-btn" data-action="askMiniTutor">問 AI</button></div></div></section>`;
    return `<details class="pf-disclosure wb-universal-tutor-disclosure"><summary>AI 家教<span>＋</span></summary><div class="pf-disclosure-body">${note}${body}</div></details>`;
  }

  function installUniversalProblemWorkspace(){
    try{
      if(typeof problemWorkspace!=='function'||problemWorkspace.__wbUniversalTutorAccess)return;
      const base=problemWorkspace;
      const wrapped=function(p){
        let html=base.apply(this,arguments);if(!p||typeof html!=='string')return html;
        const already=/wb-universal-tutor-disclosure|id=["']miniTutorInput["']|data-action=["']askMiniTutor["']|更多家教方式/.test(html);
        if(already)return html;
        const disclosure=tutorDisclosure(p);
        if(html.includes('</aside>'))return html.replace('</aside>',`${disclosure}</aside>`);
        return `${html}${disclosure}`;
      };
      wrapped.__wbUniversalTutorAccess=true;wrapped.__wbUniversalTutorBase=base;
      problemWorkspace=wrapped;window.problemWorkspace=wrapped;
    }catch{}
  }

  function installUniversalPaperPanel(){
    try{
      if(typeof paperPanel!=='function'||paperPanel.__wbUniversalTutorAccess)return;
      const base=paperPanel;
      const wrapped=function(p){
        let html=base.apply(this,arguments);if(!p||typeof html!=='string'||/data-action=["']aiOnPaper["']/.test(html))return html;
        const launch='<div class="wb-universal-tutor-fallback"><button type="button" class="soft-btn wb-universal-tutor-launch" data-action="aiOnPaper">✦ AI 家教看我的作答</button></div>';
        return html.includes('</section>')?html.replace('</section>',`${launch}</section>`):`${html}${launch}`;
      };
      wrapped.__wbUniversalTutorAccess=true;wrapped.__wbUniversalTutorBase=base;
      paperPanel=wrapped;window.paperPanel=wrapped;
    }catch{}
  }

  async function startTutorFallback(){
    const p=selected();
    if(!p){typeof toast==='function'&&toast('先選一題錯題');return false}
    try{
      if(typeof v5CancelGuidePlayback==='function')v5CancelGuidePlayback();
      if(typeof state!=='undefined')state.aiGuideMode='instructive';
      const s=tutorSession(p);
      if(s&&s.mode==='instructive'&&Array.isArray(s.stages)&&s.stages.length){
        if(typeof v5TutorEvaluate==='function')await v5TutorEvaluate();
        else if(typeof v5TutorHint==='function')await v5TutorHint();
        else if(typeof v5TutorStart==='function')await v5TutorStart('instructive');
      }else if(typeof v5TutorStart==='function')await v5TutorStart('instructive');
      else if(typeof askTutor==='function')await askTutor('不要直接告訴我完整答案。先讀這一題與我目前的作答，只給最有用的下一步提示。',true);
      else{typeof toast==='function'&&toast('AI 家教尚未載入，請重新整理後再試');return false}
      return true;
    }catch(e){typeof toast==='function'&&toast('AI 家教提示失敗：'+(e?.message||e));return false}
  }

  function ensureTutorDom(){
    installUniversalProblemWorkspace();installUniversalPaperPanel();
    const p=selected();if(!p||state?.page!=='notebook')return;
    document.documentElement.dataset.wbTutorUniversal='1';
    let buttons=[...document.querySelectorAll('[data-action="aiOnPaper"]')];
    if(!buttons.length){
      const paper=document.getElementById('paper')||document.querySelector('.v3-paper,.paper,.ocrq-sheet');
      if(paper){
        let host=paper.querySelector('.ocrq-toolbar .toolset:last-child,.paper-toolbar .toolset:last-child');
        if(!host){host=document.createElement('div');host.className='wb-universal-tutor-fallback';paper.appendChild(host)}
        const button=document.createElement('button');button.type='button';button.className=host.classList.contains('toolset')?'tool wb-universal-tutor-launch':'soft-btn wb-universal-tutor-launch';button.dataset.action='aiOnPaper';button.textContent='✦ AI 家教看我的作答';host.appendChild(button);buttons=[button];
      }
    }
    for(const button of buttons){
      button.disabled=false;button.removeAttribute('disabled');button.setAttribute('aria-disabled','false');button.dataset.universalTutor='1';
      if(!String(button.textContent||'').includes('AI 家教'))button.textContent='✦ AI 家教看我的作答';
    }
  }

  if(!document.getElementById('wrongbookUniversalTutorAccessStyle')){
    const style=document.createElement('style');style.id='wrongbookUniversalTutorAccessStyle';style.textContent=`
      .wb-universal-tutor-fallback{display:flex;justify-content:flex-end;gap:8px;padding:10px 12px;position:relative;z-index:24}
      #paper>.wb-universal-tutor-fallback,.ocrq-sheet>.wb-universal-tutor-fallback{position:absolute;right:12px;bottom:12px;padding:0}
      .wb-universal-tutor-launch{pointer-events:auto!important;opacity:1!important;visibility:visible!important}
      .wb-universal-tutor-disclosure .wb-universal-tutor-note{margin:0 0 10px}
      @media(max-width:700px){#paper>.wb-universal-tutor-fallback,.ocrq-sheet>.wb-universal-tutor-fallback{right:8px;bottom:8px}.wb-universal-tutor-launch{min-height:44px}}
    `;document.head.appendChild(style);
  }

  document.addEventListener('click',event=>{
    const button=event.target?.closest?.('[data-action="aiOnPaper"]');if(!button)return;
    // V13 is the preferred owner once loaded. This fallback only closes the boot-time gap and keeps
    // every problem usable if a later presentation module fails to initialize.
    if(window.__wrongbookTutorWorkspaceUnifyV13)return;
    event.preventDefault();event.stopPropagation();startTutorFallback();
  },true);

  function loadStyle(href,id){if(document.getElementById(id))return;const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;document.head.appendChild(l)}
  function loadScript(src,attr){if(document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.src=src;s.async=false;s.setAttribute(attr,'1');document.body.appendChild(s)}
  function revealTutorWhenStable(attempt=0){
    ensureTutorDom();
    if(window.__wrongbookTutorNavVisualV16){
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        ensureTutorDom();
        try{window.wrongbookTutorNavVisualQA?.()}catch{}
        document.documentElement.classList.add('wb-tutor-ready');
      }));
      return;
    }
    if(attempt<180)setTimeout(()=>revealTutorWhenStable(attempt+1),16);
  }

  installUniversalProblemWorkspace();installUniversalPaperPanel();
  const app=document.getElementById('app');let queued=false;
  const queueTutorDom=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;ensureTutorDom()})};
  if(app)new MutationObserver(queueTutorDom).observe(app,{subtree:true,childList:true});

  loadStyle('./iscanner-capture-v2.css?wb=20260818-1124','wrongbook-iscanner-capture-v2-css');
  loadStyle('./ocr-clean-question-display-v1.css?wb=20260818-1124','wrongbook-ocr-clean-display-css');
  loadScript('./on-device-image-preprocess-v2.js?wb=20260818-1124','data-wb-preprocess-v2');
  loadScript('./iscanner-capture-v3.js?wb=20260818-1124','data-wb-iscanner-v3');
  loadScript('./iscanner-live-autocapture-v1.js?wb=20260818-1124','data-wb-iscanner-live');
  loadScript('./iscanner-highlight-bridge-v3.js?wb=20260818-1124','data-wb-ocr-first-highlight');
  loadScript('./ocr-first-analysis-v1.js?wb=20260818-1124','data-wb-ocr-first-analysis');
  loadScript('./ocr-clean-question-display-v1.js?wb=20260818-1124','data-wb-ocr-clean-display');
  loadScript('./scan-persistence-lite-v1.js?wb=20260818-1124','data-wb-scan-persistence-lite');
  loadScript('./tutor-clean-figure-v1.js?wb=20260818-1124','data-wb-tutor-clean-figure');

  // One tutor navigator owner. The tutor remains visibility:hidden (with final geometry reserved)
  // until V16 has normalized the DOM, so there is no loading-time navigator/frame handoff.
  loadScript('./tutor-nav-visual-v16.js?wb=20260818-1356','data-wb-tutor-nav-visual-v16');
  revealTutorWhenStable();
  loadScript('./tutor-workspace-unify-v13.js?wb=20260818-1356','data-wb-tutor-workspace-unify-v13');
  loadScript('./problem-context-isolation-v1.js?wb=20260818-1356','data-wb-problem-context-isolation-v1');
  loadScript('./tutor-frame-no-flash-v17.js?wb=20260818-1356','data-wb-tutor-frame-no-flash-v17');
  loadScript('./tutor-nav-paint-lock-v18.js?wb=20260818-1356','data-wb-tutor-nav-paint-lock-v18-loader');
  loadScript('./tutor-dialog-compact-v20.js?wb=20260818-1710','data-wb-tutor-dialog-compact-v20');
  loadScript('./ink-history-v4.js?wb=20260818-1356','data-wb-ink-history-v4');

  window.wrongbookUniversalTutorAccessQA=function(){
    ensureTutorDom();const p=selected(),buttons=[...document.querySelectorAll('[data-action="aiOnPaper"]')],enabled=buttons.every(b=>!b.disabled&&b.getAttribute('aria-disabled')!=='true'),sidebar=Boolean(document.querySelector('.wb-universal-tutor-disclosure,#miniTutorInput,[data-action="askMiniTutor"]'));
    return{version:'2026-08-18-universal-tutor-v1',selectedProblemId:p?.id||null,selectedSubject:p?.subject||null,everyProblemEligible:true,noSubjectGate:true,noQuestionTypeGate:true,noConfirmationGate:true,noHandwritingGate:true,onPaperButtonPresent:!p||buttons.length>0,onPaperButtonEnabled:!p||enabled,sidebarTutorAccess:!p||sidebar,stagedTutorAvailable:typeof v5TutorStart==='function',preferredOwnerV13:Boolean(window.__wrongbookTutorWorkspaceUnifyV13),pass:Boolean(!p||(buttons.length>0&&enabled&&sidebar))};
  };
})();
