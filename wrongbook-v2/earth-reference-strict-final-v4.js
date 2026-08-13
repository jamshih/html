// Corrections made only after direct source-vs-render comparison of pages 242–245.
const v4StrictComparedPage=v4StrictPage;

function v4StrictRocketMotif(cls){
  return `<div class="v4strict-source-motif ${cls}" aria-hidden="true"><svg viewBox="0 0 120 100"><g transform="rotate(-18 60 55)"><path d="M26 55L68 26Q84 18 91 22Q96 29 87 43L57 73Z" fill="#e7e8e7" stroke="#555" stroke-width="3"/><circle cx="70" cy="42" r="9" fill="#6f95b5" stroke="#555" stroke-width="2"/><path d="M35 61L14 72L31 76M53 73L46 91L62 79" fill="#d45e45" stroke="#555" stroke-width="3"/><path d="M20 68L5 70M25 75L9 84" stroke="#e98b3e" stroke-width="5" stroke-linecap="round"/></g><circle cx="34" cy="25" r="15" fill="#fff" stroke="#555" stroke-width="3"/><path d="M24 24Q34 15 44 24" fill="#7a8790"/><circle cx="29" cy="25" r="2"/><circle cx="39" cy="25" r="2"/></svg></div>`;
}
function v4StrictHierarchyMotif(){
  return `<div class="v4strict-source-motif hierarchy245" aria-hidden="true"><svg viewBox="0 0 180 180"><circle cx="36" cy="138" r="18" fill="#8fa6aa" stroke="#53656b" stroke-width="3"/><path d="M23 138Q36 128 49 138M36 120V156" stroke="#e8eceb" stroke-width="2" fill="none"/><circle cx="97" cy="91" r="24" fill="#83a5bd" stroke="#4e7187" stroke-width="3"/><path d="M75 91Q97 77 119 91Q97 104 75 91" fill="#dbe8ef"/><path d="M58 143L82 111M108 70L134 44" stroke="#567ba4" stroke-width="6" stroke-linecap="round"/><path d="M132 45q18-20 30 0q-16 15-30 0Z" fill="#607da3"/></svg></div>`;
}
function v4StrictGeoOverlay(){
  return `<svg class="v4strict-geo-tree" viewBox="0 0 910 1270" aria-hidden="true"><path d="M110 150H145M145 150V105H175M145 150V198H175"/></svg><div class="v4strict-geo-root">地質年代</div><div class="v4strict-geo-child abs">絕對地質年代</div><div class="v4strict-geo-child rel">相對地質年代</div><svg class="v4strict-fossil-arrow" viewBox="0 0 910 160" aria-hidden="true"><path d="M40 92H812"/><polygon points="812,54 892,92 812,130"/></svg><div class="v4strict-era-label e1">古生代</div><div class="v4strict-era-label e2">中生代</div><div class="v4strict-era-label e3">新生代</div><div class="v4strict-era-label e4">現在</div><div class="v4strict-human">人類出現</div>`;
}

v4StrictPage=function(page,inner,extra=''){
  if(page===242)inner+=v4StrictRocketMotif('rocket242');
  if(page===243)inner+=v4StrictGeoOverlay();
  if(page===244)inner+=v4StrictRocketMotif('rocket244');
  if(page===245){
    inner=inner.replace('<path class="stair" d="M75 760 L210 695 L355 620 L500 545 L650 470 L790 395"/>','<path class="v4strict-stair-link" d="M92 755L200 705M230 690L340 635M370 620L485 565M515 550L635 495M665 480L780 420"/>');
    inner+=v4StrictHierarchyMotif();
  }
  return v4StrictComparedPage(page,inner,extra);
};

render();
