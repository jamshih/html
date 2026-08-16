// Earth source hierarchy V9. Geometry was re-read from the current NEW_SOURCE_TRUTH 910x1270 grids.
(function(){
 const R=(x,y,w,h)=>({x,y,w,h});
 const N=(id,type,rect,opts={})=>({id,type,sourceRect:rect,safeRect:opts.safeRect||rect,contentRect:opts.contentRect||rect,containerKind:opts.containerKind||'none',parentId:opts.parentId||null,children:opts.children||[],anchors:opts.anchors||{},protectedGeometry:opts.protectedGeometry||[]});
 const H=window.SOURCE_HIERARCHY_V9={};
 function page(page,groups){
   const root=N(`p${page}`,'group',R(0,0,910,1270),{children:groups.map(g=>g.id)});
   const nodes={[root.id]:root};
   for(const g of groups){nodes[g.id]=g;g.parentId=root.id;}
   H[page]={page,width:910,height:1270,rootId:root.id,nodes,questionParents:{},sourceAuthority:'NEW_SOURCE_TRUTH_CURRENT_12_PHOTOS'};
   return H[page];
 }
 function add(p,node){p.nodes[node.id]=node; const par=p.nodes[node.parentId]; if(par&&!par.children.includes(node.id))par.children.push(node.id);return node;}
 function own(p,parent,nums){for(const n of nums)p.questionParents[n]=parent;}
 let p;
 p=page(242,[N('p242-universe','group',R(55,230,785,420)),N('p242-solar-nebula','group',R(55,690,520,500)),N('p242-earth-evolution','group',R(375,720,470,470))]); own(p,'p242-universe',[1,2,3,4,5,6,7,8,9,10]); own(p,'p242-solar-nebula',[11,12,13,14,15]); own(p,'p242-earth-evolution',[16,17,18,19,20]);
 p=page(243,[N('p243-geologic-time','protected-figure',R(300,35,570,260),{containerKind:'source-figure-with-label-anchors'}),N('p243-relative-age','protected-figure',R(60,300,800,310),{containerKind:'source-figure-with-label-anchors'}),N('p243-earth-history','group',R(55,650,820,575))]); own(p,'p243-geologic-time',[33,34,35,36,37,38,39]); own(p,'p243-relative-age',[40,41,42,43,44,45,46,47,48]); own(p,'p243-earth-history',[21,22,23,24,25,26,27,28,29,30,31,32]);
 p=page(244,[N('p244-star-color','protected-figure',R(60,170,790,300),{containerKind:'source-figure-with-label-anchors'}),N('p244-brightness','group',R(60,465,790,310)),N('p244-celestial-distance','group',R(60,770,790,430))]); own(p,'p244-star-color',[1,2,3,4]); own(p,'p244-brightness',[5,6,7,8,9,10,11,12,13,14]); own(p,'p244-celestial-distance',[15,16,17,18,19,20,21]);
 p=page(245,[N('p245-radiation','protected-figure',R(60,70,790,250),{containerKind:'source-figure-with-label-anchors'}),N('p245-solar-system','protected-figure',R(60,310,790,500),{containerKind:'source-figure-with-label-anchors'}),N('p245-cosmic-hierarchy','protected-figure',R(60,800,790,405),{containerKind:'source-figure-with-label-anchors'})]); own(p,'p245-radiation',[22,23,24]); own(p,'p245-solar-system',[25,26,27,28,29,30,31,32,33,34,35,36,37,38]); own(p,'p245-cosmic-hierarchy',[39,40,41,42,43,44,45,46,47,48,49,50,51]);
 p=page(246,[N('p246-diurnal','protected-figure',R(62,180,390,365),{containerKind:'source-figure-with-label-anchors'}),N('p246-earth-rotation','protected-figure',R(485,180,365,390),{containerKind:'source-figure-with-label-anchors'}),N('p246-zodiac','protected-figure',R(62,615,440,530),{containerKind:'source-figure-with-label-anchors'}),N('p246-annual','source-panel',R(550,620,300,380),{containerKind:'source-panel'})]); own(p,'p246-earth-rotation',[1,2,5,6]); own(p,'p246-diurnal',[3,4,7]); own(p,'p246-annual',[8,9,10,11,12]); own(p,'p246-zodiac',[13,14,15,16,17]);
 p=page(247,[N('p247-latitude-sky','protected-figure',R(65,120,760,430),{containerKind:'source-figure-with-label-anchors'}),N('p247-earth-sun','protected-figure',R(62,565,455,205),{containerKind:'source-figure-with-label-anchors'}),N('p247-orbit-cycles','source-panel',R(62,775,375,430),{containerKind:'source-panel'}),N('p247-insolation','source-panel',R(435,785,385,420),{containerKind:'source-panel'})]); own(p,'p247-latitude-sky',[18,19,20,21,22,23,24,25,26,27,28,29,30,31]); own(p,'p247-earth-sun',[32,33]); own(p,'p247-orbit-cycles',[34,35,36,37]); own(p,'p247-insolation',[38,39,40,41]);
 p=page(248,[N('p248-seismic-terms','protected-figure',R(62,210,360,220),{containerKind:'source-figure-with-label-anchors'}),N('p248-wave-types','protected-figure',R(385,205,455,230),{containerKind:'source-figure-with-label-anchors'}),N('p248-crust','protected-figure',R(62,450,780,300),{containerKind:'source-figure-with-label-anchors'}),N('p248-interior','protected-figure',R(62,775,780,425),{containerKind:'source-figure-with-label-anchors'})]); own(p,'p248-seismic-terms',[1,2,3]); own(p,'p248-wave-types',[4,5,6,7]); own(p,'p248-crust',[8,9,10,11,12,13,14]); own(p,'p248-interior',[15]);
 p=page(249,[N('p249-quake-location','protected-figure',R(62,70,460,330),{containerKind:'source-figure-with-label-anchors'}),N('p249-hazards','group',R(520,70,320,315)),N('p249-evidence','source-panel',R(62,440,780,175),{containerKind:'source-panel'}),N('p249-boundaries','protected-figure',R(62,620,780,565),{containerKind:'source-figure-with-label-anchors'})]); own(p,'p249-quake-location',[16,18,19]); own(p,'p249-hazards',[17]); own(p,'p249-evidence',[20,21]); own(p,'p249-boundaries',[22,23,24,25,26,27]);
 p=page(250,[N('p250-radiation','group',R(55,185,785,170)),N('p250-layers','source-panel',R(55,345,785,285),{containerKind:'source-panel'}),N('p250-saturation','protected-figure',R(55,630,350,365),{containerKind:'source-figure-with-label-anchors'}),N('p250-humidity','group',R(390,640,450,560))]); own(p,'p250-radiation',[1,2,3,4,5,6,7,8]); own(p,'p250-layers',[9,10,11,12,13,14,15,16,17]); own(p,'p250-saturation',[48,49,50]); own(p,'p250-humidity',[51,52,53,54,55,56,57,58,59,60]);
 p=page(251,[N('p251-pressure','group',R(65,75,355,435)),N('p251-vertical-motion','group',R(420,75,400,430)),N('p251-horizontal-motion','group',R(65,510,755,390)),N('p251-circulation','source-panel',R(65,900,755,305),{containerKind:'source-panel'})]); own(p,'p251-pressure',[18,19,20,21,22,23,24]); own(p,'p251-vertical-motion',[25,26,27,28,29,30,31,32,33]); own(p,'p251-horizontal-motion',[34,35,36,37,38,39]); own(p,'p251-circulation',[40,41,42,43,44,45,46,47]);
 p=page(252,[N('p252-typhoon','group',R(55,225,430,300)),N('p252-air-sea','group',R(470,150,365,350)),N('p252-ocean','group',R(55,500,785,705))]);
 add(p,N('p252-enso','graphic-container',R(485,220,335,255),{parentId:'p252-air-sea',containerKind:'source-figure-with-label-anchors',contentRect:R(5,35,325,215),safeRect:R(0,0,335,255),anchors:{q17:R(205,0,125,55),q19:R(0,65,90,55),q18:R(65,170,190,45)}}));
 add(p,N('p252-horizontal','group',R(70,545,410,215),{parentId:'p252-ocean'}));
 add(p,N('p252-normal-pacific','protected-figure',R(20,20,365,165),{parentId:'p252-horizontal',containerKind:'source-figure-with-label-anchors'}));
 add(p,N('p252-ocean-temp','group',R(465,530,360,535),{parentId:'p252-ocean'}));
 add(p,N('p252-mixed-upwelling','source-box',R(0,250,330,78),{parentId:'p252-ocean-temp',containerKind:'source-box',contentRect:R(8,8,314,62)}));
 add(p,N('p252-temp-depth','protected-figure',R(0,365,185,190),{parentId:'p252-ocean-temp',containerKind:'source-figure-with-label-anchors',anchors:{q12:R(165,18,65,30),q13:R(75,70,85,30),q14:R(55,125,100,30)}}));
 add(p,N('p252-temp-explain','source-box',R(190,380,170,125),{parentId:'p252-ocean-temp',containerKind:'source-box',contentRect:R(8,8,154,109)}));
 add(p,N('p252-salinity','group',R(55,785,385,420),{parentId:'p252-ocean'}));
 add(p,N('p252-salinity-graph','protected-figure',R(385,565,290,170),{parentId:'p252-ocean',containerKind:'source-figure-with-label-anchors'}));
 own(p,'p252-typhoon',[1,2,3,4,5,6,7]); own(p,'p252-horizontal',[8,9,10]); own(p,'p252-mixed-upwelling',[11,16]); own(p,'p252-temp-depth',[12,13,14]); own(p,'p252-temp-explain',[15]); own(p,'p252-enso',[17,18,19]); own(p,'p252-salinity',[20,21,22,23,24,25,26]);
 p=page(253,[N('p253-climate','group',R(45,55,785,445)),N('p253-ocean-motion','group',R(55,525,780,675))]);
 add(p,N('p253-climate-left','group',R(20,55,500,345),{parentId:'p253-climate'}));
 add(p,N('p253-greenhouse-cloud','graphic-container',R(0,110,235,100),{parentId:'p253-climate-left',containerKind:'source-cloud',contentRect:R(18,25,205,64),safeRect:R(0,0,235,100),protectedGeometry:[{kind:'outline',inset:3}]}));
 add(p,N('p253-energy','protected-figure',R(480,0,300,365),{parentId:'p253-climate',containerKind:'source-figure-with-label-anchors',anchors:{q33:R(0,0,250,70),q34:R(0,290,220,50),q35:R(170,170,170,130)}}));
 add(p,N('p253-plate-strip','source-strip',R(25,350,755,92),{parentId:'p253-climate',containerKind:'source-strip',contentRect:R(240,20,500,62)}));
 add(p,N('p253-cause','group',R(20,35,745,220),{parentId:'p253-ocean-motion'}));
 add(p,N('p253-large-wind','group',R(205,80,530,165),{parentId:'p253-cause'}));
 add(p,N('p253-three','group',R(20,230,745,435),{parentId:'p253-ocean-motion'}));
 add(p,N('p253-current','group',R(0,20,745,90),{parentId:'p253-three'}));
 add(p,N('p253-wave','group',R(0,110,745,170),{parentId:'p253-three'}));
 add(p,N('p253-nearshore','group',R(310,0,435,165),{parentId:'p253-wave'}));
 add(p,N('p253-tide','group',R(0,280,745,180),{parentId:'p253-three'}));
 own(p,'p253-climate-left',[27,28,31,32]); own(p,'p253-greenhouse-cloud',[29,30]); own(p,'p253-energy',[33,34,35]); own(p,'p253-plate-strip',[36]); own(p,'p253-cause',[37]); own(p,'p253-large-wind',[38,39,40]); own(p,'p253-current',[41,42]); own(p,'p253-nearshore',[43,44,45]); own(p,'p253-tide',[46,47,48,49,50]);
 window.v9SourceParentFor=function(page,n){return H[page]?.questionParents?.[n]||H[page]?.rootId||`p${page}`};
 window.v9SourceNode=function(page,id){return H[page]?.nodes?.[id]||null};
})();
