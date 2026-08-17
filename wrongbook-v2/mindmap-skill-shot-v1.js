// Visual-proof helper for the branch-only mind-map QA workflow.
// This file is not loaded by production. The temporary workflow injects it locally.
(async()=>{
  const params=new URLSearchParams(location.search),subject=params.get('mindmapshot');
  if(!subject)return;
  const allowed=['chinese','english','math','physics','chemistry','biology','history','geography','civics'];
  if(!allowed.includes(subject))throw new Error(`unsupported mindmapshot subject: ${subject}`);
  const curriculum=twCurriculumSubject(subject),max=Math.max(0,(curriculum?.chapters?.length||1)-1),index=Math.max(0,Math.min(max,Number(params.get('shotchapter')||0))),chapter=curriculum?.chapters?.[index];
  if(!chapter)throw new Error(`missing chapter for ${subject}`);
  if(document.fonts?.ready)await document.fonts.ready;
  state.page='mindmap';state.subject=subject;state.conceptChapter=chapter.title;render();
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  document.body.dataset.mindmapShotReady='1';
  document.body.dataset.mindmapShotSubject=subject;
  document.body.dataset.mindmapShotChapter=chapter.id||chapter.title;
  const marker=document.createElement('div');marker.id='mindmap-shot-ready';marker.hidden=true;marker.textContent=`${subject}:${chapter.id||chapter.title}`;document.body.appendChild(marker);
})();
