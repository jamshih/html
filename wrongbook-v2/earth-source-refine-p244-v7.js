// Page 244 relationship metadata. The v8 source-owned renderer owns all visible geometry.
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
  {id:'p244-sky-distance',from:'觀星與恆星',to:'天體距離',type:'source-layout-only',visible:true,source:true,reason:'來源頁以線路銜接觀星投影區與下方距離單位教學區。'}
 ];
 const prev=window.v5PageHtml;if(typeof prev!=='function')return;
 window.v5PageHtml=function(ch,sem,page,mode){
  const html=prev(ch,sem,page,mode);if(page!==244)return html;
  const t=document.createElement('template');t.innerHTML=html;
  if(t.content.querySelector('[data-source-owned-page="244"]'))return t.innerHTML;
  const star=t.content.querySelector('.v6-p244-starcolor');if(star){for(const word of ['藍','白','黃','橘','紅'])for(const x of [...star.querySelectorAll('text')])if(x.textContent.trim()===word)x.remove();star.dataset.v7AnswerLeakScrubbed='true';}
  return t.innerHTML;
 };
 if(typeof window.render==='function')window.render();
})();
