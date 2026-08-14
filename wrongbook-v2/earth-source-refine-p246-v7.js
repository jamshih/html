// Page 246 refinement: source-faithful daily-motion mini diagram and explicit source-line meaning.
(function(){
  window.SOURCE_LINE_MANIFEST_V7=window.SOURCE_LINE_MANIFEST_V7||{};
  window.SOURCE_LINE_MANIFEST_V7[246]=[
    {id:'p246-rotation-daily',from:'地球自轉',to:'周日運動',type:'cause',visible:true,source:true,reason:'地球自轉造成星體在天球上的周日視運動。'},
    {id:'p246-revolution-annual',from:'地球繞日公轉',to:'周年運動',type:'cause',visible:true,source:true,reason:'地球繞日公轉造成太陽與恆星在一年中的周年視位置變化。'},
    {id:'p246-annual-zodiac',from:'周年運動',to:'黃道與黃道星座',type:'cause',visible:true,source:true,reason:'太陽周年視運動沿黃道進行，因此會依序經過黃道星座。'},
    {id:'p246-zodiac-orbit',from:'黃道與黃道星座',to:'地球公轉軌道圖',type:'source-layout-only',visible:true,source:true,reason:'來源頁用綠色短支線把黃道概念接到公轉軌道與星座帶的教學圖。'},
    {id:'p246-zodiac-season-left',from:'黃道／公轉圖',to:'季節觀測資訊（左）',type:'source-layout-only',visible:true,source:true,reason:'來源頁的綠色支線把公轉圖連到相鄰季節觀測空格。'},
    {id:'p246-zodiac-season-right',from:'黃道／公轉圖',to:'季節觀測資訊（右）',type:'source-layout-only',visible:true,source:true,reason:'來源頁的綠色支線把公轉圖連到相鄰季節觀測空格。'}
  ];
  const DAILY=`<svg class="v6-p246-daily" data-v7-source-figure="daily-motion" viewBox="0 0 330 190" preserveAspectRatio="xMidYMid meet" aria-label="周日運動示意"><defs><marker id="v7p246dailyarr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#d88b3e"/></marker></defs><rect x="1" y="1" width="328" height="188" fill="#dce0df" opacity=".72"/><text x="8" y="18" font-size="13" fill="#4a4945">朝北看</text><text x="12" y="167" font-size="14" fill="#4a4945">西</text><text x="304" y="167" font-size="14" fill="#4a4945">東</text><circle cx="164" cy="128" r="4.7" fill="#5e7496"/><path d="M164 128L144 50M164 128L194 55" stroke="#666" stroke-width="1.6" fill="none"/><path d="M144 50A87 87 0 0 1 194 55" fill="none" stroke="#d88b3e" stroke-width="2.5"/><text x="82" y="111" font-size="12" fill="#555">北極星在</text><path d="M134 108H190" stroke="#555" stroke-width="1.2"/><text x="92" y="127" font-size="12" fill="#555">天球北極附近</text><g transform="translate(235 105)"><path d="M0-8L3-2L10-1L5 4L7 11L0 7L-7 11L-5 4L-10-1L-3-2Z" fill="#e4ad35" stroke="#a77527" stroke-width="1"/><path data-v7-apparent-motion="true" d="M-30 34C-4 27 16 13 31-13" fill="none" stroke="#d88b3e" stroke-width="3" marker-end="url(#v7p246dailyarr)"/></g></svg>`;
  const prev=window.v5PageHtml;
  if(typeof prev!=='function')return;
  window.v5PageHtml=function(ch,sem,page,mode){
    let html=prev(ch,sem,page,mode);
    if(page!==246)return html;
    const t=document.createElement('template');t.innerHTML=html;
    const old=t.content.querySelector('.v6-p246-daily');
    if(old){const d=document.createElement('template');d.innerHTML=DAILY;old.replaceWith(d.content.firstElementChild)}
    const lines=t.content.querySelector('.v6-p246-lines');if(lines)lines.dataset.v7LineManifest='246';
    return t.innerHTML;
  };
  if(typeof window.render==='function')window.render();
})();
