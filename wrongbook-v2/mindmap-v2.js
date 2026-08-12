function mindmapPage(){
  const s=activeSubject();
  const curriculum=twCurriculumSubject(s.id);
  const chosen=curriculum.chapters.find(ch=>ch.title===state.conceptChapter)||curriculum.chapters[0];
  const all=twAllPoints(chosen);
  const prefix=`${s.id}:${chosen.id}:`;
  const answered=all.filter(p=>(state.mindAnswers?.[prefix+p.id]||'').trim()).length;
  const correct=all.filter(p=>(state.mindAnswers?.[prefix+p.id]||'').trim().toLowerCase()===p.a.trim().toLowerCase()).length;
  const hinted=all.filter(p=>state.mindHints?.[prefix+p.id]).length;
  const mastery=all.length?Math.round(correct/all.length*100):0;
  return `<div class="page-head"><div><div class="tw-badge">${esc(TW_TERM_POLICY.label)}</div><h2>心智圖 · ${esc(s.name)}</h2><p>不是只放幾個示範空格。這裡把這一科的章節拆成完整關鍵節點；你在哪一個節點需要提示，也會被記錄。</p></div><div class="page-actions"><button class="soft-btn" data-action="resetMind">清空這科作答</button></div></div>
  ${subjectTabs()}
  <div class="mindmap-shell">
    <aside class="panel mind-chapter-nav">
      <div class="mind-side-head"><strong>${esc(curriculum.scope)}</strong><small>${curriculum.chapters.length} 個核心章節</small></div>
      ${curriculum.chapters.map((ch,i)=>{const pts=twAllPoints(ch);const pre=`${s.id}:${ch.id}:`;const done=pts.filter(p=>(state.mindAnswers?.[pre+p.id]||'').trim().toLowerCase()===p.a.trim().toLowerCase()).length;return `<button class="mind-chapter-btn ${chosen.id===ch.id?'active':''}" data-concept-chapter="${esc(ch.title)}"><span class="mind-chapter-no">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(ch.title)}</strong><small>${done}/${pts.length} 已會</small></span><span class="mind-chapter-progress"><i style="width:${pts.length?Math.round(done/pts.length*100):0}%"></i></span></button>`}).join('')}
    </aside>
    <div class="mind-main">
      <section class="panel mind-overview">
        <div class="panel-head"><div><h3>${esc(chosen.title)}</h3><span class="meta">${all.length} 個關鍵重點 · ${chosen.sections.length} 個區塊</span></div><div class="mind-summary"><span><b>${answered}</b> 已作答</span><span><b>${hinted}</b> 用過提示</span><span><b>${mastery}%</b> 自己叫出來</span></div></div>
        <div class="mind-tree-v2">
          <div class="mind-root-v2"><strong>${esc(chosen.title)}</strong><small>${esc(activePublisher(s.id))} · 課本位置另行映射</small></div>
          <div class="mind-branches-v2">${chosen.sections.map(sec=>`<div class="mind-branch-v2"><span class="branch-dot"></span><strong>${esc(sec.title)}</strong><small>${sec.points.length} 個重點</small></div>`).join('')}</div>
        </div>
        <div class="callout" style="margin-top:12px">章節名稱是我們的「臺灣 108 課綱核心概念層」。龍騰、翰林、南一的實際章節與頁碼另外映射，不會假裝所有版本章號都一樣。</div>
      </section>
      ${chosen.sections.map((sec,si)=>mindSectionV2(s.id,chosen,sec,si)).join('')}
      <section class="panel mind-completion"><div><strong>整章檢核</strong><p>你可以看到全部重點；系統之後會優先把「答錯、空白、曾用提示、相關錯題反覆出現」的節點排回來。</p></div><div class="mind-completion-ring" style="--p:${mastery}"><strong>${mastery}%</strong><small>獨立回想</small></div></section>
    </div>
  </div>`;
}

function mindSectionV2(subjectId,chapter,sec,si){
  const pre=`${subjectId}:${chapter.id}:`;
  const done=sec.points.filter(p=>(state.mindAnswers?.[pre+p.id]||'').trim().toLowerCase()===p.a.trim().toLowerCase()).length;
  return `<section class="panel mind-section-v2"><div class="mind-section-head"><div><span class="section-index">${si+1}</span><div><h3>${esc(sec.title)}</h3><small>${done}/${sec.points.length} 個已能獨立叫出來</small></div></div><div class="section-progress"><i style="width:${sec.points.length?Math.round(done/sec.points.length*100):0}%"></i></div></div><div class="mind-point-grid">${sec.points.map(p=>mindPointV2(subjectId,chapter,p)).join('')}</div></section>`;
}

function mindPointV2(subjectId,chapter,p){
  const key=`${subjectId}:${chapter.id}:${p.id}`;
  const val=state.mindAnswers?.[key]||'';
  const ok=val.trim().toLowerCase()===p.a.trim().toLowerCase();
  const hint=state.mindHints?.[key]||'';
  const hasAttempt=Boolean(val.trim());
  return `<article class="mind-point-v2 ${ok?'mastered':hint?'hinted':hasAttempt?'missed':''}">
    <div class="point-top"><span class="point-kind">${esc(p.kind||'核心觀念')}</span><span class="point-state">${ok?'✓ 已會':hint?'需要提示':hasAttempt?'再想一次':'未作答'}</span></div>
    <div class="point-question">${esc(p.q)}</div>
    <input class="mind-answer-v2" data-mind-key="${esc(key)}" data-answer="${esc(p.a)}" value="${esc(val)}" placeholder="先自己寫出來" autocomplete="off">
    <div class="point-actions"><button class="hint-link" data-mind-hint="${esc(key)}" data-hint="${esc(p.h)}">圈這題，給我提示</button></div>
    ${hint?`<div class="mind-hint-box"><span>提示</span>${esc(hint)}</div>`:''}
    <div class="mind-status ${ok?'good':hasAttempt?'bad':''}" id="status-${esc(key)}">${ok?'✓ 自己叫出來了':hasAttempt?'再想一下':''}</div>
    ${(ok||hint)?`<div class="correct-memory"><span>要記住的正確版本</span><strong>${esc(p.truth||p.a)}</strong></div>`:''}
  </article>`;
}
