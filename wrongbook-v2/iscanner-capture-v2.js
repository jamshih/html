// Wrong Book — iScanner-like OCR capture pipeline.
// Camera/gallery -> auto page boundary -> 4-corner straighten -> enhance -> highlight target problem -> existing AI OCR.
(function(){
  const VERSION='2026-08-18-iscanner-capture-v2';
  if(window.__wrongbookIScannerCapture===VERSION)return;
  window.__wrongbookIScannerCapture=VERSION;
  if(typeof analyzePhoto!=='function')return;

  let modal=null,stream=null,fileInput=null,sourceDataUrl='',sourceImage=null,docDataUrl='',filterMode='clean',corners=null,targetStrokes=[],targetCurrent=null;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
  const $=(q,r=document)=>r.querySelector(q);

  function stopCamera(){if(stream){for(const t of stream.getTracks())try{t.stop()}catch{}stream=null}}
  function close(){stopCamera();modal?.remove();modal=null;const input=document.getElementById('globalPhotoInput');if(input)input.onchange=null}
  function readUrl(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result||''));r.onerror=()=>rej(r.error||new Error('read_failed'));r.readAsDataURL(file)})}
  function loadImage(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error('decode_failed'));im.src=src})}
  function canvasBlob(c,type='image/jpeg',quality=.9){return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('encode_failed')),type,quality))}
  function dataPart(url){return String(url||'').split(',')[1]||''}

  function shell(){
    return `<div class="isc-backdrop" id="iscannerCapture"><div class="isc-shell"><header class="isc-topbar"><button class="isc-link" data-isc-close>取消</button><h2>掃描錯題</h2><button class="isc-link isc-right" data-isc-gallery>相簿</button></header><div class="isc-steps"><i class="isc-step-dot on" data-step-dot="1"></i><i class="isc-step-dot" data-step-dot="2"></i><i class="isc-step-dot" data-step-dot="3"></i></div><main class="isc-main" data-isc-main></main><footer class="isc-bottom" data-isc-bottom></footer></div></div>`;
  }
  function setStep(n){modal?.querySelectorAll('[data-step-dot]').forEach((x,i)=>x.classList.toggle('on',i<n))}

  async function openCamera(){
    const main=$('[data-isc-main]',modal),bottom=$('[data-isc-bottom]',modal);setStep(1);
    main.innerHTML=`<section class="isc-camera"><video data-isc-video autoplay muted playsinline></video><div class="isc-camera-mask"></div><div class="isc-camera-frame"></div><div class="isc-live-hint">把整張紙放進框內 · 拍完可自動拉正</div></section>`;
    bottom.innerHTML=`<div class="isc-camera-actions"><button class="isc-link left" data-isc-gallery2>從相簿選</button><button class="isc-shutter" data-isc-shutter aria-label="拍照"></button><span class="right"></span></div>`;
    $('[data-isc-gallery2]',modal).onclick=chooseFile;$('[data-isc-shutter]',modal).onclick=captureFrame;
    try{
      stopCamera();stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:2560}},audio:false});
      const v=$('[data-isc-video]',modal);v.srcObject=stream;await v.play();
    }catch(e){
      main.innerHTML=`<section class="isc-camera"><div style="height:100%;display:grid;place-items:center;padding:28px;text-align:center"><div><div style="font-size:46px">▣</div><h3>選擇一張題目照片</h3><p style="color:rgba(255,255,255,.7);max-width:420px">瀏覽器無法開啟相機時，仍可從相簿選取。下一步會自動找紙張邊界、拉正並清理影像。</p><button class="isc-primary" data-isc-pick>選擇照片</button></div></div></section>`;
      bottom.innerHTML='';$('[data-isc-pick]',modal).onclick=chooseFile;
    }
  }

  function chooseFile(){
    const input=document.getElementById('globalPhotoInput');if(!input)return;input.value='';input.accept='image/*';input.onchange=async e=>{const f=e.target.files?.[0];if(f)await loadSourceFile(f)};input.click();
  }

  async function captureFrame(){
    const v=$('[data-isc-video]',modal);if(!v?.videoWidth)return;
    const c=document.createElement('canvas'),max=2400,s=Math.min(1,max/Math.max(v.videoWidth,v.videoHeight));c.width=Math.round(v.videoWidth*s);c.height=Math.round(v.videoHeight*s);c.getContext('2d',{alpha:false}).drawImage(v,0,0,c.width,c.height);sourceDataUrl=c.toDataURL('image/jpeg',.94);sourceImage=await loadImage(sourceDataUrl);stopCamera();showCornerEditor();
  }

  async function loadSourceFile(file){
    stopCamera();sourceDataUrl=await readUrl(file);sourceImage=await loadImage(sourceDataUrl);showCornerEditor();
  }

  function detectDocument(im){
    const max=320,s=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),w=Math.max(80,Math.round(im.naturalWidth*s)),h=Math.max(80,Math.round(im.naturalHeight*s));
    const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{alpha:false});ctx.drawImage(im,0,0,w,h);const d=ctx.getImageData(0,0,w,h).data,g=new Float32Array(w*h);
    for(let i=0,p=0;i<d.length;i+=4,p++)g[p]=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];
    const cs=new Float64Array(w),rs=new Float64Array(h);
    for(let y=1;y<h;y++)for(let x=1;x<w;x++){const p=y*w+x;cs[x]+=Math.abs(g[p]-g[p-1]);rs[y]+=Math.abs(g[p]-g[p-w])}
    const peak=(arr,a,b)=>{let bi=a,bv=-1;for(let i=Math.max(1,a);i<Math.min(arr.length-1,b);i++){let v=arr[i];for(let k=1;k<=2;k++)v+=(arr[i-k]||0)+(arr[i+k]||0);if(v>bv){bv=v;bi=i}}return bi};
    let l=peak(cs,Math.floor(w*.015),Math.floor(w*.36)),r=peak(cs,Math.floor(w*.64),Math.floor(w*.985)),t=peak(rs,Math.floor(h*.015),Math.floor(h*.36)),b=peak(rs,Math.floor(h*.64),Math.floor(h*.985));
    if(r-l<w*.42){l=Math.floor(w*.05);r=Math.floor(w*.95)}if(b-t<h*.42){t=Math.floor(h*.05);b=Math.floor(h*.95)}
    const px=.006,py=.006;return[{x:clamp(l/w-px),y:clamp(t/h-py)},{x:clamp(r/w+px),y:clamp(t/h-py)},{x:clamp(r/w+px),y:clamp(b/h+py)},{x:clamp(l/w-px),y:clamp(b/h+py)}];
  }

  function showCornerEditor(){
    if(!sourceImage)return;setStep(1);corners=detectDocument(sourceImage);const main=$('[data-isc-main]',modal),bottom=$('[data-isc-bottom]',modal);
    main.innerHTML=`<section class="isc-editor"><canvas data-isc-editor-image></canvas><div class="isc-corner-overlay"><canvas data-isc-poly></canvas></div><div class="isc-editor-tip">自動找到紙張 · 拖曳四角可修正</div>${[0,1,2,3].map(i=>`<button class="isc-corner" data-corner="${i}" aria-label="調整角落 ${i+1}"></button>`).join('')}<div class="isc-scan-quality">文件邊界</div></section>`;
    bottom.innerHTML=`<div class="isc-editor-actions"><div class="isc-editor-left"><button class="isc-secondary" data-isc-auto>自動框邊</button><button class="isc-filter ${filterMode==='color'?'on':''}" data-filter="color">原色</button><button class="isc-filter ${filterMode==='clean'?'on':''}" data-filter="clean">清晰</button><button class="isc-filter ${filterMode==='bw'?'on':''}" data-filter="bw">黑白</button></div><div class="isc-editor-right"><button class="isc-primary" data-isc-straighten>拉正並繼續</button></div></div>`;
    paintEditor();bindCorners();$('[data-isc-auto]',modal).onclick=()=>{corners=detectDocument(sourceImage);paintEditor()};modal.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filterMode=b.dataset.filter;modal.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('on',x===b))});$('[data-isc-straighten]',modal).onclick=straightenDocument;
  }

  function paintEditor(){
    const c=$('[data-isc-editor-image]',modal),poly=$('[data-isc-poly]',modal),host=c?.parentElement;if(!c||!poly||!host)return;const max=1600,s=Math.min(1,max/Math.max(sourceImage.naturalWidth,sourceImage.naturalHeight));c.width=Math.round(sourceImage.naturalWidth*s);c.height=Math.round(sourceImage.naturalHeight*s);c.getContext('2d').drawImage(sourceImage,0,0,c.width,c.height);poly.width=c.width;poly.height=c.height;const pc=poly.getContext('2d');pc.clearRect(0,0,poly.width,poly.height);pc.beginPath();corners.forEach((p,i)=>{const x=p.x*poly.width,y=p.y*poly.height;i?pc.lineTo(x,y):pc.moveTo(x,y)});pc.closePath();pc.fillStyle='rgba(49,118,255,.13)';pc.fill();pc.lineWidth=Math.max(2,poly.width*.002);pc.strokeStyle='#6da0ff';pc.stroke();modal.querySelectorAll('[data-corner]').forEach((b,i)=>{b.style.left=(corners[i].x*100)+'%';b.style.top=(corners[i].y*100)+'%'});
  }
  function bindCorners(){
    modal.querySelectorAll('[data-corner]').forEach(btn=>{let on=false;const i=Number(btn.dataset.corner);btn.addEventListener('pointerdown',e=>{on=true;btn.setPointerCapture?.(e.pointerId);e.preventDefault()});btn.addEventListener('pointermove',e=>{if(!on)return;const host=btn.parentElement.getBoundingClientRect();corners[i]={x:clamp((e.clientX-host.left)/host.width,.005,.995),y:clamp((e.clientY-host.top)/host.height,.005,.995)};paintEditor()});const end=()=>on=false;btn.addEventListener('pointerup',end);btn.addEventListener('pointercancel',end)})
  }

  function solve(A,b){
    const n=b.length,M=A.map((r,i)=>[...r,b[i]]);for(let i=0;i<n;i++){let m=i;for(let j=i+1;j<n;j++)if(Math.abs(M[j][i])>Math.abs(M[m][i]))m=j;[M[i],M[m]]=[M[m],M[i]];const p=M[i][i]||1e-12;for(let k=i;k<=n;k++)M[i][k]/=p;for(let j=0;j<n;j++)if(j!==i){const f=M[j][i];for(let k=i;k<=n;k++)M[j][k]-=f*M[i][k]}}return M.map(r=>r[n])
  }
  function homography(dst,src){
    const A=[],b=[];for(let i=0;i<4;i++){const x=dst[i].x,y=dst[i].y,u=src[i].x,v=src[i].y;A.push([x,y,1,0,0,0,-u*x,-u*y]);b.push(u);A.push([0,0,0,x,y,1,-v*x,-v*y]);b.push(v)}return solve(A,b)
  }
  function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
  function applyFilter(data,mode){
    const d=data.data;for(let i=0;i<d.length;i+=4){let r=d[i],g=d[i+1],b=d[i+2],y=.2126*r+.7152*g+.0722*b;if(mode==='bw'){let v=(y-128)*1.55+174;v=Math.max(0,Math.min(255,v));r=g=b=v}else if(mode==='clean'){const target=Math.max(0,Math.min(255,(y-128)*1.24+156)),mix=.72;r=Math.max(0,Math.min(255,target+(r-y)*mix));g=Math.max(0,Math.min(255,target+(g-y)*mix));b=Math.max(0,Math.min(255,target+(b-y)*mix))}else{r=Math.max(0,Math.min(255,(r-128)*1.07+135));g=Math.max(0,Math.min(255,(g-128)*1.07+135));b=Math.max(0,Math.min(255,(b-128)*1.07+135))}d[i]=r;d[i+1]=g;d[i+2]=b}return data
  }
  async function perspectiveCanvas(){
    const maxSrc=2200,ss=Math.min(1,maxSrc/Math.max(sourceImage.naturalWidth,sourceImage.naturalHeight)),sw=Math.round(sourceImage.naturalWidth*ss),sh=Math.round(sourceImage.naturalHeight*ss),srcCanvas=document.createElement('canvas');srcCanvas.width=sw;srcCanvas.height=sh;const sctx=srcCanvas.getContext('2d',{alpha:false});sctx.drawImage(sourceImage,0,0,sw,sh);const srcPts=corners.map(p=>({x:p.x*sw,y:p.y*sh}));
    let ow=Math.max(dist(srcPts[0],srcPts[1]),dist(srcPts[3],srcPts[2])),oh=Math.max(dist(srcPts[0],srcPts[3]),dist(srcPts[1],srcPts[2]));const maxOut=1600,os=Math.min(1,maxOut/Math.max(ow,oh));ow=Math.max(120,Math.round(ow*os));oh=Math.max(120,Math.round(oh*os));const dstPts=[{x:0,y:0},{x:ow-1,y:0},{x:ow-1,y:oh-1},{x:0,y:oh-1}],H=homography(dstPts,srcPts),src=sctx.getImageData(0,0,sw,sh),out=document.createElement('canvas');out.width=ow;out.height=oh;const octx=out.getContext('2d',{alpha:false}),od=octx.createImageData(ow,oh),sd=src.data,dd=od.data;
    let q=0;for(let y=0;y<oh;y++)for(let x=0;x<ow;x++,q+=4){const z=H[6]*x+H[7]*y+1,sx=(H[0]*x+H[1]*y+H[2])/z,sy=(H[3]*x+H[4]*y+H[5])/z,ix=Math.max(0,Math.min(sw-1,Math.round(sx))),iy=Math.max(0,Math.min(sh-1,Math.round(sy))),p=(iy*sw+ix)*4;dd[q]=sd[p];dd[q+1]=sd[p+1];dd[q+2]=sd[p+2];dd[q+3]=255}applyFilter(od,filterMode);octx.putImageData(od,0,0);return out
  }

  async function straightenDocument(){
    const btn=$('[data-isc-straighten]',modal);btn.disabled=true;btn.textContent='正在拉正…';try{const c=await perspectiveCanvas();docDataUrl=c.toDataURL('image/jpeg',.91);showTargetStage()}catch(e){btn.disabled=false;btn.textContent='拉正並繼續';typeof toast==='function'&&toast('掃描拉正失敗：'+(e?.message||e))}
  }

  function showTargetStage(){
    setStep(2);targetStrokes=[];targetCurrent=null;const main=$('[data-isc-main]',modal),bottom=$('[data-isc-bottom]',modal);main.innerHTML=`<section class="isc-target"><img data-isc-doc alt="已拉正的題目頁"><canvas data-isc-target-canvas></canvas><div class="isc-target-tip">半透明畫筆：塗過你要整理的那一題</div><div class="isc-scan-quality">已拉正 · 已增強</div></section>`;const img=$('[data-isc-doc]',modal);img.src=docDataUrl;bottom.innerHTML=`<div class="isc-target-actions"><div class="isc-target-tools"><button class="isc-secondary" data-isc-back>← 重調掃描</button><button class="isc-secondary" data-isc-undo>↶ 上一步</button><button class="isc-secondary" data-isc-clear>清除</button><button class="isc-link" data-isc-whole>整頁就是這題</button></div><button class="isc-primary" data-isc-use disabled>辨識這一題</button></div>`;
    img.onload=()=>setupTargetCanvas();$('[data-isc-back]',modal).onclick=showCornerEditor;$('[data-isc-undo]',modal).onclick=()=>{targetStrokes.pop();paintTarget()};$('[data-isc-clear]',modal).onclick=()=>{targetStrokes=[];paintTarget()};$('[data-isc-whole]',modal).onclick=()=>analyzeSelection({x:0,y:0,width:1,height:1},true);$('[data-isc-use]',modal).onclick=()=>{const pts=targetStrokes.flat();if(!pts.length)return;let x1=1,y1=1,x2=0,y2=0;for(const p of pts){x1=Math.min(x1,p.x);y1=Math.min(y1,p.y);x2=Math.max(x2,p.x);y2=Math.max(y2,p.y)}const pad=.025;analyzeSelection({x:clamp(x1-pad),y:clamp(y1-pad),width:clamp(x2-x1+pad*2,.035,1),height:clamp(y2-y1+pad*2,.035,1)},false)};
  }
  function setupTargetCanvas(){const c=$('[data-isc-target-canvas]',modal),img=$('[data-isc-doc]',modal);c.width=1200;c.height=Math.max(300,Math.round(1200*(img.naturalHeight/Math.max(1,img.naturalWidth))));c.addEventListener('pointerdown',e=>{e.preventDefault();targetCurrent=[targetPoint(e,c)];targetStrokes.push(targetCurrent);c.setPointerCapture?.(e.pointerId);paintTarget()});c.addEventListener('pointermove',e=>{if(!targetCurrent)return;e.preventDefault();const p=targetPoint(e,c),last=targetCurrent[targetCurrent.length-1];if(!last||Math.hypot((p.x-last.x)*c.width,(p.y-last.y)*c.height)>3){targetCurrent.push(p);paintTarget()}});const end=()=>targetCurrent=null;c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);paintTarget()}
  function targetPoint(e,c){const r=c.getBoundingClientRect();return{x:clamp((e.clientX-r.left)/r.width),y:clamp((e.clientY-r.top)/r.height)}}
  function paintTarget(){const c=$('[data-isc-target-canvas]',modal);if(!c)return;const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=Math.max(22,c.width*.032);ctx.strokeStyle='rgba(49,118,255,.30)';for(const s of targetStrokes){if(!s.length)continue;ctx.beginPath();s.forEach((p,i)=>i?ctx.lineTo(p.x*c.width,p.y*c.height):ctx.moveTo(p.x*c.width,p.y*c.height));if(s.length===1)ctx.lineTo(s[0].x*c.width+.1,s[0].y*c.height+.1);ctx.stroke()}const use=$('[data-isc-use]',modal);if(use)use.disabled=!targetStrokes.some(s=>s.length)}

  async function analyzeSelection(box,whole){
    const use=$('[data-isc-use]',modal);if(use){use.disabled=true;use.textContent='正在 OCR…'}setStep(3);const main=$('[data-isc-main]',modal);main.insertAdjacentHTML('beforeend','<div class="isc-progress"><strong>正在辨識題目、題圖與你的答案</strong><span>只會分析你剛剛標記的範圍</span></div>');
    try{const doc=await loadImage(docDataUrl),sx=Math.round(box.x*doc.naturalWidth),sy=Math.round(box.y*doc.naturalHeight),sw=Math.max(1,Math.round(Math.min(1-box.x,box.width)*doc.naturalWidth)),sh=Math.max(1,Math.round(Math.min(1-box.y,box.height)*doc.naturalHeight)),max=1600,s=Math.min(1,max/Math.max(sw,sh)),c=document.createElement('canvas');c.width=Math.round(sw*s);c.height=Math.round(sh*s);const ctx=c.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(doc,sx,sy,sw,sh,0,0,c.width,c.height);const display=c.toDataURL('image/jpeg',.93),blob=await canvasBlob(c,'image/jpeg',.93),f=new File([blob],'wrongbook-selected-question.jpg',{type:'image/jpeg',lastModified:Date.now()}),processed=typeof wbPreprocessImageFile==='function'?await wbPreprocessImageFile(f,1700,.88):{dataUrl:display,base64:dataPart(display),mimeType:'image/jpeg'};
      state.scanOriginalImage=sourceDataUrl;state.scanDocumentImage=docDataUrl;state.scanDisplayImage=display;state.scanImage=processed.dataUrl||display;state.scanBase64=processed.base64||dataPart(display);state.scanMime=processed.mimeType||'image/jpeg';state.scanSelection={version:VERSION,bbox:box,whole:Boolean(whole),confirmed:true,source:'straightened-document',filter:filterMode,preprocess:processed.preprocess||window.__wrongbookLastImagePreprocess||null};state.scan=null;state.scanConfirmed=false;save();close();await analyzePhoto();
    }catch(e){modal?.querySelector('.isc-progress')?.remove();if(use){use.disabled=false;use.textContent='辨識這一題'}typeof toast==='function'&&toast('OCR 前處理失敗：'+(e?.message||e))}
  }

  function open(){
    document.getElementById('captureModal')?.remove();document.getElementById('nqcTargetSelector')?.remove();close();document.body.insertAdjacentHTML('beforeend',shell());modal=document.getElementById('iscannerCapture');$('[data-isc-close]',modal).onclick=close;$('[data-isc-gallery]',modal).onclick=chooseFile;openCamera();
  }

  // Own both future binds and the currently rendered capture buttons.
  try{window.openCapture=open;openCapture=open}catch{}
  document.addEventListener('click',e=>{const b=e.target?.closest?.('[data-action="capture"]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();open()},true);

  window.wrongbookIScannerCaptureQA=function(){return{version:VERSION,liveCamera:Boolean(navigator.mediaDevices?.getUserMedia),galleryFallback:true,autoBorderDetection:true,draggableFourCorners:true,perspectiveStraighten:true,filters:['color','clean','bw'],defaultFilter:'clean',semiTransparentProblemBrush:true,brushOpacity:.30,requiresTargetBeforeOCR:true,analysisUsesSelectedCrop:true,preservesOriginalImage:true,preservesStraightenedDocument:true,existingAIAnalyzeReused:typeof analyzePhoto==='function'}};
})();
