// Wrongbook V5 concept explorer: curriculum outline + focused local graph + real study detail.
state.conceptExplorer=state.conceptExplorer&&typeof state.conceptExplorer==='object'?state.conceptExplorer:{};
function v5CeAttr(s=''){return esc(String(s)).replaceAll("'",'&#39;')}

function v5CeState(){
  const ce=state.conceptExplorer;ce.expanded=Array.isArray(ce.expanded)?ce.expanded:[];ce.selectedBySubject=ce.selectedBySubject&&typeof ce.selectedBySubject==='object'?ce.selectedBySubject:{};ce.query=String(ce.query||'');ce.mobilePane=ce.mobilePane||'graph';return ce;
}
function v5CeTree(subjectId){
  const s=subjectById(subjectId),c=twCurriculumSubject(subjectId),nodes=[],byKey=new Map();
  const add=n=>{nodes.push(n);byKey.set(n.key,n);return n};
  const root=add({key:`subject:${subjectId}`,type:'subject',subjectId,label:s.name,parentKey:'',depth:0,children:[]});
  for(const ch of c?.chapters||[]){
    const cn=add({key:`chapter:${subjectId}:${ch.id}`,type:'chapter',subjectId,label:ch.title,code:ch.id,parentKey:root.key,depth:1,chapter:ch,children:[]});root.children.push(cn.key);
    for(const sec of ch.sections||[]){
      const sn=add({key:`section:${subjectId}:${ch.id}:${sec.id}`,type:'section',subjectId,label:sec.title,code:sec.id,parentKey:cn.key,depth:2,chapter:ch,section:sec,children:[]});cn.children.push(sn.key);
      for(const p of sec.points||[]){const pn=add({key:`point:${subjectId}:${ch.id}:${sec.id}:${p.id}`,ownerKey:`${subjectId}:${ch.id}:${sec.id}:${p.id}`,type:'point',subjectId,label:v5ShortConcept(p.q),code:p.id,parentKey:sn.key,depth:3,chapter:ch,section:sec,point:p,children:[]});sn.children.push(pn.key)}
    }
  }
  return{subject:s,curriculum:c,nodes,byKey,root};
}
function v5ShortConcept(q=''){return String(q).replace(/[？?。！!]$/,'').replace(/^(什麼是|何謂|哪一個|哪種|如何|為何|是否)/,'').trim().slice(0,34)||String(q).slice(0,34)}
function v5CeSelected(tree){const ce=v5CeState(),key=ce.selectedBySubject[tree.subject.id];return tree.byKey.get(key)||tree.root}
function v5CeAncestors(tree,node){const out=[];let cur=node;while(cur){out.unshift(cur);cur=cur.parentKey?tree.byKey.get(cur.parentKey):null}return out}
function v5CeExpandPath(tree,node){const ce=v5CeState(),set=new Set(ce.expanded);for(const n of v5CeAncestors(tree,node))set.add(n.key);ce.expanded=[...set]}
function v5CeSelect(key,{pane}={}){const tree=v5CeTree(state.subject),node=tree.byKey.get(key);if(!node)return;const ce=v5CeState();ce.selectedBySubject[state.subject]=key;v5CeExpandPath(tree,node);if(pane)ce.mobilePane=pane;save();render();requestAnimationFrame(()=>document.querySelector('.v5-outline-node.is-selected')?.scrollIntoView({block:'nearest'}))}
function v5CeChildren(tree,node){return (node.children||[]).map(k=>tree.byKey.get(k)).filter(Boolean)}
function v5CeSiblings(tree,node){const parent=node.parentKey&&tree.byKey.get(node.parentKey);return parent?v5CeChildren(tree,parent).filter(n=>n.key!==node.key):[]}
function v5CeDescendantPoints(tree,node){const out=[];const walk=n=>{if(n.type==='point')out.push(n);else for(const c of v5CeChildren(tree,n))walk(c)};walk(node);return out}
function v5CeNodeFacts(tree,node){const owners=new Set(v5CeDescendantPoints(tree,node).map(n=>n.ownerKey));if(node.type==='point')owners.add(node.ownerKey);return (state.genericFacts||[]).filter(f=>f.subject===tree.subject.id&&(owners.has(f.ownerKey)||(!f.ownerKey&&String(f.conceptCode||'')===String(node.code||''))))}
function v5CeNodeProblems(tree,node){const pts=v5CeDescendantPoints(tree,node),codes=new Set(pts.flatMap(n=>[n.point?.id,n.section?.id,n.chapter?.id]).filter(Boolean)),chapterTitles=new Set(pts.map(n=>n.chapter?.title).filter(Boolean));if(node.chapter)chapterTitles.add(node.chapter.title);return (state.problems||[]).filter(p=>p.subject===tree.subject.id&&(chapterTitles.has(p.chapter)||codes.has(p.conceptCode)||pts.some(n=>typeof v3Equivalent==='function'&&v3Equivalent(p.concept||'',n.section?.title||''))))}
function v5CeRealMastery(facts,problems){const vals=[];for(const f of facts)if(Number.isFinite(Number(f.mastery)))vals.push(Number(f.mastery));for(const p of problems)if(Number.isFinite(Number(p.mastery)))vals.push(Number(p.mastery));return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):null}
function v5CeDueCount(facts){const today=typeof v3DateISO==='function'?v3DateISO(0):new Date().toISOString().slice(0,10);return facts.filter(f=>f.dueISO&&f.dueISO<=today).length}
function v5CeStatus(tree,node){const facts=v5CeNodeFacts(tree,node),problems=v5CeNodeProblems(tree,node),due=v5CeDueCount(facts);if(due)return'due';if(problems.length)return'has-mistakes';const mastery=v5CeRealMastery(facts,problems);if(mastery!==null&&mastery>=85)return'mastered';return'unseen'}

function v5CeOutlineNode(tree,node){
  const ce=v5CeState(),children=v5CeChildren(tree,node),open=ce.expanded.includes(node.key),selected=v5CeSelected(tree).key===node.key,status=v5CeStatus(tree,node),problems=v5CeNodeProblems(tree,node).length,facts=v5CeNodeFacts(tree,node).length;
  return `<div class="v5-outline-branch" style="--depth:${node.depth}"><div class="v5-outline-row">${children.length?`<button class="v5-outline-toggle" data-ce-toggle="${v5CeAttr(node.key)}" aria-label="${open?'收合':'展開'} ${esc(node.label)}" aria-expanded="${open}">${open?'▾':'▸'}</button>`:'<span class="v5-outline-spacer"></span>'}<button class="v5-outline-node ${selected?'is-selected':''}" data-ce-node="${v5CeAttr(node.key)}" aria-current="${selected?'true':'false'}"><span class="v5-node-state-dot is-${status}"></span><span>${esc(node.label)}</span>${(problems||facts)?`<small>${problems?`${problems} 錯題`:''}${problems&&facts?' · ':''}${facts?`${facts} 事實`:''}</small>`:''}</button></div>${children.length&&open?`<div class="v5-outline-children">${children.map(c=>v5CeOutlineNode(tree,c)).join('')}</div>`:''}</div>`;
}
function v5CeOutline(tree){const ce=v5CeState();if(!ce.expanded.includes(tree.root.key))ce.expanded.push(tree.root.key);return `<aside class="panel v5-concept-outline" data-ce-pane="outline"><div class="v5-pane-head"><div><strong>課綱樹</strong><small>${esc(tree.curriculum?.scope||'108 課綱核心概念')}</small></div></div><div class="v5-outline-scroll">${v5CeOutlineNode(tree,tree.root)}</div></aside>`}

function v5CeNeighborhood(tree,node){
  const parent=node.parentKey?tree.byKey.get(node.parentKey):null,siblings=v5CeSiblings(tree,node).slice(0,7),children=v5CeChildren(tree,node).slice(0,10),nodes=[];if(parent)nodes.push({...parent,role:'parent'});for(const s of siblings)nodes.push({...s,role:'sibling'});nodes.push({...node,role:'current'});for(const c of children)nodes.push({...c,role:'child'});
  const cross=(state.conceptRelationships||[]).filter(r=>r?.validated===true&&(r.fromKey===node.key||r.toKey===node.key)).slice(0,3);for(const r of cross){const other=tree.byKey.get(r.fromKey===node.key?r.toKey:r.fromKey);if(other&&!nodes.some(n=>n.key===other.key))nodes.push({...other,role:'cross',crossType:r.type})}
  return{parent,siblings,children,nodes:nodes.slice(0,25),cross};
}
function v5CeGraphPositions(nb){
  const pos=new Map(),siblings=nb.siblings,children=nb.children;if(nb.parent)pos.set(nb.parent.key,{x:13,y:50});
  siblings.forEach((n,i)=>pos.set(n.key,{x:37,y:16+(68*(i+1)/(siblings.length+1))}));
  const current=nb.nodes.find(n=>n.role==='current');if(current)pos.set(current.key,{x:58,y:50});
  children.forEach((n,i)=>pos.set(n.key,{x:86,y:14+(72*(i+1)/(children.length+1))}));
  nb.nodes.filter(n=>n.role==='cross').forEach((n,i)=>pos.set(n.key,{x:70,y:10+i*12}));return pos;
}
function v5CeEdgeSvg(tree,node,nb,pos){
  const edges=[];const current=pos.get(node.key);if(!current)return'';
  const add=(from,to,type)=>{if(!from||!to)return;edges.push(`<path d="M ${from.x} ${from.y} C ${(from.x+to.x)/2} ${from.y}, ${(from.x+to.x)/2} ${to.y}, ${to.x} ${to.y}"/><text x="${(from.x+to.x)/2}" y="${(from.y+to.y)/2-1}">${esc(type)}</text>`)};
  if(nb.parent)add(pos.get(nb.parent.key),current,'包含');for(const c of nb.children)add(current,pos.get(c.key),'包含');
  for(const r of nb.cross){const other=tree.byKey.get(r.fromKey===node.key?r.toKey:r.fromKey);if(other)add(current,pos.get(other.key),r.type||'相關')}
  return `<svg class="v5-local-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${edges.join('')}</svg>`;
}
function v5CeGraphNode(tree,n,p,selectedKey){const status=v5CeStatus(tree,n);return `<button class="v5-graph-node role-${n.role} is-${status} ${n.key===selectedKey?'is-selected':''}" style="--x:${p.x}%;--y:${p.y}%" data-ce-node="${v5CeAttr(n.key)}" aria-label="${esc(n.label)}"><span class="v5-node-state-dot is-${status}"></span><strong>${esc(n.label)}</strong><small>${n.role==='parent'?'上一層':n.role==='sibling'?'同層':n.role==='child'?'下一層':n.role==='cross'?(n.crossType||'關聯'):'目前位置'}</small></button>`}
function v5CeGraph(tree,node){
  const nb=v5CeNeighborhood(tree,node),pos=v5CeGraphPositions(nb),crumb=v5CeAncestors(tree,node);
  return `<section class="panel v5-concept-graph" data-ce-pane="graph"><div class="v5-pane-head v5-graph-head"><div><strong>局部概念圖</strong><small>${crumb.map(x=>esc(x.label)).join(' → ')}</small></div><div class="v5-graph-controls">${node.parentKey?`<button class="soft-btn" data-ce-up="${v5CeAttr(node.parentKey)}">上一層</button>`:''}<button class="soft-btn" data-ce-subject>返回科目</button><button class="soft-btn" data-ce-fit>適合畫面</button></div></div><div class="v5-local-stage" data-ce-stage>${v5CeEdgeSvg(tree,node,nb,pos)}${nb.nodes.map(n=>v5CeGraphNode(tree,n,pos.get(n.key)||{x:50,y:50},node.key)).join('')}<div class="v5-graph-legend"><span><i class="is-due"></i>待複習</span><span><i class="is-has-mistakes"></i>有錯題</span><span><i class="is-mastered"></i>已掌握</span></div></div></section>`;
}

function v5CeFactCard(f){const ui=state.factReviewUi?.[f.id]||{},revealed=Boolean(ui.revealed),hint=Boolean(ui.hint);return `<article class="v5-fact-card" data-fact-id="${v5CeAttr(f.id)}"><div class="v5-fact-top"><span>主動回想</span><small>${esc(f.due||'今天')}</small></div><h4>${esc(f.question)}</h4>${hint&&!revealed?`<div class="v5-fact-hint">提示：${esc(f.conceptNameZh||'先想核心定義與關係')}</div>`:''}${revealed?`<div class="v5-fact-answer"><span>答案</span><strong>${esc(f.answer)}</strong></div><div class="v5-fact-actions"><button class="soft-btn" data-fact-rate="weak" data-fact="${v5CeAttr(f.id)}">不熟</button><button class="primary-btn" data-fact-rate="know" data-fact="${v5CeAttr(f.id)}">我會</button></div>`:`<div class="v5-fact-actions"><button class="soft-btn" data-fact-hint="${v5CeAttr(f.id)}">提示</button><button class="primary-btn" data-fact-reveal="${v5CeAttr(f.id)}">顯示答案</button></div>`}</article>`}
function v5CeDetail(tree,node){
  const facts=v5CeNodeFacts(tree,node),problems=v5CeNodeProblems(tree,node),mastery=v5CeRealMastery(facts,problems),due=v5CeDueCount(facts),crumb=v5CeAncestors(tree,node),recent=[...facts].sort((a,b)=>String(b.lastEncounterAt||'').localeCompare(String(a.lastEncounterAt||'')))[0],next=[...facts].filter(f=>f.dueISO).sort((a,b)=>String(a.dueISO).localeCompare(String(b.dueISO)))[0];
  const mistakes=problems.slice().sort((a,b)=>(a.mastery||50)-(b.mastery||50)).slice(0,5);
  const lastReview=recent?.reviewData?.history?.at?.(-1)?.at||recent?.reviewData?.history?.[recent.reviewData.history.length-1]?.at;
  return `<aside class="panel v5-concept-detail" data-ce-pane="detail"><div class="v5-detail-head"><div class="v5-breadcrumb">${crumb.map((x,i)=>`<button data-ce-node="${v5CeAttr(x.key)}">${esc(x.label)}</button>${i<crumb.length-1?'<span>›</span>':''}`).join('')}</div><h2>${esc(node.label)}</h2>${node.point?.truth?`<p>${esc(node.point.truth)}</p>`:''}</div><div class="v5-real-metrics"><div><strong>${facts.length}</strong><span>需要複習的事實</span></div><div><strong>${problems.length}</strong><span>相關錯題</span></div><div><strong>${mastery===null?'—':mastery+'%'}</strong><span>掌握程度</span></div><div><strong>${due}</strong><span>目前到期</span></div></div><div class="v5-review-meta"><span>最近複習：${lastReview?new Date(lastReview).toLocaleDateString('zh-TW'):'尚無紀錄'}</span><span>下一次複習：${next?.due||'尚無排程'}</span></div><section class="v5-detail-section"><div class="v5-section-title"><h3>需要複習的事實</h3><small>只有不看原題也能理解的事實會出現在這裡</small></div>${facts.length?facts.slice(0,8).map(v5CeFactCard).join(''):'<div class="empty">目前沒有符合「可獨立理解」門檻的概念事實。掃描錯題後，AI 只會把真正可泛化的內容放進來。</div>'}</section><section class="v5-detail-section"><div class="v5-section-title"><h3>相關錯題</h3><small>需要題幹、圖表或條件的題目仍保留原題</small></div>${mistakes.length?mistakes.map(p=>`<button class="v5-related-problem" data-problem="${v5CeAttr(p.id)}"><span>${esc(p.title)}</span><small>${esc(p.mistakeType||p.contextDependencyReason||'原題複習')}</small></button>`).join(''):'<div class="empty">這個節點還沒有你的實際錯題。</div>'}</section></aside>`;
}

function v5CeSearchIndex(){const out=[];for(const s of SUBJECTS){const tree=v5CeTree(s.id);for(const n of tree.nodes)out.push({subjectId:s.id,node:n,tree,text:v5FactNorm(`${n.label} ${n.code||''} ${n.chapter?.title||''} ${n.section?.title||''} ${n.point?.q||''} ${n.point?.a||''}`)})}return out}
function v5CeSearchResults(q){const needle=v5FactNorm(q);if(!needle)return[];return v5CeSearchIndex().filter(x=>x.text.includes(needle)).slice(0,10)}
function v5CeSearchMarkup(results){return results.length?results.map(r=>`<button data-ce-search-result="${v5CeAttr(r.node.key)}" data-ce-search-subject="${v5CeAttr(r.subjectId)}"><strong>${esc(subjectById(r.subjectId).name)} · ${esc(r.node.label)}</strong><small>${v5CeAncestors(r.tree,r.node).map(x=>esc(x.label)).join(' → ')}</small></button>`).join(''):'<div class="v5-search-empty">找不到相符概念</div>'}
function v5CeSearch(){const ce=v5CeState(),results=v5CeSearchResults(ce.query);return `<div class="v5-concept-search"><label><span>搜尋概念</span><input data-ce-search value="${esc(ce.query)}" placeholder="例如：靜摩擦、DNA、PHY-NEWTON" autocomplete="off"></label><div class="v5-search-results" data-ce-search-results>${ce.query?v5CeSearchMarkup(results):''}</div></div>`}

function conceptsPage(){
  v5EnsureLearningState();const tree=v5CeTree(state.subject),node=v5CeSelected(tree),ce=v5CeState();v5CeExpandPath(tree,node);
  return `<div class="page-head v5-concepts-head"><div><div class="tw-badge">${esc(TW_TERM_POLICY.label)}</div><h2>各科概念</h2><p>用局部知識圖快速定位，再回到清楚的傳統內容面板複習。概念圖是索引，不是把全部課綱塞成一團。</p></div></div>${subjectTabs()}${v5CeSearch()}<div class="v5-mobile-pane-tabs" role="tablist"><button class="${ce.mobilePane==='outline'?'active':''}" data-ce-mobile="outline">課綱</button><button class="${ce.mobilePane==='graph'?'active':''}" data-ce-mobile="graph">概念圖</button><button class="${ce.mobilePane==='detail'?'active':''}" data-ce-mobile="detail">複習</button></div><div class="v5-concept-grid is-mobile-${ce.mobilePane}">${v5CeOutline(tree)}${v5CeGraph(tree,node)}${v5CeDetail(tree,node)}</div>`;
}

function v5CeBindSearchResults(box){box?.querySelectorAll('[data-ce-search-result]').forEach(el=>el.onclick=()=>{state.subject=el.dataset.ceSearchSubject;const tree=v5CeTree(state.subject),node=tree.byKey.get(el.dataset.ceSearchResult);if(node){v5CeState().selectedBySubject[state.subject]=node.key;v5CeExpandPath(tree,node);v5CeState().mobilePane='detail'}save();render()})}
function v5CeBind(){
  document.querySelectorAll('[data-ce-node]').forEach(el=>el.onclick=e=>{e.stopPropagation();v5CeSelect(el.dataset.ceNode,{pane:innerWidth<=700?'detail':undefined})});
  document.querySelectorAll('[data-ce-toggle]').forEach(el=>el.onclick=e=>{e.stopPropagation();const ce=v5CeState(),k=el.dataset.ceToggle,set=new Set(ce.expanded);set.has(k)?set.delete(k):set.add(k);ce.expanded=[...set];save();render()});
  document.querySelector('[data-ce-up]')?.addEventListener('click',e=>v5CeSelect(e.currentTarget.dataset.ceUp));
  document.querySelector('[data-ce-subject]')?.addEventListener('click',()=>v5CeSelect(`subject:${state.subject}`));
  document.querySelector('[data-ce-fit]')?.addEventListener('click',()=>document.querySelector('[data-ce-stage]')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'}));
  document.querySelectorAll('[data-ce-mobile]').forEach(el=>el.onclick=()=>{v5CeState().mobilePane=el.dataset.ceMobile;save();render()});
  document.querySelectorAll('[data-fact-reveal]').forEach(el=>el.onclick=()=>{state.factReviewUi[el.dataset.factReveal]={...(state.factReviewUi[el.dataset.factReveal]||{}),revealed:true};save();render()});
  document.querySelectorAll('[data-fact-hint]').forEach(el=>el.onclick=()=>{state.factReviewUi[el.dataset.factHint]={...(state.factReviewUi[el.dataset.factHint]||{}),hint:true};save();render()});
  document.querySelectorAll('[data-fact-rate]').forEach(el=>el.onclick=()=>{const know=el.dataset.factRate==='know';v5FactReview(el.dataset.fact,know,state.factReviewUi?.[el.dataset.fact]?.hint?'hint':'none');toast(know?'已記錄：這次能叫出來':'已排更快複習');render()});
  const search=document.querySelector('[data-ce-search]'),box=document.querySelector('[data-ce-search-results]');if(search){search.addEventListener('input',()=>{v5CeState().query=search.value;box.innerHTML=search.value?v5CeSearchMarkup(v5CeSearchResults(search.value)):'';v5CeBindSearchResults(box)});search.addEventListener('keydown',e=>{if(e.key==='Escape'){search.value='';v5CeState().query='';box.innerHTML=''}})}v5CeBindSearchResults(box);
}
const v5CeBaseBind=bind;bind=function(){v5CeBaseBind();if(state.page==='concepts')v5CeBind()};
window.v5CeTree=v5CeTree;window.v5CeNeighborhood=v5CeNeighborhood;window.v5CeSearchResults=v5CeSearchResults;
