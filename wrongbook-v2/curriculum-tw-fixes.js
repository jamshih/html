// 最後一道臺灣用語正規化：任何課綱資料進入 UI 前先轉成臺灣高中慣用說法。
const TW_UI_REPLACEMENTS=[
 ['線粒體','粒線體'],['高爾基體','高基氏體'],['溶酶體','溶體'],['概率','機率'],['種群','族群'],['群落','群集'],['生境','棲地'],['質粒','質體'],['數據','資料'],['数据','資料'],['視頻','影片'],['信息','資訊'],['網絡','網路'],['网络','網路'],['矢量','向量'],['軟件','軟體'],['软件','軟體'],['硬件','硬體'],['激活能','活化能']
];
function twTaiwanizeString(input=''){
 let out=String(input);
 for(const [from,to] of TW_UI_REPLACEMENTS) out=out.replaceAll(from,to);
 out=out.replace(/(?<!演)算法/g,'演算法');
 out=out.replace(/(^|[^\p{L}])酶(?=$|[^\p{L}])/gu,'$1酵素');
 return out;
}
function twTaiwanizeValue(value){
 if(typeof value==='string') return twTaiwanizeString(value);
 if(Array.isArray(value)) return value.map(twTaiwanizeValue);
 if(value&&typeof value==='object'){
  const next={};
  for(const [k,v] of Object.entries(value)) next[k]=twTaiwanizeValue(v);
  return next;
 }
 return value;
}
for(const key of Object.keys(CURRICULUM_TW)) CURRICULUM_TW[key]=twTaiwanizeValue(CURRICULUM_TW[key]);
