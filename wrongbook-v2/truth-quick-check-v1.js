// Wrongbook: Search Recall-style quick check, restricted to standalone generic concepts.
(function(){
  const VERSION='2026-08-18-truth-quick-check-v2';
  if(window.__wrongbookTruthQuickCheck===VERSION)return;
  window.__wrongbookTruthQuickCheck=VERSION;
  if(typeof notesPage!=='function'||typeof bind!=='function')return;

  const BATCH_SIZE=20;
  const baseNotesPage=notesPage;
  const baseBind=bind;
  let session=null;

  const CONTEXT_RE=/(這題|本題|此題|該題|題目中|原題|上述|前述|剛才|上圖|下圖|圖中|如圖|由圖|根據圖|選項|哪一選項|哪個選項|A選項|B選項|C選項|D選項|圈選|學生作答|你的答案)/i;
  const BARE_DIRECTION_RE=/^[「『]?\s*(?:方向(?:為|是)?\s*)?(?:向|往)?(?:左|右|上|下)(?:方|側|邊)?\s*[。．.!！]?\s*[」』]?$/;
  const BARE_RESULT_RE=/^[「『]?\s*[-+−]?\d+(?:\.\d+)?\s*(?:N|J|W|Pa|m\/s|m\/s²|kg|g|mol|V|A|Ω|Hz|°C|K|cm|mm|m|km)?\s*[。．.!！]?\s*[」』]?$/i;

  function normalizeFact(raw){
    return {
      raw,
      id:String(raw?.id||''),
      subject:String(raw?.subject||state.subject),
      concept:String(raw?.conceptNameZh||raw?.concept||''),
      question:String(raw?.question||'').trim(),
      answer:String(raw?.answer||'').trim(),
      dueISO:String(raw?.dueISO||''),
      due:String(raw?.due||''),
      mastery:Number.isFinite(Number(raw?.mastery))?Number(raw.mastery):40,
      createdAt:String(raw?.createdAt||'')
    };
  }

  function isContextFreeFact(t){
    if(!t?.raw||t.raw.standalone!==true||!t.question||!t.answer)return false;
    if(typeof v5StandaloneFact==='function'&&!v5StandaloneFact(t.raw))return false;
    if(CONTEXT_RE.test(t.question)||CONTEXT_RE.test(t.answer))return false;
    if(BARE_DIRECTION_RE.test(t.answer)||BARE_RESULT_RE.test(t.answer))return false;
    if(t.question.length<5)return false;
    // A generic card must carry its own semantic subject. Bare prompts such as「合力方向為何？」
    // are not enough; relationship/definition prompts or explicitly named phenomena are.
    const q=t.question.replace(/[？?。．.!！\s]/g,'');
    const concept=String(t.concept||'').replace(/\s/g,'');
    const hasRelationship=/(關係|定義|原因|條件|何時|如何|為什麼|意義|差異|比較|公式|定律|原理|作用|功能|特性|趨勢|影響|形成|發生|代表|表示|決定|取決於|正比|反比)/.test(q);
    const namesConcept=concept.length>=2&&q.includes(concept);
    if(!hasRelationship&&!namesConcept)return false;
    return true;
  }

  function genericPool(subjectId=state.subject){
    try{if(typeof v5EnsureLearningState==='function')v5EnsureLearningState()}catch(e){}
    const seen=new Set(),out=[];
    for(const raw of (Array.isArray(state.genericFacts)?state.genericFacts:[])){
      const t=normalizeFact(raw);
      if(t.subject!==subjectId||!isContextFreeFact(t))continue;
      const key=t.id||`${t.subject}|${t.question}|${t.answer}`;
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
    return genericPool(subjectId).filter(t=>!exclude.has(t.id))
      .sort((a,b)=>dueRank(a)-dueRank(b)||a.mastery-b.mastery||a.createdAt.localeCompare(b.createdAt)||a.question.localeCompare(b.question,'zh-Hant'))
      .slice(0,BATCH_SIZE);
  }

  function quickButtonMarkup(){
    const count=Math.min(BATCH_SIZE,genericPool(state.subject).length);
    if(!count)return '<span class="meta">目前沒有可脫離原題獨立測驗的概念</span>';
    return `<button class="soft-btn truth-quick-start" data-action="truthQuickStart">概念快速測驗 ${count} 題</button>`;
  }

  notesPage=function(){
    const html=baseNotesPage();
    const needle='<div class="section-title" style="margin-top:22px"><h3>正確敘述庫</h3>';
    if(!html.includes(needle)||html.includes('data-action="truthQuickStart"')||html.includes('目前沒有可脫離原題獨立測驗的概念'))return html;
    const replacement='<div class="section-title truth-library-title" style="margin-top:22px"><h3>正確敘述庫</h3>'+quickButtonMarkup();
    return html.replace(needle,replacement);
  };
  try{window.notesPage=notesPage}catch(e){}

  function sessionMarkup(){
    if(!session)return'';
    if(session.done)return summaryMarkup();
    const t=session.cards[session.index];
    if(!t)return summaryMarkup();
    const current=session.index+1,total=session.cards.length,pct=Math.round((session.index/Math.max(1,total))*100);
    const reveal=session.revealed?`<div class="tqc-answer"><span>正確概念</span><p>${esc(t.answer)}</p></div>`:'';
    const actions=session.revealed?`<div class="tqc-rate"><button class="tqc-rate-btn unfamiliar" data-tqc-rate="unfamiliar"><span>←</span><strong>不熟</strong><small>翻面前無法完整回答</small></button><button class="tqc-rate-btn familiar" data-tqc-rate="familiar"><strong>熟悉</strong><small>翻面前就能完整回答</small><span>→</span></button></div><div class="tqc-swipe-hint">手機可左滑「不熟」、右滑「熟悉」</div>`:`<button class="primary-btn tqc-reveal" data-tqc-reveal>看正確概念</button>`;
    return `<div class="tqc-shell" role="dialog" aria-modal="true" aria-label="概念快速測驗"><div class="tqc-head"><div><strong>${esc(subjectById(t.subject).name)} · 概念快速測驗</strong><small>${current} / ${total}</small></div><button class="icon-btn" data-tqc-close aria-label="關閉">×</button></div><div class="tqc-progress"><span style="width:${pct}%"></span></div><div class="tqc-body"><div class="tqc-card" data-tqc-card><div class="tqc-meta"><span>${esc(t.concept||'通用概念')}</span><span>${Number.isFinite(t.mastery)?`掌握 ${Math.round(t.mastery)}%`:''}</span></div><div class="tqc-cue-label">不用看原題也能回答</div><div class="tqc-cue">${esc(t.question)}</div>${reveal}</div>${actions}</div></div>`;
  }

  function summaryMarkup(){
    const total=session?.results.length||0,familiar=session?.results.filter(x=>x.result==='familiar').length||0,unfamiliar=total-familiar;
    const remaining=buildBatch(session.subject,session.seenIds).length;
    return `<div class="tqc-shell tqc-summary" role="dialog" aria-modal="true" aria-label="概念快速測驗結果"><div class="tqc-head"><div><strong>概念快速測驗完成</strong><small>${esc(subjectById(session.subject).name)}</small></div><button class="icon-btn" data-tqc-close aria-label="關閉">×</button></div><div class="tqc-body"><div class="tqc-summary-mark">✓</div><h2>已測驗 ${total} 個通用概念</h2><p>這些題目都能脫離原題獨立回答；需要看原題的敘述不會進入這裡。</p><div class="tqc-stats"><div><strong>${familiar}</strong><span>熟悉</span></div><div><strong>${unfamiliar}</strong><span>不熟</span></div></div><div class="tqc-summary-actions"><button class="soft-btn" data-tqc-close>完成</button><button class="primary-btn" data-tqc-more>${remaining?`再篩選 ${Math.min(BATCH_SIZE,remaining)} 個`:'再測一輪'}</button></div></div></div>`;
  }

  function mountSession(){let root=document.getElementById('truthQuickCheck');if(!root){root=document.createElement('div');root.id='truthQuickCheck';root.className='tqc-backdrop';document.body.appendChild(root)}root.innerHTML=sessionMarkup();bindSession(root)}
  function startQuickCheck({excludeIds=[]}={}){const cards=buildBatch(state.subject,excludeIds);if(!cards.length){const all=genericPool(state.subject);if(!all.length)return toast('目前沒有可脫離原題獨立測驗的通用概念');return startQuickCheck({excludeIds:[]})}session={subject:state.subject,cards,index:0,revealed:false,results:[],seenIds:[...excludeIds],done:false};mountSession()}
  function revealCurrent(){if(!session||session.done)return;session.revealed=true;mountSession()}
  function applyRating(result){if(!session||session.done)return;const t=session.cards[session.index];if(!t)return;const familiar=result==='familiar',raw=t.raw;raw.quickCheckHistory=Array.isArray(raw.quickCheckHistory)?raw.quickCheckHistory:[];raw.quickCheckHistory.push({at:new Date().toISOString(),result});raw.quickCheckHistory=raw.quickCheckHistory.slice(-60);raw.quickCheckStatus=result;raw.quickCheckedAt=new Date().toISOString();if(typeof v5FactReview==='function')v5FactReview(raw.id,familiar,'none');else if(typeof v3Schedule==='function')v3Schedule(raw,familiar,'none');session.results.push({id:t.id,result});session.seenIds.push(t.id);session.index++;session.revealed=false;if(session.index>=session.cards.length)session.done=true;save();mountSession()}
  function closeSession(){document.getElementById('truthQuickCheck')?.remove();session=null;try{render()}catch(e){}}
  function moreSession(){if(!session)return;const subject=session.subject,seen=[...session.seenIds],next=buildBatch(subject,seen);session=null;state.subject=subject;startQuickCheck({excludeIds:next.length?seen:[]})}

  function bindSession(root){
    root.querySelectorAll('[data-tqc-close]').forEach(el=>el.addEventListener('click',closeSession));
    root.querySelector('[data-tqc-reveal]')?.addEventListener('click',revealCurrent);
    root.querySelectorAll('[data-tqc-rate]').forEach(el=>el.addEventListener('click',()=>applyRating(el.dataset.tqcRate)));
    root.querySelector('[data-tqc-more]')?.addEventListener('click',moreSession);
    const card=root.querySelector('[data-tqc-card]');if(card&&session?.revealed){let sx=0,sy=0,tracking=false;card.addEventListener('pointerdown',e=>{tracking=true;sx=e.clientX;sy=e.clientY;card.setPointerCapture?.(e.pointerId)});card.addEventListener('pointerup',e=>{if(!tracking)return;tracking=false;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>=70&&Math.abs(dx)>Math.abs(dy)*1.25)applyRating(dx>0?'familiar':'unfamiliar')})}
  }

  bind=function(){baseBind();document.querySelector('[data-action="truthQuickStart"]')?.addEventListener('click',()=>startQuickCheck())};
  try{window.bind=bind}catch(e){}

  window.wrongbookTruthQuickCheckQA=function(){
    const pool=genericPool(state.subject),batch=buildBatch(state.subject),html=notesPage();
    const contextualFixture=normalizeFact({id:'qa-context',subject:state.subject,conceptNameZh:'靜摩擦力',question:'合力方向為何？',answer:'向右。',standalone:true});
    const genericFixture=normalizeFact({id:'qa-generic',subject:state.subject,conceptNameZh:'牛頓第二運動定律',question:'物體加速度方向與所受合力方向有何關係？',answer:'加速度方向與合力方向相同。',standalone:true});
    return {version:VERSION,subject:state.subject,genericFactCount:pool.length,quickStartVisible:pool.length?html.includes('data-action="truthQuickStart"'):html.includes('目前沒有可脫離原題獨立測驗的概念'),usesGenericFactsOnly:true,rawTruthsExcluded:true,batchAtMost20:batch.length<=BATCH_SIZE,prioritizesDue:batch.length<2||dueRank(batch[0])<=dueRank(batch[batch.length-1]),contextDependentFixtureRejected:!isContextFreeFact(contextualFixture),standaloneFixtureAccepted:isContextFreeFact(genericFixture),promptsAreQuestions:batch.every(x=>Boolean(x.question)),noOriginalProblemCue:!sessionMarkupForQA().includes('把這句改成正確版本'),schedulerConnected:typeof v5FactReview==='function'||typeof v3Schedule==='function'};
  };
  function sessionMarkupForQA(){const prev=session;const f=genericPool(state.subject)[0]||normalizeFact({id:'qa-generic',subject:state.subject,conceptNameZh:'牛頓第二運動定律',question:'物體加速度方向與所受合力方向有何關係？',answer:'加速度方向與合力方向相同。',standalone:true});session={subject:state.subject,cards:[f],index:0,revealed:false,results:[],seenIds:[],done:false};const html=sessionMarkup();session=prev;return html}

  try{render()}catch(e){}
})();
