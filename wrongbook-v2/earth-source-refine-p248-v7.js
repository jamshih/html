// Page 248 refinement: four source teaching blocks remain separate; remove handwritten answers baked into figures.
(function(){
  window.SOURCE_LINE_MANIFEST_V7=window.SOURCE_LINE_MANIFEST_V7||{};
  window.SOURCE_LINE_MANIFEST_V7[248]=[]; // The photograph uses four independent blocks; there are no cross-block source connectors.
  const LEAKS=['大陸地殼','海洋地殼','地函','莫荷不連續面','橄欖岩','固態','外核','Fe、Ni','液態','古氏','雷曼','內核'];
  const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const prev=window.v5PageHtml;
  if(typeof prev!=='function')return;
  window.v5PageHtml=function(ch,sem,page,mode){
    let html=prev(ch,sem,page,mode);
    if(page!==248)return html;
    for(const word of LEAKS){
      const re=new RegExp(`<text([^>]*)>${esc(word)}<\\/text>`,'g');
      html=html.replace(re,'');
    }
    html=html
      .replace('class="v6-p248-crust"','class="v6-p248-crust" data-v7-answer-leak-scrubbed="true"')
      .replace('class="v6-p248-deep"','class="v6-p248-deep" data-v7-answer-leak-scrubbed="true"');
    return html;
  };
  if(typeof window.render==='function')window.render();
})();
