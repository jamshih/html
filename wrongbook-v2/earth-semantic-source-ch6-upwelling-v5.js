// Page 252: upwelling and sea-salt source branches.
const v5C6up=EARTH_SEMANTIC_MAPS.find(c=>c.number===6);
if(v5C6up){
 const N=(id,label,x,y,w=100)=>v5Micro(v5C6up,id,252,label,x,y,w,'#5e86b6');
 N('up-cold','冷的深層水',585,610);N('up-nutrient','營養鹽較多',700,610);N('up-product','生物生產力上升',695,655,115);
 v5Rel(v5C6up,'c6-up1',252,'upwelling','up-cold','results-in','湧升把較冷的深層海水帶到表面。','#5e86b6');
 v5Rel(v5C6up,'c6-up2',252,'up-cold','up-nutrient','corresponds-to','湧升的深層水常伴隨較多營養鹽。','#5e86b6');
 v5Rel(v5C6up,'c6-up3',252,'up-nutrient','up-product','increases','營養鹽增加可提高表層生物生產力。','#5e86b6');
 N('salt-ions','離子狀態',70,955,86);N('salt-ratio','主要離子比例近固定',70,1000,130);N('salt-rock','岩石風化',215,955,82);N('salt-volcano','火山釋氣',215,1000,82);
 v5Rel(v5C6up,'c6-salt1',252,'sea-salts','salt-ions','contains','海水鹽類主要以溶解離子形式存在。','#5e86b6');
 v5Rel(v5C6up,'c6-salt2',252,'sea-salts','salt-ratio','explains','海水主要離子的相對比例近似固定。','#5e86b6');
 v5Rel(v5C6up,'c6-salt3',252,'salt-rock','sea-salts','causes','岩石風化是海水離子的重要來源。','#5e86b6');
 v5Rel(v5C6up,'c6-salt4',252,'salt-volcano','sea-salts','causes','火山與內部釋氣也提供海水溶解物質。','#5e86b6');
}
