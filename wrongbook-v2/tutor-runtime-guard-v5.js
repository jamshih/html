// Prevent delayed replay callbacks from reviving an off-screen tutor animation after the
// student leaves the notebook/problem. This closes a real timer/RAF race found by stress QA.
(function(){
  if(typeof window.v3GuideReplay!=='function'||window.__v5TutorReplayGuard)return;
  window.__v5TutorReplayGuard=true;
  const base=window.v3GuideReplay;
  window.v3GuideReplay=function(){
    const inNotebook=window.state?.page==='notebook';
    const canvas=document.getElementById('aiGuideCanvas');
    const problem=typeof window.selectedProblem==='function'?window.selectedProblem():null;
    if(!inNotebook||!canvas||!problem){
      if(typeof window.v5CancelGuidePlayback==='function')window.v5CancelGuidePlayback();
      return false;
    }
    return base.apply(this,arguments);
  };
  try{v3GuideReplay=window.v3GuideReplay}catch{}
})();

/* Wrong Book paper-first presentation layer — 2026-08-17.
   Keeps the existing scan, review, handwriting, tutor, concept, sync and storage engines intact.
   This file only changes information hierarchy, presentation and a few capture/index entry surfaces. */
(function(){
  const PF_VERSION='2026-08-17-paper-first-v1';
  document.title='錯題本 — 把錯題真的改會';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#557B56');

  function pfSubjectStrip(){
    return `<div class="pf-subject-strip" aria-label="科目">
      ${SUBJECTS.map(s=>`<button class="${state.subject===s.id?'active':''}" data-pf-subject="${esc(s.id)}" style="${subjectStyle(s.id)}"><span class="pf-subject-dot"></span>${esc(s.name)}</button>`).join('')}
    </div>`;
  }

  function pfCoreNavButton(page,label,iconName){
    if(page==='notebook'){
      return `<button class="nav-btn ${state.page==='notebook'?'active':''}" data-pf-notebook-index>${icon(iconName)}<span>${label}</span></button>`;
    }
    return `<button class="nav-btn ${state.page===page?'active':''}" data-page="${page}">${icon(iconName)}<span>${label}</span></button>`;
  }

  sidebar=function(){
    const more=[
      ['mindmap','心智圖','map'],
      ['notes','筆記','note'],
      ['analytics','弱點分析','chart'],
      ['community','社群','chat'],
      ['settings','設定','settings']
    ];
    return `<aside class="sidebar pf-sidebar">
      <div class="brand pf-brand"><div class="brand-mark">錯</div><div><h1>錯題本</h1><small>把錯題真的改會</small></div></div>
      <button class="capture-btn" data-action="capture">${icon('camera')}<span>掃描新題目</span></button>
      <nav class="nav pf-core-nav" aria-label="主要導覽">
        ${pfCoreNavButton('home','今天','home')}
        ${pfCoreNavButton('notebook','錯題','notebook')}
        ${pfCoreNavButton('concepts','各科概念','brain')}
        ${pfCoreNavButton('review','複習','calendar')}
      </nav>
      <div class="sidebar-section-title">更多</div>
      <nav class="nav pf-utility-nav" aria-label="其他功能">
        ${more.map(([p,l,i])=>`<button class="nav-btn ${state.page===p?'active':''}" data-page="${p}">${icon(i)}<span>${l}</span></button>`).join('')}
      </nav>
      <div class="pf-profile">
        <div class="avatar">${esc((state.profile?.displayName||'同學').slice(0,1))}</div>
        <div><strong>${esc(state.profile?.displayName||'同學')}</strong><small>${esc(state.syllabus.grade)} · ${esc(state.syllabus.level)}</small></div>
      </div>
    </aside>`;
  };

  mobileNav=function(){
    const isMore=!['home','notebook','review'].includes(state.page);
    return `<nav class="mobile-nav pf-mobile-nav" aria-label="主要導覽">
      <button class="${state.page==='home'?'active':''}" data-page="home">${icon('home')}<span>今天</span></button>
      <button class="${state.page==='notebook'?'active':''}" data-pf-notebook-index>${icon('notebook')}<span>錯題</span></button>
      <button class="capture-mobile" data-action="capture">${icon('camera')}<span>掃描</span></button>
      <button class="${state.page==='review'?'active':''}" data-page="review">${icon('calendar')}<span>複習</span></button>
      <button class="${isMore?'active':''}" data-action="toggleMenu">${icon('menu')}<span>更多</span></button>
    </nav>`;
  };

  mobileDrawer=function(){
    const items=[
      ['concepts','各科概念','brain'],
      ['mindmap','心智圖','map'],
      ['notes','筆記','note'],
      ['analytics','弱點分析','chart'],
      ['community','社群','chat'],
      ['settings','設定','settings']
    ];
    return `<div class="mobile-drawer ${state.mobileMenu?'open':''}" data-action="closeMenu">
      <div class="mobile-drawer-panel pf-drawer" onclick="event.stopPropagation()">
        <div class="pf-drawer-head"><strong>更多</strong><button class="icon-btn" data-action="closeMenu" aria-label="關閉">×</button></div>
        <nav class="nav">${items.map(([p,l,i])=>`<button class="nav-btn ${state.page===p?'active':''}" data-page="${p}">${icon(i)}<span>${l}</span></button>`).join('')}</nav>
      </div>
    </div>`;
  };

  function pfProcessingOverlay(){
    if(!(state.aiLoading&&state.scanBase64&&!state.scanConfirmed))return '';
    return `<div class="pf-processing" role="status" aria-live="polite">
      <div class="pf-processing-sheet">
        <div class="pf-processing-spinner"></div>
        <div>
          <strong>正在整理題目…</strong>
          <p>接著會辨識你的作答、確認批改記號；只有不確定的地方才會再請你確認。</p>
        </div>
      </div>
    </div>`;
  }

  shell=function(){
    return `<div class="app-shell pf-app-shell">
      ${sidebar()}
      <main class="main">
        <header class="topbar pf-topbar">
          <div class="topbar-left">
            <button class="icon-btn mobile-menu-btn" data-action="toggleMenu" aria-label="更多">${icon('menu')}</button>
            <div class="crumb">${crumb()}</div>
          </div>
          <div class="topbar-actions">
            <button class="ghost-btn" data-action="share">${icon('share')} 分享</button>
            <button class="icon-btn" data-page="settings" aria-label="設定">${icon('settings')}</button>
          </div>
        </header>
        <section class="content">${page()}</section>
      </main>
      ${mobileNav()}
      ${mobileDrawer()}
      ${pfProcessingOverlay()}
    </div>`;
  };

  function pfProblemThumb(p){
    if(!p)return '';
    const direct=p.imageDataUrl||((p.id==='scan-preview'&&state.scanImage)?state.scanImage:'');
    const image=`<img class="pf-thumb-image" ${direct?`src="${direct}"`:`data-pf-problem-image="${esc(p.id)}"`} alt="原題預覽">`;
    const text=(p.problemText||p.title||'').slice(0,92);
    return `<button class="pf-paper-thumb" data-problem="${esc(p.id)}" aria-label="開啟 ${esc(p.title)}">
      ${image}
      <div class="pf-thumb-fallback"><span class="pf-thumb-number">${esc((p.title||'題目').match(/\d+/)?.[0]||'12')}.</span><p>${esc(text)}</p><span class="pf-thumb-ink">×</span></div>
      <div class="pf-thumb-caption"><strong>${esc(p.title)}</strong><span>${subjectById(p.subject).name} · ${esc(p.concept)}</span></div>
    </button>`;
  }

  function pfUpcomingRow(p,lead=false){
    const s=subjectById(p.subject);
    const status=p.due==='今天'?'今天':p.due==='明天'?'明天':(p.mastery||0)<55?'重做':p.due||'待排';
    return `<button class="pf-upcoming-row ${lead?'is-lead':''}" data-problem="${esc(p.id)}" style="${subjectStyle(p.subject)}">
      <span class="pf-row-symbol"><i></i>${esc(s.name)}</span>
      <span class="pf-row-main"><strong>${esc(p.title)}</strong><small>${esc(s.name)}・錯 ${p.attempts||1} 次・${(p.reviewData?.reps||0)} 次重做</small></span>
      <span class="pf-row-status ${status==='今天'?'is-today':''}">${esc(status)} <b>›</b></span>
    </button>`;
  }

  homePage=function(){
    const due=dueProblems();
    const today=due.filter(p=>p.due==='今天');
    const queue=(today.length?today:due).slice(0,3);
    const lead=queue[0]||state.problems[0];
    const generic=(state.genericFacts||[]).filter(f=>f.due==='今天'||f.dueISO<=((typeof v3DateISO==='function')?v3DateISO(0):new Date().toISOString().slice(0,10))).length;
    const truthDue=(state.truths||[]).filter(t=>t.due==='今天').length;
    const conceptDue=generic||truthDue;
    const hour=new Date().getHours();
    const hello=hour<11?'早安':hour<18?'下午好':'晚上好';
    const count=today.length;
    return `<div class="pf-home">
      <div class="pf-home-heading">
        <div><h1>今天</h1><p>${hello}，繼續一題一題把錯題變熟。</p></div>
        <button class="pf-head-capture" data-action="capture">${icon('camera')}<span>掃描</span></button>
      </div>

      <section class="pf-today-sheet">
        <div class="pf-sheet-copy">
          <span class="pf-kicker">今日複習</span>
          <div class="pf-sheet-count">${count?`還有 <em>${count}</em> 題`:'今天的排程完成了'}</div>
          <p>${count?`${Math.min(count,3)} 題需要重做${conceptDue?`・${conceptDue} 個觀念待回想`:''}`:'可以回頭處理最近的錯題，或掃描今天的新題目。'}</p>
          <button class="primary-btn pf-start-review" data-page="review">${count?'開始複習':'查看複習'} <span>→</span></button>
        </div>
        <div class="pf-sheet-preview">${lead?pfProblemThumb(lead):'<div class="pf-empty-paper">拍下今天第一題錯題</div>'}</div>
      </section>

      <section class="pf-list-section">
        <div class="pf-section-head"><h2>接下來</h2><button class="text-btn" data-page="review">查看全部 ›</button></div>
        <div class="pf-upcoming-list">${queue.length?queue.map((p,i)=>pfUpcomingRow(p,i===0)).join(''):'<div class="pf-empty-row">目前沒有排入近期複習的題目。</div>'}</div>
      </section>

      <section class="pf-list-section pf-recent-section">
        <div class="pf-section-head"><h2>最近的錯題本</h2><button class="text-btn" data-pf-notebook-index>查看全部 ›</button></div>
        ${state.problems[0]?`<div class="pf-recent-item">${pfProblemThumb(state.problems[0])}<button class="pf-recent-copy" data-problem="${esc(state.problems[0].id)}"><strong>${esc(state.problems[0].title)}</strong><span>${subjectById(state.problems[0].subject).name}・${esc(state.problems[0].concept)}・${state.problems[0].attempts||1} 次錯誤</span><small>繼續 ›</small></button></div>`:'<div class="pf-empty-row">還沒有錯題。拍下你今天做錯的一題就可以開始。</div>'}
      </section>

      <p class="pf-home-footer">專注於你的錯題，從紙本到熟練。</p>
    </div>`;
  };

  notebookPage=function(){
    if(state.selectedProblemId&&problemById(state.selectedProblemId))return problemWorkspace(problemById(state.selectedProblemId));
    const ps=state.problems.filter(p=>p.subject===state.subject);
    return `<div class="pf-index">
      <div class="pf-index-head">
        <div><h1>錯題</h1><p>保留原題、你的作答、修正與每一次重做。</p></div>
        <button class="primary-btn" data-action="capture">${icon('camera')} 掃描新題目</button>
      </div>
      ${pfSubjectStrip()}
      <div class="pf-index-summary"><strong>${esc(activeSubject().name)}</strong><span>${ps.length} 題</span></div>
      <div class="pf-problem-list">
        ${ps.length?ps.map(p=>`<button class="pf-problem-row" data-problem="${esc(p.id)}" style="${subjectStyle(p.subject)}">
          <span class="pf-problem-dot"></span>
          <span class="pf-problem-title"><strong>${esc(p.title)}</strong><small>${esc(p.chapter)}・${esc(p.concept)}・錯 ${p.attempts||1} 次</small></span>
          <span class="pf-problem-state"><small>${(p.mastery||0)>=80?'較穩定':(p.mastery||0)>=55?'正在熟悉':'需要重做'}</small><b>${esc(p.due||'今天')} ›</b></span>
        </button>`).join(''):'<div class="pf-empty-index"><strong>還沒有錯題</strong><span>拍下你今天做錯的一題就可以開始。</span><button class="primary-btn" data-action="capture">掃描第一題</button></div>'}
      </div>
    </div>`;
  };

  recognitionPanel=function(p,labels,isScan){
    if(!isScan||p.confirmed)return '';
    const student=state.scanStudent||[],correct=state.scanCorrect||[];
    const sConf=Number(state.scan?.recognizedAnswerConfidence||0),cConf=Number(state.scan?.correctAnswerConfidence||0);
    const uncertain=sConf<.86||cConf<.86||Boolean(state.scan?.recognitionNote);
    const chips=(selected,kind,attr)=>labels.map(l=>`<button class="chip ${kind} ${selected.includes(l)?'on':''}" ${attr}="${esc(l)}">${esc(l)}</button>`).join('');
    const editor=`<details class="pf-ocr-details"><summary>題目文字也不對？</summary><div class="pf-ocr-editor"><label>題幹<textarea data-scan-problem-text>${esc(p.problemText||'')}</textarea></label>${(p.options||[]).map(([l,t],i)=>`<label><span>${esc(l)}</span><input data-scan-option-index="${i}" value="${esc(t)}"></label>`).join('')}</div></details>`;
    return `<section class="pf-recognition ${uncertain?'is-uncertain':'is-confident'}">
      <div class="pf-recognition-head">
        <span>${uncertain?'這裡我不太確定。':'我先幫你讀成這樣。'}</span>
        ${state.scan?.recognitionNote?`<small>${esc(state.scan.recognitionNote)}</small>`:''}
      </div>
      ${uncertain?`<div class="pf-recognition-question">
        <div><strong>你選的是 ${esc(student.join('、')||'未辨識')} 嗎？</strong><div class="chips">${chips(student,'student','data-scan-student')}</div></div>
        <div><strong>批改／正解看起來是 ${esc(correct.join('、')||'未辨識')}</strong><div class="chips">${chips(correct,'','data-scan-correct')}</div></div>
      </div>`:`<div class="pf-recognition-summary"><strong>你的作答 ${esc(student.join('、')||'未辨識')}</strong><span>・</span><strong>正解 ${esc(correct.join('、')||'未辨識')}</strong><details><summary>不是這樣？修改</summary><div><span>你的作答</span><div class="chips">${chips(student,'student','data-scan-student')}</div><span>正解</span><div class="chips">${chips(correct,'','data-scan-correct')}</div></div></details></div>`}
      ${editor}
      <button class="primary-btn pf-confirm-scan" data-action="confirmScan">確認，開始弄懂這題</button>
    </section>`;
  };

  function pfDisclosure(title,content,open=false){
    return `<details class="pf-disclosure" ${open?'open':''}><summary>${title}<span>＋</span></summary><div class="pf-disclosure-body">${content}</div></details>`;
  }

  problemWorkspace=function(p){
    const s=subjectById(p.subject);
    const isScan=p.id.startsWith('scan-');
    const labels=[...new Set([...(p.options||[]).map(o=>o[0]),...(p.student||[]),...(p.correct||[]),...(state.scanStudent||[]),...(state.scanCorrect||[])])];
    const awaiting=isScan&&!p.confirmed;
    return `<div class="pf-problem-workspace">
      <header class="pf-problem-head">
        <button class="pf-back" data-action="backNotebook">← <span>錯題</span></button>
        <div class="pf-problem-identity">
          <strong>${esc(p.title)}</strong>
          <span>${esc(s.name)}・${esc(p.chapter)}・${esc(p.concept)}</span>
        </div>
        <div class="pf-problem-actions">
          <button class="soft-btn" data-page="review">加入複習</button>
          <button class="icon-btn" data-page="settings" aria-label="更多">…</button>
        </div>
      </header>
      <div class="pf-workspace-layout">
        <main class="pf-paper-column">${paperPanel(p)}</main>
        <aside class="pf-context-rail">
          ${awaiting?recognitionPanel(p,labels,isScan):''}
          ${!awaiting?pfDisclosure('修正與正確敘述',correctionPanel(p),false):''}
          ${!awaiting?pfDisclosure('我的筆記',insightPanel(p),false):''}
          ${!awaiting?pfDisclosure('相關概念與課本',mappingPanel(p),false):''}
          ${!awaiting?pfDisclosure('複習安排',reviewSchedulePanel(p),false):''}
          ${!awaiting?pfDisclosure('更多家教方式',tutorMiniPanel(p),false):''}
        </aside>
      </div>
    </div>`;
  };

  reviewPage=function(){
    const queue=dueProblems();
    const current=problemById(state.reviewProblemId)||queue[0]||selectedProblem();
    if(current)state.reviewProblemId=current.id;
    const label=state.reviewMode==='truth'?'觀念回想':'原題重做';
    return `<div class="pf-review">
      <div class="pf-review-head">
        <div><h1>複習</h1><p>需要情境的題目回到原題；能獨立理解的觀念才做主動回想。</p></div>
        <div class="mode-switch pf-mode-switch">
          <button class="${state.reviewMode==='problem'?'active':''}" data-review-mode="problem">原題重做</button>
          <button class="${state.reviewMode==='truth'?'active':''}" data-review-mode="truth">觀念回想</button>
        </div>
      </div>
      <div class="pf-review-layout">
        <aside class="pf-review-queue">
          <div class="pf-review-group-title">今天要複習</div>
          ${queue.length?queue.map(p=>`<button class="pf-review-row ${p.id===current?.id?'active':''}" data-review-problem="${esc(p.id)}"><span>${subjectById(p.subject).name}</span><strong>${esc(p.concept)}</strong><small>${esc(p.due||'今天')}</small></button>`).join(''):'<div class="pf-empty-row">今天沒有排程。</div>'}
        </aside>
        <section class="pf-review-paper">
          <div class="pf-review-kind">${label}</div>
          ${current?(state.reviewMode==='problem'?redoProblem(current):truthReview(current)):'<div class="pf-empty-index"><strong>目前沒有要複習的題目。</strong></div>'}
        </section>
      </div>
    </div>`;
  };

  captureModal=function(){
    return `<div class="modal-backdrop pf-scan-backdrop" id="captureModal">
      <div class="modal pf-scan-modal">
        <div class="modal-head"><div><h3>拍下題目</h3><p>讓題目、你的作答和老師批改一起入鏡。</p></div><button class="icon-btn" data-action="closeCapture" aria-label="關閉">×</button></div>
        <div class="modal-body">
          <div class="pf-camera-stage">
            <img id="capturePreview" class="modal-preview" alt="題目預覽">
            <div class="pf-camera-empty">
              <span class="pf-frame-corner a"></span><span class="pf-frame-corner b"></span><span class="pf-frame-corner c"></span><span class="pf-frame-corner d"></span>
              ${icon('camera')}
              <strong>把整題放進框內</strong>
              <small>紙張不用很完美，先確保題目、作答與批改看得到。</small>
            </div>
          </div>
          <div class="pf-scan-actions">
            <button class="primary-btn" data-action="photoCamera">${icon('camera')} 拍照</button>
            <button class="soft-btn" data-action="photoLibrary">從相簿選擇</button>
          </div>
          <div class="pf-scan-foot">
            <button class="text-btn" data-action="loadDemoScan">載入示範題</button>
            <button class="primary-btn" data-action="analyzePhoto" disabled>整理題目 →</button>
          </div>
        </div>
      </div>
    </div>`;
  };

  openCapture=function(){
    document.getElementById('captureModal')?.remove();
    document.body.insertAdjacentHTML('beforeend',captureModal());
    const input=document.getElementById('globalPhotoInput');
    const modal=document.getElementById('captureModal');
    const preview=document.getElementById('capturePreview');
    const continueBtn=modal?.querySelector('[data-action="analyzePhoto"]');
    if(!input||!modal)return;
    input.value='';
    const choose=(camera)=>{
      if(camera)input.setAttribute('capture','environment');else input.removeAttribute('capture');
      input.value='';
      input.click();
    };
    modal.querySelector('[data-action="closeCapture"]')?.addEventListener('click',()=>modal.remove());
    modal.querySelector('[data-action="photoCamera"]')?.addEventListener('click',()=>choose(true));
    modal.querySelector('[data-action="photoLibrary"]')?.addEventListener('click',()=>choose(false));
    modal.querySelector('[data-action="analyzePhoto"]')?.addEventListener('click',()=>analyzePhoto());
    modal.querySelector('[data-action="loadDemoScan"]')?.addEventListener('click',loadDemoScan);
    input.onchange=async e=>{
      const f=e.target.files?.[0];if(!f)return;
      try{
        const img=await imageFileToData(f);
        state.scanImage=img.dataUrl;state.scanBase64=img.base64;state.scanMime=img.mimeType;state.scanConfirmed=false;save();
        if(preview){preview.src=img.dataUrl;preview.style.display='block';modal.classList.add('has-photo')}
        if(continueBtn)continueBtn.disabled=false;
      }catch(err){toast('圖片讀取失敗：'+err.message)}
    };
  };

  async function pfHydrateProblemImages(){
    if(typeof v3GetImage!=='function')return;
    const nodes=[...document.querySelectorAll('img[data-pf-problem-image]')];
    await Promise.all(nodes.map(async img=>{
      const id=img.dataset.pfProblemImage;if(!id)return;
      try{const rec=await v3GetImage(id);if(rec?.dataUrl){img.src=rec.dataUrl;img.classList.add('is-loaded')}}catch{}
    }));
  }

  function pfPostRender(){
    document.body.dataset.pfPage=state.page||'';
    document.body.classList.toggle('pf-workspace-active',Boolean(document.querySelector('.pf-problem-workspace')));
    document.querySelectorAll('[data-pf-notebook-index]').forEach(el=>el.onclick=e=>{e.stopPropagation();state.page='notebook';state.selectedProblemId=null;state.mobileMenu=false;save();render();window.scrollTo({top:0,behavior:'instant'})});
    document.querySelectorAll('[data-pf-subject]').forEach(el=>el.onclick=e=>{e.stopPropagation();state.subject=el.dataset.pfSubject;state.selectedProblemId=null;save();render()});
    document.querySelectorAll('.pf-drawer [data-action="closeMenu"]').forEach(el=>el.onclick=e=>{e.stopPropagation();state.mobileMenu=false;save();render()});
    pfHydrateProblemImages();
  }

  const pfBaseRender=render;
  render=function(){
    pfBaseRender();
    requestAnimationFrame(pfPostRender);
  };

  window.WRONGBOOK_PAPER_FIRST_VERSION=PF_VERSION;
  const q=new URLSearchParams(location.search);
  if(!q.has('refpreview'))render();
})();