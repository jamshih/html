// Final hierarchy normalization from the current NEW_SOURCE_TRUTH grids.
(function(){
 const H=window.SOURCE_HIERARCHY_V9;if(!H)return;
 const annual=H[246]?.nodes?.['p246-annual'];
 if(annual){annual.sourceRect.h=405;annual.safeRect.h=405;annual.contentRect.h=375;}
 const layers=H[250]?.nodes?.['p250-layers'];
 if(layers){layers.sourceRect.w=805;layers.safeRect.w=805;layers.contentRect.w=805;}
})();
