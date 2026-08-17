// GSAT Chemistry Page 4 — 氧化還原、酸鹼、速率與溶解平衡 (mandatory Vc only).
(function chemistryGsatPage4V8(){
  if(typeof CHEMISTRY_REFERENCE_PAGES==='undefined'||typeof CHEMISTRY_REFERENCE_TRACKS==='undefined')return;
  const PAGE={id:'gsat-04',track:'gsat',number:4,title:'氧化還原、酸鹼與平衡',theme:'#e56b16',theme2:'#d95d0b',curriculumCodes:['CJc-Vc-1','CJc-Vc-2','CJd-Vc-1','CJd-Vc-2','CJd-Vc-3','CJd-Vc-4','CJe-Vc-1','CJe-Vc-2'],clusters:[
    {id:'redox',number:1,title:'氧化還原與電子轉移',x:28,y:154,w:944,h:292,questions:[
      {n:1,prompt:'物質失去電子稱為 {{0}}；得到電子稱為 {{1}}。',fields:[{answer:'氧化',aliases:['氧化反應']},{answer:'還原',aliases:['還原反應']}]},
      {n:2,prompt:'氧化反應與還原反應必須 {{0}} 發生，因為電子不會憑空產生或消失。',fields:[{answer:'同時',aliases:['同時進行','一起']}]},
      {n:3,prompt:'使別人氧化、自己被還原的物質稱為 {{0}} 劑。',fields:[{answer:'氧化',aliases:['氧化劑']}]},
      {n:4,prompt:'使別人還原、自己被氧化的物質稱為 {{0}} 劑。',fields:[{answer:'還原',aliases:['還原劑']}]},
      {n:5,prompt:'判斷氧化還原可追蹤電子轉移，也可比較反應前後元素的 {{0}} 變化。',fields:[{answer:'氧化數',aliases:['氧化態','oxidation number']}]}
    ],figures:['electron-transfer','redox-pairs','oxidation-number']},
    {id:'acidbase',number:2,title:'酸、鹼與 pH',x:28,y:462,w:944,h:338,questions:[
      {n:6,prompt:'酸性水溶液中 {{0}} 濃度較高；鹼性水溶液中 {{1}} 濃度較高。',fields:[{answer:'H⁺',aliases:['H+','氫離子']},{answer:'OH⁻',aliases:['OH-','氫氧根離子']}]},
      {n:7,prompt:'25°C 下，中性水溶液的 pH 約為 {{0}}。',fields:[{answer:'7',aliases:['7.0','七']}]},
      {n:8,prompt:'pH 越小通常表示溶液酸性越 {{0}}；pH 越大則鹼性越明顯。',fields:[{answer:'強',aliases:['強烈','高']}]},
      {n:9,prompt:'酸與鹼反應生成鹽和水的反應稱為 {{0}} 反應。',fields:[{answer:'中和',aliases:['酸鹼中和','中和反應']}]},
      {n:10,prompt:'酸鹼指示劑會隨溶液的 {{0}} 範圍改變顏色，可用來粗略判斷酸鹼性。',fields:[{answer:'pH',aliases:['酸鹼度','pH值']}]},
      {n:11,prompt:'強酸與弱酸若濃度相同，強酸在水中通常有較高比例的分子 {{0}} 成離子。',fields:[{answer:'解離',aliases:['電離','游離']}]}
    ],figures:['ph-scale','acid-base-particles','neutralization','indicator-strip']},
    {id:'solubilityeq',number:3,title:'溶解、沉澱與動態平衡',x:28,y:816,w:944,h:272,questions:[
      {n:12,prompt:'飽和溶液中仍可同時發生溶解與結晶；當兩方向速率相等時形成 {{0}} 平衡。',fields:[{answer:'動態',aliases:['動態平衡']}]},
      {n:13,prompt:'固體溶質與其飽和溶液共存時，微觀粒子仍持續 {{0}}，但巨觀濃度保持穩定。',fields:[{answer:'交換',aliases:['進出溶液','溶解與結晶','動態交換']}]},
      {n:14,prompt:'兩種水溶液混合後若生成難溶固體，稱為 {{0}} 反應。',fields:[{answer:'沉澱',aliases:['沉澱反應']}]},
      {n:15,prompt:'沉澱形成可用來分離或鑑別離子；是否產生沉澱取決於離子組合及其 {{0}}。',fields:[{answer:'溶解度',aliases:['可溶性','溶解性']}]},
      {n:16,prompt:'達平衡時不是反應停止，而是正、逆方向的 {{0}} 相等。',fields:[{answer:'速率',aliases:['反應速率','速度']}]}
    ],figures:['dissolution-equilibrium','precipitation','equilibrium-rates']},
    {id:'rate',number:4,title:'反應速率與碰撞',x:28,y:1104,w:944,h:244,questions:[
      {n:17,prompt:'提高反應物濃度通常增加有效碰撞機會，使反應速率 {{0}}。',fields:[{answer:'加快',aliases:['增加','變快','提高']}]},
      {n:18,prompt:'固體反應物磨成粉末可增加 {{0}}，通常使反應更快。',fields:[{answer:'表面積',aliases:['接觸面積']}]},
      {n:19,prompt:'升高溫度通常使粒子運動更快，因此反應速率 {{0}}。',fields:[{answer:'加快',aliases:['增加','變快','提高']}]},
      {n:20,prompt:'催化劑能改變反應途徑、提高反應速率，但反應前後催化劑本身通常不被 {{0}}。',fields:[{answer:'消耗',aliases:['消耗掉','耗盡']}]},
      {n:21,prompt:'碰撞理論指出，粒子必須發生具有足夠能量與合適方向的 {{0}}，才容易形成產物。',fields:[{answer:'有效碰撞',aliases:['碰撞','有效的碰撞']}]}
    ],figures:['rate-factors','collision-model','catalyst-path']}
  ],figures:[
    {id:'electron-transfer',purpose:'以電子箭頭建立氧化與還原方向。'},{id:'redox-pairs',purpose:'比較氧化劑與還原劑角色。'},{id:'oxidation-number',purpose:'用氧化數升降判斷氧化還原。'},
    {id:'ph-scale',purpose:'視覺化酸、中性、鹼與 pH 方向。'},{id:'acid-base-particles',purpose:'用粒子模型比較酸性與鹼性。'},{id:'neutralization',purpose:'用 H+ 與 OH- 形成水說明中和。'},{id:'indicator-strip',purpose:'用顏色帶理解指示劑。'},
    {id:'dissolution-equilibrium',purpose:'固體與溶液間雙向交換。'},{id:'precipitation',purpose:'離子混合形成難溶固體。'},{id:'equilibrium-rates',purpose:'正逆速率相等而非停止。'},
    {id:'rate-factors',purpose:'比較濃度、表面積、溫度對速率。'},{id:'collision-model',purpose:'辨識有效與無效碰撞。'},{id:'catalyst-path',purpose:'催化途徑降低反應障礙的定性圖。'}
  ],equations:[],uncoveredItems:[]};
  CHEMISTRY_REFERENCE_PAGES[PAGE.id]=PAGE;const meta=CHEMISTRY_REFERENCE_TRACKS.gsat.pages.find(p=>p.id===PAGE.id);if(meta)meta.implemented=true;window.CHEMISTRY_GSAT_PAGE_4=PAGE;
  const oldFig=chemFig,ball=(x,y,r,c='a')=>`<circle cx="${x}" cy="${y}" r="${r}" class="atom ${c}"/>`;
  chemFig=function(id,mode){const r=mode==='learn';
    if(id==='electron-transfer')return chemSvg(`<g>${ball(72,82,24,'a')}${ball(248,82,24,'b')}<path d="M108 65C145 35 178 35 214 65" class="chem-arrow" marker-end="url(#chem-arr)"/><circle cx="160" cy="46" r="6" class="electron"/></g>${chemTxt(72,125,r?'失去 e⁻：氧化':'A','fig-small')}${chemTxt(248,125,r?'得到 e⁻：還原':'B','fig-small')}${chemTxt(160,18,r?'電子由還原劑轉移給氧化劑':'電子轉移','fig-title')}`);
    if(id==='redox-pairs')return chemSvg(`<g class="role"><rect x="26" y="45" width="112" height="88" rx="12"/><rect x="182" y="45" width="112" height="88" rx="12"/><path d="M138 89H182" class="chem-arrow" marker-end="url(#chem-arr)"/></g>${chemTxt(82,72,r?'還原劑':'角色 A','fig-title')}${chemTxt(82,104,r?'自己氧化':'自身變化','fig-small')}${chemTxt(238,72,r?'氧化劑':'角色 B','fig-title')}${chemTxt(238,104,r?'自己還原':'自身變化','fig-small')}`);
    if(id==='oxidation-number')return chemSvg(`<g><path d="M45 115H275" class="axisline"/><path d="M92 105V66M228 105V48" class="up-arrow" marker-end="url(#chem-arr)"/><path d="M160 55V100" class="down-arrow" marker-end="url(#chem-arr)"/></g>${chemTxt(92,132,r?'氧化數上升＝氧化':'A','fig-small')}${chemTxt(205,132,r?'氧化數下降＝還原':'B','fig-small')}`);
    if(id==='ph-scale')return chemSvg(`<g class="phbar"><rect x="25" y="62" width="270" height="30" rx="15"/><path d="M160 52V102" class="neutral-mark"/></g>${chemTxt(25,116,r?'0 強酸':'0','fig-small')}${chemTxt(160,116,r?'7 中性':'7','fig-small')}${chemTxt(295,116,r?'14 強鹼':'14','fig-small')}${chemTxt(160,24,r?'pH 由酸性 → 中性 → 鹼性':'pH 尺度','fig-title')}`);
    if(id==='acid-base-particles')return chemSvg(`<g><rect x="25" y="38" width="120" height="112" rx="10" class="solution-box"/><rect x="175" y="38" width="120" height="112" rx="10" class="solution-box"/>${[[50,65],[80,85],[110,65],[62,120],[112,120]].map(([x,y])=>ball(x,y,7,'a')).join('')}${[[202,70],[232,91],[265,68],[215,122],[267,119]].map(([x,y])=>ball(x,y,7,'b')).join('')}</g>${chemTxt(85,20,r?'H⁺ 較多':'A','fig-small')}${chemTxt(235,20,r?'OH⁻ 較多':'B','fig-small')}`);
    if(id==='neutralization')return chemSvg(`<g>${ball(72,82,18,'a')}${ball(145,82,18,'b')}<path d="M174 82H215" class="chem-arrow" marker-end="url(#chem-arr)"/><g transform="translate(225 57)">${ball(25,25,15,'b')}${ball(9,40,9,'a')}${ball(41,40,9,'a')}</g></g>${chemTxt(72,126,r?'H⁺':'A','fig-small')}${chemTxt(145,126,r?'OH⁻':'B','fig-small')}${chemTxt(252,126,r?'H₂O':'產物','fig-small')}`);
    if(id==='indicator-strip')return chemSvg(`<g class="indicator">${Array.from({length:7},(_,i)=>`<rect x="34" y="55" width="36" height="42" rx="4" class="ind i${i}" transform="translate(${i*36} 0)"/>`).join('')}</g>${chemTxt(160,25,r?'指示劑顏色隨 pH 範圍改變':'顏色帶','fig-title')}`);
    if(id==='dissolution-equilibrium')return chemSvg(`<g><rect x="42" y="35" width="236" height="118" rx="12" class="solution-box"/><path d="M58 132H262" class="solid-bed"/>${[[75,65],[113,89],[154,58],[198,89],[242,61]].map(([x,y],i)=>ball(x,y,7,i%2?'b':'a')).join('')}<path d="M102 119C112 94 122 88 132 78M205 78C218 91 224 103 229 119" class="eq-arrows" marker-end="url(#chem-arr)"/></g>${chemTxt(160,18,r?'溶解 ⇌ 結晶：雙向持續':'飽和溶液微觀模型','fig-title')}`);
    if(id==='precipitation')return chemSvg(`<g><rect x="25" y="38" width="96" height="105" rx="10" class="solution-box"/><rect x="199" y="38" width="96" height="105" rx="10" class="solution-box"/>${[[49,65],[78,92],[101,66]].map(([x,y],i)=>ball(x,y,7,i%2?'b':'a')).join('')}<path d="M132 90H188" class="chem-arrow" marker-end="url(#chem-arr)"/>${[[221,112],[242,119],[264,112],[231,130],[255,132]].map(([x,y],i)=>ball(x,y,7,i%2?'b':'a')).join('')}</g>${chemTxt(73,20,r?'可溶離子':'混合前','fig-small')}${chemTxt(247,20,r?'難溶沉澱':'混合後','fig-small')}`);
    if(id==='equilibrium-rates')return chemSvg(`<g><path d="M40 140H290M48 148V28" class="axes"/><path d="M52 120C95 70 122 60 168 62S238 62 276 62" class="curve red"/><path d="M52 30C95 76 122 64 168 62S238 62 276 62" class="curve blue"/><path d="M168 40V132" class="eqmark"/></g>${chemTxt(220,28,r?'正、逆速率相等':'兩條速率曲線重合','fig-small')}`);
    if(id==='rate-factors')return chemSvg(`<g class="ratecards"><rect x="12" y="42" width="92" height="98" rx="10"/><rect x="114" y="42" width="92" height="98" rx="10"/><rect x="216" y="42" width="92" height="98" rx="10"/>${[[33,70],[55,88],[77,66],[42,115],[82,115]].map(([x,y])=>ball(x,y,5,'a')).join('')}<rect x="140" y="72" width="15" height="15" class="solid"/><rect x="160" y="72" width="9" height="9" class="solid"/><rect x="174" y="72" width="7" height="7" class="solid"/><path d="M252 116V65M242 75q10-18 20 0" class="thermo"/></g>${chemTxt(58,25,r?'濃度↑':'A','fig-small')}${chemTxt(160,25,r?'表面積↑':'B','fig-small')}${chemTxt(262,25,r?'溫度↑':'C','fig-small')}`);
    if(id==='collision-model')return chemSvg(`<g>${ball(65,84,15,'a')}${ball(110,84,15,'b')}<path d="M82 84H93" class="chem-arrow"/><path d="M125 84H165" class="chem-arrow" marker-end="url(#chem-arr)"/>${ball(210,64,15,'a')}${ball(245,101,15,'b')}<path d="M224 76l8 10" class="miss"/></g>${chemTxt(88,130,r?'有效碰撞':'A','fig-small')}${chemTxt(230,130,r?'無效碰撞':'B','fig-small')}`);
    if(id==='catalyst-path')return chemSvg(`<g><path d="M40 140H290M48 148V25" class="axes"/><path d="M55 115C105 110 112 35 160 38S215 115 275 98" class="curve red"/><path d="M55 115C105 110 120 70 160 72S220 105 275 98" class="curve green"/></g>${chemTxt(160,18,r?'催化途徑：較低反應障礙':'兩條反應途徑','fig-title')}`);
    return oldFig(id,mode);
  };
  const oldCluster=chemClusterHtml;chemClusterHtml=function(page,c,mode){if(page?.id!==PAGE.id)return oldCluster(page,c,mode);return `<section class="chem-cluster chem4-${c.id}" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;--chem-accent:${page.theme}"><header><b>${c.number}</b><h3>${chemEsc(c.title)}</h3></header><div class="chem-cluster-body chem4-body"><div class="chem4-questions">${chemQuestions(page,c,mode)}</div><div class="chem4-figures chem4-figures-${c.figures.length}">${c.figures.map(id=>chemFigure(id,mode)).join('')}</div></div></section>`};
  const oldConnect=chemConnectorLayer;chemConnectorLayer=function(){const id=document.querySelector?.('.chem-paper')?.dataset?.chemPaper||state.chemistryPageId;if(id!==PAGE.id)return oldConnect();return `<svg class="chem-connectors" viewBox="0 0 1000 1414" aria-hidden="true"><defs><marker id="chem-page-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs><path d="M500 447V460"/><path d="M500 801V814"/><path d="M500 1089V1102"/></svg>`};
})();
