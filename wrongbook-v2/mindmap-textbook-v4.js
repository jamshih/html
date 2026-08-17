// Unified textbook-map refinement for Visual 心智圖 V4.
// One coherent knowledge map per chapter: no mascot, no artificial page split,
// no page-number/index artifacts, no numbered blanks. Blanks live beside/around
// the instructional visual that gives them meaning.

function v4tbSectionColor(i){
  return ['#d98639','#638fc1','#68a36b','#a17aae','#4f8f9b','#c86f59','#d0a23d','#6e87aa'][i%8];
}
function v4tbStripSvgText(svg=''){
  // Hero diagrams are retrieval cues. Strip labels so a diagram cannot leak an answer.
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
  const n=[...String(a||'')].length;return Math.max(5,Math.min(22,n+2));
}
function v4tbRelated(subjectId,chapter,section){
  return (state.problems||[]).filter(x=>x.subject===subjectId&&(x.chapter===chapter.title||String(x.concept||'').includes(section.title))).length;
}
function v4tbRecall(subjectId,chapter,section,p,mode='flow'){
  const {key,val,ok,level,attempted}=v4tbPointState(subjectId,chapter,p),size=v4tbAnswerSize(p.a),related=v4tbRelated(subjectId,chapter,section);
  return `<div class="v4tb-recall v4tb-recall-${mode} ${ok?'is-correct':attempted?'is-attempted':''}" data-v4tb-point="${v4EscapeAttr(p.id)}" data-v4tb-owner="${v4EscapeAttr(section.id||section.title)}">
    <div class="v4tb-inline-line">
      <span class="v4tb-question">${esc(v4tbQuestion(p.q))}</span>
      <input class="mind-answer-v2 v4tb-answer" style="--answer-chars:${size}" size="${size}" data-mind-key="${v4EscapeAttr(key)}" data-answer="${v4EscapeAttr(p.a)}" value="${esc(val)}" placeholder="" autocomplete="off" aria-label="${v4EscapeAttr(p.q)}">
      <span class="mind-status ${ok?'good':attempted?'bad':''}" id="status-${v4EscapeAttr(key)}">${ok?'✓':attempted?'再想':''}</span>
      <button class="v4tb-hint-link" data-mind-hint="${v4EscapeAttr(key)}" data-hint="${v4EscapeAttr(p.h||'提示')}">${level?`提示 ${level}/3`:'提示'}</button>
      ${related?`<button class="v4tb-related" data-page="notebook">錯題 ${related}</button>`:''}
    </div>
    ${level?`<div class="v4tb-hint"><strong>提示 ${level}/3</strong> ${esc(v4tbHint(p,level))}</div>`:''}
    ${ok?`<div class="v4tb-truth"><span>✓</span>${esc(p.truth||p.a)}</div>`:''}
  </div>`;
}
function v4tbDiagramRecall(subjectId,chapter,section,p,slot){
  return `<div class="v4tb-slot v4tb-slot-${slot}" data-v4tb-slot-owner="${v4EscapeAttr(p.id)}">${v4tbRecall(subjectId,chapter,section,p,'diagram')}</div>`;
}
function v4tbDiagramSection(subjectId,chapter,section,si,reverse=false){
  const pts=section.points||[],color=v4tbSectionColor(si),done=pts.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  const diagramPts=pts.slice(0,Math.min(4,pts.length)),rest=pts.slice(diagramPts.length),slots=diagramPts.length===1?['right']:diagramPts.length===2?['left','right']:diagramPts.length===3?['top','left','right']:['top','left','right','bottom'];
  return `<section class="v4tb-branch v4tb-branch-diagram ${reverse?'is-reverse':''}" id="v4tb-sec-${si}" data-v4tb-section="${v4EscapeAttr(section.id||section.title)}" style="--branch:${color}">
    <div class="v4tb-section-ribbon"><span>${esc(section.title)}</span><small>${done}/${pts.length}</small></div>
    <div class="v4tb-visual-map v4tb-count-${Math.min(diagramPts.length,4)}">
      <div class="v4tb-center-visual" data-v4tb-figure-owner="${v4EscapeAttr(section.id||section.title)}">${v4tbSectionVisual(subjectId,chapter,section)}</div>
      ${diagramPts.map((p,i)=>v4tbDiagramRecall(subjectId,chapter,section,p,slots[i])).join('')}
    </div>
    ${rest.length?`<div class="v4tb-flow-points">${rest.map(p=>v4tbRecall(subjectId,chapter,section,p,'flow')).join('')}</div>`:''}
  </section>`;
}
function v4tbFlowSection(subjectId,chapter,section,si,shaded=false){
  const pts=section.points||[],color=v4tbSectionColor(si),done=pts.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  const cut=Math.min(2,Math.max(1,Math.ceil(pts.length/2))),before=pts.slice(0,cut),after=pts.slice(cut);
  return `<section class="v4tb-branch v4tb-branch-flow ${shaded?'is-shaded':''}" id="v4tb-sec-${si}" data-v4tb-section="${v4EscapeAttr(section.id||section.title)}" style="--branch:${color}">
    <div class="v4tb-section-ribbon"><span>${esc(section.title)}</span><small>${done}/${pts.length}</small></div>
    <div class="v4tb-flow-body">
      <div class="v4tb-flow-points v4tb-flow-before">${before.map(p=>v4tbRecall(subjectId,chapter,section,p,'flow')).join('')}</div>
      <div class="v4tb-flow-visual" data-v4tb-figure-owner="${v4EscapeAttr(section.id||section.title)}">${v4tbSectionVisual(subjectId,chapter,section)}</div>
      <div class="v4tb-flow-points v4tb-flow-after">${after.map(p=>v4tbRecall(subjectId,chapter,section,p,'flow')).join('')}</div>
    </div>
  </section>`;
}
function v4tbSectionMode(subjectId,chapter,section,si){
  const title=`${chapter.title} ${section.title}`;
  const visualFirst=/細胞|胞器|呼吸|光合|分裂|遺傳|生態|原子|分子|鍵|反應|溶液|酸|鹼|氧化|還原|電化|力|運動|能量|動量|圓周|波|電路|磁|光|向量|函數|圖形|幾何|機率|統計|地圖|氣候|地形|人口|產業|空間|區域/.test(title);
  if(['biology','chemistry','physics','math','geography'].includes(subjectId)&&visualFirst)return 'diagram';
  if(subjectId==='history')return 'flow';
  return si%2===0?'diagram':'flow';
}
function v4tbSection(subjectId,chapter,section,si){
  const mode=v4tbSectionMode(subjectId,chapter,section,si);
  return mode==='diagram'?v4tbDiagramSection(subjectId,chapter,section,si,si%4===2):v4tbFlowSection(subjectId,chapter,section,si,si%4===3);
}
function v4tbChapterHeader(subjectName,chapter,chapterStats){
  return `<header class="v4tb-map-header"><div><span>${esc(subjectName)} · 108 課綱</span><h3>${esc(chapter.title)}</h3></div><div class="v4tb-map-progress" aria-label="章節完成度"><span>${chapterStats.done}/${chapterStats.total}</span><i><b style="width:${chapterStats.pct}%"></b></i></div></header>`;
}
function v4tbKnowledgeMap(subjectId,subjectName,chapter,chapterStats){
  return `<section class="panel v4tb-sheet v4tb-knowledge-map" style="--subject:${v4MindPalette(subjectId)[0]}" data-v4tb-subject="${v4EscapeAttr(subjectId)}" data-v4tb-chapter="${v4EscapeAttr(chapter.id)}">
    ${v4tbChapterHeader(subjectName,chapter,chapterStats)}
    <div class="v4tb-page-body">
      ${(chapter.sections||[]).map((section,si)=>v4tbSection(subjectId,chapter,section,si)).join('')}
      <div class="v4tb-end-label"><span>脈絡整合完成度</span><strong>${chapterStats.done}/${chapterStats.total}</strong></div>
    </div>
  </section>`;
}
function mindmapPage(){
  const s=activeSubject(),curriculum=twCurriculumSubject(s.id),chosen=curriculum.chapters.find(ch=>ch.title===state.conceptChapter)||curriculum.chapters[0];
  if(!chosen)return'<div class="empty">這科目前沒有課綱資料。</div>';
  const chapterStats=v4ChapterStats(s.id,chosen),chapterIndex=curriculum.chapters.indexOf(chosen),prevChapter=curriculum.chapters[(chapterIndex-1+curriculum.chapters.length)%curriculum.chapters.length],nextChapter=curriculum.chapters[(chapterIndex+1)%curriculum.chapters.length];
  return `<div class="page-head v4tb-page-head"><div><div class="tw-badge">${esc(TW_TERM_POLICY.label)}</div><h2>心智圖學習 · ${esc(s.name)}</h2><p>把空格放在知識真正發生的位置：圖、箭頭、流程與概念群直接成為回想介面。</p></div><div class="v4-head-progress"><span>本章 ${chapterStats.pct}%</span><i><b style="width:${chapterStats.pct}%"></b></i></div></div>
    ${subjectTabs()}
    <div class="v4tb-layout">
      <nav class="v4tb-chapters" aria-label="章節"><span class="v4tb-chapter-summary">${curriculum.chapters.length} 個核心章節</span>${curriculum.chapters.map(ch=>{const st=v4ChapterStats(s.id,ch);return `<button class="mind-chapter-btn ${chosen.id===ch.id?'active':''}" data-concept-chapter="${v4EscapeAttr(ch.title)}"><strong>${esc(ch.title)}</strong><small>${st.done}/${st.total}</small></button>`}).join('')}</nav>
      <main class="v4tb-main"><div class="v4tb-book-stack">${v4tbKnowledgeMap(s.id,s.name,chosen,chapterStats)}</div>
      <div class="v4tb-sheet-footer"><button class="soft-btn" data-v4-chapter="${v4EscapeAttr(prevChapter.title)}">← 上一章</button><span>${esc(chosen.title)}</span><button class="primary-btn" data-v4-chapter="${v4EscapeAttr(nextChapter.title)}">下一章 →</button></div></main>
    </div>`;
}

const v4tbBaseBind=bind;
bind=function(){
  v4tbBaseBind();
};

render();
