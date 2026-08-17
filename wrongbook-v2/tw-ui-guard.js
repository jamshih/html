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

// Load the tutor vision bridge early; the bridge waits for the tutor runtime and
// then wraps the final functions, so it is safe even though this file loads first.
(function(){
 if(document.getElementById('tutorVisionAccuracyV5'))return;
 const script=document.createElement('script');
 script.id='tutorVisionAccuracyV5';
 script.src='./tutor-vision-accuracy-v5.js?build=20260817-2';
 script.async=true;
 document.head.appendChild(script);
})();
