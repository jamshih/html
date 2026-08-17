// Wrongbook V5 single-source-of-truth guard for answer presentation.
// Confirmed problems must not show the same historical answer in multiple UI cards at once.
// The paper owns the historical/original answer; the answer-recognition card exists only while
// a new scan/import still needs the student's confirmation.
(function(){
  const VERSION='2026-08-17-answer-source-consistency-v5b';
  if(window.__wrongbookAnswerSourceConsistency)return;
  window.__wrongbookAnswerSourceConsistency=VERSION;

  function currentProblem(){
    try{return typeof selectedProblem==='function'?selectedProblem():null}catch{return null}
  }
  function awaitingAnswerConfirmation(p=currentProblem()){
    return Boolean(p?.id&&String(p.id).startsWith('scan-')&&!p.confirmed);
  }

  // Fix the source function when the legacy panel is used.
  if(typeof recognitionPanel==='function'){
    const baseRecognitionPanel=recognitionPanel;
    recognitionPanel=function(p,labels,isScan){
      if(!Boolean(isScan&&p&&!p.confirmed))return '';
      return baseRecognitionPanel.call(this,p,labels,true);
    };
    try{window.recognitionPanel=recognitionPanel}catch{}
  }

  // Runtime presentation layers can redefine problemWorkspace/recognitionPanel later. Enforce the
  // same product rule at the DOM boundary too, so a late render cannot revive a duplicate card.
  function enforceSingleAnswerSource(){
    const p=currentProblem();
    if(!p||awaitingAnswerConfirmation(p))return;

    // Remove any confirmed/read-only answer-recognition card. It duplicates what is already
    // preserved on the paper and is not actionable after confirmation.
    document.querySelectorAll('.recognition').forEach(rec=>rec.closest('section.panel')?.remove());
    document.querySelectorAll('section.panel').forEach(section=>{
      const title=section.querySelector('.panel-head h3,h3')?.textContent?.trim()||'';
      if(title.startsWith('答案辨識'))section.remove();
    });

    // Inside the paper, an MCQ original choice is already shown by the highlighted option/「原選」.
    // Do not repeat the same value again as a second 「我的答案：B」 line. Keep the note for
    // non-option/free-response problems where there is no highlighted option to carry the state.
    const paper=document.getElementById('paper');
    if(paper?.querySelector('.paper-option.student')){
      paper.querySelectorAll('.hand-note').forEach(note=>note.remove());
    }
  }

  let queued=false;
  function queueEnforce(){
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;enforceSingleAnswerSource()});
  }

  const app=document.getElementById('app');
  if(app&&typeof MutationObserver==='function'){
    const observer=new MutationObserver(queueEnforce);
    observer.observe(app,{subtree:true,childList:true});
    window.__wrongbookAnswerSourceObserver=observer;
  }
  document.addEventListener('DOMContentLoaded',queueEnforce,{once:true});
  queueEnforce();

  window.wrongbookAnswerSourceState=function(p=currentProblem()){
    const awaiting=awaitingAnswerConfirmation(p);
    return{
      version:VERSION,
      problemId:p?.id||'',
      confirmed:Boolean(p?.confirmed),
      awaitingConfirmation:awaiting,
      recognitionVisible:awaiting,
      paperIsHistoricalAnswerSource:Boolean(p)
    };
  };
})();
