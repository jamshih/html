// Wrong Book V23 — final targeted polish for collapsed tutor, draggable AI diagrams, and canonical problem-statement typography.
(function(){
  const VERSION='2026-08-18-workspace-polish-v23';

  // Parameters first. V23 owns only these three requested presentation contracts.
  const PARAMS=Object.freeze({
    collapsed:Object.freeze({paddingY:8,paddingX:10,gapPx:10,titlePx:15}),
    problemStatement:Object.freeze({sizePx:20,lineHeight:1.7,fontFamily:'"Noto Serif TC","PingFang TC","Songti TC","STSong","PMingLiU",serif',weight:700}),
    diagram:Object.freeze({dragScope:'full-card',requireAllTextVisible:true})
  });

  if(window.__wrongbookWorkspacePolishV23===VERSION)return;
  window.__wrongbookWorkspacePolishV23=VERSION;
  window.__wrongbookWorkspacePolishV23Params=PARAMS;

  const STYLE_ID='wrongbookWorkspacePolishV23Style';
  document.getElementById(STYLE_ID)?.remove();
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    /* Closed means exactly one summary plus the existing V6 expand control. */
    html body .v5-tutor-dock.v6-tutor-collapsed{
      box-sizing:border-box!important;
      padding:${PARAMS.collapsed.paddingY}px ${PARAMS.collapsed.paddingX}px!important;
      gap:0!important;
      height:auto!important;
      min-height:0!important;
      max-height:none!important;
      overflow:hidden!important;
      overflow-x:hidden!important;
      overflow-y:hidden!important;
      scrollbar-width:none!important;
      -ms-overflow-style:none!important;
    }
    html body .v5-tutor-dock.v6-tutor-collapsed::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}
    html body .v5-tutor-dock.v6-tutor-collapsed>:not(.v6-tutor-collapse-bar){display:none!important}
    html body .v5-tutor-dock.v6-tutor-collapsed>.v6-tutor-collapse-bar{
      position:static!important;
      display:grid!important;
      grid-template-columns:minmax(0,1fr) auto!important;
      align-items:center!important;
      justify-content:stretch!important;
      gap:${PARAMS.collapsed.gapPx}px!important;
      width:100%!important;
      min-width:0!important;
      padding:0!important;
      margin:0!important;
      overflow:visible!important;
    }
    html body .v5-tutor-dock.v6-tutor-collapsed .v6-tutor-collapse-summary{
      display:block!important;
      min-width:0!important;
      margin:0!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
      white-space:nowrap!important;
      font-size:${PARAMS.collapsed.titlePx}px!important;
      line-height:1.25!important;
      font-weight:800!important;
    }
    html body .v5-tutor-dock.v6-tutor-collapsed .wb-v22-collapse-detail{display:none!important}
    html body .v5-tutor-dock.v6-tutor-collapsed .v6-tutor-collapse-button{
      display:grid!important;
      visibility:visible!important;
      opacity:1!important;
      pointer-events:auto!important;
    }

    /* One canonical problem-statement font contract across scan, OCR, paper and review renderers. */
    :root{
      --wb-problem-prompt-font-size:${PARAMS.problemStatement.sizePx}px;
      --wb-problem-prompt-line-height:${PARAMS.problemStatement.lineHeight};
      --wb-problem-prompt-font-family:${PARAMS.problemStatement.fontFamily};
    }
    .nqc-question-text,
    .ocrq-stem,
    .ocrq-prompt-text,
    .ocrq-native-fallback .prompt,
    .paper-demo h4,
    .problem-text,
    .pf-review-paper h2,
    .review-card h2,
    [data-wb-problem-prompt],
    .wb-problem-prompt{
      font-family:var(--wb-problem-prompt-font-family)!important;
      font-size:var(--wb-problem-prompt-font-size)!important;
      line-height:var(--wb-problem-prompt-line-height)!important;
      font-weight:${PARAMS.problemStatement.weight}!important;
      overflow-wrap:anywhere;
      word-break:normal;
    }

    /* The existing V5 Pointer Events engine owns motion; V23 only guarantees correct full-card scope. */
    .v8-ai-diagram[data-wb-ai-sticker-scope="full"],
    .v9-sheet-ai-card[data-wb-ai-sticker-scope="full"],
    [data-wb-dedicated-diagram="1"][data-wb-ai-sticker-scope="full"]{
      touch-action:none!important;
      cursor:grab!important;
    }
  `;
  document.head.appendChild(style);

  const WRITING='#paper,.paper,.v3-paper,[data-wb-writing-surface],[data-wb-writing-paper]';
  const DIAGRAMS='.v8-ai-diagram,.v9-sheet-ai-card,[data-wb-dedicated-diagram="1"]';
  const norm=v=>String(v??'').replace(/\s+/g,' ').trim();
  const visible=el=>{if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0&&r.width>0&&r.height>0};

  function ensureCollapsedTutor(dock){
    if(!dock)return false;
    const bar=dock.querySelector(':scope > .v6-tutor-collapse-bar');
    const summary=bar?.querySelector('.v6-tutor-collapse-summary');
    const button=bar?.querySelector('.v6-tutor-collapse-button');
    if(!bar||!summary||!button)return false;
    const right=Boolean(dock.querySelector('.v5-tutor-stage-head .is-right'));
    if(right&&summary.textContent!=='AI 家教 · 目前方向正確')summary.textContent='AI 家教 · 目前方向正確';
    if(dock.classList.contains('v6-tutor-collapsed')){
      button.hidden=false;
      button.removeAttribute('hidden');
      button.setAttribute('aria-expanded','false');
      button.setAttribute('aria-label','展開 AI 家教');
      button.dataset.tooltip='展開 AI 家教';
      button.dataset.state='collapsed';
    }
    return true;
  }

  function writingRootFor(card){
    const root=card?.closest?.(WRITING)||null;
    return root&&root!==card?root:null;
  }

  function ensureDiagramDrag(card){
    if(!card||!writingRootFor(card))return false;
    if(card.dataset.wbAiStickerScope!=='full')card.dataset.wbAiStickerScope='full';
    if(card.dataset.wbAiDiagramScope!=='full')card.dataset.wbAiDiagramScope='full';
    card.dataset.wbV23DragScope='full-card';
    return true;
  }

  function scan(){
    document.querySelectorAll('.v5-tutor-dock').forEach(ensureCollapsedTutor);
    document.querySelectorAll(DIAGRAMS).forEach(ensureDiagramDrag);
  }

  let queued=false;
  const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;scan()})};
  function mount(){
    const root=document.getElementById('app')||document.body;
    if(!root)return setTimeout(mount,40);
    window.__wrongbookWorkspacePolishV23Observer?.disconnect?.();
    const observer=new MutationObserver(queue);
    observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-wb-ai-sticker-scope','data-v8-diagram','data-wb-dedicated-diagram']});
    window.__wrongbookWorkspacePolishV23Observer=observer;
    scan();
  }
  mount();

  window.runWrongbookWorkspacePolishV23QA=function(){
    scan();
    const dock=document.querySelector('.v5-tutor-dock');
    let collapsed={present:false,pass:true};
    if(dock){
      const bar=dock.querySelector(':scope > .v6-tutor-collapse-bar');
      const summary=bar?.querySelector('.v6-tutor-collapse-summary');
      const button=bar?.querySelector('.v6-tutor-collapse-button');
      const detail=bar?.querySelector('.wb-v22-collapse-detail');
      const isCollapsed=dock.classList.contains('v6-tutor-collapsed');
      const otherVisible=[...dock.children].filter(el=>el!==bar&&visible(el));
      collapsed={
        present:true,isCollapsed,
        title:norm(summary?.textContent),
        titleExact:!isCollapsed||norm(summary?.textContent)==='AI 家教 · 目前方向正確',
        detailHidden:!isCollapsed||!visible(detail),
        buttonVisible:!isCollapsed||visible(button),
        onlyTitleAndButton:!isCollapsed||(otherVisible.length===0&&!visible(detail)&&visible(summary)&&visible(button)),
        noScrollbar:!isCollapsed||(getComputedStyle(dock).overflowY==='hidden'&&dock.scrollHeight<=dock.clientHeight+1)
      };
      collapsed.pass=collapsed.titleExact&&collapsed.detailHidden&&collapsed.buttonVisible&&collapsed.onlyTitleAndButton&&collapsed.noScrollbar;
    }

    const statementSelectors=['.nqc-question-text','.ocrq-stem','.ocrq-prompt-text','.paper-demo h4','.problem-text','.pf-review-paper h2','.review-card h2','[data-wb-problem-prompt]','.wb-problem-prompt'];
    const statements=[...new Set(statementSelectors.flatMap(selector=>[...document.querySelectorAll(selector)]))].filter(visible);
    const statementChecks=statements.map(el=>{const s=getComputedStyle(el);return{selector:el.className||el.tagName,fontSize:parseFloat(s.fontSize),lineHeight:parseFloat(s.lineHeight),fontFamily:s.fontFamily,pass:Math.abs(parseFloat(s.fontSize)-PARAMS.problemStatement.sizePx)<.6&&Math.abs(parseFloat(s.lineHeight)-PARAMS.problemStatement.sizePx*PARAMS.problemStatement.lineHeight)<1.2&&s.fontFamily.includes('Noto Serif TC')}});
    const typography={count:statementChecks.length,checks:statementChecks,pass:statementChecks.every(x=>x.pass)};

    const diagrams=[...document.querySelectorAll(DIAGRAMS)].filter(card=>writingRootFor(card)).map(card=>{
      const svg=card.querySelector('svg');
      let allTextVisible=true;
      if(svg?.viewBox?.baseVal?.width){
        const vb=svg.viewBox.baseVal;
        allTextVisible=[...svg.querySelectorAll('text')].filter(visible).every(text=>{let b;try{b=text.getBBox()}catch{return true}return b.x>=vb.x-1&&b.y>=vb.y-1&&b.x+b.width<=vb.x+vb.width+1&&b.y+b.height<=vb.y+vb.height+1});
      }
      return{scope:card.dataset.wbAiStickerScope,upgraded:card.classList.contains('wb-ai-sticker-v5'),allTextVisible,pass:card.dataset.wbAiStickerScope==='full'&&card.classList.contains('wb-ai-sticker-v5')&&allTextVisible};
    });
    const diagram={count:diagrams.length,checks:diagrams,pass:diagrams.every(x=>x.pass)};
    const pass=collapsed.pass&&typography.pass&&diagram.pass;
    return{version:VERSION,params:PARAMS,collapsed,typography,diagram,pass};
  };
  setTimeout(()=>{window.__wrongbookWorkspacePolishV23QA=window.runWrongbookWorkspacePolishV23QA?.()},320);
})();
