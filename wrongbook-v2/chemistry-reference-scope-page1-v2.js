// Chemistry scope + GSAT page-1 refinement v2.
// Keeps 學測化學 (部定必修) and 選修化學 (加深加廣) as separate curricula.
// Adds prerequisite distinctions and two more teaching figures while preserving the photographed workbook grammar.
(function chemistryScopePage1V2(){
  if(typeof CHEMISTRY_REFERENCE_TRACKS==='undefined'||typeof CHEMISTRY_GSAT_PAGE_1==='undefined')return;

  const electiveCodes={
    'elec-matter-energy':[
      'CJa-Va-1','CJa-Va-2',
      'CBa-Va-1','CBa-Va-2','CBa-Va-3','CBa-Va-4',
      'CEc-Va-1','CEc-Va-2','CEc-Va-3','CEc-Va-4','CEc-Va-5',
      'CCa-Va-1','CAb-Va-3',
      'CJb-Va-1','CJb-Va-2','CJb-Va-3','CJb-Va-4','CJb-Va-5'
    ],
    'elec-structure-rate':[
      'CAa-Va-1','CAa-Va-2','CAa-Va-3','CAa-Va-4','CAa-Va-5',
      'CAb-Va-1','CAb-Va-4',
      'CCb-Va-2','CCb-Va-3','CCb-Va-4',
      'CJe-Va-1','CJe-Va-2','CJe-Va-3','CJe-Va-4'
    ],
    'elec-equilibrium-1':[
      'CJe-Va-5','CJe-Va-6','CJe-Va-7','CJe-Va-8','CJb-Va-3',
      'CJd-Va-1','CJd-Va-2','CJd-Va-3','CJd-Va-4','CJd-Va-5','CJd-Va-6','CJd-Va-7','CJd-Va-8'
    ],
    'elec-equilibrium-2':[
      'CJc-Va-1','CJc-Va-2','CJc-Va-3','CJc-Va-4','CJc-Va-5','CJc-Va-6','CJc-Va-7','CJc-Va-8',
      'CMc-Va-1','CMc-Va-2','CMc-Va-3','CMc-Va-4','CMc-Va-5','CMc-Va-6','CMc-Va-7'
    ],
    'elec-organic-tech':[
      'CCb-Va-1','CAb-Va-2',
      'CJf-Va-1','CJf-Va-2','CJf-Va-3','CJf-Va-4','CJf-Va-5',
      'CMa-Va-1','CMa-Va-2','CMb-Va-1','CMb-Va-2','CMb-Va-3',
      'CMe-Va-1','CMe-Va-2',
      'CNa-Va-1','CNa-Va-2','CNa-Va-3','CNa-Va-4','CNc-Va-1'
    ]
  };
  const elective=CHEMISTRY_REFERENCE_TRACKS.elective;
  elective.pages.forEach(p=>{p.codes=[...(electiveCodes[p.id]||[])];p.subtitle=`選修化學 2 學分 · ${p.codes.length} 個課綱節點`;});
  elective.credits=10;
  elective.scopeRule='只收錄加深加廣選修；不得回灌學測必修頁。';
  CHEMISTRY_REFERENCE_TRACKS.gsat.scopeRule='只收錄自然科學領域部定必修化學與必要先備概念；不得混入 Va 選修節點。';

  const page=CHEMISTRY_GSAT_PAGE_1;
  page.scopeRule='GSAT mandatory only';
  page.prerequisiteConcepts=['物理性質與化學性質','物理變化與化學變化','固液氣粒子模型'];

  // Replace a low-value isotope-example recall with a relationship question.
  const atomic=page.clusters.find(c=>c.id==='atom-periodic');
  const q10=atomic?.questions.find(q=>q.n===10);
  if(q10){
    q10.prompt='同一元素的同位素化學性質通常相近，因中性原子的 {{0}} 數相同，電子組態也相同。';
    q10.fields=[{answer:'電子',aliases:['電子數']}];
  }

  // Keep question ownership sequential: clusters 1–2 = 1–10, cluster 3 = 11–16, cluster 4 = 17–21.
  const classification=page.clusters.find(c=>c.id==='classification');
  const phases=page.clusters.find(c=>c.id==='phases');
  if(classification&&!classification.questions.some(q=>q.n===15)){
    classification.questions.push(
      {n:15,prompt:'密度、熔點等不改變物質組成即可觀察的特性稱為 {{0}} 性質；可燃性等涉及生成新物質的特性稱為 {{1}} 性質。',fields:[{answer:'物理',aliases:['物理性質']},{answer:'化學',aliases:['化學性質']}]},
      {n:16,prompt:'冰融化等沒有新物質生成的是 {{0}} 變化；鐵生鏽等生成新物質的是 {{1}} 變化。',fields:[{answer:'物理',aliases:['物理變化']},{answer:'化學',aliases:['化學變化']}]}
    );
  }
  if(phases){
    phases.questions.slice(0,4).forEach((q,i)=>{q.n=17+i;});
    if(!phases.questions.some(q=>q.n===21))phases.questions.push({n:21,prompt:'粒子模型中，固態粒子排列較 {{0}} 且主要在固定位置附近振動；氣態粒子間距較 {{1}} 且可自由移動。',fields:[{answer:'緊密',aliases:['緊密排列','密集','較密']},{answer:'大',aliases:['大','較大','很大']}]});
  }

  if(!page.figures.some(f=>f.id==='property-change'))page.figures.push({id:'property-change',purpose:'用 H₂O 相變與鐵生鏽並列，區分未生成新物質與生成新物質的變化。'});
  if(!page.figures.some(f=>f.id==='states-particles'))page.figures.push({id:'states-particles',purpose:'用同一批粒子的間距與運動方式比較固、液、氣三態。'});

  const baseFig=chemFig;
  chemFig=function(id,mode){
    const reveal=mode==='learn';
    if(id==='periodic-18'){
      const els=[['H',1,1],['He',8,1],['Li',1,2],['Be',2,2],['B',3,2],['C',4,2],['N',5,2],['O',6,2],['F',7,2],['Ne',8,2],['Na',1,3],['Mg',2,3],['Al',3,3],['Si',4,3],['P',5,3],['S',6,3],['Cl',7,3],['Ar',8,3]];
      return chemSvg(`<g class="mini-periodic">${els.map(([sym,g,p])=>{const x=22+(g-1)*34,y=18+(p-1)*50;return `<rect x="${x}" y="${y}" width="29" height="40" rx="5"/><text x="${x+14.5}" y="${y+18}" class="el">${sym}</text><text x="${x+14.5}" y="${y+32}" class="ve">${reveal?`v${g}`:'•'.repeat(Math.min(g,4))}</text>`}).join('')}</g>${chemTxt(160,170,reveal?'原子序 1–18：價電子呈週期性':'週期表局部觀察','fig-small')}`,'0 0 320 185');
    }
    if(id==='isotope-notation'){
      return chemSvg(`<g class="isotope"><text x="62" y="95" class="big">${reveal?'C':'X'}</text><text x="39" y="61" class="mass">A</text><text x="42" y="110" class="atomic">Z</text><path d="M88 54H154M88 103H154" class="chem-line"/>${chemTxt(160,58,reveal?'A：質量數':'A：＿＿','fig-small')}${chemTxt(160,108,reveal?'Z：原子序':'Z：＿＿','fig-small')}${reveal?'<text x="62" y="154" class="isoexamples">¹²C　¹³C　¹H　²H</text>':''}</g>`);
    }
    if(id==='compound-compare'){
      return chemSvg(`<g class="compound"><g transform="translate(20,25)">${[[0,0],[28,0],[0,28],[28,28],[56,0],[56,28]].map(([x,y],i)=>`<circle cx="${36+x}" cy="${36+y}" r="11" class="atom ${i%2?'b':'a'}"/>`).join('')}</g><path d="M130 18V150" class="chem-dash"/><g transform="translate(160,22)"><circle cx="40" cy="42" r="12" class="atom b"/><circle cx="24" cy="58" r="8" class="atom a"/><circle cx="56" cy="58" r="8" class="atom a"/><circle cx="106" cy="42" r="10" class="atom a"/><circle cx="126" cy="42" r="12" class="atom b"/><circle cx="146" cy="42" r="10" class="atom a"/></g></g>${chemTxt(70,132,reveal?'NaCl':'模型 A','fig-title')}${chemTxt(235,132,reveal?'H₂O　CO₂':'模型 B','fig-title')}${chemTxt(70,160,reveal?'離子化合物':'連續晶格','fig-small')}${chemTxt(235,160,reveal?'分子化合物':'獨立粒子','fig-small')}`);
    }
    if(id==='phase-water'||id==='phase-co2'){
      const isWater=id==='phase-water',name=isWater?'H₂O':'CO₂',solidLine=isWater?'M82 142L118 45':'M82 142L104 45';
      return chemSvg(`<g class="phase"><path d="M42 150H292M50 158V18" class="axes"/><path d="${solidLine}" class="curve"/><path d="M82 142C120 120 150 102 188 91S238 65 263 35" class="curve"/><circle cx="83" cy="142" r="4" class="point"/><circle cx="263" cy="35" r="4" class="point"/>${!isWater?'<path d="M50 130H292" class="atm"/>':''}</g>${chemTxt(165,17,name,'fig-title')}${reveal?chemTxt(171,174,'溫度 T','fig-small'):''}${reveal?chemTxt(20,78,'壓力 P','fig-small'):''}${chemTxt(76,126,reveal?'三相點':'●','fig-tiny')}${chemTxt(240,29,reveal?'臨界點':'●','fig-tiny')}${chemTxt(69,72,reveal?'固':'A','fig-small')}${chemTxt(142,73,reveal?'液':'B','fig-small')}${chemTxt(218,124,reveal?'氣':'C','fig-small')}${!isWater?chemTxt(218,146,reveal?'1 atm：固→氣':'1 atm','fig-tiny'):''}`,'0 0 320 185','phase-diagram');
    }
    if(id==='property-change'){
      return chemSvg(`<g class="propchange"><rect x="10" y="18" width="140" height="140" rx="12" class="softbox"/><rect x="170" y="18" width="140" height="140" rx="12" class="softbox"/><g class="ice"><rect x="38" y="54" width="43" height="43" rx="8"/><path d="M98 75c10-18 25-6 20 8c-3 9-11 15-20 15c-12 0-18-12-12-20Z"/></g><path d="M87 76H121" class="chem-arrow" marker-end="url(#chem-arr)"/><g class="rust"><circle cx="205" cy="75" r="22"/><path d="M205 52v46M182 75h46M190 60l30 30M220 60l-30 30"/><circle cx="270" cy="75" r="24" class="rusty"/></g><path d="M230 75H247" class="chem-arrow" marker-end="url(#chem-arr)"/>${chemTxt(80,128,reveal?'H₂O(s) → H₂O(l)｜物理變化':'H₂O(s) → H₂O(l)','fig-small')}${chemTxt(240,128,reveal?'鐵 → 鐵鏽｜化學變化':'鐵 → 鐵鏽','fig-small')}`,'0 0 320 180');
    }
    if(id==='states-particles'){
      const dense=[[36,58],[55,58],[74,58],[36,77],[55,77],[74,77],[36,96],[55,96],[74,96]];
      const liquid=[[130,61],[153,58],[177,67],[139,82],[164,88],[185,83],[146,105],[174,108]];
      const gas=[[228,49],[286,61],[245,92],[293,112],[259,135],[220,127]];
      return chemSvg(`<g class="states"><rect x="8" y="26" width="92" height="130" rx="10"/><rect x="114" y="26" width="92" height="130" rx="10"/><rect x="220" y="26" width="92" height="130" rx="10"/>${dense.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" class="atom a"/>`).join('')}${liquid.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" class="atom b"/>`).join('')}${gas.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" class="atom c"/>`).join('')}<path d="M28 116l16 0M52 116l16 0M132 124q16-16 31 0M245 75l13-11M278 96l15-7" class="motion"/></g>${chemTxt(54,16,reveal?'固態':'A','fig-small')}${chemTxt(160,16,reveal?'液態':'B','fig-small')}${chemTxt(266,16,reveal?'氣態':'C','fig-small')}${reveal?chemTxt(160,171,'間距與運動自由度逐步增加','fig-small'):chemTxt(160,171,'比較粒子間距與運動','fig-small')}`,'0 0 320 182');
    }
    return baseFig(id,mode);
  };

  const baseClusterHtml=chemClusterHtml;
  chemClusterHtml=function(p,c,mode){
    if(p?.id!=='gsat-01')return baseClusterHtml(p,c,mode);
    let visuals='';
    if(c.id==='laws')visuals=`<div class="chem-figure-stack">${chemFigure('mass-balance',mode)}${chemFigure('dalton-particles',mode)}</div>`;
    if(c.id==='atom-periodic')visuals=`<div class="chem-figure-stack">${chemFigure('periodic-18',mode)}${chemFigure('isotope-notation',mode)}</div>`;
    if(c.id==='classification')visuals=`<div class="chem-wide-figures chem-wide-figures-v2">${chemFigure('matter-tree',mode)}${chemFigure('periodic-types',mode)}${chemFigure('compound-compare',mode)}${chemFigure('property-change',mode)}</div>`;
    if(c.id==='phases')visuals=`<div class="chem-phase-figures chem-phase-figures-v2">${chemFigure('states-particles',mode)}${chemFigure('phase-water',mode)}${chemFigure('phase-co2',mode)}</div>`;
    return `<section class="chem-cluster chem-${c.id}" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;--chem-accent:${p.theme}"><header><b>${c.number}</b><h3>${chemEsc(c.title)}</h3></header><div class="chem-cluster-body">${chemQuestions(p,c,mode)}${visuals}</div></section>`;
  };

  function rectsOverlap(a,b,pad=1){return a.left<b.right-pad&&a.right>b.left+pad&&a.top<b.bottom-pad&&a.bottom>b.top+pad;}
  function chemDomQa(){
    const paper=document.querySelector('.chem-paper');
    if(!paper)return{ok:false,reason:'chemistry page not rendered'};
    const clusters=[...paper.querySelectorAll('.chem-cluster')],figures=[...paper.querySelectorAll('.chem-figure')],questions=[...paper.querySelectorAll('.chem-question')],inputs=[...paper.querySelectorAll('.chem-input-shell')];
    const overflowClusters=clusters.filter(el=>el.scrollHeight>el.clientHeight+2||el.scrollWidth>el.clientWidth+2).map(el=>el.className);
    const figureQuestionCollisions=[];
    figures.forEach(f=>{const fr=f.getBoundingClientRect();questions.forEach(q=>{if(f.closest('.chem-cluster')===q.closest('.chem-cluster')&&rectsOverlap(fr,q.getBoundingClientRect(),2))figureQuestionCollisions.push([f.dataset.chemFigure,q.dataset.chemQuestion]);});});
    const inputOutsideCluster=inputs.filter(el=>{const r=el.getBoundingClientRect(),c=el.closest('.chem-cluster')?.getBoundingClientRect();return c&&(r.left<c.left-1||r.right>c.right+1||r.top<c.top-1||r.bottom>c.bottom+1)}).length;
    const minQuestionFont=Math.min(...questions.map(q=>parseFloat(getComputedStyle(q).fontSize)||99));
    const recallLeakNodes=chemStudyMode()==='recall'?[...paper.querySelectorAll('.chem-learn-answer')].length:0;
    return{page:page.id,overflowClusters,figureQuestionCollisions,inputOutsideCluster,minQuestionFont,recallLeakNodes,figures:figures.length,questions:questions.length,ok:overflowClusters.length===0&&figureQuestionCollisions.length===0&&inputOutsideCluster===0&&minQuestionFont>=12&&recallLeakNodes===0};
  }
  window.chemistryReferenceDomQa=chemDomQa;

  const baseQa=chemQa;
  chemQa=function(p=CHEMISTRY_GSAT_PAGE_1){
    const r=baseQa(p),allElectiveCodes=CHEMISTRY_REFERENCE_TRACKS.elective.pages.flatMap(x=>x.codes||[]),gsatCodes=CHEMISTRY_REFERENCE_TRACKS.gsat.pages.flatMap(x=>x.codes||[]);
    r.scopeSeparation={gsatContainsVa:gsatCodes.filter(c=>/-Va-/.test(c)),electiveContainsVc:allElectiveCodes.filter(c=>/-Vc-/.test(c)),electiveCourses:CHEMISTRY_REFERENCE_TRACKS.elective.pages.length,electiveCredits:CHEMISTRY_REFERENCE_TRACKS.elective.credits};
    r.prerequisiteConcepts=(p.prerequisiteConcepts||[]).length;
    r.diagramDensityOk=p.figures.length>=10;
    r.scopeSeparationOk=r.scopeSeparation.gsatContainsVa.length===0&&r.scopeSeparation.electiveContainsVc.length===0&&r.scopeSeparation.electiveCourses===5&&r.scopeSeparation.electiveCredits===10;
    r.ok=r.ok&&r.diagramDensityOk&&r.scopeSeparationOk;
    return r;
  };
  window.chemistryReferenceQa=chemQa;
})();
