// Wrongbook V5 tutor vision-accuracy bridge.
// Makes student handwriting much harder to misread by combining a higher-quality
// workspace image, a tight lossless handwriting zoom, structured option text,
// and explicit separation of historical answers from the latest visible work.
const V5_TUTOR_VISION_VERSION='2026-08-17-tutor-vision-accuracy-v5c';

function v5VisionInkBounds(){
  const paths=(typeof drawing==='object'&&Array.isArray(drawing?.paths))?drawing.paths:[];
  let minX=1,minY=1,maxX=0,maxY=0,seen=false;
  for(const path of paths){
    for(const pt of path?.pts||[]){
      const x=Number(pt?.x),y=Number(pt?.y);if(!Number.isFinite(x)||!Number.isFinite(y))continue;
      seen=true;minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);
    }
  }
  if(!seen||maxX<=minX||maxY<=minY)return null;
  const px=Math.max(.035,(maxX-minX)*.08),py=Math.max(.035,(maxY-minY)*.12);
  return{x:clamp(minX-px,0,1),y:clamp(minY-py,0,1),x2:clamp(maxX+px,0,1),y2:clamp(maxY+py,0,1)};
}

async function v5VisionHandwritingZoom(){
  const ink=document.getElementById('drawCanvas'),b=v5VisionInkBounds();if(!ink||!b||!ink.width||!ink.height)return null;
  const sx=Math.floor(b.x*ink.width),sy=Math.floor(b.y*ink.height),sw=Math.max(1,Math.ceil((b.x2-b.x)*ink.width)),sh=Math.max(1,Math.ceil((b.y2-b.y)*ink.height));
  const maxDim=Math.max(sw,sh),scale=Math.min(2.4,Math.max(1,1800/Math.max(1,maxDim))),out=document.createElement('canvas');
  out.width=Math.max(360,Math.round(sw*scale));out.height=Math.max(240,Math.round(sh*scale));
  const ctx=out.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,out.width,out.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(ink,sx,sy,sw,sh,0,0,out.width,out.height);
  const url=out.toDataURL('image/png');return{base64:url.split(',')[1],mimeType:'image/png',bounds:b,width:out.width,height:out.height};
}

function v5VisionInstall(){
  let ready=true;
  if(typeof v3WorkspaceImage==='function'&&!window.__v5VisionWorkspaceWrapped){
    window.__v5VisionWorkspaceWrapped=true;
    v3WorkspaceImage=async function(){
      const paper=document.getElementById('paper'),ink=document.getElementById('drawCanvas');if(!paper||!ink)return null;
      const r=paper.getBoundingClientRect();if(!r.width||!r.height)return null;
      const desired=Math.max(1.5,Math.min(3,window.devicePixelRatio||1)),cap=2800/Math.max(r.width,r.height),scale=Math.max(1,Math.min(desired,cap)),out=document.createElement('canvas');
      out.width=Math.max(1,Math.round(r.width*scale));out.height=Math.max(1,Math.round(r.height*scale));
      const ctx=out.getContext('2d');ctx.scale(scale,scale);ctx.fillStyle='#fff';ctx.fillRect(0,0,r.width,r.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      const img=paper.querySelector('.scan-photo');const hasPhoto=Boolean(img&&img.complete&&img.naturalWidth);
      if(hasPhoto){const ir=img.getBoundingClientRect();ctx.drawImage(img,ir.left-r.left,ir.top-r.top,ir.width,ir.height)}
      ctx.drawImage(ink,0,0,ink.width,ink.height,0,0,r.width,r.height);
      const mimeType=hasPhoto?'image/jpeg':'image/png',url=hasPhoto?out.toDataURL(mimeType,.94):out.toDataURL(mimeType);
      return{base64:url.split(',')[1],mimeType,width:out.width,height:out.height,hasPhoto};
    };
  }else if(typeof v3WorkspaceImage!=='function')ready=false;

  if(typeof v3GuideApi==='function'&&!window.__v5VisionGuideApiWrapped){
    window.__v5VisionGuideApiWrapped=true;const baseGuideApi=v3GuideApi;
    v3GuideApi=async function(body){
      const p=typeof selectedProblem==='function'?selectedProblem():null,next={...(body||{})};
      const inkPresent=Boolean(v5VisionInkBounds());
      if(p){
        next.problemOptions=(p.options||[]).map(o=>({label:String(o?.[0]??''),text:String(o?.[1]??'')}));
        next.studentAnswerIsHistorical=true;
        next.currentInkPresent=inkPresent;
      }
      if(inkPresent){
        // Critical anti-anchoring rule: once the student has written on the paper,
        // do NOT send the old selected answer as the current answer. Keep it only
        // as client-side history; the tutor must reconstruct current work from vision.
        next.historicalStudentAnswer=Array.isArray(next.studentAnswer)?[...next.studentAnswer]:next.studentAnswer;
        next.studentAnswer=[];
        if(next.mode!=='direct')next.requestType='evaluate';
        const note='目前工作紙上有學生新筆跡。請先從最新工作紙與手寫放大圖辨識目前作答；不要從歷史原選答案推測學生現在寫了什麼。';
        next.studentAttemptNote=[String(next.studentAttemptNote||'').trim(),note].filter(Boolean).join('\n');
        next.question=[String(next.question||'').trim(),'【禁止歷史答案錨定】只要目前工作紙有手寫，學生過去選過哪一個選項都不能作為目前作答的證據。必須先讀圖，再判斷。'].filter(Boolean).join('\n');
      }
      if(next.imageBase64&&inkPresent){
        try{const zoom=await v5VisionHandwritingZoom();if(zoom?.base64){next.handwritingImageBase64=zoom.base64;next.handwritingMimeType=zoom.mimeType;next.handwritingBounds=zoom.bounds}}catch{}
      }
      return baseGuideApi.call(this,next);
    };
  }else if(typeof v3GuideApi!=='function')ready=false;
  return ready;
}

(function v5VisionBootstrap(){
  if(v5VisionInstall())return;
  let tries=0;const timer=setInterval(()=>{tries++;if(v5VisionInstall()||tries>=240)clearInterval(timer)},25);
})();

window.v5TutorVisionState=async function(){
  const p=typeof selectedProblem==='function'?selectedProblem():null,zoom=await v5VisionHandwritingZoom().catch(()=>null);
  return{version:V5_TUTOR_VISION_VERSION,installed:{workspace:Boolean(window.__v5VisionWorkspaceWrapped),api:Boolean(window.__v5VisionGuideApiWrapped)},problemId:p?.id||'',inkPresent:Boolean(v5VisionInkBounds()),options:(p?.options||[]).length,zoom:zoom?{mimeType:zoom.mimeType,width:zoom.width,height:zoom.height,bounds:zoom.bounds}:null};
};
