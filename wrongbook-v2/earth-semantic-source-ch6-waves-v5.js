// Page 253: wave growth and shallow-water process.
const v5C6wv=EARTH_SEMANTIC_MAPS.find(c=>c.number===6);
if(v5C6wv){
 const N=(id,label,x,y,w=90)=>v5Micro(v5C6wv,id,253,label,x,y,w,'#5d9a6e');
 N('wind-strong','風較強',500,885,72);N('wind-long','吹拂較久',580,885,82);N('fetch-long','風區較長',660,885,82);N('wave-large','波浪較大',580,930,82);N('swell','湧浪',580,975,65);
 v5Rel(v5C6wv,'c6-wv1',253,'wind-strong','wave-large','causes','風速增加有利於形成較大的波浪。','#5d9a6e');
 v5Rel(v5C6wv,'c6-wv2',253,'wind-long','wave-large','causes','吹拂時間增加讓波浪持續成長。','#5d9a6e');
 v5Rel(v5C6wv,'c6-wv3',253,'fetch-long','wave-large','causes','較長的吹送距離讓波浪有更多成長空間。','#5d9a6e');
 v5Rel(v5C6wv,'c6-wv4',253,'wave-large','swell','results-in','波離開生成風區後可成為較規則的湧浪。','#5d9a6e');
 N('shallow-slow','進淺水後減速',485,1095,105);N('wave-short','波長縮短',600,1095,88);N('refraction','折射',485,1140,65);N('headland','岬角能量集中',560,1140,108);N('alongshore','沿岸流',680,1140,72);
 v5Rel(v5C6wv,'c6-sh1',253,'shallow-waves','shallow-slow','results-in','波進入淺水後受海床影響而減速。','#5d9a6e');
 v5Rel(v5C6wv,'c6-sh2',253,'shallow-slow','wave-short','results-in','波速下降而週期近似不變時，波長縮短。','#5d9a6e');
 v5Rel(v5C6wv,'c6-sh3',253,'shallow-slow','refraction','results-in','水深造成的波速差會使波峰轉向。','#5d9a6e');
 v5Rel(v5C6wv,'c6-sh4',253,'refraction','headland','results-in','折射可使波能在岬角附近匯聚。','#5d9a6e');
 v5Rel(v5C6wv,'c6-sh5',253,'refraction','alongshore','results-in','斜向入射的波浪可造成沿岸方向的水體輸送。','#5d9a6e');
}
