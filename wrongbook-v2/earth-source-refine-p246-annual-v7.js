// Page 246 annual-motion refinement: remove handwritten answers and place q10/q11/q12 in the three printed vertical bands.
(function(){
 if(!document.getElementById('v7-p246-annual-layout')){
   const s=document.createElement('style');s.id='v7-p246-annual-layout';s.textContent=`
   .v6-p246-q[data-question="9"]{left:510px!important;top:808px!important;width:112px!important}
   .v6-p246-q[data-question="8"]{left:510px!important;top:850px!important;width:112px!important}
   .v7-p246-annual{left:625px!important;top:725px!important;width:240px!important;height:372px!important;min-height:372px!important;padding:0!important;font-size:12px!important;line-height:1.22!important;position:absolute!important;overflow:visible!important}
   .v7-p246-annual .row{position:absolute!important;left:10px!important;margin:0!important;padding-left:10px!important;height:20px!important;line-height:20px!important}
   .v7-p246-annual .row-ab{top:10px!important}.v7-p246-annual .row-ac{top:112px!important}.v7-p246-annual .row-star{top:250px!important}
   .v7-p246-annual-q{position:absolute!important;left:14px!important;width:205px!important;margin:0!important;line-height:1.24!important}
   .v7-p246-annual-q[data-question="10"]{top:38px!important;height:67px!important}
   .v7-p246-annual-q[data-question="11"]{top:140px!important;height:102px!important}
   .v7-p246-annual-q[data-question="12"]{top:278px!important;height:82px!important}
   .v7-p246-annual-q .v4strict-fill{height:17px!important;vertical-align:middle!important;margin:0 2px!important}
   `;document.head.appendChild(s);
 }
 const prev=window.v5PageHtml;if(typeof prev!=='function')return;
 window.v5PageHtml=function(ch,sem,page,mode){
   let html=prev(ch,sem,page,mode);if(page!==246)return html;
   const f=(n,i,w)=>typeof window.v4StrictField==='function'?window.v4StrictField(ch,n,i,mode,w):'';
   const annual=`<div class="v6-p246-annual v7-p246-annual" data-v7-answer-leak-scrubbed="true"><b>周年運動</b><div class="row row-ab"><i></i><span>a → b</span></div><div class="v7-p246-annual-q v5-recall" data-question="10" data-page="246">${window.v4StrictN?window.v4StrictN(10):'(10)'} ${f(10,0,58)} 日<br>＝地球自轉 ${f(10,1,44)} 度<br>＝遙遠恆星連續兩次過中天</div><div class="row row-ac"><i></i><span>a → c</span></div><div class="v7-p246-annual-q v5-recall" data-question="11" data-page="246">${window.v4StrictN?window.v4StrictN(11):'(11)'} ${f(11,0,58)} 日<br>＝地球自轉約 ${f(11,1,44)} 度<br>＝太陽連續兩次過中天<br>1 平均太陽日＝${f(11,2,40)} 小時</div><div class="row row-star"><i></i></div><div class="v7-p246-annual-q v5-recall" data-question="12" data-page="246">${window.v4StrictN?window.v4StrictN(12):'(12)'} 恆星每天 ${f(12,0,66)} 升起<br>一個月後同一時刻，該恆星<br>會往西移動 ${f(12,1,42)} 度</div></div>`;
   const t=document.createElement('template');t.innerHTML=html;for(const n of [10,11,12])t.content.querySelector(`.v6-p246-q[data-question="${n}"]`)?.remove();const old=t.content.querySelector('.v6-p246-annual');if(old){const a=document.createElement('template');a.innerHTML=annual;old.replaceWith(a.content.firstElementChild)}return t.innerHTML;
 };
 if(typeof window.render==='function')window.render();
})();
