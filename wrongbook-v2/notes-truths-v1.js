// Wrongbook: surface the existing corrected-statement library inside Notes.
// Correct statements remain owned by each source problem/correction; Notes is a unified view.
(function(){
  const VERSION='2026-08-18-notes-truths-v1';
  if(window.__wrongbookNotesTruths===VERSION)return;
  window.__wrongbookNotesTruths=VERSION;
  if(typeof notesPage!=='function')return;

  function truthNotes(){
    const out=[];
    const seen=new Set();
    for(const p of (state.problems||[])){
      let truths=[];
      try{truths=typeof getCorrectedTruths==='function'?(getCorrectedTruths(p)||[]):[]}catch{truths=[]}
      for(const raw of truths){
        const text=String(raw||'').trim();
        if(!text)continue;
        const key=String(p.id||'')+'\u0000'+text;
        if(seen.has(key))continue;
        seen.add(key);
        out.push({id:p.id,subject:p.subject,concept:p.concept,text,title:p.title});
      }
    }
    return out;
  }

  notesPage=function(){
    const truths=truthNotes();
    const insights=(state.problems||[]).filter(p=>p.insight).map(p=>({id:p.id,subject:p.subject,concept:p.concept,text:p.insight,title:p.title}));
    const truthCards=truths.map(n=>`<section class="panel note-card" style="${subjectStyle(n.subject)}"><span class="tag">${subjectById(n.subject).name} · ${esc(n.concept)} · 正確敘述</span><h4>${esc(n.title)}</h4><p><strong>✓</strong> ${esc(n.text)}</p><div class="note-footer"><button class="text-btn" data-problem="${esc(n.id)}">回原題修改</button></div></section>`).join('');
    const insightCards=insights.map(n=>`<section class="panel note-card" style="${subjectStyle(n.subject)}"><span class="tag">${subjectById(n.subject).name} · ${esc(n.concept)} · 個人洞察</span><h4>${esc(n.title)}</h4><p>${esc(n.text)}</p><div class="note-footer"><button class="text-btn" data-problem="${esc(n.id)}">回原題</button><button class="danger-btn" data-action="deleteInsight" data-id="${esc(n.id)}">刪除筆記</button></div></section>`).join('');
    return `<div class="page-head"><div><h2>我的筆記</h2><p>把你當時的錯因和每題修正後的正確敘述放在一起，複習時不用再到不同頁面找。</p></div></div><div class="section-title"><h3>正確敘述庫</h3><small>已存 ${truths.length}</small></div><div class="notes-grid">${truthCards||'<div class="empty">還沒有正確敘述。回到錯題把敘述修正後，就會自動出現在這裡。</div>'}</div><div class="section-title" style="margin-top:22px"><h3>個人洞察</h3><small>${insights.length} 則</small></div><div class="notes-grid">${insightCards||'<div class="empty">還沒有私人筆記。</div>'}</div>`;
  };
  try{window.notesPage=notesPage}catch{}
})();
