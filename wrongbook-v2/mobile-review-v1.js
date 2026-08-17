// Mobile review-first behavior. Loaded by tw-ui-guard after the core runtime is available.
(function(){
  if(window.__wrongbookMobileReviewV1Booted)return;
  window.__wrongbookMobileReviewV1Booted=true;

  const mobileMQ=window.matchMedia('(max-width: 1024px)');
  const isMobile=()=>mobileMQ.matches;
  const hasDirectOptions=p=>!!(p&&(p.options||[]).length&&(p.correct||[]).length);
  const hasTruthRecall=p=>!!(p&&typeof getCorrectedTruths==='function'&&getCorrectedTruths(p).length);
  const canReviewOnMobile=p=>hasDirectOptions(p)||hasTruthRecall(p);
  const answerText=a=>Array.isArray(a)&&a.length?a.join('、'):'未作答';

  function mobileProblemRow(p){
    const s=subjectById(p.subject);
    const direct=canReviewOnMobile(p);
    return `<button class="mobile-review-row" data-problem="${p.id}" style="${subjectStyle(p.subject)}">
      <span class="subject-dot" aria-hidden="true"></span>
      <span><strong>${esc(p.title)}</strong><small>${esc(s.name)} · ${esc(p.concept||p.chapter||'待分類')} · 錯 ${p.attempts||1} 次</small></span>
      <span class="mobile-row-status ${direct?'':'paper'}">${direct?'手機可做':'需紙筆'}</span>
    </button>`;
  }

  function mobileHome(){
    const due=dueProblems();
    const today=due.filter(p=>p.due==='今天');
    const active=today.length?today:due;
    const direct=active.filter(canReviewOnMobile);
    const paper=active.filter(p=>!canReviewOnMobile(p));
    const next=(direct.length?direct:active).slice(0,4);
    const recent=state.problems.slice(0,3);
    return `<div class="mobile-study-home">
      <section class="mobile-review-hero">
        <div class="eyebrow">今天的錯題複習</div>
        <h2>還有 <strong>${active.length}</strong> 題</h2>
        <p>先回想「上次為什麼錯」，再做能直接在手機完成的題目。需要紙筆的題目會保留到平板或桌面。</p>
        <div class="mobile-review-summary">
          <div><strong>${direct.length}</strong><span>題可直接作答</span></div>
          <div><strong>${paper.length}</strong><span>題留到紙筆重做</span></div>
        </div>
        <button class="primary-btn" data-page="review">開始手機複習 →</button>
      </section>

      <section class="mobile-section">
        <div class="mobile-section-head"><h3>接下來</h3><button class="text-btn" data-page="review">查看全部 ›</button></div>
        <div class="mobile-review-list">${next.length?next.map(mobileProblemRow).join(''):'<div class="mobile-empty">今天沒有待複習題目。</div>'}</div>
      </section>

      <section class="mobile-section">
        <div class="mobile-section-head"><h3>最近的錯題</h3><button class="text-btn" data-page="notebook">查看全部 ›</button></div>
        <div class="mobile-review-list">${recent.length?recent.map(mobileProblemRow).join(''):'<div class="mobile-empty">還沒有錯題。掃描第一題後會出現在這裡。</div>'}</div>
      </section>
    </div>`;
  }

  function mobileNotebook(){
    const ps=state.problems.filter(p=>p.subject===state.subject);
    const directCount=ps.filter(canReviewOnMobile).length;
    return `<div class="mobile-notebook-page">
      <div class="mobile-notebook-intro">
        <h2 style="font-size:28px;line-height:1.25;margin:0">錯題回顧</h2>
        <p>手機先看你當時錯在哪裡，再重做不需要手寫的題目。紙筆題不會硬塞進手機流程。</p>
      </div>
      ${subjectTabs()}
      <div class="mobile-review-summary">
        <div><strong>${directCount}</strong><span>題可在手機複習</span></div>
        <div><strong>${Math.max(0,ps.length-directCount)}</strong><span>題需要紙筆</span></div>
      </div>
      <section class="mobile-notebook-list">${ps.length?ps.map(mobileProblemRow).join(''):'<div class="mobile-empty">這科還沒有錯題。</div>'}</section>
    </div>`;
  }

  function mobileProblemDetail(p){
    const s=subjectById(p.subject);
    const truths=getCorrectedTruths(p);
    const direct=canReviewOnMobile(p);
    const scanPhoto=(p.id.startsWith('scan-')&&state.scanImage)?`<img src="${state.scanImage}" alt="原始錯題照片">`:'';
    const mistake=esc(p.insight||p.mistakeType||'先回想你當時是在哪個概念或判斷上卡住。');
    const compare=(p.student?.length||p.correct?.length)?`<div class="mobile-answer-compare"><div><span>你上次的答案</span><strong>${esc(answerText(p.student))}</strong></div><div><span>正確答案</span><strong>${esc(answerText(p.correct))}</strong></div></div>`:'';
    return `<div class="mobile-problem-review">
      <button class="text-btn back-link" data-action="backNotebook">← 回錯題列表</button>
      <div class="mobile-problem-title"><h1>${esc(p.title)}</h1><p>${esc(s.name)} · ${esc(p.chapter||'')} · ${esc(p.concept||'')} · 錯 ${p.attempts||1} 次</p></div>

      <section class="mobile-mistake-card">
        <div class="mobile-card-label">先看這個</div>
        <h3>你上次錯在哪裡？</h3>
        <p>${mistake}</p>
        ${compare}
      </section>

      <section class="mobile-original-question">
        <div class="mobile-card-label">原題</div>
        ${scanPhoto}
        <div class="question-copy">${esc(p.problemText||p.title)}</div>
      </section>

      ${truths.length?`<section class="mobile-truth-card"><div class="mobile-card-label">這次要記住</div><h3>修正後的正確觀念</h3><div class="mobile-truth-list">${truths.slice(0,4).map(t=>`<div class="mobile-truth-line">✓ ${esc(t)}</div>`).join('')}</div></section>`:''}

      <section class="mobile-review-choice">
        <div class="mobile-card-label">下一步</div>
        <h3>${direct?'這題可以直接在手機重做':'這題完整重做需要紙筆'}</h3>
        <p>${direct?'不用進手寫畫布；直接進入點選答案或正確敘述回想。':'手機先把錯因與觀念看懂，正式計算、作圖或推導留到平板／桌面。'}</p>
        ${direct?'<button class="primary-btn" data-page="review">直接重做這題 →</button>':'<button class="soft-btn" data-page="concepts">先複習這個觀念</button><div class="mobile-paper-note"><span>✎</span><span>已保留為紙筆重做題，不會要求你在手機上硬寫。</span></div>'}
      </section>
    </div>`;
  }

  function mobileRedoProblem(p){
    const opts=[...(p.options||[])].sort((a,b)=>a[0].localeCompare(b[0]));
    if(!opts.length){
      return `<div class="mobile-paper-deferred"><strong>這題需要紙筆。</strong><br>手機不強迫你在小螢幕上作圖或計算；可以切到「正確敘述」做觀念回想，或留到平板／桌面重做。</div>`;
    }
    const mistake=esc(p.mistakeType||p.insight||'回想上次是哪個判斷讓你選錯。');
    return `<div>
      <div class="mobile-review-mistake"><strong>上次錯因</strong>${mistake}</div>
      <div class="redo-question">${esc(p.problemText)}</div>
      ${opts.map(([l,t])=>{
        const sel=(state.reviewSelections||[]).includes(l);
        let cl=sel?'selected':'';
        if(state.reviewChecked)cl=(p.correct||[]).includes(l)?'correct':sel?'incorrect':'';
        return `<button class="redo-option ${cl}" data-review-option="${esc(l)}"><strong>${esc(l)}.</strong> ${esc(t)}</button>`;
      }).join('')}
      <div class="page-actions"><button class="soft-btn" data-action="reviewReset">清除</button><button class="primary-btn" data-action="checkReview">提交答案</button></div>
      ${state.reviewChecked?`<div class="callout ${sameAnswers(state.reviewSelections,p.correct)?'success':'warn'}" style="margin-top:16px">你的答案：<strong>${esc((state.reviewSelections||[]).slice().sort().join('')||'未作答')}</strong> · 正確：<strong>${esc((p.correct||[]).slice().sort().join(''))}</strong>。${sameAnswers(state.reviewSelections,p.correct)?'答對了。接著確認你能不能說出上次錯在哪裡。':'還沒完全對。先找出是哪個敘述或概念判斷出了問題。'}</div>`:''}
    </div>`;
  }

  function mobileReview(){
    const queue=dueProblems();
    const direct=queue.filter(canReviewOnMobile);
    const paper=queue.filter(p=>!canReviewOnMobile(p));
    let current=problemById(state.reviewProblemId);
    if(!current||!canReviewOnMobile(current))current=direct[0]||null;
    if(current&&!direct.some(p=>p.id===current.id))direct.unshift(current);
    state.reviewProblemId=current?.id||null;

    if(current){
      const truths=getCorrectedTruths(current);
      if(!hasDirectOptions(current)&&truths.length)state.reviewMode='truth';
      else if(!truths.length)state.reviewMode='problem';
    }
    const mode=state.reviewMode||'problem';
    return `<div class="mobile-review-page">
      <div class="page-head"><div><h2>手機複習</h2><p>先回想錯因，再做不需要手寫的題目。紙筆題另外保留。</p></div>${current&&hasTruthRecall(current)?`<div class="mode-switch"><button class="${mode==='problem'?'active':''}" data-review-mode="problem">重做原題</button><button class="${mode==='truth'?'active':''}" data-review-mode="truth">正確觀念</button></div>`:''}</div>

      ${current?`<section class="mobile-review-current"><div class="mobile-review-context"><span class="meta">${esc(subjectById(current.subject).name)} · ${esc(current.concept||current.chapter||'')}</span><span class="mobile-direct-badge">不用手寫</span></div>${mode==='truth'?truthReview(current):mobileRedoProblem(current)}</section>`:'<div class="mobile-empty">目前沒有能直接在手機完成的待複習題目。</div>'}

      ${direct.length?`<div class="mobile-section-head" style="margin-top:20px"><h3>接下來</h3><span class="meta">${direct.length} 題</span></div><div class="mobile-review-queue">${direct.map(p=>`<button class="mobile-review-chip ${p.id===current?.id?'active':''}" data-review-problem="${p.id}">${esc(p.title)}<small>${esc(subjectById(p.subject).name)} · ${esc(p.due||'待排')}</small></button>`).join('')}</div>`:''}

      ${paper.length?`<div class="mobile-paper-deferred"><strong>${paper.length} 題需要紙筆重做</strong><br>它們會留在錯題本裡，但不會混進手機的直接作答流程。你仍可先打開題目回想錯因與觀念。</div>`:''}
    </div>`;
  }

  function apply(){
    if(window.__wrongbookMobileReviewV1Applied)return;
    if(typeof homePage!=='function'||typeof notebookPage!=='function'||typeof problemWorkspace!=='function'||typeof reviewPage!=='function'||typeof redoProblem!=='function'||typeof navigate!=='function'||typeof render!=='function'){
      window.setTimeout(apply,50);
      return;
    }
    window.__wrongbookMobileReviewV1Applied=true;

    const baseHome=homePage;
    const baseNotebook=notebookPage;
    const baseWorkspace=problemWorkspace;
    const baseReview=reviewPage;
    const baseRedo=redoProblem;
    const baseNavigate=navigate;

    homePage=function(){return isMobile()?mobileHome():baseHome()};
    notebookPage=function(){
      if(!isMobile())return baseNotebook();
      if(state.selectedProblemId&&problemById(state.selectedProblemId)){
        const p=problemById(state.selectedProblemId);
        // The fresh scan confirmation is safety-critical; keep the existing confirmation workspace.
        if(p.id==='scan-preview')return baseWorkspace(p);
        return mobileProblemDetail(p);
      }
      return mobileNotebook();
    };
    problemWorkspace=function(p){
      if(!isMobile()||p?.id==='scan-preview')return baseWorkspace(p);
      return mobileProblemDetail(p);
    };
    reviewPage=function(){return isMobile()?mobileReview():baseReview()};
    redoProblem=function(p){return isMobile()?mobileRedoProblem(p):baseRedo(p)};
    navigate=function(page){
      if(isMobile()&&page==='review'&&state.page==='notebook'&&state.selectedProblemId){
        const p=problemById(state.selectedProblemId);
        if(canReviewOnMobile(p)){
          state.reviewProblemId=p.id;
          state.reviewSelections=[];
          state.reviewChecked=false;
          state.reviewMode=hasDirectOptions(p)?'problem':'truth';
        }
      }
      if(isMobile()&&page==='notebook')state.selectedProblemId=null;
      return baseNavigate(page);
    };

    mobileMQ.addEventListener?.('change',()=>{
      if(!isMobile()&&state.page==='notebook'&&!state.selectedProblemId){
        const ps=state.problems.filter(p=>p.subject===state.subject);
        state.selectedProblemId=ps[0]?.id||null;
      }
      render();
    });

    if(isMobile())render();
  }

  const start=()=>window.setTimeout(apply,0);
  if(document.readyState==='complete')start();
  else window.addEventListener('load',start,{once:true});
})();
