// Keep the real app completely hidden until the final paper-first runtime has rendered.
// Several legacy modules still render while the synchronous script chain is loading; without this
// boot cloak the browser can paint those intermediate versions for a frame or two.
(function(){
 if(window.__wrongbookBootCloak)return;
 window.__wrongbookBootCloak=true;
 document.documentElement.classList.add('wb-ui-booting');

 const style=document.createElement('style');
 style.id='wrongbookBootCloakStyle';
 style.textContent=`
  html.wb-ui-booting #app{visibility:hidden!important;opacity:0!important;pointer-events:none!important}
  #wbBootScreen{position:fixed;inset:0;z-index:2147483646;display:grid;place-items:center;background:#fbfbf8;color:#243126;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC",sans-serif}
  #wbBootScreen .wb-boot-card{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:14px;background:rgba(255,255,255,.92);box-shadow:0 8px 28px rgba(40,62,43,.08)}
  #wbBootScreen .wb-boot-mark{display:grid;place-items:center;width:38px;height:38px;border-radius:11px;background:#557B56;color:#fff;font-weight:800;font-size:19px}
  #wbBootScreen .wb-boot-copy{display:grid;gap:2px}
  #wbBootScreen strong{font-size:15px;line-height:1.25}
  #wbBootScreen span{font-size:12px;color:#738075}
  @media (prefers-reduced-motion:no-preference){#wbBootScreen .wb-boot-mark{animation:wbBootPulse 1.25s ease-in-out infinite alternate}@keyframes wbBootPulse{to{transform:scale(.94);opacity:.78}}}
 `;
 document.head.appendChild(style);

 if(!document.getElementById('wbBootScreen')){
  const boot=document.createElement('div');
  boot.id='wbBootScreen';
  boot.setAttribute('role','status');
  boot.setAttribute('aria-live','polite');
  boot.innerHTML='<div class="wb-boot-card"><div class="wb-boot-mark">錯</div><div class="wb-boot-copy"><strong>錯題本</strong><span>正在載入你的工作紙…</span></div></div>';
  document.body.appendChild(boot);
 }

 window.__wrongbookFinishBoot=function(){
  if(window.__wrongbookBootFinished)return;
  window.__wrongbookBootFinished=true;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   document.documentElement.classList.remove('wb-ui-booting');
   const boot=document.getElementById('wbBootScreen');
   if(boot)boot.remove();
  }));
 };

 window.setTimeout(()=>{
  if(window.__wrongbookBootFinished)return;
  const copy=document.querySelector('#wbBootScreen .wb-boot-copy span');
  if(copy)copy.textContent='載入時間較長，請重新整理頁面。';
 },12000);
})();

if(typeof esc==='function'&&typeof twTaiwanizeString==='function'){
 const __baseEsc=esc;
 esc=function(value=''){return __baseEsc(twTaiwanizeString(String(value)))};
}

(function(){
 if(document.getElementById('paperFirstVisualFix20260817'))return;
 const link=document.createElement('link');
 link.id='paperFirstVisualFix20260817';
 link.rel='stylesheet';
 link.href='./paper-first-visual-fix-20260817.css?v=20260817-1';
 document.head.appendChild(link);
})();

(function(){
 if(document.getElementById('tutorMathV5'))return;
 const script=document.createElement('script');
 script.id='tutorMathV5';
 script.src='./tutor-math-v5.js?wb=20260817-1';
 script.async=true;
 document.head.appendChild(script);
})();

// Load all tutor presentation/flow guards before revealing the app. This prevents legacy mode
// handlers from being briefly interactive and guarantees one consistent tutor UI from first paint.
(function(){
 const oldFinish=window.__wrongbookFinishBoot;
 let cssReady=false,dialogReady=false,flowReady=false,pendingFinish=false;
 const maybeReady=()=>{
  if(!cssReady||!dialogReady||!flowReady)return;
  window.__wrongbookTutorDialogV6Ready=true;
  window.__wrongbookTutorFlowV7Ready=true;
  if(pendingFinish)oldFinish?.();
 };
 window.__wrongbookFinishBoot=function(){
  if(window.__wrongbookTutorDialogV6Ready&&window.__wrongbookTutorFlowV7Ready)return oldFinish?.();
  pendingFinish=true;
 };

 const link=document.createElement('link');
 link.id='tutorDialogControlV6Css';
 link.rel='stylesheet';
 link.href='./tutor-dialog-control-v6.css?wb=20260817-5';
 link.onload=()=>{cssReady=true;maybeReady()};
 link.onerror=()=>{cssReady=true;maybeReady()};
 document.head.appendChild(link);

 const dialog=document.createElement('script');
 dialog.id='tutorDialogControlV6';
 dialog.src='./tutor-dialog-control-v6.js?wb=20260817-3';
 dialog.async=false;
 dialog.onload=()=>{dialogReady=true;maybeReady()};
 dialog.onerror=()=>{dialogReady=true;maybeReady()};
 document.head.appendChild(dialog);

 const flow=document.createElement('script');
 flow.id='tutorFlowFixV7';
 flow.src='./tutor-flow-fix-v7.js?wb=20260817-3';
 flow.async=false;
 flow.onload=()=>{flowReady=true;maybeReady()};
 flow.onerror=()=>{flowReady=true;maybeReady()};
 document.head.appendChild(flow);
})();

// V8 owns three production guarantees: an expanded tutor never covers the prompt, conceptual
// diagrams can be rendered inside tutor steps, and review sessions always include scratch paper.
// Keep the boot cloak up until all six V8 assets have loaded to avoid another first-paint UI swap.
(function(){
 const oldFinish=window.__wrongbookFinishBoot;
 const ready={nonOverlapCss:false,nonOverlapJs:false,diagramCss:false,diagramJs:false,reviewCss:false,reviewJs:false};
 let pendingFinish=false;
 const allReady=()=>Object.values(ready).every(Boolean);
 const maybeReady=()=>{
  if(!allReady())return;
  window.__wrongbookTutorV8Ready=true;
  if(pendingFinish)oldFinish?.();
 };
 window.__wrongbookFinishBoot=function(){
  if(window.__wrongbookTutorV8Ready)return oldFinish?.();
  pendingFinish=true;
 };
 function css(id,href,key){
  const link=document.createElement('link');link.id=id;link.rel='stylesheet';link.href=href;
  link.onload=link.onerror=()=>{ready[key]=true;maybeReady()};document.head.appendChild(link);
 }
 function js(id,src,key){
  const script=document.createElement('script');script.id=id;script.src=src;script.async=false;
  script.onload=script.onerror=()=>{ready[key]=true;maybeReady()};document.head.appendChild(script);
 }
 css('tutorNonOverlapV8Css','./tutor-nonoverlap-v8.css?wb=20260817-1','nonOverlapCss');
 js('tutorNonOverlapV8','./tutor-nonoverlap-v8.js?wb=20260817-1','nonOverlapJs');
 css('tutorDiagramV8Css','./tutor-diagram-v8.css?wb=20260817-1','diagramCss');
 js('tutorDiagramV8','./tutor-diagram-v8.js?wb=20260817-1','diagramJs');
 css('reviewWritingSheetV8Css','./review-writing-sheet-v8.css?wb=20260817-1','reviewCss');
 js('reviewWritingSheetV8','./review-writing-sheet-v8.js?wb=20260817-2','reviewJs');
})();
