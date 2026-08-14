// Refinement QA runs only with ?refinee2e=1. It is additive: the v6 source-trace gate remains authoritative too.
(async()=>{
 const run=new URLSearchParams(location.search).has('refinee2e');if(!run)return;
 const sleep=ms=>new Promise(r=>setTimeout(r,ms)),results=[],rows=[];
 const check=(name,ok,detail='')=>results.push({name,ok:Boolean(ok),detail});
 const norm=s=>window.v7NormalizePromptText?window.v7NormalizePromptText(s):String(s||'').replace(/[\s\u3000]+/g,'');
 const pageChapter={242:1,243:1,244:2,245:2,246:3,247:3,248:4,249:4,250:5,251:5,252:6,253:6};
 const htmlFor=(page,mode='recall')=>{const ch=window.EARTH_REFERENCE_MAPS?.find(x=>x.number===pageChapter[page]),sem=window.EARTH_SEMANTIC_MAPS?.find(x=>x.number===pageChapter[page]);return window.v5PageHtml(ch,sem,page,mode)};
 const fragFor=(page,mode='recall')=>{const t=document.createElement('template');t.innerHTML=htmlFor(page,mode);return t.content};
 const sourceStatic=r=>{const t=document.createElement('template');t.innerHTML=String(r.template||'').replace(/\{\{\d+\}\}/g,'');return norm(t.content.textContent)};
 const renderedStatic=el=>{const c=el.cloneNode(true);c.querySelectorAll('.v4strict-fill,.v7-logical-question-marker').forEach(x=>x.remove());return norm(c.textContent)};
 const overlap=(a,b)=>a.width>0&&a.height>0&&b.width>0&&b.height>0&&!(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top);
 try{
  await sleep(280);
  const M=window.SOURCE_PROMPTS_V7||{},pages=Array.from({length:12},(_,i)=>242+i);
  check('source prompt manifest covers pages 242-253',pages.every(p=>Array.isArray(M[p])&&M[p].length>0),JSON.stringify(Object.fromEntries(pages.map(p=>[p,M[p]?.length||0]))));
  const logicalTotal=pages.reduce((n,p)=>n+(M[p]?.length||0),0),chapterTotals={};
  for(const p of pages)chapterTotals[pageChapter[p]]=(chapterTotals[pageChapter[p]]||0)+(M[p]?.length||0);
  check('276 exact source logical prompts in manifest',logicalTotal===276&&[48,50,41,27,60,50].every((n,i)=>chapterTotals[i+1]===n),JSON.stringify({logicalTotal,chapterTotals}));
  check('every manifest row is photo-verified',pages.every(p=>M[p].every(r=>r.verifiedFromPhoto===true)));

  for(const page of pages){
   const f=fragFor(page,'recall'),recs=M[page]||[];
   check(`page ${page} source trace loads`,Boolean(f.querySelector(`[data-source-trace-page="${page}"]`)));
   for(const r of recs){
    let pass=false,renderBlanks=0,renderText='';
    if(r.standalone===false){
      const marker=f.querySelector(`[data-question="${r.number}"].v7-logical-question-marker`),parent=f.querySelector(`[data-question="${r.renderTarget||r.number}"][data-v7-source-prompt="true"]`);
      pass=Boolean(marker&&parent);renderText=parent?renderedStatic(parent):'';renderBlanks=0;
    }else if(r.skipRender){
      const el=f.querySelector(`[data-question="${r.number}"]`);renderBlanks=el?.querySelectorAll('.v4strict-fill').length||0;pass=Boolean(el)&&renderBlanks===r.blanks;renderText=el?renderedStatic(el):'';
    }else{
      const el=f.querySelector(`[data-question="${r.number}"]`);renderBlanks=el?.querySelectorAll('.v4strict-fill').length||0;renderText=el?renderedStatic(el):'';
      const expected=sourceStatic(r);pass=Boolean(el&&el.dataset.v7PromptStatus==='verified')&&renderBlanks===r.blanks&&renderText===expected;
    }
    rows.push({page,question:r.number,sourcePrintedPrompt:sourceStatic(r),renderedPrintedPrompt:renderText,blankCount:r.blanks,renderBlankCount:renderBlanks,pass});
   }
   check(`page ${page} prompt rows exact`,rows.filter(x=>x.page===page).every(x=>x.pass),JSON.stringify(rows.filter(x=>x.page===page&&!x.pass)));
  }
  window.SOURCE_PROMPT_QA_V7=rows;
  check('276/276 exact printed prompt rows verified',rows.length===276&&rows.every(r=>r.pass),JSON.stringify({rows:rows.length,failed:rows.filter(r=>!r.pass)}));

  // Targeted handwritten-answer leakage audit: inspect source-art layers, never the interactive prompt overlays.
  const p243=fragFor(243),decay=p243.querySelector('.v6-p243-decay')?.textContent||'';
  check('p243 decay graph has no baked mother/daughter/100 answers',!/(母元素|子元素)/.test(decay)&&!/(^|\D)100(\D|$)/.test(decay),decay);
  const p244=fragFor(244),star=p244.querySelector('.v6-p244-starcolor')?.textContent||'';
  check('p244 star-color answer sequence is not static art',!/[藍白黃橘紅]/.test(star),star);
  const p246=fragFor(246),annual=p246.querySelector('.v7-p246-annual')?.cloneNode(true);annual?.querySelectorAll('.v4strict-fill').forEach(x=>x.remove());
  const annualStatic=annual?.textContent||'';check('p246 annual motion answers are interactive, not static',!/(360|361|30度|24小時)/.test(annualStatic),annualStatic);
  check('p246 daily source figure uses star + curved apparent-motion path',Boolean(p246.querySelector('.v6-p246-daily path[marker-end]'))&&!/↕/.test(p246.querySelector('.v6-p246-daily')?.textContent||''));
  const p248=fragFor(248),earthArt=[p248.querySelector('.v6-p248-crust')?.textContent||'',p248.querySelector('.v6-p248-deep')?.textContent||''].join('|');
  check('p248 deep/crust answers are not baked into art',!/(大陸地殼|海洋地殼|莫荷不連續面|橄欖岩|古氏|雷曼|外核|內核|Fe、Ni)/.test(earthArt),earthArt);
  const p249=fragFor(249),tw=p249.querySelector('.v6-p249-taiwan')?.textContent||'';
  check('p249 Taiwan map answer names are interactive',!/(琉球島弧|琉球海溝|馬尼拉海溝|呂宋島弧)/.test(tw),tw);
  const p250=fragFor(250),atm=p250.querySelector('.v6-p250-atm')?.textContent||'';
  check('p250 atmosphere layer answers are not baked into art',!/(增溫層|中氣層|平流層|對流層)/.test(atm),atm);
  const p253=fragFor(253),plate=p253.querySelector('.v6-p253-plate')?.textContent||'';
  check('p253 plate/climate answer prose is not baked into art',!/(板塊運動會改變|冰雪反照率高|冰雪減少)/.test(plate+(p253.querySelector('.v6-p253-correct')?.textContent||'')));

  // Figure de-duplication and current-label collision QA.
  const p252=fragFor(252);
  check('p252 has exactly one normal-Pacific source figure',p252.querySelectorAll('.v7-p252-pac').length===1&&p252.querySelectorAll('.v6-p252-pac-detail').length===0);
  check('p252 has exactly one ENSO source figure',p252.querySelectorAll('.v7-p252-enso').length===1&&p252.querySelectorAll('.v6-p252-enso-detail').length===0);
  const host=document.createElement('div');host.style.cssText='position:fixed;left:-12000px;top:0;width:910px;height:1270px;visibility:hidden;';host.appendChild(p252.cloneNode(true));document.body.appendChild(host);
  const labels=[...host.querySelectorAll('[data-current-label]')],collisions=[];
  for(let i=0;i<labels.length;i++)for(let j=i+1;j<labels.length;j++)if(overlap(labels[i].getBoundingClientRect(),labels[j].getBoundingClientRect()))collisions.push([labels[i].dataset.currentLabel,labels[j].dataset.currentLabel]);
  check('p252 current labels have zero bounding-box collisions',labels.length>=4&&collisions.length===0,JSON.stringify({labels:labels.map(x=>x.dataset.currentLabel),collisions}));
  check('p252 each named current has one uninterrupted arrow path',['north-equatorial','counter-equatorial','south-equatorial','peru-cold'].every(id=>host.querySelectorAll(`[data-current-id="${id}"]`).length===1&&host.querySelector(`[data-current-id="${id}"]`)?.hasAttribute('marker-end')));
  host.remove();

  // Visible source-line semantics. Empty arrays are intentional on pages whose layout—not a connector—carries the relationship.
  const lineM=window.SOURCE_LINE_MANIFEST_V7||{},allowed=new Set(['classification','method','cause','chronology','component','evidence','source-layout-only']);
  const lineFailures=[];
  for(const [page,recs] of Object.entries(lineM))for(const r of recs||[])if(!r.source||!allowed.has(r.type)||!String(r.reason||'').trim()||!String(r.from||'').trim()||!String(r.to||'').trim())lineFailures.push({page,...r});
  check('every recorded visible source relationship has source+meaning',lineFailures.length===0,JSON.stringify(lineFailures));
  check('separate-zone pages remain deliberately unconnected',[247,248,249].every(p=>(lineM[p]||[]).length===0));

  const sem=window.v5SemanticValidate?.();
  check('zero generic/fallback figures remain',sem?.genericFallbackFigures===0&&sem?.semanticFallbackFigures===0,JSON.stringify(sem));
  check('zero automatic production source routes remain',sem?.autoRoutedProductionEdges===0,JSON.stringify(sem));
  check('p250-253 production source traces are real',[250,251,252,253].every(p=>Boolean(fragFor(p).querySelector(`[data-source-trace-page="${p}"]`))));

  const failed=results.filter(x=>!x.ok),box=document.createElement('pre');box.id='e2e-results';box.dataset.status=failed.length?'FAIL':'PASS';box.textContent=JSON.stringify({status:failed.length?'FAIL':'PASS',manifestCount:logicalTotal,promptQA:{total:rows.length,passed:rows.filter(x=>x.pass).length,failed:rows.filter(x=>!x.pass)},results},null,2);document.body.appendChild(box);
 }catch(err){const box=document.createElement('pre');box.id='e2e-results';box.dataset.status='FAIL';box.textContent=JSON.stringify({status:'FAIL',error:String(err),results,rows},null,2);document.body.appendChild(box)}
})();
