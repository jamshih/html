// Wrongbook: integrate saved corrected statements into the standalone Notes page.
(function(){
  const VERSION='2026-08-18-notes-truths-v2';
  if(window.__wrongbookNotesTruths===VERSION)return;
  window.__wrongbookNotesTruths=VERSION;
  if(typeof notesPage!=='function')return;
  const baseNotesPage=notesPage;

  function truthsForSubject(subjectId){
    const out=[];
    const seen=new Set();
    for(const t of (Array.isArray(state.truths)?state.truths:[])){
      const p=t.problemId&&typeof problemById==='function'?problemById(t.problemId):null;
      const subject=t.subject||p?.subject||subjectId;
      const text=String(t.corrected||'').trim();
      if(subject!==subjectId||!text)continue;
      const key=subject+'|'+(t.problemId||'')+'|'+text;
      if(seen.has(key))continue;
      seen.add(key);
      out.push({id:t.id||key,problemId:t.problemId||p?.id||'',subject,concept:t.concept||p?.concept||'',title:p?.title||t.concept||'正確敘述',text,original:String(t.original||'').trim(),due:t.due||'',mastery:Number.isFinite(Number(t.mastery))?Number(t.mastery):null});
    }
    return out;
  }

  function truthCard(t){
    const original=t.original&&t.original!==t.text?'<div class="meta" style="margin-top:8px">原本敘述：'+esc(t.original)+'</div>':'';
    const review=[t.mastery!==null?'掌握 '+Math.round(t.mastery)+'%':'',t.due?'下次 '+t.due:''].filter(Boolean).join(' · ');
    return '<section class="panel note-card" style="'+subjectStyle(t.subject)+'"><span class="tag">正確敘述'+(t.concept?' · '+esc(t.concept):'')+'</span><h4>'+esc(t.title)+'</h4><p><strong>✓</strong> '+esc(t.text)+'</p>'+original+'<div class="note-footer">'+(t.problemId?'<button class="text-btn" data-problem="'+esc(t.problemId)+'">回原題修改</button>':'')+'<span class="meta">'+esc(review)+'</span></div></section>';
  }

  notesPage=function(){
    const html=baseNotesPage();
    const subjectId=state.subject;
    const truths=truthsForSubject(subjectId);
    const totalTruths=(Array.isArray(state.truths)?state.truths:[]).filter(t=>String(t.corrected||'').trim()).length;
    const subjectNotes=(Array.isArray(state.notes)?state.notes:[]).filter(n=>!n.subject||n.subject===subjectId).length;
    const legacyNotes=(state.problems||[]).filter(p=>p.insight&&p.subject===subjectId).length;
    const marker='<div class="notes-grid" style="margin-top:14px">';
    const cards=truths.length?truths.map(truthCard).join(''):'<div class="empty">這科還沒有正確敘述。回到錯題，把錯誤敘述修正並按「存入正確敘述庫」，就會出現在這裡。</div>';
    const section='<div class="section-title" style="margin-top:22px"><h3>正確敘述庫</h3><small>本科 '+truths.length+' · 全部 '+totalTruths+'</small></div><div class="notes-grid">'+cards+'</div><div class="section-title" style="margin-top:22px"><h3>個人筆記</h3><small>'+(subjectNotes+legacyNotes)+' 則</small></div>';
    return html.includes(marker)?html.replace(marker,section+marker):html+section;
  };
  try{window.notesPage=notesPage}catch(e){}

  window.wrongbookNotesTruthsQA=function(){
    const truths=truthsForSubject(state.subject);
    const html=notesPage();
    return {version:VERSION,subject:state.subject,truthCount:truths.length,totalTruthCount:(Array.isArray(state.truths)?state.truths:[]).filter(t=>String(t.corrected||'').trim()).length,sectionVisible:html.includes('正確敘述庫'),composerPreserved:html.includes('id="newNoteTitle"')&&html.includes('data-action="createNote"'),personalNotesPreserved:html.includes('個人筆記'),sourceIsFirstClassTruths:true,sourceLinksPresent:truths.every(t=>!t.problemId||html.includes('data-problem="'+esc(t.problemId)+'"'))};
  };
  try{render()}catch(e){}
})();
