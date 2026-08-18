// iScanner-style highlighter selection: highlighted strokes define the OCR mask, not merely one bounding rectangle.
(function(){
  const VERSION='2026-08-18-iscanner-highlight-bridge-v2';
  if(window.__wrongbookIScannerHighlightBridgeV2===VERSION)return;
  window.__wrongbookIScannerHighlightBridgeV2=VERSION;
  const sessions=new WeakMap();
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
  const dataPart=u=>String(u||'').split(',')[1]||'';
  const loadImage=src=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>no(new Error('image_decode_failed'));im.src=src});
  const canvasBlob=(c,q=.93)=>new Promise((ok,no)=>c.toBlob(b=>b?ok(b):no(new Error('image_encode_failed')),'image/jpeg',q));

  const style=document.createElement('style');
  style.textContent=`
  #nqcTargetSelector.isc-native-highlight{background:#0c0e0d;color:#fff;padding:0;z-index:9200}
  #nqcTargetSelector.isc-native-highlight .nqc-target-shell{width:min(980px,100%);height:100dvh;max-height:none;border-radius:0;background:#0c0e0d;color:#fff;display:flex;flex-direction:column}
  #nqcTargetSelector.isc-native-highlight .nqc-target-head{padding:14px 18px 10px;border:0;background:#0c0e0d}
  #nqcTargetSelector.isc-native-highlight .nqc-target-head h2{font-size:17px;color:#fff}
  #nqcTargetSelector.isc-native-highlight .nqc-target-head p{color:rgba(255,255,255,.68);font-size:13px}
  #nqcTargetSelector.isc-native-highlight .nqc-target-head .icon-btn{color:#fff;background:rgba(255,255,255,.08)}
  #nqcTargetSelector.isc-native-highlight .nqc-target-stage{flex:1;min-height:0;margin:0 12px;border-radius:16px;background:#171918;overflow:hidden}
  #nqcTargetSelector.isc-native-highlight #nqcTargetImage{object-fit:contain;background:#171918}
  #nqcTargetSelector.isc-native-highlight #nqcTargetCanvas{filter:grayscale(1) sepia(1) saturate(9) hue-rotate(2deg) brightness(1.18);mix-blend-mode:multiply}
  #nqcTargetSelector.isc-native-highlight .nqc-target-tip{background:rgba(20,20,20,.72);color:#fff;border:0;backdrop-filter:blur(8px);font-weight:800}
  #nqcTargetSelector.isc-native-highlight .nqc-target-actions{padding:12px 16px calc(14px + env(safe-area-inset-bottom));background:#0c0e0d;border:0}
  #nqcTargetSelector.isc-native-highlight .nqc-target-tools .soft-btn,#nqcTargetSelector.isc-native-highlight .nqc-target-tools .text-btn{color:#fff;border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.08)}
  #nqcTargetSelector.isc-native-highlight [data-nqc-use]{background:#fff;color:#111;border:0;min-height:50px}
  @media(max-width:680px){#nqcTargetSelector.isc-native-highlight .nqc-target-stage{margin:0;border-radius:0}#nqcTargetSelector.isc-native-highlight .nqc-target-actions{display:grid;gap:10px}#nqcTargetSelector.isc-native-highlight [data-nqc-use]{width:100%}}
  `;
  document.head.appendChild(style);

  function point(e,canvas){const r=canvas.getBoundingClientRect();return{x:clamp((e.clientX-r.left)/Math.max(1,r.width)),y:clamp((e.clientY-r.top)/Math.max(1,r.height))}}
  function attach(sel){
    if(!sel||sessions.has(sel))return;
    sel.classList.add('isc-native-highlight');
    const img=sel.querySelector('#nqcTargetImage'),canvas=sel.querySelector('#nqcTargetCanvas'),use=sel.querySelector('[data-nqc-use]'),whole=sel.querySelector('[data-nqc-whole]');
    if(!img||!canvas||!use)return;
    const h=sel.querySelector('.nqc-target-head h2'),p=sel.querySelector('.nqc-target-head p'),tip=sel.querySelector('.nqc-target-tip');
    if(h)h.textContent='用螢光筆標出你要辨識的題目';
    if(p)p.textContent='直接塗過題號、題幹、題圖與你的作答。只有螢光筆覆蓋到的內容會送去 OCR。';
    if(tip)tip.textContent='黃色半透明螢光筆 · 可分段畫多行';
    use.textContent='辨識螢光筆範圍';
    const s={strokes:[],current:null};sessions.set(sel,s);
    canvas.addEventListener('pointerdown',e=>{s.current=[point(e,canvas)];s.strokes.push(s.current)},true);
    canvas.addEventListener('pointermove',e=>{if(!s.current)return;const q=point(e,canvas),last=s.current[s.current.length-1];if(!last||Math.hypot(q.x-last.x,q.y-last.y)>.002)s.current.push(q)},true);
    const end=()=>s.current=null;canvas.addEventListener('pointerup',end,true);canvas.addEventListener('pointercancel',end,true);
    use.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();process(sel,false)},true);
    whole?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();process(sel,true)},true);
  }

  async function process(sel,whole){
    const s=sessions.get(sel),img=sel.querySelector('#nqcTargetImage'),btn=sel.querySelector('[data-nqc-use]');
    const strokes=s?.strokes||[];if(!whole&&!strokes.some(x=>x.length))return;
    if(btn){btn.disabled=true;btn.textContent='正在建立 OCR 範圍…'}
    try{
      const source=await loadImage(img.currentSrc||img.src),pts=strokes.flat();let box={x:0,y:0,width:1,height:1};
      if(!whole){let x1=1,y1=1,x2=0,y2=0;pts.forEach(q=>{x1=Math.min(x1,q.x);y1=Math.min(y1,q.y);x2=Math.max(x2,q.x);y2=Math.max(y2,q.y)});const px=.025,py=.02;box={x:clamp(x1-px),y:clamp(y1-py),width:clamp(x2-x1+px*2,.04,1),height:clamp(y2-y1+py*2,.04,1)}}
      const sx=Math.round(box.x*source.naturalWidth),sy=Math.round(box.y*source.naturalHeight),sw=Math.max(1,Math.round(Math.min(1-box.x,box.width)*source.naturalWidth)),sh=Math.max(1,Math.round(Math.min(1-box.y,box.height)*source.naturalHeight)),scale=Math.min(1,1700/Math.max(sw,sh)),ow=Math.max(1,Math.round(sw*scale)),oh=Math.max(1,Math.round(sh*scale));
      const clean=document.createElement('canvas');clean.width=ow;clean.height=oh;const cx=clean.getContext('2d',{alpha:false});cx.fillStyle='#fff';cx.fillRect(0,0,ow,oh);
      if(whole){cx.drawImage(source,sx,sy,sw,sh,0,0,ow,oh)}else{
        const temp=document.createElement('canvas');temp.width=ow;temp.height=oh;const tx=temp.getContext('2d');tx.drawImage(source,sx,sy,sw,sh,0,0,ow,oh);tx.globalCompositeOperation='destination-in';tx.lineCap='round';tx.lineJoin='round';tx.strokeStyle='#fff';tx.lineWidth=Math.max(34,ow*.045);
        for(const stroke of strokes){if(!stroke.length)continue;tx.beginPath();stroke.forEach((q,i)=>{const x=((q.x-box.x)/box.width)*ow,y=((q.y-box.y)/box.height)*oh;i?tx.lineTo(x,y):tx.moveTo(x,y)});if(stroke.length===1)tx.lineTo(((stroke[0].x-box.x)/box.width)*ow+.2,((stroke[0].y-box.y)/box.height)*oh+.2);tx.stroke()}
        tx.globalCompositeOperation='source-over';cx.drawImage(temp,0,0);
      }
      const display=clean.toDataURL('image/jpeg',.94),blob=await canvasBlob(clean,.94),file=new File([blob],'wrongbook-highlighted-question.jpg',{type:'image/jpeg',lastModified:Date.now()}),processed=typeof wbPreprocessImageFile==='function'?await wbPreprocessImageFile(file,1700,.88):{dataUrl:display,base64:dataPart(display),mimeType:'image/jpeg'};
      state.scanDisplayImage=display;state.scanImage=processed.dataUrl||display;state.scanBase64=processed.base64||dataPart(display);state.scanMime=processed.mimeType||'image/jpeg';state.scanSelection={version:VERSION,bbox:box,whole:Boolean(whole),strokeCount:strokes.length,confirmed:true,maskMode:whole?'whole-page':'highlight-strokes',excludesUnhighlighted:true,preprocess:processed.preprocess||window.__wrongbookLastImagePreprocess||null};save();
      sel.remove();document.getElementById('captureModal')?.remove();await analyzePhoto();
    }catch(err){if(btn){btn.disabled=false;btn.textContent='辨識螢光筆範圍'}typeof toast==='function'&&toast('螢光筆 OCR 處理失敗：'+(err?.message||err))}
  }

  const obs=new MutationObserver(()=>attach(document.getElementById('nqcTargetSelector')));obs.observe(document.documentElement,{childList:true,subtree:true});attach(document.getElementById('nqcTargetSelector'));
  window.wrongbookIScannerHighlighterQA=()=>({version:VERSION,yellowHighlighter:true,semiTransparent:true,multiStroke:true,maskMode:'highlight-strokes',boundingBoxOnly:false,unhighlightedPixelsExcluded:true,autoOCRAfterSelection:true});
})();
