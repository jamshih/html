// Final data fixes after all chemistry page modules load.
(function(){
const figs=window.CHEM_V2_FIGURES||{};
figs['molarity-panel']={type:'flow',title:'濃度關係',a:['溶質 mol','溶液 L','M=n/V'],b:[]};
figs['surfactant-headtail']={type:'flow',title:'兩親性分子結構',a:['親水端','疏水端','油污/水相'],b:[]};
// Figure titles are cues, not answers. Keep nearby Recall blanks from being solved by the caption itself.
const saferTitles={
 'micelle':'去污聚集結構','polymer-chain':'聚合前後結構','acid-rain':'大氣污染成酸機制',
 'partial-pressure':'混合氣體壓力','orbital-shapes':'電子機率雲形狀','salt-hydrolysis':'鹽類與水反應',
 'indicator-range':'變色範圍','isomer':'相同分子式，不同連接'
};
Object.entries(saferTitles).forEach(([id,title])=>{if(figs[id])figs[id].title=title});
const p3=CHEMISTRY_REFERENCE_PAGES['gsat-03'];if(p3){const c=p3.clusters.find(x=>x.id==='solution');if(c&&!c.figures.includes('molarity-panel'))c.figures.push('molarity-panel');if(!p3.figures.some(x=>x.id==='molarity-panel'))p3.figures.push({id:'molarity-panel',purpose:'把溶質莫耳數、溶液體積與體積莫耳濃度放在同一關係圖。'});}
const p5=CHEMISTRY_REFERENCE_PAGES['gsat-05'];if(p5){const c=p5.clusters.find(x=>x.id==='surfactant');if(c&&!c.figures.includes('surfactant-headtail'))c.figures.push('surfactant-headtail');if(!p5.figures.some(x=>x.id==='surfactant-headtail'))p5.figures.push({id:'surfactant-headtail',purpose:'以兩親性結構連接親水端、疏水端與去污機制。'});}
const p1=CHEMISTRY_REFERENCE_PAGES['gsat-01'];if(p1&&!p1.curriculumItems)p1.curriculumItems=['元素概念','拉瓦節','質量守恆','定比定律','倍比定律','道耳頓原子說','原子','分子','離子','同位素','原子序','質量數','純物質與混合物','元素與化合物','金屬類金屬非金屬','離子與分子化合物','三態與三相圖'];
// Two diagrams need structural labels in Learn mode but neutral directional labels in Recall mode.
const prevFig=chemFig;
chemFig=function(id,mode){
 const reveal=mode==='learn';
 if(id==='ozone')return chemSvg(`<g class="chem-v2-fig"><text x="56" y="55" class="mid">${reveal?'UV':'高能光'}</text><path d="M80 60L132 84" class="arrow" marker-end="url(#chem-arr)"/><text x="160" y="84" class="mid">O₃</text><path d="M188 84L248 62" class="arrow" marker-end="url(#chem-arr)"/><text x="265" y="62" class="mid">O₂</text><text x="160" y="130" class="tiny">${reveal?'自由基可催化耗損 O₃':'循環反應'}</text><text x="160" y="18" class="title">臭氧層耗損</text></g>`,'0 0 320 180','chem-v2-svg');
 if(id==='saltbridge')return chemSvg(`<g class="chem-v2-fig"><rect x="30" y="60" width="100" height="90" rx="10" class="cell"/><rect x="190" y="60" width="100" height="90" rx="10" class="cell"/><path d="M170 85L115 85" class="arrow" marker-end="url(#chem-arr)"/><path d="M150 120L205 120" class="arrow" marker-end="url(#chem-arr)"/><text x="70" y="42" class="small">${reveal?'陽極槽':'左槽'}</text><text x="250" y="42" class="small">${reveal?'陰極槽':'右槽'}</text><text x="160" y="78" class="tiny">${reveal?'陰離子 → 左':'陰離子 → 左'}</text><text x="160" y="132" class="tiny">${reveal?'陽離子 → 右':'陽離子 → 右'}</text><text x="160" y="18" class="title">鹽橋離子移動</text></g>`,'0 0 320 180','chem-v2-svg');
 return prevFig(id,mode);
};
})();
