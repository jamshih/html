// Wrongbook: Search Recall-style 20-card quick check for first-class corrected truths.
(function(){
  const VERSION='2026-08-18-truth-quick-check-v1';
  if(window.__wrongbookTruthQuickCheck===VERSION)return;
  window.__wrongbookTruthQuickCheck=VERSION;
  if(typeof notesPage!=='function'||typeof bind!=='function')return;

  const BATCH_SIZE=20;
  const baseNotesPage=notesPage;
  const baseBind=bind;
  let session=null;

  function resolveTruth(t){
    const p=t?.problemId&&typeof problemById==='function'?problemById(t.problemId):null;
    return {
      raw:t,
      id:String(t?.id||''),
      problemId:String(t?.problemId||p?.id||''),
      subject:t?.subject||p?.subject||state.subject,
      concept:t?.concept||p?.concept||'',
      title:p?.title||t?.concept||'正確敘述',
      original:String(t?.original||'').trim(),
      corrected:String(t?.corrected||'').trim(),
      dueISO:String(t?.dueISO||''),
      due:String(t?.due||''),
      mastery:Number.isFinite(Number(t?.mastery))?Number(t.mastery):50,
      createdAt:String(t?.createdAt||'')
    };
  }

  function truthPool(subjectId=state.subject){
    const seen=new Set();
    const out=[];
    for(const raw of (Array.isArray(state.truths)?state.truths:[])){
      const t=resolveTruth(raw);
      if(t.subject!==subjectId||!t.corrected)continue;
      const key=t.id||[t.subject,t.problemId,t.corrected].join('|');
      if(seen.has(key))continue;
      seen.add(key);out.push(t);
    }
    return out;
  }

  function dueRank(t){
    const today=typeof v3DateISO==='function'?v3DateISO(0):new Date().toISOString().slice(0,10);
    if(t.dueISO&&t.dueISO<=today)return 0;
    if(t.due==='今天')return 0;
    if(t.due==='明天')return 1;
    return 2;
  }

  function buildBatch(subjectId=state.subject,excludeIds=[]){
    const exclude=new Set(excludeIds||[]);
    return truthPool(subjectId)
      .filter(t=>!exclude.has(t.id))
      .sort((a,b)=>dueRank(a)-dueRank(b)||a.mastery-b.mastery||a.createdAt.localeCompare(b.createdAt)||a.corrected.localeCompare(b.corrected,'zh-Hant'))
      .slice(0,BATCH_SIZE);
  }

  function quickButtonLabel(){
    const count=Math.min(BATCH_SIZE,truthPool(state.subject).length);
    return count?`快速測驗 ${count} 句`:'快速測驗';
  }

  notesPage=function(){
    const html=baseNotesPage();
    const needle='<div class="section-title" style="margin-top:22px"><h3>正確敘述庫</h3>';
    if(!html.includes(needle)||html.includes('data-action="truthQuickStart"'))return html;
    const replacement='<div class="section-title truth-library-title" style="margin-top:22px"><h3>正確敘述庫</h3><button class="soft-btn truth-quick-start" data-action="truthQuickStart">'+esc(quickButtonLabel())+'</button>';
    return html.replace(needle,replacement);
  };
  try{window.notesPage=notesPage}catch(e){}

  function sessionMarkup(){
    if(!session)return'';
    if(session.done)return summaryMarkup();
    const t=session.cards[session.index];
    if(!t)return summaryMarkup();
    const current=session.index+1,total=session.cards.length;
    const pct=Math.round((session.index/Math.max(1,total))*100);
    const hasWrongCue=t.original&&t.original!==t.corrected;
    const cueLabel=hasWrongCue?'把這句改成正確版本':'先回想這個概念的正確敘述';
    const cue=hasWrongCue?t.original:(t.concept||t.title);
    const reveal=session.revealed?`<div class="tqc-answer"><span>正確敘述</span><p>${esc(t.corrected)}</p></div>`:'';
    const actions=session.revealed?`<div class="tqc-rate"><button class="tqc-rate-btn unfamiliar" data-tqc-rate="unfamiliar"><span>←</span><strong>不熟</strong><small>很難自己完整說出來</small></button><button class="tqc-rate-btn familiar" data-tqc-rate="familiar"><strong>熟悉</strong><small>翻面前就能完整回想</small><span>→</span></button></div><div class="tqc-swipe-hint">手機也可以左滑「不熟」、右滑「熟悉」</div>`:`<button class="primary-btn tqc-reveal" data-tqc-reveal>看正確敘述</button>`;
    return `<div class="tqc-shell" role="dialog" aria-modal="true" aria-label="正確敘述快速測驗"><div class="tqc-head"><div><strong>${esc(subjectById(t.subject).name)} · 正確敘述快速測驗</strong><small>${current} / ${total}</small></div><button class="icon-btn" data-tqc-close aria-label="關閉">×</button></div><div class="tqc-progress"><span style="width:${pct}%"></span></div><div class="tqc-body"><div class="tqc-card" data-tqc-card><div class="tqc-meta"><span>${esc(t.concept||'概念複習')}</span><span>${t.mastery?`掌握 ${Math.round(t.mastery)}%`:''}</span></div><div class="tqc-cue-label">${cueLabel}</div><div class="tqc-cue">${esc(cue)}</div>${reveal}</div>${actions}</div></div>`;
  }

  function summaryMarkup(){
    const total=session?.results.length||0;
    const familiar=session?.results.filter(x=>x.result==='familiar').length||0;
    const unfamiliar=total-familiar;
    const remaining=buildBatch(session.subject,session.seenIds).length;
    return `<div class="tqc-shell tqc-summary" role="dialog" aria-modal="true" aria-label="快速測驗結果"><div class="tqc-head"><div><strong>快速測驗完成</strong><small>${esc(subjectById(session.subject).name)}</small></div><button class="icon-btn" data-tqc-close aria-label="關閉">×</button></div><div class="tqc-body"><div class="tqc-summary-mark">✓</div><h2>已確認 ${total} 個正確敘述</h2><p>不是只看過一次；你剛剛先回想，再翻面核對。</p><div class="tqc-stats"><div><strong>${familiar}</strong><span>熟悉</span></div><div><strong>${unfamiliar}</strong><span>不熟</span></div></div><div class="tqc-summary-actions"><button class="soft-btn" data-tqc-close>完成</button><button class="primary-btn" data-tqc-more>${remaining?`再篩選 ${Math.min(BATCH_SIZE,remaining)} 個`:'再測一輪'}</button></div></div></div>`;
  }

  function mountSession(){
    let root=document.getElementById('truthQuickCheck');
    if(!root){root=document.createElement('div');root.id='truthQuickCheck';root.className='tqc-backdrop';document.body.appendChild(root)}
    root.innerHTML=sessionMarkup();
    bindSession(root);
  }

  function startQuickCheck({excludeIds=[]}={}){
    const cards=buildBatch(state.subject,excludeIds);
    if(!cards.length){
      const all=truthPool(state.subject);
      if(!all.length){toast('這科還沒有正確敘述可以測驗');return}
      return startQuickCheck({excludeIds:[]});
    }
    session={subject:state.subject,cards,index:0,revealed:false,results:[],seenIds:[...excludeIds],done:false};
    mountSession();
  }

  function revealCurrent(){if(!session||session.done)return;session.revealed=true;mountSession()}

  function applyRating(result){
    if(!session||session.done)return;
    const t=session.cards[session.index];if(!t)return;
    const raw=t.raw;
    const familiar=result==='familiar';
    raw.quickCheckHistory=Array.isArray(raw.quickCheckHistory)?raw.quickCheckHistory:[];
    raw.quickCheckHistory.push({at:new Date().toISOString(),result});raw.quickCheckHistory=raw.quickCheckHistory.slice(-60);
    raw.quickCheckStatus=result;raw.quickCheckedAt=new Date().toISOString();
    if(typeof v3Schedule==='function')v3Schedule(raw,familiar,'none');
    else{raw.mastery=clamp((Number(raw.mastery)||50)+(familiar?6:-6),10,99);raw.due=familiar?'3 天後':'明天'}
    session.results.push({id:t.id,result});session.seenIds.push(t.id);session.index++;session.revealed=false;
    if(session.index>=session.cards.length)session.done=true;
    save();mountSession();
  }

  function closeSession(){document.getElementById('truthQuickCheck')?.remove();session=null;try{render()}catch(e){}}

  function moreSession(){
    if(!session)return;
    const subject=session.subject,seen=[...session.seenIds];
    const next=buildBatch(subject,seen);
    session=null;
    if(next.length){state.subject=subject;startQuickCheck({excludeIds:seen})}
    else{state.subject=subject;startQuickCheck({excludeIds:[]})}
  }

  function bindSession(root){
    root.querySelectorAll('[data-tqc-close]').forEach(el=>el.addEventListener('click',closeSession));
    root.querySelector('[data-tqc-reveal]')?.addEventListener('click',revealCurrent);
    root.querySelectorAll('[data-tqc-rate]').forEach(el=>el.addEventListener('click',()=>applyRating(el.dataset.tqcRate)));
    root.querySelector('[data-tqc-more]')?.addEventListener('click',moreSession);
    const card=root.querySelector('[data-tqc-card]');
    if(card&&session?.revealed){
      let sx=0,sy=0,tracking=false;
      card.addEventListener('pointerdown',e=>{tracking=true;sx=e.clientX;sy=e.clientY;card.setPointerCapture?.(e.pointerId)});
      card.addEventListener('pointerup',e=>{if(!tracking)return;tracking=false;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>=70&&Math.abs(dx)>Math.abs(dy)*1.25)applyRating(dx>0?'familiar':'unfamiliar')});
    }
  }

  bind=function(){
    baseBind();
    document.querySelector('[data-action="truthQuickStart"]')?.addEventListener('click',()=>startQuickCheck());
  };
  try{window.bind=bind}catch(e){}

  window.wrongbookTruthQuickCheckQA=function(){
    const pool=truthPool(state.subject),batch=buildBatch(state.subject);
    const html=notesPage();
    const sample=batch[0]||null;
    return {
      version:VERSION,
      subject:state.subject,
      truthCount:pool.length,
      quickStartVisible:html.includes('data-action="truthQuickStart"'),
      usesFirstClassTruths:Array.isArray(state.truths),
      batchAtMost20:batch.length<=BATCH_SIZE,
      prioritizesDue:batch.length<2||dueRank(batch[0])<=dueRank(batch[batch.length-1]),
      revealBeforeRating:true,
      schedulerConnected:typeof v3Schedule==='function',
      sampleHasPrompt:Boolean(sample&&(sample.original!==sample.corrected?sample.original:(sample.concept||sample.title))),
      summaryLabels:['熟悉','不熟','再篩選'].every(x=>summaryMarkupForQA().includes(x))
    };
  };
  function summaryMarkupForQA(){
    const prev=session;session={subject:state.subject,cards:[],index:0,revealed:false,results:[{result:'familiar'},{result:'unfamiliar'}],seenIds:[],done:true};
    const html=summaryMarkup();session=prev;return html;
  }

  try{render()}catch(e){}
})();
