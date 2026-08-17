(function(){
  const STRIP=()=>window.EARTH15_STRIP_B64?'data:image/webp;base64,'+window.EARTH15_STRIP_B64:'';
  const TITLES=['宇宙與天體','太陽系與地球運動','地球的起源與演變','固體地球','大氣與天氣','海洋'];
  const W=900,H=1272,STORAGE='wrongbook-earth-png-v15';
  let tool='pen',color='#17375f',size=4.2,fingerInk=false,drawing=false,currentStroke=null,clearArmedUntil=0,dragText=null;

  const icon={
    pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m4 20 4.5-1 10-10a2.8 2.8 0 0 0-4-4l-10 10L4 20Z"/><path d="m13 6 5 5"/></svg>',
    erase:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 19-3-3 9-11a2.5 2.5 0 0 1 3.7-.2l2.5 2.5a2.5 2.5 0 0 1-.2 3.7L12 19H7Z"/><path d="M12 19h8"/></svg>',
    hand:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 11V6a2 2 0 0 1 4 0v4-6a2 2 0 1 1 4 0v6-4a2 2 0 0 1 4 0v8c0 4-3 7-7 7h-1c-3 0-5-2-6-4l-2-4a2 2 0 0 1 3.5-2L8 13"/></svg>',
    type:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 5h14M12 5v14M8 19h8"/></svg>',
    undo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 7 4 12l5 5"/><path d="M5 12h8a6 6 0 0 1 6 6"/></svg>'
  };

  function loadPersisted(){
    if(typeof state!=='undefined'&&state.earthPngBoardV15?.chapters)return state.earthPngBoardV15;
    try{const raw=localStorage.getItem(STORAGE);if(raw)return JSON.parse(raw)}catch(e){}
    return {version:1,chapters:{}};
  }
  let store=loadPersisted();
  function persist(){
    if(typeof state!=='undefined')state.earthPngBoardV15=store;
    try{localStorage.setItem(STORAGE,JSON.stringify(store))}catch(e){}
    try{if(typeof save==='function')save()}catch(e){}
    const el=document.querySelector('[data-earth15-save]');if(el){el.textContent='已儲存';clearTimeout(persist.t);persist.t=setTimeout(()=>{if(el)el.textContent='自動儲存'},900)}
  }
  function chapterNo(){return Math.min(6,Math.max(1,Number((typeof state!=='undefined'&&state.refEarthChapter)||1)))}
  function chapterData(n=chapterNo()){return store.chapters[n]||(store.chapters[n]={strokes:[],texts:[]})}
  function esc(s=''){return typeof window.esc==='function'?window.esc(String(s)):String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}

  function sourceSwitch(){return `<div class="earth15-source"><button class="active" data-v4ref-source="reference">互動原圖</button><button data-v4ref-source="curriculum">108 課綱圖</button></div>`}
  function chapterNav(n){return `<nav class="earth15-chapters" aria-label="地科六張練習圖">${TITLES.map((t,i)=>`<button type="button" class="${i+1===n?'active':''}" data-v4ref-chapter="${i+1}"><b>${i+1}</b><span>${esc(t)}</span></button>`).join('')}</nav>`}
  function toolbar(){return `<div class="earth15-toolbar" role="toolbar" aria-label="書寫工具">
    <div class="earth15-toolgroup">
      <button class="earth15-tool active" type="button" data-earth15-tool="pen">${icon.pen}筆寫</button>
      <button class="earth15-tool" type="button" data-earth15-tool="eraser">${icon.erase}橡皮擦</button>
      <button class="earth15-tool" type="button" data-earth15-tool="hand">${icon.hand}移動</button>
      <button class="earth15-tool" type="button" data-earth15-tool="type">${icon.type}打字</button>
    </div>
    <div class="earth15-toolgroup" aria-label="筆色">
      <button class="earth15-color active" type="button" data-earth15-color="#17375f" style="background:#17375f" aria-label="藍黑色"></button>
      <button class="earth15-color" type="button" data-earth15-color="#252321" style="background:#252321" aria-label="黑色"></button>
      <button class="earth15-color" type="button" data-earth15-color="#b53e35" style="background:#b53e35" aria-label="紅色"></button>
    </div>
    <div class="earth15-toolgroup"><span class="earth15-size-label">粗細</span><input class="earth15-size" data-earth15-size type="range" min="2" max="9" step=".5" value="4.2" aria-label="筆畫粗細"></div>
    <div class="earth15-toolgroup">
      <button class="earth15-tool earth15-finger" type="button" data-earth15-finger>手指寫：關</button>
      <button class="earth15-tool" type="button" data-earth15-undo>${icon.undo}復原</button>
      <button class="earth15-tool danger" type="button" data-earth15-clear>清除本頁</button>
    </div>
  </div>`}
  function textItems(n){const d=chapterData(n);return d.texts.map((x,i)=>`<div class="earth15-type-item" data-earth15-text="${i}" style="left:${(x.x/W*100).toFixed(4)}%;top:${(x.y/H*100).toFixed(4)}%"><input type="text" value="${esc(x.value||'')}" placeholder="輸入答案" autocomplete="off" spellcheck="false" style="font-size:${x.font||22}px;width:${x.width||190}px"><span class="earth15-type-controls"><button class="drag" type="button" data-earth15-drag="${i}" aria-label="移動文字">↕</button><button type="button" data-earth15-delete="${i}" aria-label="刪除文字">×</button></span></div>`).join('')}
  function page(){
    const n=chapterNo(),src=STRIP(),offset=(n-1)*100;
    return `<div class="earth15-page-head"><h2>心智圖學習 · 地球科學</h2><p>原始參考圖就是學習畫布：預設筆寫；電腦可切到「打字」後直接點空格輸入。</p></div>${typeof subjectTabs==='function'?subjectTabs():''}${sourceSwitch()}<section class="earth15-board" data-earth15-root>
      <div class="earth15-topbar"><div class="earth15-topbar-copy"><strong>${n}. ${esc(TITLES[n-1])}</strong><span>像在黑板前練習：直接寫在原圖上</span></div><span class="earth15-save-state" data-earth15-save>自動儲存</span></div>
      ${chapterNav(n)}${toolbar()}
      <div class="earth15-stage" data-earth15-stage>
        ${src?`<div class="earth15-sheet" data-earth15-sheet data-tool="pen"><img class="earth15-strip" src="${src}" style="top:-${offset}%" alt="${esc(TITLES[n-1])} 地球科學填空心智圖"><canvas class="earth15-canvas" data-earth15-canvas width="${W}" height="${H}"></canvas><div class="earth15-type-layer" data-earth15-type-layer>${textItems(n)}</div></div>`:`<div class="earth15-loading">參考圖載入中…</div>`}
      </div>
      <div class="earth15-hint"><span>Apple Pencil／觸控筆直接寫；手指預設用來捲動畫面。</span><span>電腦：滑鼠可手寫，或按 <kbd>打字</kbd> 後點答案線。</span></div>
    </section>`;
  }

  function coords(canvas,e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height,p:Math.max(.25,e.pressure||.55)}}
  function canInk(e){if(tool!=='pen'&&tool!=='eraser')return false;if(e.pointerType==='touch'&&!fingerInk)return false;return e.pointerType!=='mouse'||e.buttons===1||e.type==='pointerdown'}
  function drawSegment(ctx,a,b,stroke){
    ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.globalAlpha=.9;
    if(stroke.mode==='erase'){ctx.globalCompositeOperation='destination-out';ctx.strokeStyle='rgba(0,0,0,1)'}else{ctx.globalCompositeOperation='source-over';ctx.strokeStyle=stroke.color;ctx.shadowColor=stroke.color;ctx.shadowBlur=.35}
    const base=stroke.width*(stroke.mode==='erase'?3.2:1);
    ctx.lineWidth=base*(.68+.50*((a.p+b.p)/2));ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.restore();
  }
  function drawDot(ctx,p,stroke){ctx.save();if(stroke.mode==='erase')ctx.globalCompositeOperation='destination-out';ctx.fillStyle=stroke.mode==='erase'?'#000':stroke.color;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(p.x,p.y,stroke.width*(stroke.mode==='erase'?1.7:.55),0,Math.PI*2);ctx.fill();ctx.restore()}
  function replay(){const c=document.querySelector('[data-earth15-canvas]');if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,W,H);for(const s of chapterData().strokes){if(!s.points?.length)continue;if(s.points.length===1){drawDot(ctx,s.points[0],s);continue}for(let i=1;i<s.points.length;i++)drawSegment(ctx,s.points[i-1],s.points[i],s)}}
  function setTool(next){tool=next;const sheet=document.querySelector('[data-earth15-sheet]');if(sheet)sheet.dataset.tool=tool;document.querySelectorAll('[data-earth15-tool]').forEach(b=>b.classList.toggle('active',b.dataset.earth15Tool===tool))}
  function renderTexts(){const layer=document.querySelector('[data-earth15-type-layer]');if(!layer)return;layer.innerHTML=textItems(chapterNo());bindTextItems()}
  function addTextAt(e){if(tool!=='type'||e.target.closest('.earth15-type-item'))return;const sheet=document.querySelector('[data-earth15-sheet]'),r=sheet.getBoundingClientRect();const x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;const d=chapterData();d.texts.push({x:Math.max(0,Math.min(W-220,x)),y:Math.max(18,Math.min(H-18,y)),value:'',font:22,width:190});persist();renderTexts();requestAnimationFrame(()=>{const nodes=document.querySelectorAll('.earth15-type-item input');nodes[nodes.length-1]?.focus()})}
  function bindTextItems(){
    document.querySelectorAll('[data-earth15-text]').forEach(w=>{const i=Number(w.dataset.earth15Text),inp=w.querySelector('input');inp?.addEventListener('input',()=>{const d=chapterData();if(!d.texts[i])return;d.texts[i].value=inp.value;persist()});inp?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();inp.blur()}})});
    document.querySelectorAll('[data-earth15-delete]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();chapterData().texts.splice(Number(b.dataset.earth15Delete),1);persist();renderTexts()}));
    document.querySelectorAll('[data-earth15-drag]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();const i=Number(b.dataset.earth15Drag);dragText={i,pointerId:e.pointerId};b.setPointerCapture?.(e.pointerId)}));
  }
  function onDragMove(e){if(!dragText||dragText.pointerId!==e.pointerId)return;const sheet=document.querySelector('[data-earth15-sheet]');if(!sheet)return;const r=sheet.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height,d=chapterData();if(!d.texts[dragText.i])return;d.texts[dragText.i].x=Math.max(0,Math.min(W-220,x));d.texts[dragText.i].y=Math.max(18,Math.min(H-18,y));const node=document.querySelector(`[data-earth15-text="${dragText.i}"]`);if(node){node.style.left=(d.texts[dragText.i].x/W*100)+'%';node.style.top=(d.texts[dragText.i].y/H*100)+'%'}}
  function onDragEnd(e){if(dragText&&dragText.pointerId===e.pointerId){dragText=null;persist()}}

  function boardBind(){
    const canvas=document.querySelector('[data-earth15-canvas]'),sheet=document.querySelector('[data-earth15-sheet]');if(!canvas||!sheet)return;
    setTool('pen');color='#17375f';size=4.2;fingerInk=false;sheet.classList.remove('finger-ink');replay();bindTextItems();
    document.querySelectorAll('[data-earth15-tool]').forEach(b=>b.addEventListener('click',()=>setTool(b.dataset.earth15Tool)));
    document.querySelectorAll('[data-earth15-color]').forEach(b=>b.addEventListener('click',()=>{color=b.dataset.earth15Color;document.querySelectorAll('[data-earth15-color]').forEach(x=>x.classList.toggle('active',x===b));if(tool==='eraser'||tool==='hand'||tool==='type')setTool('pen')}));
    document.querySelector('[data-earth15-size]')?.addEventListener('input',e=>size=Number(e.target.value));
    document.querySelector('[data-earth15-finger]')?.addEventListener('click',e=>{fingerInk=!fingerInk;sheet.classList.toggle('finger-ink',fingerInk);e.currentTarget.classList.toggle('active',fingerInk);e.currentTarget.textContent=`手指寫：${fingerInk?'開':'關'}`});
    document.querySelector('[data-earth15-undo]')?.addEventListener('click',()=>{const d=chapterData();if(d.strokes.length){d.strokes.pop();persist();replay()}});
    document.querySelector('[data-earth15-clear]')?.addEventListener('click',e=>{const now=Date.now();if(now>clearArmedUntil){clearArmedUntil=now+1800;e.currentTarget.classList.add('armed');e.currentTarget.textContent='再按一次清除';setTimeout(()=>{e.currentTarget?.classList.remove('armed');if(e.currentTarget)e.currentTarget.textContent='清除本頁'},1900);return}chapterData().strokes=[];chapterData().texts=[];persist();replay();renderTexts();clearArmedUntil=0;e.currentTarget.classList.remove('armed');e.currentTarget.textContent='清除本頁'});
    sheet.addEventListener('click',addTextAt);
    canvas.addEventListener('pointerdown',e=>{if(!canInk(e))return;e.preventDefault();drawing=true;canvas.setPointerCapture?.(e.pointerId);const p=coords(canvas,e);currentStroke={mode:tool==='eraser'?'erase':'ink',color,width:size,points:[p]};chapterData().strokes.push(currentStroke);drawDot(canvas.getContext('2d'),p,currentStroke)});
    canvas.addEventListener('pointermove',e=>{if(!drawing||!currentStroke||!canInk(e))return;e.preventDefault();const p=coords(canvas,e),a=currentStroke.points[currentStroke.points.length-1];if(Math.hypot(p.x-a.x,p.y-a.y)<1.25)return;currentStroke.points.push(p);drawSegment(canvas.getContext('2d'),a,p,currentStroke)});
    const finish=e=>{if(!drawing)return;drawing=false;currentStroke=null;persist();try{canvas.releasePointerCapture?.(e.pointerId)}catch(_){} };canvas.addEventListener('pointerup',finish);canvas.addEventListener('pointercancel',finish);
    document.addEventListener('pointermove',onDragMove);document.addEventListener('pointerup',onDragEnd);document.addEventListener('pointercancel',onDragEnd);
  }

  const previousBind=typeof bind==='function'?bind:null;
  if(previousBind){bind=function(){previousBind();boardBind()}}
  window.EARTH_PNG_BOARD_V15={render:page,replay,store,snapshot(){const c=document.querySelector('[data-earth15-canvas]');return{chapter:chapterNo(),ink:c?.toDataURL('image/png')||null,texts:chapterData().texts}}};
  window.earthPngBoardQA=function(){const root=document.querySelector('[data-earth15-root]'),img=root?.querySelector('.earth15-sheet img'),canvas=root?.querySelector('canvas');return{ok:Boolean(root&&img&&canvas&&img.naturalWidth>0),chapter:chapterNo(),imageLoaded:Boolean(img?.complete&&img.naturalWidth),canvas:[canvas?.width,canvas?.height],toolButtons:root?.querySelectorAll('[data-earth15-tool]').length||0,typedItems:chapterData().texts.length,strokes:chapterData().strokes.length}};
  v4RefReferencePage=page;
  render();
})();
