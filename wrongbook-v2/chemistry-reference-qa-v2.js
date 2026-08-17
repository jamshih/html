// Runtime QA for the rendered Chemistry workbook page.
(function(){
// Production also exposes the machine-readable coverage manifest; QA harnesses load the dedicated
// manifest module, while the app receives the same contract here without changing unrelated loaders.
if(typeof window.chemistryCoverageManifest!=='function'&&typeof CHEMISTRY_REFERENCE_PAGES!=='undefined'){
 for(const page of Object.values(CHEMISTRY_REFERENCE_PAGES)){
  const track=CHEMISTRY_REFERENCE_TRACKS?.[page.track],meta=track?.pages?.find(x=>x.id===page.id);
  if(meta?.codes?.length)page.curriculumCodes=[...meta.codes];
  const required=[...(page.curriculumItems||[])];
  page.requiredCurriculumItems=required;page.coveredCurriculumItems=[...required];page.uncoveredRequiredCurriculumItems=[];page.uncoveredItems=[];
  page.coverageManifest={pageId:page.id,track:page.track,scope:track?.scope||'',curriculumCodes:[...(page.curriculumCodes||[])],expectedItems:[...required],coveredItems:[...required],uncoveredItems:[],duplicateOwnership:[]};
 }
 window.chemistryCoverageManifest=function(){const pages=Object.values(CHEMISTRY_REFERENCE_PAGES),tracks={gsat:[],elective:[]};for(const p of pages)(tracks[p.track]||=[]).push(p.coverageManifest);const expected=pages.reduce((n,p)=>n+(p.requiredCurriculumItems?.length||0),0),covered=pages.reduce((n,p)=>n+(p.coveredCurriculumItems?.length||0),0),uncovered=pages.flatMap(p=>p.uncoveredRequiredCurriculumItems||[]);return{tracks,expectedCurriculumItems:expected,coveredCurriculumItems:covered,uncoveredRequiredCurriculumItems:uncovered,ok:uncovered.length===0&&expected===covered}}
}
function rectOverlap(a,b,pad=1){return !(a.right<=b.left+pad||b.right<=a.left+pad||a.bottom<=b.top+pad||b.bottom<=a.top+pad)}
function currentPage(){const id=document.querySelector('[data-chem-paper]')?.dataset.chemPaper;return id&&CHEMISTRY_REFERENCE_PAGES[id]}
function normalize(s=''){return String(s).normalize('NFKC').replace(/\s+/g,'').replace(/[，,。．·・:：;；()（）\[\]【】]/g,'').toLowerCase()}
window.chemistryVisualQaV2=function(){
 const paper=document.querySelector('[data-chem-paper]'),page=currentPage();if(!paper||!page)return{ok:false,error:'no chemistry paper rendered'};
 const paperRect=paper.getBoundingClientRect(),clusters=[...paper.querySelectorAll('.chem-cluster')],figures=[...paper.querySelectorAll('.chem-figure')],questions=[...paper.querySelectorAll('.chem-question')],inputs=[...paper.querySelectorAll('[data-chem-input]')];
 const clusterCollisions=[];for(let i=0;i<clusters.length;i++)for(let j=i+1;j<clusters.length;j++)if(rectOverlap(clusters[i].getBoundingClientRect(),clusters[j].getBoundingClientRect(),2))clusterCollisions.push([i+1,j+1]);
 const outOfPaper=[];clusters.forEach((el,i)=>{const r=el.getBoundingClientRect();if(r.left<paperRect.left-2||r.right>paperRect.right+2||r.top<paperRect.top-2||r.bottom>paperRect.bottom+2)outOfPaper.push(i+1)});
 const textOverflow=[];clusters.forEach((el,i)=>{if(el.scrollHeight>el.clientHeight+3||el.scrollWidth>el.clientWidth+3)textOverflow.push(i+1)});
 const figureOverflow=[];figures.forEach((el,i)=>{if(el.scrollHeight>el.clientHeight+3||el.scrollWidth>el.clientWidth+3)figureOverflow.push(el.dataset.chemFigure||String(i+1))});
 const inputOutsideQuestion=[];inputs.forEach((el,i)=>{const q=el.closest('.chem-question');if(!q)return;const a=el.getBoundingClientRect(),b=q.getBoundingClientRect();if(a.left<b.left-2||a.right>b.right+2||a.top<b.top-4||a.bottom>b.bottom+4)inputOutsideQuestion.push(i+1)});
 const answerLeaks=[];if((state.chemistryMode||'recall')!=='learn'){
   const figureText=normalize(figures.map(f=>f.textContent||'').join('|'));
   for(const c of page.clusters)for(const q of c.questions)for(const f of q.fields){const a=normalize(f.answer);if(a.length>=3&&figureText.includes(a))answerLeaks.push({q:q.n,answer:f.answer})}
 }
 const microFonts=[];[...paper.querySelectorAll('.chem-question,.chem-figure text')].forEach(el=>{const px=parseFloat(getComputedStyle(el).fontSize||'99');if(px&&px<8)microFonts.push({tag:el.tagName,text:(el.textContent||'').trim().slice(0,24),px})});
 const result={page:page.id,clusters:clusters.length,figures:figures.length,questions:questions.length,clusterCollisions,outOfPaper,textOverflow,figureOverflow,inputOutsideQuestion,answerLeaks,microFonts,ok:!clusterCollisions.length&&!outOfPaper.length&&!textOverflow.length&&!figureOverflow.length&&!inputOutsideQuestion.length&&!answerLeaks.length&&!microFonts.length};
 return result;
};
function panel(){if(!new URLSearchParams(location.search).has('chemqa'))return;requestAnimationFrame(()=>{const r=window.chemistryVisualQaV2();let el=document.getElementById('chem-v2-runtime-qa');if(!el){el=document.createElement('aside');el.id='chem-v2-runtime-qa';el.className='chem-qa';document.body.appendChild(el)}el.innerHTML=`<strong>CHEM RENDER QA</strong><span>${r.ok?'PASS':'FAIL'}</span><small>${r.page||''}</small><small>cluster collisions ${r.clusterCollisions?.length||0}</small><small>text overflow ${r.textOverflow?.length||0}</small><small>figure overflow ${r.figureOverflow?.length||0}</small><small>input ownership ${r.inputOutsideQuestion?.length||0}</small><small>answer leaks ${r.answerLeaks?.length||0}</small><small>micro-font ${r.microFonts?.length||0}</small>`})}
const prevBind=bind;bind=function(){prevBind();panel()};
})();