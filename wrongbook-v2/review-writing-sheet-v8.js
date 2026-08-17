// Wrong Book V8 — persistent answer/scratch paper for every review item.
(function(){
  const VERSION='2026-08-17-review-writing-sheet-v8-2';
  const STORE='wrongbook-v8-review-ink';
  if(window.__wrongbookReviewWritingSheetV8===VERSION)return;
  window.__wrongbookReviewWritingSheetV8=VERSION;

  function appState(){try{return typeof state!=='undefined'?state:null}catch{return null}}
  function currentKey(){const st=appState();const id=st?.reviewProblemId||st?.selectedProblemId||'none';const mode=st?.reviewMode||'problem';return `${id}:${mode}`}
  function readStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch{return {}}}
  function writeStore(value){try{localStorage.setItem(STORE,JSON.stringify(value))}catch{}}
  function readPaths(key=currentKey()){const all=readStore();return Array.isArray(all[key])?all[key]:[]}
  function savePaths(key,paths){const all=readStore();all[key]=paths.slice(-180);writeStore(all)}

  function markup(){
    return `<div class="v8-review-sheet" data-v8-review-sheet>
      <div class="v8-review-sheet-head">
        <div class="v8-review-sheet-title"><strong>作答紙</strong><span>Apple Pencil / 觸控 / 滑鼠 · 自動保留這題的作答草稿</span></div>
        <div class="v8-review-sheet-tools" role="toolbar" aria-label="作答紙工具">
          <button type="button" class="is-active" data-v8-review-tool="pen" aria-label="筆">✎</button>
          <button type="button" data-v8-review-tool="eraser" aria-label="橡皮擦">⌫</button>
          <button type="button" data-v8-review-tool="undo" aria-label="復原">↶</button>
          <button type="button" data-v8-review-tool="clear" aria-label="清除作答紙">清除</button>
        </div>
      </div>
      <div class="v8-review-paper">
        <canvas class="v8-review-canvas" aria-label="複習作答紙"></canvas>
        <span class="v8-review-sheet-hint">在這裡寫公式、畫圖、列步驟或默寫答案</span>
      </div>
    </div>`;
  }

  function pointFromEvent(canvas,e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/Math.max(1,r.width),y:(e.clientY-r.top)/Math.max(1,r.height),p:Number(e.pressure)||.5}}
  function inkColor(){const c=getComputedStyle(document.documentElement).getPropertyValue('--student-ink').trim();return c||'#355C97'}
  function sizeCanvas(canvas){const rect=canvas.getBoundingClientRect(),dpr=Math.min(3,window.devicePixelRatio||1),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return{ctx,w:rect.width,h:rect.height,dpr}}
  function drawPath(ctx,path,w,h){const pts=Array.isArray(path?.points)?path.points:[];if(!pts.length)return;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=inkColor();ctx.globalCompositeOperation=path.tool==='eraser'?'destination-out':'source-over';ctx.lineWidth=path.tool==='eraser'?18:3.2;if(pts.length===1){ctx.beginPath();ctx.arc(pts[0].x*w,pts[0].y*h,Math.max(1,ctx.lineWidth/2),0,Math.PI*2);ctx.fillStyle=inkColor();ctx.fill();ctx.restore();return}ctx.beginPath();ctx.moveTo(pts[0].x*w,pts[0].y*h);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],mx=(a.x+b.x)/2*w,my=(a.y+b.y)/2*h;ctx.quadraticCurveTo(a.x*w,a.y*h,mx,my)}ctx.lineTo(pts.at(-1).x*w,pts.at(-1).y*h);ctx.stroke();ctx.restore()}
  function redraw(sheet){const canvas=sheet.querySelector('.v8-review-canvas');if(!canvas)return;const{ctx,w,h}=sizeCanvas(canvas);ctx.clearRect(0,0,w,h);const paths=readPaths(sheet.dataset.v8ReviewKey);paths.forEach(p=>drawPath(ctx,p,w,h));sheet.classList.toggle('has-ink',paths.length>0)}

  function bindSheet(sheet){
    if(!sheet||sheet.dataset.v8Bound==='1')return;
    sheet.dataset.v8Bound='1';sheet.dataset.v8ReviewKey=currentKey();sheet.dataset.v8Tool='pen';
    const canvas=sheet.querySelector('.v8-review-canvas');if(!canvas)return;
    let active=null,pointer=null;
    const setTool=tool=>{if(!['pen','eraser'].includes(tool))return;sheet.dataset.v8Tool=tool;sheet.querySelectorAll('[data-v8-review-tool="pen"],[data-v8-review-tool="eraser"]').forEach(b=>b.classList.toggle('is-active',b.dataset.v8ReviewTool===tool))};
    sheet.addEventListener('click',e=>{const button=e.target.closest('[data-v8-review-tool]');if(!button)return;const tool=button.dataset.v8ReviewTool;if(tool==='pen'||tool==='eraser')return setTool(tool);const key=sheet.dataset.v8ReviewKey,paths=readPaths(key);if(tool==='undo'){paths.pop();savePaths(key,paths);redraw(sheet)}if(tool==='clear'){savePaths(key,[]);redraw(sheet)}});
    canvas.addEventListener('pointerdown',e=>{e.preventDefault();pointer=e.pointerId;canvas.setPointerCapture?.(pointer);active={tool:sheet.dataset.v8Tool||'pen',points:[pointFromEvent(canvas,e)]};redraw(sheet);const info=sizeCanvas(canvas);drawPath(info.ctx,active,info.w,info.h)});
    canvas.addEventListener('pointermove',e=>{if(pointer!==e.pointerId||!active)return;e.preventDefault();active.points.push(pointFromEvent(canvas,e));redraw(sheet);const info=sizeCanvas(canvas);drawPath(info.ctx,active,info.w,info.h)});
    const end=e=>{if(pointer!==e.pointerId||!active)return;e.preventDefault();active.points.push(pointFromEvent(canvas,e));const key=sheet.dataset.v8ReviewKey,paths=readPaths(key);paths.push(active);savePaths(key,paths);active=null;pointer=null;redraw(sheet)};
    canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
    const ro=typeof ResizeObserver==='function'?new ResizeObserver(()=>redraw(sheet)):null;ro?.observe(canvas);sheet.__v8ResizeObserver=ro;redraw(sheet);
  }

  function placeSheet(paper,sheet){
    const truth=paper.querySelector('.fill-card');
    if(truth){
      const sentence=truth.querySelector('.fill-sentence');
      const input=truth.querySelector('.tutor-input');
      if(sentence){sentence.insertAdjacentElement('afterend',sheet);return'truth-after-prompt'}
      if(input){input.insertAdjacentElement('beforebegin',sheet);return'truth-before-input'}
    }
    const problemHost=[...paper.children].find(el=>!el.classList.contains('pf-review-kind'));
    if(problemHost){
      const actions=problemHost.querySelector('.page-actions');
      if(actions){actions.insertAdjacentElement('beforebegin',sheet);return'problem-before-submit'}
      problemHost.appendChild(sheet);return'problem-end';
    }
    paper.appendChild(sheet);return'paper-end';
  }

  function install(){
    const paper=document.querySelector('.pf-review-paper');if(!paper)return false;
    let sheet=paper.querySelector('.v8-review-sheet');
    if(!sheet){const wrap=document.createElement('div');wrap.innerHTML=markup();sheet=wrap.firstElementChild;if(!sheet)return false;sheet.dataset.v8Placement=placeSheet(paper,sheet)}
    const key=currentKey();if(sheet.dataset.v8ReviewKey!==key){sheet.dataset.v8ReviewKey=key;sheet.dataset.v8Bound='';sheet.__v8ResizeObserver?.disconnect?.()}
    bindSheet(sheet);return true;
  }

  let queued=false;function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;install()})}
  const mount=()=>{const app=document.getElementById('app');if(!app)return setTimeout(mount,50);new MutationObserver(queue).observe(app,{subtree:true,childList:true});install()};mount();window.addEventListener('resize',queue);

  window.runWrongbookReviewSheetQA=function(){
    const mounted=install(),sheet=document.querySelector('.pf-review-paper .v8-review-sheet');if(!mounted||!sheet)return{pass:false,reason:'review-page-not-mounted',version:VERSION};
    const canvas=sheet.querySelector('.v8-review-canvas'),tools=[...sheet.querySelectorAll('[data-v8-review-tool]')].map(x=>x.dataset.v8ReviewTool),paper=sheet.querySelector('.v8-review-paper');
    const current=readPaths(sheet.dataset.v8ReviewKey),testPath={tool:'pen',points:[{x:.1,y:.1,p:.5},{x:.4,y:.3,p:.5}]},fixture=document.createElement('canvas');fixture.width=300;fixture.height=160;const ctx=fixture.getContext('2d');drawPath(ctx,testPath,300,160);const pixel=ctx.getImageData(1,1,298,158).data;let painted=false;for(let i=3;i<pixel.length;i+=4){if(pixel[i]){painted=true;break}}
    const unique=document.querySelectorAll('.pf-review-paper .v8-review-sheet').length===1,sizeOk=paper?.getBoundingClientRect().height>=200,pointerOk=canvas&&getComputedStyle(canvas).touchAction==='none',toolsOk=['pen','eraser','undo','clear'].every(x=>tools.includes(x)),keyOk=sheet.dataset.v8ReviewKey===currentKey(),storeUntouched=JSON.stringify(current)===JSON.stringify(readPaths(sheet.dataset.v8ReviewKey));
    const truthMode=Boolean(document.querySelector('.pf-review-paper .fill-card')),problemMode=!truthMode;
    const placementOk=truthMode?Boolean(sheet.previousElementSibling?.classList.contains('fill-sentence')):problemMode?Boolean(sheet.nextElementSibling?.classList.contains('page-actions')||sheet.parentElement?.querySelector('.page-actions')):true;
    const pass=Boolean(unique&&sizeOk&&pointerOk&&toolsOk&&keyOk&&painted&&storeUntouched&&placementOk);
    return{pass,version:VERSION,unique,sizeOk,pointerOk,toolsOk,keyOk,painted,storeUntouched,placementOk,placement:sheet.dataset.v8Placement,key:sheet.dataset.v8ReviewKey,paperHeight:Math.round(paper?.getBoundingClientRect().height||0)};
  };
  function scheduleQA(tries=0){setTimeout(()=>{const r=window.runWrongbookReviewSheetQA?.();if(r?.reason==='review-page-not-mounted'&&tries<6)return scheduleQA(tries+1);window.__wrongbookReviewSheetV8QA=r;if(r&&!r.pass&&r.reason!=='review-page-not-mounted')console.warn('[Wrongbook review sheet QA failed]',r)},180)}scheduleQA();
})();
