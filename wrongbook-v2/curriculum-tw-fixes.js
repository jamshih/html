// 最後一道臺灣用語正規化：任何課綱資料進入 UI 前先轉成臺灣高中慣用說法。
// This is also the canonical normalization boundary for externally researched study-note text.
// Public notes may mix Simplified Chinese/Mainland terms; normalize concept terminology here
// before any text is accepted into a Wrongbook mind map.
const TW_UI_REPLACEMENTS=[
 ['線粒體','粒線體'],['线粒体','粒線體'],
 ['高爾基體','高基氏體'],['高尔基体','高基氏體'],
 ['溶酶體','溶體'],['溶酶体','溶體'],
 ['核糖体','核糖體'],['内质网','內質網'],['叶绿体','葉綠體'],['细胞膜','細胞膜'],['细胞核','細胞核'],
 ['有丝分裂','有絲分裂'],['减数分裂','減數分裂'],
 ['概率','機率'],['种群','族群'],['種群','族群'],['群落','群集'],['生境','棲地'],['质粒','質體'],['質粒','質體'],
 ['数据','資料'],['數據','資料'],['视频','影片'],['視頻','影片'],['信息','資訊'],
 ['网络','網路'],['網絡','網路'],['矢量','向量'],['软件','軟體'],['軟件','軟體'],['硬件','硬體'],['激活能','活化能'],
 ['摩尔质量','莫耳質量'],['摩尔','莫耳'],['势能','位能'],['电势','電位'],
 ['函数','函數'],['数列','數列'],['级数','級數'],['几何','幾何'],['导数','導數'],
 ['总统制','總統制'],['内阁制','內閣制'],['双首长制','雙首長制'],
 ['权利','權利'],['权力','權力'],['产业','產業'],['人口迁移','人口遷移'],['修辞','修辭'],['语法','語法'],
 ['氧化还原','氧化還原']
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