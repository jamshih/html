// Page 244 refinement: remove handwritten answer leakage and keep only source-ended, meaningful branches.
(function(){
  window.SOURCE_LINE_MANIFEST_V7=window.SOURCE_LINE_MANIFEST_V7||{};
  window.SOURCE_LINE_MANIFEST_V7[244]=[
    {id:'p244-color-factor-composition',from:'天體／恆星顏色',to:'表面成分',type:'component',visible:true,source:true,reason:'來源頁以紫色支線表示天體顏色會受表面成分影響。'},
    {id:'p244-color-factor-temperature',from:'恆星顏色',to:'溫度',type:'cause',visible:true,source:true,reason:'來源頁以紫色支線表示恆星顏色主要受表面溫度影響。'},
    {id:'p244-color-hub',from:'顏色影響因素',to:'星色',type:'source-layout-only',visible:true,source:true,reason:'來源頁把顏色影響因素收進紫色星色教學主題。'},
    {id:'p244-color-to-observation',from:'星色',to:'觀星與恆星',type:'source-layout-only',visible:true,source:true,reason:'來源頁紫色主幹由星色向下銜接觀星教學區。'},
    {id:'p244-brightness-luminosity',from:'亮度',to:'光度',type:'cause',visible:true,source:true,reason:'來源頁表示恆星觀測亮度受本身光度影響。'},
    {id:'p244-brightness-distance',from:'亮度',to:'距離',type:'cause',visible:true,source:true,reason:'來源頁表示恆星觀測亮度同時受距離影響。'},
    {id:'p244-brightness-magnitude',from:'亮度比較',to:'星等',type:'method',visible:true,source:true,reason:'星等是來源頁用來表示與比較亮度的量尺。'},
    {id:'p244-sky-distance',from:'觀星與恆星',to:'天體距離',type:'source-layout-only',visible:true,source:true,reason:'來源頁以藍色短箭頭銜接觀星投影區與下方距離單位教學區。'}
  ];
  const LINES=`<svg class="v4strict-svg v6-p244-lines v7-p244-lines" data-v7-line-manifest="244" viewBox="0 0 910 1270" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="v7p244purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#7465a4"/></marker><marker id="v7p244orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#d8813a"/></marker><marker id="v7p244blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#6d86b3"/></marker></defs><g fill="none" stroke="#7465a4" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M288 310V344"/><path d="M300 394L240 485L188 552"/><path d="M164 552L105 485M164 552L235 480"/><path d="M164 770V602" marker-end="url(#v7p244purple)"/></g><g fill="none" stroke="#d8813a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M335 570V515L318 493M335 515L420 452"/><path d="M370 585L488 560"/><path d="M610 558L682 548M610 565L688 595M605 572L690 642"/><path d="M255 730L323 610" marker-end="url(#v7p244orange)"/><path d="M620 458L655 470"/></g><path d="M382 765H515" fill="none" stroke="#6d86b3" stroke-width="5" stroke-linecap="round" marker-end="url(#v7p244blue)"/></svg>`;
  const prev=window.v5PageHtml;if(typeof prev!=='function')return;
  window.v5PageHtml=function(ch,sem,page,mode){
    let html=prev(ch,sem,page,mode);if(page!==244)return html;
    html=html.replace(/<text x="118" y="67"[^>]*>藍<\/text>/,'').replace(/<text x="169" y="67"[^>]*>白<\/text>/,'').replace(/<text x="220" y="67"[^>]*>黃<\/text>/,'').replace(/<text x="271" y="67"[^>]*>橘<\/text>/,'').replace(/<text x="322" y="67"[^>]*>紅<\/text>/,'').replace('class="v6-p244-starcolor"','class="v6-p244-starcolor" data-v7-answer-leak-scrubbed="true"');
    const t=document.createElement('template');t.innerHTML=html;const old=t.content.querySelector('.v6-p244-lines');if(old){const x=document.createElement('template');x.innerHTML=LINES;old.replaceWith(x.content.firstElementChild)}return t.innerHTML;
  };
  if(typeof window.render==='function')window.render();
})();
