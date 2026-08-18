// iScanner/Adobe-Scan-style live page detection + stable auto-capture for the web camera flow.
(function(){
  const VERSION='2026-08-18-iscanner-live-autocapture-v1';
  if(window.__wrongbookIScannerLiveAutoCapture===VERSION)return;
  window.__wrongbookIScannerLiveAutoCapture=VERSION;
  const sessions=new WeakMap();
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
  function detect(video){
    if(!video.videoWidth||!video.videoHeight)return null;
    const max=260,s=Math.min(1,max/Math.max(video.videoWidth,video.videoHeight)),w=Math.max(80,Math.round(video.videoWidth*s)),h=Math.max(80,Math.round(video.videoHeight*s)),c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{alpha:false});x.drawImage(video,0,0,w,h);const d=x.getImageData(0,0,w,h).data,g=new Float32Array(w*h);for(let i=0,p=0;i<d.length;i+=4,p++)g[p]=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];const cols=new Float64Array(w),rows=new Float64Array(h);for(let y=1;y<h;y++)for(let xx=1;xx<w;xx++){const p=y*w+xx;cols[xx]+=Math.abs(g[p]-g[p-1]);rows[y]+=Math.abs(g[p]-g[p-w])}const peak=(arr,a,b)=>{let bi=a,bv=0;for(let i=Math.max(2,a);i<Math.min(arr.length-2,b);i++){const v=arr[i]+arr[i-1]+arr[i+1];if(v>bv){bv=v;bi=i}}return{idx:bi,val:bv}};const L=peak(cols,Math.floor(w*.02),Math.floor(w*.42)),R=peak(cols,Math.floor(w*.58),Math.floor(w*.98)),T=peak(rows,Math.floor(h*.02),Math.floor(h*.42)),B=peak(rows,Math.floor(h*.58),Math.floor(h*.98));const width=(R.idx-L.idx)/w,height=(B.idx-T.idx)/h,area=width*height,energy=(L.val+R.val+T.val+B.val)/(Math.max(1,w*h));if(width<.38||height<.38||area<.22)return null;return{x:L.idx/w,y:T.idx/h,width,height,confidence:clamp(energy/18,0,1)}}
  function delta(a,b){if(!a||!b)return 1;return Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.width-b.width),Math.abs(a.height-b.height))}
  function attach(camera){
    if(!camera||sessions.has(camera))return;const video=camera.querySelector('video'),frame=camera.querySelector('.isc-camera-frame'),hint=camera.querySelector('.isc-live-hint');if(!video||!frame)return;const s={last:null,stable:0,timer:null,captured:false};sessions.set(camera,s);
    const tick=()=>{if(!camera.isConnected||s.captured){clearInterval(s.timer);return}const box=detect(video);if(!box){s.stable=0;s.last=null;frame.style.left='8%';frame.style.right='8%';frame.style.top='10%';frame.style.bottom='10%';if(hint)hint.textContent='把整張紙放進框內';return}frame.style.left=(box.x*100)+'%';frame.style.top=(box.y*100)+'%';frame.style.right=((1-box.x-box.width)*100)+'%';frame.style.bottom=((1-box.y-box.height)*100)+'%';const stable=delta(box,s.last)<.018;s.stable=stable?s.stable+1:0;s.last=box;if(hint)hint.textContent=s.stable>=1?'保持不動…':'已找到紙張邊界';if(s.stable>=3){const shutter=document.querySelector('#iscannerCapture [data-shutter], .isc-backdrop [data-shutter]');if(shutter){s.captured=true;if(hint)hint.textContent='自動拍攝';setTimeout(()=>shutter.click(),120)}}};
    const start=()=>{if(s.timer)return;s.timer=setInterval(tick,520)};if(video.readyState>=2)start();else video.addEventListener('loadeddata',start,{once:true});
  }
  const obs=new MutationObserver(()=>document.querySelectorAll('.isc-camera').forEach(attach));obs.observe(document.documentElement,{childList:true,subtree:true});document.querySelectorAll('.isc-camera').forEach(attach);
  window.wrongbookIScannerLiveQA=()=>({version:VERSION,liveBoundaryDetection:true,stableFramesRequired:3,autoCapture:true,manualShutterStillAvailable:true});
})();
