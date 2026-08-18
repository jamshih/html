// Wrong Book shell + radial map regression hotfix.
// Restores persistent navigation / 正確敘述 and hardens pen + radial readability.
(function(){
  const VERSION='2026-08-18-shell-map-hotfix-v1';
  if(window.__wrongbookShellMapHotfix===VERSION)return;
  window.__wrongbookShellMapHotfix=VERSION;

  const escHtml=(value='')=>typeof esc==='function'?esc(String(value)):String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function ensureStyles(){
    if(document.getElementById('wb-shell-map-hotfix-style'))return;
    const style=document.createElement('style');
    style.id='wb-shell-map-hotfix-style';
    style.textContent=`
      /* persistent shell navigation */
      .wb-persistent-nav{display:none}
      .wb-truths-page .subject-tabs{margin:4px 0 18px}
      .wb-truth-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:13px}
      .wb-truth-card{padding:16px;position:relative}
      .wb-truth-card .truth-corrected{font-size:16px;line-height:1.65;margin:12px 0;color:#25352c}
      .wb-truth-card .truth-corrected strong{color:#278a59;margin-right:4px}
      .wb-truth-card .truth-original{font-size:12px;color:var(--muted);line-height:1.55;padding-top:10px;border-top:1px dashed var(--line)}
      .wb-truth-card .note-footer{margin-top:12px;display:flex;justify-content:space-between;align-items:center;gap:8px}
      .wb-truth-empty{padding:34px 18px;text-align:center;color:var(--muted)}
      .wb-truth-empty strong{display:block;color:var(--ink);font-size:17px;margin-bottom:7px}

      /* radial map readability */
      .wbmm-wrap .node.root text{font-size:26px!important;font-weight:800!important}
      .wbmm-wrap .node.depth1 text{font-size:22px!important;font-weight:800!important}
      .wbmm-wrap .node.depth2 text{font-size:19px!important;font-weight:700!important}
      .wbmm-wrap .node.depth3 text{font-size:16px!important;font-weight:550!important}
      .wbmm-wrap .node text{stroke-width:4px!important}
      .wbmm-wrap.is-drawing #mmSvg{cursor:crosshair!important}
      .wbmm-wrap.is-drawing .node{pointer-events:none}
      .wbmm-wrap .ink-stroke{stroke-width:4px!important}

      @media(min-width:861px){
        .sidebar{display:flex!important}
        .app-shell{display:grid!important;grid-template-columns:var(--sidebar) minmax(0,1fr)!important}
      }
      @media(max-width:860px){
        .content{padding-bottom:104px!important}
        .mobile-nav.wb-persistent-nav{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;z-index:240!important}
        .mobile-nav.wb-persistent-nav button{min-width:0;padding:4px 1px!important}
        .mobile-nav.wb-persistent-nav button span{font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
        .mobile-drawer{z-index:300!important}
        .wbmm-wrap{height:calc(100dvh - 70px)!important;min-height:520px!important}
        .wbmm-wrap .node.root text{font-size:29px!important}
        .wbmm-wrap .node.depth1 text{font-size:24px!important}
        .wbmm-wrap .node.depth2 text{font-size:21px!important}
        .wbmm-wrap .node.depth3 text{font-size:18px!important}
      }
      @media(max-width:430px){
        .mobile-nav.wb-persistent-nav button svg{width:18px;height:18px}
        .mobile-nav.wb-persistent-nav button span{font-size:8px}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureTruthNav(){
    try{
      if(Array.isArray(NAV)&&!NAV.some(item=>item?.[0]==='truths')){
        const reviewIndex=NAV.findIndex(item=>item?.[0]==='review');
        NAV.splice(reviewIndex>=0?reviewIndex+1:Math.min(5,NAV.length),0,['truths','正確敘述','spark']);
      }
    }catch(e){}
  }

  function truthRows(subjectId){
    const out=[],seen=new Set();
    for(const t of (Array.isArray(state?.truths)?state.truths:[])){
      const p=t?.problemId&&typeof problemById==='function'?problemById(t.problemId):null;
      const subject=String(t?.subject||p?.subject||'');
      const corrected=String(t?.corrected||'').trim();
      if(subjectId&&subject!==subjectId)continue;
      if(!corrected)continue;
      const key=`${subject}|${t?.problemId||''}|${corrected}`;
      if(seen.has(key))continue;
      seen.add(key);
      out.push({
        id:String(t?.id||key),problemId:String(t?.problemId||p?.id||''),subject,
        concept:String(t?.concept||p?.concept||''),title:String(p?.title||t?.concept||'正確敘述'),
        corrected,original:String(t?.original||'').trim(),due:String(t?.due||''),
        mastery:Number.isFinite(Number(t?.mastery))?Number(t.mastery):null,createdAt:String(t?.createdAt||'')
      });
    }
    return out.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  }

  function truthsPage(){
    const subjectId=String(state.subject||'');
    const subject=typeof subjectById==='function'?subjectById(subjectId):null;
    const rows=truthRows(subjectId),all=truthRows('');
    const tabs=Array.isArray(SUBJECTS)?SUBJECTS.map(s=>`<button class="subject-tab ${s.id===subjectId?'active':''}" data-subject="${escHtml(s.id)}" style="${typeof subjectStyle==='function'?subjectStyle(s.id):''}"><span class="subject-symbol">${escHtml(s.symbol||'•')}</span>${escHtml(s.name)}</button>`).join(''):'';
    const cards=rows.length?rows.map(t=>{
      const meta=[t.mastery!==null?`掌握 ${Math.round(t.mastery)}%`:'',t.due?`下次 ${t.due}`:''].filter(Boolean).join(' · ');
      return `<section class="panel wb-truth-card" style="${typeof subjectStyle==='function'?subjectStyle(t.subject):''}"><span class="tag">正確敘述${t.concept?' · '+escHtml(t.concept):''}</span><h4>${escHtml(t.title)}</h4><div class="truth-corrected"><strong>✓</strong>${escHtml(t.corrected)}</div>${t.original&&t.original!==t.corrected?`<div class="truth-original">原本敘述：${escHtml(t.original)}</div>`:''}<div class="note-footer">${t.problemId?`<button class="text-btn" data-problem="${escHtml(t.problemId)}">回原題</button>`:'<span></span>'}<div><span class="meta">${escHtml(meta)}</span><button class="text-btn" data-truth-delete="${escHtml(t.id)}">刪除</button></div></div></section>`;
    }).join(''):`<div class="panel wb-truth-empty"><strong>${escHtml(subject?.name||'這科')}還沒有正確敘述</strong><span>回到錯題修正錯誤敘述後，按「存入正確敘述庫」。之後會集中保留在這裡。</span><div style="margin-top:14px"><button class="primary-btn" data-page="notebook">去錯題本</button></div></div>`;
    return `<div class="content wb-truths-page"><div class="page-head"><div><span class="tw-badge">正確版本庫</span><h2>正確敘述</h2><p>不要複習錯的版本。這裡只保留你修正後、可以直接拿來回想的敘述。</p></div><div class="page-actions"><span class="meta">本科 ${rows.length} · 全部 ${all.length}</span></div></div><div class="subject-tabs">${tabs}</div><div class="wb-truth-grid">${cards}</div></div>`;
  }

  function installPageRoute(){
    if(typeof page!=='function'||window.__wbTruthRouteWrapped)return;
    window.__wbTruthRouteWrapped=true;
    const basePage=page;
    page=function(){return state?.page==='truths'?truthsPage():basePage()};
    try{window.page=page}catch(e){}
  }

  function installMobileNav(){
    if(typeof mobileNav!=='function'||window.__wbMobileNavWrapped)return;
    window.__wbMobileNavWrapped=true;
    mobileNav=function(){
      const items=[
        ['dashboard','首頁','home'],['notebook','錯題本','notebook'],['mindmap','心智圖','map'],
        ['review','複習','calendar'],['truths','正確敘述','spark'],['more','更多','menu']
      ];
      return `<nav class="mobile-nav wb-persistent-nav" aria-label="主要導覽">${items.map(([id,label,ic])=>id==='more'?`<button data-action="toggleMenu" aria-label="更多功能">${typeof icon==='function'?icon(ic):''}<span>${label}</span></button>`:`<button class="${state.page===id?'active':''}" data-page="${id}">${typeof icon==='function'?icon(ic):''}<span>${label}</span></button>`).join('')}</nav>`;
    };
    try{window.mobileNav=mobileNav}catch(e){}
  }

  function saveTruthsFromCurrentProblem(event){
    if(!event.currentTarget?.matches?.('[data-action="saveTruths"]'))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const p=typeof selectedProblem==='function'?selectedProblem():null;
    if(!p)return typeof toast==='function'&&toast('先選一題錯題');
    const corrections={...(p.corrections||{})};
    document.querySelectorAll('[data-correction]').forEach(el=>{
      const label=String(el.dataset.correction||'').trim();
      const value=String(el.value||'').trim();
      if(label&&value)corrections[label]=value;
    });
    const existing=Array.isArray(state.truths)?state.truths:(state.truths=[]);
    let added=0;
    for(const [label,raw] of Object.entries(corrections)){
      const corrected=String(raw||'').trim();
      if(!corrected)continue;
      const original=String((p.options||[]).find(o=>String(o?.[0]||'')===String(label))?.[1]||'').trim();
      const duplicate=existing.some(t=>String(t?.problemId||'')===String(p.id)&&String(t?.corrected||'').trim()===corrected);
      if(duplicate)continue;
      existing.push({id:typeof uid==='function'?uid('truth'):`truth-${Date.now()}-${added}`,problemId:p.id,subject:p.subject,concept:p.concept||'',original,corrected,mastery:45,due:'今天',createdAt:new Date().toISOString()});
      added++;
    }
    p.corrections=corrections;
    if(typeof save==='function')save();
    if(typeof toast==='function')toast(added?`已存入 ${added} 則正確敘述`:'沒有新的正確敘述可存');
  }

  function graphPoint(svg,event){
    if(typeof d3==='undefined')return [event.clientX,event.clientY];
    const [sx,sy]=d3.pointer(event,svg),transform=d3.zoomTransform(svg);
    return transform.invert([sx,sy]);
  }

  function installPenRuntime(){
    if(state?.page!=='mindmap'||typeof d3==='undefined')return;
    const svg=document.getElementById('mmSvg'),wrap=document.getElementById('mmWrap'),btn=document.getElementById('mmDraw');
    if(!svg||!wrap||!btn||svg.dataset.penHotfix===VERSION)return;
    svg.dataset.penHotfix=VERSION;
    let current=null,path=null;
    const subjectId=String(state.subject||'');
    const strokes=()=>{state.mindMapInk=state.mindMapInk&&typeof state.mindMapInk==='object'?state.mindMapInk:{};if(!Array.isArray(state.mindMapInk[subjectId]))state.mindMapInk[subjectId]=[];return state.mindMapInk[subjectId]};
    const line=d3.line().x(p=>p[0]).y(p=>p[1]).curve(d3.curveCatmullRom.alpha(.45));
    const layer=()=>d3.select(svg).select('.ink-layer');
    const drawing=()=>btn.getAttribute('aria-pressed')==='true'||wrap.classList.contains('is-drawing');
    const syncButtons=()=>{const has=strokes().length>0;['mmUndo','mmClearInk','mmAiCheck'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=!has})};

    function down(e){
      if(!drawing()||(e.pointerType==='mouse'&&e.button!==0))return;
      e.preventDefault();e.stopImmediatePropagation();
      const point=graphPoint(svg,e);
      current={id:`ink-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,points:[point]};
      strokes().push(current);
      path=layer().append('path').datum(current).attr('class','ink-stroke live').attr('d',line(current.points));
      try{svg.setPointerCapture(e.pointerId)}catch(err){}
      syncButtons();
    }
    function move(e){
      if(!current)return;
      e.preventDefault();e.stopImmediatePropagation();
      const p=graphPoint(svg,e),last=current.points[current.points.length-1];
      if(!last||Math.hypot(p[0]-last[0],p[1]-last[1])>0.8)current.points.push(p);
      path?.attr('d',line(current.points));
    }
    function up(e){
      if(!current)return;
      e.preventDefault();e.stopImmediatePropagation();
      if(current.points.length<2)current.points.push([current.points[0][0]+.2,current.points[0][1]+.2]);
      path?.classed('live',false).attr('d',line(current.points));
      current=null;path=null;
      if(typeof save==='function')save();
      try{svg.releasePointerCapture(e.pointerId)}catch(err){}
      syncButtons();
    }
    svg.addEventListener('pointerdown',down,true);
    svg.addEventListener('pointermove',move,true);
    svg.addEventListener('pointerup',up,true);
    svg.addEventListener('pointercancel',up,true);
    syncButtons();
  }

  function enlargeMapAndFit(){
    if(state?.page!=='mindmap'||typeof d3==='undefined')return false;
    const svg=document.getElementById('mmSvg');
    if(!svg)return false;
    svg.querySelectorAll('g.node').forEach(node=>{
      let depth=Number(node.__data__?.depth);
      if(!Number.isFinite(depth)){depth=node.classList.contains('root')?0:node.classList.contains('depth1')?1:node.classList.contains('depth2')?2:3}
      const circle=node.querySelector('circle');
      if(circle)circle.setAttribute('r',depth===0?'12':depth===1?'10':depth===2?'8':'6');
    });
    const layer=svg.querySelector('.node-layer'),world=svg.querySelector(':scope > g');
    if(!layer||!world)return true;
    let bbox;try{bbox=layer.getBBox()}catch(e){return true}
    const w=svg.clientWidth,h=svg.clientHeight;
    if(!bbox?.width||!bbox?.height||!w||!h)return true;
    const natural=Math.min(w/bbox.width,h/bbox.height,1)*.84;
    const minReadable=w<=520?.50:w<=860?.54:w<=1180?.58:.62;
    const scale=Math.max(minReadable,Math.min(1,natural));
    const tx=w/2-(bbox.x+bbox.width/2)*scale;
    const ty=h/2-(bbox.y+bbox.height/2)*scale;
    const transform=d3.zoomIdentity.translate(tx,ty).scale(scale);
    svg.__zoom=transform;
    world.setAttribute('transform',transform.toString());
    return true;
  }

  function bindHotfix(){
    ensureTruthNav();ensureStyles();installPageRoute();installMobileNav();
    const saveBtn=document.querySelector('[data-action="saveTruths"]');
    if(saveBtn&&!saveBtn.dataset.truthSaveHotfix){saveBtn.dataset.truthSaveHotfix=VERSION;saveBtn.addEventListener('click',saveTruthsFromCurrentProblem,true)}
    document.querySelectorAll('[data-truth-delete]').forEach(el=>el.addEventListener('click',()=>{
      const id=String(el.dataset.truthDelete||'');
      state.truths=(Array.isArray(state.truths)?state.truths:[]).filter(t=>String(t?.id||'')!==id);
      if(typeof save==='function')save();
      if(typeof render==='function')render();
    }));
    installPenRuntime();
    if(state?.page==='mindmap'){
      setTimeout(enlargeMapAndFit,720);
      document.getElementById('mmSvg')?.addEventListener('click',e=>{if(e.target.closest?.('.node'))setTimeout(enlargeMapAndFit,640)},true);
      ['mmExpandAll','mmCollapseAll','mmReset'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>setTimeout(enlargeMapAndFit,720)));
    }
  }

  ensureStyles();ensureTruthNav();installPageRoute();installMobileNav();
  if(typeof bind==='function'&&!window.__wbShellMapBindWrapped){
    window.__wbShellMapBindWrapped=true;
    const baseBind=bind;
    bind=function(){baseBind();bindHotfix()};
    try{window.bind=bind}catch(e){}
  }
  window.WrongBookShellMapHotfix={version:VERSION,bindHotfix,truthsPage,enlargeMapAndFit};
  try{render()}catch(e){setTimeout(bindHotfix,0)}
})();
