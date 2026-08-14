// Exact printed prompt manifest transcribed from IMG_1529 (p248) and IMG_1530 (p249). Handwriting is excluded.
(function(){
 const M=window.SOURCE_PROMPTS_V7=window.SOURCE_PROMPTS_V7||{};
 const E=(number,template,blanks,sourceAnswers=[],opts={})=>({number,template,blanks,sourceAnswers,verifiedFromPhoto:true,...opts});
 M[248]=[
  E(1,'通常離震央愈近，<b class="v4strict-num">(1)</b> {{0}} 有較大的趨勢，有時會因特殊地質狀況改變，而有例外',1,['震度']),
  E(2,'震 <b class="v4strict-num">(2)</b> {{0}}',1,['央']),
  E(3,'震 <b class="v4strict-num">(3)</b> {{0}}',1,['源']),
  E(4,'P波抵達，屬於 <b class="v4strict-num">(4)</b> {{0}} 波，傳遞速度最快的震波',1,['縱'],{answerAliases:[['縱波']]}),
  E(5,'S波抵達，屬於 <b class="v4strict-num">(5)</b> {{0}} 波，只能通過 {{1}} 態介質',2,['橫','固'],{answerAliases:[['橫波'],['固態介質']]}),
  E(6,'利用P波與S波到達測站的 <b class="v4strict-num">(6)</b> {{0}} 差（ΔTps）可推算測站與震源距離',1,['時間'],{answerAliases:[['時間差']]}),
  E(7,'地震儀的震波紀錄紙<br>利用 <b class="v4strict-num">(7)</b> {{0}} 原理記錄震波',1,['慣性']),
  E(8,'<b class="v4strict-num">(8)</b> {{0}} 地區',1,['海洋']),
  E(9,'<b class="v4strict-num">(9)</b> {{0}} 地區',1,['大陸']),
  E(10,'<b class="v4strict-num">(10)</b> {{0}} 地殼（{{1}} 岩質）<br>厚度較 {{2}}，密度較 {{3}}',4,['大陸','花崗','厚','小'],{ensureFields:true,answerAliases:[[],['花崗岩質'],['較厚'],['密度較小']]}),
  E(11,'<b class="v4strict-num">(11)</b> {{0}} 地殼（{{1}} 岩質）<br>厚度較 {{2}}，密度較 {{3}}',4,['海洋','玄武','薄','大'],{ensureFields:true,answerAliases:[[],['玄武岩質'],['較薄'],['密度較大']]}),
  E(12,'<b class="v4strict-num">(12)</b> {{0}}',1,['岩石圈']),
  E(13,'<b class="v4strict-num">(13)</b> {{0}}',1,['軟流圈']),
  E(14,'<b class="v4strict-num">(14)</b> {{0}}',1,['莫荷不連續面'],{answerAliases:[['莫荷面']]}),
  E(15,'依P波、S波、密度隨深度變化，畫出地函與核、外核與內核2條分界線，並延伸至右表；在右表填上各分層名稱、組成與狀態（固或液），及不連續面。 <b class="v4strict-num">(15)</b>',11,['地函','橄欖岩','固態','古氏不連續面','外核','Fe、Ni','液態','雷曼不連續面','內核','Fe、Ni','固態'],{ensureFields:true,skipRender:true,dropOldAlias:true})
 ];
 M[249]=[
  E(16,'考慮非近距的地震，P波速度（Vp）與S波速度（Vs）改變很小，因此可利用ΔTps去推算測站與震源距離（S），請依此列出算式：<b class="v4strict-num">(16)</b> {{0}}',1,['ΔTps＝S/Vs－S/Vp']),
  E(17,'土壤液化：原鬆散、高地下水位沉積層在地震時因孔隙水壓 <b class="v4strict-num">(17)</b> {{0}}，致失去支撐力',1,['增加'],{dropOldAlias:true}),
  E(18,'P波與S波到達測站時間差愈長，表示測站距離震央愈 <b class="v4strict-num">(18)</b> {{0}}',1,['遠']),
  E(19,'至少需 <b class="v4strict-num">(19)</b> {{0}} 個測站，才可較準確推知震央位置',1,['3'],{answerAliases:[['3個']]}),
  E(20,'<b class="v4strict-num">(20)</b> {{0}} 學說的證據在 {{1}} 上：海岸線吻合、同種陸生動植物化石、地質構造、古氣候證據跨陸分布',2,['大陸漂移','陸地'],{dropOldAlias:true}),
  E(21,'<b class="v4strict-num">(21)</b> {{0}} 學說的證據：海洋地殼年齡、沉積物厚度與地磁倒轉紀錄均以中洋脊為中心、兩側對稱；離中洋脊愈遠，海洋地殼年齡愈 {{1}}，沉積物厚度愈 {{2}}',3,['海底擴張','老','厚'],{ensureFields:true,dropOldAlias:true,answerAliases:[[],['愈老'],['愈厚']]}),
  E(22,'從 <b class="v4strict-num">(22)</b> {{0}} 與 {{1}} 分布可推知板塊邊界',2,['地震','火山']),
  E(23,'請在【　】寫上地形名稱 <b class="v4strict-num">(23)</b>',4,['中洋脊','轉形斷層','裂谷','海溝'],{ensureFields:true,skipRender:true,dropOldAlias:true}),
  E(24,'岩漿：<b class="v4strict-num">(24)</b> {{0}} 質',1,['玄武岩'],{answerAliases:[['玄武岩質']]}),
  E(25,'淺、中、深源地震帶有 <b class="v4strict-num">(25)</b> {{0}} 帶的聚合型',1,['隱沒']),
  E(26,'岩漿：<b class="v4strict-num">(26)</b> {{0}} 質',1,['安山岩'],{answerAliases:[['安山岩質']]}),
  E(27,'請在島弧與海溝處寫上名稱 <b class="v4strict-num">(27)</b>',4,['琉球','琉球','馬尼拉','呂宋'],{ensureFields:true,skipRender:true,answerAliases:[['琉球島弧'],['琉球海溝'],['馬尼拉海溝'],['呂宋島弧']]})
 ];
})();
