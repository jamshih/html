// Final hierarchy normalization from the current NEW_SOURCE_TRUTH grids.
(function(){
 const H=window.SOURCE_HIERARCHY_V9;if(!H)return;
 const annual=H[246]?.nodes?.['p246-annual'];
 if(annual){annual.sourceRect.h=415;annual.safeRect.h=415;annual.contentRect.h=390;}
 const insolation=H[247]?.nodes?.['p247-insolation'];
 if(insolation){insolation.sourceRect.y=770;insolation.sourceRect.h=440;insolation.safeRect.y=770;insolation.safeRect.h=440;insolation.contentRect.y=770;insolation.contentRect.h=440;}
 const layers=H[250]?.nodes?.['p250-layers'];
 if(layers){layers.sourceRect.w=805;layers.safeRect.w=805;layers.contentRect.w=805;layers.sourceRect.h=325;layers.safeRect.h=325;layers.contentRect.h=325;}
})();
