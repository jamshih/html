// Page 251 source-semantic chains: uplift, sinking air, pressure and wind forces.
const v5C5b=EARTH_SEMANTIC_MAPS.find(c=>c.number===5);
if(v5C5b){
 [['orographic-lift','地形抬升',70],['convective-lift','對流抬升',150],['frontal-lift','鋒面抬升',230],['convergence-lift','低壓輻合',310]].forEach(([id,label,x],i)=>{v5Micro(v5C5b,id,251,label,x,615,82,'#d4853e');v5Rel(v5C5b,`c5-src-uplift-${i+1}`,251,id,'air-rises','causes',`${label}會使空氣上升。`,'#d4853e');});
 v5Micro(v5C5b,'air-descends',251,'空氣下沉',330,620,92,'#d4853e');
 v5Micro(v5C5b,'adiabatic-compression',251,'絕熱壓縮',330,665,92,'#d4853e');
 v5Micro(v5C5b,'descending-warms',251,'增溫',330,710,70,'#d4853e');
 v5Rel(v5C5b,'c5-src-sink-1',251,'sinking-air','air-descends','contains','下沉分支由空氣向低處移動開始。','#d4853e');
 v5Rel(v5C5b,'c5-src-sink-2',251,'air-descends','adiabatic-compression','results-in','下沉時外界氣壓增加，使氣塊被壓縮。','#d4853e');
 v5Rel(v5C5b,'c5-src-sink-3',251,'adiabatic-compression','descending-warms','results-in','絕熱壓縮使氣塊溫度上升。','#d4853e');
 v5Micro(v5C5b,'gravity-air',251,'重力',60,865,62,'#d4853e');
 v5Micro(v5C5b,'air-near-surface',251,'空氣集中近地面',60,910,120,'#d4853e');
 v5Micro(v5C5b,'pressure-decreases-height',251,'高度↑ 氣壓↓',60,955,112,'#d4853e');
 v5Rel(v5C5b,'c5-src-pheight-1',251,'gravity-air','air-near-surface','causes','重力使大部分大氣質量集中在近地面。','#d4853e');
 v5Rel(v5C5b,'c5-src-pheight-2',251,'air-near-surface','pressure-decreases-height','results-in','上方空氣柱質量隨高度減少，因此氣壓隨高度下降。','#d4853e');
 v5Rel(v5C5b,'c5-src-pheight-3',251,'pressure-height','pressure-decreases-height','explains','氣壓隨高度下降源自上方空氣柱重量減少。','#d4853e');
 v5Micro(v5C5b,'friction-force',251,'摩擦力',610,360,78,'#5c9a6d');
 v5Rel(v5C5b,'c5-src-hwind-fric',251,'horizontal-motion','friction-force','depends-on','近地面水平風也受到摩擦力影響。','#5c9a6d');
 v5Micro(v5C5b,'close-isobars',251,'等壓線較密',500,590,95,'#5c9a6d');
 v5Micro(v5C5b,'larger-gradient',251,'梯度較大',500,635,82,'#5c9a6d');
 v5Micro(v5C5b,'faster-wind',251,'風速較快',500,680,82,'#5c9a6d');
 v5Rel(v5C5b,'c5-src-pgf-1',251,'close-isobars','larger-gradient','results-in','等壓線愈密代表單位距離氣壓差愈大。','#5c9a6d');
 v5Rel(v5C5b,'c5-src-pgf-2',251,'larger-gradient','pressure-gradient','increases','氣壓梯度愈大，氣壓梯度力愈大。','#5c9a6d');
 v5Rel(v5C5b,'c5-src-pgf-3',251,'pressure-gradient','faster-wind','increases','其他條件相近時，較大的氣壓梯度力對應較快風速。','#5c9a6d');
}
