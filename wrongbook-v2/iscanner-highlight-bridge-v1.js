// Polish the existing question-target selector into an iScanner-style highlighter step and remove the extra post-selection click.
(function(){
  const VERSION='2026-08-18-iscanner-highlight-bridge-v1';
  if(window.__wrongbookIScannerHighlightBridge===VERSION)return;
  window.__wrongbookIScannerHighlightBridge=VERSION;
  const style=document.createElement('style');
  style.textContent=`
  #nqcTargetSelector.isc-native-highlight{background:#0c0e0d;color:#fff;padding:0;z-index:9100}
  #nqcTargetSelector.isc-native-highlight .nqc-target-shell{width:min(980px,100%);height:100dvh;max-height:none;border-radius:0;background:#0c0e0d;color:#fff;display:flex;flex-direction:column}
  #nqcTargetSelector.isc-native-highlight .nqc-target-head{padding:14px 18px 10px;border-bottom:0;background:#0c0e0d}
  #nqcTargetSelector.isc-native-highlight .nqc-target-head h2{font-size:17px;color:#fff}
  #nqcTargetSelector.isc-native-highlight .nqc-target-head p{color:rgba(255,255,255,.68);font-size:13px}
  #nqcTargetSelector.isc-native-highlight .nqc-target-head .icon-btn{color:#fff;background:rgba(255,255,255,.08)}
  #nqcTargetSelector.isc-native-highlight .nqc-target-stage{flex:1;min-height:0;margin:0 12px;border-radius:16px;background:#171918;overflow:hidden}
  #nqcTargetSelector.isc-native-highlight #nqcTargetImage{object-fit:contain;background:#171918}
  #nqcTargetSelector.isc-native-highlight #nqcTargetCanvas{filter:hue-rotate(150deg) saturate(1.25);mix-blend-mode:multiply}
  #nqcTargetSelector.isc-native-highlight .nqc-target-tip{background:rgba(20,20,20,.72);color:#fff;border:0;backdrop-filter:blur(8px);font-weight:800}
  #nqcTargetSelector.isc-native-highlight .nqc-target-actions{padding:12px 16px calc(14px + env(safe-area-inset-bottom));background:#0c0e0d;border-top:0}
  #nqcTargetSelector.isc-native-highlight .nqc-target-tools .soft-btn,#nqcTargetSelector.isc-native-highlight .nqc-target-tools .text-btn{color:#fff;border-color:rgba(255,255,255,.2);background:rgba(255,255,255,.08)}
  #nqcTargetSelector.isc-native-highlight [data-nqc-use]{background:#fff;color:#111;border:0;min-height:50px}
  @media(max-width:680px){#nqcTargetSelector.isc-native-highlight .nqc-target-stage{margin:0;border-radius:0}#nqcTargetSelector.isc-native-highlight .nqc-target-actions{display:grid;gap:10px}#nqcTargetSelector.isc-native-highlight [data-nqc-use]{width:100%}}
  `;
  document.head.appendChild(style);

  let hadSelector=false,autoAnalyzeTimer=null;
  function polish(sel){
    if(!sel||sel.classList.contains('isc-native-highlight'))return;
    sel.classList.add('isc-native-highlight');
    const h=sel.querySelector('.nqc-target-head h2'),p=sel.querySelector('.nqc-target-head p'),tip=sel.querySelector('.nqc-target-tip'),use=sel.querySelector('[data-nqc-use]');
    if(h)h.textContent='用螢光筆標出你要辨識的題目';
    if(p)p.textContent='像 iScanner 一樣直接塗過題號、題幹、題圖和你的作答；沒有塗到的內容不送去 OCR。';
    if(tip)tip.textContent='半透明螢光筆 · 可畫多行';
    if(use)use.textContent='辨識螢光筆範圍';
    hadSelector=true;
  }
  function maybeAutoAnalyze(){
    if(!hadSelector||document.getElementById('nqcTargetSelector')||!window.state?.scanSelection?.confirmed)return;
    hadSelector=false;clearTimeout(autoAnalyzeTimer);autoAnalyzeTimer=setTimeout(()=>{
      const btn=document.querySelector('#captureModal [data-action="analyzePhoto"]');
      if(btn&&!btn.disabled){btn.textContent='正在 OCR…';btn.click()}
    },120);
  }
  const obs=new MutationObserver(()=>{polish(document.getElementById('nqcTargetSelector'));maybeAutoAnalyze()});
  obs.observe(document.documentElement,{childList:true,subtree:true});
  polish(document.getElementById('nqcTargetSelector'));
  window.wrongbookIScannerHighlighterQA=()=>({version:VERSION,highlighterStep:true,semiTransparent:true,iscannerLikeFullscreen:true,unhighlightedContentExcluded:true,autoOCRAfterSelection:true});
})();
