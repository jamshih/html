/* Earth mind map 2026-08-17 — six-page source-reference replacement.
   Loaded last. It replaces ONLY the Earth-science mind-map surface and leaves
   the rest of Wrong Book on the existing renderer. */
(function(){
  const legacyMindmapPage = typeof mindmapPage === 'function' ? mindmapPage : null;

  const PAGES = [
    {
      id:'earth-ref-1', title:'宇宙與天體', accent:'#0b5f9f', accent2:'#158993', kicker:'脈絡整合 1・填空練習',
      sections:[
        {id:'scale', title:'宇宙尺度與單位', visual:'cosmos-scale', questions:[
          ['u1','光在真空中行進一年的距離稱為 {0}。',['光年'],'先想這是一個距離單位。'],
          ['u2','1 光年約等於 {0} 公里。',['9.46×10^12'],'9.46 乘以 10 的 12 次方。'],
          ['u3','地球到太陽的平均距離稱為 1 {0}。',['AU'],'天文單位的英文縮寫。'],
          ['u4','1 AU 約等於 {0} 公里。',['1.5×10^8'],'約一億五千萬公里。'],
          ['u5','由小到大的尺度可整理為：地球 → 太陽系 → 恆星系統 → {0} → 觀測宇宙。',['星系'],'銀河系就屬於這一層級。']
        ]},
        {id:'galaxy', title:'星系與銀河系', visual:'galaxy', questions:[
          ['g1','由大量恆星、氣體、塵埃與暗物質組成的大型結構稱為 {0}。',['星系'],'銀河系就是其中一個。'],
          ['g2','依外形，星系常分為渦旋星系、{0} 星系與不規則星系。',['橢圓'],'想三種常見外觀。'],
          ['g3','我們所在的銀河系屬於典型的 {0} 星系。',['棒旋'],'中央具有棒狀結構。'],
          ['g4','太陽位在銀河系的 {0} 附近。',['獵戶臂'],'Orion Arm。'],
          ['g5','銀河系直徑約 {0} 光年，盤面厚度約 {1} 光年。',['10萬','1000'],'先記直徑約十萬，厚度約一千。']
        ]},
        {id:'stars', title:'恆星與星雲', visual:'star-life', questions:[
          ['s1','由低溫氣體與塵埃組成、也是恆星誕生場所的雲狀構造稱為 {0}。',['星雲'],'恆星的搖籃。'],
          ['s2','恆星最穩定、壽命最長且核心持續核融合的階段稱為 {0}。',['主序星'],'太陽目前就在這個階段。'],
          ['s3','較大質量恆星離開主序階段後，外層膨脹可成為 {0}。',['紅超巨星'],'比紅巨星更適用於高質量恆星。'],
          ['s4','高質量恆星晚期可能發生劇烈的 {0} 爆發。',['超新星'],'爆發後殘骸依質量走向不同結局。'],
          ['s5','恆星殘骸依質量可能成為白矮星、{0} 或黑洞。',['中子星'],'介於白矮星與黑洞之間。']
        ]},
        {id:'evolution', title:'宇宙演化', visual:'universe-timeline', questions:[
          ['e1','哈伯觀測顯示，星系的退行速度與距離大致成 {0}。',['正比'],'距離越遠，退行越快。'],
          ['e2','這項觀測支持宇宙正在持續 {0}。',['膨脹'],'不是靜止宇宙。'],
          ['e3','宇宙約在 {0} 億年前由高溫高密度狀態開始演化。',['138'],'約 13.8 billion years。'],
          ['e4','宇宙大霹靂後約 38 萬年留下、今天仍可觀測的微波背景稱為 {0}。',['宇宙背景輻射'],'縮寫 CMB。'],
          ['e5','宇宙演化大致依序為大霹靂 → 膨脹冷卻 → CMB → 恆星與星系形成 → {0} → 現在。',['太陽系形成'],'約 46 億年前。']
        ]}
      ]
    },
    {
      id:'earth-ref-2', title:'太陽系與地球運動', accent:'#087f87', accent2:'#16a0a3', kicker:'脈絡整合 2・填空練習',
      sections:[
        {id:'solar', title:'太陽系成員與分類', visual:'solar-system', questions:[
          ['p1','太陽系的中心天體是 {0}，提供主要的光與能量。',['太陽'],'它也是一顆恆星。'],
          ['p2','八大行星由近到遠為水星、金星、地球、火星、{0}、土星、天王星、海王星。',['木星'],'火星之後的第一顆巨行星。'],
          ['p3','水星、金星、地球、火星屬於 {0} 行星。',['類地'],'岩質、密度較大。'],
          ['p4','木星、土星、天王星、海王星屬於 {0} 行星。',['類木'],'體積較大，主要由氣體或冰組成。'],
          ['p5','多數小行星集中在 {0} 與木星軌道之間。',['火星'],'小行星帶的位置。']
        ]},
        {id:'rotation', title:'地球自轉與公轉', visual:'seasons-orbit', questions:[
          ['r1','地球由西向東自轉一周約需 {0} 小時。',['24'],'造成晝夜交替。'],
          ['r2','地球繞太陽公轉一周約需 {0} 天。',['365.25'],'所以曆法需要閏年調整。'],
          ['r3','地球公轉軌道近似 {0}。',['橢圓'],'不是完美圓形。'],
          ['r4','地軸與公轉軌道面法線夾角約 {0}°。',['23.5'],'四季的重要原因之一。'],
          ['r5','地球公轉與地軸傾斜共同造成 {0} 變化。',['四季'],'不是單純因日地距離。']
        ]},
        {id:'seasons', title:'四季與晝夜', visual:'day-night', questions:[
          ['d1','北半球夏至時，太陽直射 {0}。',['北回歸線'],'約 23.5°N。'],
          ['d2','北半球冬至時，太陽直射 {0}。',['南回歸線'],'約 23.5°S。'],
          ['d3','春分與秋分時，全球大致呈現 {0}。',['晝夜等長'],'太陽直射赤道附近。'],
          ['d4','緯度越高，季節造成的 {0} 長短差異通常越明顯。',['晝夜'],'極圈甚至會出現極晝極夜。'],
          ['d5','北半球觀測時，北極星高度角約等於當地的 {0}。',['緯度'],'常用來估算觀測地位置。']
        ]},
        {id:'moon', title:'月相、日月食與觀測', visual:'moon-phases', questions:[
          ['m1','月球繞地球公轉造成日、地、月相對位置改變，形成不同的 {0}。',['月相'],'新月、上弦、滿月、下弦。'],
          ['m2','一個朔望月約為 {0} 天。',['29.5'],'月相週期。'],
          ['m3','日食發生時，{0} 位在太陽與地球之間。',['月球'],'通常接近新月。'],
          ['m4','月食發生時，{0} 位在太陽與月球之間。',['地球'],'通常接近滿月。'],
          ['m5','觀測太陽時不可直接以肉眼或一般望遠鏡直視，必須使用合格的 {0}。',['濾光設備'],'保護眼睛。']
        ]}
      ]
    },
    {
      id:'earth-ref-3', title:'地球的起源與演變', accent:'#228539', accent2:'#54a34d', kicker:'脈絡整合 3・填空練習',
      sections:[
        {id:'nebula', title:'太陽星雲與行星形成', visual:'accretion', questions:[
          ['n1','太陽系約在 {0} 億年前由旋轉的氣體與塵埃雲收縮形成。',['46'],'約 4.6 billion years。'],
          ['n2','解釋太陽系形成常使用 {0} 假說。',['太陽星雲'],'又稱星雲說。'],
          ['n3','星雲收縮後形成扁平的 {0}，中央逐漸形成原始太陽。',['原行星盤'],'物質在盤中繞中心旋轉。'],
          ['n4','盤面物質經碰撞、黏合形成小型的 {0}。',['微惑星'],'planetesimals。'],
          ['n5','微惑星持續碰撞與 {0}，最後成長為原始行星。',['吸積'],'重力會促進聚集。']
        ]},
        {id:'early-earth', title:'早期地球與分層', visual:'earth-layers', questions:[
          ['f1','早期地球因撞擊與放射性衰變產熱，表面曾存在廣泛的 {0}。',['岩漿海'],'地球一度高度熔融。'],
          ['f2','熔融時密度大的鐵、鎳下沉，密度小的矽酸鹽上升，稱為 {0}。',['重力分異'],'也叫密度分異。'],
          ['f3','地球由外向內可概分為地殼、{0}、外核、內核。',['地函'],'mantle。'],
          ['f4','外核主要為液態的鐵鎳，流動可產生地球的 {0}。',['磁場'],'地磁的重要來源。'],
          ['f5','內核雖溫度很高，因壓力極大仍維持 {0}。',['固態'],'高壓改變物質狀態。']
        ]},
        {id:'geotime', title:'地質年代與生物演化', visual:'geologic-time', questions:[
          ['t1','地球歷史大致可分為前寒武紀、古生代、{0} 與新生代。',['中生代'],'恐龍繁盛的時代。'],
          ['t2','大量海洋生物類群在古生代早期迅速出現，稱為 {0}。',['寒武紀大爆發'],'Cambrian Explosion。'],
          ['t3','恐龍主要繁盛於 {0}。',['中生代'],'約 2.52 億年至 6600 萬年前。'],
          ['t4','約 6600 萬年前的大滅絕使非鳥類恐龍消失，之後 {0} 快速輻射演化。',['哺乳類'],'新生代的重要特色。'],
          ['t5','藍綠菌的光合作用長期改變大氣，使環境中的 {0} 增加。',['氧氣'],'為後來複雜生命演化創造條件。']
        ]},
        {id:'dating', title:'化石與定年方法', visual:'dating', questions:[
          ['a1','生物遺骸、遺跡或活動痕跡被保存於岩層中，稱為 {0}。',['化石'],'可提供古環境與演化證據。'],
          ['a2','利用地層上下與切割關係判斷先後順序屬於 {0} 定年。',['相對'],'不直接給出實際年數。'],
          ['a3','在未倒轉的沉積岩層中，通常下層較老、上層較新，稱為 {0} 原理。',['疊置'],'superposition。'],
          ['a4','利用放射性同位素衰變求實際年齡屬於 {0} 定年。',['絕對'],'可得到數值年齡。'],
          ['a5','放射性母元素衰變到剩一半所需的時間稱為 {0}。',['半衰期'],'每種核種有特定半衰期。']
        ]}
      ]
    },
    {
      id:'earth-ref-4', title:'固體地球', accent:'#eb6d12', accent2:'#f08b33', kicker:'脈絡整合 4・填空練習',
      sections:[
        {id:'quake-terms', title:'地震相關名詞', visual:'earthquake', questions:[
          ['q1','地震最初發生破裂並釋放能量的位置稱為 {0}。',['震源'],'位在地下。'],
          ['q2','震源在地表上的垂直投影位置稱為 {0}。',['震央'],'epicenter。'],
          ['q3','描述某地實際搖晃強弱、會隨距離與地質而改變的是 {0}。',['震度'],'同一次地震各地可不同。'],
          ['q4','描述一次地震釋放能量大小、同一次地震只有一個值的是 {0}。',['規模'],'不要和震度混淆。'],
          ['q5','地震發生時由震源向外傳遞能量的波動稱為 {0}。',['地震波'],'包括 P 波與 S 波。']
        ]},
        {id:'waves', title:'地震波種類', visual:'seismic-waves', questions:[
          ['w1','P 波屬於 {0} 波，介質粒子振動方向與傳播方向平行。',['縱'],'壓縮與疏鬆交替。'],
          ['w2','S 波屬於 {0} 波，介質粒子振動方向與傳播方向垂直。',['橫'],'上下或左右振動。'],
          ['w3','P 波可通過固體、液體與氣體；S 波只能通過 {0}。',['固體'],'液體不能傳遞剪力波。'],
          ['w4','同一測站通常先收到 {0} 波，再收到 S 波。',['P'],'P 波較快。'],
          ['w5','P、S 波到時差越大，通常表示測站離震央越 {0}。',['遠'],'時差可用於估距。']
        ]},
        {id:'lithosphere', title:'地殼、岩石圈、軟流圈', visual:'lithosphere', questions:[
          ['l1','大陸地殼平均較 {0}，海洋地殼平均較薄。',['厚'],'大陸約數十公里，海洋約數公里。'],
          ['l2','大陸地殼以較富 Si、Al 的 {0} 岩質為代表。',['花崗'],'花崗岩質。'],
          ['l3','海洋地殼以較富 Fe、Mg 的 {0} 岩質為代表。',['玄武'],'玄武岩質。'],
          ['l4','地殼與最上部地函的剛性部分合稱 {0}。',['岩石圈'],'板塊位在這裡。'],
          ['l5','岩石圈下方、可緩慢塑性流動的區域稱為 {0}。',['軟流圈'],'板塊可在其上運動。']
        ]},
        {id:'interior', title:'地函、外核與內核', visual:'earth-interior', questions:[
          ['i1','地殼與地函的分界稱為 {0} 不連續面。',['莫氏'],'Moho。'],
          ['i2','地函厚度約 {0} km。',['2900'],'地殼以下直到外核。'],
          ['i3','地函與外核的分界稱為 {0} 不連續面。',['古氏'],'Gutenberg discontinuity。'],
          ['i4','外核呈 {0} 態，而內核呈固態。',['液'],'S 波無法穿過外核。'],
          ['i5','外核與內核的分界稱為 {0} 不連續面。',['雷曼'],'Lehmann discontinuity。']
        ]}
      ]
    },
    {
      id:'earth-ref-5', title:'大氣與天氣', accent:'#5d4ba0', accent2:'#7467b6', kicker:'脈絡整合 5・填空練習',
      sections:[
        {id:'atmos', title:'大氣組成與分層', visual:'atmosphere', questions:[
          ['at1','乾燥空氣中含量最多的是 {0}，約占 78%。',['氮氣'],'N₂。'],
          ['at2','含量第二多的是 {0}，約占 21%。',['氧氣'],'O₂。'],
          ['at3','臭氧層主要位於 {0} 層，可吸收大部分紫外線。',['平流'],'約 20–30 km 最集中。'],
          ['at4','雲、雨、風等多數天氣現象發生在 {0} 層。',['對流'],'最靠近地表。'],
          ['at5','對流層中平均氣溫通常隨高度增加而 {0}。',['降低'],'平均環境直減率約 6.5°C/km。']
        ]},
        {id:'pressure', title:'氣壓與風', visual:'pressure-wind', questions:[
          ['pr1','氣壓是空氣重量作用在單位 {0} 上的壓力。',['面積'],'pressure = force / area 的概念。'],
          ['pr2','近地面若只考慮氣壓梯度，空氣由 {0} 壓流向低壓。',['高'],'壓差驅動風。'],
          ['pr3','高壓中心常伴隨空氣 {0}，近地面向外發散。',['下沉'],'下沉氣流較不利雲雨。'],
          ['pr4','低壓中心常伴隨空氣上升，近地面向內 {0}。',['輻合'],'上升氣流較容易形成雲雨。'],
          ['pr5','受科氏力影響，北半球運動中的空氣會向前進方向的 {0} 偏。',['右'],'南半球相反。']
        ]},
        {id:'humidity', title:'水氣、濕度與雲雨', visual:'cloud-cycle', questions:[
          ['h1','大氣水氣主要來自蒸發、植物 {0} 與冰雪昇華。',['蒸散'],'evapotranspiration。'],
          ['h2','空氣實際水氣量相對於同溫度最大可容納水氣量的百分比稱為 {0}。',['相對濕度'],'飽和時為 100%。'],
          ['h3','空氣冷卻到剛好飽和時的溫度稱為 {0}。',['露點'],'到達此溫度容易開始凝結。'],
          ['h4','水氣凝結通常需要附著在微小粒子上，這些粒子稱為 {0}。',['凝結核'],'例如海鹽、塵埃。'],
          ['h5','雲滴或冰晶成長到足以克服上升氣流後落下，形成 {0}。',['降水'],'包含雨、雪、冰雹等。']
        ]},
        {id:'fronts', title:'鋒面與天氣系統', visual:'fronts', questions:[
          ['fr1','冷空氣主動推進、迫使暖空氣快速抬升的鋒面稱為 {0}。',['冷鋒'],'常伴隨較劇烈短時天氣。'],
          ['fr2','暖空氣沿冷空氣緩慢爬升的鋒面稱為 {0}。',['暖鋒'],'雲雨範圍通常較廣。'],
          ['fr3','冷暖氣團勢均力敵、鋒面移動很慢時稱為 {0}。',['滯留鋒'],'臺灣梅雨常與此有關。'],
          ['fr4','北半球近地面低壓中心氣流大致呈 {0} 時針輻合。',['逆'],'南半球相反。'],
          ['fr5','天氣圖上連接相同氣壓值的線稱為 {0}。',['等壓線'],'線越密通常代表壓力梯度越大。']
        ]}
      ]
    },
    {
      id:'earth-ref-6', title:'海洋', accent:'#08748d', accent2:'#1492a8', kicker:'脈絡整合 6・填空練習',
      sections:[
        {id:'seawater', title:'海水的性質', visual:'salinity', questions:[
          ['sw1','海水主要由水與溶解其中的 {0} 組成。',['鹽類'],'氯化鈉是重要成分。'],
          ['sw2','全球表層海水平均鹽度約為 {0}‰。',['35'],'約每公斤海水含 35 克鹽類。'],
          ['sw3','蒸發旺盛通常使鹽度 {0}；降水與河川注入則使鹽度降低。',['升高'],'水減少而鹽留下。'],
          ['sw4','一般而言海水溫度越低、鹽度越高，密度越 {0}。',['大'],'溫鹽共同控制密度。'],
          ['sw5','中低緯海洋從表層往下，常出現溫度快速下降的 {0}。',['斜溫層'],'thermocline。']
        ]},
        {id:'wave-tide', title:'波浪、潮汐與海流', visual:'wave-tide', questions:[
          ['wt1','波形最高點稱為 {0}，最低點稱為波谷。',['波峰'],'crest。'],
          ['wt2','相鄰兩個波峰或波谷間的水平距離稱為 {0}。',['波長'],'wavelength。'],
          ['wt3','潮汐主要受月球引力、太陽引力與地球 {0} 共同影響。',['自轉'],'月球作用通常最顯著。'],
          ['wt4','朔或望時日、地、月接近一直線，潮差通常較大，稱為 {0}。',['大潮'],'spring tide。'],
          ['wt5','上弦或下弦附近，太陽與月球潮汐作用較互相抵消，稱為 {0}。',['小潮'],'neap tide。']
        ]},
        {id:'currents', title:'洋流與湧升流', visual:'currents', questions:[
          ['oc1','大規模且具有較穩定方向的海水流動稱為 {0}。',['洋流'],'ocean current。'],
          ['oc2','表層洋流主要受盛行風驅動，也會受到地球自轉造成的 {0} 影響。',['科氏力'],'使流向發生偏轉。'],
          ['oc3','由低緯流向高緯、溫度較周圍高的洋流稱為 {0}。',['暖流'],'例如黑潮。'],
          ['oc4','沿岸表層水被帶離後，深層冷水補充上升的現象稱為 {0}。',['湧升流'],'upwelling。'],
          ['oc5','湧升流把深層豐富的 {0} 帶到表層，因此常形成良好漁場。',['營養鹽'],'促進浮游植物生長。']
        ]},
        {id:'enso', title:'海氣互動與聖嬰現象', visual:'enso', questions:[
          ['en1','正常年赤道太平洋的東風信風把表層暖水推向 {0} 太平洋。',['西'],'暖水在印尼附近堆積。'],
          ['en2','正常年東太平洋沿南美洲外海的 {0} 流較強，海水偏冷且營養豐富。',['湧升'],'有利漁業。'],
          ['en3','聖嬰現象發生時，東風信風通常 {0}，暖水向中東太平洋擴展。',['減弱'],'甚至局部反向。'],
          ['en4','聖嬰期間東太平洋湧升流減弱，海水溫度通常 {0}。',['升高'],'冷水補充變少。'],
          ['en5','反聖嬰現象時信風通常增強，東太平洋湧升流也會 {0}。',['增強'],'海表溫度偏低。']
        ]}
      ]
    }
  ];

  function norm(v=''){ return String(v).trim().replace(/[\s，,。．]/g,'').toLowerCase(); }
  function equivalent(v,a){
    if(typeof v3Equivalent==='function') return v3Equivalent(v,a);
    return norm(v)===norm(a);
  }
  function pageByTitle(title){ return PAGES.find(p=>p.title===title) || PAGES[0]; }
  function keyFor(page,section,qid,blank){ return `earth:${page.id}:${section.id}:${qid}:${blank}`; }
  function qStats(page){
    let total=0,done=0;
    page.sections.forEach(sec=>sec.questions.forEach(q=>q[2].forEach((a,i)=>{total++; const k=keyFor(page,sec,q[0],i); if(equivalent(state.mindAnswers?.[k]||'',a))done++;})));
    return {total,done,pct:total?Math.round(done/total*100):0};
  }
  function sectionStats(page,sec){
    let total=0,done=0;
    sec.questions.forEach(q=>q[2].forEach((a,i)=>{total++; const k=keyFor(page,sec,q[0],i); if(equivalent(state.mindAnswers?.[k]||'',a))done++;}));
    return {total,done};
  }
  function safe(s){ return typeof esc==='function'?esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
  function attr(s){ return safe(s).replaceAll('`','&#96;'); }

  function renderQuestion(page,sec,q,idx){
    const [qid,template,answers,hint]=q;
    const parts=String(template).split(/\{(\d+)\}/g);
    let out='';
    for(let i=0;i<parts.length;i++){
      if(i%2===0){out+=safe(parts[i]);continue;}
      const bi=Number(parts[i]),answer=answers[bi]||'',k=keyFor(page,sec,qid,bi),value=state.mindAnswers?.[k]||'',ok=equivalent(value,answer),size=Math.max(3,Math.min(13,[...answer].length+2));
      out+=`<span class="er-blank-wrap ${ok?'is-correct':''}"><input class="mind-answer-v2 er-blank" size="${size}" style="--er-chars:${size}" data-mind-key="${attr(k)}" data-answer="${attr(answer)}" value="${attr(value)}" autocomplete="off" aria-label="填空 ${bi+1}"><span class="mind-status er-inline-status ${ok?'good':value?'bad':''}" id="status-${attr(k)}">${ok?'✓':value?'再想':''}</span></span>`;
    }
    const hintKey=keyFor(page,sec,qid,0),hintShown=state.mindHints?.[hintKey];
    return `<div class="er-question ${hintShown?'has-hint':''}"><span class="er-qno">${idx+1}.</span><div class="er-qbody"><div class="er-qline">${out}<button class="er-hint-btn" data-mind-hint="${attr(hintKey)}" data-hint="${attr(hint||'先看圖中的位置與關係。')}">提示</button></div>${hintShown?`<div class="er-hint">${safe(hintShown)}</div>`:''}</div></div>`;
  }

  function visual(type){
    const common='viewBox="0 0 520 300" role="img" aria-hidden="true" focusable="false"';
    const defs=`<defs><linearGradient id="sea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#bde8f0"/><stop offset="1" stop-color="#4f9eba"/></linearGradient><linearGradient id="mantle" x1="0" x2="1"><stop offset="0" stop-color="#f5b44e"/><stop offset="1" stop-color="#d66a35"/></linearGradient><radialGradient id="star"><stop offset="0" stop-color="#fff9a8"/><stop offset=".45" stop-color="#ffc340"/><stop offset="1" stop-color="#f07c13"/></radialGradient><marker id="arr" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L10,3 L0,6 Z" fill="currentColor"/></marker></defs>`;
    const wrap=b=>`<svg ${common} class="er-svg">${defs}${b}</svg>`;
    if(type==='cosmos-scale') return wrap(`<g fill="none" stroke="currentColor" opacity=".55"><circle cx="105" cy="150" r="22"/><circle cx="185" cy="150" r="42"/><circle cx="285" cy="150" r="66"/><circle cx="410" cy="150" r="92"/></g><g fill="currentColor"><circle cx="105" cy="150" r="9"/><circle cx="185" cy="150" r="12"/><circle cx="285" cy="150" r="16"/><circle cx="410" cy="150" r="20"/></g><path d="M126 150 H145 M228 150 H252 M352 150 H376" stroke="currentColor" stroke-width="4" marker-end="url(#arr)"/>`);
    if(type==='galaxy') return wrap(`<g transform="translate(260 150)" fill="none" stroke="currentColor"><path d="M0 0 C45-65 145-35 140 35 C135 100 30 112-45 70 C-120 27-105-66-22-92 C55-118 128-70 115-8" stroke-width="18" opacity=".16"/><path d="M0 0 C38-44 94-26 94 20 C94 62 38 76-11 54 C-61 31-64-27-23-50" stroke-width="9" opacity=".48"/><circle r="22" fill="#ffd16a" stroke="none"/><circle cx="85" cy="-28" r="6" fill="#f7d25a" stroke="none"/></g>`);
    if(type==='star-life') return wrap(`<g><circle cx="70" cy="150" r="38" fill="#7e68a8" opacity=".25"/><circle cx="70" cy="150" r="14" fill="#ffe49a"/><circle cx="190" cy="150" r="30" fill="url(#star)"/><circle cx="315" cy="150" r="46" fill="#e85431" opacity=".85"/><g transform="translate(420 150)" fill="#f7c84c"><path d="M0-52 L11-18 L43-37 L20-8 L53 0 L20 9 L41 38 L10 19 L0 52 L-10 19 L-42 38 L-20 9 L-53 0 L-20-8 L-43-37 L-11-18Z"/></g><path d="M112 150 H150 M226 150 H260 M365 150 H390" stroke="currentColor" stroke-width="4" marker-end="url(#arr)"/></g>`);
    if(type==='universe-timeline') return wrap(`<path d="M45 210 H470" stroke="currentColor" stroke-width="4" marker-end="url(#arr)"/><g fill="currentColor">${[70,145,220,295,370,445].map((x,i)=>`<circle cx="${x}" cy="210" r="${8+i*2}" opacity="${.4+i*.1}"/>`).join('')}</g><path d="M70 170 C130 70 190 255 250 130 S365 68 445 115" fill="none" stroke="#b55d69" stroke-width="3" opacity=".65"/><g fill="#f4c94d"><circle cx="70" cy="90" r="20"/><circle cx="370" cy="105" r="14"/></g>`);
    if(type==='solar-system') return wrap(`<circle cx="55" cy="150" r="48" fill="url(#star)"/>${[115,153,195,235,300,365,425,475].map((x,i)=>`<circle cx="${x}" cy="150" r="${[7,10,11,8,26,22,15,15][i]}" fill="${['#888','#d99b44','#3e88b8','#bd5639','#b98a61','#e2c176','#8ac7d2','#3b63a8'][i]}"/>`).join('')}<ellipse cx="365" cy="150" rx="34" ry="9" fill="none" stroke="#9d805a" stroke-width="3"/>`);
    if(type==='seasons-orbit') return wrap(`<ellipse cx="260" cy="150" rx="185" ry="100" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="7 7"/><circle cx="260" cy="150" r="35" fill="url(#star)"/>${[[260,50],[445,150],[260,250],[75,150]].map(([x,y])=>`<g transform="translate(${x} ${y}) rotate(-23)"><circle r="22" fill="#4d8db3"/><line y1="-32" y2="32" stroke="#293b55" stroke-width="3"/></g>`).join('')}`);
    if(type==='day-night') return wrap(`<circle cx="240" cy="150" r="90" fill="#305f88"/><path d="M240 60 A90 90 0 0 1 240 240 A70 90 0 0 0 240 60" fill="#f3c958"/><path d="M80 150 H135" stroke="#f3b838" stroke-width="8" marker-end="url(#arr)"/><g stroke="currentColor" fill="none" opacity=".65"><path d="M345 80 Q405 150 345 220"/><path d="M370 100 Q425 150 370 200"/></g>`);
    if(type==='moon-phases') return wrap(`${[80,165,260,355,440].map((x,i)=>`<g transform="translate(${x} 140)"><circle r="35" fill="#27364b"/><path d="M0 -35 A35 35 0 0 ${i===2?'1':'0'} 1 0 35 A${[2,18,35,18,2][i]} 35 0 0 ${i<2?'0':'1'} 0 -35" fill="#e6dfc8"/></g>`).join('')}<path d="M105 220 H415" stroke="currentColor" stroke-width="3" marker-end="url(#arr)"/>`);
    if(type==='accretion') return wrap(`<g fill="#726657">${Array.from({length:22},(_,i)=>`<circle cx="${45+(i*41)%180}" cy="${70+(i*67)%150}" r="${3+(i%4)}"/>`).join('')}</g><path d="M220 150 H265 M340 150 H385" stroke="currentColor" stroke-width="5" marker-end="url(#arr)"/><g transform="translate(305 150)" fill="#8a6e50">${Array.from({length:12},(_,i)=>`<circle cx="${(i%4)*12-18}" cy="${Math.floor(i/4)*14-14}" r="10"/>`).join('')}</g><circle cx="440" cy="150" r="50" fill="#6f665c"/>`);
    if(type==='earth-layers'||type==='earth-interior') return wrap(`<g transform="translate(250 150)"><circle r="112" fill="#4d8fb2"/><path d="M0-112 A112 112 0 0 1 0 112Z" fill="#b4673d"/><path d="M0-86 A86 86 0 0 1 0 86Z" fill="url(#mantle)"/><path d="M0-54 A54 54 0 0 1 0 54Z" fill="#f2a72f"/><path d="M0-27 A27 27 0 0 1 0 27Z" fill="#ffd75a"/></g><g stroke="currentColor" stroke-width="2"><path d="M300 55 H455"/><path d="M330 105 H455"/><path d="M340 160 H455"/><path d="M325 215 H455"/></g>`);
    if(type==='geologic-time') return wrap(`<path d="M35 215 H485" stroke="currentColor" stroke-width="5" marker-end="url(#arr)"/><g>${[['#4b9e71',35,170],['#3f8d99',170,285],['#b38d45',285,390],['#dd7848',390,485]].map(([c,a,b])=>`<rect x="${a}" y="90" width="${b-a}" height="80" rx="12" fill="${c}" opacity=".28"/>`).join('')}</g><g fill="currentColor"><circle cx="110" cy="130" r="14"/><path d="M220 150 l25-45 25 45z"/><path d="M330 148 q28-58 55 0 q-26-15-55 0" fill="#6f7c54"/><circle cx="435" cy="130" r="24"/></g>`);
    if(type==='dating') return wrap(`<g><rect x="70" y="60" width="145" height="38" fill="#c7a777"/><rect x="70" y="98" width="145" height="38" fill="#8c9a85"/><rect x="70" y="136" width="145" height="38" fill="#c58260"/><rect x="70" y="174" width="145" height="38" fill="#788a9a"/><path d="M178 45 L120 225" stroke="#563c2e" stroke-width="14" opacity=".8"/></g><g transform="translate(300 60)"><path d="M0 160 C30 85 70 45 150 25" fill="none" stroke="#c34945" stroke-width="4"/><path d="M0 160 H165 M0 160 V10" stroke="currentColor" stroke-width="2"/><path d="M0 85 H165" stroke="currentColor" stroke-dasharray="5 5" opacity=".35"/></g>`);
    if(type==='earthquake') return wrap(`<path d="M45 65 Q160 25 260 65 T480 65 L480 250 H45Z" fill="#e5c596"/><path d="M45 65 Q160 25 260 65 T480 65" fill="none" stroke="#68835e" stroke-width="18"/><circle cx="260" cy="195" r="13" fill="#df4427"/><path d="M260 195 V55" stroke="#df4427" stroke-width="3" stroke-dasharray="7 7"/><circle cx="260" cy="55" r="8" fill="#df4427"/>${[35,65,95].map(r=>`<circle cx="260" cy="195" r="${r}" fill="none" stroke="#e88952" stroke-width="2" opacity=".7"/>`).join('')}`);
    if(type==='seismic-waves') return wrap(`<g transform="translate(35 65)"><path d="M0 70 H205" stroke="currentColor" stroke-width="2"/>${Array.from({length:19},(_,i)=>`<circle cx="${i*11}" cy="70" r="${i>6&&i<12?5:3}" fill="#4a91bd"/>`).join('')}</g><path d="M285 140 C315 75 345 205 375 140 S435 75 465 140" fill="none" stroke="#d85a42" stroke-width="6"/><path d="M70 240 H445" stroke="#c8463f" stroke-width="2"/><path d="M125 240 v-45 M290 240 v-85" stroke="#c8463f" stroke-width="2"/>`);
    if(type==='lithosphere') return wrap(`<path d="M35 90 Q145 40 240 85 H485 V245 H35Z" fill="#d8b67b"/><rect x="35" y="115" width="450" height="55" fill="#b88761"/><rect x="35" y="170" width="450" height="75" fill="#d76834" opacity=".8"/><path d="M90 210 C165 178 235 238 315 200 S430 175 470 210" fill="none" stroke="#8e3825" stroke-width="5" marker-end="url(#arr)"/><path d="M250 60 H485" stroke="#3d6e8a" stroke-width="4"/><rect x="300" y="65" width="185" height="35" fill="url(#sea)"/>`);
    if(type==='atmosphere') return wrap(`<path d="M70 255 Q260 185 450 255" fill="#8fb56a"/><g>${[[215,255,'#dceef7'],[150,215,'#bfdcec'],[90,150,'#95b9d7'],[35,90,'#627ca8']].map(([y1,y2,c])=>`<rect x="90" y="${y1}" width="340" height="${y2-y1}" fill="${c}" opacity=".75"/>`).join('')}</g><path d="M90 165 H430" stroke="#7d68b0" stroke-width="8" opacity=".65"/><g fill="white"><circle cx="180" cy="230" r="20"/><circle cx="205" cy="228" r="27"/></g><path d="M300 125 l25 12-25 12z" fill="#fff"/>`);
    if(type==='pressure-wind') return wrap(`<g transform="translate(145 150)"><circle r="58" fill="#d7e4f1"/><path d="M0 0 v-85 M0 0 h85 M0 0 v85 M0 0 h-85" stroke="#2d6ea1" stroke-width="5" marker-end="url(#arr)"/></g><g transform="translate(385 150)"><circle r="58" fill="#f4d7d0"/><path d="M0-85 V0 M85 0 H0 M0 85 V0 M-85 0 H0" stroke="#cf4f45" stroke-width="5" marker-end="url(#arr)"/></g>`);
    if(type==='cloud-cycle') return wrap(`<path d="M40 245 H480" stroke="#4d8fae" stroke-width="3"/><path d="M85 240 C75 190 95 155 110 120" fill="none" stroke="#4d8fae" stroke-width="5" marker-end="url(#arr)"/><g fill="#e5ebef"><circle cx="220" cy="115" r="35"/><circle cx="255" cy="100" r="45"/><circle cx="295" cy="118" r="32"/></g><path d="M335 95 C350 135 365 180 360 230" fill="none" stroke="#4d8fae" stroke-width="5" marker-end="url(#arr)"/>${[345,365,385,405].map(x=>`<path d="M${x} 165 l-10 35" stroke="#4794c5" stroke-width="4"/>`).join('')}`);
    if(type==='fronts') return wrap(`<path d="M40 105 H190" stroke="#3678bd" stroke-width="6"/>${[75,110,145].map(x=>`<path d="M${x} 105 l15 18 h-30z" fill="#3678bd"/>`).join('')}<path d="M215 105 H365" stroke="#d54f48" stroke-width="6"/>${[250,285,320].map(x=>`<path d="M${x-13} 105 a13 13 0 0 1 26 0" fill="#d54f48"/>`).join('')}<path d="M390 105 H490" stroke="#6f6bb1" stroke-width="6"/><g transform="translate(260 215)"><path d="M-95 0 C-45-85 45-85 95 0" fill="none" stroke="currentColor" stroke-width="3"/><circle r="27" fill="#6752a4" opacity=".28"/><path d="M-8-95 Q40-60 65-10" fill="none" stroke="#6752a4" stroke-width="5" marker-end="url(#arr)"/></g>`);
    if(type==='salinity') return wrap(`<ellipse cx="260" cy="145" rx="210" ry="92" fill="#d9eef2"/><path d="M75 130 Q150 70 230 120 T390 110 T465 140" fill="none" stroke="#e29f53" stroke-width="34" opacity=".62"/><path d="M70 175 Q155 215 245 175 T450 180" fill="none" stroke="#4b9db6" stroke-width="28" opacity=".55"/><path d="M240 55 V235 M280 55 V235" stroke="#fff" stroke-width="2" opacity=".65"/>`);
    if(type==='wave-tide') return wrap(`<path d="M35 105 C75 35 115 175 155 105 S235 35 275 105" fill="none" stroke="#2d8bb0" stroke-width="7"/><path d="M55 245 C95 205 135 285 175 245 S255 205 295 245" fill="none" stroke="#2d8bb0" stroke-width="4" opacity=".6"/><circle cx="390" cy="150" r="48" fill="#4c8fb2"/><ellipse cx="390" cy="150" rx="84" ry="58" fill="none" stroke="#4c8fb2" stroke-width="12" opacity=".25"/><circle cx="485" cy="150" r="12" fill="#ddd5b9"/>`);
    if(type==='currents') return wrap(`<path d="M30 60 Q130 20 210 65 T380 65 T500 55 V245 Q410 265 330 230 T150 235 T30 240Z" fill="#dceee8"/><g fill="none" stroke-width="7"><path d="M80 110 C160 75 220 105 270 85" stroke="#d75c43" marker-end="url(#arr)"/><path d="M420 110 C350 140 310 155 245 150" stroke="#4f7fb5" marker-end="url(#arr)"/><path d="M90 205 C170 175 245 195 310 180" stroke="#d75c43" marker-end="url(#arr)"/></g>`);
    if(type==='enso') return wrap(`<path d="M35 205 H485 V250 H35Z" fill="url(#sea)"/><path d="M60 188 C165 150 260 175 450 185" fill="none" stroke="#f18b43" stroke-width="16" opacity=".75"/><path d="M420 240 Q390 185 350 170" fill="none" stroke="#3f7fb0" stroke-width="8" marker-end="url(#arr)"/><path d="M400 92 H105" stroke="#4b6e9a" stroke-width="7" marker-end="url(#arr)"/><g fill="#e8ecef"><circle cx="115" cy="75" r="28"/><circle cx="145" cy="70" r="35"/></g>${[105,130,155].map(x=>`<path d="M${x} 102 l-7 26" stroke="#488ac0" stroke-width="4"/>`).join('')}`);
    return wrap(`<circle cx="260" cy="150" r="90" fill="none" stroke="currentColor" stroke-width="4"/><path d="M170 150 H350" stroke="currentColor" stroke-width="4" marker-end="url(#arr)"/>`);
  }

  function section(page,sec,si,startNo){
    const stats=sectionStats(page,sec),done=stats.done;
    return `<section class="er-section" data-er-section="${attr(sec.id)}">
      <header class="er-section-head"><span class="er-section-num">${si+1}</span><h3>${safe(sec.title)}</h3><span class="er-section-progress">${done}/${stats.total}</span></header>
      <div class="er-section-grid">
        <div class="er-questions">${sec.questions.map((q,qi)=>renderQuestion(page,sec,q,startNo+qi)).join('')}</div>
        <div class="er-visual">${visual(sec.visual)}</div>
      </div>
    </section>`;
  }

  function nav(page){
    return `<div class="er-chapter-tabs" role="tablist" aria-label="地科脈絡整合章節">${PAGES.map((p,i)=>{const st=qStats(p);return `<button type="button" class="er-chapter-tab ${p.id===page.id?'active':''}" data-concept-chapter="${attr(p.title)}" role="tab" aria-selected="${p.id===page.id}"><span>${i+1}</span><b>${safe(p.title)}</b><small>${st.done}/${st.total}</small></button>`}).join('')}</div>`;
  }

  function earthPage(){
    const page=pageByTitle(state.conceptChapter),stats=qStats(page),idx=PAGES.indexOf(page),prev=PAGES[(idx+PAGES.length-1)%PAGES.length],next=PAGES[(idx+1)%PAGES.length];
    let n=0;
    const sections=page.sections.map((sec,si)=>{const html=section(page,sec,si,n); n+=sec.questions.length; return html;}).join('');
    return `<div class="page-head er-page-head"><div><div class="tw-badge">臺灣高中地科・新脈絡整合</div><h2>心智圖學習 · 地科</h2><p>已以你提供的 6 張參考頁重做；舊的地科拼接版不再作為顯示來源。</p></div><div class="er-head-progress"><strong>${stats.pct}%</strong><span>${stats.done}/${stats.total} 填空</span></div></div>
      ${typeof subjectTabs==='function'?subjectTabs():''}
      ${nav(page)}
      <div class="er-workspace" style="--er-accent:${page.accent};--er-accent2:${page.accent2}">
        <div class="er-toolbar"><button class="soft-btn" data-concept-chapter="${attr(prev.title)}">← ${safe(prev.title)}</button><div><b>${idx+1} / ${PAGES.length}</b><span>每一頁是一張完整脈絡圖</span></div><button class="soft-btn" data-concept-chapter="${attr(next.title)}">${safe(next.title)} →</button></div>
        <article class="er-paper">
          <header class="er-paper-head"><div class="er-start"><span>●</span> 從這裡出發</div><div class="er-kicker">${safe(page.kicker)}</div><h1>${safe(page.title)}</h1></header>
          <div class="er-paper-sections">${sections}</div>
          <footer class="er-paper-foot">＊ 掌握脈絡・填空鞏固・學習更有方向 ＊</footer>
        </article>
      </div>`;
  }

  if(legacyMindmapPage){
    mindmapPage = function(){
      const s=typeof activeSubject==='function'?activeSubject():null;
      return s?.id==='earth' ? earthPage() : legacyMindmapPage();
    };
  }

  window.EARTH_REFERENCE_MINDMAP_V11={pages:PAGES,render:earthPage};
})();