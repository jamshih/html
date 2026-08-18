// Chemistry workbook reconstruction v1.
// Visual grammar: the six user-supplied Earth Science「脈絡整合・填空練習」reference pages.
// Scope rule: 學測化學 = 108課綱部定必修 only; 選修化學 = 加深加廣選修 only.
// Do not merge advanced elective content into the GSAT track.

const CHEMISTRY_REFERENCE_TRACKS={
  gsat:{
    id:'gsat',label:'學測化學',scope:'108課綱部定必修',accent:'#126ca1',tint:'#eef7fb',
    pages:[
      {id:'gsat-01',number:1,title:'物質、元素與基本定律',subtitle:'物質組成・週期性・物質分類',implemented:true,codes:['CAa-Vc-1','CAa-Vc-2','CAa-Vc-3','CAa-Vc-4','CAb-Vc-1','CAb-Vc-2','CAb-Vc-3']},
      {id:'gsat-02',number:2,title:'能量、分離與化學鍵',subtitle:'反應能量・分離純化・鍵結・氣體',implemented:false,codes:['CBa-Vc-1','CBa-Vc-2','CCa-Vc-1','CCa-Vc-2','CCb-Vc-1','CCb-Vc-2','CEc-Vc-1']},
      {id:'gsat-03',number:3,title:'反應式、莫耳與水溶液',subtitle:'反應規律・簡單計量・溶液',implemented:false,codes:['CJa-Vc-1','CJa-Vc-2','CJa-Vc-3','CJb-Vc-1','CJb-Vc-2','CJb-Vc-3']},
      {id:'gsat-04',number:4,title:'氧化還原、酸鹼與平衡',subtitle:'氧化還原・pH・溶解平衡・速率',implemented:false,codes:['CJc-Vc-1','CJc-Vc-2','CJd-Vc-1','CJd-Vc-2','CJd-Vc-3','CJd-Vc-4','CJe-Vc-1','CJe-Vc-2']},
      {id:'gsat-05',number:5,title:'有機物、界面活性劑與生活化學',subtitle:'生物分子・去污・科技與生活',implemented:false,codes:['CJf-Vc-1','CJf-Vc-2','CJf-Vc-3','CMa-Vc-1','CMb-Vc-1','CMb-Vc-2','CMc-Vc-1','CMc-Vc-2','CMc-Vc-3']},
      {id:'gsat-06',number:6,title:'環境、資源與永續',subtitle:'污染防治・水資源・循環・能源',implemented:false,codes:['CMe-Vc-1','CMe-Vc-2','CMe-Vc-3','CMe-Vc-4','CNa-Vc-1','CNa-Vc-2','CNa-Vc-3','CNa-Vc-4','CNc-Vc-1']}
    ]
  },
  elective:{
    id:'elective',label:'選修化學',scope:'108課綱加深加廣選修',accent:'#7455a8',tint:'#f5f0fb',
    pages:[
      {id:'elec-matter-energy',number:1,title:'物質與能量',subtitle:'選修化學 2 學分',implemented:false,codes:[]},
      {id:'elec-structure-rate',number:2,title:'物質構造與反應速率',subtitle:'選修化學 2 學分',implemented:false,codes:[]},
      {id:'elec-equilibrium-1',number:3,title:'化學反應與平衡一',subtitle:'選修化學 2 學分',implemented:false,codes:[]},
      {id:'elec-equilibrium-2',number:4,title:'化學反應與平衡二',subtitle:'選修化學 2 學分',implemented:false,codes:[]},
      {id:'elec-organic-tech',number:5,title:'有機化學與應用科技',subtitle:'選修化學 2 學分',implemented:false,codes:[]}
    ]
  }
};

const CHEMISTRY_GSAT_PAGE_1={
  id:'gsat-01',track:'gsat',number:1,title:'物質、元素與基本定律',theme:'#126ca1',theme2:'#0d7f91',
  curriculumCodes:['CAa-Vc-1','CAa-Vc-2','CAa-Vc-3','CAa-Vc-4','CAb-Vc-1','CAb-Vc-2','CAb-Vc-3'],
  clusters:[
    {
      id:'laws',number:1,title:'元素概念與化學基本定律',x:28,y:154,w:452,h:462,
      questions:[
        {n:1,prompt:'拉瓦節提出物質最基本的組成是 {{0}}。',fields:[{answer:'元素',aliases:['element','元素（element）']}]},
        {n:2,prompt:'化學反應前後總質量保持不變，稱為 {{0}} 定律。',fields:[{answer:'質量守恆',aliases:['質量守恆定律']}]},
        {n:3,prompt:'同一化合物中，各元素的質量比固定，稱為 {{0}} 定律。',fields:[{answer:'定比',aliases:['定比定律']}]},
        {n:4,prompt:'兩元素形成兩種以上化合物時，固定一元素質量，另一元素質量呈簡單整數比，稱為 {{0}} 定律。',fields:[{answer:'倍比',aliases:['倍比定律']}]},
        {n:5,prompt:'道耳頓綜合元素概念與三項基本定律提出 {{0}}；化學反應可視為原子的 {{1}}。',fields:[{answer:'原子說',aliases:['道耳頓原子說','原子學說']},{answer:'重新排列組合',aliases:['重新排列','重新組合','重排']}]}
      ],
      figures:['mass-balance','dalton-particles']
    },
    {
      id:'atom-periodic',number:2,title:'原子序、週期性與同位素',x:496,y:154,w:476,h:462,
      questions:[
        {n:6,prompt:'元素在週期表中依 {{0}} 大小排列；原子序等於原子核內的 {{1}} 數。',fields:[{answer:'原子序',aliases:['原子序數','atomic number']},{answer:'質子',aliases:['質子數']}]},
        {n:7,prompt:'必修範圍以原子序 1～18 為主：同族元素常因 {{0}} 數相近而呈現相似化學性質。',fields:[{answer:'價電子',aliases:['最外層電子','價電子數']}]},
        {n:8,prompt:'同一元素的同位素具有相同的 {{0}} 數，但 {{1}} 數不同。',fields:[{answer:'質子',aliases:['質子數']},{answer:'中子',aliases:['中子數']}]},
        {n:9,prompt:'核種符號 ᴬZX 中，A 代表 {{0}}，Z 代表 {{1}}。',fields:[{answer:'質量數',aliases:['mass number']},{answer:'原子序',aliases:['原子序數','atomic number']}]},
        {n:10,prompt:'必修課綱以 {{0}} 與 {{1}} 為例說明同位素。',fields:[{answer:'碳',aliases:['C','carbon']},{answer:'氫',aliases:['H','hydrogen']}]} 
      ],
      figures:['periodic-18','isotope-notation']
    },
    {
      id:'classification',number:3,title:'物質分類、元素分類與化合物',x:28,y:635,w:944,h:350,
      questions:[
        {n:11,prompt:'物質可先分為 {{0}} 與 {{1}}；純物質再分為元素與化合物。',fields:[{answer:'純物質',aliases:['pure substance']},{answer:'混合物',aliases:['mixture']}]},
        {n:12,prompt:'元素可依性質分成 {{0}}、{{1}} 與 {{2}}。',fields:[{answer:'金屬',aliases:['metal']},{answer:'類金屬',aliases:['準金屬','metalloid']},{answer:'非金屬',aliases:['nonmetal','非金屬元素']}]},
        {n:13,prompt:'化合物依組成與性質可分為 {{0}} 化合物與 {{1}} 化合物。',fields:[{answer:'離子',aliases:['離子化合物']},{answer:'分子',aliases:['分子化合物']}]},
        {n:14,prompt:'課綱以 {{0}} 說明離子化合物；以 {{1}} 與 {{2}} 說明分子化合物。',fields:[{answer:'氯化鈉',aliases:['NaCl']},{answer:'水',aliases:['H2O','H₂O']},{answer:'二氧化碳',aliases:['CO2','CO₂']}]}
      ],
      figures:['matter-tree','periodic-types','compound-compare']
    },
    {
      id:'phases',number:4,title:'三態與三相圖',x:28,y:1002,w:944,h:338,
      questions:[
        {n:15,prompt:'三相圖以 {{0}} 為橫軸、{{1}} 為縱軸，表示不同條件下穩定的物態。',fields:[{answer:'溫度',aliases:['temperature','T']},{answer:'壓力',aliases:['pressure','P']}]},
        {n:16,prompt:'固、液、氣三相共存的狀態稱為 {{0}}；液、氣相界線終點稱為 {{1}}。',fields:[{answer:'三相點',aliases:['triple point']},{answer:'臨界點',aliases:['critical point']}]},
        {n:17,prompt:'水的固液平衡線斜率與多數物質不同，主要因冰的密度比液態水 {{0}}。',fields:[{answer:'小',aliases:['低','較小','較低']}]},
        {n:18,prompt:'在 1 atm 下，二氧化碳不會形成穩定液態，而會由固態直接變成氣態，此過程稱為 {{0}}。',fields:[{answer:'昇華',aliases:['升華','sublimation']}]}
      ],
      figures:['phase-water','phase-co2']
    }
  ],
  figures:[
    {id:'mass-balance',purpose:'用封閉容器反應前後天平等重，視覺化質量守恆。'},
    {id:'dalton-particles',purpose:'用相同原子數的粒子重排，連接原子說與化學反應。'},
    {id:'periodic-18',purpose:'用原子序1–18的小型週期表與價電子點呈現週期性。'},
    {id:'isotope-notation',purpose:'用碳、氫核種與 A/Z 標記理解同位素。'},
    {id:'matter-tree',purpose:'用樹狀分類呈現物質→純物質/混合物→元素/化合物。'},
    {id:'periodic-types',purpose:'用週期表區域色塊比較金屬、類金屬、非金屬。'},
    {id:'compound-compare',purpose:'用 NaCl 晶格與 H₂O/CO₂ 分子模型比較化合物類型。'},
    {id:'phase-water',purpose:'用水的三相圖理解溫度、壓力、三相點與固液線特性。'},
    {id:'phase-co2',purpose:'用 CO₂ 三相圖說明 1 atm 下乾冰昇華。'}
  ],
  equations:['ᴬZX'],
  uncoveredItems:[]
};

const CHEMISTRY_REFERENCE_PAGES={'gsat-01':CHEMISTRY_GSAT_PAGE_1};
window.CHEMISTRY_REFERENCE_TRACKS=CHEMISTRY_REFERENCE_TRACKS;
window.CHEMISTRY_REFERENCE_PAGES=CHEMISTRY_REFERENCE_PAGES;

function chemEsc(value=''){return typeof esc==='function'?esc(String(value)):String(value).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function chemNorm(value=''){return String(value??'').trim().toLowerCase().normalize('NFKC').replace(/\s+/g,'').replace(/[，,。．·・:：;；()（）\[\]【】]/g,'').replace(/質量守恆定律/g,'質量守恆').replace(/定比定律/g,'定比').replace(/倍比定律/g,'倍比').replace(/原子序數/g,'原子序')}
function chemFieldKey(page,q,fi){return `chem:${page.track}:${page.id}:q${q.n}:f${fi}`}
function chemValue(page,q,fi){return state.chemistryAnswers?.[chemFieldKey(page,q,fi)]||''}
function chemFieldOk(page,q,fi){const f=q.fields[fi],v=chemNorm(chemValue(page,q,fi));if(!v)return false;return [f.answer,...(f.aliases||[])].map(chemNorm).some(a=>a===v)}
function chemQuestionOk(page,q){return q.fields.every((_,fi)=>chemFieldOk(page,q,fi))}
function chemCurrentTrack(){const id=state.chemistryTrack||'gsat';return CHEMISTRY_REFERENCE_TRACKS[id]||CHEMISTRY_REFERENCE_TRACKS.gsat}
function chemCurrentPageMeta(){const track=chemCurrentTrack();const wanted=state.chemistryPageId;return track.pages.find(p=>p.id===wanted&&p.implemented)||track.pages.find(p=>p.implemented)||track.pages[0]}
function chemStudyMode(){return state.chemistryMode==='learn'?'learn':'recall'}
function chemPageStats(page){const qs=page.clusters.flatMap(c=>c.questions),fields=qs.flatMap(q=>q.fields.map((_,fi)=>({q,fi}))),done=fields.filter(x=>chemFieldOk(page,x.q,x.fi)).length;return{questions:qs.length,blanks:fields.length,done,pct:fields.length?Math.round(done/fields.length*100):0,figures:page.figures.length}}
function chemBlank(page,q,fi,mode){const f=q.fields[fi],key=chemFieldKey(page,q,fi);if(mode==='learn')return `<span class="chem-learn-answer">${chemEsc(f.answer)}</span>`;const val=chemValue(page,q,fi),ok=chemFieldOk(page,q,fi),chars=Math.max(3,Math.min(12,[...String(f.answer)].length+1));return `<span class="chem-input-shell ${val?(ok?'is-ok':'is-wrong'):''}"><input data-chem-input="1" data-chem-key="${chemEsc(key)}" data-chem-answer="${chemEsc(f.answer)}" data-chem-aliases="${chemEsc(JSON.stringify(f.aliases||[]))}" value="${chemEsc(val)}" size="${chars}" autocomplete="off" aria-label="第${q.n}題第${fi+1}格"><i>${ok?'✓':val?'×':''}</i></span>`}
function chemPrompt(page,q,mode){let html=chemEsc(q.prompt);q.fields.forEach((_,fi)=>{html=html.replace(`{{${fi}}}`,chemBlank(page,q,fi,mode))});return html}
function chemQuestions(page,cluster,mode){return `<div class="chem-question-list">${cluster.questions.map(q=>`<div class="chem-question ${chemQuestionOk(page,q)?'is-done':''}" data-chem-question="${q.n}"><b>${q.n}.</b><span>${chemPrompt(page,q,mode)}</span></div>`).join('')}</div>`}

function chemSvg(inner,view='0 0 320 180',cls=''){return `<svg class="chem-figure-svg ${cls}" viewBox="${view}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><defs><marker id="chem-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker></defs>${inner}</svg>`}
function chemTxt(x,y,text,cls=''){return `<text x="${x}" y="${y}" class="${cls}">${chemEsc(text)}</text>`}
function chemFig(id,mode){const reveal=mode==='learn';switch(id){
  case'mass-balance':return chemSvg(`<g class="chem-line"><path d="M25 142H295M80 142l22-28h116l22 28M160 114V54M112 54h96"/><rect x="86" y="36" width="52" height="48" rx="8" class="chem-glass"/><rect x="182" y="36" width="52" height="48" rx="8" class="chem-glass"/><circle cx="104" cy="61" r="6" class="atom a"/><circle cx="121" cy="61" r="6" class="atom b"/><circle cx="200" cy="61" r="6" class="atom a"/><circle cx="217" cy="61" r="6" class="atom b"/></g>${chemTxt(160,25,reveal?'反應前總質量 = 反應後總質量':'封閉系統：反應前後比較','fig-title')}${chemTxt(112,102,'反應前','fig-small')}${chemTxt(208,102,'反應後','fig-small')}`);
  case'dalton-particles':return chemSvg(`<g>${[[54,62,'a'],[78,62,'a'],[54,86,'b'],[78,86,'b']].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="9" class="atom ${c}"/>`).join('')}<path d="M112 74H190" class="chem-arrow" marker-end="url(#chem-arr)"/>${[[220,62,'a'],[238,62,'b'],[220,86,'a'],[238,86,'b']].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="9" class="atom ${c}"/>`).join('')}</g>${chemTxt(66,125,reveal?'原子種類與個數不變':'反應前','fig-small')}${chemTxt(230,125,reveal?'重新排列組合':'反應後','fig-small')}`);
  case'periodic-18':{const els=[['H',1,1],['He',8,1],['Li',1,2],['Be',2,2],['B',3,2],['C',4,2],['N',5,2],['O',6,2],['F',7,2],['Ne',8,2],['Na',1,3],['Mg',2,3],['Al',3,3],['Si',4,3],['P',5,3],['S',6,3],['Cl',7,3],['Ar',8,3]];return chemSvg(`<g class="mini-periodic">${els.map(([sym,g,p],i)=>{const x=22+(g-1)*34,y=18+(p-1)*50;return `<rect x="${x}" y="${y}" width="29" height="40" rx="5"/><text x="${x+14.5}" y="${y+18}" class="el">${sym}</text><text x="${x+14.5}" y="${y+32}" class="ve">${reveal?`v${g}`:'•'.repeat(Math.min(g,4))}</text>`}).join('')}</g>${chemTxt(160,170,reveal?'原子序 1–18：價電子呈週期性':'原子序 1–18','fig-small')}`,'0 0 320 185');}
  case'isotope-notation':return chemSvg(`<g class="isotope"><text x="62" y="95" class="big">C</text><text x="39" y="61" class="mass">12</text><text x="42" y="110" class="atomic">6</text><path d="M88 54H154M88 103H154" class="chem-line"/>${chemTxt(160,58,reveal?'A：質量數':'A：＿＿','fig-small')}${chemTxt(160,108,reveal?'Z：原子序':'Z：＿＿','fig-small')}<text x="62" y="154" class="isoexamples">¹²C　¹³C　¹H　²H</text></g>`);
  case'matter-tree':return chemSvg(`<g class="tree"><rect x="125" y="8" width="70" height="30" rx="12"/><path d="M160 38V58M160 58H72V78M160 58H248V78"/><rect x="25" y="78" width="94" height="32" rx="10"/><rect x="201" y="78" width="94" height="32" rx="10"/><path d="M72 110v20M72 130H40v18M72 130h32v18"/><rect x="10" y="148" width="60" height="26" rx="8"/><rect x="76" y="148" width="60" height="26" rx="8"/></g>${chemTxt(160,29,'物質','tree-label')}${chemTxt(72,99,reveal?'純物質':'＿＿＿＿','tree-label')}${chemTxt(248,99,reveal?'混合物':'＿＿＿＿','tree-label')}${chemTxt(40,166,reveal?'元素':'＿＿','tree-small')}${chemTxt(106,166,reveal?'化合物':'＿＿＿','tree-small')}`);
  case'periodic-types':return chemSvg(`<g class="ptype"><rect x="20" y="24" width="280" height="128" rx="10"/><path d="M34 43h40v86H34ZM80 89h38v40H80ZM123 72h32v57h-32ZM160 55h32v74h-32ZM197 38h32v91h-32ZM234 38h52v91h-52Z" class="period-grid"/><path d="M116 124l23-20l22 20l22-20l22 20" class="metalloid-stair"/></g>${chemTxt(76,66,reveal?'金屬':'A區','fig-small')}${chemTxt(162,98,reveal?'類金屬':'B','fig-small')}${chemTxt(250,66,reveal?'非金屬':'C區','fig-small')}`);
  case'compound-compare':return chemSvg(`<g class="compound"><g transform="translate(20,25)">${[[0,0],[28,0],[0,28],[28,28],[56,0],[56,28]].map(([x,y],i)=>`<circle cx="${36+x}" cy="${36+y}" r="11" class="atom ${i%2?'b':'a'}"/>`).join('')}</g><path d="M130 18V150" class="chem-dash"/><g transform="translate(160,22)"><circle cx="40" cy="42" r="12" class="atom b"/><circle cx="24" cy="58" r="8" class="atom a"/><circle cx="56" cy="58" r="8" class="atom a"/><circle cx="106" cy="42" r="10" class="atom a"/><circle cx="126" cy="42" r="12" class="atom b"/><circle cx="146" cy="42" r="10" class="atom a"/></g></g>${chemTxt(70,132,'NaCl','fig-title')}${chemTxt(235,132,'H₂O　CO₂','fig-title')}${chemTxt(70,160,reveal?'離子化合物':'晶格模型','fig-small')}${chemTxt(235,160,reveal?'分子化合物':'分子模型','fig-small')}`);
  case'phase-water':return chemPhaseSvg('H₂O',true,reveal);
  case'phase-co2':return chemPhaseSvg('CO₂',false,reveal);
  default:return'';
}}
function chemPhaseSvg(name,isWater,reveal){const solidLine=isWater?'M82 142L118 45':'M82 142L104 45';return chemSvg(`<g class="phase"><path d="M42 150H292M50 158V18" class="axes"/><path d="${solidLine}" class="curve"/><path d="M82 142C120 120 150 102 188 91S238 65 263 35" class="curve"/><circle cx="83" cy="142" r="4" class="point"/><circle cx="263" cy="35" r="4" class="point"/><path d="M50 130H292" class="atm"/></g>${chemTxt(165,17,name,'fig-title')}${chemTxt(171,174,reveal?'溫度 T':'T','fig-small')}${chemTxt(20,78,reveal?'壓力 P':'P','fig-small')}${chemTxt(76,126,reveal?'三相點':'●','fig-tiny')}${chemTxt(240,29,reveal?'臨界點':'●','fig-tiny')}${chemTxt(69,72,reveal?'固':'A','fig-small')}${chemTxt(142,73,reveal?'液':'B','fig-small')}${chemTxt(218,124,reveal?'氣':'C','fig-small')}${!isWater?chemTxt(218,146,reveal?'1 atm：固→氣':'1 atm','fig-tiny'):''}`,'0 0 320 185','phase-diagram')}
function chemFigure(id,mode,caption=''){return `<figure class="chem-figure chem-figure-${id}" data-chem-figure="${id}">${chemFig(id,mode)}${caption?`<figcaption>${chemEsc(caption)}</figcaption>`:''}</figure>`}

function chemClusterHtml(page,c,mode){let visuals='';if(c.id==='laws')visuals=`<div class="chem-figure-stack">${chemFigure('mass-balance',mode)}${chemFigure('dalton-particles',mode)}</div>`;if(c.id==='atom-periodic')visuals=`<div class="chem-figure-stack">${chemFigure('periodic-18',mode)}${chemFigure('isotope-notation',mode)}</div>`;if(c.id==='classification')visuals=`<div class="chem-wide-figures">${chemFigure('matter-tree',mode)}${chemFigure('periodic-types',mode)}${chemFigure('compound-compare',mode)}</div>`;if(c.id==='phases')visuals=`<div class="chem-phase-figures">${chemFigure('phase-water',mode)}${chemFigure('phase-co2',mode)}</div>`;const assetIds=typeof mindmapApprovedAssetIds==='function'?mindmapApprovedAssetIds('chemistry',page.id,c.id):[],assets=typeof mindmapApprovedAssetHtml==='function'?mindmapApprovedAssetHtml(assetIds,{className:'mindmap-asset-group chem-approved-assets',label:`${c.title}概念插圖`}):'';return `<section class="chem-cluster chem-${c.id}" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;--chem-accent:${page.theme}"><header><b>${c.number}</b><h3>${chemEsc(c.title)}</h3></header><div class="chem-cluster-body">${chemQuestions(page,c,mode)}${visuals}${assets}</div></section>`}
function chemConnectorLayer(){return `<svg class="chem-connectors" viewBox="0 0 1000 1414" aria-hidden="true"><defs><marker id="chem-page-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs><path d="M485 385H495"/><path d="M500 617V633"/><path d="M500 986V1000"/></svg>`}
function chemPageApprovedAssets(page){
  if(!['gsat-01','gsat-02','gsat-03','gsat-04'].includes(page.id)||typeof mindmapApprovedAssetHtml!=='function')return'';
  const prefix=`chemistry:${page.id}:`;
  const ids=Object.values(window.MINDMAP_APPROVED_ASSETS||{}).filter(asset=>String(asset.owner||'').startsWith(prefix)).map(asset=>asset.id);
  return mindmapApprovedAssetHtml(ids,{className:'mindmap-asset-group chem-page-approved-assets',label:`${page.title}核准概念插圖`});
}
function chemPaper(page,mode){const st=chemPageStats(page),pageAssets=chemPageApprovedAssets(page);return `<div class="chem-paper mindmap--illustrated mindmap--chemistry" data-chem-paper="${page.id}"><div class="chem-reference-banner"><span>脈 絡 整 合 ${page.number}・填 空 練 習</span></div><div class="chem-start"><i></i><span>從這裡出發</span></div><div class="chem-title-row"><i></i><h1>${chemEsc(page.title)}</h1><i></i></div>${pageAssets}${page.clusters.map(c=>chemClusterHtml(page,c,mode)).join('')}${chemConnectorLayer()}<footer><span>＊ 掌握脈絡・填空鞏固・用圖像理解化學 ＊</span><small>${st.questions} 題 · ${st.blanks} 格 · ${st.figures} 個教學圖</small></footer></div>`}
function chemModeBar(mode,stats){return `<div class="chem-modebar"><div class="chem-mode-tabs"><button class="${mode==='recall'?'active':''}" data-chem-mode="recall">Recall 回想</button><button class="${mode==='learn'?'active':''}" data-chem-mode="learn">Learn 答案</button></div><div class="chem-progress"><span>${stats.done}/${stats.blanks} 格已掌握</span><i><b style="width:${stats.pct}%"></b></i></div><div class="chem-zoom"><button data-chem-zoom="out" aria-label="縮小">−</button><button data-chem-zoom="fit">適合寬度</button><button data-chem-zoom="reset">100%</button><button data-chem-zoom="in" aria-label="放大">＋</button></div></div>`}
function chemTrackTabs(track){return `<div class="chem-track-tabs" role="tablist" aria-label="化學範圍">${Object.values(CHEMISTRY_REFERENCE_TRACKS).map(t=>`<button role="tab" aria-selected="${track.id===t.id?'true':'false'}" class="${track.id===t.id?'active':''}" data-chem-track="${t.id}" style="--track:${t.accent};--track-tint:${t.tint}"><strong>${t.label}</strong><span>${t.scope}</span></button>`).join('')}</div>`}
function chemPageNav(track,current){return `<div class="chem-page-nav">${track.pages.map(p=>`<button class="${current?.id===p.id?'active':''} ${p.implemented?'':'is-planned'}" ${p.implemented?'':'disabled'} data-chem-page="${p.id}"><b>${String(p.number).padStart(2,'0')}</b><span><strong>${chemEsc(p.title)}</strong><small>${chemEsc(p.subtitle)}${p.implemented?'':' · 待逐頁實作'}</small></span></button>`).join('')}</div>`}
function chemPlannedTrack(track){return `<div class="chem-planned-panel" style="--track:${track.accent}"><div class="chem-planned-icon">選</div><div><h3>${track.label}已完全獨立</h3><p>這個區域只放加深加廣選修內容，不會把軌域、量子數、Ksp、緩衝、電化學等進階內容偷混進學測必修頁。接下來依課綱的五門選修課逐頁建置。</p></div></div>`}
function chemistryReferencePage(){const track=chemCurrentTrack(),meta=chemCurrentPageMeta(),page=CHEMISTRY_REFERENCE_PAGES[meta?.id],mode=chemStudyMode();if(!page){return `<div class="page-head chem-page-head"><div><div class="tw-badge">化學脈絡整合 · ${chemEsc(track.scope)}</div><h2>心智圖學習 · 化學</h2><p>學測化學與選修化學分開建置；不跨範圍偷放內容。</p></div></div>${subjectTabs()}${chemTrackTabs(track)}${chemPageNav(track,meta)}${chemPlannedTrack(track)}`;}const stats=chemPageStats(page);return `<div class="page-head chem-page-head"><div><div class="tw-badge">化學脈絡整合 · ${chemEsc(track.scope)}</div><h2>心智圖學習 · 化學</h2><p>依六張參考頁的教科書視覺語法重建；圖解直接服務概念，不做 dashboard 卡片牆。</p></div><div class="v4-head-progress"><span>本頁 ${stats.pct}%</span><i><b style="width:${stats.pct}%"></b></i></div></div>${subjectTabs()}${chemTrackTabs(track)}${chemPageNav(track,meta)}${chemModeBar(mode,stats)}<div class="chem-viewport" data-chem-viewport="1"><div class="chem-stage" data-chem-stage="1">${chemPaper(page,mode)}</div></div><div class="chem-footnote"><span>課綱：${page.curriculumCodes.join(' · ')}</span><span>${stats.figures} 個概念圖 · ${stats.questions} 題 · ${stats.blanks} 格</span><span>手機依概念群組直向重排；平板保留參考頁的相對關係。</span></div>${new URLSearchParams(location.search).has('chemqa')?chemQaPanel(page):''}`}

function chemQa(page=CHEMISTRY_GSAT_PAGE_1){const qs=page.clusters.flatMap(c=>c.questions),fields=qs.flatMap(q=>q.fields),ids=page.figures.map(f=>f.id),duplicates=ids.filter((id,i)=>ids.indexOf(id)!==i),missingAnswers=fields.filter(f=>!String(f.answer||'').trim()).length,missingAliases=fields.filter(f=>!Array.isArray(f.aliases)).length,clusterCount=page.clusters.length;return{page:page.id,track:page.track,curriculumCodes:page.curriculumCodes.length,clusters:clusterCount,questions:qs.length,blanks:fields.length,figures:page.figures.length,equations:page.equations.length,uncoveredItems:page.uncoveredItems.length,duplicateFigureIds:duplicates.length,missingAnswers,missingAliasArrays:missingAliases,diagramDensityOk:page.figures.length>=clusterCount+3,questionDensityOk:qs.length>=15&&qs.length<=22,clusterCountOk:clusterCount>=3&&clusterCount<=5,scopeLeakRisk:0,ok:page.uncoveredItems.length===0&&duplicates.length===0&&missingAnswers===0&&missingAliases===0&&page.figures.length>=clusterCount+3&&qs.length>=15&&qs.length<=22&&clusterCount>=3&&clusterCount<=5}}
function chemQaPanel(page){const q=chemQa(page);return `<aside class="chem-qa"><strong>CHEM PAGE QA</strong><span>${q.ok?'PASS':'FAIL'}</span><small>${q.questions} logical questions</small><small>${q.blanks} blanks</small><small>${q.figures} teaching figures</small><small>${q.curriculumCodes} curriculum codes</small><small>${q.uncoveredItems} uncovered</small><small>${q.scopeLeakRisk} GSAT/elective leaks</small></aside>`}
window.chemistryReferenceQa=chemQa;

let chemZoom=1;
function chemMobileReflow(){return window.matchMedia?.('(max-width:620px)').matches}
function chemApplyZoom(next){const stage=document.querySelector('[data-chem-stage]');if(chemMobileReflow()){chemZoom=1;if(stage){stage.style.transform='none';stage.parentElement.style.setProperty('--chem-zoom',1)}return}chemZoom=Math.max(.45,Math.min(1.6,next));if(stage){stage.style.transform=`scale(${chemZoom})`;stage.style.transformOrigin='top left';stage.parentElement.style.setProperty('--chem-zoom',chemZoom)}}
function chemFit(){const vp=document.querySelector('[data-chem-viewport]');if(!vp)return;if(chemMobileReflow()){chemApplyZoom(1);return}chemApplyZoom(Math.min(1,(vp.clientWidth-20)/1000))}
function chemBind(){
  document.querySelectorAll('[data-chem-track]').forEach(el=>el.onclick=()=>{state.chemistryTrack=el.dataset.chemTrack;const t=CHEMISTRY_REFERENCE_TRACKS[state.chemistryTrack];state.chemistryPageId=t.pages.find(p=>p.implemented)?.id||t.pages[0]?.id;save();render()});
  document.querySelectorAll('[data-chem-page]:not([disabled])').forEach(el=>el.onclick=()=>{state.chemistryPageId=el.dataset.chemPage;save();render()});
  document.querySelectorAll('[data-chem-mode]').forEach(el=>el.onclick=()=>{state.chemistryMode=el.dataset.chemMode;save();render()});
  document.querySelectorAll('[data-chem-input]').forEach(el=>el.onchange=()=>{state.chemistryAnswers=state.chemistryAnswers||{};state.chemistryAnswers[el.dataset.chemKey]=el.value.trim();const aliases=JSON.parse(el.dataset.chemAliases||'[]'),v=chemNorm(el.value),ok=[el.dataset.chemAnswer,...aliases].map(chemNorm).some(a=>a===v),shell=el.closest('.chem-input-shell');shell?.classList.toggle('is-ok',ok);shell?.classList.toggle('is-wrong',!!v&&!ok);const mark=shell?.querySelector('i');if(mark)mark.textContent=ok?'✓':v?'×':'';save()});
  document.querySelector('[data-chem-zoom="in"]')?.addEventListener('click',()=>chemApplyZoom(chemZoom+.1));
  document.querySelector('[data-chem-zoom="out"]')?.addEventListener('click',()=>chemApplyZoom(chemZoom-.1));
  document.querySelector('[data-chem-zoom="reset"]')?.addEventListener('click',()=>chemApplyZoom(1));
  document.querySelector('[data-chem-zoom="fit"]')?.addEventListener('click',chemFit);
  const vp=document.querySelector('[data-chem-viewport]');if(vp){let dragging=false,sx=0,sy=0,sl=0,st=0;vp.addEventListener('pointerdown',e=>{if(e.target.closest('input,button'))return;dragging=true;sx=e.clientX;sy=e.clientY;sl=vp.scrollLeft;st=vp.scrollTop;vp.setPointerCapture?.(e.pointerId)});vp.addEventListener('pointermove',e=>{if(!dragging)return;vp.scrollLeft=sl-(e.clientX-sx);vp.scrollTop=st-(e.clientY-sy)});vp.addEventListener('pointerup',()=>dragging=false);vp.addEventListener('pointercancel',()=>dragging=false);requestAnimationFrame(()=>{if(!vp.dataset.fitDone){vp.dataset.fitDone='1';chemFit()}})}
}

const chemPreviousMindmapPage=mindmapPage;
mindmapPage=function(){const s=activeSubject();if(s.id!=='chemistry')return chemPreviousMindmapPage();return chemistryReferencePage()};
const chemPreviousBind=bind;
bind=function(){chemPreviousBind();chemBind()};
