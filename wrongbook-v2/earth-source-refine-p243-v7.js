// Page 243 refinement: preserve v6 geometry, remove student-answer leakage, and document every visible source relationship.
(function(){
  window.SOURCE_LINE_MANIFEST_V7=window.SOURCE_LINE_MANIFEST_V7||{};
  window.SOURCE_LINE_MANIFEST_V7[243]=[
    {id:'p243-age-root-absolute',from:'地質年代',to:'絕對地質年代',type:'classification',visible:true,source:true,reason:'絕對地質年代是建立地質年代的主要分類之一。'},
    {id:'p243-age-root-relative',from:'地質年代',to:'相對地質年代',type:'classification',visible:true,source:true,reason:'相對地質年代是建立地質年代的主要分類之一。'},
    {id:'p243-absolute-radiometric',from:'絕對地質年代',to:'放射性元素定年法',type:'method',visible:true,source:true,reason:'放射性元素定年法用來求得岩礦形成的絕對年代。'},
    {id:'p243-radiometric-details',from:'放射性元素定年法',to:'岩礦形成時間／適用岩類／半衰期與衰變圖',type:'method',visible:true,source:true,reason:'岩礦形成時間、適用岩類與半衰期圖都是放射性定年法的判讀內容。'},
    {id:'p243-relative-laws',from:'相對地質年代',to:'疊置定律／截切定律／包裹體定律',type:'method',visible:true,source:true,reason:'三個定律是判斷岩層與地質事件相對先後的主要方法。'},
    {id:'p243-era-paleozoic',from:'古生代',to:'中生代',type:'chronology',visible:true,source:true,reason:'年代長軸依時間順序由古生代進入中生代。'},
    {id:'p243-era-mesozoic',from:'中生代',to:'新生代',type:'chronology',visible:true,source:true,reason:'年代長軸依時間順序由中生代進入新生代。'},
    {id:'p243-era-present',from:'新生代',to:'現今',type:'chronology',visible:true,source:true,reason:'年代長軸由新生代延伸至現今。'},
    {id:'p243-atmosphere-cooling',from:'第二階段大氣',to:'冷卻凝結',type:'cause',visible:true,source:true,reason:'地表冷卻使水氣凝結並進一步形成海洋。'},
    {id:'p243-cooling-ocean',from:'冷卻凝結',to:'海洋形成',type:'cause',visible:true,source:true,reason:'水氣冷卻凝結後累積形成早期海洋。'},
    {id:'p243-ocean-photosynthesis',from:'海洋形成',to:'光合作用',type:'chronology',visible:true,source:true,reason:'海洋形成後，海中生命發展出光合作用。'},
    {id:'p243-photosynthesis-oxygen',from:'光合作用',to:'氧氣增加',type:'cause',visible:true,source:true,reason:'光合作用釋放氧氣，使大氣中的氧氣逐漸增加。'},
    {id:'p243-oxygen-ozone',from:'氧氣增加',to:'臭氧形成',type:'cause',visible:true,source:true,reason:'氧氣增加後可形成臭氧，降低高能紫外線對地表生命的影響。'},
    {id:'p243-oxygen-third-atmosphere',from:'氧氣增加',to:'第三階段大氣（現今）',type:'cause',visible:true,source:true,reason:'氧氣累積是現今第三階段大氣組成形成的重要過程。'}
  ];
  const prev=window.v5PageHtml;
  if(typeof prev!=='function')return;
  window.v5PageHtml=function(ch,sem,page,mode){
    let html=prev(ch,sem,page,mode);
    if(page!==243)return html;
    // These three values are student answers in the photograph. The numbered blank overlays already occupy the source locations.
    html=html
      .replace('<text x="25" y="34">100</text>','')
      .replace('<text x="270" y="60">母元素</text>','')
      .replace('<text x="270" y="126">子元素</text>','')
      .replace('class="v6-p243-lines"','class="v6-p243-lines" data-v7-line-manifest="243"')
      .replace('class="v6-p243-decay"','class="v6-p243-decay" data-v7-answer-leak-scrubbed="true"');
    return html;
  };
  if(typeof window.render==='function')window.render();
})();
