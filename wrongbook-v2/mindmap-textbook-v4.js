// Textbook-map refinement for Visual 心智圖 V4.
// Keeps the existing curriculum/state/review engine, but renders each chapter as one connected
// Taiwanese exam-prep style retrieval sheet. Answers stay hidden until the student recalls them.

function v4tbSectionColor(i){
  return ['#de8b42','#5d8fc4','#68a66d','#d4aa3f','#9b77b5','#4d9a9b','#c66f65','#6f8ca8'][i%8];
}
function v4tbStripSvgText(svg=''){
  return String(svg).replace(/<text\b[^>]*>[\s\S]*?<\/text>/gi,'');
}
function v4tbSectionVisual(subjectId,chapter,section){
  const label=`${chapter.title} ${section.title}`;
  return v4tbStripSvgText(v4HeroGraphic(subjectId,label));
}
function v4tbPointState(subjectId,chapter,p){
  const key=v4PointKey(subjectId,chapter,p);
  const val=state.mindAnswers?.[key]||'';
  return {key,val,ok:v4MindCorrect(subjectId,chapter,p),hint:state.mindHints?.[key]||'',attempted:Boolean(String(val).trim())};
}
function v4tbRecall(subjectId,chapter,section,p,i,mode='diagram'){
  const {key,val,ok,hint,attempted}=v4tbPointState(subjectId,chapter,p);
  const related=(state.problems||[]).filter(x=>x.subject===subjectId&&(x.chapter===chapter.title||String(x.concept||'').includes(section.title))).length;
  return `<div class="v4tb-recall ${mode==='diagram'?'v4tb-recall-diagram':'v4tb-recall-flow'} ${ok?'is-correct':attempted?'is-attempted':''}" data-v4tb-point="${v4EscapeAttr(p.id)}">
    <div class="v4tb-recall-head"><span>${i+1}</span><b>${esc(p.kind||'核心觀念')}</b>${related?`<em>${related} 題相關錯題</em>`:''}</div>
    <div class="v4tb-question">${esc(p.q)}</div>
    <div class="v4tb-answer-line">
      <input class="mind-answer-v2 v4tb-answer" data-mind-key="${v4EscapeAttr(key)}" data-answer="${v4EscapeAttr(p.a)}" value="${esc(val)}" placeholder="＿＿＿＿" autocomplete="off" aria-label="${v4EscapeAttr(p.q)}">
      <span class="mind-status ${ok?'good':attempted?'bad':''}" id="status-${v4EscapeAttr(key)}">${ok?'✓':attempted?'再想一次':''}</span>
      <button class="v4tb-hint-link" data-mind-hint="${v4EscapeAttr(key)}" data-hint="${v4EscapeAttr(p.h||'提示')}">提示</button>
    </div>
    ${hint?`<div class="v4tb-hint">${esc(hint)}</div>`:''}
    ${ok?`<div class="v4tb-truth"><span>✓</span><strong>${esc(p.truth||p.a)}</strong></div>`:''}
  </div>`;
}
function v4tbDiagramSection(subjectId,chapter,section,si){
  const points=section.points||[],color=v4tbSectionColor(si),done=points.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  const slots=points.length===1?['right']:points.length===2?['left','right']:points.length===3?['top','left','right']:['top','left','right','bottom'];
  return `<section class="v4tb-branch v4tb-branch-diagram" id="v4tb-sec-${si}" style="--branch:${color}">
    <div class="v4tb-branch-title"><span>${si+1}</span><div><strong>${esc(section.title)}</strong><small>${done}/${points.length} 已能獨立回想</small></div></div>
    <div class="v4tb-visual-map v4tb-count-${Math.min(points.length,4)}">
      <div class="v4tb-center-visual">${v4tbSectionVisual(subjectId,chapter,section)}<small>圖只提供線索，不先標答案</small></div>
      ${points.slice(0,4).map((p,i)=>`<div class="v4tb-slot v4tb-slot-${slots[i]}">${v4tbRecall(subjectId,chapter,section,p,i,'diagram')}</div>`).join('')}
    </div>
  </section>`;
}
function v4tbFlowSection(subjectId,chapter,section,si){
  const points=section.points||[],color=v4tbSectionColor(si),done=points.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  return `<section class="v4tb-branch v4tb-branch-flow" id="v4tb-sec-${si}" style="--branch:${color}">
    <div class="v4tb-branch-title"><span>${si+1}</span><div><strong>${esc(section.title)}</strong><small>${done}/${points.length} 已能獨立回想</small></div></div>
    <div class="v4tb-flow-body"><div class="v4tb-flow-visual">${v4tbSectionVisual(subjectId,chapter,section)}</div><div class="v4tb-flow-points">${points.map((p,i)=>v4tbRecall(subjectId,chapter,section,p,i,'flow')).join('')}</div></div>
  </section>`;
}
function v4tbSection(subjectId,chapter,section,si){
  return (section.points||[]).length<=4?v4tbDiagramSection(subjectId,chapter,section,si):v4tbFlowSection(subjectId,chapter,section,si);
}
function v4tbChapterRoute(subjectId,chapter){
  return `<div class="v4tb-route" aria-label="章節脈絡">${chapter.sections.map((section,i)=>{const done=(section.points||[]).filter(p=>v4MindCorrect(subjectId,chapter,p)).length;return `<button data-v4tb-section="${i}" style="--branch:${v4tbSectionColor(i)}"><span>${i+1}</span><strong>${esc(v4Short(section.title,11))}</strong><small>${done}/${section.points.length}</small></button>`}).join('<i>→</i>')}</div>`;
}
function mindmapPage(){
  const s=activeSubject(),curriculum=twCurriculumSubject(s.id),chosen=curriculum.chapters.find(ch=>ch.title===state.conceptChapter)||curriculum.chapters[0];
  if(!chosen)return'<div class="empty">這科目前沒有課綱資料。</div>';
  const chapterStats=v4ChapterStats(s.id,chosen),chapterIndex=curriculum.chapters.indexOf(chosen),prevChapter=curriculum.chapters[(chapterIndex-1+curriculum.chapters.length)%curriculum.chapters.length],nextChapter=curriculum.chapters[(chapterIndex+1)%curriculum.chapters.length];
  return `<div class="page-head v4tb-page-head"><div><div class="tw-badge">${esc(TW_TERM_POLICY.label)}</div><h2>心智圖學習 · ${esc(s.name)}</h2><p>像課本的「脈絡整合」一樣，把整章放在同一張圖上；空格直接長在概念與圖的位置上。</p></div><div class="v4-head-progress"><span>本章獨立回想 ${chapterStats.pct}%</span><i><b style="width:${chapterStats.pct}%"></b></i></div></div>
  ${subjectTabs()}
  <div class="v4tb-layout">
    <aside class="panel v4tb-chapters"><div class="mind-side-head"><strong>${esc(curriculum.scope)}</strong><small>${curriculum.chapters.length} 個核心章節</small></div>${curriculum.chapters.map((ch,i)=>{const st=v4ChapterStats(s.id,ch);return `<button class="mind-chapter-btn ${chosen.id===ch.id?'active':''}" data-concept-chapter="${v4EscapeAttr(ch.title)}"><span class="mind-chapter-no">${String(i+1).padStart(2,'0')}</span><span><strong>${esc(ch.title)}</strong><small>${st.done}/${st.total} 已會</small></span><span class="mind-chapter-progress"><i style="width:${st.pct}%"></i></span></button>`}).join('')}</aside>
    <main class="v4tb-main">
      <section class="panel v4tb-sheet" style="--subject:${v4MindPalette(s.id)[0]}">
        <header class="v4tb-book-header"><div class="v4tb-book-badge"><small>脈絡整合</small><b>${chapterIndex+1}</b></div><div><span>${esc(s.name)} · 108 課綱</span><h3>${esc(chosen.title)}</h3></div><div class="v4tb-book-score"><strong>${chapterStats.done}/${chapterStats.total}</strong><small>關鍵重點</small></div></header>
        <div class="v4tb-instruction"><strong>作答規則</strong><span>先看圖與前後關係，再把答案填進它真正所屬的位置。圖上的文字不會先把答案洩漏給你。</span></div>
        ${v4tbChapterRoute(s.id,chosen)}
        <div class="v4tb-map">${chosen.sections.map((section,si)=>v4tbSection(s.id,chosen,section,si)).join('')}</div>
        <footer class="v4tb-sheet-footer"><button class="soft-btn" data-v4-chapter="${v4EscapeAttr(prevChapter.title)}">← 上一章</button><div><strong>整章完整度 ${chapterStats.pct}%</strong><span>提示使用與相關錯題仍會保留在原本的學習資料中</span></div><button class="primary-btn" data-v4-chapter="${v4EscapeAttr(nextChapter.title)}">下一章 →</button></footer>
      </section>
    </main>
  </div>`;
}

const v4tbBaseBind=bind;
bind=function(){
  v4tbBaseBind();
  document.querySelectorAll('[data-v4tb-section]').forEach(el=>el.onclick=()=>document.getElementById(`v4tb-sec-${el.dataset.v4tbSection}`)?.scrollIntoView({behavior:'smooth',block:'center'}));
  document.querySelectorAll('.v4tb-answer').forEach(el=>{const previous=el.onchange;el.onchange=()=>{if(previous)previous();render()}});
};

render();