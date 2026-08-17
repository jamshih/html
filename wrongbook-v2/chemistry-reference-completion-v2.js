// Final data fixes after all chemistry page modules load.
(function(){
const figs=window.CHEM_V2_FIGURES||{};
// Extra diagrams keep the reference-photo pages genuinely visual instead of becoming text-heavy boxes.
Object.assign(figs,{
 'molarity-panel':{type:'flow',title:'濃度關係',a:['溶質 mol','溶液 L','M=n/V'],b:[]},
 'surfactant-headtail':{type:'flow',title:'兩親性分子結構',a:['親水端','疏水端','油污/水相'],b:[]},
 'coefficient-balance':{type:'flow',title:'配平前後原子盤點',a:['反應物原子數','調整係數','生成物原子數'],b:[]},
 'avogadro-scale':{type:'flow',title:'微觀粒子到莫耳尺度',a:['單一粒子','6.02×10²³','1 mol'],b:[]},
 'yield-panel':{type:'flow',title:'產量比較',a:['理論產量','實際產量','百分產率'],b:[]},
 'redox-agent':{type:'flow',title:'電子供受關係',a:['電子提供者','電子轉移','電子接受者'],b:[]},
 'neutralization-particles':{type:'flow',title:'水溶液粒子反應',a:['酸性粒子','反應','鹼性粒子'],b:[]},
 'esterification-basic':{type:'flow',title:'含氧有機物轉換',a:['羧酸','＋醇','酯＋水'],b:[]},
 'phospholipid':{type:'flow',title:'兩親性脂質結構',a:['親水端','分子骨架','疏水端'],b:[]},
 'recycling-material':{type:'cycle',title:'材料生命循環',a:['原料','製品','回收','再利用'],b:[]},
 'water-cycle':{type:'cycle',title:'水在地球系統中的移動',a:['蒸發','凝結','降水','逕流'],b:[]},
 'life-cycle':{type:'cycle',title:'產品生命週期',a:['原料','製造','使用','回收/處理'],b:[]}
});
// Figure titles are cues, not answers. Keep nearby Recall blanks from being solved by the caption itself.
const saferTitles={
 'micelle':'去污聚集結構','polymer-chain':'聚合前後結構','acid-rain':'大氣污染成酸機制',
 'partial-pressure':'混合氣體壓力','orbital-shapes':'電子機率雲形狀','salt-hydrolysis':'鹽類與水反應',
 'indicator-range':'變色範圍','isomer':'相同分子式，不同連接','solubility-curve':'溫度－最大溶解量關係',
 'activation-basic':'反應能障比較','activation-advanced':'反應能障與途徑'
};
Object.entries(saferTitles).forEach(([id,title])=>{if(figs[id])figs[id].title=title});
function addFig(pageId,clusterId,id,purpose){const p=CHEMISTRY_REFERENCE_PAGES[pageId];if(!p)return;const c=p.clusters.find(x=>x.id===clusterId);if(c&&!c.figures.includes(id))c.figures.push(id);if(!p.figures.some(x=>x.id===id))p.figures.push({id,purpose})}
addFig('gsat-03','solution','molarity-panel','把溶質莫耳數、溶液體積與體積莫耳濃度放在同一關係圖。');
addFig('gsat-03','equations','coefficient-balance','以反應前後原子盤點說明只能改係數、不能改化學式下標。');
addFig('gsat-03','mole','avogadro-scale','把單一粒子、阿伏加厥常數與 1 mol 的尺度關係視覺化。');
addFig('gsat-03','stoichiometry','yield-panel','把理論產量、實際產量與百分產率放在同一比較圖。');
addFig('gsat-04','redox','redox-agent','以電子供受角色連接氧化劑、還原劑與電子轉移。');
addFig('gsat-04','acidbase','neutralization-particles','以粒子層級呈現酸鹼反應前後的關係。');
addFig('gsat-05','surfactant','surfactant-headtail','以兩親性結構連接親水端、疏水端與去污機制。');
addFig('gsat-05','organic','esterification-basic','以簡化反應路徑連接羧酸、醇、酯與水。');
addFig('gsat-05','biomolecule','phospholipid','以兩親性脂質示意連接生物分子結構與性質。');
addFig('gsat-05','polymer','recycling-material','把材料的使用、回收與再利用畫成循環。');
addFig('gsat-06','cycles','water-cycle','以蒸發、凝結、降水與逕流呈現水循環。');
addFig('gsat-06','sustainable','life-cycle','以原料到回收的完整生命週期支撐永續判斷。');
const p1=CHEMISTRY_REFERENCE_PAGES['gsat-01'];if(p1&&!p1.curriculumItems)p1.curriculumItems=['元素概念','拉瓦節','質量守恆','定比定律','倍比定律','道耳頓原子說','原子','分子','離子','同位素','原子序','質量數','純物質與混合物','元素與化合物','金屬類金屬非金屬','離子與分子化合物','三態與三相圖'];
// A few diagrams need structural labels in Learn mode but neutral directional labels in Recall mode.
const prevFig=chemFig;
chemFig=function(id,mode){
 const reveal=mode==='learn';
 if(id==='ozone')return chemSvg(`<g class="chem-v2-fig"><text x="56" y="55" class="mid">${reveal?'UV':'高能光'}</text><path d="M80 60L132 84" class="arrow" marker-end="url(#chem-arr)"/><text x="160" y="84" class="mid">O₃</text><path d="M188 84L248 62" class="arrow" marker-end="url(#chem-arr)"/><text x="265" y="62" class="mid">O₂</text><text x="160" y="130" class="tiny">${reveal?'自由基可催化耗損 O₃':'循環反應'}</text><text x="160" y="18" class="title">臭氧層耗損</text></g>`,'0 0 320 180','chem-v2-svg');
 if(id==='saltbridge')return chemSvg(`<g class="chem-v2-fig"><rect x="30" y="60" width="100" height="90" rx="10" class="cell"/><rect x="190" y="60" width="100" height="90" rx="10" class="cell"/><path d="M170 85L115 85" class="arrow" marker-end="url(#chem-arr)"/><path d="M150 120L205 120" class="arrow" marker-end="url(#chem-arr)"/><text x="70" y="42" class="small">${reveal?'陽極槽':'左槽'}</text><text x="250" y="42" class="small">${reveal?'陰極槽':'右槽'}</text><text x="160" y="78" class="tiny">陰離子 → 左</text><text x="160" y="132" class="tiny">陽離子 → 右</text><text x="160" y="18" class="title">鹽橋離子移動</text></g>`,'0 0 320 180','chem-v2-svg');
 if(id==='ksp')return chemSvg(`<g class="chem-v2-fig"><text x="75" y="86" class="mid">MX(s)</text><path d="M110 86L190 86" class="arrow" marker-end="url(#chem-arr)"/><text x="230" y="68" class="mid">M⁺</text><text x="230" y="105" class="mid">X⁻</text><text x="160" y="145" class="small">${reveal?'Ksp=[M⁺][X⁻]':'K = ＿＿＿＿'}</text><text x="160" y="20" class="title">難溶鹽的溶解平衡</text></g>`,'0 0 320 180','chem-v2-svg');
 return prevFig(id,mode);
};
})();
