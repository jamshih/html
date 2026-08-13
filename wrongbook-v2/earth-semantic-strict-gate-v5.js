// Final acceptance gate: source inventory, complete semantic relationships, and dedicated renderers are mandatory.
const v5C6Final=EARTH_SEMANTIC_MAPS.find(c=>c.number===6);
if(v5C6Final){
 const N=(id,page,label,x,y,w=96,color='#5d9a6e')=>v5Micro(v5C6Final,id,page,label,x,y,w,color);
 const E=(id,page,from,to,relation,reason,color='#5d9a6e')=>v5Rel(v5C6Final,id,page,from,to,relation,reason,color);
 // 252 typhoon: conditions, structure, and ocean response.
 N('ty-warm',252,'暖海水供能',70,205,100,'#846da4');N('ty-rotation',252,'旋轉條件',70,250,100,'#846da4');N('ty-steer',252,'環境駛流',70,295,92,'#846da4');N('ty-eye',252,'颱風眼',190,205,72,'#846da4');N('ty-wall',252,'眼牆上升',190,250,88,'#846da4');N('ty-cool',252,'通過後海溫下降',185,295,125,'#846da4');
 E('c6-ty1',252,'ty-warm','typhoon','causes','暖海水提供颱風發展所需能量。','#846da4');E('c6-ty2',252,'ty-rotation','typhoon','depends-on','颱風形成需要足以建立旋轉的緯度條件。','#846da4');E('c6-ty3',252,'ty-steer','typhoon','causes','大尺度環境氣流控制颱風主要移動方向。','#846da4');E('c6-ty4',252,'typhoon','ty-eye','contains','成熟颱風中心具有颱風眼。','#846da4');E('c6-ty5',252,'typhoon','ty-wall','contains','眼牆是強烈上升運動集中的區域。','#846da4');E('c6-ty6',252,'typhoon','ty-cool','results-in','颱風通過時的海洋攪拌會降低表面海溫。','#846da4');
 // 252 upwelling and salt tree.
 N('up-cold',252,'冷的深層水',585,610,100,'#5e86b6');N('up-nutrient',252,'營養鹽較多',700,610,100,'#5e86b6');N('up-product',252,'生物生產力上升',695,655,115,'#5e86b6');
 E('c6-up1',252,'upwelling','up-cold','results-in','湧升把較冷的深層海水帶到表面。','#5e86b6');E('c6-up2',252,'up-cold','up-nutrient','corresponds-to','湧升的深層水常伴隨較多營養鹽。','#5e86b6');E('c6-up3',252,'up-nutrient','up-product','increases','營養鹽增加可提高表層生物生產力。','#5e86b6');
 N('salt-ions',252,'離子狀態',70,955,86,'#5e86b6');N('salt-ratio',252,'主要離子比例近固定',70,1000,130,'#5e86b6');N('salt-rock',252,'岩石風化',215,955,82,'#5e86b6');N('salt-volcano',252,'火山釋氣',215,1000,82,'#5e86b6');
 E('c6-salt1',252,'sea-salts','salt-ions','contains','海水鹽類主要以溶解離子形式存在。','#5e86b6');E('c6-salt2',252,'sea-salts','salt-ratio','explains','海水主要離子的相對比例近似固定。','#5e86b6');E('c6-salt3',252,'salt-rock','sea-salts','causes','岩石風化是海水離子的重要來源。','#5e86b6');E('c6-salt4',252,'salt-volcano','sea-salts','causes','火山與內部釋氣也提供海水溶解物質。','#5e86b6');
 // 253 greenhouse + ice-albedo feedback loop.
 N('surface-longwave',253,'地表放出長波',300,240,112,'#d8873f');N('longwave-absorbed',253,'大氣吸收長波',430,240,110,'#d8873f');N('reradiation',253,'再輻射',430,285,76,'#d8873f');N('extra-warming',253,'增暖',525,285,65,'#d8873f');
 E('c6-gh1',253,'surface-longwave','longwave-absorbed','results-in','地表放出的長波可被溫室氣體吸收。','#d8873f');E('c6-gh2',253,'longwave-absorbed','reradiation','results-in','吸收長波後會向不同方向再輻射。','#d8873f');E('c6-gh3',253,'reradiation','extra-warming','results-in','向下的回輻射使地表與低層大氣增加能量。','#d8873f');E('c6-gh4',253,'greenhouse','longwave-absorbed','explains','溫室效應的核心是吸收地表長波並再輻射。','#d8873f');
 N('ice-high-reflect',253,'冰雪反照率高',70,555,108,'#d8873f');N('reflection-more',253,'反射增加',70,600,86,'#d8873f');N('ice-less',253,'暖化使冰雪減少',200,555,120,'#d8873f');N('reflect-less',253,'反照率下降',200,600,98,'#d8873f');N('absorb-more',253,'吸收能量增加',200,645,110,'#d8873f');
 E('c6-ice1',253,'ice-high-reflect','reflection-more','increases','冰雪反照率高會增加短波反射。','#d8873f');E('c6-ice2',253,'extra-warming','ice-less','causes','增暖使冰雪覆蓋減少。','#d8873f');E('c6-ice3',253,'ice-less','reflect-less','results-in','冰雪減少使地表平均反照率下降。','#d8873f');E('c6-ice4',253,'reflect-less','absorb-more','results-in','反照率下降使地表吸收更多太陽能。','#d8873f');E('c6-ice5',253,'absorb-more','extra-warming','results-in','吸收增加造成進一步增暖，形成回饋環。','#d8873f');
 // Plate-climate multipath influence.
 [['plate-continent','陸塊分布',370,565],['plate-topography','地形',470,565],['plate-weathering','岩石風化',570,565],['plate-gas','溫室氣體',370,610],['plate-current','海流環流',470,610],['plate-albedo','反照率',570,610]].forEach(([id,label,x,y],i)=>{N(id,253,label,x,y,90,'#9b7654');E(`c6-plate${i+1}`,253,'plate-climate',id,'causes',`板塊運動可透過${label}影響長期氣候。`,'#9b7654');});
 // Current hierarchy.
 N('wind-current',253,'風吹海流',275,890);N('vertical-current',253,'湧升／沉降流',275,935,105);N('density-current',253,'溫鹽環流',275,980,95);E('c6-cur1',253,'currents','wind-current','classified-into','海流包含風吹海流。');E('c6-cur2',253,'currents','vertical-current','classified-into','海流包含垂直補償流。');E('c6-cur3',253,'currents','density-current','classified-into','海流包含密度差驅動的環流。');
 // Wave growth and shallow-water chain.
 N('wind-strong',253,'風較強',500,885,72);N('wind-long',253,'吹拂較久',580,885,82);N('fetch-long',253,'風區較長',660,885,82);N('wave-large',253,'波浪較大',580,930,82);N('swell',253,'湧浪',580,975,65);E('c6-wv1',253,'wind-strong','wave-large','causes','風速增加有利於形成較大的波浪。');E('c6-wv2',253,'wind-long','wave-large','causes','吹拂時間增加讓波浪持續成長。');E('c6-wv3',253,'fetch-long','wave-large','causes','較長的吹送距離讓波浪有更多成長空間。');E('c6-wv4',253,'wave-large','swell','results-in','波離開生成風區後可成為較規則的湧浪。');
 N('shallow-slow',253,'進淺水後減速',485,1095,105);N('wave-short',253,'波長縮短',600,1095,88);N('refraction',253,'折射',485,1140,65);N('headland',253,'岬角能量集中',560,1140,108);N('alongshore',253,'沿岸流',680,1140,72);E('c6-sh1',253,'shallow-waves','shallow-slow','results-in','波進入淺水後受海床影響而減速。');E('c6-sh2',253,'shallow-slow','wave-short','results-in','波速下降而週期近似不變時，波長縮短。');E('c6-sh3',253,'shallow-slow','refraction','results-in','水深造成的波速差會使波峰轉向。');E('c6-sh4',253,'refraction','headland','results-in','折射可使波能在岬角附近匯聚。');E('c6-sh5',253,'refraction','alongshore','results-in','斜向入射的波浪可造成沿岸方向的水體輸送。');
}

const v5StrictPrevValidate=v5SemanticValidate;
v5SemanticValidate=function(){
 const r=v5StrictPrevValidate();
 r.pageFigures={};r.missingRendererFigures=[];r.sourceRequiredFiguresMissing=[];r.unverifiedInventedFigures=[];
 let expectedTotal=0,renderedModelTotal=0;
 for(const page of Object.keys(V5_SOURCE_FIGURE_INVENTORY).map(Number)){
  const expected=V5_SOURCE_FIGURE_INVENTORY[page];expectedTotal+=expected.length;
  const sem=EARTH_SEMANTIC_MAPS.find(c=>c.pages.includes(page));
  const actual=(sem?.figures||[]).filter(f=>f.sourcePage===page);
  const actualIds=actual.map(f=>f.id);renderedModelTotal+=actual.length;
  const missing=expected.filter(id=>!actualIds.includes(id));
  const invented=actualIds.filter(id=>!expected.includes(id));
  const missingRenderers=actual.filter(f=>typeof V5_RENDERERS[f.renderer]!=='function').map(f=>f.id);
  r.sourceRequiredFiguresMissing.push(...missing.map(id=>`${page}:${id}`));
  r.unverifiedInventedFigures.push(...invented.map(id=>`${page}:${id}`));
  r.missingRendererFigures.push(...missingRenderers.map(id=>`${page}:${id}`));
  r.pageFigures[page]={expected:expected.length,model:actual.length,missing,invented,missingRenderers,ok:!missing.length&&!invented.length&&!missingRenderers.length};
 }
 r.totals.sourceFiguresExpected=expectedTotal;r.totals.sourceFiguresModel=renderedModelTotal;
 r.semanticFallbackFigures=r.missingRendererFigures.length;
 r.specializedFigureRenderers=renderedModelTotal-r.missingRendererFigures.length;
 const blockers=['missingQuestionIds','duplicateQuestionIds','orphanQuestions','orphanConceptNodes','orphanRequiredFigures','orphanConnectors','connectorWithoutRelationMeaning','sourceRequiredFiguresMissing','unverifiedInventedFigures','missingRendererFigures'];
 r.ok=r.totals.questions===V5_TOTAL&&expectedTotal===renderedModelTotal&&blockers.every(k=>(r[k]||[]).length===0)&&v4RefValidateData().ok;
 return r;
};
window.v5SemanticValidate=v5SemanticValidate;
v5FigureSvg=function(f){const fn=V5_RENDERERS[f.renderer];if(!fn){console.error('Missing source-specific figure renderer',f.id,f.renderer);return '';}return fn();};
window.v5StrictAcceptanceReport=()=>v5SemanticValidate();
