// Figure-local source blanks. One logical question remains one data-question container even when the photograph has many blanks.
(function(){
 const prev=window.v5PageHtml;
 if(typeof prev!=='function')return;
 window.v5PageHtml=function(ch,sem,page,mode){
   let html=prev(ch,sem,page,mode);
   const f=(n,i,w)=>typeof window.v4StrictField==='function'?window.v4StrictField(ch,n,i,mode,w):'';
   if(page===248){
     html=html.replace(/<div class="v6-p248-q v5-recall[^"]*" data-question="15"[\s\S]*?<\/div>/,'');
     const cells=[
       [0,438,902,68],[1,522,902,72],[2,610,902,62],[3,690,902,112],
       [4,438,986,68],[5,522,986,72],[6,610,986,62],[7,690,986,112],
       [8,438,1074,68],[9,522,1074,72],[10,610,1074,62]
     ].map(([i,x,y,w])=>`<span style="position:absolute;left:${x}px;top:${y}px;pointer-events:auto">${f(15,i,w)}</span>`).join('');
     const q15=`<div class="v7-p248-q15 v5-recall" data-question="15" data-page="248" data-v7-source-figure-blanks="11" style="position:absolute;inset:0;z-index:8;pointer-events:none"><span style="position:absolute;left:124px;top:790px;width:690px;font-size:12.5px;line-height:1.4">請先分析左圖三條隨深度變化線各為何（P波、S波、密度），再依此畫出地函與核、外核與內核2條分界線，並延伸至右表；在右表填上該分層名稱、組成與狀態（固或液），及不連續面。 <b class="v4strict-num">(15)</b></span>${cells}</div>`;
     html=html.replace('<img class="v5qa-source-photo"',q15+'<img class="v5qa-source-photo"');
   }
   if(page===249){
     html=html.replace(/<div class="v6-p249-q v5-recall[^"]*" data-question="23"[\s\S]*?<\/div>/,'');
     const q23=`<div class="v7-p249-q23 v5-recall" data-question="23" data-page="249" data-v7-source-figure-blanks="4" style="position:absolute;left:400px;top:650px;width:490px;height:245px;z-index:8;pointer-events:none"><span style="position:absolute;left:4px;top:0;width:300px;font-size:13px">請在【　】寫上地形名稱 <b class="v4strict-num">(23)</b></span><span style="position:absolute;left:24px;top:42px;pointer-events:auto">${f(23,0,78)}</span><span style="position:absolute;left:150px;top:18px;pointer-events:auto">${f(23,1,88)}</span><span style="position:absolute;left:278px;top:42px;pointer-events:auto">${f(23,2,78)}</span><span style="position:absolute;left:376px;top:23px;pointer-events:auto">${f(23,3,78)}</span></div>`;
     html=html.replace('<img class="v5qa-source-photo"',q23+'<img class="v5qa-source-photo"');
   }
   return html;
 };
 if(typeof window.render==='function')window.render();
})();
