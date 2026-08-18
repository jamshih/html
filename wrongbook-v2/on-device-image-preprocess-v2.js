// High-fidelity document preprocessing for OCR-first capture.
// V1 capped every image at 1500 px / ~1.55 MB, which was visibly soft on textbook math.
(function(){
  const VERSION='2026-08-18-preprocess-v2-hires';
  if(window.__wrongbookImagePreprocessV2===VERSION)return;
  window.__wrongbookImagePreprocessV2=VERSION;
  const DEFAULT_MAX=2600,MAX_MAX=3200,TARGET_BYTES=4_200_000,MIN_Q=.82,MAX_Q=.95;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
  const bytes=url=>Math.round(((String(url).split(',')[1]||'').length*3)/4);
  async function decode(file){if('createImageBitmap'in window){try{const b=await createImageBitmap(file,{imageOrientation:'from-image'});return{src:b,w:b.width,h:b.height,close:()=>b.close?.()}}catch{}}const u=URL.createObjectURL(file),i=new Image();i.decoding='async';i.src=u;await i.decode();return{src:i,w:i.naturalWidth,h:i.naturalHeight,close:()=>URL.revokeObjectURL(u)}}
  function conservativeBounds(src,w,h){
    const max=760,s=Math.min(1,max/Math.max(w,h)),aw=Math.max(1,Math.round(w*s)),ah=Math.max(1,Math.round(h*s)),c=document.createElement('canvas');c.width=aw;c.height=ah;const x=c.getContext('2d',{alpha:false,willReadFrequently:true});x.fillStyle='#fff';x.fillRect(0,0,aw,ah);x.drawImage(src,0,0,aw,ah);const d=x.getImageData(0,0,aw,ah).data,row=new Float32Array(ah),col=new Float32Array(aw);
    for(let y=0;y<ah;y++)for(let xx=0;xx<aw;xx++){const p=(y*aw+xx)*4,lum=.2126*d[p]+.7152*d[p+1]+.0722*d[p+2];if(lum<238){row[y]++;col[xx]++}}
    for(let y=0;y<ah;y++)row[y]/=aw;for(let xx=0;xx<aw;xx++)col[xx]/=ah;
    const first=(a,t)=>{for(let i=0;i<a.length;i++)if(a[i]>t)return i;return 0},last=(a,t)=>{for(let i=a.length-1;i>=0;i--)if(a[i]>t)return i;return a.length-1};
    let y1=first(row,.004),y2=last(row,.004),x1=first(col,.003),x2=last(col,.003);const px=Math.round(aw*.025),py=Math.round(ah*.025);x1=Math.max(0,x1-px);x2=Math.min(aw-1,x2+px);y1=Math.max(0,y1-py);y2=Math.min(ah-1,y2+py);const area=((x2-x1+1)*(y2-y1+1))/(aw*ah);if(area<.45||area>.985)return{x:0,y:0,width:w,height:h};return{x:Math.round(x1/s),y:Math.round(y1/s),width:Math.min(w-Math.round(x1/s),Math.round((x2-x1+1)/s)),height:Math.min(h-Math.round(y1/s),Math.round((y2-y1+1)/s))}
  }
  function mildEnhance(canvas){const x=canvas.getContext('2d',{willReadFrequently:true}),im=x.getImageData(0,0,canvas.width,canvas.height),d=im.data;for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2],lum=.2126*r+.7152*g+.0722*b;const gain=lum>210?1.05:1.08;d[i]=clamp((r-128)*gain+132,0,255);d[i+1]=clamp((g-128)*gain+132,0,255);d[i+2]=clamp((b-128)*gain+132,0,255)}x.putImageData(im,0,0)}
  async function preprocess(file,maxSide=DEFAULT_MAX,quality=.93){const t=performance.now(),d=await decode(file);try{const b=conservativeBounds(d.src,d.w,d.h),requested=clamp(maxSide||DEFAULT_MAX,1200,MAX_MAX),s=Math.min(1,requested/Math.max(b.width,b.height)),ow=Math.max(1,Math.round(b.width*s)),oh=Math.max(1,Math.round(b.height*s)),c=document.createElement('canvas');c.width=ow;c.height=oh;const x=c.getContext('2d',{alpha:false});x.fillStyle='#fff';x.fillRect(0,0,ow,oh);x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(d.src,b.x,b.y,b.width,b.height,0,0,ow,oh);mildEnhance(c);let q=clamp(quality,MIN_Q,MAX_Q),url=c.toDataURL('image/jpeg',q),size=bytes(url);while(size>TARGET_BYTES&&q>MIN_Q){q=Math.max(MIN_Q,q-.03);url=c.toDataURL('image/jpeg',q);size=bytes(url)}const meta={version:VERSION,source:{width:d.w,height:d.h,bytes:Number(file?.size)||0},crop:b,output:{width:ow,height:oh,bytes:size,quality:q,mimeType:'image/jpeg'},geometryPreserved:true,grayscale:false,elapsedMs:Math.round(performance.now()-t)};window.__wrongbookLastImagePreprocess=meta;return{dataUrl:url,base64:url.split(',')[1],mimeType:'image/jpeg',preprocess:meta}}finally{d.close?.()}}
  window.wbPreprocessImageFile=preprocess;try{imageFileToData=preprocess}catch{}window.imageFileToData=preprocess;
  window.__wrongbookImagePreprocessQA=()=>({loaded:true,version:VERSION,maxUploadSide:MAX_MAX,defaultUploadSide:DEFAULT_MAX,targetBytes:TARGET_BYTES,minQuality:MIN_Q,maxQuality:MAX_Q,no1500pxCap:true,geometryPreserved:true,grayscaleForced:false});
})();
