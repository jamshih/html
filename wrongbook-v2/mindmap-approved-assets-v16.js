// Approved illustrated mind-map assets and their semantic owners.
// These files are supplied production assets. Keep them separate from text,
// native diagrams, connectors, and interaction state.
(function(){
  const ROOT='./assets/mindmaps';
  const rows={
    earth:[
      ['earth-science-01__earth-globe','地球水彩插圖','earth:1:solar-system'],
      ['earth-science-01__main-sequence-star','主序星插圖','earth:1:star-properties'],
      ['earth-science-01__red-giant','紅巨星插圖','earth:1:star-properties'],
      ['earth-science-01__solar-system-disk','太陽系星雲盤插圖','earth:1:solar-system'],
      ['earth-science-01__spiral-galaxy','螺旋星系插圖','earth:1:cosmos'],
      ['earth-science-01__star-cloud','恆星形成星雲插圖','earth:1:star-properties'],
      ['earth-science-01__white-dwarf','白矮星插圖','earth:1:star-properties'],
      ['earth-science-02__star-sparkles','星空亮點插圖','earth:2:annual-motion'],
      ['earth-science-02__telescope','天文望遠鏡插圖','earth:2:rotation'],
      ['earth-science-03__planetesimal','微行星聚合插圖','earth:3:solar-nebula'],
      ['earth-science-04__seismograph','地震儀插圖','earth:4:earthquake'],
      ['earth-science-05__sun','太陽插圖','earth:5:protection']
    ],
    chemistry:[
      ['chemistry-01__diatomic-molecule','雙原子分子模型插圖','chemistry:gsat-01:laws'],
      ['chemistry-02__bohr-atom-a','波耳原子模型甲','chemistry:elec-structure-rate:atomic-model'],
      ['chemistry-02__bohr-atom-b','波耳原子模型乙','chemistry:elec-structure-rate:atomic-model'],
      ['chemistry-02__bohr-atom-c','波耳原子模型丙','chemistry:elec-structure-rate:atomic-model'],
      ['chemistry-03__conductivity-beaker','水溶液導電實驗插圖','chemistry:gsat-03:solution'],
      ['chemistry-03__solution-beaker','水溶液燒杯插圖','chemistry:gsat-03:solution'],
      ['chemistry-04__molecular-sample-a','反應前粒子樣本插圖','chemistry:gsat-03:equations'],
      ['chemistry-04__molecular-sample-b','反應後粒子樣本插圖','chemistry:gsat-03:equations'],
      ['chemistry-05__blue-flask','藍色溶液燒瓶插圖','chemistry:gsat-02:separation'],
      ['chemistry-05__filter-funnel','過濾漏斗插圖','chemistry:gsat-02:separation'],
      ['chemistry-05__heated-beaker','加熱燒杯插圖','chemistry:gsat-02:separation'],
      ['chemistry-05__separatory-funnel','分液漏斗插圖','chemistry:gsat-02:separation'],
      ['chemistry-06__blue-test-tube','藍色試管插圖','chemistry:gsat-04:acidbase'],
      ['chemistry-06__pink-test-tube','粉紅試管插圖','chemistry:gsat-04:acidbase'],
      ['chemistry-06__purple-test-tube','紫色試管插圖','chemistry:gsat-04:acidbase'],
      ['chemistry-07__erlenmeyer-flask','錐形瓶插圖','chemistry:elec-equilibrium-2:titration-buffer'],
      ['chemistry-07__indicator-bowl','天然指示劑研磨皿插圖','chemistry:elec-equilibrium-2:indicator-commonion'],
      ['chemistry-07__purple-flask','紫色指示劑燒瓶插圖','chemistry:elec-equilibrium-2:indicator-commonion'],
      ['chemistry-07__reagent-bottle','試藥瓶插圖','chemistry:elec-equilibrium-2:titration-buffer'],
      ['chemistry-07__tomato','番茄天然酸鹼指示素材插圖','chemistry:elec-equilibrium-2:indicator-commonion'],
      ['chemistry-07__water-drop','水滴插圖','chemistry:elec-equilibrium-1:acid-equilibrium'],
      ['chemistry-10__atom-symbol','原子科技符號插圖','chemistry:elec-organic-tech:advanced-tech'],
      ['chemistry-10__bone-and-screw','生醫材料插圖','chemistry:elec-organic-tech:polymer-material'],
      ['chemistry-10__ceramic-tile','陶瓷材料插圖','chemistry:elec-organic-tech:polymer-material'],
      ['chemistry-10__display-panel','液晶顯示材料插圖','chemistry:elec-organic-tech:polymer-material'],
      ['chemistry-10__eutrophic-pond','優養化水體插圖','chemistry:gsat-06:water'],
      ['chemistry-10__factory','工業排放插圖','chemistry:gsat-06:air'],
      ['chemistry-10__hydrogen-molecules','氫能分子插圖','chemistry:elec-organic-tech:advanced-tech'],
      ['chemistry-10__ozone-layer','臭氧層插圖','chemistry:gsat-06:air'],
      ['chemistry-10__rain-cloud','酸雨雲層插圖','chemistry:gsat-06:air'],
      ['chemistry-10__recycle-symbol','資源循環插圖','chemistry:gsat-06:sustainable']
    ],
    biology:[
      ['biology-03__heated-beaker','加熱燒杯實驗插圖','biology:bio-enzyme:enzyme'],
      ['biology-03__rubber-dropper-bulb','滴管膠頭插圖','biology:bio-enzyme:enzyme'],
      ['biology-04__eye','眼睛表現型插圖','biology:bio-mendel:terms'],
      ['biology-05__dna-double-helix','DNA 雙股螺旋插圖','biology:bio-molecular:dna'],
      ['biology-05__filter-funnel','生物技術過濾漏斗插圖','biology:bio-biotech:tools'],
      ['biology-05__mixing-beaker','混合燒杯插圖','biology:bio-biotech:tools'],
      ['biology-05__pellet-test-tube','沉澱試管插圖','biology:bio-biotech:tools'],
      ['biology-05__reaction-test-tube','反應試管插圖','biology:bio-biotech:tools'],
      ['biology-06__brown-finch-head','褐色雀鳥喙型插圖','biology:bio-evolution:evolution'],
      ['biology-06__cecum','盲腸比較構造插圖','biology:bio-evolution:classification'],
      ['biology-06__dark-finch-head','深色雀鳥喙型插圖','biology:bio-evolution:evolution'],
      ['biology-06__fin-skeleton','鰭骨同源構造插圖','biology:bio-evolution:classification'],
      ['biology-06__foot-bones','足部骨骼同源構造插圖','biology:bio-evolution:classification'],
      ['biology-06__forelimb-bones','前肢骨骼同源構造插圖','biology:bio-evolution:classification'],
      ['biology-06__wing-skeleton','翼骨同源構造插圖','biology:bio-evolution:classification'],
      ['biology-07__bagged-plant','套袋蒸散實驗插圖','biology:bio-plant:transport'],
      ['biology-07__chloroplast','葉綠體插圖','biology:bio-photo:light'],
      ['biology-07__closed-stoma','閉合氣孔插圖','biology:bio-plant:transport'],
      ['biology-07__root-system','植物根系插圖','biology:bio-plant:transport'],
      ['biology-07__root-tip','根尖插圖','biology:bio-plant:transport'],
      ['biology-07__transpiration-plant','蒸散作用植物插圖','biology:bio-plant:transport'],
      ['biology-07__wilted-seedling','萎凋幼苗插圖','biology:bio-plant:regulation'],
      ['biology-08__human-organ-systems','人體器官系統插圖','biology:bio-animal:systems'],
      ['biology-08__reflex-hammer','反射槌插圖','biology:bio-animal:systems'],
      ['biology-09__butterfly','成蝶生命史插圖','biology:inventory:reproduction-life-cycle'],
      ['biology-09__caterpillar','幼蟲生命史插圖','biology:inventory:reproduction-life-cycle'],
      ['biology-09__embryo','胚胎發育插圖','biology:inventory:reproduction-development'],
      ['biology-09__flower-cross-section','花朵生殖構造插圖','biology:inventory:plant-reproduction'],
      ['biology-09__morula','桑椹胚插圖','biology:inventory:reproduction-development'],
      ['biology-09__ovum','卵細胞插圖','biology:inventory:reproduction-development'],
      ['biology-09__pupa','蛹期生命史插圖','biology:inventory:reproduction-life-cycle'],
      ['biology-10__mountain-stream-ecosystem','山澗生態系插圖','biology:bio-ecology:ecosystem'],
      ['biology-10__rabbit','兔族群插圖','biology:bio-ecology:population']
    ]
  };

  const registry={};
  Object.entries(rows).forEach(([subject,items])=>items.forEach(([id,alt,owner])=>{
    registry[id]={id,subject,alt,owner,file:`${ROOT}/${subject}/${id}.webp`};
  }));

  const placements={
    biology:{
      'bio-enzyme:enzyme':['biology-03__heated-beaker','biology-03__rubber-dropper-bulb'],
      'bio-photo:light':['biology-07__chloroplast'],
      'bio-mendel:terms':['biology-04__eye'],
      'bio-molecular:dna':['biology-05__dna-double-helix'],
      'bio-biotech:tools':['biology-05__filter-funnel','biology-05__mixing-beaker','biology-05__pellet-test-tube','biology-05__reaction-test-tube'],
      'bio-evolution:evolution':['biology-06__brown-finch-head','biology-06__dark-finch-head'],
      'bio-evolution:classification':['biology-06__cecum','biology-06__fin-skeleton','biology-06__foot-bones','biology-06__forelimb-bones','biology-06__wing-skeleton'],
      'bio-plant:transport':['biology-07__bagged-plant','biology-07__closed-stoma','biology-07__root-system','biology-07__root-tip','biology-07__transpiration-plant'],
      'bio-plant:regulation':['biology-07__wilted-seedling'],
      'bio-animal:systems':['biology-08__human-organ-systems','biology-08__reflex-hammer'],
      'bio-ecology:population':['biology-10__rabbit'],
      'bio-ecology:ecosystem':['biology-10__mountain-stream-ecosystem']
    },
    chemistry:{
      'gsat-01:laws':['chemistry-01__diatomic-molecule'],
      'gsat-02:separation':['chemistry-05__blue-flask','chemistry-05__filter-funnel','chemistry-05__heated-beaker','chemistry-05__separatory-funnel'],
      'gsat-03:equations':['chemistry-04__molecular-sample-a','chemistry-04__molecular-sample-b'],
      'gsat-03:solution':['chemistry-03__conductivity-beaker','chemistry-03__solution-beaker'],
      'gsat-04:acidbase':['chemistry-06__blue-test-tube','chemistry-06__pink-test-tube','chemistry-06__purple-test-tube'],
      'gsat-06:water':['chemistry-10__eutrophic-pond'],
      'gsat-06:air':['chemistry-10__factory','chemistry-10__ozone-layer','chemistry-10__rain-cloud'],
      'gsat-06:sustainable':['chemistry-10__recycle-symbol'],
      'elec-structure-rate:atomic-model':['chemistry-02__bohr-atom-a','chemistry-02__bohr-atom-b','chemistry-02__bohr-atom-c'],
      'elec-equilibrium-1:acid-equilibrium':['chemistry-07__water-drop'],
      'elec-equilibrium-2:titration-buffer':['chemistry-07__erlenmeyer-flask','chemistry-07__reagent-bottle'],
      'elec-equilibrium-2:indicator-commonion':['chemistry-07__indicator-bowl','chemistry-07__purple-flask','chemistry-07__tomato'],
      'elec-organic-tech:polymer-material':['chemistry-10__bone-and-screw','chemistry-10__ceramic-tile','chemistry-10__display-panel'],
      'elec-organic-tech:advanced-tech':['chemistry-10__atom-symbol','chemistry-10__hydrogen-molecules']
    },
    earth:{
      '1:star-properties':['earth-science-01__star-cloud','earth-science-01__main-sequence-star','earth-science-01__red-giant','earth-science-01__white-dwarf'],
      '1:solar-system':['earth-science-01__solar-system-disk','earth-science-01__earth-globe'],
      '1:cosmos':['earth-science-01__spiral-galaxy'],
      '2:rotation':['earth-science-02__telescope'],
      '2:annual-motion':['earth-science-02__star-sparkles'],
      '3:solar-nebula':['earth-science-03__planetesimal'],
      '4:earthquake':['earth-science-04__seismograph'],
      '5:protection':['earth-science-05__sun']
    }
  };

  function ids(subject,chapterId,sectionId){
    return placements[subject]?.[`${chapterId}:${sectionId}`]||[];
  }
  function asset(id){return registry[id]||null}
  function html(assetIds,{className='mindmap-asset-group',label='概念插圖'}={}){
    const values=(assetIds||[]).map(asset).filter(Boolean);
    if(!values.length)return'';
    return `<div class="${className}" role="group" aria-label="${escapeAttr(label)}">${values.map(value=>`<figure class="mindmap-asset" data-mindmap-asset="${escapeAttr(value.id)}" data-asset-owner="${escapeAttr(value.owner)}"><img src="${escapeAttr(value.file)}" alt="${escapeAttr(value.alt)}" loading="lazy" decoding="async"></figure>`).join('')}</div>`;
  }
  function escapeAttr(value=''){
    return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  }

  window.MINDMAP_APPROVED_ASSETS=Object.freeze(registry);
  window.MINDMAP_ASSET_PLACEMENTS=Object.freeze(placements);
  window.mindmapApprovedAssetIds=ids;
  window.mindmapApprovedAssetHtml=html;
})();
