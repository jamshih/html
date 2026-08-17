// Unified textbook-map refinement for Visual 心智圖 V4.
// Earth-derived reconstruction rules + Clearnote-informed semantic arrangement.
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
function v4tbTaiwanTermText(text=''){
  // Clearnote/public-note material may contain Simplified Chinese or Mainland terms.
  // Normalize only known concept terminology here; ambiguous source text must be repaired
  // in canonical data rather than hidden by blind character conversion.
  const map={
    ...(TW_TERM_POLICY?.preferred||{}),
    '线粒体':'粒線體','高尔基体':'高基氏體','核糖体':'核糖體','内质网':'內質網','叶绿体':'葉綠體','细胞膜':'細胞膜','细胞核':'細胞核',
    '有丝分裂':'有絲分裂','减数分裂':'減數分裂','氧化还原':'氧化還原','摩尔质量':'莫耳質量','摩尔':'莫耳','矢量':'向量','势能':'位能','电势':'電位',
    '函数':'函數','概率':'機率','数列':'數列','级数':'級數','几何':'幾何','导数':'導數','总统制':'總統制','内阁制':'內閣制','双首长制':'雙首長制',
    '权利':'權利','权力':'權力','产业':'產業','人口迁移':'人口遷移','修辞':'修辭','语法':'語法','数据':'資料','视频':'影片','信息':'資訊'
  };
  let out=String(text??'');
  Object.entries(map).sort((a,b)=>b[0].length-a[0].length).forEach(([from,to])=>{out=out.split(from).join(to)});
  return out;
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
  return v4tbTaiwanTermText(String(q).replace(/[？?。]\s*$/,'').trim());
}
function v4tbAnswerSize(a=''){
  const n=[...String(a||'')].length;return Math.max(5,Math.min(22,n+2));
}
function v4tbRelated(subjectId,chapter,section){
  return (state.problems||[]).filter(x=>x.subject===subjectId&&(x.chapter===chapter.title||String(x.concept||'').includes(section.title))).length;
}
function v4tbReadingCue(subjectId,mode){
  const byMode={
    diagram:'讀圖：位置 → 結構 → 功能 → 關聯',
    flow:'流程：條件 → 過程 → 轉折 → 結果',
    compare:'比較：定義 → 條件 → 差異 → 易混點',
    timeline:'時間脈絡：背景 → 轉折 → 結果 → 長期影響',
    formula:'公式：條件 → 符號/單位 → 圖像 → 常見陷阱',
    tree:'層級：核心概念 → 分類 → 特徵 → 例子/例外'
  };
  const subjectCue={
    chinese:'先抓篇章/文學結構，再回到關鍵文句與字義。',
    english:'先分形式、意思、使用條件，再用例句排除易混用法。',
    math:'先確認定義域與成立條件，再連結公式、圖形與等價表示。',
    physics:'先定義系統與方向，再讀量、單位、圖與守恆/因果關係。',
    chemistry:'把巨觀現象、粒子觀點與符號/方程式放在同一脈絡。',
    biology:'用「構造在哪裡 → 做什麼 → 如何調控」理解，而不是只背名稱。',
    history:'分清先後、因果與同時發生；日期只在能固定脈絡時保留。',
    geography:'先定位尺度與空間，再追過程、分布與人地互動。',
    civics:'先找行為者/機關，再看權力或權利、程序、限制與救濟。'
  };
  return `<div class="v4tb-reading-cue"><strong>${esc(byMode[mode]||byMode.tree)}</strong><span>${esc(subjectCue[subjectId]||'先理解關係，再回想細節。')}</span></div>`;
}
function v4tbRecall(subjectId,chapter,section,p,mode='flow'){
  const {key,val,ok,level,attempted}=v4tbPointState(subjectId,chapter,p),size=v4tbAnswerSize(p.a),related=v4tbRelated(subjectId,chapter,section);
  return `<div class="v4tb-recall v4tb-recall-${mode} ${ok?'is-correct':attempted?'is-attempted':''}" data-v4tb-point="${v4EscapeAttr(p.id)}" data-v4tb-owner="${v4EscapeAttr(section.id||section.title)}">
    <div class="v4tb-inline-line">
      <span class="v4tb-question">${esc(v4tbQuestion(p.q))}</span>
      <input class="mind-answer-v2 v4tb-answer" style="--answer-chars:${size}" size="${size}" data-mind-key="${v4EscapeAttr(key)}" data-answer="${v4EscapeAttr(p.a)}" value="${esc(val)}" placeholder="" autocomplete="off" aria-label="${v4EscapeAttr(v4tbQuestion(p.q))}">
      <span class="mind-status ${ok?'good':attempted?'bad':''}" id="status-${v4EscapeAttr(key)}">${ok?'✓':attempted?'再想':''}</span>
      <button class="v4tb-hint-link" data-mind-hint="${v4EscapeAttr(key)}" data-hint="${v4EscapeAttr(v4tbTaiwanTermText(p.h||'提示'))}">${level?`提示 ${level}/3`:'提示'}</button>
      ${related?`<button class="v4tb-related" data-page="notebook">錯題 ${related}</button>`:''}
    </div>
    ${level?`<div class="v4tb-hint"><strong>提示 ${level}/3</strong> ${esc(v4tbTaiwanTermText(v4tbHint(p,level)))}</div>`:''}
    ${ok?`<div class="v4tb-truth"><span>✓</span>${esc(v4tbTaiwanTermText(p.truth||p.a))}</div>`:''}
  </div>`;
}
function v4tbDiagramRecall(subjectId,chapter,section,p,slot){
  return `<div class="v4tb-slot v4tb-slot-${slot}" data-v4tb-slot-owner="${v4EscapeAttr(p.id)}">${v4tbRecall(subjectId,chapter,section,p,'diagram')}</div>`;
}
function v4tbSectionShell(section,si,mode,body,done,total,extra=''){
  const color=v4tbSectionColor(si),title=v4tbTaiwanTermText(section.title);
  return `<section class="v4tb-branch v4tb-branch-${mode} ${extra}" id="v4tb-sec-${si}" data-v4tb-section="${v4EscapeAttr(section.id||section.title)}" data-v4tb-layout="${mode}" style="--branch:${color}">
    <div class="v4tb-section-ribbon"><span>${esc(title)}</span><small>${done}/${total}</small></div>
    ${body}
  </section>`;
}
function v4tbDiagramSection(subjectId,chapter,section,si,reverse=false){
  const pts=section.points||[],done=pts.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  const diagramPts=pts.slice(0,Math.min(4,pts.length)),rest=pts.slice(diagramPts.length),slots=diagramPts.length===1?['right']:diagramPts.length===2?['left','right']:diagramPts.length===3?['top','left','right']:['top','left','right','bottom'];
  const body=`${v4tbReadingCue(subjectId,'diagram')}<div class="v4tb-visual-map v4tb-count-${Math.min(diagramPts.length,4)}">
      <div class="v4tb-center-visual" data-v4tb-figure-owner="${v4EscapeAttr(section.id||section.title)}">${v4tbSectionVisual(subjectId,chapter,section)}</div>
      ${diagramPts.map((p,i)=>v4tbDiagramRecall(subjectId,chapter,section,p,slots[i])).join('')}
    </div>
    ${rest.length?`<div class="v4tb-flow-points">${rest.map(p=>v4tbRecall(subjectId,chapter,section,p,'flow')).join('')}</div>`:''}`;
  return v4tbSectionShell(section,si,'diagram',body,done,pts.length,reverse?'is-reverse':'');
}
function v4tbFlowSection(subjectId,chapter,section,si,shaded=false){
  const pts=section.points||[],done=pts.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  const cut=Math.min(2,Math.max(1,Math.ceil(pts.length/2))),before=pts.slice(0,cut),after=pts.slice(cut);
  const body=`${v4tbReadingCue(subjectId,'flow')}<div class="v4tb-flow-body">
      <div class="v4tb-flow-points v4tb-flow-before">${before.map(p=>v4tbRecall(subjectId,chapter,section,p,'flow')).join('')}</div>
      <div class="v4tb-flow-visual" data-v4tb-figure-owner="${v4EscapeAttr(section.id||section.title)}">${v4tbSectionVisual(subjectId,chapter,section)}</div>
      <div class="v4tb-flow-points v4tb-flow-after">${after.map(p=>v4tbRecall(subjectId,chapter,section,p,'flow')).join('')}</div>
    </div>`;
  return v4tbSectionShell(section,si,'flow',body,done,pts.length,shaded?'is-shaded':'');
}
function v4tbCompareSection(subjectId,chapter,section,si){
  const pts=section.points||[],done=pts.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  const body=`${v4tbReadingCue(subjectId,'compare')}<div class="v4tb-compare-body">
    <div class="v4tb-compare-visual" data-v4tb-figure-owner="${v4EscapeAttr(section.id||section.title)}">${v4tbSectionVisual(subjectId,chapter,section)}</div>
    <div class="v4tb-compare-grid">${pts.map((p,i)=>`<div class="v4tb-compare-cell" data-v4tb-compare-index="${i}">${v4tbRecall(subjectId,chapter,section,p,'compare')}</div>`).join('')}</div>
  </div>`;
  return v4tbSectionShell(section,si,'compare',body,done,pts.length);
}
function v4tbTimelineSection(subjectId,chapter,section,si){
  const pts=section.points||[],done=pts.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  const body=`${v4tbReadingCue(subjectId,'timeline')}<div class="v4tb-timeline-body">
    <div class="v4tb-timeline-visual" data-v4tb-figure-owner="${v4EscapeAttr(section.id||section.title)}">${v4tbSectionVisual(subjectId,chapter,section)}</div>
    <div class="v4tb-timeline-track">${pts.map((p,i)=>`<div class="v4tb-timeline-node" data-v4tb-sequence="${i+1}"><i aria-hidden="true"></i>${v4tbRecall(subjectId,chapter,section,p,'timeline')}</div>`).join('')}</div>
  </div>`;
  return v4tbSectionShell(section,si,'timeline',body,done,pts.length);
}
function v4tbFormulaSection(subjectId,chapter,section,si){
  const pts=section.points||[],done=pts.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  const body=`${v4tbReadingCue(subjectId,'formula')}<div class="v4tb-formula-body">
    <div class="v4tb-formula-visual" data-v4tb-figure-owner="${v4EscapeAttr(section.id||section.title)}">${v4tbSectionVisual(subjectId,chapter,section)}</div>
    <div class="v4tb-formula-grid">${pts.map(p=>v4tbRecall(subjectId,chapter,section,p,'formula')).join('')}</div>
  </div>`;
  return v4tbSectionShell(section,si,'formula',body,done,pts.length);
}
function v4tbTreeSection(subjectId,chapter,section,si){
  const pts=section.points||[],done=pts.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  const body=`${v4tbReadingCue(subjectId,'tree')}<div class="v4tb-tree-body">
    <div class="v4tb-tree-root" data-v4tb-figure-owner="${v4EscapeAttr(section.id||section.title)}">${v4tbSectionVisual(subjectId,chapter,section)}</div>
    <div class="v4tb-tree-grid">${pts.map((p,i)=>`<div class="v4tb-tree-leaf" data-v4tb-tree-index="${i}">${v4tbRecall(subjectId,chapter,section,p,'tree')}</div>`).join('')}</div>
  </div>`;
  return v4tbSectionShell(section,si,'tree',body,done,pts.length);
}
function v4tbSectionMode(subjectId,chapter,section,si){
  const title=v4tbTaiwanTermText(`${chapter.title} ${section.title}`);
  const process=/流程|過程|作用|循環|傳遞|運輸|代謝|呼吸|光合|反應|合成|分解|調節|調控|程序|救濟|形成|運作|演算|推導|變化/.test(title);
  const compare=/比較|差異|異同|分類|類型|體制|制度|優缺點|原核|真核|有絲|減數|酸|鹼|鍵結|語態|時態|子句|關係詞|假設|倒裝|分詞|同義|反義|易混/.test(title);
  const timeline=/年代|年表|時間|時期|歷程|發展|變遷|演變|革命|改革|戰爭|統治|事件|朝代|世紀|近代|現代|古代/.test(title);
  const formula=/公式|函數|數列|級數|機率|統計|向量|三角|指數|對數|多項式|矩陣|排列|組合|莫耳|濃度|氣體|熱化學|力學|運動學|能量|動量|電學|磁學|波動|光學/.test(title);
  const spatial=/細胞|胞器|組織|器官|構造|解剖|地圖|投影|氣候|地形|水文|人口|產業|區域|電路|向量圖|幾何|圓|座標|圖形|軌域|分子構型|裝置/.test(title);
  const hierarchy=/作者|文學|流派|國學|修辭|字義|形音義|體裁|文法|單字|片語|分類|階層|生態|演化|法律|權利|權力|機關|組織/.test(title);

  if(subjectId==='history')return timeline?'timeline':compare?'compare':'tree';
  if(subjectId==='civics')return process?'flow':compare||/政府|選舉|市場|法律|政策/.test(title)?'compare':'tree';
  if(subjectId==='chinese')return process||/文章結構|篇章|敘事|論證/.test(title)?'flow':compare?'compare':'tree';
  if(subjectId==='english')return process||/寫作|段落|組織/.test(title)?'flow':compare?'compare':hierarchy?'tree':'tree';
  if(subjectId==='math')return /幾何|圓|座標|圖形/.test(title)?'diagram':formula?'formula':compare?'compare':'tree';
  if(subjectId==='physics')return /電路|光線|成像|向量|力圖|波形/.test(title)?'diagram':process?'flow':formula?'formula':compare?'compare':'diagram';
  if(subjectId==='chemistry')return /原子|分子|鍵結|構型|裝置/.test(title)?'diagram':process?'flow':formula?'formula':compare?'compare':'tree';
  if(subjectId==='biology')return process?'flow':compare?'compare':spatial?'diagram':hierarchy?'tree':'diagram';
  if(subjectId==='geography')return process?'flow':compare||/人口|產業|都市|區域/.test(title)?'compare':spatial?'diagram':'tree';
  return si%2===0?'tree':'flow';
}
function v4tbSection(subjectId,chapter,section,si){
  const mode=v4tbSectionMode(subjectId,chapter,section,si);
  if(mode==='diagram')return v4tbDiagramSection(subjectId,chapter,section,si,si%4===2);
  if(mode==='compare')return v4tbCompareSection(subjectId,chapter,section,si);
  if(mode==='timeline')return v4tbTimelineSection(subjectId,chapter,section,si);
  if(mode==='formula')return v4tbFormulaSection(subjectId,chapter,section,si);
  if(mode==='tree')return v4tbTreeSection(subjectId,chapter,section,si);
  return v4tbFlowSection(subjectId,chapter,section,si,si%4===3);
}
function v4tbChapterHeader(subjectName,chapter,chapterStats){
  return `<header class="v4tb-map-header"><div><span>${esc(v4tbTaiwanTermText(subjectName))} · 108 課綱</span><h3>${esc(v4tbTaiwanTermText(chapter.title))}</h3></div><div class="v4tb-map-progress" aria-label="章節完成度"><span>${chapterStats.done}/${chapterStats.total}</span><i><b style="width:${chapterStats.pct}%"></b></i></div></header>`;
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
  return `<div class="page-head v4tb-page-head"><div><div class="tw-badge">${esc(TW_TERM_POLICY.label)}</div><h2>心智圖學習 · ${esc(v4tbTaiwanTermText(s.name))}</h2><p>先看關係，再回想細節：圖、比較、流程、時間脈絡、公式與概念層級依內容自動選擇。</p></div><div class="v4-head-progress"><span>本章 ${chapterStats.pct}%</span><i><b style="width:${chapterStats.pct}%"></b></i></div></div>
    ${subjectTabs()}
    <div class="v4tb-layout">
      <nav class="v4tb-chapters" aria-label="章節"><span class="v4tb-chapter-summary">${curriculum.chapters.length} 個核心章節</span>${curriculum.chapters.map(ch=>{const st=v4ChapterStats(s.id,ch);return `<button class="mind-chapter-btn ${chosen.id===ch.id?'active':''}" data-concept-chapter="${v4EscapeAttr(ch.title)}"><strong>${esc(v4tbTaiwanTermText(ch.title))}</strong><small>${st.done}/${st.total}</small></button>`}).join('')}</nav>
      <main class="v4tb-main"><div class="v4tb-book-stack">${v4tbKnowledgeMap(s.id,s.name,chosen,chapterStats)}</div>
      <div class="v4tb-sheet-footer"><button class="soft-btn" data-v4-chapter="${v4EscapeAttr(prevChapter.title)}">← 上一章</button><span>${esc(v4tbTaiwanTermText(chosen.title))}</span><button class="primary-btn" data-v4-chapter="${v4EscapeAttr(nextChapter.title)}">下一章 →</button></div></main>
    </div>`;
}

const v4tbBaseBind=bind;
bind=function(){
  v4tbBaseBind();
};

render();
