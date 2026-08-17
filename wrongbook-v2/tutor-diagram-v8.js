// Wrong Book V8 — semantic diagrams for AI tutoring.
// The AI can request a diagram through an existing action.text field, so this remains backward
// compatible with the current structured response schema. The renderer is deterministic SVG.
(function(){
  const VERSION='2026-08-17-tutor-diagram-v8';
  if(window.__wrongbookTutorDiagramV8===VERSION)return;
  window.__wrongbookTutorDiagramV8=VERSION;

  const PROTOCOL=`\n視覺圖解能力：如果這一步的核心是「位置、構造、流程、循環」而簡圖比純文字更容易懂，請在該 stage.actions 額外加入一個 action。不要把協定字串寫進 promptToStudent。action 請使用 kind=write、targetRegionId 留空、tone=guide、caption=diagram，text 使用以下其中一種格式：\n[[DIAGRAM|mitochondrion|title=標題|outside=粒線體外的輸入|matrix=基質中的反應|inner=內膜上的反應|inter=膜間腔相關概念]]\n[[DIAGRAM|flow|title=標題|a=步驟一|b=步驟二|c=步驟三|d=步驟四]]\n[[DIAGRAM|cycle|title=標題|a=階段一|b=階段二|c=階段三|d=階段四]]\n只有真的有助理解時才加入圖，不要為裝飾而畫。粒線體相關位置題優先使用 mitochondrion。`;

  function escHtml(value=''){
    return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  }

  function parseMarker(value=''){
    const text=String(value||'').trim();
    const match=text.match(/\[\[DIAGRAM\|([a-z_-]+)\|([\s\S]*?)\]\]/i);
    if(!match)return null;
    const template=match[1].toLowerCase();
    if(!['mitochondrion','flow','cycle'].includes(template))return null;
    const fields={};
    for(const part of match[2].split('|')){
      const i=part.indexOf('=');
      if(i<=0)continue;
      const key=part.slice(0,i).trim().toLowerCase();
      const val=part.slice(i+1).trim().slice(0,80);
      if(key&&val)fields[key]=val;
    }
    return{template,fields,raw:match[0]};
  }

  function markerFromAction(action){
    return parseMarker(action?.text)||parseMarker(action?.caption)||null;
  }

  function inferFromStage(stage){
    if(!stage)return null;
    const text=[stage.goal,stage.promptToStudent,stage.expectedStudentEvidence,stage.successCriteria,stage.fallbackHint]
      .filter(Boolean).join(' ');
    if(!text)return null;

    const mitoHits=['粒線體','基質','內膜','電子傳遞鏈','克氏循環','檸檬酸循環','丙酮酸'].filter(k=>text.includes(k));
    if(mitoHits.length>=2&&(text.includes('粒線體')||text.includes('電子傳遞鏈')||text.includes('克氏循環')||text.includes('檸檬酸循環'))){
      const fields={title:'粒線體中的反應位置'};
      if(text.includes('丙酮酸'))fields.outside='丙酮酸';
      if(text.includes('克氏循環'))fields.matrix='克氏循環';
      else if(text.includes('檸檬酸循環'))fields.matrix='檸檬酸循環';
      if(text.includes('電子傳遞鏈'))fields.inner='電子傳遞鏈';
      if(text.includes('質子梯度'))fields.inter='質子梯度';
      else if(text.includes('ATP 合成酶'))fields.inter='ATP 合成酶';
      return{template:'mitochondrion',fields,inferred:true};
    }

    const arrowParts=text.split(/\s*(?:→|➜|➡|⇒)\s*/).map(x=>x.trim()).filter(Boolean);
    if(arrowParts.length>=3&&arrowParts.length<=5){
      const fields={title:stage.goal||'流程圖'};
      ['a','b','c','d'].forEach((k,i)=>{if(arrowParts[i])fields[k]=arrowParts[i].slice(0,45)});
      return{template:'flow',fields,inferred:true};
    }
    return null;
  }

  let diagramSeq=0;
  function mitochondrionSvg(fields){
    const id=`v8dg${++diagramSeq}`;
    const outside=fields.outside||'丙酮酸';
    const matrix=fields.matrix||'克氏循環';
    const inner=fields.inner||'電子傳遞鏈';
    const inter=fields.inter||'';
    return `<svg viewBox="0 0 620 285" role="img" aria-label="${escHtml(fields.title||'粒線體反應位置圖')}">
      <defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" class="dg-accent"/></marker></defs>
      <rect class="dg-box" x="18" y="112" rx="14" width="112" height="55"/>
      <text class="dg-label" x="74" y="145" text-anchor="middle">${escHtml(outside)}</text>
      <path class="dg-arrow" d="M132 140 C155 140 162 140 184 140" marker-end="url(#${id}-arrow)"/>

      <path class="dg-shell" d="M190 48 C250 18 416 20 493 55 C548 80 557 192 491 229 C416 270 266 266 199 226 C145 193 142 82 190 48Z"/>
      <path class="dg-matrix" d="M208 64 C269 38 405 38 475 66 C520 85 527 183 475 211 C405 246 278 244 215 211 C170 186 168 89 208 64Z"/>
      <path class="dg-membrane" d="M215 82 C255 60 279 62 298 84 C316 106 331 107 349 83 C368 58 390 59 409 83 C430 109 447 108 470 82 M215 118 C244 96 267 98 286 120 C306 144 325 145 343 119 C361 94 383 95 402 120 C420 145 444 145 472 116 M214 158 C245 137 269 139 288 161 C307 184 326 184 344 159 C363 133 385 135 404 159 C423 184 445 185 474 155 M220 196 C252 177 276 179 295 200 C314 222 335 221 353 197 C371 174 393 175 413 197 C432 220 452 219 477 195"/>

      <text class="dg-small" x="335" y="72" text-anchor="middle">粒線體基質</text>
      <circle cx="326" cy="145" r="50" fill="var(--surface,#FFFDF8)" stroke="var(--blue,#355C97)" stroke-width="2"/>
      <path class="dg-cycle" d="M300 123 A31 31 0 1 1 298 166" marker-end="url(#${id}-arrow)"/>
      <text class="dg-label" x="326" y="150" text-anchor="middle">${escHtml(matrix)}</text>

      <path class="dg-arrow" d="M476 91 L535 72"/>
      <text class="dg-small" x="540" y="58">粒線體內膜</text>
      <text class="dg-label" x="540" y="80">${escHtml(inner)}</text>
      ${inter?`<path class="dg-arrow" d="M476 188 L535 211"/><text class="dg-small" x="540" y="201">膜間腔／內膜關係</text><text class="dg-label" x="540" y="223">${escHtml(inter)}</text>`:''}
      <text class="dg-small" x="310" y="274" text-anchor="middle">位置關係示意圖 · 不按比例</text>
    </svg>`;
  }

  function flowSvg(fields){
    const id=`v8dg${++diagramSeq}`;
    const items=['a','b','c','d'].map(k=>fields[k]).filter(Boolean);
    const count=Math.max(2,items.length),gap=20,w=(560-gap*(count-1))/count;
    let body='';
    items.forEach((label,i)=>{
      const x=30+i*(w+gap);
      body+=`<rect class="dg-box" x="${x}" y="88" rx="13" width="${w}" height="72"/><text class="dg-label" x="${x+w/2}" y="130" text-anchor="middle">${escHtml(label)}</text>`;
      if(i<items.length-1){const x1=x+w+3,x2=x+w+gap-3;body+=`<path class="dg-arrow" d="M${x1} 124 L${x2} 124" marker-end="url(#${id}-arrow)"/>`;}
    });
    return `<svg viewBox="0 0 620 230" role="img" aria-label="${escHtml(fields.title||'流程圖')}"><defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" class="dg-accent"/></marker></defs>${body}<text class="dg-small" x="310" y="205" text-anchor="middle">流程關係示意</text></svg>`;
  }

  function cycleSvg(fields){
    const id=`v8dg${++diagramSeq}`;
    const items=['a','b','c','d'].map(k=>fields[k]).filter(Boolean);
    const pts=[[310,55],[455,130],[310,205],[165,130]];
    let body='';
    items.forEach((label,i)=>{const [x,y]=pts[i%4];body+=`<rect class="dg-box" x="${x-62}" y="${y-24}" rx="12" width="124" height="48"/><text class="dg-label" x="${x}" y="${y+5}" text-anchor="middle">${escHtml(label)}</text>`;});
    const used=items.length||4;
    for(let i=0;i<used;i++){const a=pts[i%4],b=pts[(i+1)%used];body+=`<path class="dg-arrow" d="M${a[0]} ${a[1]+30} Q310 130 ${b[0]-10} ${b[1]-25}" marker-end="url(#${id}-arrow)"/>`;}
    return `<svg viewBox="0 0 620 265" role="img" aria-label="${escHtml(fields.title||'循環圖')}"><defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" class="dg-accent"/></marker></defs>${body}</svg>`;
  }

  function diagramMarkup(spec){
    if(!spec)return'';
    const fields=spec.fields||{};
    const title=fields.title||({mitochondrion:'位置圖',flow:'流程圖',cycle:'循環圖'}[spec.template]||'圖解');
    const svg=spec.template==='mitochondrion'?mitochondrionSvg(fields):spec.template==='cycle'?cycleSvg(fields):flowSvg(fields);
    return `<div class="v8-ai-diagram" data-v8-diagram="${escHtml(spec.template)}"><div class="v8-ai-diagram-head"><strong>${escHtml(title)}</strong><span>AI 圖解</span></div>${svg}</div>`;
  }

  function specForStage(stage){
    const marker=(stage?.actions||[]).map(markerFromAction).find(Boolean);
    return marker||inferFromStage(stage);
  }

  function currentStage(){
    try{
      const p=typeof selectedProblem==='function'?selectedProblem():null;
      const s=p&&typeof state!=='undefined'?state.tutorSessions?.[p.id]:null;
      return s?.stages?.[s.activeIndex]||null;
    }catch{return null}
  }

  function mountDiagram(stageEl,stage=currentStage()){
    if(!stageEl)return false;
    const spec=specForStage(stage);
    let slot=stageEl.querySelector(':scope > .v8-ai-diagram');
    if(!spec){slot?.remove();return false;}
    const signature=JSON.stringify(spec);
    if(slot?.dataset.v8Signature===signature)return true;
    slot?.remove();
    const wrap=document.createElement('div');
    wrap.innerHTML=diagramMarkup(spec);
    slot=wrap.firstElementChild;
    if(!slot)return false;
    slot.dataset.v8Signature=signature;
    const p=stageEl.querySelector(':scope > p');
    if(p)p.insertAdjacentElement('afterend',slot);else stageEl.prepend(slot);
    return true;
  }

  function installHooks(){
    if(typeof v3GuideApi==='function'&&!window.__wrongbookTutorDiagramApiWrapped){
      window.__wrongbookTutorDiagramApiWrapped=true;
      const baseApi=v3GuideApi;
      window.v3GuideApi=async function(body={}){
        const next={...body,question:String(body?.question||'')+PROTOCOL};
        return baseApi.call(this,next);
      };
      try{v3GuideApi=window.v3GuideApi}catch{}
    }

    if(typeof v5StageActions==='function'&&!window.__wrongbookTutorDiagramStageActionsWrapped){
      window.__wrongbookTutorDiagramStageActionsWrapped=true;
      const baseStageActions=v5StageActions;
      window.v5StageActions=function(stage,p){
        return baseStageActions.call(this,stage,p).map(a=>markerFromAction(a)?{...a,kind:'pause',text:'',caption:''}:a);
      };
      try{v5StageActions=window.v5StageActions}catch{}
    }
  }

  function apply(){
    installHooks();
    const stage=currentStage();
    document.querySelectorAll('.v5-tutor-stage').forEach(el=>mountDiagram(el,stage));
  }

  let queued=false;
  function queueApply(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  const mount=()=>{
    const app=document.getElementById('app');
    if(!app)return setTimeout(mount,50);
    const observer=new MutationObserver(queueApply);
    observer.observe(app,{subtree:true,childList:true,characterData:true});
    window.__wrongbookTutorDiagramV8Observer=observer;
    apply();
  };
  mount();

  window.runWrongbookTutorDiagramQA=function(){
    installHooks();
    const example='丙酮酸進入粒線體後，克氏循環主要在粒線體基質進行；電子傳遞鏈位於粒線體內膜。';
    const inferred=inferFromStage({goal:'位置關係',promptToStudent:example,actions:[]});
    const parsed=parseMarker('[[DIAGRAM|mitochondrion|title=粒線體中的反應位置|outside=丙酮酸|matrix=克氏循環|inner=電子傳遞鏈]]');
    const fixture=document.createElement('div');fixture.className='v5-tutor-stage';
    fixture.innerHTML='<p>fixture</p>';
    mountDiagram(fixture,{goal:'位置關係',promptToStudent:example,actions:[]});
    const svg=fixture.querySelector('.v8-ai-diagram svg');
    const text=fixture.textContent||'';
    const semanticOk=inferred?.template==='mitochondrion'&&inferred?.fields?.outside==='丙酮酸'&&inferred?.fields?.matrix==='克氏循環'&&inferred?.fields?.inner==='電子傳遞鏈';
    const markerOk=parsed?.template==='mitochondrion'&&parsed?.fields?.matrix==='克氏循環';
    const renderOk=Boolean(svg)&&['丙酮酸','克氏循環','電子傳遞鏈'].every(x=>text.includes(x))&&svg.getAttribute('role')==='img';
    let markerSuppressed=true;
    try{
      if(typeof v5StageActions==='function'&&typeof selectedProblem==='function'){
        const out=v5StageActions({actions:[{kind:'write',text:'[[DIAGRAM|flow|title=測試|a=A|b=B|c=C]]',targetRegionId:'',tone:'guide',caption:'diagram'}]},selectedProblem());
        markerSuppressed=out.length===1&&out[0].kind==='pause'&&!out[0].text;
      }
    }catch{markerSuppressed=false}
    const pass=Boolean(semanticOk&&markerOk&&renderOk&&markerSuppressed&&window.__wrongbookTutorDiagramApiWrapped);
    return{pass,version:VERSION,semanticOk,markerOk,renderOk,markerSuppressed,apiProtocolInstalled:Boolean(window.__wrongbookTutorDiagramApiWrapped)};
  };

  function scheduleQA(tries=0){
    setTimeout(()=>{
      const result=window.runWrongbookTutorDiagramQA?.();
      if((!result||!result.apiProtocolInstalled)&&tries<30)return scheduleQA(tries+1);
      window.__wrongbookTutorDiagramV8QA=result;
      if(result&&!result.pass)console.warn('[Wrongbook tutor diagram QA failed]',result);
    },160);
  }
  scheduleQA();
})();
