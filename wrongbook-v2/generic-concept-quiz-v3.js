// Final runtime gate for Wrongbook quick review: ONLY standalone, context-free generic concepts.
// Loaded last with a unique filename so older cached truth-quiz code cannot own the click path.
(function(){
  const VERSION='2026-08-18-generic-concept-quiz-v3';
  if(window.__wrongbookGenericConceptQuizV3===VERSION)return;
  window.__wrongbookGenericConceptQuizV3=VERSION;
  if(typeof notesPage!=='function')return;

  const BATCH_SIZE=20;
  const baseNotesPage=notesPage;
  let session=null;

  const CONTEXT_RE=/(這題|本題|此題|該題|題目中|原題|上述|前述|剛才|上圖|下圖|圖中|如圖|由圖|根據圖|選項|哪一選項|哪個選項|A選項|B選項|C選項|D選項|圈選|學生作答|你的答案|題幹|此圖|該圖)/i;
  const BARE_DIRECTION_RE=/^[「『]?\s*(?:方向(?:為|是)?\s*)?(?:向|往)?(?:左|右|上|下)(?:方|側|邊)?\s*[。．.!！]?\s*[」』]?$/;
  const BARE_NUMBER_RE=/^[「『]?\s*[-+−]?\d+(?:\.\d+)?\s*(?:N|J|W|Pa|m\/s|m\/s²|kg|g|mol|V|A|Ω|Hz|°C|K|cm|mm|m|km|%)?\s*[。．.!！]?\s*[」』]?$/i;
  const GENERIC_REL_RE=/(關係|定義|原因|條件|何時|如何|為什麼|意義|差異|比較|公式|定律|原理|作用|功能|特性|趨勢|影響|形成|發生|代表|表示|決定|取決於|正比|反比|方向與|大小與|增加|減少|相同|相反)/;

  function norm(raw){
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

  function isStandalone(t){
    if(!t?.raw||t.raw.standalone!==true||!t.question||!t.answer)return false;
    if(CONTEXT_RE.test(t.question)||CONTEXT_RE.test(t.answer))return false;
    if(BARE_DIRECTION_RE.test(t.answer)||BARE_NUMBER_RE.test(t.answer))return false;
    if(t.question.length<7)return false;
    const q=t.question.replace(/[？?。．.!！\s]/g,'');
    const concept=t.concept.replace(/\s/g,'');
    const namesConcept=concept.length>=2&&q.includes(concept);
    const carriesRelation=GENERIC_REL_RE.test(q);
    if(!namesConcept&&!carriesRelation)return false;
    // Reject the exact failure class shown by the user: a direction/result that only makes sense
    // after seeing forces, geometry, numbers, a diagram, or a particular source question.
    if(/^(合力|摩擦力|加速度|速度|位移|電流|電壓|磁場|電場)?方向(?:為何|是什麼|如何)?[？?]?$/.test(q))return false;
    return true;
  }

  function pool(subjectId=state.subject){
    try{if(typeof v5EnsureLearningState==='function')v5EnsureLearningState()}catch(e){}
    const seen=new Set(),out=[];
    for(const raw of (Array.isArray(state.genericFacts)?state.genericFacts:[])){
      const t=norm(raw);
      if(t.subject!==subjectId||!isStandalone(t))continue;
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

  function batch(subjectId=state.subject,exclude=[]){
    const skip=new Set(exclude||[]);
    return pool(subjectId).filter(x=>!skip.has(x.id))
      .sort((a,b)=>dueRank(a)-dueRank(b)||a.mastery-b.mastery||a.createdAt.localeCompare(b.createdAt)||a.question.localeCompare(b.question,'zh-Hant'))
      .slice(0,BATCH_SIZE);
  }

  function launchControl(){
    const n=Math.min(BATCH_SIZE,pool(state.subject).length);
    return n
      ? `<button class="soft-btn truth-quick-start" data-action="genericConceptQuizStart">通用概念快篩 ${n} 題</button>`
      : '<span class="meta">目前沒有可脫離原題獨立作答的通用概念</span>';
  }

  function sanitizeLegacyControl(html){
    html=html.replace(/<button[^>]*data-action="truthQuickStart"[^>]*>[\s\S]*?<\/button>/g,'');
    html=html.replace(/<button[^>]*data-action="genericConceptQuizStart"[^>]*>[\s\S]*?<\/button>/g,'');
    html=html.replace(/<span class="meta">目前沒有可脫離原題獨立測驗的概念<\/span>/g,'');
    html=html.replace(/<span class="meta">目前沒有可脫離原題獨立作答的通用概念<\/span>/g,'');
    const re=/(<div class="section-title(?: truth-library-title)?" style="margin-top:22px"><h3>正確敘述庫<\/h3>)/;
    return re.test(html)?html.replace(re,`$1${launchControl()}`):html;
  }

  notesPage=function(){return sanitizeLegacyControl(baseNotesPage())};
  try{window.notesPage=notesPage}catch(e){}

  function cardHtml(){
    if(!session)return'';
    if(session.done)return summaryHtml();
    const t=session.cards[session.index];if(!t)return summaryHtml();
    const i=session.index+1,total=session.cards.length,pct=Math.round((session.index/Math.max(1,total))*100);
    const answer=session.revealed?`<div class="tqc-answer"><span>正確概念</span><p>${esc(t.answer)}</p></div>`:'';
    const actions=session.revealed
      ? `<div class="tqc-rate"><button class="tqc-rate-btn unfamiliar" data-gcq-rate="unfamiliar"><span>←</span><strong>不熟</strong><small>翻面前無法完整回答</small></button><button class="tqc-rate-btn familiar" data-gcq-rate="familiar"><strong>熟悉</strong><small>翻面前就能完整回答</small><span>→</span></button></div><div class="tqc-swipe-hint">手機可左滑「不熟」、右滑「熟悉」</div>`
      : '<button class="primary-btn tqc-reveal" data-gcq-reveal>看答案</button>';
    return `<div class="tqc-shell" role="dialog" aria-modal="true" aria-label="通用概念快篩"><div class="tqc-head"><div><strong>${esc(subjectById(t.subject).name)} · 通用概念快篩</strong><small>${i} / ${total}</small></div><button class="icon-btn" data-gcq-close aria-label="關閉">×</button></div><div class="tqc-progress"><span style="width:${pct}%"></span></div><div class="tqc-body"><div class="tqc-card" data-gcq-card><div class="tqc-meta"><span>${esc(t.concept||'通用概念')}</span><span>${Number.isFinite(t.mastery)?`掌握 ${Math.round(t.mastery)}%`:''}</span></div><div class="tqc-cue-label">不看原題也能回答</div><div class="tqc-cue">${esc(t.question)}</div>${answer}</div>${actions}</div></div>`;
  }

  function summaryHtml(){
    const total=session?.results.length||0,known=session?.results.filter(x=>x.result==='familiar').length||0,weak=total-known;
    const remaining=batch(session.subject,session.seenIds).length;
    return `<div class="tqc-shell tqc-summary" role="dialog" aria-modal="true" aria-label="通用概念快篩結果"><div class="tqc-head"><div><strong>通用概念快篩完成</strong><small>${esc(subjectById(session.subject).name)}</small></div><button class="icon-btn" data-gcq-close aria-label="關閉">×</button></div><div class="tqc-body"><div class="tqc-summary-mark">✓</div><h2>已測驗 ${total} 個通用概念</h2><p>需要依賴原題、圖形、特定數值或選項的敘述不會進入這裡。</p><div class="tqc-stats"><div><strong>${known}</strong><span>熟悉</span></div><div><strong>${weak}</strong><span>不熟</span></div></div><div class="tqc-summary-actions"><button class="soft-btn" data-gcq-close>完成</button><button class="primary-btn" data-gcq-more>${remaining?`再篩選 ${Math.min(BATCH_SIZE,remaining)} 個`:'再測一輪'}</button></div></div></div>`;
  }

  function mount(){
    document.getElementById('truthQuickCheck')?.remove();
    let root=document.getElementById('genericConceptQuiz');
    if(!root){root=document.createElement('div');root.id='genericConceptQuiz';root.className='tqc-backdrop';document.body.appendChild(root)}
    root.innerHTML=cardHtml();bindModal(root);
  }

  function start({exclude=[]}={}){
    document.getElementById('truthQuickCheck')?.remove();
    const cards=batch(state.subject,exclude);
    if(!cards.length){
      if(!pool(state.subject).length)return toast('目前沒有可脫離原題獨立作答的通用概念');
      return start({exclude:[]});
    }
    session={subject:state.subject,cards,index:0,revealed:false,results:[],seenIds:[...exclude],done:false};mount();
  }

  function reveal(){if(!session||session.done)return;session.revealed=true;mount()}
  function rate(result){
    if(!session||session.done)return;const t=session.cards[session.index];if(!t)return;
    const familiar=result==='familiar',raw=t.raw;
    raw.quickCheckHistory=Array.isArray(raw.quickCheckHistory)?raw.quickCheckHistory:[];
    raw.quickCheckHistory.push({at:new Date().toISOString(),result,source:'generic-concept-quiz-v3'});raw.quickCheckHistory=raw.quickCheckHistory.slice(-60);
    raw.quickCheckStatus=result;raw.quickCheckedAt=new Date().toISOString();
    if(typeof v5FactReview==='function')v5FactReview(raw.id,familiar,'none');else if(typeof v3Schedule==='function')v3Schedule(raw,familiar,'none');
    session.results.push({id:t.id,result});session.seenIds.push(t.id);session.index++;session.revealed=false;if(session.index>=session.cards.length)session.done=true;save();mount();
  }
  function close(){document.getElementById('genericConceptQuiz')?.remove();document.getElementById('truthQuickCheck')?.remove();session=null;try{render()}catch(e){}}
  function more(){if(!session)return;const subject=session.subject,seen=[...session.seenIds],hasMore=batch(subject,seen).length;session=null;state.subject=subject;start({exclude:hasMore?seen:[]})}

  function bindModal(root){
    root.querySelectorAll('[data-gcq-close]').forEach(x=>x.addEventListener('click',close));
    root.querySelector('[data-gcq-reveal]')?.addEventListener('click',reveal);
    root.querySelectorAll('[data-gcq-rate]').forEach(x=>x.addEventListener('click',()=>rate(x.dataset.gcqRate)));
    root.querySelector('[data-gcq-more]')?.addEventListener('click',more);
    const card=root.querySelector('[data-gcq-card]');if(card&&session?.revealed){let sx=0,sy=0,on=false;card.addEventListener('pointerdown',e=>{on=true;sx=e.clientX;sy=e.clientY;card.setPointerCapture?.(e.pointerId)});card.addEventListener('pointerup',e=>{if(!on)return;on=false;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>=70&&Math.abs(dx)>Math.abs(dy)*1.25)rate(dx>0?'familiar':'unfamiliar')})}
  }

  // Capture-phase delegation is deliberate. Even if an older cached quick-check module attached
  // a bubbling handler to the same button, this guard wins first and prevents the legacy modal.
  document.addEventListener('click',function(e){
    const btn=e.target?.closest?.('[data-action="genericConceptQuizStart"],[data-action="truthQuickStart"]');
    if(!btn)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();start();
  },true);

  window.wrongbookGenericConceptQuizQA=function(){
    const contextual=norm({id:'qa-bad',subject:state.subject,conceptNameZh:'靜摩擦力',question:'合力方向為何？',answer:'向右。',standalone:true});
    const generic=norm({id:'qa-good',subject:state.subject,conceptNameZh:'牛頓第二運動定律',question:'物體加速度方向與所受合力方向有何關係？',answer:'加速度方向與合力方向相同。',standalone:true});
    const html=notesPage(),p=pool(state.subject),b=batch(state.subject);
    return {version:VERSION,source:'state.genericFacts',rawTruthsEligible:false,contextualDirectionRejected:!isStandalone(contextual),selfContainedRelationAccepted:isStandalone(generic),poolAllStandalone:p.every(isStandalone),batchAtMost20:b.length<=20,legacyStartRemoved:!html.includes('data-action="truthQuickStart"'),newStartPresent:p.length?html.includes('data-action="genericConceptQuizStart"'):html.includes('目前沒有可脫離原題獨立作答的通用概念'),legacyModalRemoved:!document.getElementById('truthQuickCheck')};
  };

  document.getElementById('truthQuickCheck')?.remove();
  try{render()}catch(e){}
})();
