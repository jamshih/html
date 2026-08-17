// Wrong Book V11 — shuffled review options keep visual labels A, B, C... from top to bottom.
// Internal grading still uses the original source option label, so correctness is unchanged.
(function(){
  const VERSION='2026-08-17-review-shuffle-labels-v11b';
  if(window.__wrongbookReviewShuffleLabelsV11===VERSION)return;
  window.__wrongbookReviewShuffleLabelsV11=VERSION;

  if(document.documentElement.dataset.paperFirstLegacy==='1')return;

  function appState(){try{return typeof state!=='undefined'?state:(window.state||{})}catch{return window.state||{}}}
  function stableShuffle(source,seed){try{return typeof v3StableShuffle==='function'?v3StableShuffle(source,seed):[...source]}catch{return typeof window.v3StableShuffle==='function'?window.v3StableShuffle(source,seed):[...source]}}
  function answerEqual(a,b){try{return typeof sameAnswers==='function'?sameAnswers(a,b):[...a].sort().join('|')===[...b].sort().join('|')}catch{return[...a].sort().join('|')===[...b].sort().join('|')}}
  function subjectName(id){try{return typeof subjectById==='function'?subjectById(id).name:id}catch{return id}}

  function labelAt(index){
    if(index<26)return String.fromCharCode(65+index);
    return String(index+1);
  }

  function labeledOptions(p){
    const source=Array.isArray(p?.options)?p.options:[];
    const st=appState();
    const seed=`${p?.id||'review'}:${st.reviewShuffleSeed||'v3'}`;
    const shuffled=stableShuffle(source,seed);
    return shuffled.map(([sourceLabel,text],index)=>({sourceLabel:String(sourceLabel),text,displayLabel:labelAt(index),index}));
  }

  function displayAnswers(items,sourceAnswers=[]){
    const wanted=new Set((sourceAnswers||[]).map(String));
    return items.filter(item=>wanted.has(item.sourceLabel)).map(item=>item.displayLabel).join('');
  }

  function escHtml(value=''){
    try{if(typeof esc==='function')return esc(value)}catch{}
    return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  }

  function renderRedoProblem(p){
    const st=appState();
    const opts=labeledOptions(p);
    const selections=(st.reviewSelections||[]).map(String);
    const correct=(p?.correct||[]).map(String);
    const selectedSet=new Set(selections),correctSet=new Set(correct);
    const checked=Boolean(st.reviewChecked);
    const isCorrect=answerEqual(selections,correct);
    const userDisplay=displayAnswers(opts,selections)||'未作答';
    const correctDisplay=displayAnswers(opts,correct)||'—';

    return `<div style="max-width:760px;margin:0 auto" data-review-shuffle-v11="1">
      <div class="meta">${escHtml(subjectName(p.subject))} · ${escHtml(p.concept)} · 選項順序每輪會重新排列，題號依畫面由上而下重排</div>
      <h2 style="margin:7px 0 16px">${escHtml(p.problemText)}</h2>
      ${opts.length?opts.map(item=>{
        const sel=selectedSet.has(item.sourceLabel);
        let cl=sel?'selected':'';
        if(checked)cl=correctSet.has(item.sourceLabel)?'correct':sel?'incorrect':'';
        return `<button class="redo-option ${cl}" data-review-option="${escHtml(item.sourceLabel)}" data-review-source-option="${escHtml(item.sourceLabel)}" data-review-display-option="${escHtml(item.displayLabel)}" aria-label="選項 ${escHtml(item.displayLabel)}">
          <strong>${escHtml(item.displayLabel)}.</strong> ${escHtml(item.text)}
        </button>`;
      }).join(''):`<div class="callout">這題不是選擇題。請在原題工作紙重做，再讓 AI 讀你的作答核對步驟。</div>`}
      <div class="page-actions" style="justify-content:flex-end;margin-top:14px">
        <button class="soft-btn" data-action="reviewReset">清除</button>
        <button class="primary-btn" data-action="checkReview">提交答案</button>
      </div>
      ${checked?`<div class="callout ${isCorrect?'success':'warn'}" style="margin-top:16px">你的答案：<strong>${escHtml(userDisplay)}</strong> · 正確：<strong>${escHtml(correctDisplay)}</strong>。${isCorrect?`下一次：${escHtml(p.due)}`:'這題會更快排回來。'}</div>`:''}
    </div>`;
  }

  window.redoProblem=renderRedoProblem;
  try{redoProblem=renderRedoProblem}catch{}

  window.__wrongbookReviewShuffleV11={version:VERSION,labelAt,labeledOptions,displayAnswers};

  window.runWrongbookReviewShuffleLabelsQA=function(){
    const fixture={id:'qa-shuffle',options:[['A','alpha'],['B','beta'],['C','gamma'],['D','delta']]};
    const labeled=labeledOptions(fixture);
    const labels=labeled.map(x=>x.displayLabel);
    const sources=labeled.map(x=>x.sourceLabel);
    const sequential=labels.join('|')==='A|B|C|D';
    const sourcePreserved=[...sources].sort().join('|')==='A|B|C|D';
    const uniqueSources=new Set(sources).size===sources.length;
    const cDisplay=displayAnswers(labeled,['C']);
    const mappingCorrect=Boolean(cDisplay&&labeled.find(x=>x.sourceLabel==='C')?.displayLabel===cDisplay);

    const buttons=[...document.querySelectorAll('[data-review-shuffle-v11="1"] .redo-option')];
    const mounted=buttons.length>0;
    const domLabels=buttons.map((b,i)=>({
      display:b.dataset.reviewDisplayOption||'',
      source:b.dataset.reviewSourceOption||'',
      data:b.dataset.reviewOption||'',
      text:b.querySelector('strong')?.textContent?.trim().replace(/\.$/,'')||'',
      expected:labelAt(i)
    }));
    const domSequential=!mounted||domLabels.every(x=>x.display===x.expected&&x.text===x.expected);
    const internalSourceKept=!mounted||domLabels.every(x=>x.source&&x.source===x.data);
    const domUnique=!mounted||new Set(domLabels.map(x=>x.source)).size===domLabels.length;

    const st=appState();
    const selectedDomOk=!mounted||buttons.every(b=>b.classList.contains('selected')===(st.reviewSelections||[]).map(String).includes(b.dataset.reviewSourceOption))||Boolean(st.reviewChecked);
    const pass=sequential&&sourcePreserved&&uniqueSources&&mappingCorrect&&domSequential&&internalSourceKept&&domUnique&&selectedDomOk;
    return{pass,version:VERSION,mounted,sequential,sourcePreserved,uniqueSources,mappingCorrect,domSequential,internalSourceKept,domUnique,selectedDomOk,fixture:labeled.map(x=>`${x.displayLabel}->${x.sourceLabel}`),dom:domLabels};
  };

  function scheduleQA(tries=0){
    setTimeout(()=>{
      const r=window.runWrongbookReviewShuffleLabelsQA?.();
      window.__wrongbookReviewShuffleLabelsQA=r;
      if(r&&!r.pass)console.warn('[Wrongbook review shuffle-label QA failed]',r);
      if(!r?.mounted&&tries<8)setTimeout(()=>scheduleQA(tries+1),220);
    },120);
  }
  scheduleQA();
})();
