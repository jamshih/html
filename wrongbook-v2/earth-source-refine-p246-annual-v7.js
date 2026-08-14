// Page 246 annual-motion refinement: remove handwritten answers and keep source prompts readable without overlap.
(function(){
 if(!document.getElementById('v7-p246-annual-layout')){
   const s=document.createElement('style');s.id='v7-p246-annual-layout';s.textContent=`
   .v6-p246-q[data-question="9"]{left:510px!important;top:808px!important;width:112px!important}
   .v6-p246-q[data-question="8"]{left:510px!important;top:850px!important;width:112px!important}
   .v7-p246-annual{left:625px!important;top:725px!important;width:240px!important;min-height:370px!important;padding:8px 10px!important;font-size:12.5px!important;line-height:1.28!important}
   .v7-p246-annual .row{margin:2px 0!important;padding-left:10px!important}.v7-p246-annual-q{display:block!important;margin:2px 0 7px!important;line-height:1.25!important}.v7-p246-annual-q .v4strict-fill{height:18px!important;vertical-align:middle!important}`;document.head.appendChild(s);
 }
 const prev=window.v5PageHtml;if(typeof prev!=='function')return;
 window.v5PageHtml=function(ch,sem,page,mode){
   let html=prev(ch,sem,page,mode);if(page!==246)return html;
   const f=(n,i,w)=>typeof window.v4StrictField==='function'?window.v4StrictField(ch,n,i,mode,w):'';
   const annual=`<div class="v6-p246-annual v7-p246-annual" data-v7-answer-leak-scrubbed="true"><b>周年運動</b><div class="row"><i></i><span>a → b</span></div><div class="v7-p246-annual-q v5-recall" data-question="10" data-page="246">${window.v4StrictN?window.v4StrictN(10):'(10)'} ${f(10,0,62)} 日<br>＝地球自轉 ${f(10,1,48)} 度<br>＝遙遠恆星連續兩次過中天</div><div class="row"><i></i><span>a → c</span></div><div class="v7-p246-annual-q v5-recall" data-question="11" data-page="246">${window.v4StrictN?window.v4StrictN(11):'(11)'} ${f(11,0,62)} 日<br>＝地球自轉約 ${f(11,1,48)} 度<br>＝太陽連續兩次過中天<br>1 平均太陽日＝${f(11,2,44)} 小時</div><div class="row"><i></i></div><div class="v7-p246-annual-q v5-recall" data-question="12" data-page="246">${window.v4StrictN?window.v4StrictN(12):'(12)'} 恆星每天 ${f(12,0,72)} 升起<br>一個月後同一時刻，該恆星<br>會往西移動 ${f(12,1,45)} 度</div></div>`;
   const t=document.createElement('template');t.innerHTML=html;for(const n of [10,11,12])t.content.querySelector(`.v6-p246-q[data-question="${n}"]`)?.remove();const old=t.content.querySelector('.v6-p246-annual');if(old){const a=document.createElement('template');a.innerHTML=annual;old.replaceWith(a.content.firstElementChild)}return t.innerHTML;
 };
 if(typeof window.render==='function')window.render();
})();
