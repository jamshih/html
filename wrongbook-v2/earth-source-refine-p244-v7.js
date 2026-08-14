// Page 244 refinement: keep v6 source geometry, remove handwritten answer leakage, and validate visible source branches.
(function(){
  window.SOURCE_LINE_MANIFEST_V7=window.SOURCE_LINE_MANIFEST_V7||{};
  window.SOURCE_LINE_MANIFEST_V7[244]=[
    {id:'p244-color-factor-composition',from:'天體／恆星顏色',to:'表面成分',type:'component',visible:true,source:true,reason:'來源頁以紫色支線表示天體顏色會受表面成分影響。'},
    {id:'p244-color-factor-temperature',from:'恆星顏色',to:'溫度',type:'cause',visible:true,source:true,reason:'來源頁以紫色支線表示恆星顏色主要受表面溫度影響。'},
    {id:'p244-color-hub',from:'顏色影響因素',to:'星色',type:'source-layout-only',visible:true,source:true,reason:'來源頁把兩個顏色影響因素匯入紫色星色主題，整理同一教學區塊。'},
    {id:'p244-color-to-observation',from:'星色',to:'觀星與恆星',type:'source-layout-only',visible:true,source:true,reason:'來源頁的紫色主幹由星色向下銜接到觀星教學區，不代表額外因果。'},
    {id:'p244-brightness-luminosity',from:'亮度',to:'光度',type:'cause',visible:true,source:true,reason:'來源頁表示恆星觀測亮度受本身光度影響。'},
    {id:'p244-brightness-distance',from:'亮度',to:'距離',type:'cause',visible:true,source:true,reason:'來源頁表示恆星觀測亮度同時受距離影響。'},
    {id:'p244-brightness-magnitude',from:'亮度比較',to:'星等',type:'method',visible:true,source:true,reason:'星等是來源頁用來表示與比較亮度的量尺。'},
    {id:'p244-sky-distance',from:'觀星與恆星',to:'天體距離',type:'source-layout-only',visible:true,source:true,reason:'來源頁以藍色短箭頭銜接觀星投影區與下方距離單位教學區。'}
  ];
  const prev=window.v5PageHtml;
  if(typeof prev!=='function')return;
  window.v5PageHtml=function(ch,sem,page,mode){
    let html=prev(ch,sem,page,mode);
    if(page!==244)return html;
    // The five-colour sequence was handwritten into numbered blank (3), not publisher-printed source art.
    html=html
      .replace(/<text x="118" y="67"[^>]*>藍<\/text>/,'')
      .replace(/<text x="169" y="67"[^>]*>白<\/text>/,'')
      .replace(/<text x="220" y="67"[^>]*>黃<\/text>/,'')
      .replace(/<text x="271" y="67"[^>]*>橘<\/text>/,'')
      .replace(/<text x="322" y="67"[^>]*>紅<\/text>/,'')
      .replace('class="v6-p244-lines"','class="v6-p244-lines" data-v7-line-manifest="244"')
      .replace('class="v6-p244-starcolor"','class="v6-p244-starcolor" data-v7-answer-leak-scrubbed="true"');
    return html;
  };
  if(typeof window.render==='function')window.render();
})();
