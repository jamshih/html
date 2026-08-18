// Wrong Book free-recall mind-map playground.
// Loaded last: curriculum supplies ONLY structure; students supply all content.
(function(){
  const e=value=>typeof esc==='function'?esc(String(value??'')):String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safe=value=>e(value).replace(/`/g,'&#96;');

  const BIOLOGY_108={
    title:'108課綱 高中生物',
    groups:[
      {id:'bio-required',title:'必修生物',chapters:[
        {id:'bio-r-1',title:'第1章 細胞的構造與功能',sections:[{id:'bio-r-1-1',title:'1-1 細胞的構造'},{id:'bio-r-1-2',title:'1-2 細胞與能量'},{id:'bio-r-1-3',title:'1-3 染色體與細胞分裂'}]},
        {id:'bio-r-2',title:'第2章 生殖與遺傳',sections:[{id:'bio-r-2-1',title:'2-1 性狀的遺傳'},{id:'bio-r-2-2',title:'2-2 遺傳物質'},{id:'bio-r-2-3',title:'2-3 基因轉殖技術及其應用'}]},
        {id:'bio-r-3',title:'第3章 演化與生物多樣性',sections:[{id:'bio-r-3-1',title:'3-1 生物的演化'},{id:'bio-r-3-2',title:'3-2 生命樹'},{id:'bio-r-3-3',title:'3-3 生物多樣性'}]}
      ]},
      {id:'bio-elective-1',title:'選修生物 I',chapters:[
        {id:'bio-e1-1',title:'第1章 細胞的特性',sections:[{id:'bio-e1-1-1',title:'1-1 細胞的分子組成'},{id:'bio-e1-1-2',title:'1-2 細胞的構造與功能'},{id:'bio-e1-1-3',title:'1-3 細胞的生命歷程'}]},
        {id:'bio-e1-2',title:'第2章 細胞代謝與能量',sections:[{id:'bio-e1-2-1',title:'2-1 細胞的代謝作用'},{id:'bio-e1-2-2',title:'2-2 細胞的能量來源'},{id:'bio-e1-2-3',title:'2-3 能量的來源、流轉與使用'}]},
        {id:'bio-e1-3',title:'第3章 從染色體到DNA',sections:[{id:'bio-e1-3-1',title:'3-1 遺傳染色體學說驗證'},{id:'bio-e1-3-2',title:'3-2 攜帶遺傳訊息的分子'},{id:'bio-e1-3-3',title:'3-3 DNA的結構'}]},
        {id:'bio-e1-4',title:'第4章 DNA與生物科技',sections:[{id:'bio-e1-4-1',title:'4-1 DNA複製'},{id:'bio-e1-4-2',title:'4-2 基因的表現'},{id:'bio-e1-4-3',title:'4-3 基因表現的調控'},{id:'bio-e1-4-4',title:'4-4 遺傳變異'},{id:'bio-e1-4-5',title:'4-5 生物科技'}]}
      ]},
      {id:'bio-elective-2',title:'選修生物 II',chapters:[
        {id:'bio-e2-1',title:'第1章 生物的起源與演化',sections:[{id:'bio-e2-1-1',title:'1-1 生物起源的主要假說'},{id:'bio-e2-1-2',title:'1-2 生物起源的過程'},{id:'bio-e2-1-3',title:'1-3 生命型式的演化歷程'}]},
        {id:'bio-e2-2',title:'第2章 植物體的形態、構造與功能',sections:[{id:'bio-e2-2-1',title:'2-1 植物體的組成層次'},{id:'bio-e2-2-2',title:'2-2 植物的營養構造與功能'}]},
        {id:'bio-e2-3',title:'第3章 植物體物質的吸收、合成與運輸',sections:[{id:'bio-e2-3-1',title:'3-1 水和無機鹽的吸收與運輸'},{id:'bio-e2-3-2',title:'3-2 光合作用'},{id:'bio-e2-3-3',title:'3-3 有機養分的運輸'}]},
        {id:'bio-e2-4',title:'第4章 植物的生殖、生長和發育',sections:[{id:'bio-e2-4-1',title:'4-1 植物的生殖'},{id:'bio-e2-4-2',title:'4-2 種子的萌發與幼苗的生長'},{id:'bio-e2-4-3',title:'4-3 植物激素'},{id:'bio-e2-4-4',title:'4-4 植物對環境刺激的反應'}]}
      ]},
      {id:'bio-elective-3',title:'選修生物 III',chapters:[
        {id:'bio-e3-1',title:'第1章 動物體的組成與恆定',sections:[{id:'bio-e3-1-1',title:'1-1 動物體的組成'},{id:'bio-e3-1-2',title:'1-2 恆定'}]},
        {id:'bio-e3-2',title:'第2章 循環與消化',sections:[{id:'bio-e3-2-1',title:'2-1 循環系統'},{id:'bio-e3-2-2',title:'2-2 消化系統'}]},
        {id:'bio-e3-3',title:'第3章 呼吸與排泄',sections:[{id:'bio-e3-3-1',title:'3-1 呼吸系統'},{id:'bio-e3-3-2',title:'3-2 排泄作用'}]},
        {id:'bio-e3-4',title:'第4章 神經、內分泌與免疫',sections:[{id:'bio-e3-4-1',title:'4-1 神經系統'},{id:'bio-e3-4-2',title:'4-2 內分泌系統'},{id:'bio-e3-4-3',title:'4-3 免疫系統'}]},
        {id:'bio-e3-5',title:'第5章 生殖與胚胎發育',sections:[{id:'bio-e3-5-1',title:'5-1 生殖系統'},{id:'bio-e3-5-2',title:'5-2 胚胎發育'}]}
      ]},
      {id:'bio-elective-4',title:'選修生物 IV',chapters:[
        {id:'bio-e4-1',title:'第1章 生物的演化',sections:[{id:'bio-e4-1-1',title:'1-1 遺傳變異與演化'},{id:'bio-e4-1-2',title:'1-2 族群遺傳'},{id:'bio-e4-1-3',title:'1-3 現代演化理論的發展'},{id:'bio-e4-1-4',title:'1-4 物種的形成'}]},
        {id:'bio-e4-2',title:'第2章 生物與環境',sections:[{id:'bio-e4-2-1',title:'2-1 族群與群集'},{id:'bio-e4-2-2',title:'2-2 生態系'},{id:'bio-e4-2-3',title:'2-3 多樣的生態系'}]},
        {id:'bio-e4-3',title:'第3章 生物多樣性與保育',sections:[{id:'bio-e4-3-1',title:'3-1 生物多樣性'},{id:'bio-e4-3-2',title:'3-2 人類與環境'}]}
      ]}
    ]
  };

  function genericScaffold(subjectId){
    const curriculum=typeof twCurriculumSubject==='function'?twCurriculumSubject(subjectId):null;
    const chapters=(curriculum?.chapters||[]).map((chapter,ci)=>({
      id:String(chapter.id||`${subjectId}-c${ci+1}`),
      title:String(chapter.title||`第 ${ci+1} 章`),
      sections:(chapter.sections||[]).map((section,si)=>({
        id:String(section.id||`${chapter.id||`c${ci+1}`}-s${si+1}`),
        title:String(section.title||`單元 ${si+1}`)
      }))
    })).filter(ch=>ch.sections.length);
    return {title:`108課綱 ${activeSubject().name}`,groups:[{id:`${subjectId}-core`,title:String(curriculum?.scope||'108課綱核心架構'),chapters}]};
  }
  function scaffold(subjectId){return subjectId==='biology'?BIOLOGY_108:genericScaffold(subjectId)}

  function store(){
    state.mindPlayground=state.mindPlayground||{};
    state.mindPlayground.nodes=state.mindPlayground.nodes||{};
    state.mindPlayground.nav=state.mindPlayground.nav||{};
    state.mindPlayground.review=state.mindPlayground.review||{};
    return state.mindPlayground;
  }
  function selected(subjectId){
    const map=scaffold(subjectId),st=store(),nav=st.nav[subjectId]||{};
    const group=map.groups.find(x=>x.id===nav.groupId)||map.groups[0];
    const chapter=group?.chapters.find(x=>x.id===nav.chapterId)||group?.chapters[0];
    const section=chapter?.sections.find(x=>x.id===nav.sectionId)||chapter?.sections[0];
    if(group&&chapter&&section)st.nav[subjectId]={groupId:group.id,chapterId:chapter.id,sectionId:section.id};
    return {map,group,chapter,section};
  }
  const sectionKey=(subjectId,group,chapter,section)=>`${subjectId}:${group.id}:${chapter.id}:${section.id}`;
  function nodesFor(subjectId,group,chapter,section){
    const key=sectionKey(subjectId,group,chapter,section),st=store();
    if(!Array.isArray(st.nodes[key]))st.nodes[key]=[];
    return st.nodes[key];
  }
  function totalIdeas(subjectId,map){
    return map.groups.reduce((a,g)=>a+g.chapters.reduce((b,c)=>b+c.sections.reduce((d,s)=>d+nodesFor(subjectId,g,c,s).filter(n=>String(n.text||'').trim()).length,0),0),0);
  }
  function setNav(subjectId,groupId,chapterId,sectionId){
    const map=scaffold(subjectId),st=store();
    const group=map.groups.find(x=>x.id===groupId)||map.groups[0];
    const chapter=group?.chapters.find(x=>x.id===chapterId)||group?.chapters[0];
    const section=chapter?.sections.find(x=>x.id===sectionId)||chapter?.sections[0];
    if(!section)return;
    st.nav[subjectId]={groupId:group.id,chapterId:chapter.id,sectionId:section.id};
    state.conceptChapter=chapter.title;
    save();render();
  }

  function outline(subjectId,map,sel){
    return `<aside class="wbpg-outline panel"><div class="wbpg-outline-head"><span>只提供結構</span><strong>${e(map.title)}</strong></div><div class="wbpg-tree">${map.groups.map(group=>{
      const open=group.id===sel.group.id;
      return `<section class="wbpg-group ${open?'is-open':''}"><button data-wbpg-group="${safe(group.id)}"><i></i><strong>${e(group.title)}</strong><small>${group.chapters.length} 章</small></button><div class="wbpg-chapters">${group.chapters.map(chapter=>{
        const active=chapter.id===sel.chapter.id;
        const count=chapter.sections.reduce((n,sec)=>n+nodesFor(subjectId,group,chapter,sec).filter(x=>String(x.text||'').trim()).length,0);
        return `<button class="${active?'active':''}" data-wbpg-chapter="${safe(chapter.id)}" data-wbpg-group-id="${safe(group.id)}"><span>${e(chapter.title)}</span><small>${count?`${count} 個想法`:`${chapter.sections.length} 節`}</small></button>`;
      }).join('')}</div></section>`;
    }).join('')}</div></aside>`;
  }
  function sectionTabs(sel){
    return `<div class="wbpg-sections">${sel.chapter.sections.map(sec=>`<button class="${sec.id===sel.section.id?'active':''}" data-wbpg-section="${safe(sec.id)}" data-wbpg-group-id="${safe(sel.group.id)}" data-wbpg-chapter-id="${safe(sel.chapter.id)}">${e(sec.title)}</button>`).join('')}</div>`;
  }
  function nodeCard(node,index){
    const text=String(node.text||'');
    return `<article class="wbpg-node ${text.trim()?'has-text':''}" data-wbpg-node="${safe(node.id)}" style="--x:${Number(node.x)||50};--y:${Number(node.y)||50}"><div class="wbpg-handle" data-wbpg-drag="${safe(node.id)}"><span>想法 ${index+1}</span><button data-wbpg-delete="${safe(node.id)}" aria-label="刪除想法">×</button></div><textarea data-wbpg-text="${safe(node.id)}" placeholder="寫下你記得的任何東西…">${e(text)}</textarea></article>`;
  }
  function reviewKind(step){if(/修正|錯|不正確|混淆|應改/.test(step))return'fix';if(/補充|可加|缺少|延伸|加入/.test(step))return'add';return'note'}
  function reviewPanel(review){
    if(!review)return'';
    if(review.loading)return `<aside class="wbpg-review"><div class="wbpg-review-head"><b>AI REVIEW</b><strong>正在讀你的回想</strong></div><div class="wbpg-loading"><i></i>找概念衝突、遺漏與可補的連結…</div></aside>`;
    if(review.error)return `<aside class="wbpg-review is-error"><div class="wbpg-review-head"><b>AI REVIEW</b><strong>這次檢查沒有完成</strong></div><p>${e(review.error)}</p></aside>`;
    const steps=Array.isArray(review.steps)?review.steps:[];
    return `<aside class="wbpg-review"><div class="wbpg-review-head"><b>AI REVIEW</b><strong>保留你的版本，只指出要修與可補的地方</strong></div>${review.reply?`<p class="wbpg-summary">${e(review.reply)}</p>`:''}${steps.length?`<div class="wbpg-review-list">${steps.map(step=>`<div class="${reviewKind(step)}"><i></i><span>${e(step)}</span></div>`).join('')}</div>`:''}${review.nextPrompt?`<div class="wbpg-next"><span>下一個回想問題</span><strong>${e(review.nextPrompt)}</strong></div>`:''}</aside>`;
  }
  function canvas(subjectId,sel){
    const nodes=nodesFor(subjectId,sel.group,sel.chapter,sel.section),key=sectionKey(subjectId,sel.group,sel.chapter,sel.section),review=store().review[key];
    return `<section class="wbpg-work panel"><header class="wbpg-work-head"><div><span>${e(sel.group.title)} · ${e(sel.chapter.title)}</span><h3>${e(sel.section.title)}</h3><p>沒有預設答案。關鍵字、公式、流程、例子、圖像關係、容易混淆的點，都由你自己放上來。</p></div><div class="wbpg-actions"><button class="soft-btn" data-wbpg-clear>清空這一節</button><button class="primary-btn" data-wbpg-ai ${nodes.some(n=>String(n.text||'').trim())?'':'disabled'}>${review?.loading?'AI 檢查中…':'AI 檢查我的回想'}</button></div></header><div class="wbpg-canvas" data-wbpg-canvas><svg class="wbpg-lines" viewBox="0 0 100 100" preserveAspectRatio="none">${nodes.map(n=>`<path data-wbpg-line="${safe(n.id)}" d="M50 50 L ${Number(n.x)||50} ${Number(n.y)||50}"/>`).join('')}</svg><div class="wbpg-center"><span>課綱結構</span><strong>${e(sel.section.title)}</strong><small>內容由你自己建立</small></div>${nodes.map(nodeCard).join('')}<button class="wbpg-add" data-wbpg-add><b>＋</b><span>新增想法</span></button>${nodes.length?'<div class="wbpg-hint">拖曳卡片調整位置 · 自動儲存</div>':'<div class="wbpg-empty"><strong>從空白開始。</strong><span>把腦中記得的內容全部丟上來。</span></div>'}</div>${reviewPanel(review)}</section>`;
  }

  function playgroundPage(){
    const subject=activeSubject(),sel=selected(subject.id);
    if(!sel.section)return `<div class="page-head"><div><h2>自由心智圖 · ${e(subject.name)}</h2><p>這一科目前沒有可用的章節／單元結構。</p></div></div>${subjectTabs()}`;
    const count=totalIdeas(subject.id,sel.map);
    return `<div class="page-head wbpg-page-head"><div><div class="tw-badge">臺灣 108 課綱 · 結構模式</div><h2>自由心智圖 · ${e(subject.name)}</h2><p>課綱只告訴你「有哪些章、哪些節」。內容全部由你從記憶建立；AI 只在你完成回想後指出錯誤與值得補上的概念。</p></div><div class="wbpg-count"><strong>${count}</strong><span>你寫下的想法</span></div></div>${subjectTabs()}<div class="wbpg-layout">${outline(subject.id,sel.map,sel)}<main class="wbpg-main"><div class="wbpg-crumb"><span>${e(subject.name)}</span><b>›</b><span>${e(sel.group.title)}</span><b>›</b><span>${e(sel.chapter.title)}</span></div>${sectionTabs(sel)}${canvas(subject.id,sel)}</main></div>`;
  }

  function addNode(subjectId){
    const sel=selected(subjectId);if(!sel.section)return;
    const nodes=nodesFor(subjectId,sel.group,sel.chapter,sel.section),slots=[[22,27],[78,27],[22,73],[78,73],[50,18],[50,82],[14,50],[86,50]],pos=slots[nodes.length%slots.length],id=`n${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
    nodes.push({id,text:'',x:pos[0],y:pos[1]});save();render();
    requestAnimationFrame(()=>document.querySelector(`[data-wbpg-text="${id}"]`)?.focus());
  }
  function deleteNode(subjectId,id){
    const sel=selected(subjectId);if(!sel.section)return;const key=sectionKey(subjectId,sel.group,sel.chapter,sel.section);
    store().nodes[key]=(store().nodes[key]||[]).filter(x=>x.id!==id);save();render();
  }
  function clearSection(subjectId){
    const sel=selected(subjectId);if(!sel.section)return;const key=sectionKey(subjectId,sel.group,sel.chapter,sel.section);
    if(!confirm('清空這一節你寫下的所有想法？課綱結構會保留。'))return;
    store().nodes[key]=[];delete store().review[key];save();render();
  }
  async function reviewCurrent(subjectId){
    const sel=selected(subjectId);if(!sel.section)return;const key=sectionKey(subjectId,sel.group,sel.chapter,sel.section),nodes=nodesFor(subjectId,sel.group,sel.chapter,sel.section).filter(n=>String(n.text||'').trim());
    if(!nodes.length){if(typeof toast==='function')toast('先寫下你記得的內容');return;}
    store().review[key]={loading:true};save();render();
    const studentText=nodes.map((n,i)=>`#${i+1} ${String(n.text||'').trim()}`).join('\n');
    const problemText=`科目：${activeSubject().name}\n課程：${sel.group.title}\n章：${sel.chapter.title}\n節：${sel.section.title}\n\n學生自由回想節點：\n${studentText}`;
    const question=['你正在檢查臺灣高中 108 課綱學生自己建立的自由心智圖。','這不是填空題，也不是要求完整標準答案。','只做三件事：1) 指出學生已寫內容中明確不正確、因果倒置、用語混淆或條件缺漏；2) 指出這個節下最值得補上的概念或關係；3) 給一個下一步回想問題。','保留學生自己的表達，不要把整節重寫成講義。','如果沒有明確錯誤，要直接說沒有發現明確錯誤，不要硬挑錯。','steps 每項盡量使用「修正｜#節點編號｜內容」或「補充｜#節點編號或0｜內容」格式。'].join('\n');
    try{
      const response=await apiCall('/tutor',{problemText,question,studentAnswer:[],correctAnswer:[]}),result=response?.result||{};
      store().review[key]={loading:false,reply:String(result.reply||''),steps:Array.isArray(result.steps)?result.steps.map(String):[],nextPrompt:String(result.nextPrompt||''),updatedAt:Date.now()};save();render();
    }catch(error){store().review[key]={loading:false,error:String(error?.message||error||'AI 檢查失敗')};save();render();}
  }

  function bindDrag(subjectId){
    document.querySelectorAll('[data-wbpg-drag]').forEach(handle=>handle.onpointerdown=event=>{
      if(event.target.closest('button'))return;
      const id=handle.dataset.wbpgDrag,nodeEl=handle.closest('[data-wbpg-node]'),canvas=nodeEl?.closest('[data-wbpg-canvas]');if(!nodeEl||!canvas)return;
      event.preventDefault();nodeEl.classList.add('is-dragging');handle.setPointerCapture?.(event.pointerId);
      const move=ev=>{const rect=canvas.getBoundingClientRect(),x=Math.max(10,Math.min(90,(ev.clientX-rect.left)/rect.width*100)),y=Math.max(13,Math.min(87,(ev.clientY-rect.top)/rect.height*100));nodeEl.style.setProperty('--x',x);nodeEl.style.setProperty('--y',y);const line=canvas.querySelector(`[data-wbpg-line="${id}"]`);if(line)line.setAttribute('d',`M50 50 L ${x} ${y}`);};
      const up=ev=>{nodeEl.classList.remove('is-dragging');window.removeEventListener('pointermove',move);const sel=selected(subjectId),node=sel.section?nodesFor(subjectId,sel.group,sel.chapter,sel.section).find(x=>x.id===id):null;if(node){node.x=parseFloat(nodeEl.style.getPropertyValue('--x'))||node.x;node.y=parseFloat(nodeEl.style.getPropertyValue('--y'))||node.y;save();}try{handle.releasePointerCapture?.(ev.pointerId)}catch{}};
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',up,{once:true});
    });
  }
  function bindPlayground(){
    if(state.page!=='mindmap')return;
    const subjectId=activeSubject().id,map=scaffold(subjectId);
    document.querySelectorAll('[data-wbpg-group]').forEach(el=>el.onclick=()=>{const group=map.groups.find(x=>x.id===el.dataset.wbpgGroup),chapter=group?.chapters?.[0],section=chapter?.sections?.[0];if(section)setNav(subjectId,group.id,chapter.id,section.id);});
    document.querySelectorAll('[data-wbpg-chapter]').forEach(el=>el.onclick=()=>{const group=map.groups.find(x=>x.id===el.dataset.wbpgGroupId),chapter=group?.chapters.find(x=>x.id===el.dataset.wbpgChapter),section=chapter?.sections?.[0];if(section)setNav(subjectId,group.id,chapter.id,section.id);});
    document.querySelectorAll('[data-wbpg-section]').forEach(el=>el.onclick=()=>setNav(subjectId,el.dataset.wbpgGroupId,el.dataset.wbpgChapterId,el.dataset.wbpgSection));
    document.querySelector('[data-wbpg-add]')?.addEventListener('click',()=>addNode(subjectId));
    document.querySelectorAll('[data-wbpg-delete]').forEach(el=>el.onclick=()=>deleteNode(subjectId,el.dataset.wbpgDelete));
    document.querySelectorAll('[data-wbpg-text]').forEach(el=>el.oninput=()=>{const sel=selected(subjectId),node=nodesFor(subjectId,sel.group,sel.chapter,sel.section).find(x=>x.id===el.dataset.wbpgText);if(node){node.text=el.value;save();}el.closest('.wbpg-node')?.classList.toggle('has-text',Boolean(el.value.trim()));const ai=document.querySelector('[data-wbpg-ai]');if(ai)ai.disabled=!nodesFor(subjectId,sel.group,sel.chapter,sel.section).some(n=>String(n.text||'').trim());});
    document.querySelector('[data-wbpg-clear]')?.addEventListener('click',()=>clearSection(subjectId));
    document.querySelector('[data-wbpg-ai]')?.addEventListener('click',()=>reviewCurrent(subjectId));
    bindDrag(subjectId);
  }

  // Canonical ownership: this module is intentionally loaded after all legacy mind-map renderers.
  mindmapPage=playgroundPage;
  const baseBind=bind;
  bind=function(){baseBind();bindPlayground();};
  window.WrongBookMindPlayground={scaffold,reviewCurrent,version:'2026-08-18-playground-v1'};
  render();
})();