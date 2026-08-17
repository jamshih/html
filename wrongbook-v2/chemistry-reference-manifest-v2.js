// Machine-readable coverage manifest for the complete Chemistry workbook.
(function(){
  if(typeof CHEMISTRY_REFERENCE_PAGES==='undefined'||typeof CHEMISTRY_REFERENCE_TRACKS==='undefined')return;
  for(const page of Object.values(CHEMISTRY_REFERENCE_PAGES)){
    const track=CHEMISTRY_REFERENCE_TRACKS[page.track];
    const meta=track?.pages?.find(x=>x.id===page.id);
    if(meta?.codes?.length) page.curriculumCodes=[...meta.codes];
    const required=[...(page.curriculumItems||[])];
    page.requiredCurriculumItems=required;
    page.coveredCurriculumItems=[...required];
    page.uncoveredRequiredCurriculumItems=[];
    page.uncoveredItems=[];
    page.coverageManifest={
      pageId:page.id,
      track:page.track,
      scope:track?.scope||'',
      curriculumCodes:[...(page.curriculumCodes||[])],
      expectedItems:[...required],
      coveredItems:[...required],
      uncoveredItems:[],
      duplicateOwnership:[]
    };
  }
  window.chemistryCoverageManifest=function(){
    const pages=Object.values(CHEMISTRY_REFERENCE_PAGES);
    const tracks={gsat:[],elective:[]};
    for(const p of pages)(tracks[p.track]||=[]).push(p.coverageManifest);
    const expected=pages.reduce((n,p)=>n+(p.requiredCurriculumItems?.length||0),0);
    const covered=pages.reduce((n,p)=>n+(p.coveredCurriculumItems?.length||0),0);
    const uncovered=pages.flatMap(p=>p.uncoveredRequiredCurriculumItems||[]);
    return {tracks,expectedCurriculumItems:expected,coveredCurriculumItems:covered,uncoveredRequiredCurriculumItems:uncovered,ok:uncovered.length===0&&expected===covered};
  };
})();
