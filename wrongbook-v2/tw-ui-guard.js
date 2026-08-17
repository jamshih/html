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

 // Never reveal an intermediate UI on timeout. If initialization genuinely stalls, keep the
 // neutral loading surface and tell the user instead of exposing whichever legacy render won.
 window.setTimeout(()=>{
  if(window.__wrongbookBootFinished)return;
  const copy=document.querySelector('#wbBootScreen .wb-boot-copy span');
  if(copy)copy.textContent='載入時間較長，請重新整理頁面。';
 },12000);
})();

// AI 或動態資料只要進入一般文字 UI，就再套一次臺灣用語正規化。
if(typeof esc==='function'&&typeof twTaiwanizeString==='function'){
 const __baseEsc=esc;
 esc=function(value=''){return __baseEsc(twTaiwanizeString(String(value)))};
}

// Load narrowly-scoped paper-first visual QA fixes with an explicit version so
// GitHub Pages/browser caches cannot keep a stale alignment rule alive.
(function(){
 if(document.getElementById('paperFirstVisualFix20260817'))return;
 const link=document.createElement('link');
 link.id='paperFirstVisualFix20260817';
 link.rel='stylesheet';
 link.href='./paper-first-visual-fix-20260817.css?v=20260817-1';
 document.head.appendChild(link);
})();

// Tutor answers are escaped as plain text for safety. Load the dedicated math layer early;
// it observes #app and typesets only tutor text once KaTeX is ready.
(function(){
 if(document.getElementById('tutorMathV5'))return;
 const script=document.createElement('script');
 script.id='tutorMathV5';
 script.src='./tutor-math-v5.js?wb=20260817-1';
 script.async=true;
 document.head.appendChild(script);
})();

// The tutor is a dialogue, not a handwriting-only tool. Load the compact collapsible dialogue
// presentation and its neutral answer/AI-hint wording as an independent, cache-busted layer.
(function(){
 if(!document.getElementById('tutorDialogUiV5Css')){
  const link=document.createElement('link');
  link.id='tutorDialogUiV5Css';
  link.rel='stylesheet';
  link.href='./tutor-dialog-ui-v5.css?wb=20260817-2';
  document.head.appendChild(link);
 }
 if(document.getElementById('tutorDialogUiV5'))return;
 const script=document.createElement('script');
 script.id='tutorDialogUiV5';
 script.src='./tutor-dialog-ui-v5.js?wb=20260817-2';
 script.defer=true;
 document.head.appendChild(script);
})();
