// Wrongbook V5 single-source-of-truth guard for answer presentation.
// The paper already preserves the student's historical/original answer. Once a problem is
// confirmed, do not repeat the same B/D state in a second disabled "答案辨識" card.
// The recognition card exists only during an unconfirmed scan/import, where it is actionable.
(function(){
  const VERSION='2026-08-17-answer-source-consistency-v5';
  if(window.__wrongbookAnswerSourceConsistency)return;
  window.__wrongbookAnswerSourceConsistency=VERSION;

  if(typeof recognitionPanel!=='function'){
    console.warn('[wrongbook] answer-source guard loaded before recognitionPanel');
    return;
  }

  const baseRecognitionPanel=recognitionPanel;
  recognitionPanel=function(p,labels,isScan){
    const awaitingConfirmation=Boolean(isScan && p && !p.confirmed);
    if(!awaitingConfirmation)return '';
    return baseRecognitionPanel.call(this,p,labels,true);
  };
  try{window.recognitionPanel=recognitionPanel}catch{}

  window.wrongbookAnswerSourceState=function(p=typeof selectedProblem==='function'?selectedProblem():null){
    const isScan=Boolean(p?.id&&String(p.id).startsWith('scan-'));
    return{
      version:VERSION,
      problemId:p?.id||'',
      confirmed:Boolean(p?.confirmed),
      recognitionVisible:Boolean(isScan&&p&&!p.confirmed),
      paperIsHistoricalAnswerSource:Boolean(p)
    };
  };
})();
