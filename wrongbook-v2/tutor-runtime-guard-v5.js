// Prevent delayed replay callbacks from reviving an off-screen tutor animation after the
// student leaves the notebook/problem. This closes a real timer/RAF race found by stress QA.
(function(){
  if(typeof window.v3GuideReplay!=='function'||window.__v5TutorReplayGuard)return;
  window.__v5TutorReplayGuard=true;
  const base=window.v3GuideReplay;
  window.v3GuideReplay=function(){
    const inNotebook=window.state?.page==='notebook';
    const canvas=document.getElementById('aiGuideCanvas');
    const problem=typeof window.selectedProblem==='function'?window.selectedProblem():null;
    if(!inNotebook||!canvas||!problem){
      if(typeof window.v5CancelGuidePlayback==='function')window.v5CancelGuidePlayback();
      return false;
    }
    return base.apply(this,arguments);
  };
  try{v3GuideReplay=window.v3GuideReplay}catch{}
})();
