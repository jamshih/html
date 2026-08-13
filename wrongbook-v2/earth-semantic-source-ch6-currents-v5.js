const v5C6cu=EARTH_SEMANTIC_MAPS.find(c=>c.number===6);
if(v5C6cu){
 const N=(id,label,x,y,w=95)=>v5Micro(v5C6cu,id,253,label,x,y,w,'#5d9a6e');
 N('wind-current','風吹海流',275,890);N('vertical-current','湧升／沉降流',275,935,105);N('density-current','溫鹽環流',275,980,95);
 v5Rel(v5C6cu,'c6-cur1',253,'currents','wind-current','classified-into','海流包含風吹海流。','#5d9a6e');
 v5Rel(v5C6cu,'c6-cur2',253,'currents','vertical-current','classified-into','海流包含垂直補償流。','#5d9a6e');
 v5Rel(v5C6cu,'c6-cur3',253,'currents','density-current','classified-into','海流包含密度差驅動的環流。','#5d9a6e');
}
