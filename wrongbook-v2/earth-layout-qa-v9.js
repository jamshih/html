// Hierarchy-aware publication collision gate. Runs only with ?earthLayoutQA=1.
(async()=>{
 if(!new URLSearchParams(location.search).has('earthLayoutQA'))return;
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const px=r=>({minX:r.left,minY:r.top,maxX:r.right,maxY:r.bottom});
 const overlap=(a,b,eps=.5)=>Math.min(a.maxX,b.maxX)-Math.max(a.minX,b.minX)>eps&&Math.min(a.maxY,b.maxY)-Math.max(a.minY,b.minY)>eps;
 const contains=(a,b,pad=0)=>b.minX>=a.minX-pad&&b.maxX<=a.maxX+pad&&b.minY>=a.minY-pad&&b.maxY<=a.maxY+pad;
 const expand=(r,m)=>({minX:r.minX-m,minY:r.minY-m,maxX:r.maxX+m,maxY:r.maxY+m});
 const cssVisible=el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)!==0&&r.width>.5&&r.height>.5};
 const rid=(()=>{let i=0;const wm=new WeakMap;return el=>{if(!wm.has(el))wm.set(el,`el${++i}`);return wm.get(el)}})();
 function nodeRect(sec,node,use='safeRect'){
   const sr=node?.[use]||node?.sourceRect;if(!sr)return null;const r=sec.getBoundingClientRect(),sx=r.width/910,sy=r.height/1270;
   let x=sr.x,y=sr.y,w=sr.w??sr.width,h=sr.h??sr.height;
   let p=node;while(p?.parentId&&p.parentId!==`p${sec.dataset.strictPage}`){const par=window.SOURCE_HIERARCHY_V9?.[+sec.dataset.strictPage]?.nodes?.[p.parentId];if(!par)break;const pr=par.sourceRect;x+=pr.x;y+=pr.y;p=par;}
   return {minX:r.left+x*sx,minY:r.top+y*sy,maxX:r.left+(x+w)*sx,maxY:r.top+(y+h)*sy};
 }
 function smallestSourceOwner(sec,cx,cy){
   const page=+sec.dataset.strictPage,h=window.SOURCE_HIERARCHY_V9?.[page];if(!h)return h?.rootId||`p${page}`;let best=h.rootId,ba=Infinity;
   for(const n of Object.values(h.nodes)){if(n.id===h.rootId)continue;const r=nodeRect(sec,n,'sourceRect');if(r&&cx>=r.minX&&cx<=r.maxX&&cy>=r.minY&&cy<=r.maxY){const a=(r.maxX-r.minX)*(r.maxY-r.minY);if(a<ba){ba=a;best=n.id}}}return best;
 }
 function isDesc(page,child,ancestor){if(!child||!ancestor)return false;if(child===ancestor)return true;const h=window.SOURCE_HIERARCHY_V9?.[page];let n=h?.nodes?.[child],guard=0;while(n?.parentId&&guard++<20){if(n.parentId===ancestor)return true;n=h.nodes[n.parentId]}return false}
 function textLines(sec){
   const out=[],walker=document.createTreeWalker(sec,NodeFilter.SHOW_TEXT,{acceptNode(n){if(!n.nodeValue?.trim())return NodeFilter.FILTER_REJECT;const p=n.parentElement;if(!p||['SCRIPT','STYLE','NOSCRIPT'].includes(p.tagName)||!cssVisible(p))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT}});
   let n;while(n=walker.nextNode()){
     const range=document.createRange();range.selectNodeContents(n);for(const cr of range.getClientRects()){
       if(cr.width<.5||cr.height<.5)continue;const base=px(cr),el=n.parentElement,q=el.closest('[data-question]'),explicit=el.closest('[data-source-owner],[data-source-object]');const cx=(base.minX+base.maxX)/2,cy=(base.minY+base.maxY)/2;const owner=explicit?.dataset.sourceOwner||explicit?.dataset.sourceObject||q?.dataset.parentId||smallestSourceOwner(sec,cx,cy);out.push({...expand(base,4),raw:base,id:`text:${out.length}`,role:'text',owner,block:q?`q${q.dataset.question}`:rid(el.closest('svg')||el),question:q?.dataset.question||null,text:n.nodeValue.trim().slice(0,80),el});
     }
   }return out;
 }
 function blanks(sec){return [...sec.querySelectorAll('.v4strict-fill')].filter(cssVisible).map((el,i)=>{const r=px(el.getBoundingClientRect()),q=el.closest('[data-question]');return {...expand(r,2),raw:r,id:`blank:${i}`,role:'blank',owner:q?.dataset.parentId||smallestSourceOwner(sec,(r.minX+r.maxX)/2,(r.minY+r.maxY)/2),block:q?`q${q.dataset.question}`:rid(el),question:q?.dataset.question||null,el}})}
 function regionRects(sec){const page=+sec.dataset.strictPage,h=window.SOURCE_HIERARCHY_V9?.[page],fig=[],graph=[];if(h)for(const n of Object.values(h.nodes)){if(n.id===h.rootId)continue;const r=nodeRect(sec,n,'safeRect');if(!r)continue;if(n.type==='protected-figure'||n.containerKind==='source-figure-with-label-anchors')fig.push({...r,id:n.id,owner:n.id,role:'figure'});}
   for(const el of sec.querySelectorAll('[data-source-role="graph"]'))if(cssVisible(el)){const r=px(el.getBoundingClientRect());graph.push({...r,id:`graph:${rid(el)}`,owner:el.closest('[data-source-object]')?.dataset.sourceObject||smallestSourceOwner(sec,(r.minX+r.maxX)/2,(r.minY+r.maxY)/2),role:'graph',el})}
   return{fig,graph};
 }
 function pathKind(path){const svg=path.ownerSVGElement,role=svg?.closest('[data-source-role]')?.dataset.sourceRole||'',cl=((svg?.getAttribute('class')||'')+' '+(path.getAttribute('class')||'')).toLowerCase();if(role==='connector'||/(lines|tree|branch|connector|edge|correct)/.test(cl))return'connector';if(role==='graph'||/(graph|curve|profile|temp|sal|enso|saturation)/.test(cl))return'graph';return null}
 function samplePaths(sec){const out={connector:[],graph:[]};for(const path of sec.querySelectorAll('svg path')){if(!cssVisible(path))continue;const kind=pathKind(path);if(!kind)continue;let len=0;try{len=path.getTotalLength()}catch{}if(!Number.isFinite(len)||len<1)continue;const svg=path.ownerSVGElement,ctm=path.getScreenCTM();if(!ctm)continue;const rr=svg.getBoundingClientRect(),owner=svg.closest('[data-source-object]')?.dataset.sourceObject||smallestSourceOwner(sec,(rr.left+rr.right)/2,(rr.top+rr.bottom)/2);const pts=[];const step=1.75;for(let d=0;d<=len;d+=step){const p=path.getPointAtLength(d),sp=new DOMPoint(p.x,p.y).matrixTransform(ctm);pts.push({x:sp.x,y:sp.y,d,len})}out[kind].push({id:`${kind}:${rid(path)}`,kind,owner,path,pts});}return out}
 function pointHits(index,pt){return index.search({minX:pt.x,minY:pt.y,maxX:pt.x,maxY:pt.y})}
 function auditPage(sec,mode){
   const page=+sec.dataset.strictPage,lines=textLines(sec),bs=blanks(sec),regions=regionRects(sec),paths=samplePaths(sec),idx=new RBushV9(12).load([...lines,...bs,...regions.fig,...regions.graph]);
   const bad={textText:[],textConnector:[],textGraph:[],textFigure:[],blankConnector:[],blankGraph:[],figureFigure:[],containerChild:[],clippedText:[],overflowedText:[],microFont:[],duplicateOwnership:[],wrongParent:[]};
   for(let i=0;i<lines.length;i++)for(const b of idx.search(lines[i])){const a=lines[i];if(b.role==='text'&&a.id<b.id&&a.block!==b.block&&overlap(a,b,1))bad.textText.push([a.id,b.id,a.text,b.text]);if(b.role==='figure'&&!isDesc(page,a.owner,b.owner)&&overlap(a,b,1))bad.textFigure.push([a.id,b.id,a.text]);if(b.role==='graph'&&!isDesc(page,a.owner,b.owner)&&overlap(a,b,1))bad.textGraph.push([a.id,b.id,a.text]);}
   for(let i=0;i<regions.fig.length;i++)for(let j=i+1;j<regions.fig.length;j++){const a=regions.fig[i],b=regions.fig[j];if(!isDesc(page,a.owner,b.owner)&&!isDesc(page,b.owner,a.owner)&&overlap(a,b,1))bad.figureFigure.push([a.id,b.id])}
   const testPath=(po,role)=>{for(const pt of po.pts){for(const hit of pointHits(idx,pt)){if(hit.role==='text'){if(isDesc(page,hit.owner,po.owner))continue;if(role==='connector'&&(pt.d<5||po.len-pt.d<5))continue;bad[role==='connector'?'textConnector':'textGraph'].push([hit.id,po.id,hit.text]);return}if(hit.role==='blank'){if(isDesc(page,hit.owner,po.owner))continue;if(role==='connector'&&(pt.d<5||po.len-pt.d<5))continue;bad[role==='connector'?'blankConnector':'blankGraph'].push([hit.id,po.id]);return}}}};
   paths.connector.forEach(p=>testPath(p,'connector'));paths.graph.forEach(p=>testPath(p,'graph'));
   const h=window.SOURCE_HIERARCHY_V9?.[page];
   for(const q of sec.querySelectorAll('[data-question]')){if(!cssVisible(q))continue;const n=+q.dataset.question,parent=q.dataset.parentId||window.v9SourceParentFor?.(page,n);if(!parent||!h?.nodes?.[parent])bad.wrongParent.push(n);const owners=new Set([...q.querySelectorAll('[data-source-owner]')].map(x=>x.dataset.sourceOwner));if(owners.size>1)bad.duplicateOwnership.push(n);const fs=parseFloat(getComputedStyle(q).fontSize);if(fs<12.5)bad.microFont.push([n,fs]);if(q.scrollWidth>q.clientWidth+2||q.scrollHeight>q.clientHeight+2)bad.overflowedText.push(n);
     const pn=h?.nodes?.[parent];if(pn&&pn.containerKind!=='none'){const pr=nodeRect(sec,pn,'contentRect')||nodeRect(sec,pn,'sourceRect');for(const l of lines.filter(x=>x.block===`q${n}`))if(pr&&!contains(pr,l.raw,2))bad.containerChild.push([n,parent,l.text]);}
   }
   const sr=px(sec.getBoundingClientRect());for(const l of lines)if(!contains(sr,l.raw,2))bad.clippedText.push([l.question,l.text]);
   for(const k of Object.keys(bad)){if(Array.isArray(bad[k])&&bad[k].length>50)bad[k]=bad[k].slice(0,50)}
   const counts=Object.fromEntries(Object.entries(bad).map(([k,v])=>[k,v.length]));const ok=Object.values(counts).every(n=>n===0);
   return{page,mode,ok,counts,bad,textLines:lines.length,blanks:bs.length,connectors:paths.connector.length,graphs:paths.graph.length};
 }
 async function openMindmap(){await sleep(300);document.querySelector('.sidebar [data-page="mindmap"],.mobile-drawer [data-page="mindmap"]')?.click();await sleep(300);document.querySelector('[data-subject="earth"]')?.click();await sleep(350)}
 const reports=[];try{
   await openMindmap();
   for(const mode of ['recall','learn'])for(let ch=1;ch<=6;ch++){
     document.querySelector(`[data-v4ref-chapter="${ch}"]`)?.click();await sleep(180);document.querySelector(`[data-v4ref-mode="${mode}"]`)?.click();await sleep(240);await document.fonts.ready;await sleep(80);
     for(const sec of document.querySelectorAll('[data-strict-page][data-source-hierarchy-version="9"]'))reports.push(auditPage(sec,mode));
   }
   const pages=[...new Set(reports.map(r=>r.page))].sort((a,b)=>a-b),modes=[...new Set(reports.map(r=>r.mode))];const dup=reports.filter((r,i)=>reports.findIndex(x=>x.page===r.page&&x.mode===r.mode) !== i);const pass=pages.length===12&&pages[0]===242&&pages[11]===253&&modes.length===2&&!dup.length&&reports.length===24&&reports.every(r=>r.ok);
   const counts={};for(const r of reports)for(const [k,n] of Object.entries(r.counts))counts[k]=(counts[k]||0)+n;
   const result={status:pass?'PASS':'FAIL',sourceAuthority:'ONLY_CURRENT_NEW_SOURCE_TRUTH_12_PHOTOS',pages,modes,reports:reports.map(r=>({page:r.page,mode:r.mode,ok:r.ok,counts:r.counts,textLines:r.textLines,blanks:r.blanks,connectors:r.connectors,graphs:r.graphs,bad:r.ok?undefined:r.bad})),totals:counts,hierarchyPages:Object.keys(window.SOURCE_HIERARCHY_V9||{}).length,canonical:window.v4RefValidateData?.()};
   const box=document.createElement('pre');box.id='earth-layout-qa-results';box.dataset.status=result.status;box.textContent=JSON.stringify(result,null,2);document.body.appendChild(box);
 }catch(err){const box=document.createElement('pre');box.id='earth-layout-qa-results';box.dataset.status='FAIL';box.textContent=JSON.stringify({status:'FAIL',error:String(err),stack:err?.stack,reports},null,2);document.body.appendChild(box)}
})();
