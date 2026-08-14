// Page 246 annual-motion refinement: remove handwritten 360/361/24/30 answers from permanent panel.
(function(){
 const prev=window.v5PageHtml;
 if(typeof prev!=='function')return;
 window.v5PageHtml=function(ch,sem,page,mode){
   let html=prev(ch,sem,page,mode);
   if(page!==246)return html;
   const f=(n,i,w)=>typeof window.v4StrictField==='function'?window.v4StrictField(ch,n,i,mode,w):'';
   const annual=`<div class="v6-p246-annual v7-p246-annual" data-v7-answer-leak-scrubbed="true"><b>周年運動</b><div class="row"><i></i><span>a → b</span></div><div>${window.v4StrictN?window.v4StrictN(10):'(10)'} ${f(10,0,62)} 日</div><div>＝地球自轉 ${f(10,1,48)} 度</div><div>＝遙遠恆星連續兩次過中天</div><div class="row"><i></i><span>a → c</span></div><div>${window.v4StrictN?window.v4StrictN(11):'(11)'} ${f(11,0,62)} 日</div><div>＝地球自轉約 ${f(11,1,48)} 度</div><div>＝太陽連續兩次過中天</div><div>1 平均太陽日＝${f(11,2,44)} 小時</div><div class="row"><i></i></div><div>${window.v4StrictN?window.v4StrictN(12):'(12)'} 恆星每天 ${f(12,0,72)} 升起</div><div>一個月後同一時刻，該恆星<br>會往西移動 ${f(12,1,45)} 度</div></div>`;
   html=html.replace(/<div class="v6-p246-annual">[\s\S]*?<\/div><\/div>/,annual);
   return html;
 };
 if(typeof window.render==='function')window.render();
})();
