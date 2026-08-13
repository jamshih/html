// Reference-faithful textbook-map refinement for Visual 心智圖 V4.
// Recreates the photographed Taiwanese「脈絡整合」grammar: portrait workbook pages,
// coloured branch spines, small node circles, inline numbered blanks and diagrams living on the flow.

function v4tbSectionColor(i){
  return ['#d98639','#638fc1','#68a36b','#a17aae','#4f8f9b','#c86f59','#d0a23d','#6e87aa'][i%8];
}
function v4tbStripSvgText(svg=''){
  return String(svg).replace(/<text\b[^>]*>[\s\S]*?<\/text>/gi,'');
}
function v4tbSectionVisual(subjectId,chapter,section){
  return v4tbStripSvgText(v4HeroGraphic(subjectId,`${chapter.title} ${section.title}`));
}
function v4tbPointState(subjectId,chapter,p){
  const key=v4PointKey(subjectId,chapter,p),val=state.mindAnswers?.[key]||'',level=state.mindHintLevels?.[key]||0;
  return {key,val,ok:v4MindCorrect(subjectId,chapter,p),level,attempted:Boolean(String(val).trim())};
}
function v4tbHint(p,level){
  if(typeof v3MindHint==='function')return v3MindHint(p,level);
  if(level<=1)return p.h||'先看圖上的位置、方向與前後關係。';
  if(level===2)return `答案約 ${String(p.a||'').replace(/\s/g,'').length} 個字／符號。`;
  const a=String(p.a||'');return `再強一點：${[...a].map((ch,i)=>i%2===0?ch:'＿').join('')}`;
}
function v4tbQuestion(q=''){
  return String(q).replace(/[？?。]\s*$/,'').trim();
}
function v4tbAnswerSize(a=''){
  const n=[...String(a||'')].length;return Math.max(5,Math.min(18,n+2));
}
function v4tbMascot(){
  return `<svg class="v4tb-mascot" viewBox="0 0 120 64" aria-hidden="true"><g fill="#8eb3a1" stroke="#557f6e" stroke-width="2"><ellipse cx="54" cy="37" rx="37" ry="21"/><circle cx="88" cy="31" r="15"/><circle cx="91" cy="25" r="2.4" fill="#253d36" stroke="none"/><path d="M98 34 q9 1 13 6 q-8 3-15-1"/><path d="M36 54 q-2 8 8 8 h8 q2-5-2-9M66 54 q0 8 9 8 h7 q1-5-4-9"/><path d="M22 26 q-10-4-15 2 q7 6 15 4"/></g><g fill="#d7e5dc" stroke="none"><circle cx="34" cy="27" r="3"/><circle cx="45" cy="22" r="2.5"/><circle cx="56" cy="25" r="2.5"/><circle cx="64" cy="20" r="2"/></g></svg>`;
}
function v4tbNumberMap(chapter){
  const map=new Map();let n=1;for(const sec of chapter.sections||[])for(const p of sec.points||[])map.set(p.id,n++);return map;
}
function v4tbRelated(subjectId,chapter,section){
  return (state.problems||[]).filter(x=>x.subject===subjectId&&(x.chapter===chapter.title||String(x.concept||'').includes(section.title))).length;
}
function v4tbRecall(subjectId,chapter,section,p,num,mode='flow'){
  const {key,val,ok,level,attempted}=v4tbPointState(subjectId,chapter,p),size=v4tbAnswerSize(p.a),related=v4tbRelated(subjectId,chapter,section);
  return `<div class="v4tb-recall v4tb-recall-${mode} ${ok?'is-correct':attempted?'is-attempted':''}" data-v4tb-point="${v4EscapeAttr(p.id)}">
    <div class="v4tb-inline-line">
      <span class="v4tb-question">${esc(v4tbQuestion(p.q))}</span><span class="v4tb-blank-no">(${num})</span>
      <input class="mind-answer-v2 v4tb-answer" style="--answer-chars:${size}" size="${size}" data-mind-key="${v4EscapeAttr(key)}" data-answer="${v4EscapeAttr(p.a)}" value="${esc(val)}" placeholder="" autocomplete="off" aria-label="${v4EscapeAttr(p.q)}">
      <span class="mind-status ${ok?'good':attempted?'bad':''}" id="status-${v4EscapeAttr(key)}">${ok?'✓':attempted?'再想':''}</span>
      <button class="v4tb-hint-link" data-mind-hint="${v4EscapeAttr(key)}" data-hint="${v4EscapeAttr(p.h||'提示')}">${level?`提示 ${level}/3`:'提示'}</button>
      ${related?`<button class="v4tb-related" data-page="notebook">錯題 ${related}</button>`:''}
    </div>
    ${level?`<div class="v4tb-hint"><strong>提示 ${level}/3</strong> ${esc(v4tbHint(p,level))}</div>`:''}
    ${ok?`<div class="v4tb-truth"><span>✓</span>${esc(p.truth||p.a)}</div>`:''}
  </div>`;
}
function v4tbDiagramRecall(subjectId,chapter,section,p,num,slot){
  return `<div class="v4tb-slot v4tb-slot-${slot}">${v4tbRecall(subjectId,chapter,section,p,num,'diagram')}</div>`;
}
function v4tbDiagramSection(subjectId,chapter,section,si,numMap,reverse=false){
  const pts=section.points||[],color=v4tbSectionColor(si),done=pts.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  const diagramPts=pts.slice(0,Math.min(4,pts.length)),rest=pts.slice(diagramPts.length),slots=diagramPts.length===1?['right']:diagramPts.length===2?['left','right']:diagramPts.length===3?['top','left','right']:['top','left','right','bottom'];
  return `<section class="v4tb-branch v4tb-branch-diagram ${reverse?'is-reverse':''}" id="v4tb-sec-${si}" style="--branch:${color}">
    <div class="v4tb-section-ribbon"><span>${esc(section.title)}</span><small>${done}/${pts.length}</small></div>
    <div class="v4tb-visual-map v4tb-count-${Math.min(diagramPts.length,4)}">
      <div class="v4tb-center-visual">${v4tbSectionVisual(subjectId,chapter,section)}</div>
      ${diagramPts.map((p,i)=>v4tbDiagramRecall(subjectId,chapter,section,p,numMap.get(p.id),slots[i])).join('')}
    </div>
    ${rest.length?`<div class="v4tb-flow-points">${rest.map(p=>v4tbRecall(subjectId,chapter,section,p,numMap.get(p.id),'flow')).join('')}</div>`:''}
  </section>`;
}
function v4tbFlowSection(subjectId,chapter,section,si,numMap,shaded=false){
  const pts=section.points||[],color=v4tbSectionColor(si),done=pts.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  const cut=Math.min(2,Math.max(1,Math.floor(pts.length/2))),before=pts.slice(0,cut),after=pts.slice(cut);
  return `<section class="v4tb-branch v4tb-branch-flow ${shaded?'is-shaded':''}" id="v4tb-sec-${si}" style="--branch:${color}">
    <div class="v4tb-section-ribbon"><span>${esc(section.title)}</span><small>${done}/${pts.length}</small></div>
    <div class="v4tb-flow-body">
      <div class="v4tb-flow-points v4tb-flow-before">${before.map(p=>v4tbRecall(subjectId,chapter,section,p,numMap.get(p.id),'flow')).join('')}</div>
      <div class="v4tb-flow-visual">${v4tbSectionVisual(subjectId,chapter,section)}</div>
      <div class="v4tb-flow-points v4tb-flow-after">${after.map(p=>v4tbRecall(subjectId,chapter,section,p,numMap.get(p.id),'flow')).join('')}</div>
    </div>
  </section>`;
}
function v4tbSection(subjectId,chapter,section,si,numMap){
  const pattern=si%4;
  if(pattern===0)return v4tbDiagramSection(subjectId,chapter,section,si,numMap,false);
  if(pattern===1)return v4tbFlowSection(subjectId,chapter,section,si,numMap,false);
  if(pattern===2)return v4tbDiagramSection(subjectId,chapter,section,si,numMap,true);
  return v4tbFlowSection(subjectId,chapter,section,si,numMap,true);
}
function v4tbChapterRoute(subjectId,chapter){
  return `<div class="v4tb-route" aria-label="章節脈絡">${chapter.sections.map((section,i)=>`<button data-v4tb-section="${i}" style="--branch:${v4tbSectionColor(i)}"><span>${i+1}</span><strong>${esc(section.title)}</strong></button>`).join('')}</div>`;
}
function v4tbPageHeader(subjectName,chapter,chapterIndex,pageIndex){
  if(pageIndex>0)return `<header class="v4tb-continuation"><span>${esc(subjectName)} · 108 課綱</span><strong>進階脈絡整理</strong></header>`;
  return `<header class="v4tb-book-header"><div class="v4tb-paper-strip"></div>${v4tbMascot()}<div class="v4tb-book-badge"><small>脈絡<br>整合</small><b>${chapterIndex+1}</b></div><h3>${esc(chapter.title)}</h3></header>`;
}
function v4tbPage(subjectId,subjectName,chapter,chapterIndex,sections,pageIndex,totalPages,numMap,chapterStats){
  const firstSectionIndex=chapter.sections.indexOf(sections[0]);
  return `<section class="panel v4tb-sheet" style="--subject:${v4MindPalette(subjectId)[0]}">
    ${v4tbPageHeader(subjectName,chapter,chapterIndex,pageIndex)}
    <div class="v4tb-page-body">
      ${sections.map((section,localIndex)=>v4tbSection(subjectId,chapter,section,firstSectionIndex+localIndex,numMap)).join('')}
      ${pageIndex===totalPages-1?`<div class="v4tb-end-label"><span>脈絡整合完成度</span><strong>${chapterStats.done}/${chapterStats.total}</strong></div>`:'<div class="v4tb-page-carry">→</div>'}
    </div>
    <footer class="v4tb-page-number"><span>${subjectName}</span><b>${chapterIndex+1}.${pageIndex+1}</b></footer>
  </section>`;
}
function v4tbSplitSections(chapter){
  const secs=chapter.sections||[];if(secs.length<=2)return [secs];
  const pages=[];for(let i=0;i<secs.length;i+=2)pages.push(secs.slice(i,i+2));return pages;
}
function mindmapPage(){
  const s=activeSubject(),curriculum=twCurriculumSubject(s.id),chosen=curriculum.chapters.find(ch=>ch.title===state.conceptChapter)||curriculum.chapters[0];
  if(!chosen)return'<div class="empty">這科目前沒有課綱資料。</div>';
  const chapterStats=v4ChapterStats(s.id,chosen),chapterIndex=curriculum.chapters.indexOf(chosen),numMap=v4tbNumberMap(chosen),pages=v4tbSplitSections(chosen),prevChapter=curriculum.chapters[(chapterIndex-1+curriculum.chapters.length)%curriculum.chapters.length],nextChapter=curriculum.chapters[(chapterIndex+1)%curriculum.chapters.length];
  return `<div class="page-head v4tb-page-head"><div><div class="tw-badge">${esc(TW_TERM_POLICY.label)}</div><h2>心智圖學習 · ${esc(s.name)}</h2><p>依你提供的「脈絡整合」頁面重製：分支、圖表與空格直接長在同一條知識脈絡上。</p></div><div class="v4-head-progress"><span>本章 ${chapterStats.pct}%</span><i><b style="width:${chapterStats.pct}%"></b></i></div></div>
    ${subjectTabs()}
    <div class="v4tb-layout">
      <nav class="v4tb-chapters" aria-label="章節"><span class="v4tb-chapter-summary">${curriculum.chapters.length} 個核心章節</span>${curriculum.chapters.map((ch,i)=>{const st=v4ChapterStats(s.id,ch);return `<button class="mind-chapter-btn ${chosen.id===ch.id?'active':''}" data-concept-chapter="${v4EscapeAttr(ch.title)}"><span>${i+1}</span><strong>${esc(ch.title)}</strong><small>${st.done}/${st.total}</small></button>`}).join('')}</nav>
      ${v4tbChapterRoute(s.id,chosen)}
      <main class="v4tb-main"><div class="v4tb-book-stack">${pages.map((sections,i)=>v4tbPage(s.id,s.name,chosen,chapterIndex,sections,i,pages.length,numMap,chapterStats)).join('')}</div>
      <div class="v4tb-sheet-footer"><button class="soft-btn" data-v4-chapter="${v4EscapeAttr(prevChapter.title)}">← 上一章</button><span>${esc(chosen.title)}</span><button class="primary-btn" data-v4-chapter="${v4EscapeAttr(nextChapter.title)}">下一章 →</button></div></main>
    </div>`;
}

const v4tbBaseBind=bind;
bind=function(){
  v4tbBaseBind();
  document.querySelectorAll('[data-v4tb-section]').forEach(el=>el.onclick=()=>document.getElementById(`v4tb-sec-${el.dataset.v4tbSection}`)?.scrollIntoView({behavior:'smooth',block:'center'}));
};

render();
