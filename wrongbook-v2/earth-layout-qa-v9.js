// Hierarchy-aware publication collision gate. Runs only with ?earthLayoutQA=1.
(async()=>{
  if(!new URLSearchParams(location.search).has('earthLayoutQA')) return;

  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const rect=r=>({minX:r.left,minY:r.top,maxX:r.right,maxY:r.bottom});
  const overlaps=(a,b,eps=.5)=>Math.min(a.maxX,b.maxX)-Math.max(a.minX,b.minX)>eps&&Math.min(a.maxY,b.maxY)-Math.max(a.minY,b.minY)>eps;
  const contains=(a,b,pad=0)=>b.minX>=a.minX-pad&&b.maxX<=a.maxX+pad&&b.minY>=a.minY-pad&&b.maxY<=a.maxY+pad;
  const pointInside=(r,p,eps=.25)=>p.x>r.minX+eps&&p.x<r.maxX-eps&&p.y>r.minY+eps&&p.y<r.maxY-eps;
  const visible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>.5&&r.height>.5};
  const ids=(()=>{let i=0;const wm=new WeakMap();return el=>{if(!wm.has(el))wm.set(el,`el${++i}`);return wm.get(el)}})();
  const uniq=(arr,key,row)=>{if(!arr._keys)Object.defineProperty(arr,'_keys',{value:new Set()});if(!arr._keys.has(key)){arr._keys.add(key);arr.push(row)}};

  function nodeRect(sec,node,key='safeRect'){
    const sr=node?.[key]||node?.sourceRect;if(!sr)return null;
    const page=+sec.dataset.strictPage,h=window.SOURCE_HIERARCHY_V9?.[page],rr=sec.getBoundingClientRect(),sx=rr.width/910,sy=rr.height/1270;
    const isLocal=sr!==node.sourceRect;
    let x=sr.x+(isLocal?(node.sourceRect?.x||0):0),y=sr.y+(isLocal?(node.sourceRect?.y||0):0),w=sr.w??sr.width,hgt=sr.h??sr.height,p=node,guard=0;
    while(p?.parentId&&p.parentId!==`p${page}`&&guard++<30){const par=h?.nodes?.[p.parentId];if(!par)break;x+=par.sourceRect.x;y+=par.sourceRect.y;p=par;}
    return {minX:rr.left+x*sx,minY:rr.top+y*sy,maxX:rr.left+(x+w)*sx,maxY:rr.top+(y+hgt)*sy};
  }
  function localRect(sec,node,r){
    const base=nodeRect(sec,node,'sourceRect');if(!base||!r)return null;
    const sx=(base.maxX-base.minX)/(node.sourceRect.w||1),sy=(base.maxY-base.minY)/(node.sourceRect.h||1);
    return {minX:base.minX+r.x*sx,minY:base.minY+r.y*sy,maxX:base.minX+(r.x+r.w)*sx,maxY:base.minY+(r.y+r.h)*sy};
  }
  function isDesc(page,child,ancestor){
    if(!child||!ancestor)return false;if(child===ancestor)return true;
    const h=window.SOURCE_HIERARCHY_V9?.[page];let n=h?.nodes?.[child],guard=0;
    while(n?.parentId&&guard++<30){if(n.parentId===ancestor)return true;n=h?.nodes?.[n.parentId];}
    return false;
  }
  function smallestOwner(sec,cx,cy){
    const page=+sec.dataset.strictPage,h=window.SOURCE_HIERARCHY_V9?.[page];if(!h)return `p${page}`;
    let best=h.rootId,area=Infinity;
    for(const n of Object.values(h.nodes)){if(n.id===h.rootId)continue;const r=nodeRect(sec,n,'sourceRect');if(!r)continue;if(cx>=r.minX&&cx<=r.maxX&&cy>=r.minY&&cy<=r.maxY){const a=(r.maxX-r.minX)*(r.maxY-r.minY);if(a<area){area=a;best=n.id}}}
    return best;
  }
  function ownerFor(sec,el,r){
    const page=+sec.dataset.strictPage,h=window.SOURCE_HIERARCHY_V9?.[page];
    const q=el.closest?.('[data-question]');if(q&&sec.contains(q)){const expected=window.v9SourceParentFor?.(page,+q.dataset.question);if(expected)return expected;}
    let obj=el.closest?.('[data-source-object]');
    while(obj&&sec.contains(obj)){const id=obj.dataset.sourceObject;if(id&&h?.nodes?.[id])return id;const parent=obj.parentElement;obj=parent?.closest?.('[data-source-object]')||null;}
    return smallestOwner(sec,(r.minX+r.maxX)/2,(r.minY+r.maxY)/2);
  }
  function collectText(sec){
    const out=[],walker=document.createTreeWalker(sec,NodeFilter.SHOW_TEXT,{acceptNode(n){const t=n.nodeValue?.trim(),p=n.parentElement;if(!t||!p||['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)||!visible(p)||p.closest('.v9-debug-layer'))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT;}});
    let n;while((n=walker.nextNode())){const range=document.createRange();range.selectNodeContents(n);for(const cr of range.getClientRects()){if(cr.width<.5||cr.height<.5)continue;const raw=rect(cr),el=n.parentElement,q=el.closest('[data-question]'),svg=el.closest('svg');out.push({...raw,raw,id:`text:${out.length}`,role:'text',block:q?`q${q.dataset.question}`:ids(el.closest('text')||el),question:q?.dataset.question||null,text:n.nodeValue.trim().slice(0,100),el,svg,owner:ownerFor(sec,el,raw)});}}
    return out;
  }
  function collectBlanks(sec){return [...sec.querySelectorAll('.v4strict-fill')].filter(visible).map((el,i)=>{const raw=rect(el.getBoundingClientRect()),q=el.closest('[data-question]');return {...raw,raw,id:`blank:${i}`,role:'blank',block:q?`q${q.dataset.question}`:ids(el),question:q?.dataset.question||null,el,owner:ownerFor(sec,el,raw)}})}

  // Figure collision regions are the actual rendered figure/graph boxes plus explicitly declared
  // protected geometry. A hierarchy sourceRect may contain labels and prompts around a figure, so
  // treating the whole topic rectangle as solid figure geometry produces false collisions.
  function figureRegions(sec){
    const page=+sec.dataset.strictPage,h=window.SOURCE_HIERARCHY_V9?.[page],out=[],seen=new Set();if(!h)return out;
    const add=(raw,owner,id)=>{if(!raw||raw.maxX-raw.minX<2||raw.maxY-raw.minY<2)return;const key=`${owner}|${Math.round(raw.minX)}|${Math.round(raw.minY)}|${Math.round(raw.maxX)}|${Math.round(raw.maxY)}`;if(seen.has(key))return;seen.add(key);out.push({...raw,raw,id,role:'figure',owner});};
    for(const el of sec.querySelectorAll('[data-source-role="figure"],[data-source-role="graph"],[data-figure-kind]')){
      if(!visible(el))continue;const raw=rect(el.getBoundingClientRect()),owner=ownerFor(sec,el,raw);add(raw,owner,`figure:${ids(el)}`);
    }
    for(const n of Object.values(h.nodes)){
      if(n.id===h.rootId)continue;
      for(let i=0;i<(n.protectedGeometry||[]).length;i++){const g=n.protectedGeometry[i],raw=localRect(sec,n,g.rect);add(raw,n.id,`${n.id}:protected:${i}`);}
      if(n.safeRect!==n.sourceRect&&(n.type==='protected-figure'||n.containerKind==='source-figure-with-label-anchors'))add(nodeRect(sec,n,'safeRect'),n.id,`${n.id}:safe`);
    }
    return out;
  }
  function pathKind(path){
    const svg=path.ownerSVGElement,role=(svg?.dataset.sourceRole||svg?.closest('[data-source-role]')?.dataset.sourceRole||'').toLowerCase();
    const cls=((svg?.className?.baseVal||svg?.getAttribute('class')||'')+' '+(path.className?.baseVal||path.getAttribute('class')||'')).toLowerCase();
    if(role==='connector'||/(connector|branch|tree-lines|ocean-lines|edge)/.test(cls))return 'connector';
    if(role==='graph'||svg?.dataset.graphKind||/(temperature-depth|surface-salinity|saturation-graph|graph-curve|profile-curve)/.test(cls))return 'graph';
    return null;
  }
  function collectPaths(sec){
    const out={connector:[],graph:[]};
    for(const path of sec.querySelectorAll('svg path')){if(!visible(path))continue;const kind=pathKind(path);if(!kind)continue;let len=0;try{len=path.getTotalLength()}catch{}if(!Number.isFinite(len)||len<1)continue;const svg=path.ownerSVGElement,ctm=path.getScreenCTM();if(!ctm)continue;const sr=rect(svg.getBoundingClientRect()),pts=[];for(let d=0;d<=len;d+=1.75){const p=path.getPointAtLength(d),sp=new DOMPoint(p.x,p.y).matrixTransform(ctm);pts.push({x:sp.x,y:sp.y,d,len});}out[kind].push({id:`${kind}:${ids(path)}`,kind,path,svg,owner:ownerFor(sec,svg,sr),pts,len});}
    return out;
  }
  function anchorRect(sec,node,qNum){
    const a=node?.anchors?.[`q${qNum}`];if(!a)return null;const sr=nodeRect(sec,node,'sourceRect');if(!sr)return null;
    const sx=(sr.maxX-sr.minX)/(node.sourceRect.w||1),sy=(sr.maxY-sr.minY)/(node.sourceRect.h||1);
    return {minX:sr.minX+a.x*sx,minY:sr.minY+a.y*sy,maxX:sr.minX+(a.x+a.w)*sx,maxY:sr.minY+(a.y+a.h)*sy};
  }
  function audit(sec,mode){
    const page=+sec.dataset.strictPage,h=window.SOURCE_HIERARCHY_V9?.[page],lines=collectText(sec),blanks=collectBlanks(sec),figures=figureRegions(sec),paths=collectPaths(sec);
    const index=new RBushV9(12).load([...lines,...blanks,...figures]);
    const bad={textText:[],textConnector:[],textGraph:[],textFigure:[],blankConnector:[],blankGraph:[],figureFigure:[],containerChild:[],clippedText:[],overflowedText:[],microFont:[],duplicateOwnership:[],wrongParent:[]};

    for(const a of lines){for(const b of index.search(a)){
      if(b.role==='text'&&a.id<b.id&&a.block!==b.block&&overlaps(a.raw,b.raw,.5))uniq(bad.textText,`${a.id}|${b.id}`,[a.id,b.id,a.text,b.text]);
      if(b.role==='figure'&&!isDesc(page,a.owner,b.owner)&&overlaps(a.raw,b.raw,.5))uniq(bad.textFigure,`${a.id}|${b.id}`,[a.id,b.id,a.text,b.id,a.owner]);
    }}
    for(let i=0;i<figures.length;i++)for(let j=i+1;j<figures.length;j++){const a=figures[i],b=figures[j];if(!isDesc(page,a.owner,b.owner)&&!isDesc(page,b.owner,a.owner)&&overlaps(a.raw,b.raw,.5))uniq(bad.figureFigure,`${a.id}|${b.id}`,[a.id,b.id]);}

    function testPath(po,kind){
      const bucket=kind==='connector'?'textConnector':'textGraph',blankBucket=kind==='connector'?'blankConnector':'blankGraph';
      for(const p of po.pts){for(const hit of index.search({minX:p.x,minY:p.y,maxX:p.x,maxY:p.y})){
        if(hit.role==='figure')continue;
        if(hit.role==='text'){
          if(!pointInside(hit.raw,p,.15))continue;
          if(hit.svg===po.svg)continue;
          if(kind==='connector'&&(p.d<4||po.len-p.d<4))continue;
          uniq(bad[bucket],`${hit.id}|${po.id}`,[hit.id,po.id,hit.text,hit.owner,po.owner]);
        } else if(hit.role==='blank'){
          if(!pointInside(hit.raw,p,.15))continue;
          if(kind==='connector'&&(p.d<4||po.len-p.d<4))continue;
          uniq(bad[blankBucket],`${hit.id}|${po.id}`,[hit.id,po.id,hit.question,hit.owner,po.owner]);
        }
      }}
    }
    paths.connector.forEach(p=>testPath(p,'connector'));paths.graph.forEach(p=>testPath(p,'graph'));

    for(const q of sec.querySelectorAll('[data-question]')){
      if(!visible(q))continue;const n=+q.dataset.question,expected=window.v9SourceParentFor?.(page,n),parent=q.dataset.parentId||expected;
      if(!expected||!h?.nodes?.[expected]||parent!==expected)uniq(bad.wrongParent,`${n}|${parent}|${expected}`,[n,parent,expected]);
      const fs=parseFloat(getComputedStyle(q).fontSize);if(q.matches('.v9-q')&&fs<12.5)uniq(bad.microFont,`${n}|${fs}`,[n,fs]);
      const qr=rect(q.getBoundingClientRect());for(const l of lines.filter(x=>x.block===`q${n}`))if(l.raw.minX<qr.minX-2||l.raw.maxX>qr.maxX+2)uniq(bad.overflowedText,`${n}|${l.id}`,[n,l.text]);
      const pn=h?.nodes?.[expected];if(pn){let allowed=null;if(['source-box','source-cloud','source-panel','source-strip'].includes(pn.containerKind))allowed=nodeRect(sec,pn,'contentRect');else if(pn.containerKind==='source-figure-with-label-anchors')allowed=anchorRect(sec,pn,n);if(allowed)for(const l of lines.filter(x=>x.block===`q${n}`))if(!contains(allowed,l.raw,3))uniq(bad.containerChild,`${n}|${l.id}`,[n,expected,l.text]);}
    }

    const byNum=new Map();for(const q of sec.querySelectorAll('[data-question]'))if(visible(q)){const n=q.dataset.question;if(!byNum.has(n))byNum.set(n,[]);byNum.get(n).push(q);}for(const [n,els] of byNum)if(els.length>1&&!(page===243&&n==='48'))uniq(bad.duplicateOwnership,n,[+n,els.length]);
    const sr=rect(sec.getBoundingClientRect());for(const l of lines)if(!contains(sr,l.raw,2))uniq(bad.clippedText,l.id,[l.question,l.text]);
    const counts=Object.fromEntries(Object.entries(bad).map(([k,v])=>[k,v.length])),ok=Object.values(counts).every(v=>v===0);
    return {page,mode,ok,counts,textLines:lines.length,blanks:blanks.length,figures:figures.length,connectors:paths.connector.length,graphs:paths.graph.length,bad};
  }

  async function openMindmap(){await sleep(300);document.querySelector('.sidebar [data-page="mindmap"],.mobile-drawer [data-page="mindmap"]')?.click();await sleep(300);document.querySelector('[data-subject="earth"]')?.click();await sleep(350);}
  const reports=[];
  try{
    await openMindmap();
    for(const mode of ['recall','learn'])for(let ch=1;ch<=6;ch++){
      document.querySelector(`[data-v4ref-chapter="${ch}"]`)?.click();await sleep(180);document.querySelector(`[data-v4ref-mode="${mode}"]`)?.click();await sleep(240);await document.fonts.ready;await sleep(80);
      for(const sec of document.querySelectorAll('[data-strict-page][data-source-hierarchy-version="9"]'))reports.push(audit(sec,mode));
    }
    const pages=[...new Set(reports.map(r=>r.page))].sort((a,b)=>a-b),modes=[...new Set(reports.map(r=>r.mode))],duplicates=reports.filter((r,i)=>reports.findIndex(x=>x.page===r.page&&x.mode===r.mode)!==i);
    const pass=pages.length===12&&pages[0]===242&&pages[11]===253&&modes.length===2&&!duplicates.length&&reports.length===24&&reports.every(r=>r.ok);
    const totals={};for(const r of reports)for(const [k,n] of Object.entries(r.counts))totals[k]=(totals[k]||0)+n;
    const result={status:pass?'PASS':'FAIL',sourceAuthority:'ONLY_CURRENT_NEW_SOURCE_TRUTH_12_PHOTOS',pages,modes,reports:reports.map(r=>({...r,bad:r.ok?undefined:r.bad})),totals,hierarchyPages:Object.keys(window.SOURCE_HIERARCHY_V9||{}).length,canonical:window.v4RefValidateData?.()};
    const box=document.createElement('pre');box.id='earth-layout-qa-results';box.dataset.status=result.status;box.textContent=JSON.stringify(result,null,2);document.body.appendChild(box);
  }catch(err){const box=document.createElement('pre');box.id='earth-layout-qa-results';box.dataset.status='FAIL';box.textContent=JSON.stringify({status:'FAIL',error:String(err),stack:err?.stack,reports},null,2);document.body.appendChild(box);}
})();
