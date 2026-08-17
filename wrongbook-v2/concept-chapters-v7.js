// Wrongbook V7 concepts — Taiwan 108 curriculum, organized by chapter only.
(function(){
  if(window.__wrongbookConceptChaptersV7)return;
  window.__wrongbookConceptChaptersV7=true;
  if(typeof window.v5CeTree!=='function')return;

  function v7CeChapterFor(tree,node){
    if(!node)return null;
    if(node.type==='chapter')return node;
    return v5CeAncestors(tree,node).find(n=>n.type==='chapter')||null;
  }

  function v7CeChapterStats(tree,chapter){
    const points=v5CeDescendantPoints(tree,chapter);
    const problems=v5CeNodeProblems(tree,chapter);
    const facts=v5CeNodeFacts(tree,chapter);
    const mastery=v5CeRealMastery(facts,problems);
    return{points:points.length,problems:problems.length,facts:facts.length,mastery};
  }

  function v7CeStatusDot(tree,node){
    const status=v5CeStatus(tree,node);
    return `<span class="v7-status-dot is-${v5CeAttr(status)}" aria-hidden="true"></span>`;
  }

  function v7CeChapterNav(tree,currentChapter){
    const chapters=v5CeChildren(tree,tree.root);
    return `<aside class="panel v7-chapter-nav">
      <div class="v7-chapter-nav-head">
        <strong>章節</strong>
        <small>${esc(tree.curriculum?.scope||'台灣 108 課綱')}</small>
      </div>
      <div class="v7-chapter-nav-list">${chapters.map((chapter,index)=>{
        const stats=v7CeChapterStats(tree,chapter);
        const selected=currentChapter?.key===chapter.key;
        return `<button class="v7-chapter-nav-item ${selected?'is-selected':''}" data-ce-node="${v5CeAttr(chapter.key)}" aria-current="${selected?'true':'false'}">
          <span class="v7-chapter-index">${String(index+1).padStart(2,'0')}</span>
          <span class="v7-chapter-nav-copy">
            <strong>${esc(chapter.label)}</strong>
            <small>${stats.points} 個概念${stats.problems?` · ${stats.problems} 個錯題`:''}</small>
          </span>
          ${v7CeStatusDot(tree,chapter)}
        </button>`;
      }).join('')}</div>
    </aside>`;
  }

  function v7CeConceptButton(tree,point,current){
    const selected=current?.key===point.key;
    const facts=v5CeNodeFacts(tree,point).length;
    const problems=v5CeNodeProblems(tree,point).length;
    return `<button class="v7-concept-item ${selected?'is-selected':''}" data-ce-node="${v5CeAttr(point.key)}">
      ${v7CeStatusDot(tree,point)}
      <span class="v7-concept-copy"><strong>${esc(point.label)}</strong>${(facts||problems)?`<small>${problems?`${problems} 錯題`:''}${problems&&facts?' · ':''}${facts?`${facts} 事實`:''}</small>`:''}</span>
    </button>`;
  }

  function v7CeSectionCard(tree,section,current){
    const points=v5CeChildren(tree,section);
    return `<section class="v7-section-card">
      <div class="v7-section-head">
        <div>${v7CeStatusDot(tree,section)}<strong>${esc(section.label)}</strong></div>
        <button class="v7-section-review" data-ce-node="${v5CeAttr(section.key)}">複習本節</button>
      </div>
      <div class="v7-concept-list">${points.length?points.map(point=>v7CeConceptButton(tree,point,current)).join(''):'<div class="v7-empty-row">本節目前沒有概念條目。</div>'}</div>
    </section>`;
  }

  function v7CeChapterContent(tree,chapter,current){
    const sections=v5CeChildren(tree,chapter);
    const stats=v7CeChapterStats(tree,chapter);
    return `<main class="panel v7-chapter-content">
      <header class="v7-chapter-content-head">
        <div>
          <span class="v7-kicker">台灣 108 課綱 · ${esc(tree.subject.name)}</span>
          <h3>${esc(chapter.label)}</h3>
          <p>依課綱章節整理；每一節直接列出核心概念，不再使用節點圖或多層樹狀導覽。</p>
        </div>
        <div class="v7-chapter-summary">
          <span><strong>${sections.length}</strong><small>小節</small></span>
          <span><strong>${stats.points}</strong><small>概念</small></span>
          <span><strong>${stats.problems}</strong><small>相關錯題</small></span>
          <span><strong>${stats.mastery===null?'—':stats.mastery+'%'}</strong><small>掌握度</small></span>
        </div>
      </header>
      <div class="v7-sections">${sections.map(section=>v7CeSectionCard(tree,section,current)).join('')}</div>
    </main>`;
  }

  function v7CeDetailPane(tree,current,chapter){
    const target=current?.type==='subject'?chapter:current;
    return `<div class="v7-detail-wrap">${v5CeDetail(tree,target||chapter)}</div>`;
  }

  function v7ConceptsPage(){
    v5EnsureLearningState();
    const tree=v5CeTree(state.subject);
    const selected=v5CeSelected(tree);
    const chapters=v5CeChildren(tree,tree.root);
    const chapter=v7CeChapterFor(tree,selected)||chapters[0]||null;
    if(!chapter)return `<div class="page-head v5-concepts-head"><div><div class="tw-badge">${esc(TW_TERM_POLICY.label)}</div><h2>各科概念</h2><p>目前沒有可顯示的 108 課綱章節資料。</p></div></div>${subjectTabs()}`;

    return `<div class="page-head v5-concepts-head v7-concepts-head">
      <div><div class="tw-badge">${esc(TW_TERM_POLICY.label)}</div><h2>各科概念</h2><p>依台灣 108 課綱章節分類。選科目 → 選章節 → 直接看該章核心概念與自己的錯題紀錄。</p></div>
    </div>
    ${subjectTabs()}
    ${v5CeSearch()}
    <div class="v7-chapter-layout">
      ${v7CeChapterNav(tree,chapter)}
      ${v7CeChapterContent(tree,chapter,selected)}
      ${v7CeDetailPane(tree,selected,chapter)}
    </div>`;
  }

  window.conceptsPage=v7ConceptsPage;
  try{conceptsPage=window.conceptsPage}catch{}

  if(state?.page==='concepts'&&typeof render==='function')requestAnimationFrame(()=>render());
})();