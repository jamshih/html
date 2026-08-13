// Page 253: greenhouse chain, ice-albedo feedback, and plate-climate multipath branch.
const v5C6cl=EARTH_SEMANTIC_MAPS.find(c=>c.number===6);
if(v5C6cl){
 const N=(id,label,x,y,w=100,color='#d8873f')=>v5Micro(v5C6cl,id,253,label,x,y,w,color);
 N('surface-longwave','地表放出長波',300,240,112);N('longwave-absorbed','大氣吸收長波',430,240,110);N('reradiation','再輻射',430,285,76);N('extra-warming','增暖',525,285,65);
 v5Rel(v5C6cl,'c6-gh1',253,'surface-longwave','longwave-absorbed','results-in','地表放出的長波可被溫室氣體吸收。','#d8873f');
 v5Rel(v5C6cl,'c6-gh2',253,'longwave-absorbed','reradiation','results-in','吸收長波後會向不同方向再輻射。','#d8873f');
 v5Rel(v5C6cl,'c6-gh3',253,'reradiation','extra-warming','results-in','向下的回輻射使地表與低層大氣增加能量。','#d8873f');
 v5Rel(v5C6cl,'c6-gh4',253,'greenhouse','longwave-absorbed','explains','溫室效應的核心是吸收地表長波並再輻射。','#d8873f');
 N('ice-high-reflect','冰雪反照率高',70,555,108);N('reflection-more','反射增加',70,600,86);N('ice-less','暖化使冰雪減少',200,555,120);N('reflect-less','反照率下降',200,600,98);N('absorb-more','吸收能量增加',200,645,110);
 v5Rel(v5C6cl,'c6-ice1',253,'ice-high-reflect','reflection-more','increases','冰雪反照率高會增加短波反射。','#d8873f');
 v5Rel(v5C6cl,'c6-ice2',253,'extra-warming','ice-less','causes','增暖使冰雪覆蓋減少。','#d8873f');
 v5Rel(v5C6cl,'c6-ice3',253,'ice-less','reflect-less','results-in','冰雪減少使地表平均反照率下降。','#d8873f');
 v5Rel(v5C6cl,'c6-ice4',253,'reflect-less','absorb-more','results-in','反照率下降使地表吸收更多太陽能。','#d8873f');
 v5Rel(v5C6cl,'c6-ice5',253,'absorb-more','extra-warming','results-in','吸收增加造成進一步增暖，形成回饋環。','#d8873f');
 const P=(id,label,x,y)=>N(id,label,x,y,90,'#9b7654');
 P('plate-continent','陸塊分布',370,565);P('plate-topography','地形',470,565);P('plate-weathering','岩石風化',570,565);P('plate-gas','溫室氣體',370,610);P('plate-current','海流環流',470,610);P('plate-albedo','反照率',570,610);
 [['plate-continent','陸塊分布'],['plate-topography','地形'],['plate-weathering','岩石風化'],['plate-gas','溫室氣體'],['plate-current','海流環流'],['plate-albedo','反照率']].forEach(([id,label],i)=>v5Rel(v5C6cl,`c6-plate${i+1}`,253,'plate-climate',id,'causes',`板塊運動可透過${label}影響長期氣候。`,'#9b7654'));
}
