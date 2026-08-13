// Page 252: typhoon source process tree.
const v5C6ty=EARTH_SEMANTIC_MAPS.find(c=>c.number===6);
if(v5C6ty){
 const N=(id,label,x,y,w=96)=>v5Micro(v5C6ty,id,252,label,x,y,w,'#846da4');
 N('ty-warm','暖海水供能',70,205);N('ty-rotation','旋轉條件',70,250);N('ty-steer','環境駛流',70,295);N('ty-eye','颱風眼',190,205,72);N('ty-wall','眼牆上升',190,250);N('ty-cool','通過後海溫下降',185,295,125);
 v5Rel(v5C6ty,'c6-ty1',252,'ty-warm','typhoon','causes','暖海水提供颱風發展所需能量。','#846da4');
 v5Rel(v5C6ty,'c6-ty2',252,'ty-rotation','typhoon','depends-on','颱風形成需要足以建立旋轉的緯度條件。','#846da4');
 v5Rel(v5C6ty,'c6-ty3',252,'ty-steer','typhoon','causes','大尺度環境氣流控制颱風主要移動方向。','#846da4');
 v5Rel(v5C6ty,'c6-ty4',252,'typhoon','ty-eye','contains','成熟颱風中心具有颱風眼。','#846da4');
 v5Rel(v5C6ty,'c6-ty5',252,'typhoon','ty-wall','contains','眼牆是強烈上升運動集中的區域。','#846da4');
 v5Rel(v5C6ty,'c6-ty6',252,'typhoon','ty-cool','results-in','颱風通過時的海洋攪拌會降低表面海溫。','#846da4');
}
