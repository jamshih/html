// Page 253 refinement: one source illustration per concept and no student-answer text baked into climate art.
(function(){
  window.SOURCE_LINE_MANIFEST_V7=window.SOURCE_LINE_MANIFEST_V7||{};
  window.SOURCE_LINE_MANIFEST_V7[253]=[
    {id:'p253-climate-greenhouse',from:'氣候變遷',to:'溫室氣體／溫室效應',type:'cause',visible:true,source:true,reason:'來源頁橘色支線把溫室氣體吸收地表長波與溫室效應放在氣候變遷脈絡內。'},
    {id:'p253-climate-energy',from:'氣候變遷',to:'太陽入射／反照率／地表吸收',type:'component',visible:true,source:true,reason:'來源頁以橘色能量支線整理影響地球氣候的太陽入射與能量收支。'},
    {id:'p253-ocean-current',from:'海水運動',to:'海流',type:'component',visible:true,source:true,reason:'海流是來源頁列出的三大海水運動之一。'},
    {id:'p253-ocean-wave',from:'海水運動',to:'波浪',type:'component',visible:true,source:true,reason:'波浪是來源頁列出的三大海水運動之一。'},
    {id:'p253-ocean-tide',from:'海水運動',to:'潮汐',type:'component',visible:true,source:true,reason:'潮汐是來源頁列出的三大海水運動之一。'},
    {id:'p253-current-wind',from:'海流',to:'信風與西風／季風',type:'cause',visible:true,source:true,reason:'來源頁以綠色分支表示大範圍固定風與季風驅動表層海流。'},
    {id:'p253-wave-nearshore',from:'波浪',to:'近岸波浪變形',type:'cause',visible:true,source:true,reason:'來源頁的兩階段波浪括線表示水深變淺後波速、波長與方向改變。'},
    {id:'p253-tide-types',from:'潮汐',to:'半日潮／大潮／小潮',type:'classification',visible:true,source:true,reason:'來源頁以綠色括線將潮汐現象分成半日潮以及大、小潮條件。'}
  ];
  const prev=window.v5PageHtml;
  if(typeof prev!=='function')return;
  window.v5PageHtml=function(ch,sem,page,mode){
    let html=prev(ch,sem,page,mode);
    if(page!==253)return html;
    // v6-correct already supplies the source-position greenhouse connector/figure; remove the hidden duplicate base greenhouse SVG from DOM.
    html=html.replace(/<svg class="v6-p253-greenhouse"[\s\S]*?<\/svg>/,'');
    // Keep one brown climate strip only: the base plate strip. Remove the duplicate filled strip from the correction overlay.
    html=html.replace(/<path d="M72 350Q180 332 295 341Q470 359 625 337Q725 325 820 338V407H72Z" fill="#b99b78"\/>/,'');
    // q36 begins with a numbered blank in the source, so '板塊' must not be permanently printed inside the strip.
    html=html.replace(/<text x="195" y="24"[^>]*>板塊運動會改變陸塊分布與地形，進而影響反照率、岩石風化速率、<\/text>/,'').replace(/<text x="233" y="45"[^>]*>溫室氣體含量、海氣環流，也是長期氣候的重要影響因素。<\/text>/,'');
    // q35 supplies the comparison answer; do not bake '高' or a derived feedback sentence into energy art.
    html=html.replace(/<text x="315" y="150"[^>]*>冰雪反照率高<\/text>/,'').replace(/<text x="305" y="169"[^>]*>冰雪減少 → 反照率下降<\/text>/,'');
    html=html.replace('class="v6-p253-correct"','class="v6-p253-correct" data-v7-line-manifest="253"').replace('class="v6-p253-plate"','class="v6-p253-plate" data-v7-answer-leak-scrubbed="true"');
    return html;
  };
  if(typeof window.render==='function')window.render();
})();
