// Page 250 refinement: atmospheric layer names/explanations are numbered answers, not permanent figure text.
(function(){
  window.SOURCE_LINE_MANIFEST_V7=window.SOURCE_LINE_MANIFEST_V7||{};
  window.SOURCE_LINE_MANIFEST_V7[250]=[
    {id:'p250-protection-to-atmosphere',from:'地球保護層',to:'大氣分層',type:'classification',visible:true,source:true,reason:'來源頁由地球保護作用銜接到依溫度變化分層的大氣結構。'},
    {id:'p250-saturation-methods',from:'未飽和空氣',to:'達飽和的兩個方法',type:'method',visible:true,source:true,reason:'來源頁把甲、乙列為使未飽和空氣達飽和的兩種方法。'},
    {id:'p250-humidity-rh',from:'水氣壓／露點',to:'相對溼度',type:'method',visible:true,source:true,reason:'來源頁利用實際水氣壓、飽和水氣壓與露點關係判讀相對溼度。'},
    {id:'p250-rh-measure',from:'相對溼度',to:'乾溼球溫度計',type:'method',visible:true,source:true,reason:'乾、溼球溫差是來源頁判讀相對溼度的方法。'}
  ];
  const REMOVE=['包含磁層／上層保護','增溫層','中氣層','平流層','對流層','帶電粒子、高緯極光','流星主要在此燒蝕','臭氧層、吸收紫外線','地表長波加熱、天氣'];
  const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const prev=window.v5PageHtml;
  if(typeof prev!=='function')return;
  window.v5PageHtml=function(ch,sem,page,mode){
    let html=prev(ch,sem,page,mode);
    if(page!==250)return html;
    for(const word of REMOVE){html=html.replace(new RegExp(`<text([^>]*)>${esc(word)}<\\/text>`,'g'),'');}
    html=html.replace('class="v6-p250-atm"','class="v6-p250-atm" data-v7-answer-leak-scrubbed="true"').replace('class="v6-p250-branches"','class="v6-p250-branches" data-v7-line-manifest="250"');
    return html;
  };
  if(typeof window.render==='function')window.render();
})();
