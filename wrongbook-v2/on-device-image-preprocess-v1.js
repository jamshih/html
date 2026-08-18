// Wrongbook — on-device document preprocessing before any Gemini upload.
// Keeps spatial geometry intact: we crop outer blank margins, but never rearrange rows/diagrams.
(function(){
  if(window.__wrongbookOnDeviceImagePreprocessV1)return;
  window.__wrongbookOnDeviceImagePreprocessV1=true;

  const ANALYSIS_MAX=720;
  const DEFAULT_UPLOAD_MAX=1500;
  const TARGET_BYTES=1_550_000;
  const MIN_QUALITY=.68;
  let lastMeta=null;

  const clamp=(v,a,b)=>Math.min(Math.max(v,a),b);
  const approxBytes=dataUrl=>Math.max(0,Math.round(((dataUrl.split(',')[1]||'').length*3)/4));

  function percentile(hist,p,total){
    const target=Math.max(0,Math.min(total-1,Math.floor(total*p)));
    let seen=0;
    for(let i=0;i<hist.length;i++){seen+=hist[i];if(seen>target)return i}
    return 255;
  }

  function smooth(values,radius=2){
    const out=new Float32Array(values.length),prefix=new Float64Array(values.length+1);
    for(let i=0;i<values.length;i++)prefix[i+1]=prefix[i]+values[i];
    for(let i=0;i<values.length;i++){
      const a=Math.max(0,i-radius),b=Math.min(values.length,i+radius+1);
      out[i]=(prefix[b]-prefix[a])/(b-a);
    }
    return out;
  }

  function bandsFromProjection(values,threshold,minRun,mergeGap){
    const bands=[];let start=-1;
    for(let i=0;i<=values.length;i++){
      const on=i<values.length&&values[i]>=threshold;
      if(on&&start<0)start=i;
      if(!on&&start>=0){if(i-start>=minRun)bands.push([start,i]);start=-1}
    }
    if(!bands.length)return[];
    const merged=[bands[0].slice()];
    for(let i=1;i<bands.length;i++){
      const prev=merged[merged.length-1],cur=bands[i];
      if(cur[0]-prev[1]<=mergeGap)prev[1]=cur[1];else merged.push(cur.slice());
    }
    return merged;
  }

  function expandRange(a,b,size,minFraction,padFraction){
    const pad=Math.round(size*padFraction);a=Math.max(0,a-pad);b=Math.min(size,b+pad);
    const wanted=size*minFraction;
    if(b-a<wanted){const mid=(a+b)/2;a=Math.max(0,Math.floor(mid-wanted/2));b=Math.min(size,Math.ceil(a+wanted));a=Math.max(0,b-wanted)}
    return[Math.round(a),Math.round(b)];
  }

  function inspectDocument(canvas){
    const ctx=canvas.getContext('2d',{willReadFrequently:true}),img=ctx.getImageData(0,0,canvas.width,canvas.height),d=img.data,w=canvas.width,h=canvas.height;
    const hist=new Uint32Array(256),rowDark=new Float32Array(h),colDark=new Float32Array(w);
    let satSum=0,bright=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=(y*w+x)*4,r=d[i],g=d[i+1],b=d[i+2],mx=Math.max(r,g,b),mn=Math.min(r,g,b),lum=Math.round(.2126*r+.7152*g+.0722*b);
      hist[lum]++;satSum+=mx?((mx-mn)/mx):0;if(lum>=225)bright++;
    }
    const total=w*h,p12=percentile(hist,.12,total),p88=percentile(hist,.88,total);
    const threshold=clamp(Math.round(p88-Math.max(14,(p88-p12)*.13)),145,240);
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=(y*w+x)*4,lum=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];
      if(lum<threshold){rowDark[y]++;colDark[x]++}
    }
    for(let y=0;y<h;y++)rowDark[y]/=w;
    for(let x=0;x<w;x++)colDark[x]/=h;
    const rowSmooth=smooth(rowDark,2),colSmooth=smooth(colDark,2),paperLike=(bright/total)>.48;
    const rowThreshold=paperLike ? .0045 : .011,colThreshold=paperLike ? .0035 : .009;
    const rows=bandsFromProjection(rowSmooth,rowThreshold,2,Math.max(4,Math.round(h*.014)));
    let y1=0,y2=h;
    if(paperLike&&rows.length){y1=rows[0][0];y2=rows[rows.length-1][1];[y1,y2]=expandRange(y1,y2,h,.42,.035)}
    const localCols=new Float32Array(w);
    if(paperLike){
      for(let x=0;x<w;x++){
        let count=0;
        for(let y=y1;y<y2;y++){
          const i=(y*w+x)*4,lum=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];if(lum<threshold)count++;
        }
        localCols[x]=count/Math.max(1,y2-y1);
      }
    }
    const cols=paperLike?bandsFromProjection(smooth(localCols,2),colThreshold,2,Math.max(4,Math.round(w*.012))):[];
    let x1=0,x2=w;
    if(cols.length){x1=cols[0][0];x2=cols[cols.length-1][1];[x1,x2]=expandRange(x1,x2,w,.56,.035)}
    const cropArea=((x2-x1)*(y2-y1))/total;
    if(cropArea>.965){x1=0;y1=0;x2=w;y2=h}
    return{
      crop:{x:x1,y:y1,width:x2-x1,height:y2-y1},
      rows:rows.map(([a,b])=>({y:a,height:b-a})),
      paperLike,
      grayscaleSuggested:(bright/total)>.53&&(satSum/total)<.18,
      brightFraction:bright/total,
      meanSaturation:satSum/total,
      threshold
    };
  }

  function enhance(canvas,grayscale){
    if(!grayscale)return;
    const ctx=canvas.getContext('2d',{willReadFrequently:true}),img=ctx.getImageData(0,0,canvas.width,canvas.height),d=img.data;
    for(let i=0;i<d.length;i+=4){
      let v=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];
      v=clamp((v-128)*1.13+128,0,255);
      if(v>241)v=255;
      d[i]=d[i+1]=d[i+2]=Math.round(v);
    }
    ctx.putImageData(img,0,0);
  }

  function encode(canvas,quality){
    let q=clamp(Number(quality)||.82,MIN_QUALITY,.88),dataUrl=canvas.toDataURL('image/jpeg',q),bytes=approxBytes(dataUrl);
    while(bytes>TARGET_BYTES&&q>MIN_QUALITY+.01){q=Math.max(MIN_QUALITY,q-.06);dataUrl=canvas.toDataURL('image/jpeg',q);bytes=approxBytes(dataUrl)}
    return{dataUrl,bytes,quality:q};
  }

  async function decodeFile(file){
    if('createImageBitmap'in window){
      try{const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});return{source:bitmap,width:bitmap.width,height:bitmap.height,close:()=>bitmap.close?.()}}catch{}
    }
    const url=URL.createObjectURL(file),img=new Image();img.decoding='async';img.src=url;await img.decode();
    return{source:img,width:img.naturalWidth,height:img.naturalHeight,close:()=>URL.revokeObjectURL(url)};
  }

  async function preprocessImageFile(file,maxSide=DEFAULT_UPLOAD_MAX,quality=.82){
    const started=performance.now(),decoded=await decodeFile(file);try{
      const sourceW=decoded.width,sourceH=decoded.height,aScale=Math.min(1,ANALYSIS_MAX/Math.max(sourceW,sourceH)),aw=Math.max(1,Math.round(sourceW*aScale)),ah=Math.max(1,Math.round(sourceH*aScale));
      const analysis=document.createElement('canvas');analysis.width=aw;analysis.height=ah;const actx=analysis.getContext('2d',{alpha:false});actx.fillStyle='#fff';actx.fillRect(0,0,aw,ah);actx.drawImage(decoded.source,0,0,aw,ah);
      const inspection=inspectDocument(analysis),c=inspection.crop;
      const sx=Math.max(0,Math.floor(c.x/aScale)),sy=Math.max(0,Math.floor(c.y/aScale)),sw=Math.min(sourceW-sx,Math.ceil(c.width/aScale)),sh=Math.min(sourceH-sy,Math.ceil(c.height/aScale));
      const requested=Math.min(DEFAULT_UPLOAD_MAX,Math.max(900,Number(maxSide)||DEFAULT_UPLOAD_MAX)),outScale=Math.min(1,requested/Math.max(sw,sh)),ow=Math.max(1,Math.round(sw*outScale)),oh=Math.max(1,Math.round(sh*outScale));
      const out=document.createElement('canvas');out.width=ow;out.height=oh;const octx=out.getContext('2d',{alpha:false});octx.fillStyle='#fff';octx.fillRect(0,0,ow,oh);octx.imageSmoothingEnabled=true;octx.imageSmoothingQuality='high';octx.drawImage(decoded.source,sx,sy,sw,sh,0,0,ow,oh);
      let subject='';try{subject=String(state?.subject||'')}catch{}
      const grayscale=['math','physics'].includes(subject)||inspection.grayscaleSuggested;
      enhance(out,grayscale);
      const encoded=encode(out,Math.min(.84,Number(quality)||.82));
      const rows=inspection.rows.map(r=>({y:Math.round(r.y/aScale),height:Math.round(r.height/aScale)})).filter(r=>r.y+r.height>=sy&&r.y<=sy+sh);
      const meta={
        version:'on-device-v1',source:{width:sourceW,height:sourceH,bytes:Number(file?.size)||0},
        crop:{x:sx,y:sy,width:sw,height:sh},output:{width:ow,height:oh,bytes:encoded.bytes,mimeType:'image/jpeg',quality:encoded.quality},
        rows,grayscale,paperLike:inspection.paperLike,threshold:inspection.threshold,
        reduction:Number(file?.size)?Math.max(0,1-encoded.bytes/file.size):null,
        elapsedMs:Math.round(performance.now()-started)
      };
      lastMeta=meta;window.__wrongbookLastImagePreprocess=meta;
      return{dataUrl:encoded.dataUrl,base64:encoded.dataUrl.split(',')[1],mimeType:'image/jpeg',preprocess:meta};
    }finally{decoded.close?.()}
  }

  window.wbPreprocessImageFile=preprocessImageFile;
  try{imageFileToData=preprocessImageFile}catch{}
  window.imageFileToData=preprocessImageFile;
  window.__wrongbookImagePreprocessQA=()=>({loaded:true,last:lastMeta,wholeOriginalUpload:false,rowProjection:true,adaptiveGrayscale:true,geometryPreserved:true,maxUploadSide:DEFAULT_UPLOAD_MAX,targetBytes:TARGET_BYTES});
})();