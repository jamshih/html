// Wrongbook V6 concept realm — sparse Obsidian-style graph + shallow navigation.
(function(){
  if(window.__wrongbookConceptRealmV6)return;
  window.__wrongbookConceptRealmV6=true;
  if(typeof window.v5CeTree!=='function')return;

  function v6CeSignal(tree,node){
    const facts=typeof v5CeNodeFacts==='function'?v5CeNodeFacts(tree,node):[];
    const problems=typeof v5CeNodeProblems==='function'?v5CeNodeProblems(tree,node):[];
    const mastery=typeof v5CeRealMastery==='function'?v5CeRealMastery(facts,problems):null;
    const due=typeof v5CeDueCount==='function'?v5CeDueCount(facts):0;
    const weakProblem=problems.some(p=>{
      const m=Number(p?.mastery);
      return !Number.isFinite(m)||m<70;
    });
    let level='unseen';
    if(weakProblem||(mastery!==null&&mastery<60))level='weak';
    else if(mastery!==null&&mastery>=85)level='mastered';
    else if(mastery!==null&&mastery>=65)level='known';
    return{level,due:due>0,mastery,problems:problems.length,facts:facts.length};
  }
  function v6CeSignalLabel(signal){
    if(signal.level==='weak')return'待加強';
    if(signal.level==='mastered')return'已掌握';
    if(signal.level==='known')return'熟悉';
    return'尚未累積';
  }
  function v6CeSummary(tree,node){
    const s=v6CeSignal(tree,node);
    if(s.level==='weak')return s.problems?`${s.problems} 個錯題訊號`:'需要加強';
    if(s.mastery!==null)return`${s.mastery}%`;
    if(s.facts)return`${s.facts} 個概念事實`;
    return'尚未累積紀錄';
  }
  function v6CeChapterFor(tree,node){
    return v5CeAncestors(tree,node).find(n=>n.type==='chapter')||null;
  }
  function v6CeSectionFor(tree,node){
    return v5CeAncestors(tree,node).find(n=>n.type==='section')||null;
  }

  function v6CeOutline(tree){
    const current=v5CeSelected(tree);
    const chapter=v6CeChapterFor(tree,current);
    const section=v6CeSectionFor(tree,current);
    const chapters=v5CeChildren(tree,tree.root);
    const sections=chapter?v5CeChildren(tree,chapter):[];
    return `<aside class="panel v5-concept-outline v6-concept-nav" data-ce-pane="outline">
      <div class="v5-pane-head v6-nav-head"><div><strong>概念導覽</strong><small>先選章節，再從節點往下探索</small></div></div>
      <div class="v6-nav-scroll">
        <button class="v6-nav-home ${current.key===tree.root.key?'is-selected':''}" data-ce-node="${v5CeAttr(tree.root.key)}">
          <span class="v6-nav-light is-${v6CeSignal(tree,tree.root).level}"></span>
          <span><strong>全部${esc(tree.subject.name)}</strong><small>回到整科概念圖</small></span>
        </button>
        <div class="v6-nav-label">章節</div>
        <div class="v6-chapter-list">${chapters.map(ch=>{
          const sig=v6CeSignal(tree,ch),active=chapter?.key===ch.key||current.key===ch.key;
          return `<button class="v6-chapter-row ${active?'is-active':''}" data-ce-node="${v5CeAttr(ch.key)}">
            <span class="v6-nav-light is-${sig.level} ${sig.due?'is-due':''}"></span>
            <span class="v6-chapter-copy"><strong>${esc(ch.label)}</strong><small>${esc(v6CeSummary(tree,ch))}</small></span>
          </button>`;
        }).join('')}</div>
        ${chapter?`<div class="v6-nav-section-block"><div class="v6-nav-label">${esc(chapter.label)} · 快速切換</div><div class="v6-section-chips">${sections.map(sec=>{
          const sig=v6CeSignal(tree,sec),active=section?.key===sec.key||current.key===sec.key;
          return `<button class="v6-section-chip ${active?'is-active':''}" data-ce-node="${v5CeAttr(sec.key)}"><i class="is-${sig.level}"></i><span>${esc(sec.label)}</span></button>`;
        }).join('')}</div></div>`:''}
      </div>
    </aside>`;
  }

  function v6CeUniqueNodes(nodes){
    const seen=new Set();
    return nodes.filter(n=>n&&!seen.has(n.key)&&(seen.add(n.key),true));
  }
  function v6CeGraphPositions(nb){
    const pos=new Map();
    const current=nb.nodes.find(n=>n.role==='current');
    if(current)pos.set(current.key,{x:50,y:50,ring:0});

    const cross=nb.nodes.filter(n=>n.role==='cross');
    const inner=v6CeUniqueNodes([nb.parent,...nb.children,...cross]).filter(n=>n.key!==current?.key);
    const innerFirst=inner.slice(0,11);
    const overflow=inner.slice(11);
    const siblings=v6CeUniqueNodes(nb.siblings).filter(n=>n.key!==current?.key&&!inner.some(i=>i.key===n.key));
    const outer=v6CeUniqueNodes([...siblings,...overflow]).slice(0,13);

    const placeRing=(items,rx,ry,offset)=>{
      const count=items.length;if(!count)return;
      items.forEach((n,i)=>{
        const a=offset+(Math.PI*2*i/count);
        pos.set(n.key,{x:50+Math.cos(a)*rx,y:50+Math.sin(a)*ry,ring:rx>35?2:1});
      });
    };
    placeRing(innerFirst,30,28,-Math.PI/2);
    placeRing(outer,44,40,-Math.PI/2+(outer.length?Math.PI/outer.length:0));
    return pos;
  }

  function v6CeEdgeSvg(node,nb,pos){
    const c=pos.get(node.key);if(!c)return'';
    const nodes=nb.nodes.filter(n=>n.key!==node.key&&pos.has(n.key));
    return `<svg class="v5-local-edges v6-local-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${nodes.map(n=>{
      const p=pos.get(n.key),role=v5CeAttr(n.role||'related');
      return `<line class="role-${role}" x1="${c.x}" y1="${c.y}" x2="${p.x}" y2="${p.y}"/>`;
    }).join('')}</svg>`;
  }

  function v6CeGraphNode(tree,n,p,selectedKey){
    const sig=v6CeSignal(tree,n),selected=n.key===selectedKey;
    const status=v6CeSignalLabel(sig);
    return `<button class="v5-graph-node v6-graph-node role-${v5CeAttr(n.role||'related')} is-${sig.level} ${sig.due?'is-due':''} ${selected?'is-selected':''}" style="--x:${p.x}%;--y:${p.y}%" data-ce-node="${v5CeAttr(n.key)}" aria-label="${esc(n.label)}，${status}" title="${esc(n.label)} · ${status}">
      <span class="v6-node-light" aria-hidden="true"></span>
      <strong class="v6-node-label">${esc(n.label)}</strong>
    </button>`;
  }

  function v6CeGraph(tree,node){
    const nb=v5CeNeighborhood(tree,node),pos=v6CeGraphPositions(nb),crumb=v5CeAncestors(tree,node);
    return `<section class="panel v5-concept-graph v6-concept-realm" data-ce-pane="graph">
      <div class="v5-pane-head v5-graph-head v6-graph-head">
        <div><strong>概念圖</strong><small>${crumb.map(x=>esc(x.label)).join(' → ')}</small></div>
        <div class="v5-graph-controls v6-graph-controls">
          ${node.parentKey?`<button class="soft-btn" data-ce-up="${v5CeAttr(node.parentKey)}">上一層</button>`:''}
          <button class="soft-btn" data-ce-subject>整科</button>
          <button class="soft-btn" data-ce-fit>置中</button>
        </div>
      </div>
      <div class="v5-local-stage v6-realm-stage" data-ce-stage>
        <div class="v6-graph-world" data-v6-world>
          ${v6CeEdgeSvg(node,nb,pos)}
          ${nb.nodes.map(n=>v6CeGraphNode(tree,n,pos.get(n.key)||{x:50,y:50},node.key)).join('')}
        </div>
        <div class="v6-map-help">拖曳移動 · 滾輪縮放 · 點節點深入</div>
        <div class="v5-graph-legend v6-graph-legend" aria-label="學習狀態圖例">
          <span><i class="is-mastered"></i>已掌握</span>
          <span><i class="is-known"></i>熟悉</span>
          <span><i class="is-weak"></i>待加強</span>
          <span><i class="is-unseen"></i>尚未累積</span>
        </div>
      </div>
    </section>`;
  }

  function v6ConceptsPage(){
    v5EnsureLearningState();
    const tree=v5CeTree(state.subject),node=v5CeSelected(tree),ce=v5CeState();
    v5CeExpandPath(tree,node);
    return `<div class="page-head v5-concepts-head"><div><div class="tw-badge">${esc(TW_TERM_POLICY.label)}</div><h2>各科概念</h2><p>把課綱當成一張可探索的概念圖：越亮代表越熟，紅光代表需要加強；左側只保留快速切換，不再把每一層都攤開。</p></div></div>${subjectTabs()}${v5CeSearch()}<div class="v5-mobile-pane-tabs" role="tablist"><button class="${ce.mobilePane==='outline'?'active':''}" data-ce-mobile="outline">導覽</button><button class="${ce.mobilePane==='graph'?'active':''}" data-ce-mobile="graph">概念圖</button><button class="${ce.mobilePane==='detail'?'active':''}" data-ce-mobile="detail">複習</button></div><div class="v5-concept-grid is-mobile-${ce.mobilePane}">${v6CeOutline(tree)}${v6CeGraph(tree,node)}${v5CeDetail(tree,node)}</div>`;
  }

  function v6CeBindRealm(){
    const stage=document.querySelector('.v6-realm-stage');
    const world=stage?.querySelector('[data-v6-world]');
    if(!stage||!world)return;
    let scale=1,tx=0,ty=0,dragging=false,startX=0,startY=0,startTx=0,startTy=0;
    const apply=()=>{world.style.transform=`translate(${tx}px, ${ty}px) scale(${scale})`};
    const reset=()=>{scale=1;tx=0;ty=0;apply()};

    stage.addEventListener('wheel',e=>{
      if(innerWidth<=700)return;
      e.preventDefault();
      const next=Math.max(.72,Math.min(1.85,scale*(e.deltaY<0?1.09:.92)));
      scale=next;apply();
    },{passive:false});

    if(innerWidth>700){
      stage.addEventListener('pointerdown',e=>{
        if(e.button!==0||e.target.closest('[data-ce-node]'))return;
        dragging=true;startX=e.clientX;startY=e.clientY;startTx=tx;startTy=ty;
        stage.classList.add('is-panning');stage.setPointerCapture?.(e.pointerId);
      });
      stage.addEventListener('pointermove',e=>{
        if(!dragging)return;
        tx=startTx+(e.clientX-startX);ty=startTy+(e.clientY-startY);apply();
      });
      const stop=e=>{if(!dragging)return;dragging=false;stage.classList.remove('is-panning');stage.releasePointerCapture?.(e.pointerId)};
      stage.addEventListener('pointerup',stop);stage.addEventListener('pointercancel',stop);
    }
    document.querySelector('[data-ce-fit]')?.addEventListener('click',reset);
  }

  window.v6CeSignal=v6CeSignal;
  window.v5CeOutline=v6CeOutline;
  window.v5CeGraph=v6CeGraph;
  window.conceptsPage=v6ConceptsPage;
  try{v5CeOutline=window.v5CeOutline}catch{}
  try{v5CeGraph=window.v5CeGraph}catch{}
  try{conceptsPage=window.conceptsPage}catch{}

  const bindBase=typeof window.bind==='function'?window.bind:null;
  window.bind=function(){
    bindBase?.();
    if(state?.page==='concepts')v6CeBindRealm();
  };
  try{bind=window.bind}catch{}

  if(state?.page==='concepts'&&typeof render==='function')requestAnimationFrame(()=>render());
})();