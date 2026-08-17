// GSAT Chemistry Page 2 — mandatory Vc only.
// Visual grammar follows the user's six Earth Science workbook reference pages:
// dense integrated textbook sheet, numbered clusters, many nearby explanatory diagrams, no dashboard cards.
(function chemistryGsatPage2V4(){
  if(typeof CHEMISTRY_REFERENCE_PAGES==='undefined'||typeof CHEMISTRY_REFERENCE_TRACKS==='undefined')return;

  const PAGE={
    id:'gsat-02',track:'gsat',number:2,title:'能量、分離與鍵結',theme:'#0b7f86',theme2:'#0c8d96',
    curriculumCodes:['CBa-Vc-1','CBa-Vc-2','CCa-Vc-1','CCa-Vc-2','CCb-Vc-1','CCb-Vc-2','CEc-Vc-1'],
    clusters:[
      {
        id:'energy',number:1,title:'化學反應與能量',x:28,y:154,w:944,h:272,layout:'split',
        questions:[
          {n:1,prompt:'化學反應伴隨能量變化；向環境釋放能量的是 {{0}} 反應，從環境吸收能量的是 {{1}} 反應。',fields:[{answer:'放熱',aliases:['放熱反應']},{answer:'吸熱',aliases:['吸熱反應']}]},
          {n:2,prompt:'放熱反應中，反應物所具有的化學能通常比產物 {{0}}；差值以熱、光等形式傳至環境。',fields:[{answer:'高',aliases:['較高','大','較大']}]},
          {n:3,prompt:'吸熱反應中，產物所具有的化學能通常比反應物 {{0}}，因此反應過程需要由環境取得能量。',fields:[{answer:'高',aliases:['較高','大','較大']}]},
          {n:4,prompt:'能量可以在化學能、熱能、光能與電能之間轉換，但總能量遵守 {{0}} 定律。',fields:[{answer:'能量守恆',aliases:['能量守恆定律']}]},
          {n:5,prompt:'電池將反應物的 {{0}} 能轉換成電能；燃燒常將化學能轉換成 {{1}} 與光能。',fields:[{answer:'化學',aliases:['化學能']},{answer:'熱能',aliases:['熱','熱能量']}]}
        ],figures:['exo-profile','endo-profile','energy-conservation']
      },
      {
        id:'separation',number:2,title:'混合物的分離與純化',x:28,y:442,w:944,h:336,layout:'split',
        questions:[
          {n:6,prompt:'混合物可利用各成分在粒徑、沸點、溶解度或吸附能力等 {{0}} 性質差異加以分離。',fields:[{answer:'物理',aliases:['物理性質']}]},
          {n:7,prompt:'蒸餾利用不同成分的 {{0}} 差異，使較易汽化的成分先形成蒸氣，再冷凝收集。',fields:[{answer:'沸點',aliases:['沸點高低']}]},
          {n:8,prompt:'萃取利用物質在兩種互不相溶溶劑中的 {{0}} 不同，使溶質轉移到較適合的溶劑層。',fields:[{answer:'溶解度',aliases:['溶解性']}]},
          {n:9,prompt:'層析中，各成分對固定相與流動相的作用力不同，因此移動 {{0}} 不同而分離。',fields:[{answer:'速率',aliases:['速度','快慢']}]},
          {n:10,prompt:'海水淡化可用蒸餾或薄膜方法移除鹽分；硬水軟化的目的之一是降低 {{0}}、{{1}} 等離子的含量。',fields:[{answer:'鈣離子',aliases:['Ca2+','Ca²⁺','鈣']},{answer:'鎂離子',aliases:['Mg2+','Mg²⁺','鎂']}]},
          {n:11,prompt:'若溶液中加入試劑生成難溶固體，可利用 {{0}} 反應分離或鑑別特定離子。',fields:[{answer:'沉澱',aliases:['沉澱反應']}]}
        ],figures:['distillation','separatory-funnel','chromatography','water-treatment']
      },
      {
        id:'bonding',number:3,title:'化學鍵、結構與性質',x:28,y:794,w:944,h:312,layout:'split',
        questions:[
          {n:12,prompt:'正、負離子間的靜電吸引形成 {{0}} 鍵；常形成延伸的離子晶格。',fields:[{answer:'離子',aliases:['離子鍵']}]},
          {n:13,prompt:'原子藉由共用電子形成 {{0}} 鍵；許多非金屬化合物以獨立分子存在。',fields:[{answer:'共價',aliases:['共價鍵']}]},
          {n:14,prompt:'金屬原子間具有可移動的價電子，因此金屬通常具有良好的 {{0}} 性與延展性。',fields:[{answer:'導電',aliases:['導電性','電傳導性']}]},
          {n:15,prompt:'離子化合物熔融或溶於水後可導電，是因帶電的 {{0}} 能夠移動。',fields:[{answer:'離子',aliases:['正負離子','陰陽離子']}]},
          {n:16,prompt:'化學鍵與微觀結構不同，會造成熔點、硬度、導電性等 {{0}} 性質差異。',fields:[{answer:'巨觀',aliases:['宏觀','物質']}]},
          {n:17,prompt:'比較 NaCl 晶格、H₂O 分子與金屬晶體時，要由「{{0}} → 結構 → 性質」建立因果關係。',fields:[{answer:'鍵結',aliases:['化學鍵','鍵結方式']}]}
        ],figures:['ionic-lattice','covalent-molecule','metallic-model']
      },
      {
        id:'gas',number:4,title:'氣體的基本性質',x:28,y:1122,w:944,h:218,layout:'split',
        questions:[
          {n:18,prompt:'氣體粒子間距通常很 {{0}}，因此氣體容易被壓縮，且密度通常比液體、固體小。',fields:[{answer:'大',aliases:['較大','很大']}]},
          {n:19,prompt:'氣體沒有固定形狀與體積，會 {{0}} 容器可用的空間。',fields:[{answer:'充滿',aliases:['填滿','占滿','充滿整個']}]},
          {n:20,prompt:'氣體壓力可由粒子持續 {{0}} 容器壁來理解；單位面積上的撞擊效應越大，壓力越大。',fields:[{answer:'碰撞',aliases:['撞擊','撞擊碰撞']}]},
          {n:21,prompt:'同一氣體受熱時，粒子的平均運動速率通常 {{0}}；冷卻時則相反。',fields:[{answer:'增加',aliases:['變快','增大','提高']}]}
        ],figures:['gas-particles','gas-pressure']
      }
    ],
    figures:[
      {id:'exo-profile',purpose:'用能階高低與向外熱箭頭理解放熱。'},
      {id:'endo-profile',purpose:'用能階高低與向內熱箭頭理解吸熱。'},
      {id:'energy-conservation',purpose:'將化學能、熱能、光能、電能以轉換環連接。'},
      {id:'distillation',purpose:'呈現汽化、冷凝與收集流程。'},
      {id:'separatory-funnel',purpose:'用兩液層與分液漏斗理解萃取。'},
      {id:'chromatography',purpose:'用色帶不同移動距離理解層析。'},
      {id:'water-treatment',purpose:'連結海水淡化、硬水離子與分離技術。'},
      {id:'ionic-lattice',purpose:'用交錯正負離子呈現離子晶格。'},
      {id:'covalent-molecule',purpose:'用共用電子的分子模型呈現共價鍵。'},
      {id:'metallic-model',purpose:'用金屬陽離子與離域電子呈現導電性。'},
      {id:'gas-particles',purpose:'用大間距粒子呈現氣體可壓縮、充滿容器。'},
      {id:'gas-pressure',purpose:'用粒子撞擊容器壁理解氣壓。'}
    ],
    equations:[],uncoveredItems:[]
  };
  CHEMISTRY_REFERENCE_PAGES[PAGE.id]=PAGE;
  const meta=CHEMISTRY_REFERENCE_TRACKS.gsat.pages.find(p=>p.id===PAGE.id);if(meta)meta.implemented=true;
  window.CHEMISTRY_GSAT_PAGE_2=PAGE;

  const oldFig=chemFig;
  chemFig=function(id,mode){const reveal=mode==='learn';
    if(id==='exo-profile'||id==='endo-profile'){
      const exo=id==='exo-profile',rY=exo?48:124,pY=exo?124:48;
      return chemSvg(`<g class="energy-profile"><path d="M35 150H292M45 158V18" class="axes"/><path d="M56 ${rY}C105 ${rY-4} 112 28 160 30S220 ${pY} 270 ${pY}" class="curve"/><path d="M74 ${rY}H115M218 ${pY}H262" class="level"/><path d="M285 ${exo?80:112}v${exo?42:-42}" class="heat-arrow" marker-end="url(#chem-arr)"/></g>${chemTxt(160,15,reveal?(exo?'放熱反應':'吸熱反應'):'能量變化 A','fig-title')}${chemTxt(91,rY-12,reveal?'反應物':'A','fig-small')}${chemTxt(240,pY-12,reveal?'產物':'B','fig-small')}${chemTxt(281,96,reveal?(exo?'能量釋出':'能量吸收'):'能量','fig-tiny')}`,'0 0 320 175');
    }
    if(id==='energy-conservation')return chemSvg(`<g class="energy-cycle"><circle cx="160" cy="88" r="62" class="cycle-ring"/><g>${[[160,25],[221,88],[160,151],[99,88]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="24" class="energy-node n${i}"/>`).join('')}</g><path d="M184 36q30 16 27 38M211 112q-13 30-36 32M136 144q-28-13-30-36M108 64q13-27 36-31" class="chem-arrow" marker-end="url(#chem-arr)"/></g>${reveal?chemTxt(160,25,'化學能','node-label'):chemTxt(160,25,'A','node-label')}${reveal?chemTxt(221,88,'熱能','node-label'):chemTxt(221,88,'B','node-label')}${reveal?chemTxt(160,151,'光能','node-label'):chemTxt(160,151,'C','node-label')}${reveal?chemTxt(99,88,'電能','node-label'):chemTxt(99,88,'D','node-label')}`,'0 0 320 178');
    if(id==='distillation')return chemSvg(`<g class="apparatus"><path d="M55 133q-20-38 8-70h48q28 32 8 70z" class="glass"/><path d="M82 63V33h32M114 33h36v16M150 49l88 44M150 49l13-20M238 93l-13 20M238 93h26v37" class="tube"/><path d="M225 113h48v27h-48z" class="glass"/><path d="M74 125h38" class="liquid"/><path d="M164 39l62 32" class="coolant"/></g>${chemTxt(160,16,reveal?'蒸餾：汽化 → 冷凝 → 收集':'分離裝置 A','fig-title')}${chemTxt(86,151,reveal?'混合液':'A','fig-tiny')}${chemTxt(250,151,reveal?'餾出液':'B','fig-tiny')}`,'0 0 320 175');
    if(id==='separatory-funnel')return chemSvg(`<g class="sep-funnel"><path d="M107 25h106l-20 65v30l-18 16h-30l-18-16V90z" class="glass"/><path d="M127 86h66l-8 28h-50z" class="layer layer1"/><path d="M118 51h84l-8 31h-68z" class="layer layer2"/><path d="M160 136v22M149 148h22" class="tube"/></g>${chemTxt(160,15,reveal?'分液漏斗：兩種互不相溶液層':'分離裝置 B','fig-title')}${chemTxt(160,66,reveal?'溶劑層 1':'A層','fig-small')}${chemTxt(160,101,reveal?'溶劑層 2':'B層','fig-small')}`,'0 0 320 175');
    if(id==='chromatography')return chemSvg(`<g class="chrom"><rect x="64" y="22" width="192" height="130" rx="8" class="paper"/><path d="M78 128H242" class="baseline"/><circle cx="105" cy="128" r="4" class="spot s1"/><circle cx="160" cy="128" r="4" class="spot s2"/><circle cx="215" cy="128" r="4" class="spot s3"/><circle cx="105" cy="82" r="9" class="spot s1"/><circle cx="160" cy="55" r="9" class="spot s2"/><circle cx="215" cy="99" r="9" class="spot s3"/><path d="M80 39H240" class="solvent-front"/></g>${chemTxt(160,14,reveal?'層析：不同成分移動速率不同':'分離圖 C','fig-title')}${chemTxt(160,165,reveal?'起點 → 隨流動相向上移動':'比較移動距離','fig-tiny')}`,'0 0 320 178');
    if(id==='water-treatment')return chemSvg(`<g class="water-tech"><rect x="18" y="42" width="78" height="88" rx="9" class="tank"/><path d="M30 93h54" class="water"/><g>${[[42,70,'ion-a'],[67,60,'ion-b'],[55,105,'ion-a'],[78,105,'ion-b']].map(([x,y,c])=>`<circle cx="${x}" cy="${y}" r="7" class="${c}"/>`).join('')}</g><path d="M106 86H150" class="chem-arrow" marker-end="url(#chem-arr)"/><rect x="160" y="42" width="42" height="88" rx="8" class="membrane"/><path d="M212 86H258" class="chem-arrow" marker-end="url(#chem-arr)"/><rect x="265" y="51" width="37" height="70" rx="8" class="tank clean"/></g>${chemTxt(58,24,reveal?'含鹽／硬水':'原水','fig-small')}${chemTxt(181,24,reveal?'薄膜／離子交換':'處理','fig-small')}${chemTxt(283,24,reveal?'低離子水':'產水','fig-small')}`,'0 0 320 160');
    if(id==='ionic-lattice')return chemSvg(`<g class="lattice">${Array.from({length:4},(_,r)=>Array.from({length:5},(_,c)=>`<circle cx="${65+c*38}" cy="${42+r*34}" r="12" class="atom ${(r+c)%2?'a':'b'}"/><text x="${65+c*38}" y="${42+r*34}" class="ion-sign">${reveal?((r+c)%2?'+':'−'):''}</text>`).join('')).join('')}</g>${chemTxt(160,16,reveal?'離子晶格':'結構模型 A','fig-title')}`,'0 0 320 175');
    if(id==='covalent-molecule')return chemSvg(`<g class="cov-mol"><circle cx="160" cy="78" r="23" class="atom b"/><circle cx="112" cy="105" r="16" class="atom a"/><circle cx="208" cy="105" r="16" class="atom a"/><path d="M130 97L143 88M190 88l13 9" class="bond"/><circle cx="138" cy="91" r="3" class="electron"/><circle cx="182" cy="91" r="3" class="electron"/></g>${chemTxt(160,18,reveal?'共用電子形成共價鍵':'結構模型 B','fig-title')}${chemTxt(160,151,reveal?'獨立分子':'粒子單位','fig-small')}`,'0 0 320 175');
    if(id==='metallic-model')return chemSvg(`<g class="metal-model">${Array.from({length:3},(_,r)=>Array.from({length:5},(_,c)=>`<circle cx="70+${c*45}" cy="52+${r*42}" r="14" class="metal-ion"/>`).join('')).join('')}${[[92,36],[138,71],[182,37],[230,92],[112,126],[205,130]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" class="electron"/>`).join('')}<path d="M88 36h40M204 130h35M124 126h33" class="electron-path"/></g>${chemTxt(160,17,reveal?'金屬晶體與可移動電子':'結構模型 C','fig-title')}`,'0 0 320 175');
    if(id==='gas-particles')return chemSvg(`<g class="gasbox"><rect x="35" y="30" width="250" height="115" rx="10"/>${[[68,62],[112,115],[155,56],[206,103],[254,62],[80,125],[182,128],[235,128]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="8" class="atom ${i%2?'b':'a'}"/>`).join('')}<path d="M67 62l20-12M155 56l18 15M254 62l-18 10" class="motion"/></g>${chemTxt(160,17,reveal?'粒子間距大、自由移動':'氣體粒子模型','fig-title')}`,'0 0 320 170');
    if(id==='gas-pressure')return chemSvg(`<g class="pressure-box"><rect x="35" y="30" width="250" height="115" rx="10"/>${[[82,70,18,-10],[126,115,-15,-14],[175,62,19,12],[225,110,20,-15],[260,60,-19,14]].map(([x,y,dx,dy],i)=>`<circle cx="${x}" cy="${y}" r="8" class="atom ${i%2?'b':'a'}"/><path d="M${x} ${y}l${dx} ${dy}" class="motion" marker-end="url(#chem-arr)"/>`).join('')}<path d="M278 46v30M278 93v30" class="wall-hit"/></g>${chemTxt(160,17,reveal?'粒子撞擊器壁 → 氣體壓力':'氣壓微觀模型','fig-title')}`,'0 0 320 170');
    return oldFig(id,mode);
  };

  const previousClusterHtml=chemClusterHtml;
  chemClusterHtml=function(page,c,mode){
    if(page?.id!==PAGE.id)return previousClusterHtml(page,c,mode);
    const figs=(c.figures||[]).map(id=>chemFigure(id,mode)).join('');
    return `<section class="chem-cluster chem2-${c.id}" style="left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px;--chem-accent:${page.theme}"><header><b>${c.number}</b><h3>${chemEsc(c.title)}</h3></header><div class="chem-cluster-body chem2-body"><div class="chem2-questions">${chemQuestions(page,c,mode)}</div><div class="chem2-figures chem2-figures-${c.figures.length}">${figs}</div></div></section>`;
  };

  const previousConnectorLayer=chemConnectorLayer;
  chemConnectorLayer=function(){
    const paper=document.querySelector?.('.chem-paper');
    const targetId=paper?.dataset?.chemPaper||state.chemistryPageId;
    if(targetId!==PAGE.id)return previousConnectorLayer();
    return `<svg class="chem-connectors" viewBox="0 0 1000 1414" aria-hidden="true"><defs><marker id="chem-page-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z"/></marker></defs><path d="M500 427V440"/><path d="M500 779V792"/><path d="M500 1107V1120"/></svg>`;
  };
})();
