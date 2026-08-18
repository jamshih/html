// Wrong Book V22 — human-visible collapsed tutor + non-overlapping semantic diagram labels.
(function(){
  const VERSION='2026-08-18-human-visibility-v22.1';

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

  const STYLE_ID='wrongbookHumanVisibilityV22Style';
  document.getElementById(STYLE_ID)?.remove();
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    html body .v5-tutor-dock.v6-tutor-collapsed{
      box-sizing:border-box!important;padding:0!important;gap:0!important;height:auto!important;min-height:0!important;max-height:none!important;
      overflow:hidden!important;overflow-x:hidden!important;overflow-y:hidden!important;overscroll-behavior:none!important;
      scrollbar-width:none!important;-ms-overflow-style:none!important;
    }
    html body .v5-tutor-dock.v6-tutor-collapsed::-webkit-scrollbar,
    html body .v5-tutor-dock.v6-tutor-collapsed *::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}
    html body .v5-tutor-dock.v6-tutor-collapsed>:not(.v6-tutor-collapse-bar){display:none!important}
    html body .v5-tutor-dock.v6-tutor-collapsed>.v6-tutor-collapse-bar{
      position:static!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;align-items:start!important;justify-content:stretch!important;
      gap:${PARAMS.collapsed.rowGap}px!important;width:100%!important;min-width:0!important;padding:${PARAMS.collapsed.paddingY}px ${PARAMS.collapsed.paddingX}px!important;
      margin:0!important;cursor:pointer!important;background:inherit!important;overflow:hidden!important;
    }
    html body .v5-tutor-dock.v6-tutor-collapsed .v6-tutor-collapse-summary{
      display:block!important;min-width:0!important;margin:0!important;overflow:visible!important;text-overflow:clip!important;white-space:normal!important;
      font-size:${PARAMS.collapsed.summaryFontPx}px!important;line-height:1.25!important;font-weight:800!important;
    }
    html body .v5-tutor-dock.v6-tutor-collapsed .wb-v22-collapse-detail{
      display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:6px ${PARAMS.collapsed.detailGapPx}px!important;min-width:0!important;margin:0!important;
      font-size:${PARAMS.collapsed.detailFontPx}px!important;line-height:1.25!important;
    }
    html body .v5-tutor-dock.v6-tutor-collapsed .wb-v22-collapse-detail[hidden]{display:none!important}
    html body .v5-tutor-dock.v6-tutor-collapsed .wb-v22-collapse-progress{
      display:inline-flex!important;align-items:center!important;min-height:26px!important;box-sizing:border-box!important;padding:4px 8px!important;
      border-radius:${PARAMS.collapsed.progressRadiusPx}px!important;background:var(--surface-2,#F2F1EC)!important;color:var(--muted,#686A65)!important;font-weight:780!important;white-space:nowrap!important;
    }
    html body .v5-tutor-dock.v6-tutor-collapsed .wb-v22-collapse-status{
      display:inline-flex!important;align-items:center!important;min-height:26px!important;color:#2F7D57!important;font-weight:800!important;white-space:nowrap!important;
    }
    html body .v5-tutor-dock.v6-tutor-collapsed .v6-tutor-collapse-button{display:none!important}
    .v5-tutor-dock:not(.v6-tutor-collapsed) .wb-v22-collapse-detail{display:none!important}
    .v8-ai-diagram[data-v8-diagram="mitochondrion"] svg{display:block!important;width:100%!important;height:auto!important;max-height:none!important;overflow:visible!important}
  `;
  document.head.appendChild(style);

  const norm=v=>String(v??'').replace(/\s+/g,' ').trim();
  const visible=el=>{if(!el)return false;const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0&&r.width>0&&r.height>0};
  const overlaps=(a,b,pad=0)=>!(a.right+pad<=b.left||b.right+pad<=a.left||a.bottom+pad<=b.top||b.bottom+pad<=a.top);

  function currentSession(){
    try{const p=typeof selectedProblem==='function'?selectedProblem():null;if(!p)return null;return typeof v5TutorSession==='function'?v5TutorSession(p):(window.state?.tutorSessions?.[p.id]||null)}catch{return null}
  }
  function progressFor(dock){
    const s=currentSession(),total=Array.isArray(s?.stages)?s.stages.length:0;
    if(total){const i=Math.max(0,Math.min(total-1,Math.trunc(Number(s.activeIndex)||0));return{current:i+1,total}}
    const m=norm(dock?.querySelector('.v5-tutor-stage-head>span')?.textContent).match(/(\d+)\s*\/\s*(\d+)/);
    return m?{current:Number(m[1])||1,total:Number(m[2])||1}:{current:1,total:1};
  }
  function applyTutor(dock){
    const bar=dock?.querySelector(':scope > .v6-tutor-collapse-bar'),summary=bar?.querySelector('.v6-tutor-collapse-summary'),button=bar?.querySelector('.v6-tutor-collapse-button');
    if(!bar||!summary)return false;
    let detail=bar.querySelector(':scope > .wb-v22-collapse-detail');
    if(!detail){detail=document.createElement('div');detail.className='wb-v22-collapse-detail';button?bar.insertBefore(detail,button):bar.appendChild(detail)}
    const right=Boolean(dock.querySelector('.v5-tutor-stage-head .is-right'));
    if(right){
      summary.textContent='AI 家教 · 目前方向正確';
      const {current,total}=progressFor(dock);
      let p=detail.querySelector('.wb-v22-collapse-progress'),s=detail.querySelector('.wb-v22-collapse-status');
      if(!p){p=document.createElement('span');p.className='wb-v22-collapse-progress';detail.appendChild(p)}
      if(!s){s=document.createElement('span');s.className='wb-v22-collapse-status';detail.appendChild(s)}
      p.textContent=`提問 ${current}/${total}`;s.textContent='✓ 目前方向正確';detail.hidden=false;
    }else detail.hidden=true;
    const collapsed=dock.classList.contains('v6-tutor-collapsed');
    if(collapsed){bar.dataset.wbV22Expand='1';bar.setAttribute('role','button');bar.setAttribute('tabindex','0');bar.setAttribute('aria-expanded','false');bar.setAttribute('aria-label','展開 AI 家教')}
    else{delete bar.dataset.wbV22Expand;['role','tabindex','aria-expanded','aria-label'].forEach(a=>bar.removeAttribute(a))}
    return true;
  }

  const SVG_NS='http://www.w3.org/2000/svg';
  const charUnits=ch=>/\s/.test(ch)?.35:/[\u0000-\u00ff]/.test(ch)?.58:1;
  function wrapText(value,maxUnits){
    const out=[];let line='',units=0;
    const flush=()=>{if(line){out.push(line.trimEnd());line='';units=0}};
    for(const ch of [...String(value??'').trim()]){if(ch==='\n'){flush();continue}const w=charUnits(ch);if(line&&units+w>maxUnits)flush();line+=ch;units+=w}flush();return out.length?out:[''];
  }
  function originalText(el){if(!el)return'';if(!el.dataset.wbV22OriginalText)el.dataset.wbV22OriginalText=norm(el.textContent);return el.dataset.wbV22OriginalText}
  function setLines(el,lines,{x,y,anchor='start',lineHeight=17}){
    if(!el)return;const clean=lines.map(String),sig=JSON.stringify([clean,x,y,anchor,lineHeight]);if(el.dataset.wbV22Layout===sig)return;
    el.textContent='';el.setAttribute('x',x);el.setAttribute('y',y);el.setAttribute('text-anchor',anchor);el.removeAttribute('transform');
    clean.forEach((line,i)=>{const t=document.createElementNS(SVG_NS,'tspan');t.setAttribute('x',x);t.setAttribute('dy',i?' '+lineHeight:'0');t.textContent=line;el.appendChild(t)});
    el.dataset.wbV22Layout=sig;el.dataset.wbV22Label='1';
  }
  function shift(el,x){if(el){el.setAttribute('transform',`translate(${x} 0)`);el.dataset.wbV22Core='1'}}
  function matrixLeader(svg){
    let p=svg.querySelector('.wb-v22-matrix-leader');if(!p){p=document.createElementNS(SVG_NS,'path');p.setAttribute('class','dg-arrow wb-v22-matrix-leader');svg.appendChild(p)}
    p.setAttribute('d',`M${326+PARAMS.diagram.coreShiftX} 198 L${PARAMS.diagram.core.labelX} 276`);p.setAttribute('fill','none');
  }
  function patchMito(card){
    const svg=card?.querySelector('svg');if(!svg)return false;
    svg.setAttribute('viewBox',`0 0 ${PARAMS.diagram.viewBoxWidth} ${PARAMS.diagram.viewBoxHeight}`);svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.dataset.wbV22Fitted='1';
    ['.dg-shell','.dg-matrix','.dg-membrane','circle','.dg-cycle'].forEach(sel=>svg.querySelectorAll(sel).forEach(el=>shift(el,PARAMS.diagram.coreShiftX)));
    const box=svg.querySelector('.dg-box'),labels=[...svg.querySelectorAll('text.dg-label')],smalls=[...svg.querySelectorAll('text.dg-small')],arrows=[...svg.querySelectorAll('path.dg-arrow:not(.wb-v22-matrix-leader)')];
    const [outside,matrix,inner,inter]=labels;
    if(box&&outside){const lines=wrapText(originalText(outside),PARAMS.diagram.left.maxUnits),h=Math.max(PARAMS.diagram.left.minHeight,PARAMS.diagram.left.paddingY*2+lines.length*PARAMS.diagram.left.lineHeight),y=PARAMS.diagram.left.centerY-h/2;box.setAttribute('x',PARAMS.diagram.left.x);box.setAttribute('y',y.toFixed(1));box.setAttribute('width',PARAMS.diagram.left.width);box.setAttribute('height',h.toFixed(1));setLines(outside,lines,{x:PARAMS.diagram.left.textX,y:(y+PARAMS.diagram.left.paddingY+12).toFixed(1),anchor:'middle',lineHeight:PARAMS.diagram.left.lineHeight})}
    if(arrows[0])arrows[0].setAttribute('d','M188 150 C196 150 201 150 207 150');
    if(matrix){setLines(matrix,wrapText(originalText(matrix),PARAMS.diagram.core.matrixMaxUnits),{x:PARAMS.diagram.core.labelX,y:PARAMS.diagram.core.matrixLabelY,anchor:'middle',lineHeight:PARAMS.diagram.core.matrixLineHeight});matrixLeader(svg)}
    if(inner)setLines(inner,wrapText(originalText(inner),PARAMS.diagram.right.maxUnits),{x:PARAMS.diagram.right.x,y:PARAMS.diagram.right.innerLabelY,lineHeight:PARAMS.diagram.right.lineHeight});
    if(inter)setLines(inter,wrapText(originalText(inter),PARAMS.diagram.right.maxUnits),{x:PARAMS.diagram.right.x,y:PARAMS.diagram.right.interLabelY,lineHeight:PARAMS.diagram.right.lineHeight});
    const coreSmall=smalls.find(x=>originalText(x).includes('粒線體基質')),innerSmall=smalls.find(x=>originalText(x).includes('粒線體內膜')),interSmall=smalls.find(x=>originalText(x).includes('膜間腔')),footer=smalls.find(x=>originalText(x).includes('位置關係示意圖'));
    if(coreSmall)setLines(coreSmall,[originalText(coreSmall)],{x:PARAMS.diagram.core.labelX,y:PARAMS.diagram.core.topLabelY,anchor:'middle',lineHeight:15});
    if(innerSmall)setLines(innerSmall,wrapText(originalText(innerSmall),PARAMS.diagram.right.maxUnits),{x:PARAMS.diagram.right.x,y:PARAMS.diagram.right.innerSmallY,lineHeight:15});
    if(interSmall)setLines(interSmall,wrapText(originalText(interSmall),PARAMS.diagram.right.maxUnits),{x:PARAMS.diagram.right.x,y:PARAMS.diagram.right.interSmallY,lineHeight:15});
    if(footer)setLines(footer,[originalText(footer)],{x:PARAMS.diagram.core.labelX,y:PARAMS.diagram.core.footerY,anchor:'middle',lineHeight:15});
    if(arrows[1])arrows[1].setAttribute('d',`M${476+PARAMS.diagram.coreShiftX} 91 L614 72`);if(arrows[2])arrows[2].setAttribute('d',`M${476+PARAMS.diagram.coreShiftX} 188 L614 211`);
    return true;
  }
  function fitText(svg,pad=12){
    const vb=svg?.viewBox?.baseVal;if(!vb?.width)return false;let minX=vb.x,minY=vb.y,maxX=vb.x+vb.width,maxY=vb.y+vb.height;
    for(const t of svg.querySelectorAll('text')){let b;try{b=t.getBBox()}catch{continue}if(!b)continue;minX=Math.min(minX,b.x-pad);minY=Math.min(minY,b.y-pad);maxX=Math.max(maxX,b.x+b.width+pad);maxY=Math.max(maxY,b.y+b.height+pad)}
    svg.setAttribute('viewBox',`${minX.toFixed(1)} ${minY.toFixed(1)} ${(maxX-minX).toFixed(1)} ${(maxY-minY).toFixed(1)}`);svg.setAttribute('preserveAspectRatio','xMidYMid meet');return true;
  }
  function applyDiagram(card){const svg=card?.querySelector('svg');if(!svg)return false;if(card.dataset.v8Diagram==='mitochondrion')patchMito(card);fitText(svg);return true}
  function apply(){document.querySelectorAll('.v5-tutor-dock').forEach(applyTutor);document.querySelectorAll('.v8-ai-diagram').forEach(applyDiagram)}

  document.addEventListener('click',e=>{const bar=e.target?.closest?.('.v6-tutor-collapse-bar[data-wb-v22-expand="1"]');if(!bar||e.target?.closest?.('.v6-tutor-collapse-button'))return;const dock=bar.closest('.v5-tutor-dock'),button=bar.querySelector('.v6-tutor-collapse-button');if(!dock?.classList.contains('v6-tutor-collapsed')||!button)return;e.preventDefault();e.stopPropagation();button.click()},true);
  document.addEventListener('keydown',e=>{const bar=e.target?.closest?.('.v6-tutor-collapse-bar[data-wb-v22-expand="1"]');if(!bar||!['Enter',' '].includes(e.key))return;const button=bar.querySelector('.v6-tutor-collapse-button');if(button){e.preventDefault();button.click()}},true);

  let queued=false;const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})};
  function mount(){const root=document.getElementById('app')||document.body;if(!root)return setTimeout(mount,40);window.__wrongbookHumanVisibilityV22Observer?.disconnect?.();const o=new MutationObserver(queue);o.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','data-v8-diagram']});window.__wrongbookHumanVisibilityV22Observer=o;window.addEventListener('resize',queue,{passive:true});apply()}mount();

  window.runWrongbookHumanVisibilityV22QA=function(){
    apply();const dock=document.querySelector('.v5-tutor-dock');let tutor={mounted:false,pass:true};
    if(dock){const collapsed=dock.classList.contains('v6-tutor-collapsed'),bar=dock.querySelector(':scope > .v6-tutor-collapse-bar'),summary=bar?.querySelector('.v6-tutor-collapse-summary'),detail=bar?.querySelector('.wb-v22-collapse-detail'),p=detail?.querySelector('.wb-v22-collapse-progress'),s=detail?.querySelector('.wb-v22-collapse-status'),right=Boolean(dock.querySelector('.v5-tutor-stage-head .is-right')),outside=[...dock.children].filter(el=>el!==bar&&visible(el)),css=getComputedStyle(dock);const noScroll=!collapsed||(css.overflowY==='hidden'&&dock.scrollHeight<=dock.clientHeight+1),onlyRequested=!collapsed||(!outside.length&&!visible(bar?.querySelector('.v6-tutor-collapse-button'))),copy=!collapsed||!right||(norm(summary?.textContent)==='AI 家教 · 目前方向正確'&&/^提問 \d+\/\d+$/.test(norm(p?.textContent))&&norm(s?.textContent)==='✓ 目前方向正確');tutor={mounted:true,collapsed,noScroll,onlyRequested,exactRightCopy:copy,outsideVisibleCount:outside.length,pass:Boolean(noScroll&&onlyRequested&&copy)}}
    const diagrams=[...document.querySelectorAll('.v8-ai-diagram')].map(card=>{const svg=card.querySelector('svg');if(!svg)return{pass:false,reason:'missing-svg'};const vb=svg.viewBox.baseVal,texts=[...svg.querySelectorAll('text')].filter(visible),inside=texts.every(t=>{let b;try{b=t.getBBox()}catch{return true}return b.x>=vb.x-1&&b.y>=vb.y-1&&b.x+b.width<=vb.x+vb.width+1&&b.y+b.height<=vb.y+vb.height+1}),readable=texts.every(t=>(parseFloat(getComputedStyle(t).fontSize)||0)>=10.5),noCardXScroll=card.scrollWidth<=card.clientWidth+2;let noCoreTextOverlap=true;if(card.dataset.v8Diagram==='mitochondrion'){const shell=svg.querySelector('.dg-shell'),sr=shell?.getBoundingClientRect();if(sr)noCoreTextOverlap=[...svg.querySelectorAll('text.dg-label')].filter(visible).every(t=>!overlaps(t.getBoundingClientRect(),sr,0))}return{type:card.dataset.v8Diagram||'',inside,readable,noCardXScroll,noCoreTextOverlap,pass:Boolean(inside&&readable&&noCardXScroll&&noCoreTextOverlap)}});
    const pass=tutor.pass&&diagrams.every(x=>x.pass);return{version:VERSION,params:PARAMS,tutor,diagramCount:diagrams.length,diagrams,allHumanVisible:pass,pass};
  };
  setTimeout(()=>{window.__wrongbookHumanVisibilityV22QA=window.runWrongbookHumanVisibilityV22QA?.()},260);
})();
