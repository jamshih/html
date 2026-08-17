// Wrong Book V9 — stable user ink geometry + AI diagram/key-concept overlay on the worksheet.
(function(){
  const VERSION='2026-08-17-paper-overlay-v9';
  if(window.__wrongbookPaperOverlayV9===VERSION)return;
  window.__wrongbookPaperOverlayV9=VERSION;

  const KNOWN_TERMS=['電子傳遞鏈','克氏循環','檸檬酸循環','粒線體基質','粒線體內膜','粒線體','丙酮酸','ATP 合成酶','質子梯度','基質','內膜','氧氣','ATP'];
  let observer=null,queued=false,resizeObserver=null,saveInkWrapped=false,sequence=0;

  function appState(){try{return typeof state!=='undefined'?state:null}catch{return null}}
  function currentProblem(){try{return typeof selectedProblem==='function'?selectedProblem():null}catch{return null}}
  function currentStage(){
    const p=currentProblem(),st=appState();
    if(!p||!st)return null;
    const s=st.tutorSessions?.[p.id];
    return s?.stages?.[s.activeIndex]||null;
  }
  function paper(){return document.getElementById('paper')||document.querySelector('.v3-paper,.paper')}
  function directChildContent(p){
    if(!p)return[];
    return [...p.children].filter(el=>el.matches?.('.paper-demo,.scan-photo,.scan-text'));
  }
  function baseHeight(p){
    if(!p)return 500;
    const pr=p.getBoundingClientRect(),nodes=directChildContent(p);
    let bottom=0;
    for(const el of nodes){
      if(getComputedStyle(el).display==='none')continue;
      const r=el.getBoundingClientRect();bottom=Math.max(bottom,r.bottom-pr.top);
    }
    return Math.max(500,Math.ceil(bottom||500));
  }
  function setLayerHeight(p){
    if(!p)return 500;
    const h=baseHeight(p);
    const old=Number(p.dataset.v9ProblemLayerHeight)||0;
    p.dataset.v9ProblemLayerHeight=String(h);
    p.style.setProperty('--v9-problem-layer-height',`${h}px`);
    if(Math.abs(old-h)>.5)resyncCanvases(p);
    return h;
  }
  function resyncCanvas(c){
    if(!c)return;
    const r=c.getBoundingClientRect();if(!r.width||!r.height)return;
    const dpr=Math.min(3,window.devicePixelRatio||1),w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));
    if(c.width!==w||c.height!==h){c.width=w;c.height=h}
    const ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
    try{
      if(c.id==='drawCanvas'&&typeof drawing!=='undefined'){
        drawing.canvas=c;drawing.ctx=ctx;
        if(typeof redrawCanvas==='function')redrawCanvas();
      }else if(c.id==='aiGuideCanvas'&&typeof v3GuideDraw==='function'&&typeof v3GuideRuntime!=='undefined'){
        v3GuideDraw(v3GuideRuntime.elapsed||0);
      }
    }catch{}
  }
  function resyncCanvases(p){
    if(!p)return;
    requestAnimationFrame(()=>{
      resyncCanvas(p.querySelector('#drawCanvas'));
      resyncCanvas(p.querySelector('#aiGuideCanvas'));
    });
  }
  function ensureLayer(p){
    if(!p)return null;
    let layer=p.querySelector(':scope > .v9-paper-ai-layer');
    if(!layer){
      layer=document.createElement('div');layer.className='v9-paper-ai-layer';layer.setAttribute('aria-live','polite');
      const draw=p.querySelector(':scope > #drawCanvas');
      if(draw)draw.insertAdjacentElement('beforebegin',layer);else p.appendChild(layer);
    }
    return layer;
  }
  function rectRelativeTo(r,root){
    const rr=root.getBoundingClientRect();
    return{left:r.left-rr.left,top:r.top-rr.top,right:r.right-rr.left,bottom:r.bottom-rr.top,width:r.width,height:r.height};
  }
  function rangeRect(el){
    try{
      const range=document.createRange();range.selectNodeContents(el);const r=range.getBoundingClientRect();
      if(r.width&&r.height)return r;
    }catch{}
    return el.getBoundingClientRect();
  }
  function inflate(r,pad){return{left:r.left-pad,top:r.top-pad,right:r.right+pad,bottom:r.bottom+pad,width:r.width+pad*2,height:r.height+pad*2}}
  function overlap(a,b){return!(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom)}
  function inside(r,w,h,pad=8){return r.left>=pad&&r.top>=pad&&r.right<=w-pad&&r.bottom<=h-pad}
  function clampNum(n,a,b){return Math.max(a,Math.min(b,n))}

  function inkRects(p){
    const c=p?.querySelector('#drawCanvas');if(!c)return[];
    const cr=c.getBoundingClientRect(),pr=p.getBoundingClientRect();
    let paths=[];
    try{paths=Array.isArray(drawing?.paths)?drawing.paths:[]}catch{}
    const out=[];
    for(const path of paths){
      const pts=path?.pts||path?.points||[];if(!pts.length)continue;
      let minX=1,minY=1,maxX=0,maxY=0;
      for(const pt of pts){
        const x=Number(pt.x),y=Number(pt.y);if(!Number.isFinite(x)||!Number.isFinite(y))continue;
        minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
      }
      if(maxX<minX||maxY<minY)continue;
      const r={left:(cr.left-pr.left)+minX*cr.width,top:(cr.top-pr.top)+minY*cr.height,right:(cr.left-pr.left)+maxX*cr.width,bottom:(cr.top-pr.top)+maxY*cr.height,width:(maxX-minX)*cr.width,height:(maxY-minY)*cr.height};
      out.push(inflate(r,path.tool==='eraser'?5:16));
    }
    return out;
  }
  function printedRects(p){
    const selectors=['.paper-demo h4','.paper-demo .paper-option','.paper-demo .hand-note','.scan-text','.ai-overlay-note'];
    const out=[];
    for(const el of p.querySelectorAll(selectors.join(','))){
      if(getComputedStyle(el).display==='none')continue;
      const r=rectRelativeTo(rangeRect(el),p);if(r.width&&r.height)out.push(inflate(r,6));
    }
    const toolbar=p.querySelector('.paper-toolbar');
    if(toolbar&&getComputedStyle(toolbar).display!=='none'){
      const r=rectRelativeTo(toolbar.getBoundingClientRect(),p);out.push(inflate(r,5));
    }
    return out;
  }
  function sourceDiagram(){return document.querySelector('.v5-tutor-stage > .v8-ai-diagram')}
  function sanitizeCloneIds(root){
    const prefix=`v9dg${++sequence}-`,map=new Map();
    root.querySelectorAll('[id]').forEach(el=>{const old=el.id,nw=prefix+old;map.set(old,nw);el.id=nw});
    if(map.size){
      root.querySelectorAll('*').forEach(el=>{
        for(const attr of [...el.attributes||[]]){
          let value=attr.value;
          for(const [old,nw] of map){value=value.replaceAll(`url(#${old})`,`url(#${nw})`).replaceAll(`#${old}`,`#${nw}`)}
          if(value!==attr.value)el.setAttribute(attr.name,value);
        }
      });
    }
  }
  function normalizedText(s=''){return String(s).replace(/\s+/g,' ').replace(/^[：:、，。；;\s]+|[：:、，。；;\s]+$/g,'').trim()}
  function keyConcepts(stage,diagramText=''){
    const text=normalizedText(diagramText),out=[];
    const add=x=>{x=normalizedText(x);if(!x||x.length<3||x.length>38||out.includes(x))return;if(/[？?]$/.test(x))return;out.push(x)};
    if(text.includes('丙酮酸'))add('丙酮酸 → 進入粒線體');
    if(text.includes('克氏循環')&&text.includes('基質'))add('克氏循環：粒線體基質');
    if(text.includes('檸檬酸循環')&&text.includes('基質'))add('檸檬酸循環：粒線體基質');
    if(text.includes('電子傳遞鏈')&&text.includes('內膜'))add('電子傳遞鏈：粒線體內膜');
    if(text.includes('ATP 合成酶'))add('ATP 合成酶：利用質子梯度合成 ATP');
    const candidates=[stage?.successCriteria,stage?.goal,stage?.expectedStudentEvidence].filter(Boolean).flatMap(x=>String(x).split(/[。；;！!\n]/));
    for(const c of candidates){if(out.length>=3)break;add(c)}
    return out.slice(0,3);
  }
  function relevantKeywords(stage,src){
    const corpus=[src?.textContent,stage?.goal,stage?.promptToStudent,stage?.successCriteria,stage?.expectedStudentEvidence].filter(Boolean).join(' ');
    return KNOWN_TERMS.filter(x=>corpus.includes(x)).sort((a,b)=>b.length-a.length);
  }
  function findAnchor(p,keywords){
    const nodes=[...p.querySelectorAll('.paper-demo h4,.paper-demo .paper-option,.scan-text')];
    let best=null;
    for(const el of nodes){
      const text=normalizedText(el.textContent||'');if(!text)continue;
      let score=0;
      for(const k of keywords)if(text.includes(k))score+=k.length*k.length;
      if(!score&&el.matches('.paper-demo h4'))score=1;
      if(!best||score>best.score){best={el,score,rect:rectRelativeTo(rangeRect(el),p)}}
    }
    return best?.rect||null;
  }
  function candidateRect(left,top,w,h){return{left,top,right:left+w,bottom:top+h,width:w,height:h}}
  function distanceScore(r,a){
    if(!a)return r.top*.12+(r.left<1?100:0);
    const cx=(r.left+r.right)/2,cy=(r.top+r.bottom)/2,ax=(a.left+a.right)/2,ay=(a.top+a.bottom)/2;
    return Math.hypot(cx-ax,cy-ay)+Math.max(0,r.top-a.bottom)*.08;
  }
  function place(w,h,boxW,boxH,anchor,forbidden){
    const candidates=[];
    if(anchor){
      candidates.push(candidateRect(anchor.right+12,anchor.top,w,h));
      candidates.push(candidateRect(anchor.left,anchor.bottom+12,w,h));
      candidates.push(candidateRect(anchor.left-w-12,anchor.top,w,h));
      candidates.push(candidateRect(anchor.right-w,anchor.bottom+12,w,h));
    }
    candidates.push(candidateRect(boxW-w-12,12,w,h),candidateRect(boxW-w-12,boxH-h-12,w,h),candidateRect(12,boxH-h-12,w,h));
    const step=Math.max(14,Math.round(Math.min(boxW,boxH)/34));
    for(let y=10;y<=boxH-h-10;y+=step){for(let x=10;x<=boxW-w-10;x+=step)candidates.push(candidateRect(x,y,w,h))}
    let best=null;
    for(const r of candidates){
      if(!inside(r,boxW,boxH,8))continue;
      if(forbidden.some(f=>overlap(r,f)))continue;
      const score=distanceScore(r,anchor);
      if(!best||score<best.score)best={rect:r,score};
    }
    return best?.rect||null;
  }
  function cardMarkup(src,concepts){
    const clone=src.cloneNode(true);sanitizeCloneIds(clone);clone.classList.add('v9-sheet-diagram-copy');clone.removeAttribute('style');
    const card=document.createElement('div');card.className='v9-sheet-ai-card';card.setAttribute('role','note');card.appendChild(clone);
    if(concepts.length){const ks=document.createElement('div');ks.className='v9-sheet-key-concepts';ks.innerHTML=concepts.map(x=>`<span>${String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</span>`).join('');card.appendChild(ks)}
    return card;
  }
  function mountSheetDiagram(p){
    const layer=ensureLayer(p),src=sourceDiagram(),stage=currentStage();
    if(!layer)return false;
    if(!src||!stage){layer.replaceChildren();document.body.classList.remove('v9-sheet-ai-active');return false}
    const h=setLayerHeight(p),pr=p.getBoundingClientRect();if(!pr.width||!h)return false;
    const signature=[src.dataset.v8Signature||src.textContent||'',stage.id||'',stage.promptToStudent||'',stage.successCriteria||''].join('|');
    let card=layer.querySelector('.v9-sheet-ai-card');
    if(!card||card.dataset.v9Signature!==signature){
      layer.replaceChildren();card=cardMarkup(src,keyConcepts(stage,src.textContent||''));card.dataset.v9Signature=signature;card.style.visibility='hidden';card.style.left='0px';card.style.top='0px';layer.appendChild(card);
    }
    const maxW=clampNum(pr.width*.34,250,360);card.style.width=`${Math.round(maxW)}px`;card.style.maxWidth=`calc(100% - 20px)`;
    const measured=card.getBoundingClientRect();let cw=Math.min(maxW,Math.max(230,measured.width||maxW)),ch=Math.max(150,measured.height||220);
    const forbidden=[...printedRects(p),...inkRects(p)];
    const anchor=findAnchor(p,relevantKeywords(stage,src));
    let pos=place(cw,ch,pr.width,h,anchor,forbidden);
    if(!pos&&cw>270){cw=270;card.style.width='270px';const m=card.getBoundingClientRect();ch=Math.max(145,m.height||190);pos=place(cw,ch,pr.width,h,anchor,forbidden)}
    if(!pos){card.remove();document.body.classList.remove('v9-sheet-ai-active');return false}
    card.style.left=`${Math.round(pos.left)}px`;card.style.top=`${Math.round(pos.top)}px`;card.style.visibility='visible';
    card.dataset.v9Left=String(pos.left);card.dataset.v9Top=String(pos.top);
    document.body.classList.add('v9-sheet-ai-active');return true;
  }
  function wrapSaveInk(){
    if(saveInkWrapped)return;
    try{
      if(typeof saveInk!=='function')return;
      const base=saveInk;
      window.saveInk=function(){const out=base.apply(this,arguments);queueApply();return out};
      try{saveInk=window.saveInk}catch{}
      saveInkWrapped=true;
    }catch{}
  }
  function bindImage(p){
    const img=p?.querySelector('.scan-photo');if(img&&!img.dataset.v9LayerBound){img.dataset.v9LayerBound='1';img.addEventListener('load',queueApply)}
  }
  function apply(){
    wrapSaveInk();const p=paper();
    if(!p){document.body.classList.remove('v9-sheet-ai-active');return false}
    bindImage(p);setLayerHeight(p);ensureLayer(p);mountSheetDiagram(p);
    if(resizeObserver){resizeObserver.disconnect();resizeObserver=null}
    const content=directChildContent(p)[0];
    if(content&&typeof ResizeObserver==='function'){resizeObserver=new ResizeObserver(queueApply);resizeObserver.observe(content)}
    return true;
  }
  function queueApply(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
  function mount(){
    const app=document.getElementById('app');if(!app)return setTimeout(mount,50);
    if(!observer){observer=new MutationObserver(queueApply);observer.observe(app,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','style']})}
    window.addEventListener('resize',queueApply,{passive:true});apply();
  }
  mount();

  window.runWrongbookPaperOverlayQA=function(){
    apply();const p=paper(),draw=p?.querySelector('#drawCanvas'),layer=p?.querySelector(':scope > .v9-paper-ai-layer');
    if(!p||!draw||!layer)return{pass:false,reason:'paper-not-mounted',version:VERSION};
    const h=Number(p.dataset.v9ProblemLayerHeight)||0,dr=draw.getBoundingClientRect();
    let pathsBefore='';try{pathsBefore=JSON.stringify(drawing?.paths||[])}catch{}
    const heightStable=h>=500&&Math.abs(dr.height-h)<=2&&getComputedStyle(draw).bottom==='auto';
    const layerStable=Math.abs(layer.getBoundingClientRect().height-h)<=2&&['absolute','fixed'].includes(getComputedStyle(layer).position);
    const syntheticForbidden=[candidateRect(310,120,220,180),candidateRect(80,60,170,70)];
    const syntheticAnchor=candidateRect(90,70,170,50),synthetic=place(240,160,820,500,syntheticAnchor,syntheticForbidden);
    const placementEngine=Boolean(synthetic)&&syntheticForbidden.every(f=>!overlap(synthetic,f));
    const fixtureStage={goal:'辨認粒線體反應位置',successCriteria:'克氏循環在粒線體基質，電子傳遞鏈在粒線體內膜'};
    const concepts=keyConcepts(fixtureStage,'丙酮酸 粒線體基質 克氏循環 粒線體內膜 電子傳遞鏈');
    const conceptQA=concepts.includes('克氏循環：粒線體基質')&&concepts.includes('電子傳遞鏈：粒線體內膜')&&concepts.length<=3;
    const card=layer.querySelector('.v9-sheet-ai-card');
    let actualNonOverlap=true,cardOnSheet=true,sourceSuppressed=true;
    if(card){
      const rr=rectRelativeTo(card.getBoundingClientRect(),p);actualNonOverlap=[...printedRects(p),...inkRects(p)].every(f=>!overlap(rr,f));
      cardOnSheet=inside(rr,p.getBoundingClientRect().width,h,0);
      sourceSuppressed=getComputedStyle(sourceDiagram()).display==='none';
    }
    let pathsAfter='';try{pathsAfter=JSON.stringify(drawing?.paths||[])}catch{}
    const inkDataUntouched=pathsBefore===pathsAfter;
    const pass=Boolean(heightStable&&layerStable&&placementEngine&&conceptQA&&actualNonOverlap&&cardOnSheet&&sourceSuppressed&&inkDataUntouched);
    return{pass,version:VERSION,heightStable,layerStable,placementEngine,conceptQA,actualNonOverlap,cardOnSheet,sourceSuppressed,inkDataUntouched,problemLayerHeight:h,drawHeight:Math.round(dr.height),diagramMounted:Boolean(card),concepts};
  };
  function scheduleQA(tries=0){setTimeout(()=>{const r=window.runWrongbookPaperOverlayQA?.();if(r?.reason==='paper-not-mounted'&&tries<20)return scheduleQA(tries+1);window.__wrongbookPaperOverlayV9QA=r;if(r&&!r.pass&&r.reason!=='paper-not-mounted')console.warn('[Wrongbook paper overlay V9 QA failed]',r)},180)}
  scheduleQA();
})();
