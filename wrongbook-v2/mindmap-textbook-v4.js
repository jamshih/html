// Generic textbook-style mind-map layout infrastructure only.
// No subject-specific reading cues, diagrams, examples, or curriculum payloads.
function v4tbSectionColor(i=0){return ['#6f78b8','#71928a','#a2836f','#8e789e'][Math.abs(Number(i)||0)%4];}
function v4tbStripSvgText(svg=''){return String(svg).replace(/<text\b[^>]*>[\s\S]*?<\/text>/gi,'');}
function v4tbSectionVisual(){return '';}
function v4tbTaiwanTermText(text=''){return String(text??'');}
function v4tbPointState(subjectId,chapter,p){
  const key=typeof v4PointKey==='function'?v4PointKey(subjectId,chapter,p):`${subjectId||''}:${chapter?.id||''}:${p?.id||''}`;
  const val=state.mindAnswers?.[key]||'';
  return {key,val,ok:typeof v4MindCorrect==='function'?v4MindCorrect(subjectId,chapter,p):false,level:0,attempted:Boolean(String(val).trim())};
}
function v4tbQuestion(q=''){return String(q??'').trim();}
function v4tbRecall(subjectId,chapter,section,p,mode='flow'){
  if(!p||typeof p!=='object')return '';
  const {key,val,ok,attempted}=v4tbPointState(subjectId,chapter,p);
  const e=typeof esc==='function'?esc:(v=>String(v??''));
  return `<div class="v4tb-recall v4tb-recall-${e(mode)} ${ok?'is-correct':attempted?'is-attempted':''}" data-v4tb-point="${e(p.id||'')}">
    <div class="v4tb-inline-line"><span class="v4tb-question">${e(v4tbQuestion(p.q||''))}</span><input class="mind-answer-v2 v4tb-answer" data-mind-key="${e(key)}" data-answer="${e(p.a||'')}" value="${e(val)}" autocomplete="off"></div>
  </div>`;
}
function v4tbRenderChapter(subjectId,chapter){
  if(!chapter||typeof chapter!=='object')return '';
  const sections=Array.isArray(chapter.sections)?chapter.sections:[];
  return sections.map((section,index)=>typeof mindSectionV2==='function'?mindSectionV2(subjectId,chapter,section,index):'').join('');
}
