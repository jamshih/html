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
  const LINES=`<svg class="v4strict-svg v6-p244-lines v7-p244-lines" data-v7-line-manifest="244" viewBox="0 0 910 1270" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="v7p244purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#7465a4"/></marker><marker id="v7p244orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#d8813a"/></marker><marker id="v7p244blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#6d86b3"/></marker></defs><g fill="none" stroke="#7465a4" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M398 375V414"/><path d="M399 438L350 488L288 570"/><path d="M288 570L215 494M288 570L348 488"/><path d="M288 630V790" marker-end="url(#v7p244purple)"/></g><g fill="none" stroke="#d8813a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M431 613V540L445 492"/><path d="M431 540L522 535"/><path d="M472 628L505 628"/><path d="M472 636L675 618M472 648L676 660M472 659L676 704"/><path d="M412 666L377 742" marker-end="url(#v7p244orange)"/><path d="M566 486L628 498"/></g><path d="M438 808H525" fill="none" stroke="#6d86b3" stroke-width="7" stroke-linecap="round" marker-end="url(#v7p244blue)"/></svg>`;
  const prev=window.v5PageHtml;if(typeof prev!=='function')return;
  window.v5PageHtml=function(ch,sem,page,mode){
    let html=prev(ch,sem,page,mode);if(page!==244)return html;
    // The color order is an answer; keep the printed high→low scaffold but never bake handwriting/answers into the figure.
    html=html.replace(/<text x="118" y="67"[^>]*>藍<\/text>/,'').replace(/<text x="169" y="67"[^>]*>白<\/text>/,'').replace(/<text x="220" y="67"[^>]*>黃<\/text>/,'').replace(/<text x="271" y="67"[^>]*>橘<\/text>/,'').replace(/<text x="322" y="67"[^>]*>紅<\/text>/,'').replace('class="v6-p244-starcolor"','class="v6-p244-starcolor" data-v7-answer-leak-scrubbed="true"');
    const t=document.createElement('template');t.innerHTML=html;const old=t.content.querySelector('.v6-p244-lines');if(old){const x=document.createElement('template');x.innerHTML=LINES;old.replaceWith(x.content.firstElementChild)}return t.innerHTML;
  };
  if(typeof window.render==='function')window.render();
})();
