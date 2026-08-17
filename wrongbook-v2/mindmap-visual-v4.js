// Generic visual mind-map infrastructure only. Subject-specific SVGs and baked
// curriculum visuals were intentionally removed.
state.visualMindSection=state.visualMindSection||{};
state.visualMindNode=state.visualMindNode||{};

function v4PointKey(subjectId,chapter,p){return `${subjectId||''}:${chapter?.id||''}:${p?.id||''}`;}
function v4MindCorrect(subjectId,chapter,p){
  const value=state.mindAnswers?.[v4PointKey(subjectId,chapter,p)]||'';
  const answer=String(p?.a||'');
  return typeof v3Equivalent==='function'?v3Equivalent(value,answer):String(value).trim().toLowerCase()===answer.trim().toLowerCase();
}
function v4ChapterStats(subjectId,chapter){
  const points=Array.isArray(chapter?.points)?chapter.points:Array.isArray(chapter?.sections)?chapter.sections.flatMap(s=>Array.isArray(s?.points)?s.points:[]):[];
  const done=points.filter(p=>v4MindCorrect(subjectId,chapter,p)).length;
  return {total:points.length,done,hinted:0,pct:points.length?Math.round(done/points.length*100):0};
}
function v4SubjectStats(subjectId){
  const content=typeof mindmapContentFor==='function'?mindmapContentFor(subjectId):{chapters:[]};
  const chapters=Array.isArray(content?.chapters)?content.chapters:[];
  let total=0,done=0;
  chapters.forEach(ch=>{const stats=v4ChapterStats(subjectId,ch);total+=stats.total;done+=stats.done;});
  return {chapters:chapters.length,total,done,pct:total?Math.round(done/total*100):0};
}
function v4Short(text,n=18){const s=String(text||'').trim();return [...s].length>n?[...s].slice(0,n).join('')+'…':s;}
function v4EscapeAttr(value=''){return typeof esc==='function'?esc(String(value)).replaceAll("'",'&#39;'):String(value);}
function v4MindPalette(){return ['#5d61c8','#f4f4ff','#d5d6f7'];}
function v4SvgWrap(body='',label=''){return `<svg viewBox="0 0 360 260" role="img" aria-label="${v4EscapeAttr(label)}" class="v4-hero-svg">${body||''}</svg>`;}
function v4HeroGraphic(){return v4SvgWrap('','');}
