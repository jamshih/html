// GSAT Chemistry Page 3 — 反應式、莫耳與水溶液 (mandatory Vc only).
(function chemistryGsatPage3V6(){
  if(typeof CHEMISTRY_REFERENCE_PAGES==='undefined'||typeof CHEMISTRY_REFERENCE_TRACKS==='undefined')return;
  const PAGE={
    id:'gsat-03',track:'gsat',number:3,title:'反應式、莫耳與水溶液',theme:'#278846',theme2:'#20885a',
    curriculumCodes:['CJa-Vc-1','CJa-Vc-2','CJa-Vc-3','CJb-Vc-1','CJb-Vc-2','CJb-Vc-3'],
    clusters:[
      {id:'reaction',number:1,title:'化學反應式與守恆',x:28,y:154,w:944,h:282,questions:[
        {n:1,prompt:'化學反應式用化學式表示反應物與產物；配平時只能調整化學式前的 {{0}}，不能任意改變下標。',fields:[{answer:'係數',aliases:['化學計量係數','係數值']}]},
        {n:2,prompt:'配平反應式的核心是使反應前後各元素的 {{0}} 數相同，符合原子守恆。',fields:[{answer:'原子',aliases:['原子個數','原子數']}]},
        {n:3,prompt:'在封閉系統中，化學反應前後總 {{0}} 保持不變。',fields:[{answer:'質量',aliases:['總質量']}]},
        {n:4,prompt:'反應式係數表示粒子數或莫耳數的 {{0}} 比，而不是各物質質量比。',fields:[{answer:'最簡整數',aliases:['整數','簡單整數']}]},
        {n:5,prompt:'例如 2H₂＋O₂→2H₂O，H₂：O₂：H₂O 的莫耳比為 {{0}}：{{1}}：{{2}}。',fields:[{answer:'2',aliases:['二']},{answer:'1',aliases:['一']},{answer:'2',aliases:['二']}]}
      ],figures:['rxn-particles','coefficient-ratio','mass-conservation-rxn']},
      {id:'mole',number:2,title:'莫耳、粒子數與莫耳質量',x:28,y:452,w:944,h:310,questions:[
        {n:6,prompt:'1 莫耳代表固定數目的基本粒子，約為 {{0}}×10²³ 個。',fields:[{answer:'6.02',aliases:['6.022','6.0','6.02×10^23','6.022×10^23']}]},
        {n:7,prompt:'物質的粒子數 N 與莫耳數 n 的關係為 N＝n×{{0}}。',fields:[{answer:'亞佛加厥常數',aliases:['Avogadro constant','阿伏加德羅常數','NA','N_A']}]},
        {n:8,prompt:'莫耳質量是每莫耳物質的質量，常用單位為 {{0}}。',fields:[{answer:'g/mol',aliases:['g mol-1','g mol⁻¹','克/莫耳','克每莫耳']}]},
        {n:9,prompt:'若物質質量為 m、莫耳質量為 M，莫耳數 n＝{{0}}。',fields:[{answer:'m/M',aliases:['m÷M','m / M']}]},
        {n:10,prompt:'化學式中各原子的相對原子質量依下標加總，可得到該物質的 {{0}}，並據此求莫耳質量。',fields:[{answer:'式量',aliases:['分子量','相對分子質量','化學式量']}]},
        {n:11,prompt:'利用「質量 ↔ {{0}} ↔ 粒子數」的轉換，可把反應式係數連到實際可量測的質量。',fields:[{answer:'莫耳數',aliases:['莫耳','mole']}]}
      ],figures:['mole-map','avogadro-box','molar-mass']},
      {id:'solution',number:3,title:'溶液、濃度與溶解度',x:28,y:778,w:944,h:354,questions:[
        {n:12,prompt:'溶液是均勻混合物；被溶解的物質稱為 {{0}}，主要負責溶解的成分稱為 {{1}}。',fields:[{answer:'溶質',aliases:['solute']},{answer:'溶劑',aliases:['solvent']}]},
        {n:13,prompt:'在一定溫度下，已達可溶解最大量的溶液稱為 {{0}} 溶液。',fields:[{answer:'飽和',aliases:['飽和溶液']}]},
        {n:14,prompt:'莫耳濃度 M＝溶質莫耳數 n ÷ 溶液體積 V；V 應以 {{0}} 為單位。',fields:[{answer:'L',aliases:['公升','liter','litre']}]},
        {n:15,prompt:'加水稀釋時溶質的 {{0}} 不變，但溶液體積增加，所以莫耳濃度下降。',fields:[{answer:'莫耳數',aliases:['物質的量','n']}]},
        {n:16,prompt:'同一溶質的溶解度會受溫度影響；讀溶解度曲線時必須同時確認 {{0}} 與可溶解量。',fields:[{answer:'溫度',aliases:['temperature']}]},
        {n:17,prompt:'多數固體在水中的溶解度隨溫度上升而增加，但不同物質的趨勢 {{0}}。',fields:[{answer:'不一定相同',aliases:['不同','不相同','不一定']}]}
      ],figures:['solute-solvent','saturation','molarity','dilution','solubility-curve']},
      {id:'calc',number:4,title:'由反應式做基本定量推理',x:28,y:1148,w:944,h:200,questions:[
        {n:18,prompt:'定量計算先把已知量轉成 {{0}}，再用反應式係數比找出未知物的莫耳數。',fields:[{answer:'莫耳數',aliases:['莫耳','mole']}]},
        {n:19,prompt:'若題目最後要求質量，應再用 m＝n×{{0}} 轉回質量。',fields:[{answer:'莫耳質量',aliases:['M','molar mass']}]},
        {n:20,prompt:'若實際加入的兩種反應物不完全符合係數比，能先被用完而限制產物量的是 {{0}} 反應物。',fields:[{answer:'限量',aliases:['限量反應物','限制反應物','limiting reagent']}]},
        {n:21,prompt:'檢查答案時要同時確認反應式已配平、單位一致，且結果符合 {{0}} 與原子守恆。',fields:[{answer:'質量守恆',aliases:['質量守恆定律']}]}
      ],figures:['stoich-flow','limiting-particles']}
    ],
    figures:[
      {id:'rxn-particles',purpose:'粒子圖驗證原子數守恆。'},{id:'coefficient-ratio',purpose:'由配平係數讀莫耳比。'},{id:'mass-conservation-rxn',purpose:'連接反應式與封閉系統質量守恆。'},
      {id:'mole-map',purpose:'質量、莫耳與粒子數轉換。'},{id:'avogadro-box',purpose:'一莫耳對應固定粒子數。'},{id:'molar-mass',purpose:'由化學式組成理解莫耳質量。'},
      {id:'solute-solvent',purpose:'微觀呈現溶質分散於溶劑。'},{id:'saturation',purpose:'比較未飽和與飽和溶液。'},{id:'molarity',purpose:'莫耳數/體積的濃度概念。'},{id:'dilution',purpose:'稀釋時溶質量不變、體積增大。'},{id:'solubility-curve',purpose:'練習讀取溶解度與溫度關係。'},
      {id:'stoich-flow',purpose:'反應定量的步驟流程。'},{id:'limiting-particles',purpose:'用粒子數比較限量反應物。'}
    ],equations:['N=nNₐ','n=m/M','M=n/V','m=nM'],uncoveredItems:[]
  };
  CHEMISTRY_REFERENCE_PAGES[PAGE.id]=PAGE;const meta=CHEMISTRY_REFERENCE_TRACKS.gsat.pages.find(p=>p.id===PAGE.id);if(meta)meta.implemented=true;window.CHEMISTRY_GSAT_PAGE_3=PAGE;

  const oldFig=chemFig;
  const circ=(x,y,r,c='a')=>`<circle cx="${x}" cy="${y}" r="${r}" class="atom ${c}"/>`;
  chemFig=function(id,mode){const r=mode==='learn';
    if(id==='rxn-particles')return chemSvg(`<g>${circ(47,72,9,'a')}${circ(65,72,9,'a')}${circ(47,104,9,'a')}${circ(65,104,9,'a')}${circ(113,88,11,'b')}<path d="M140 88H182" class="chem-arrow" marker-end="url(#chem-arr)"/>${circ(215,72,9,'a')}${circ(233,72,9,'a')}${circ(224,88,11,'b')}${circ(215,110,9,'a')}${circ(233,110,9,'a')}${circ(224,94,11,'b')}</g>${chemTxt(160,20,r?'2H₂ + O₂ → 2H₂O':'反應前後粒子比較','fig-title')}${chemTxt(82,145,r?'H：4；O：2':'反應物','fig-small')}${chemTxt(235,145,r?'H：4；O：2':'產物','fig-small')}`);
    if(id==='coefficient-ratio')return chemSvg(`<g class="ratio"><rect x="26" y="50" width="72" height="70" rx="12"/><rect x="124" y="50" width="72" height="70" rx="12"/><rect x="222" y="50" width="72" height="70" rx="12"/><path d="M98 85H124M196 85H222" class="chem-arrow"/></g>${chemTxt(62,76,r?'2 H₂':'A','fig-title')}${chemTxt(160,76,r?'1 O₂':'B','fig-title')}${chemTxt(258,76,r?'2 H₂O':'C','fig-title')}${chemTxt(160,145,r?'莫耳比 2：1：2':'由係數讀比例','fig-small')}`);
    if(id==='mass-conservation-rxn')return chemSvg(`<g><path d="M35 135H285M90 135l18-23h104l18 23M160 112V54M115 54h90" class="chem-line"/><rect x="73" y="35" width="75" height="55" rx="9" class="chem-glass"/><rect x="176" y="35" width="75" height="55" rx="9" class="chem-glass"/>${circ(98,62,7,'a')}${circ(119,62,7,'b')}${circ(199,62,7,'a')}${circ(220,62,7,'b')}</g>${chemTxt(160,20,r?'封閉系統：反應前總質量＝反應後總質量':'反應前後稱量','fig-title')}`);
    if(id==='mole-map')return chemSvg(`<g class="molemap"><circle cx="160" cy="88" r="40"/><rect x="18" y="61" width="82" height="54" rx="11"/><rect x="220" y="61" width="82" height="54" rx="11"/><path d="M100 88H118M202 88H220" class="chem-arrow" marker-end="url(#chem-arr)"/></g>${chemTxt(59,80,r?'質量 m':'質量','fig-title')}${chemTxt(160,80,r?'莫耳數 n':'莫耳','fig-title')}${chemTxt(261,80,r?'粒子數 N':'粒子','fig-title')}${chemTxt(109,120,r?'÷M / ×M':'M','fig-tiny')}${chemTxt(211,120,r?'×Nₐ / ÷Nₐ':'Nₐ','fig-tiny')}`);
    if(id==='avogadro-box')return chemSvg(`<g><rect x="45" y="33" width="230" height="105" rx="14" class="particle-box"/>${[[75,65],[110,52],[145,78],[185,55],[225,78],[255,55],[90,108],[132,116],[175,105],[218,116],[250,108]].map(([x,y],i)=>circ(x,y,6,i%2?'b':'a')).join('')}</g>${chemTxt(160,18,r?'1 mol → 6.02×10²³ 個基本粒子':'1 mol → 固定粒子數','fig-title')}`);
    if(id==='molar-mass')return chemSvg(`<g><circle cx="112" cy="74" r="23" class="atom b"/><circle cx="78" cy="105" r="15" class="atom a"/><circle cx="146" cy="105" r="15" class="atom a"/><path d="M175 85H230" class="chem-arrow" marker-end="url(#chem-arr)"/><rect x="237" y="52" width="63" height="66" rx="10" class="softbox"/></g>${chemTxt(112,145,r?'H₂O：2Ar(H)+Ar(O)':'由化學式加總','fig-small')}${chemTxt(268,75,r?'18':'M','fig-title')}${chemTxt(268,100,r?'g/mol':'單位','fig-tiny')}`);
    if(id==='solute-solvent')return chemSvg(`<g><rect x="30" y="30" width="260" height="120" rx="14" class="solution-box"/>${[[61,56],[100,71],[140,54],[180,72],[220,55],[261,72],[73,116],[118,126],[160,108],[205,127],[250,112]].map(([x,y],i)=>circ(x,y,6,'b')).join('')}${[[91,94],[150,88],[228,94]].map(([x,y])=>circ(x,y,10,'a')).join('')}</g>${chemTxt(160,17,r?'溶質均勻分散於溶劑':'溶液的微觀模型','fig-title')}`);
    if(id==='saturation')return chemSvg(`<g><rect x="28" y="38" width="112" height="112" rx="10" class="solution-box"/><rect x="180" y="38" width="112" height="112" rx="10" class="solution-box"/>${[[50,65],[74,91],[101,65],[118,112]].map(([x,y])=>circ(x,y,7,'a')).join('')}${[[202,65],[225,90],[249,65],[271,90],[207,120],[238,122],[271,122]].map(([x,y])=>circ(x,y,7,'a')).join('')}<path d="M193 137H280" class="solid-bed"/></g>${chemTxt(84,22,r?'未飽和':'A','fig-small')}${chemTxt(236,22,r?'飽和＋未溶固體':'B','fig-small')}`);
    if(id==='molarity')return chemSvg(`<g><path d="M90 28v84q0 25 70 25t70-25V28" class="beaker"/><path d="M99 77h122v38q0 15-61 15t-61-15z" class="liquid-fill"/>${[[120,93],[145,108],[171,91],[197,110]].map(([x,y])=>circ(x,y,7,'a')).join('')}</g>${chemTxt(160,18,r?'M = n / V(L)':'濃度＝溶質量 / 溶液體積','fig-title')}`);
    if(id==='dilution')return chemSvg(`<g><rect x="28" y="46" width="92" height="96" rx="10" class="solution-box"/><rect x="200" y="30" width="92" height="112" rx="10" class="solution-box"/>${[[50,72],[80,92],[102,116]].map(([x,y])=>circ(x,y,8,'a')).join('')}${[[220,58],[246,88],[273,116]].map(([x,y])=>circ(x,y,8,'a')).join('')}<path d="M132 87H188" class="chem-arrow" marker-end="url(#chem-arr)"/></g>${chemTxt(74,25,r?'較濃':'A','fig-small')}${chemTxt(246,18,r?'加水後較稀':'B','fig-small')}${chemTxt(160,155,r?'溶質莫耳數不變；體積增加':'粒子數不變','fig-tiny')}`);
    if(id==='solubility-curve')return chemSvg(`<g><path d="M48 145H286M55 151V28" class="axes"/><path d="M58 132C100 119 130 96 165 79S225 53 275 38" class="curve green"/><path d="M58 95C112 95 172 91 275 85" class="curve orange"/><circle cx="165" cy="79" r="4" class="point"/></g>${chemTxt(160,18,r?'溶解度—溫度曲線':'讀圖：溫度與可溶解量','fig-title')}${chemTxt(270,158,r?'溫度':'T','fig-tiny')}${chemTxt(28,78,r?'溶解度':'S','fig-tiny')}`);
    if(id==='stoich-flow')return chemSvg(`<g class="flow">${[['已知量',18],['莫耳數',92],['係數比',166],['未知量',240]].map(([t,x])=>`<rect x="${x}" y="62" width="64" height="48" rx="9"/>`).join('')}<path d="M82 86H92M156 86H166M230 86H240" class="chem-arrow" marker-end="url(#chem-arr)"/></g>${chemTxt(50,86,r?'已知量':'A','fig-small')}${chemTxt(124,86,r?'莫耳數':'B','fig-small')}${chemTxt(198,86,r?'係數比':'C','fig-small')}${chemTxt(272,86,r?'未知量':'D','fig-small')}`);
    if(id==='limiting-particles')return chemSvg(`<g>${[[45,65],[45,105],[78,65],[78,105],[111,65]].map(([x,y])=>circ(x,y,8,'a')).join('')}${[[170,65],[170,105],[205,65]].map(([x,y])=>circ(x,y,10,'b')).join('')}<path d="M230 85H270" class="chem-arrow" marker-end="url(#chem-arr)"/></g>${chemTxt(78,25,r?'反應物 A：5':'A','fig-small')}${chemTxt(185,25,r?'反應物 B：3':'B','fig-small')}${chemTxt(270,120,r?'先用完者限制產物量':'找先耗盡者','fig-tiny')}`);
    return oldFig(id,mode);
  };

  const oldCluster=chemClusterHtml;
  chemClusterHtml=function(page,c,mode){if(page?.id!==PAGE.id)return oldCluster(page,c,mode);const figs=c.figures.map(id=>chemFigure(id,mode)).join('');return `<section class="chem-cluster chem3-${c.id}" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;--chem-accent:${page.theme}"><header><b>${c.number}</b><h3>${chemEsc(c.title)}</h3></header><div class="chem-cluster-body chem3-body"><div class="chem3-questions">${chemQuestions(page,c,mode)}</div><div class="chem3-figures chem3-figures-${c.figures.length}">${figs}</div></div></section>`};
  const oldConnect=chemConnectorLayer;
  chemConnectorLayer=function(){const id=document.querySelector?.('.chem-paper')?.dataset?.chemPaper||state.chemistryPageId;if(id!==PAGE.id)return oldConnect();return `<svg class="chem-connectors" viewBox="0 0 1000 1414" aria-hidden="true"><defs><marker id="chem-page-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs><path d="M500 437V450"/><path d="M500 763V776"/><path d="M500 1133V1146"/></svg>`};
})();
