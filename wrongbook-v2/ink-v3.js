// Pressure-aware, resolution-independent handwriting layer.
function v3InkPoint(e,c){const r=c.getBoundingClientRect(),pressure=Number.isFinite(e.pressure)&&e.pressure>0?e.pressure:.5;return{x:clamp((e.clientX-r.left)/Math.max(1,r.width),0,1),y:clamp((e.clientY-r.top)/Math.max(1,r.height),0,1),p:pressure}}
function v3NormalizeLegacyPaths(paths,c){const r=c.getBoundingClientRect();return (paths||[]).map(path=>{if(path.normalized)return path;return{...path,normalized:true,pts:(path.pts||[]).map(pt=>({x:clamp((Number(pt.x)||0)/Math.max(1,r.width),0,1),y:clamp((Number(pt.y)||0)/Math.max(1,r.height),0,1),p:Number(pt.p)||.5}))}})}

function initCanvas(problemId){
  const c=document.getElementById('drawCanvas');if(!c)return;drawing.canvas=c;drawing.key=problemId;const rect=c.getBoundingClientRect(),dpr=Math.min(3,window.devicePixelRatio||1);c.width=Math.max(1,Math.round(rect.width*dpr));c.height=Math.max(1,Math.round(rect.height*dpr));drawing.ctx=c.getContext('2d');drawing.ctx.setTransform(dpr,0,0,dpr,0,0);drawing.ctx.lineCap='round';drawing.ctx.lineJoin='round';let all={};try{all=JSON.parse(storageGet('wrongbook-v2-ink')||'{}')}catch{}drawing.paths=v3NormalizeLegacyPaths(all[problemId]||[],c);redrawCanvas();
  c.onpointerdown=e=>{e.preventDefault();c.setPointerCapture(e.pointerId);drawing.drawing=true;drawing.current={tool:drawing.tool,normalized:true,pts:[v3InkPoint(e,c)]};drawing.paths.push(drawing.current)};
  c.onpointermove=e=>{if(!drawing.drawing)return;e.preventDefault();const events=e.getCoalescedEvents?.()||[e];for(const ev of events)drawing.current.pts.push(v3InkPoint(ev,c));redrawCanvas()};
  const finish=e=>{if(!drawing.drawing)return;drawing.drawing=false;try{c.releasePointerCapture(e.pointerId)}catch{}saveInk()};c.onpointerup=finish;c.onpointercancel=finish;
  document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{drawing.tool=b.dataset.tool;document.querySelectorAll('[data-tool]').forEach(x=>x.classList.toggle('active',x===b))});
  document.querySelector('[data-action="undoInk"]')?.addEventListener('click',()=>{drawing.paths.pop();redrawCanvas();saveInk()});
  document.querySelector('[data-action="clearInk"]')?.addEventListener('click',()=>{drawing.paths=[];redrawCanvas();saveInk()});
}
function redrawCanvas(){
  const c=drawing.canvas,ctx=drawing.ctx;if(!c||!ctx)return;const r=c.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);
  for(const path of drawing.paths||[]){const pts=path.pts||[];if(pts.length<2)continue;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.globalCompositeOperation=path.tool==='eraser'?'destination-out':'source-over';ctx.strokeStyle=path.tool==='eraser'?'rgba(0,0,0,1)':'#2a5fd2';for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],pressure=clamp(((a.p??.5)+(b.p??.5))/2,.12,1);ctx.beginPath();ctx.lineWidth=path.tool==='eraser'?18:1.4+pressure*3.2;ctx.moveTo(a.x*r.width,a.y*r.height);ctx.lineTo(b.x*r.width,b.y*r.height);ctx.stroke()}ctx.restore()}
}
function saveInk(){let all={};try{all=JSON.parse(storageGet('wrongbook-v2-ink')||'{}')}catch{}all[drawing.key]=drawing.paths;storageSet('wrongbook-v2-ink',JSON.stringify(all));if(typeof v3QueueCloudSync==='function')v3QueueCloudSync()}
