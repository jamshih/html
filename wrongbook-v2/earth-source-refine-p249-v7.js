// Page 249 refinement: q27 belongs on the Taiwan map; remove handwritten arc/trench names from static SVG.
(function(){
  window.SOURCE_LINE_MANIFEST_V7=window.SOURCE_LINE_MANIFEST_V7||{};
  window.SOURCE_LINE_MANIFEST_V7[249]=[]; // Visible geometry here is contained within teaching figures; no semantic cross-block connector is rendered.
  const prev=window.v5PageHtml;
  if(typeof prev!=='function')return;
  window.v5PageHtml=function(ch,sem,page,mode){
    let html=prev(ch,sem,page,mode);
    if(page!==249)return html;
    // q27 answers in photo: 琉球島弧、琉球海溝、馬尼拉海溝、呂宋島弧. They are handwriting in four map blanks.
    for(const word of ['琉球島弧','琉球海溝','馬尼拉海溝','呂宋島弧']){
      html=html.replace(new RegExp(`<text([^>]*)>${word}<\\/text>`,'g'),'');
    }
    // Remove the v6 normalized list prompt; replace it with one q27 source container carrying four blank anchors over the printed map lines.
    html=html.replace(/<div class="v6-p249-q v5-recall [^"]*" data-question="27"[\s\S]*?<\/div>/,'');
    const field=(i,w)=>typeof window.v4StrictField==='function'?window.v4StrictField(ch,27,i,mode,w):'';
    const anchors=`<div class="v7-p249-q27 v5-recall" data-question="27" data-page="249" aria-label="第27題：請在島弧與海溝處寫上名稱" style="position:absolute;left:430px;top:900px;width:390px;height:310px;z-index:6;pointer-events:none"><span style="position:absolute;left:274px;top:61px;pointer-events:auto">${field(0,82)}</span><span style="position:absolute;left:274px;top:111px;pointer-events:auto">${field(1,82)}</span><span style="position:absolute;left:22px;top:244px;pointer-events:auto">${field(2,88)}</span><span style="position:absolute;left:177px;top:275px;pointer-events:auto">${field(3,82)}</span></div>`;
    html=html.replace('<img class="v5qa-source-photo"',anchors+'<img class="v5qa-source-photo"');
    html=html.replace('class="v6-p249-taiwan"','class="v6-p249-taiwan" data-v7-answer-leak-scrubbed="true"');
    return html;
  };
  if(typeof window.render==='function')window.render();
})();
