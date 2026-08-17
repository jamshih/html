/* Add the eclipse-direction concept requested for Earth mind map page 2.
   This patch mutates the V11 page model so progress/answers use the same state system,
   then replaces only this section's generic visual with a dedicated comparison diagram. */
(function(){
  const api=window.EARTH_REFERENCE_MINDMAP_V11;
  if(!api?.pages?.length)return;

  const page=api.pages.find(p=>p.id==='earth-ref-2');
  if(!page)return;

  if(!page.sections.some(s=>s.id==='eclipse-direction')){
    page.sections.push({
      id:'eclipse-direction',
      title:'日蝕與月蝕：開始缺角方向',
      visual:'eclipse-direction',
      questions:[
        ['ec1','月球繞地球公轉的方向為由 {0} 向 {1}。',['西','東'],'先抓唯一的根本原因：月球自西向東公轉。'],
        ['ec2','日蝕開始時，太陽的 {0} 方，也就是畫面的右側，會先開始缺角。',['西'],'記成「日蝕：西、右」。'],
        ['ec3','月蝕開始時，月球的 {0} 方，也就是畫面的左側，會先開始缺角。',['東'],'記成「月蝕：東、左」。'],
        ['ec4','日蝕與月蝕的開始方向雖然相反，但都可以回到月球自西向東的 {0} 來理解。',['公轉'],'不要分開死背兩套原因。'],
        ['ec5','快速口訣：日蝕「{0}右」，月蝕「{1}左」。',['西','東'],'把方位和畫面側邊綁在一起。']
      ]
    });
  }

  const svg=`<svg viewBox="0 0 620 300" class="er-svg er-eclipse-svg" role="img" aria-label="日蝕與月蝕開始缺角方向比較圖">
    <defs>
      <marker id="ecArrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L10,3 L0,6 Z" fill="currentColor"/></marker>
      <radialGradient id="ecSun"><stop offset="0" stop-color="#fff7a7"/><stop offset=".52" stop-color="#ffc84a"/><stop offset="1" stop-color="#ef8c1f"/></radialGradient>
      <linearGradient id="ecShade"><stop offset="0" stop-color="#243244" stop-opacity=".96"/><stop offset="1" stop-color="#111927" stop-opacity=".72"/></linearGradient>
    </defs>
    <g transform="translate(0 8)">
      <rect x="12" y="18" width="286" height="236" rx="22" fill="#fffaf0" stroke="currentColor" stroke-opacity=".28"/>
      <text x="155" y="50" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor">日蝕</text>
      <circle cx="150" cy="142" r="64" fill="url(#ecSun)"/>
      <circle cx="207" cy="142" r="58" fill="#172232"/>
      <path d="M252 90 C228 98 212 112 200 130" fill="none" stroke="currentColor" stroke-width="5" marker-end="url(#ecArrow)"/>
      <text x="155" y="225" text-anchor="middle" font-size="15" font-weight="700" fill="#5b554c">右側先出現缺角</text>
    </g>
    <g transform="translate(310 8)">
      <rect x="12" y="18" width="286" height="236" rx="22" fill="#f8fbff" stroke="currentColor" stroke-opacity=".28"/>
      <text x="155" y="50" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor">月蝕</text>
      <circle cx="165" cy="142" r="64" fill="#e8e1c9" stroke="#b7aa8e" stroke-width="3"/>
      <path d="M98 82 C126 95 143 115 150 137 C143 159 126 181 98 195 C77 168 71 110 98 82Z" fill="url(#ecShade)"/>
      <path d="M70 90 C94 98 111 113 123 130" fill="none" stroke="currentColor" stroke-width="5" marker-end="url(#ecArrow)"/>
      <text x="155" y="225" text-anchor="middle" font-size="15" font-weight="700" fill="#5b554c">左側先出現缺角</text>
    </g>
    <g transform="translate(185 270)">
      <path d="M0 0 H250" stroke="currentColor" stroke-width="4" marker-end="url(#ecArrow)"/>
      <text x="125" y="-10" text-anchor="middle" font-size="14" font-weight="800" fill="currentColor">同一個根本原因：月球公轉方向</text>
    </g>
  </svg>`;

  const current=mindmapPage;
  mindmapPage=function(){
    const html=current();
    try{
      if(activeSubject?.()?.id!=='earth')return html;
      if(!html.includes('data-er-section="eclipse-direction"'))return html;
      return html.replace(/(<section class="er-section" data-er-section="eclipse-direction">[\s\S]*?<div class="er-visual">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/section>)/,`$1${svg}$2`);
    }catch{return html;}
  };

  window.EARTH_ECLIPSE_DIRECTION_V11=true;
})();
