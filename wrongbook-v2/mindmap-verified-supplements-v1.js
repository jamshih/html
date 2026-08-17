// Verified post-retrieval supplements for curriculum-driven Wrongbook mind maps.
// Notes are intentionally absent from the DOM until every canonical prompt in the
// owning section is correct, so enrichment can never leak Recall answers.
(function(){
  if(globalThis.WRONGBOOK_MINDMAP_SUPPLEMENTS_V1)return;
  globalThis.WRONGBOOK_MINDMAP_SUPPLEMENTS_V1='2026-08-17';

  const S={
    'biology|bio-animal|systems':[
      {kind:'比較',text:'神經調節通常反應較快、作用較局部；激素經體液傳遞，反應通常較慢，但影響可能維持較久。'},
      {kind:'整合',text:'消化、呼吸、循環與排泄不是彼此獨立：養分與氣體交換後，主要靠循環系統在器官間運送。'}
    ],
    'biology|bio-animal|reproduction':[
      {kind:'脈絡',text:'生殖的染色體套數脈絡可串成：減數分裂產生單套配子 → 受精恢復二倍體 → 有絲分裂增加胚胎細胞數。'},
      {kind:'易混點',text:'「細胞數增加」和「細胞分化」是不同事件；胚胎發育同時需要增殖與功能分化。'}
    ],
    'biology|bio-plant|reproduction':[
      {kind:'易混點',text:'授粉不是受精。授粉是花粉到達柱頭；受精則是配子真正結合。'},
      {kind:'構造連結',text:'被子植物可把花的構造與後續結果連起來：胚珠通常形成種子，子房通常形成果實。'}
    ],
    'biology|bio-immunity|defense':[
      {kind:'延伸',text:'免疫記憶使再次接觸同一抗原時，後天免疫通常能更快建立有效反應。'}
    ],
    'chemistry|chem-solution|electrolyte':[
      {kind:'易混點',text:'水溶液導電依靠可自由移動的離子；「溶得多」不等於一定是強電解質。'},
      {kind:'比較',text:'強電解質、弱電解質與非電解質的核心差異，要看溶液中可自由移動離子的形成程度。'}
    ],
    'chemistry|chem-electro|cell':[
      {kind:'路徑',text:'原電池中電子走外電路；鹽橋主要讓離子移動，以維持兩半電池的電中性。'},
      {kind:'易混點',text:'判斷電極先記反應本質：陽極發生氧化、陰極發生還原，再處理不同電池類型的正負極。'}
    ],
    'chemistry|chem-equilibrium|dynamic':[
      {kind:'易混點',text:'平衡時巨觀濃度維持穩定，不代表微觀的正、逆反應停止。'}
    ],
    'math|math-exp-log|log':[
      {kind:'條件',text:'對數式變形前先檢查定義域；代數上能化簡，不代表原式在所有代入值都成立。'},
      {kind:'易混點',text:'對數的真數必須為正，底數必須大於 0 且不能等於 1；這些條件要和公式一起記。'}
    ],
    'math|math-data|relation':[
      {kind:'判讀',text:'相關係數主要描述線性關係；接近 0 仍可能存在非線性關係，而且相關本身不能證明因果。'}
    ],
    'math|math-prob|conditional':[
      {kind:'易混點',text:'獨立與互斥是不同概念；對兩個機率都非零的事件來說，互斥通常表示它們不獨立。'}
    ],
    'physics|phy-motion|acceleration':[
      {kind:'圖像整合',text:'讀運動圖一次記三件事：位置—時間圖斜率是速度、速度—時間圖斜率是加速度、速度—時間圖有號面積是位移。'}
    ],
    'physics|phy-newton|friction':[
      {kind:'易混點',text:'作用力與反作用力分屬不同物體；同一張受力圖要加總的是「作用在研究物體上」的各個力。'}
    ],
    'physics|phy-work-energy|energy':[
      {kind:'守恆',text:'機械能不守恆不代表總能量不守恆；摩擦常把機械能轉成內能等其他形式。'}
    ],
    'chinese|chi-rhetoric|rhetoric':[
      {kind:'判讀',text:'修辭不能只靠關鍵字辨認；要看它在語境中建立的是相似、關聯、對照，還是語勢與節奏。'}
    ],
    'chinese|chi-modern|mainidea':[
      {kind:'易混點',text:'細節敘述正確，不代表它就是全文主旨；主旨要能統整多個段落並解釋全文重心。'}
    ],
    'english|eng-vocab|collocation':[
      {kind:'用法',text:'近義字常不能直接互換；搭配、語域、詞性與句型位置會一起決定哪個用法最自然。'}
    ],
    'english|eng-tense|tense':[
      {kind:'脈絡',text:'時態不要只背公式：先定位事件發生時間，再判斷它和敘事基準時間之間的先後與延續關係。'}
    ],
    'history|hist-method|thinking':[
      {kind:'史學思考',text:'先後關係不等於因果；分析事件時把長期結構因素、短期導火線、直接結果與長期影響分開。'}
    ],
    'history|hist-worldwars|ww':[
      {kind:'因果',text:'導火線只回答「為什麼在這個時間點爆發」；完整解釋還要處理軍備、結盟、帝國競爭與民族主義等長期背景。'}
    ],
    'geography|geo-map|gis':[
      {kind:'空間判讀',text:'GIS 套疊能顯示空間上的共現或符合條件區域，但共現本身不會自動證明因果，仍要回到機制與尺度。'}
    ],
    'geography|geo-climate|classification':[
      {kind:'圖表判讀',text:'判讀氣候圖要一起看溫度年較差、降水總量與降水季節分配，不要只憑單一月份下結論。'}
    ],
    'civics|civ-constitution|rights':[
      {kind:'程序',text:'權利限制題可拆成：限制目的、法律依據、手段與必要性；不能只看到政府「有理由」就判定限制合理。'}
    ],
    'civics|civ-government|institutions':[
      {kind:'權力關係',text:'制衡不是各機關互不往來；題目要分清誰提出、誰審議、誰執行，以及誰負責審查或提供救濟。'}
    ],
    'civics|civ-market|supply-demand':[
      {kind:'易混點',text:'需求量／供給量的變動和需求／供給曲線本身的移動不是同一件事；先判斷改變的是商品自身價格，還是其他條件。'}
    ]
  };

  const key=(subjectId,chapter,section)=>`${subjectId}|${chapter?.id||''}|${section?.id||''}`;
  function notesFor(subjectId,chapter,section){return S[key(subjectId,chapter,section)]||[]}
  function supplementBlock(subjectId,chapter,section,done,total){
    const notes=notesFor(subjectId,chapter,section);if(!notes.length)return'';
    const unlocked=total>0&&done===total;
    if(!unlocked)return `<aside class="v4tb-supplement is-locked" data-v4tb-supplement-state="locked" data-v4tb-supplement-owner="${v4EscapeAttr(section.id)}"><strong>延伸補充</strong><span>完成本節 ${done}/${total} 後解鎖</span></aside>`;
    return `<aside class="v4tb-supplement is-unlocked" data-v4tb-supplement-state="unlocked" data-v4tb-supplement-owner="${v4EscapeAttr(section.id)}"><div class="v4tb-supplement-head"><strong>已驗證補充</strong><span>完成回想後再整合</span></div><div class="v4tb-supplement-list">${notes.map(n=>`<div class="v4tb-supplement-item"><b>${esc(v4tbTaiwanTermText(n.kind))}</b><p>${esc(v4tbTaiwanTermText(n.text))}</p></div>`).join('')}</div></aside>`;
  }

  window.V4TB_VERIFIED_SUPPLEMENTS=S;
  window.v4tbVerifiedSupplementNotes=notesFor;
  window.v4tbVerifiedSupplementBlock=supplementBlock;

  if(typeof v4tbSectionShell==='function'){
    const base=v4tbSectionShell;
    v4tbSectionShell=function(section,si,mode,body,done,total,extra=''){
      const subject=activeSubject?.(),curriculum=subject?twCurriculumSubject(subject.id):null;
      const chapter=curriculum?.chapters?.find(ch=>ch.title===state.conceptChapter)||curriculum?.chapters?.[0];
      const extraBlock=subject&&chapter?supplementBlock(subject.id,chapter,section,done,total):'';
      return base(section,si,mode,`${body}${extraBlock}`,done,total,extra);
    };
  }

  window.v4tbSupplementSelfCheck=function(){
    const errors=[];let noteCount=0,targetCount=0;
    for(const [k,notes] of Object.entries(S)){
      const [subjectId,chapterId,sectionId]=k.split('|'),subject=twCurriculumSubject(subjectId),chapter=subject?.chapters?.find(ch=>ch.id===chapterId),section=chapter?.sections?.find(s=>s.id===sectionId);
      if(!section){errors.push({type:'missing-owner',key:k});continue}
      targetCount++;noteCount+=notes.length;
      for(const note of notes){
        if(!note.text||!note.kind)errors.push({type:'empty-note',key:k});
        if(/needs_source_review/i.test(note.text))errors.push({type:'unresolved-source-review',key:k});
        if(typeof twTaiwanizeString==='function'&&twTaiwanizeString(note.text)!==note.text)errors.push({type:'non-taiwan-term',key:k,text:note.text});
      }
      const locked=supplementBlock(subjectId,chapter,section,0,(section.points||[]).length);
      if(notes.some(n=>locked.includes(n.text)))errors.push({type:'locked-content-leak',key:k});
      const unlocked=supplementBlock(subjectId,chapter,section,(section.points||[]).length,(section.points||[]).length);
      if(notes.some(n=>!unlocked.includes(esc(v4tbTaiwanTermText(n.text)))))errors.push({type:'unlocked-content-missing',key:k});
    }
    return {ok:errors.length===0,targetCount,noteCount,errors};
  };

  if(new URLSearchParams(location.search).get('supplementqa')==='1'){
    setTimeout(()=>{
      const result=window.v4tbSupplementSelfCheck(),pre=document.createElement('pre');
      pre.id='supplement-qa-results';pre.dataset.status=result.ok?'PASS':'FAIL';pre.textContent=JSON.stringify(result,null,2);document.body.appendChild(pre);
    },80);
  }

  try{render()}catch{}
})();
