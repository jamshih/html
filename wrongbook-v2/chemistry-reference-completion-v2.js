// Final data fixes after all chemistry page modules load.
(function(){
const figs=window.CHEM_V2_FIGURES||{};
figs['molarity-panel']={type:'flow',title:'濃度關係',a:['溶質 mol','溶液 L','M=n/V'],b:[]};
figs['surfactant-headtail']={type:'flow',title:'界面活性劑結構',a:['親水端','疏水端','油污/水相'],b:[]};
const p3=CHEMISTRY_REFERENCE_PAGES['gsat-03'];if(p3){const c=p3.clusters.find(x=>x.id==='solution');if(c&&!c.figures.includes('molarity-panel'))c.figures.push('molarity-panel');if(!p3.figures.some(x=>x.id==='molarity-panel'))p3.figures.push({id:'molarity-panel',purpose:'把溶質莫耳數、溶液體積與體積莫耳濃度放在同一關係圖。'});}
const p5=CHEMISTRY_REFERENCE_PAGES['gsat-05'];if(p5){const c=p5.clusters.find(x=>x.id==='surfactant');if(c&&!c.figures.includes('surfactant-headtail'))c.figures.push('surfactant-headtail');if(!p5.figures.some(x=>x.id==='surfactant-headtail'))p5.figures.push({id:'surfactant-headtail',purpose:'以兩親性結構連接親水端、疏水端與去污機制。'});}
const p1=CHEMISTRY_REFERENCE_PAGES['gsat-01'];if(p1&&!p1.curriculumItems)p1.curriculumItems=['元素概念','拉瓦節','質量守恆','定比定律','倍比定律','道耳頓原子說','原子','分子','離子','同位素','原子序','質量數','純物質與混合物','元素與化合物','金屬類金屬非金屬','離子與分子化合物','三態與三相圖'];
})();
