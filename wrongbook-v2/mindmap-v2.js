// Wrong Book mind-map core infrastructure.
// Domain/curriculum content is intentionally empty. New content must be injected
// through WRONGBOOK_MINDMAP_CONTENT instead of being baked into the renderer.
window.WRONGBOOK_MINDMAP_CONTENT={version:1,subjects:{}};

function mindmapContentFor(subjectId){
  const source=window.WRONGBOOK_MINDMAP_CONTENT||{};
  const subjects=source.subjects&&typeof source.subjects==='object'?source.subjects:{};
  const subject=subjects[subjectId];
  return subject&&typeof subject==='object'?subject:{chapters:[]};
}

function mindmapInfrastructurePage(){
  const tabs=typeof subjectTabs==='function'?subjectTabs():'';
  return `<div class="page-head"><div><h2>心智圖</h2></div><div class="page-actions"><button class="soft-btn" data-action="resetMind">清空心智圖作答</button></div></div>
  ${tabs}
  <div class="mindmap-shell" data-mindmap-infrastructure="true" data-mindmap-empty="true">
    <aside class="panel mind-chapter-nav" data-mindmap-slot="chapters" aria-label="心智圖章節"></aside>
    <div class="mind-main">
      <section class="panel mind-overview mindmap-empty-canvas" data-mindmap-slot="canvas" aria-label="心智圖畫布"></section>
    </div>
  </div>`;
}

function mindmapPage(){return mindmapInfrastructurePage();}

// Compatibility renderers are intentionally data-driven. They contain no subject
// names, chapter names, questions, answers, hints, or diagrams of their own.
function mindSectionV2(subjectId,chapter,sec,si=0){
  if(!sec||typeof sec!=='object')return '';
  const points=Array.isArray(sec.points)?sec.points:[];
  const title=String(sec.title||'');
  return `<section class="panel mind-section-v2" data-mindmap-section="${typeof esc==='function'?esc(String(sec.id||si)):String(sec.id||si)}">
    <div class="mind-section-head"><div><span class="section-index">${si+1}</span><div><h3>${typeof esc==='function'?esc(title):title}</h3></div></div></div>
    <div class="mind-point-grid">${points.map(p=>mindPointV2(subjectId,chapter,p)).join('')}</div>
  </section>`;
}

function mindPointV2(subjectId,chapter,p){
  if(!p||typeof p!=='object')return '';
  const chapterId=chapter&&chapter.id!=null?chapter.id:'';
  const pointId=p.id!=null?p.id:'';
  const key=`${subjectId||''}:${chapterId}:${pointId}`;
  const e=typeof esc==='function'?esc:(v=>String(v??''));
  const val=state?.mindAnswers?.[key]||'';
  return `<article class="mind-point-v2" data-mindmap-point="${e(pointId)}">
    <div class="point-question">${e(p.q||'')}</div>
    <input class="mind-answer-v2" data-mind-key="${e(key)}" data-answer="${e(p.a||'')}" value="${e(val)}" autocomplete="off">
  </article>`;
}
