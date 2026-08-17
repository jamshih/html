// Earth illustrated-sheet v15. The live route is reconstructed from semantic
// HTML, native SVG diagrams, approved transparent assets, and real inputs.
(function(){
  const PAGES=[
    {number:1,title:'宇宙與天體',subtitle:'恆星、太陽系、星系與宇宙尺度',sourceChapter:2,accent:'#8d70a5'},
    {number:2,title:'太陽系與地球運動',subtitle:'自轉、公轉、周日與周年運動',sourceChapter:3,accent:'#5a8fbe'},
    {number:3,title:'地球的起源與演變',subtitle:'大霹靂、太陽星雲、早期地球與地質年代',sourceChapter:1,accent:'#d4893a'},
    {number:4,title:'固體地球',subtitle:'地震波、地球內部與板塊構造',sourceChapter:4,accent:'#bd6b54'},
    {number:5,title:'大氣與天氣',subtitle:'大氣分層、水氣、風與天氣系統',sourceChapter:5,accent:'#5b86b7'},
    {number:6,title:'海洋',subtitle:'海氣交互作用、海水性質與氣候變遷',sourceChapter:6,accent:'#4f9382'}
  ];

  function E(value=''){return typeof v4RefEsc==='function'?v4RefEsc(value):String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
  function pageNumber(){return Math.min(6,Math.max(1,Number(state.refEarthChapter||1)))}
  function pageSpec(){return PAGES[pageNumber()-1]}
  function contentChapter(spec=pageSpec()){return EARTH_REFERENCE_MAPS.find(ch=>ch.number===spec.sourceChapter)||EARTH_REFERENCE_MAPS[0]}
  function sourceSwitch(){return `<div class="earth15-source"><button class="active" data-v4ref-source="reference">插畫脈絡圖</button><button data-v4ref-source="curriculum">108 課綱圖</button></div>`}
  function chapterNav(current){return `<nav class="earth15-chapters" aria-label="地球科學章節">${PAGES.map(item=>{const st=v4RefStats(contentChapter(item));return `<button type="button" class="${item.number===current?'active':''}" data-v4ref-chapter="${item.number}" style="--tab:${item.accent}"><b>${item.number}</b><span><strong>${E(item.title)}</strong><small>${st.done}/${st.total}</small></span></button>`}).join('')}</nav>`}

  function fieldHtml(ch,item,fieldIndex,mode){
    const field=item.fields[fieldIndex],value=v4RefAnswerValue(ch,item,fieldIndex),correct=v4RefFieldOk(ch,item,fieldIndex),width=Math.max(4,Math.min(16,[...String(field.answer||'')].length+2));
    if(mode==='learn')return `<span class="earth15-learn-answer">${E(field.answer)}</span>`;
    return `<span class="v4ref-input-wrap earth15-input-wrap ${value?(correct?'is-ok':'is-wrong'):''}"><input class="v4ref-input earth15-input" data-v4ref-input="1" data-v4ref-chapter="${ch.number}" data-v4ref-number="${item.number}" data-v4ref-field="${fieldIndex}" value="${E(value)}" size="${width}" autocomplete="off" aria-label="${E(item.prompt)}第${fieldIndex+1}格"><i>${correct?'✓':value?'×':''}</i></span>`;
  }
  function itemHtml(ch,item,mode){
    const correct=v4RefItemOk(ch,item),answers=item.fields.map((field,index)=>fieldHtml(ch,item,index,mode)).join('<span class="earth15-field-sep">／</span>'),user=item.fields.map((_,index)=>v4RefAnswerValue(ch,item,index)).filter(Boolean).join('／');
    return `<div class="earth15-item ${correct?'is-complete':''}" data-question="${item.number}" data-earth15-owner="${E(item.conceptId||item.clusterId||'concept')}"><span class="earth15-item-number">${item.number}</span><div><p>${E(item.prompt)}</p><div class="earth15-answer-row">${answers}</div>${mode==='review'?`<small class="earth15-review ${correct?'good':user?'bad':''}">${correct?'✓ 正確':user?`正解：${E(item.fields.map(field=>field.answer).join('／'))}`:`尚未作答 · 正解：${E(item.fields.map(field=>field.answer).join('／'))}`}</small>`:''}</div></div>`;
  }
  function zoneVisual(spec,zone){
    const assetIds=typeof mindmapApprovedAssetIds==='function'?mindmapApprovedAssetIds('earth',String(spec.number),zone.id):[],assets=typeof mindmapApprovedAssetHtml==='function'?mindmapApprovedAssetHtml(assetIds,{className:'mindmap-asset-group earth15-approved-assets',label:`${zone.title}概念插圖`}):'';
    return `<div class="earth15-zone-visual ${assets?'has-assets':''}"><div class="earth15-native-diagram">${v4RefMiniDiagram(zone.diagram)}</div>${assets}</div>`;
  }
  function zoneHtml(spec,ch,zone,index,mode){
    const done=zone.items.filter(item=>v4RefItemOk(ch,item)).length,columns=zone.items.length>16?2:1;
    return `<section class="earth15-zone zone-${index+1}" data-earth15-zone="${E(zone.id)}" style="--zone:${zone.color};--cols:${columns}"><header><span>${index+1}</span><div><h3>${E(zone.title)}</h3><small>${done}/${zone.items.length} 已掌握</small></div></header>${zoneVisual(spec,zone)}<div class="earth15-items">${zone.items.map(item=>itemHtml(ch,item,mode)).join('')}</div></section>`;
  }
  function connectors(count){
    const paths=count===3?['M500 126V350H270','M500 126V350H730','M500 126V705H500']:count===5?['M500 126V300H255','M500 126V300H745','M500 126V620H255','M500 126V620H745','M500 126V890H500']:['M500 126V310H255','M500 126V310H745','M500 126V720H255','M500 126V720H745'];
    return `<svg class="earth15-connectors" viewBox="0 0 1000 1040" preserveAspectRatio="none" aria-hidden="true"><circle cx="500" cy="126" r="7"/>${paths.slice(0,count).map(path=>`<path d="${path}"/>`).join('')}</svg>`;
  }
  function page(){
    const spec=pageSpec(),ch=contentChapter(spec),mode=v4RefStudyMode(),stats=v4RefStats(ch),qa=v4RefValidateData();
    return `<div class="page-head earth15-page-head"><div><div class="tw-badge">插畫脈絡整合 · HTML / SVG / approved assets</div><h2>心智圖學習 · 地球科學</h2><p>參考圖決定構圖與閱讀流；既有 Wrong Book 題目、答案與回想紀錄維持原本資料來源。</p></div><div class="v4-head-progress"><span>${stats.done}/${stats.total} 已回想</span><i><b style="width:${stats.pct}%"></b></i></div></div>${typeof subjectTabs==='function'?subjectTabs():''}${sourceSwitch()}${v4RefModeBar(mode)}${chapterNav(spec.number)}<section class="earth15-board mindmap--illustrated mindmap--earth" data-earth15-root data-earth15-page="${spec.number}" style="--page-accent:${spec.accent}"><header class="earth15-map-header"><span>脈 絡 整 合 ${spec.number}</span><h1>${E(spec.title)}</h1><p>${E(spec.subtitle)}</p><div class="earth15-map-progress"><b>${stats.pct}%</b><i><span style="width:${stats.pct}%"></span></i></div></header><div class="earth15-sheet">${connectors(ch.zones.length)}<div class="earth15-zones count-${ch.zones.length}">${ch.zones.map((zone,index)=>zoneHtml(spec,ch,zone,index,mode)).join('')}</div></div><footer><span>${ch.blankCount} 個回想節點 · ${qa.ok?'內容完整':'內容需檢查'}</span><span>手機依「插圖 → 概念 → 解釋 → 答案」重排</span></footer></section>`;
  }

  window.EARTH_PNG_BOARD_V15={render:page,pageSpec,contentChapter};
  window.earthIllustratedQa=function(){const spec=pageSpec(),ch=contentChapter(spec),root=document.querySelector('[data-earth15-root]'),assets=[...root?.querySelectorAll('[data-mindmap-asset]')||[]];return{ok:Boolean(root)&&root.querySelectorAll('[data-question]').length===ch.blankCount&&!root.querySelector('.earth15-strip,canvas'),page:spec.number,contentChapter:ch.number,questions:root?.querySelectorAll('[data-question]').length||0,expected:ch.blankCount,inputs:root?.querySelectorAll('[data-v4ref-input]').length||0,assets:assets.map(node=>node.dataset.mindmapAsset),flatReferenceImages:root?.querySelectorAll('.earth15-strip').length||0}};
  v4RefReferencePage=page;
  render();
})();
