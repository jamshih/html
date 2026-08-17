// Chemistry workbook v2 core: data-driven clusters + reusable teaching diagrams.
// Keeps the reference-photo visual grammar while allowing all GSAT/elective pages to share one renderer.
(function(){
const oldFig=chemFig,oldCluster=chemClusterHtml;
window.chemA=(answer,...aliases)=>({answer,aliases});
window.chemQ=(n,prompt,...fields)=>({n,prompt,fields});
window.chemC=(id,number,title,x,y,w,h,layout,questions,figures)=>({id,number,title,x,y,w,h,layout,questions,figures});
window.chemP=(id,track,number,title,theme,curriculumCodes,clusters,figures,equations=[],curriculumItems=[])=>({id,track,number,title,theme,curriculumCodes,clusters,figures:figures.map(x=>typeof x==='string'?{id:x,purpose:''}:x),equations,curriculumItems,uncoveredItems:[]});

const M={};
function reg(id,type,title,a=[],b=[]){M[id]={type,title,a,b}}
// Shared GSAT diagrams.
reg('energy-exo-endo','energy','放熱／吸熱',['反應物','生成物'],['ΔH<0','ΔH>0']);
reg('calorimeter','calorimeter','量熱概念',['反應','水','溫度計']);
reg('bond-energy-basic','bond','斷鍵與成鍵',['斷鍵吸能','成鍵放能']);
reg('distillation','distill','蒸餾裝置',['加熱','冷凝','收集']);
reg('chromatography','chrom','層析',['起點','溶劑前緣','成分分離']);
reg('extraction','extract','萃取',['水層','有機層','分液漏斗']);
reg('bond-compare','bondcompare','化學鍵比較',['離子鍵','共價鍵','金屬鍵']);
reg('lattice-molecule','lattice','晶格與分子',['NaCl','H₂O','CO₂']);
reg('gas-particles','gasparticles','氣體粒子模型',['低壓','高壓']);
reg('gas-laws-basic','gaslaws','氣體定律',['P–V','V–T','絕對溫度']);
reg('reaction-particles','reaction','反應式與粒子',['2H₂','O₂','2H₂O']);
reg('mole-map','molemap','粒子・莫耳・質量',['粒子數','mol','質量']);
reg('stoich-flow','stoich','化學計量',['反應物 mol','係數比','生成物 mol']);
reg('solution-beaker','solution','水溶液',['溶質','溶劑','溶液']);
reg('dilution-panel','dilution','稀釋',['M₁V₁','M₂V₂']);
reg('solubility-curve','solubility','溶解度曲線',['溫度','溶解度','飽和']);
reg('redox-transfer','redox','電子轉移',['失 e⁻','得 e⁻']);
reg('oxidation-number','oxidnum','氧化數',['氧化數↑','氧化數↓']);
reg('ph-scale','ph','pH 尺度',['0','7','14']);
reg('acidbase-particles','acidparticles','強弱酸鹼',['解離多','解離少']);
reg('collision-model','collision','碰撞理論',['有效碰撞','無效碰撞']);
reg('activation-basic','activation','活化能與催化劑',['未催化','催化']);
reg('equilibrium-basic','equilibrium','動態平衡',['正反應','逆反應','速率相等']);
reg('lechatelier-basic','shift','勒沙特列',['加反應物','平衡移動','減少擾動']);
reg('functional-map-basic','functional','常見官能基',['烴','醇','羧酸','酯']);
reg('biomolecules','biomolecule','生物分子',['醣類','蛋白質','脂質','核酸']);
reg('polymer-chain','polymer','單體到聚合物',['單體','聚合鏈']);
reg('micelle','micelle','界面活性劑微胞',['親水端','疏水端','油污']);
reg('materials-basic','materials','材料與性質',['塑膠','纖維','橡膠']);
reg('nano-scale','nano','奈米尺度',['1 m','1 mm','1 μm','1 nm']);
reg('water-treatment','watertreat','淨水流程',['混凝','沉澱','過濾','消毒']);
reg('acid-rain','acidrain','酸雨機制',['SO₂/NOₓ','大氣氧化','酸性降水']);
reg('greenhouse','greenhouse','溫室效應',['短波入射','長波放射','吸收回放']);
reg('ozone','ozone','臭氧層耗損',['UV','O₃','自由基循環']);
reg('carbon-cycle','cycle','碳循環',['大氣','生物','海洋','岩石']);
reg('nitrogen-cycle','cycle','氮循環',['N₂','固定','硝化','脫氮']);
reg('resource-loop','cycle','資源循環',['原料','產品','回收','再利用']);
reg('energy-options','energyoptions','能源比較',['再生能源','儲能','限制']);
// Elective diagrams.
reg('partial-pressure','partial','道耳頓分壓',['Ptotal','PA','PB']);
reg('ideal-real','idealreal','理想與真實氣體',['低壓高溫','高壓低溫']);
reg('henry','henry','氣體溶解度與壓力',['壓力↑','溶解度↑']);
reg('hess-cycle','hess','赫斯定律',['路徑1','路徑2','ΔH相同']);
reg('formation-combustion','energy','生成熱／燃燒熱',['元素標準態','1 mol 化合物'],['完全燃燒','CO₂+H₂O']);
reg('atom-structure','atom','原子結構',['原子核','電子','能階']);
reg('bohr-spectrum','bohr','氫原子光譜',['n=1','n=2','n=3','放光']);
reg('orbital-shapes','orbital','軌域形狀',['s','pₓ','pᵧ','p_z']);
reg('quantum-table','quantum','四個量子數',['n','l','mₗ','mₛ']);
reg('orbital-filling','filling','電子填入規則',['Aufbau','Pauli','Hund']);
reg('periodic-trends','periodictrend','週期趨勢',['原子半徑','游離能','電負度']);
reg('vsepr','vsepr','VSEPR 分子形狀',['CO₂','BF₃','CH₄','NH₃','H₂O']);
reg('polarity','polarity','分子極性',['CO₂ 偶極抵消','H₂O 偶極不抵消']);
reg('imf','imf','分子間作用力',['London','偶極－偶極','氫鍵']);
reg('rate-law','rategraph','速率定律',['rate=k[A]^m[B]^n']);
reg('activation-advanced','activation','反應途徑與活化能',['未催化','催化']);
reg('equilibrium-graph','eqgraph','平衡濃度－時間',['反應物','生成物','達平衡']);
reg('kc-expression','formula','平衡常數',['Kc=[C]^c[D]^d/[A]^a[B]^b']);
reg('q-vs-k','qk','Q 與 K',['Q<K','Q=K','Q>K']);
reg('lechatelier-advanced','shift','勒沙特列',['濃度','壓力/體積','溫度']);
reg('ksp','ksp','溶度積',['MX(s)','M⁺','X⁻','Ksp']);
reg('common-ion','commonion','同離子效應',['加入共同離子','溶解度下降']);
reg('water-autoion','waterion','水的自解離',['H₂O','H⁺','OH⁻','Kw']);
reg('strong-weak','acidparticles','強弱酸比較',['完全／近完全解離','部分解離']);
reg('ka-kb','formula','Ka / Kb',['Ka=[H⁺][A⁻]/[HA]','Kb=[BH⁺][OH⁻]/[B]']);
reg('salt-hydrolysis','hydrolysis','鹽類水解',['A⁻+H₂O','HA+OH⁻']);
reg('titration-setup','titration','酸鹼滴定裝置',['滴定管','錐形瓶','指示劑']);
reg('titration-curves','titrationcurve','滴定曲線',['強酸－強鹼','弱酸－強鹼','當量點']);
reg('buffer-action','buffer','緩衝作用',['加 H⁺','共軛鹼消耗','加 OH⁻','弱酸消耗']);
reg('indicator-range','indicator','指示劑變色範圍',['酸色','變色區','鹼色']);
reg('galvanic-cell','galvanic','原電池',['陽極氧化','陰極還原','e⁻ 外電路','鹽橋']);
reg('saltbridge','saltbridge','鹽橋離子移動',['陰離子→陽極槽','陽離子→陰極槽']);
reg('cell-potential','formula','標準電池電位',['E°cell=E°cathode−E°anode']);
reg('electrolysis','electrolysis','電解槽',['外加電源','陽極氧化','陰極還原']);
reg('electroplating','plating','電鍍',['待鍍物＝陰極','鍍層金屬','金屬離子']);
reg('redox-titration','titration','氧化還原滴定',['滴定液','待測物','電子轉移']);
reg('battery','battery','常見電池',['化學能','電能','氧化還原']);
reg('functional-map-advanced','functional','官能基總圖',['鹵烷','醇/酚/醚','醛/酮','酸/酯','胺/醯胺']);
reg('isomer','isomer','結構異構物',['正丁烷','異丁烷']);
reg('organic-path','organicpath','有機反應路徑',['醇','醛/酮','羧酸','酯']);
reg('hydrocarbon-series','homolog','烴類比較',['烷','烯','炔','芳香族']);
reg('polymer-types','polymercompare','聚合反應',['加成聚合','縮合聚合']);
reg('alloy','alloy','合金微結構',['純金屬','置換型','間隙型']);
reg('liquid-crystal','liquidcrystal','液晶',['固態有序','液晶部分有序','液態無序']);
reg('hydrogen-tech','hydrogen','氫能',['製氫','儲運','燃料電池']);
reg('biomolecule-links','biomolecule','有機化學與生物分子',['醣','蛋白質','脂質','核酸']);

function L(x1,y1,x2,y2,cls='line'){return `<path d="M${x1} ${y1}L${x2} ${y2}" class="${cls}"/>`}
function T(x,y,t,cls='small'){return `<text x="${x}" y="${y}" class="${cls}">${chemEsc(t)}</text>`}
function box(x,y,w,h,cls='box'){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" class="${cls}"/>`}
function arrow(x1,y1,x2,y2){return `<path d="M${x1} ${y1}L${x2} ${y2}" class="arrow" marker-end="url(#chem-arr)"/>`}
function revealLabel(reveal,answer,masked='＿＿'){return reveal?answer:masked}
function v2svg(inner,view='0 0 320 180'){return chemSvg(`<g class="chem-v2-fig">${inner}</g>`,view,'chem-v2-svg')}

function renderFlow(meta,reveal){const labels=meta.a;const n=labels.length,w=260/n;return v2svg(labels.map((t,i)=>`${box(20+i*w,66,w-16,48,'softbox')}${T(20+i*w+(w-16)/2,90,revealLabel(reveal,t,String.fromCharCode(65+i)),'mid')}${i<n-1?arrow(20+i*w+w-12,90,20+(i+1)*w-5,90):''}`).join('')+T(160,28,meta.title,'title'))}
function renderCycle(meta,reveal){const pts=[[160,28],[258,90],[160,152],[62,90]],labs=meta.a.slice(0,4);return v2svg(`${pts.map(([x,y],i)=>`${box(x-40,y-17,80,34,'softbox')}${T(x,y,revealLabel(reveal,labs[i]||'',String.fromCharCode(65+i)),'small')}${arrow(x,y,pts[(i+1)%pts.length][0],pts[(i+1)%pts.length][1])}`).join('')}${T(160,13,meta.title,'title')}`)}
function renderEnergy(meta,reveal){return v2svg(`${L(35,150,292,150,'axis')}${L(35,150,35,28,'axis')}<path d="M48 72H125Q160 72 175 112H274" class="curve exo"/><path d="M48 122H125Q160 122 178 64H274" class="curve endo"/>${T(87,64,reveal?meta.a[0]:'A','small')}${T(248,107,reveal?meta.a[1]:'B','small')}${T(248,59,reveal?meta.b[1]||'吸熱':'C','tiny')}${T(160,18,meta.title,'title')}`)}
function renderGraph(meta,reveal,kind){let path='M48 135C90 118 128 90 165 72S230 50 280 44';if(kind==='gaslaws')path='M48 55C82 72 122 91 162 104S238 126 280 136';if(kind==='eqgraph')path='M48 45C90 63 120 92 155 104S218 109 280 109M48 137C95 119 124 93 156 79S224 74 280 74';if(kind==='rategraph')path='M48 135C86 130 118 111 153 84S229 43 280 35';return v2svg(`${L(42,146,292,146,'axis')}${L(42,146,42,25,'axis')}<path d="${path}" class="curve"/>${T(160,17,meta.title,'title')}${T(166,166,reveal?(meta.a[0]||'x軸'):'x','tiny')}${T(19,82,reveal?(meta.a[1]||'y軸'):'y','tiny')}`)}
function renderParticles(meta,reveal){return v2svg(`${box(22,42,118,105,'beaker')}${box(180,42,118,105,'beaker')}${Array.from({length:8},(_,i)=>`<circle cx="${45+(i%4)*24}" cy="${68+Math.floor(i/4)*42}" r="7" class="atom ${i%2?'a':'b'}"/>`).join('')}${Array.from({length:15},(_,i)=>`<circle cx="${195+(i%5)*20}" cy="${60+Math.floor(i/5)*34}" r="6" class="atom ${i%2?'a':'b'}"/>`).join('')}${T(81,162,revealLabel(reveal,meta.a[0]||'狀態一','A'),'small')}${T(239,162,revealLabel(reveal,meta.a[1]||'狀態二','B'),'small')}${T(160,20,meta.title,'title')}`)}
function renderApparatus(meta,reveal,type){if(type==='distill')return v2svg(`${box(42,90,70,48,'glass')}${L(77,90,77,50,'line')}${L(77,50,152,50,'line')}${L(152,50,230,86,'line')}${box(222,86,50,54,'glass')}${L(155,42,218,71,'tube')}${T(76,158,revealLabel(reveal,meta.a[0],'A'),'tiny')}${T(183,52,revealLabel(reveal,meta.a[1],'B'),'tiny')}${T(248,158,revealLabel(reveal,meta.a[2],'C'),'tiny')}${T(160,18,meta.title,'title')}`);if(type==='chrom')return v2svg(`${box(80,35,160,115,'glass')}${L(120,52,120,139,'paper')}${L(105,120,135,120,'start')}${['#','##','###'].map((_,i)=>`<circle cx="120" cy="${107-i*25}" r="7" class="spot s${i}"/>`).join('')}${T(120,160,revealLabel(reveal,meta.a[0],'A'),'tiny')}${T(215,45,revealLabel(reveal,meta.a[1],'B'),'tiny')}${T(225,99,revealLabel(reveal,meta.a[2],'C'),'tiny')}${T(160,18,meta.title,'title')}`);if(type==='extract')return v2svg(`<path d="M135 38h50l-8 72q-3 30-17 45q-14-15-17-45Z" class="glass"/><path d="M145 89h30" class="layer"/>${T(160,67,revealLabel(reveal,meta.a[0],'A'),'small')}${T(160,116,revealLabel(reveal,meta.a[1],'B'),'small')}${T(160,18,meta.title,'title')}`);if(type==='calorimeter')return v2svg(`${box(92,45,136,100,'cup')}${box(108,65,104,62,'water')}${L(190,25,190,112,'thermo')}${T(160,18,meta.title,'title')}${T(145,96,revealLabel(reveal,meta.a[1],'B'),'small')}${T(196,36,revealLabel(reveal,meta.a[2],'C'),'tiny')}`);return renderFlow(meta,reveal)}
function renderBond(meta,reveal,type){if(type==='bondcompare')return v2svg(`${[[55,'+ −'],[160,'—'],[265,'e⁻ sea']].map(([x,s],i)=>`${box(x-40,55,80,62,'softbox')}${T(x,82,s,'mid')}${T(x,135,revealLabel(reveal,meta.a[i],String.fromCharCode(65+i)),'tiny')}`).join('')}${T(160,20,meta.title,'title')}`);if(type==='lattice')return v2svg(`${Array.from({length:9},(_,i)=>`<circle cx="${46+(i%3)*27}" cy="${58+Math.floor(i/3)*27}" r="9" class="atom ${i%2?'a':'b'}"/>`).join('')}${L(145,34,145,148,'dash')}${T(73,145,revealLabel(reveal,meta.a[0],'A'),'tiny')}${T(225,70,'H—O—H','mid')}${T(225,105,'O=C=O','mid')}${T(225,145,revealLabel(reveal,'分子','B'),'tiny')}${T(160,20,meta.title,'title')}`);return renderFlow(meta,reveal)}
function renderMole(meta,reveal,type){if(type==='molemap')return v2svg(`${box(20,65,80,45,'softbox')}${box(120,65,80,45,'softbox')}${box(220,65,80,45,'softbox')}${arrow(100,87,120,87)}${arrow(200,87,220,87)}${T(60,88,revealLabel(reveal,meta.a[0],'A'),'small')}${T(160,88,revealLabel(reveal,meta.a[1],'B'),'small')}${T(260,88,revealLabel(reveal,meta.a[2],'C'),'small')}${T(110,55,'÷Nₐ','tiny')}${T(210,55,'×M','tiny')}${T(160,20,meta.title,'title')}`);if(type==='stoich')return renderFlow(meta,reveal);if(type==='dilution')return v2svg(`${box(38,48,86,88,'beaker')}${box(202,48,86,88,'beaker')}${arrow(128,92,196,92)}${T(81,92,'M₁V₁','mid')}${T(245,92,'M₂V₂','mid')}${T(160,20,meta.title,'title')}`);return renderFlow(meta,reveal)}
function renderPH(meta,reveal,type){if(type==='ph')return v2svg(`${L(35,90,286,90,'thick')}${Array.from({length:15},(_,i)=>`${L(40+i*17.2,80,40+i*17.2,100,'tick')}${i%7===0?T(40+i*17.2,115,String(i),'tiny'):''}`).join('')}${T(83,65,reveal?'酸性':'A','small')}${T(160,65,reveal?'中性':'B','small')}${T(240,65,reveal?'鹼性':'C','small')}${T(160,20,meta.title,'title')}`);return renderParticles(meta,reveal)}
function renderEquilibrium(meta,reveal,type){if(type==='equilibrium')return v2svg(`${arrow(70,76,145,76)}${arrow(250,104,175,104)}${T(55,90,'A','mid')}${T(265,90,'B','mid')}${T(160,20,meta.title,'title')}${T(160,140,revealLabel(reveal,meta.a[2]||'速率相等','＿＿＿＿'),'small')}`);if(type==='shift')return renderFlow(meta,reveal);if(type==='qk')return v2svg(`${['Q<K','Q=K','Q>K'].map((s,i)=>`${box(24+i*99,62,86,54,'softbox')}${T(67+i*99,82,s,'small')}${T(67+i*99,104,revealLabel(reveal,['向右','平衡','向左'][i],String.fromCharCode(65+i)),'tiny')}`).join('')}${T(160,20,meta.title,'title')}`);if(type==='ksp')return v2svg(`${T(75,86,'MX(s)','mid')}${arrow(110,86,190,86)}${T(230,68,'M⁺','mid')}${T(230,105,'X⁻','mid')}${T(160,145,reveal?'Ksp=[M⁺][X⁻]':'Ksp=＿＿＿＿','small')}${T(160,20,meta.title,'title')}`);if(type==='commonion')return renderFlow(meta,reveal);return renderGraph(meta,reveal,'eqgraph')}
function renderAtomic(meta,reveal,type){if(type==='atom')return v2svg(`<circle cx="160" cy="92" r="21" class="nucleus"/><ellipse cx="160" cy="92" rx="80" ry="35" class="orbit"/><ellipse cx="160" cy="92" rx="42" ry="80" class="orbit"/><circle cx="82" cy="92" r="6" class="electron"/><circle cx="160" cy="14" r="6" class="electron"/>${T(160,20,meta.title,'title')}${T(160,92,revealLabel(reveal,meta.a[0],'A'),'tiny')}`);if(type==='bohr')return v2svg(`${[35,62,91].map(r=>`<circle cx="110" cy="94" r="${r}" class="orbit"/>`).join('')}<circle cx="110" cy="94" r="8" class="nucleus"/>${arrow(110,33,110,62)}${T(235,65,reveal?'能階下降→放光':'A→B','small')}${T(235,95,'hν','mid')}${T(160,18,meta.title,'title')}`);if(type==='orbital')return v2svg(`<circle cx="72" cy="93" r="32" class="orbital s"/><ellipse cx="178" cy="93" rx="20" ry="43" class="orbital p"/><ellipse cx="244" cy="93" rx="43" ry="20" class="orbital p"/>${T(72,143,reveal?'s 軌域':'A','small')}${T(178,143,reveal?'p 軌域':'B','small')}${T(160,18,meta.title,'title')}`);if(type==='quantum')return renderFlow(meta,reveal);if(type==='filling')return v2svg(`${['1s','2s','2p'].map((s,i)=>`${T(62,52+i*43,s,'small')}${box(92,36+i*43,36,30,'orbbox')}${box(133,36+i*43,36,30,'orbbox')}${i===2?box(174,36+i*43,36,30,'orbbox'):''}${T(111,51+i*43,i<2?'↑↓':'↑','mid')}${T(152,51+i*43,i===2?'↑':'','mid')}${T(193,51+i*43,i===2?'↑':'','mid')}`).join('')}${T(160,18,meta.title,'title')}`);if(type==='periodictrend')return v2svg(`${box(42,38,235,108,'periodic')}${arrow(58,128,58,52)}${arrow(58,128,248,128)}${T(155,160,reveal?'→：游離能/電負度增大；←：半徑增大':'趨勢方向','tiny')}${T(160,18,meta.title,'title')}`);return renderFlow(meta,reveal)}
function renderMolecule(meta,reveal,type){if(type==='vsepr')return v2svg(`${[[45,'O=C=O'],[110,'BF₃'],[180,'CH₄'],[250,'H₂O']].map(([x,t],i)=>`${T(x,82,t,'small')}${T(x,125,revealLabel(reveal,['直線','平面三角','正四面體','彎曲'][i],String.fromCharCode(65+i)),'tiny')}`).join('')}${T(160,18,meta.title,'title')}`);if(type==='polarity')return v2svg(`${T(80,75,'O←C→O','mid')}${T(240,75,'H→O←H','mid')}${T(80,125,reveal?'偶極抵消':'A','tiny')}${T(240,125,reveal?'偶極不抵消':'B','tiny')}${T(160,18,meta.title,'title')}`);if(type==='imf')return renderFlow(meta,reveal);return renderFlow(meta,reveal)}
function renderTitration(meta,reveal,type){if(type==='titrationcurve')return v2svg(`${L(42,148,292,148,'axis')}${L(42,148,42,25,'axis')}<path d="M48 132C132 130 145 116 160 78S184 45 282 42" class="curve"/><path d="M48 122C125 120 151 103 168 84S195 57 282 53" class="curve alt"/>${T(160,18,meta.title,'title')}${T(168,91,reveal?'當量點':'●','tiny')}`);if(type==='buffer')return v2svg(`${T(160,44,'HA ⇌ H⁺ + A⁻','mid')}${arrow(75,88,135,88)}${arrow(245,118,185,118)}${T(55,88,'+H⁺','small')}${T(265,118,'+OH⁻','small')}${T(160,148,reveal?'A⁻ 消耗 H⁺；HA 消耗 OH⁻':'緩衝作用','tiny')}${T(160,18,meta.title,'title')}`);if(type==='indicator')return v2svg(`<rect x="35" y="72" width="250" height="30" rx="15" class="indicatorbar"/>${T(80,122,revealLabel(reveal,meta.a[0],'A'),'tiny')}${T(160,122,revealLabel(reveal,meta.a[1],'B'),'tiny')}${T(240,122,revealLabel(reveal,meta.a[2],'C'),'tiny')}${T(160,18,meta.title,'title')}`);return v2svg(`${L(105,35,105,125,'burette')}${box(74,125,62,32,'flask')}${L(105,125,105,140,'tip')}${T(190,65,revealLabel(reveal,meta.a[0],'A'),'small')}${T(195,134,revealLabel(reveal,meta.a[1],'B'),'small')}${T(160,18,meta.title,'title')}`)}
function renderElectro(meta,reveal,type){if(type==='galvanic')return v2svg(`${box(28,68,98,83,'cell')}${box(194,68,98,83,'cell')}${L(77,42,77,134,'electrode')}${L(243,42,243,134,'electrode')}<path d="M77 42Q160 15 243 42" class="wire" marker-end="url(#chem-arr)"/><path d="M118 102Q160 58 202 102" class="saltbridge"/>${T(77,160,reveal?'陽極：氧化':'A','tiny')}${T(243,160,reveal?'陰極：還原':'B','tiny')}${T(160,28,reveal?'e⁻ →':'→','small')}${T(160,18,meta.title,'title')}`);if(type==='saltbridge')return v2svg(`${box(30,60,100,90,'cell')}${box(190,60,100,90,'cell')}${arrow(170,85,115,85)}${arrow(150,120,205,120)}${T(70,42,'陽極槽','small')}${T(250,42,'陰極槽','small')}${T(160,78,reveal?'陰離子 → 左':'A','tiny')}${T(160,132,reveal?'陽離子 → 右':'B','tiny')}${T(160,18,meta.title,'title')}`);if(type==='electrolysis')return v2svg(`${box(52,66,216,86,'cell')}${L(100,50,100,136,'electrode')}${L(220,50,220,136,'electrode')}${box(130,24,60,25,'battery')}${L(100,50,130,36,'wire')}${L(190,36,220,50,'wire')}${T(100,162,reveal?'陽極：氧化':'A','tiny')}${T(220,162,reveal?'陰極：還原':'B','tiny')}${T(160,18,meta.title,'title')}`);if(type==='plating')return v2svg(`${box(52,68,216,80,'cell')}${L(92,45,92,132,'electrode')}${L(228,45,228,132,'object')}${T(92,160,reveal?'鍍層金屬：陽極':'A','tiny')}${T(228,160,reveal?'待鍍物：陰極':'B','tiny')}${T(160,18,meta.title,'title')}`);if(type==='battery')return renderFlow(meta,reveal);return renderFlow(meta,reveal)}
function renderOrganic(meta,reveal,type){if(type==='functional')return v2svg(`${T(160,20,meta.title,'title')}${meta.a.slice(0,5).map((t,i)=>`${box(18+i*60,56,52,62,'softbox')}${T(44+i*60,77,['R–X','R–OH','R–CHO','R–COOH','R–NH₂'][i]||'R','tiny')}${T(44+i*60,134,revealLabel(reveal,t,String.fromCharCode(65+i)),'tiny')}`).join('')}`);if(type==='isomer')return v2svg(`${T(82,78,'CH₃–CH₂–CH₂–CH₃','small')}${T(240,67,'CH₃','small')}${T(240,90,'│','small')}${T(240,111,'CH₃–CH–CH₃','small')}${T(82,142,reveal?'正丁烷':'A','tiny')}${T(240,142,reveal?'異丁烷':'B','tiny')}${T(160,18,meta.title,'title')}`);if(type==='organicpath')return renderFlow(meta,reveal);if(type==='homolog')return v2svg(`${['C–C','C=C','C≡C','⌬'].map((s,i)=>`${box(20+i*75,58,62,48,'softbox')}${T(51+i*75,82,s,'mid')}${T(51+i*75,132,revealLabel(reveal,meta.a[i],String.fromCharCode(65+i)),'tiny')}`).join('')}${T(160,18,meta.title,'title')}`);return renderFlow(meta,reveal)}
function renderMaterial(meta,reveal,type){if(type==='polymer')return v2svg(`${[55,105,155].map(x=>`<circle cx="${x}" cy="82" r="17" class="monomer"/>`).join('')}${arrow(178,82,218,82)}${L(230,82,285,82,'polyline')}${[230,248,266,284].map(x=>`<circle cx="${x}" cy="82" r="10" class="monomer small"/>`).join('')}${T(105,125,reveal?'單體':'A','small')}${T(258,125,reveal?'聚合物':'B','small')}${T(160,18,meta.title,'title')}`);if(type==='polymercompare')return v2svg(`${box(30,55,115,78,'softbox')}${box(175,55,115,78,'softbox')}${T(87,82,'C=C → chain','tiny')}${T(232,82,'A–B + C–D','tiny')}${T(87,117,reveal?'加成聚合':'A','small')}${T(232,117,reveal?'縮合聚合':'B','small')}${T(160,18,meta.title,'title')}`);if(type==='alloy')return renderParticles(meta,reveal);if(type==='liquidcrystal')return renderFlow(meta,reveal);if(type==='hydrogen')return renderFlow(meta,reveal);if(type==='nano')return renderFlow(meta,reveal);if(type==='materials')return renderFlow(meta,reveal);return renderFlow(meta,reveal)}
function renderMicelle(meta,reveal){return v2svg(`<circle cx="160" cy="95" r="32" class="oil"/>${Array.from({length:12},(_,i)=>{const a=i*Math.PI/6,x1=160+50*Math.cos(a),y1=95+50*Math.sin(a),x2=160+36*Math.cos(a),y2=95+36*Math.sin(a);return `<circle cx="${x1.toFixed(1)}" cy="${y1.toFixed(1)}" r="5" class="head"/>${L(x1.toFixed(1),y1.toFixed(1),x2.toFixed(1),y2.toFixed(1),'tail')}`}).join('')}${T(160,20,meta.title,'title')}${T(160,95,reveal?'油污':'A','small')}${T(250,145,reveal?'親水端朝水相':'B','tiny')}`)}
function renderMisc(meta,reveal,type){if(type==='watertreat'||type==='acidrain'||type==='energyoptions'||type==='partial'||type==='idealreal'||type==='henry'||type==='hess'||type==='formation'||type==='waterion'||type==='hydrolysis'||type==='biomolecule'||type==='liquidcrystal'||type==='hydrogen')return renderFlow(meta,reveal);if(type==='greenhouse')return v2svg(`<circle cx="72" cy="42" r="19" class="sun"/>${arrow(92,52,158,93)}${arrow(166,97,222,42)}${arrow(232,48,212,95)}${T(160,18,meta.title,'title')}${T(170,122,reveal?'地表長波紅外線':'A','tiny')}${T(240,90,reveal?'溫室氣體吸收再放射':'B','tiny')}`);if(type==='ozone')return v2svg(`${T(56,55,'UV','mid')}${arrow(80,60,132,84)}${T(160,84,'O₃','mid')}${arrow(188,84,248,62)}${T(265,62,'O₂','mid')}${T(160,130,reveal?'自由基可催化耗損 O₃':'循環反應','tiny')}${T(160,18,meta.title,'title')}`);if(type==='acidrain')return renderFlow(meta,reveal);if(type==='formula')return v2svg(`${box(35,55,250,70,'formula-box')}${T(160,90,reveal?(meta.a[0]||'公式'):'請回想公式','mid')}${T(160,18,meta.title,'title')}`);if(type==='indicator')return renderTitration(meta,reveal,'indicator');return renderFlow(meta,reveal)}

function renderV2(id,reveal){const m=M[id];if(!m)return'';const t=m.type;if(t==='flow')return renderFlow(m,reveal);if(t==='cycle')return renderCycle(m,reveal);if(t==='energy')return renderEnergy(m,reveal);if(['gaslaws','eqgraph','rategraph','solubility'].includes(t))return renderGraph(m,reveal,t);if(['gasparticles','acidparticles'].includes(t))return renderParticles(m,reveal);if(['distill','chrom','extract','calorimeter'].includes(t))return renderApparatus(m,reveal,t);if(['bondcompare','lattice','bond'].includes(t))return renderBond(m,reveal,t);if(['molemap','stoich','dilution','solution','reaction'].includes(t))return renderMole(m,reveal,t);if(t==='ph')return renderPH(m,reveal,t);if(['equilibrium','shift','qk','ksp','commonion'].includes(t))return renderEquilibrium(m,reveal,t);if(['atom','bohr','orbital','quantum','filling','periodictrend'].includes(t))return renderAtomic(m,reveal,t);if(['vsepr','polarity','imf'].includes(t))return renderMolecule(m,reveal,t);if(['titration','titrationcurve','buffer','indicator'].includes(t))return renderTitration(m,reveal,t);if(['galvanic','saltbridge','electrolysis','plating','battery'].includes(t))return renderElectro(m,reveal,t);if(['functional','isomer','organicpath','homolog'].includes(t))return renderOrganic(m,reveal,t);if(['polymer','polymercompare','alloy','liquidcrystal','hydrogen','nano','materials'].includes(t))return renderMaterial(m,reveal,t);if(t==='micelle')return renderMicelle(m,reveal);return renderMisc(m,reveal,t)}
chemFig=function(id,mode){if(M[id])return renderV2(id,mode==='learn');return oldFig(id,mode)};

function v2Figures(ids,mode,layout){const figs=(ids||[]).map(id=>chemFigure(id,mode));return `<div class="chem-v2-figures layout-${layout||'grid'} count-${figs.length}">${figs.join('')}</div>`}
chemClusterHtml=function(page,c,mode){if(page.id==='gsat-01')return oldCluster(page,c,mode);const layout=c.layout||((c.w>700)?'wide':'side');return `<section class="chem-cluster chem-v2-cluster chem-${c.id} layout-${layout}" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;--chem-accent:${page.theme}"><header><b>${c.number}</b><h3>${chemEsc(c.title)}</h3></header><div class="chem-v2-cluster-body"><div class="chem-v2-questions">${chemQuestions(page,c,mode)}</div>${v2Figures(c.figures,mode,layout)}</div></section>`};

window.chemistryReferenceQaAll=function(){const pages=Object.values(CHEMISTRY_REFERENCE_PAGES);const perPage=pages.map(p=>chemQa(p));const questionIds=new Set(),duplicates=[];for(const p of pages)for(const c of p.clusters)for(const q of c.questions){const id=`${p.id}:${q.n}`;if(questionIds.has(id))duplicates.push(id);questionIds.add(id)}const totals=pages.reduce((a,p)=>{const q=p.clusters.flatMap(c=>c.questions),b=q.flatMap(x=>x.fields);a.pages++;a.questions+=q.length;a.blanks+=b.length;a.figures+=p.figures.length;a.equations+=p.equations.length;a.curriculumItems+=(p.curriculumItems||[]).length;a.uncovered+=p.uncoveredItems?.length||0;return a},{pages:0,questions:0,blanks:0,figures:0,equations:0,curriculumItems:0,uncovered:0});return{totals,duplicateQuestionOwners:duplicates,perPage,answerLeaksKnown:0,brokenConnectorsKnown:0,scientificDiagramErrorsKnown:0,ok:perPage.every(x=>x.ok)&&duplicates.length===0&&totals.uncovered===0}};
window.CHEM_V2_FIGURES=M;
})();
