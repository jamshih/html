// Wrong Book V22 — human-visible collapsed tutor + non-overlapping semantic diagram labels.
(function(){
  const VERSION='2026-08-18-human-visibility-v22.2';

  // Parameters first. This patch owns no other visual/product settings.
  const PARAMS=Object.freeze({
    collapsed:Object.freeze({paddingY:10,paddingX:12,rowGap:7,summaryFontPx:15,detailFontPx:13,detailGapPx:12,progressRadiusPx:8}),
    diagram:Object.freeze({
      viewBoxWidth:760,viewBoxHeight:380,coreShiftX:55,
      left:Object.freeze({x:18,centerY:150,width:170,minHeight:72,paddingY:13,textX:103,maxUnits:17,lineHeight:17}),
      core:Object.freeze({labelX:380,topLabelY:12,matrixLabelY:292,matrixMaxUnits:24,matrixLineHeight:18,footerY:362}),
      right:Object.freeze({x:622,maxUnits:12,lineHeight:17,innerSmallY:58,innerLabelY:82,interSmallY:206,interLabelY:230})
    })
  });

  if(window.__wrongbookHumanVisibilityV22===VERSION)return;
  window.__wrongbookHumanVisibilityV22=VERSION;
  window.__wrongbookHumanVisibilityV22Params=PARAMS;

  const style=document.createElement('style');
  document.getElementById('wrongbookHumanVisibilityV22Style')?.remove();
  style.id='wrongbookHumanVisibilityV22Style';
  style.textContent=`
    html body .v5-tutor-dock.v6-tutor-collapsed{box-sizing:border-box!important;padding:0!important;gap:0!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:hidden!important;overflow-x:hidden!important;overflow-y:hidden!important;overscroll-behavior:none!important;scrollbar-width:none!important;-ms-overflow-style:none!important}
    html body .v5-tutor-dock.v6-tutor-collapsed::-webkit-scrollbar,html body .v5-tutor-dock.v6-tutor-collapsed *::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}
    html body .v5-tutor-dock.v6-tutor-collapsed>:not(.v6-tutor-collapse-bar){display:none!important}
    html body .v5-tutor-dock.v6-tutor-collapsed>.v6-tutor-collapse-bar{position:static!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;align-items:start!important;justify-content:stretch!important;gap:${PARAMS.collapsed.rowGap}px!important;width:100%!important;min-width:0!important;padding:${PARAMS.collapsed.paddingY}px ${PARAMS.collapsed.paddingX}px!important;margin:0!important;cursor:pointer!important;background:inherit!important;overflow:hidden!important}
    html body .v5-tutor-dock.v6-tutor-collapsed .v6-tutor-collapse-summary{display:block!important;min-width:0!important;margin:0!important;overflow:visible!important;text-overflow:clip!important;white-space:normal!important;font-size:${PARAMS.collapsed.summaryFontPx}px!important;line-height:1.25!important;font-weight:800!important}
    html body .v5-tutor-dock.v6-tutor-collapsed .wb-v22-collapse-detail{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:6px ${PARAMS.collapsed.detailGapPx}px!important;min-width:0!important;margin:0!important;font-size:${PARAMS.collapsed.detailFontPx}px!important;line-height:1.25!important}
    html body .v5-tutor-dock.v6-tutor-collapsed .wb-v22-collapse-detail[hidden]{display:none!important}
    html body .v5-tutor-dock.v6-tutor-collapsed .wb-v22-collapse-progress{display:inline-flex!important;align-items:center!important;min-height:26px!important;box-sizing:border-box!important;padding:4px 8px!important;border-radius:${PARAMS.collapsed.progressRadiusPx}px!important;background:var(--surface-2,#F2F1EC)!important;color:var(--muted,#686A65)!important;font-weight:780!important;white-space:nowrap!important}
    html body .v5-tutor-dock.v6-tutor-collapsed .wb-v22-collapse-status{display:inline-flex!important;align-items:center!important;min-height:26px!important;color:#2F7D57!important;font-weight:800!important;white-space:nowrap!important}
    html body .v5-tutor-dock.v6-tutor-collapsed .v6-tutor-collapse-button{display:none!important}
    .v5-tutor-dock:not(.v6-tutor-collapsed) .wb-v22-collapse-detail{display:none!important}
    .v8-ai-diagram[data-v8-diagram="mitochondrion"] svg{display:block!important;width:100%!important;height:auto!important;max-height:none!important;overflow:visible!important}
  `;
  document.head.appendChild(style);

  const norm=v=>String(v??'').replace(/\s+/g,' ').trim();
  const visible=el=>{if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0&&r.width>0&&r.height>0};
  const overlaps=(a,b)=>!(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top);
  function session(){try{const p=typeof selectedProblem==='function'?selectedProblem():null;return p?(typeof v5TutorSession==='function'?v5TutorSession(p):window.state?.tutorSessions?.[p.id]):null}catch{return null}}
  function progress(dock){const s=session(),total=Array.isArray(s?.stages)?s.stages.length:0;if(total){const i=Math.max(0,Math.min(total-1,Math.trunc(Number(s.activeIndex)||0)));return{current:i+1,total}}const m=norm(dock.querySelector('.v5-tutor-stage-head>span')?.textContent).match(/(\d+)\s*\/\s*(\d+)/);return m?{current:+m[1]||1,total:+m[2]||1}:{current:1,total:1}}

  function applyTutor(dock){
    const bar=dock.querySelector(':scope > .v6-tutor-collapse-bar'),summary=bar?.querySelector('.v6-tutor-collapse-summary'),button=bar?.querySelector('.v6-tutor-collapse-button');
    if(!bar||!summary)return;
    let detail=bar.querySelector(':scope > .wb-v22-collapse-detail');
    if(!detail){detail=document.createElement('div');detail.className='wb-v22-collapse-detail';button?bar.insertBefore(detail,button):bar.appendChild(detail)}
    if(dock.querySelector('.v5-tutor-stage-head .is-right')){
      const x=progress(dock);summary.textContent='AI 家教 · 目前方向正確';detail.hidden=false;
      let p=detail.querySelector('.wb-v22-collapse-progress'),s=detail.querySelector('.wb-v22-collapse-status');
      if(!p){p=document.createElement('span');p.className='wb-v22-collapse-progress';detail.appendChild(p)}
      if(!s){s=document.createElement('span');s.className='wb-v22-collapse-status';detail.appendChild(s)}
      p.textContent=`提問 ${x.current}/${x.total}`;s.textContent='✓ 目前方向正確';
    }else detail.hidden=true;
    if(dock.classList.contains('v6-tutor-collapsed')){bar.dataset.wbV22Expand='1';bar.setAttribute('role','button');bar.tabIndex=0;bar.setAttribute('aria-label','展開 AI 家教');bar.setAttribute('aria-expanded','false')}
    else{delete bar.dataset.wbV22Expand;['role','tabindex','aria-label','aria-expanded'].forEach(a=>bar.removeAttribute(a))}
  }

  const NS='http://www.w3.org/2000/svg';
  const units=ch=>/\s/.test(ch)?.35:/[\u0000-\u00ff]/.test(ch)?.58:1;
  function wrap(v,max){const out=[];let line='',n=0;const flush=()=>{if(line){out.push(line.trimEnd());line='';n=0}};for(const ch of [...String(v??'').trim()]){if(ch==='\n'){flush();continue}const w=units(ch);if(line&&n+w>max)flush();line+=ch;n+=w}flush();return out.length?out:['']}
  function original(el){if(!el)return'';return el.dataset.wbV22OriginalText||(el.dataset.wbV22OriginalText=norm(el.textContent))}
  function lines(el,arr,x,y,anchor='start',lh=17){if(!el)return;const sig=JSON.stringify([arr,x,y,anchor,lh]);if(el.dataset.wbV22Layout===sig)return;el.textContent='';el.setAttribute('x',x);el.setAttribute('y',y);el.setAttribute('text-anchor',anchor);el.removeAttribute('transform');arr.forEach((v,i)=>{const t=document.createElementNS(NS,'tspan');t.setAttribute('x',x);t.setAttribute('dy',i?String(lh):'0');t.textContent=v;el.appendChild(t)});el.dataset.wbV22Layout=sig}
  function shift(el){if(el)el.setAttribute('transform',`translate(${PARAMS.diagram.coreShiftX} 0)`)}
  function patchMito(card){
    const svg=card.querySelector('svg');if(!svg)return;
    svg.setAttribute('viewBox',`0 0 ${PARAMS.diagram.viewBoxWidth} ${PARAMS.diagram.viewBoxHeight}`);svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.dataset.wbV22Fitted='1';
    ['.dg-shell','.dg-matrix','.dg-membrane','circle','.dg-cycle'].forEach(s=>svg.querySelectorAll(s).forEach(shift));
    const box=svg.querySelector('.dg-box'),labels=[...svg.querySelectorAll('text.dg-label')],smalls=[...svg.querySelectorAll('text.dg-small')],arrows=[...svg.querySelectorAll('path.dg-arrow:not(.wb-v22-matrix-leader)')];
    const [outside,matrix,inner,inter]=labels;
    if(box&&outside){const w=wrap(original(outside),PARAMS.diagram.left.maxUnits),h=Math.max(PARAMS.diagram.left.minHeight,PARAMS.diagram.left.paddingY*2+w.length*PARAMS.diagram.left.lineHeight),y=PARAMS.diagram.left.centerY-h/2;box.setAttribute('x',PARAMS.diagram.left.x);box.setAttribute('y',y);box.setAttribute('width',PARAMS.diagram.left.width);box.setAttribute('height',h);lines(outside,w,PARAMS.diagram.left.textX,y+PARAMS.diagram.left.paddingY+12,'middle',PARAMS.diagram.left.lineHeight)}
    if(arrows[0])arrows[0].setAttribute('d','M188 150 C196 150 201 150 207 150');
    if(matrix){lines(matrix,wrap(original(matrix),PARAMS.diagram.core.matrixMaxUnits),PARAMS.diagram.core.labelX,PARAMS.diagram.core.matrixLabelY,'middle',PARAMS.diagram.core.matrixLineHeight);let leader=svg.querySelector('.wb-v22-matrix-leader');if(!leader){leader=document.createElementNS(NS,'path');leader.setAttribute('class','dg-arrow wb-v22-matrix-leader');svg.appendChild(leader)}leader.setAttribute('d',`M${326+PARAMS.diagram.coreShiftX} 198 L${PARAMS.diagram.core.labelX} 276`);leader.setAttribute('fill','none')}
    if(inner)lines(inner,wrap(original(inner),PARAMS.diagram.right.maxUnits),PARAMS.diagram.right.x,PARAMS.diagram.right.innerLabelY,'start',PARAMS.diagram.right.lineHeight);
    if(inter)lines(inter,wrap(original(inter),PARAMS.diagram.right.maxUnits),PARAMS.diagram.right.x,PARAMS.diagram.right.interLabelY,'start',PARAMS.diagram.right.lineHeight);
    const core=smalls.find(x=>original(x).includes('粒線體基質')),innerS=smalls.find(x=>original(x).includes('粒線體內膜')),interS=smalls.find(x=>original(x).includes('膜間腔')),foot=smalls.find(x=>original(x).includes('位置關係示意圖'));
    if(core)lines(core,[original(core)],PARAMS.diagram.core.labelX,PARAMS.diagram.core.topLabelY,'middle',15);
    if(innerS)lines(innerS,wrap(original(innerS),PARAMS.diagram.right.maxUnits),PARAMS.diagram.right.x,PARAMS.diagram.right.innerSmallY,'start',15);
    if(interS)lines(interS,wrap(original(interS),PARAMS.diagram.right.maxUnits),PARAMS.diagram.right.x,PARAMS.diagram.right.interSmallY,'start',15);
    if(foot)lines(foot,[original(foot)],PARAMS.diagram.core.labelX,PARAMS.diagram.core.footerY,'middle',15);
    if(arrows[1])arrows[1].setAttribute('d',`M${476+PARAMS.diagram.coreShiftX} 91 L614 72`);if(arrows[2])arrows[2].setAttribute('d',`M${476+PARAMS.diagram.coreShiftX} 188 L614 211`);
  }
  function fitText(svg){const vb=svg?.viewBox?.baseVal;if(!vb?.width)return;let x=vb.x,y=vb.y,r=vb.x+vb.width,b=vb.y+vb.height;for(const t of svg.querySelectorAll('text')){let q;try{q=t.getBBox()}catch{continue}x=Math.min(x,q.x-12);y=Math.min(y,q.y-12);r=Math.max(r,q.x+q.width+12);b=Math.max(b,q.y+q.height+12)}svg.setAttribute('viewBox',`${x} ${y} ${r-x} ${b-y}`);svg.setAttribute('preserveAspectRatio','xMidYMid meet')}
  function applyDiagram(card){const svg=card.querySelector('svg');if(!svg)return;if(card.dataset.v8Diagram==='mitochondrion')patchMito(card);fitText(svg)}
  function apply(){document.querySelectorAll('.v5-tutor-dock').forEach(applyTutor);document.querySelectorAll('.v8-ai-diagram').forEach(applyDiagram)}

  document.addEventListener('click',e=>{const bar=e.target?.closest?.('.v6-tutor-collapse-bar[data-wb-v22-expand="1"]');if(!bar||e.target?.closest?.('.v6-tutor-collapse-button'))return;const dock=bar.closest('.v5-tutor-dock'),button=bar.querySelector('.v6-tutor-collapse-button');if(dock?.classList.contains('v6-tutor-collapsed')&&button){e.preventDefault();e.stopPropagation();button.click()}},true);
  document.addEventListener('keydown',e=>{const bar=e.target?.closest?.('.v6-tutor-collapse-bar[data-wb-v22-expand="1"]');if(bar&&['Enter',' '].includes(e.key)){const button=bar.querySelector('.v6-tutor-collapse-button');if(button){e.preventDefault();button.click()}}},true);

  let queued=false;const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})};
  function mount(){const root=document.getElementById('app')||document.body;if(!root)return setTimeout(mount,40);window.__wrongbookHumanVisibilityV22Observer?.disconnect?.();const o=new MutationObserver(queue);o.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','data-v8-diagram']});window.__wrongbookHumanVisibilityV22Observer=o;window.addEventListener('resize',queue,{passive:true});apply()}mount();

  window.runWrongbookHumanVisibilityV22QA=function(){
    apply();const dock=document.querySelector('.v5-tutor-dock');let tutor={pass:true};
    if(dock){const collapsed=dock.classList.contains('v6-tutor-collapsed'),bar=dock.querySelector(':scope > .v6-tutor-collapse-bar'),summary=bar?.querySelector('.v6-tutor-collapse-summary'),p=bar?.querySelector('.wb-v22-collapse-progress'),s=bar?.querySelector('.wb-v22-collapse-status'),right=Boolean(dock.querySelector('.v5-tutor-stage-head .is-right')),outside=[...dock.children].filter(x=>x!==bar&&visible(x)),css=getComputedStyle(dock),noScroll=!collapsed||(css.overflowY==='hidden'&&dock.scrollHeight<=dock.clientHeight+1),only=!collapsed||(!outside.length&&!visible(bar?.querySelector('.v6-tutor-collapse-button'))),copy=!collapsed||!right||(norm(summary?.textContent)==='AI 家教 · 目前方向正確'&&/^提問 \d+\/\d+$/.test(norm(p?.textContent))&&norm(s?.textContent)==='✓ 目前方向正確');tutor={collapsed,noScroll,onlyRequested:only,exactRightCopy:copy,pass:noScroll&&only&&copy}}
    const diagrams=[...document.querySelectorAll('.v8-ai-diagram')].map(card=>{const svg=card.querySelector('svg');if(!svg)return{pass:false};const vb=svg.viewBox.baseVal,texts=[...svg.querySelectorAll('text')].filter(visible),inside=texts.every(t=>{let q;try{q=t.getBBox()}catch{return true}return q.x>=vb.x-1&&q.y>=vb.y-1&&q.x+q.width<=vb.x+vb.width+1&&q.y+q.height<=vb.y+vb.height+1}),readable=texts.every(t=>(parseFloat(getComputedStyle(t).fontSize)||0)>=10.5),noCardXScroll=card.scrollWidth<=card.clientWidth+2;let noCoreTextOverlap=true;if(card.dataset.v8Diagram==='mitochondrion'){const shell=svg.querySelector('.dg-shell'),sr=shell?.getBoundingClientRect();if(sr)noCoreTextOverlap=[...svg.querySelectorAll('text.dg-label')].filter(visible).every(t=>!overlaps(t.getBoundingClientRect(),sr))}return{type:card.dataset.v8Diagram||'',inside,readable,noCardXScroll,noCoreTextOverlap,pass:inside&&readable&&noCardXScroll&&noCoreTextOverlap}});
    const pass=tutor.pass&&diagrams.every(x=>x.pass);return{version:VERSION,params:PARAMS,tutor,diagramCount:diagrams.length,diagrams,allHumanVisible:pass,pass};
  };
  setTimeout(()=>{window.__wrongbookHumanVisibilityV22QA=window.runWrongbookHumanVisibilityV22QA?.()},260);
})();
