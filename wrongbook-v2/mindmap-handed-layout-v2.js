// Wrong Book stable handedness-aware layout + free node dragging.
// This runtime is the sole owner of expanded-tree node positions.
(function(){
  const VERSION='2026-08-18-handed-layout-v2';
  if(window.__wrongbookMindmapHandedLayoutV2===VERSION)return;
  window.__wrongbookMindmapHandedLayoutV2=VERSION;

  const DEFAULT_SIDE='right';
  const DRAG_CLICK_SUPPRESS_MS=480;
  const SVG_NS='http://www.w3.org/2000/svg';
  let installToken=0;
  let observer=null;
  let settleRaf=0;
  let settleUntil=0;
  let dragging=false;

  const currentSubjectId=()=>String((typeof state==='object'&&state?.subject)||'');
  const currentSide=()=>state?.mindMapHandedness==='left'?'left':state?.mindMapHandedness==='right'?'right':'';
  const effectiveSide=()=>currentSide()||DEFAULT_SIDE;
  const sideSign=()=>effectiveSide()==='left'?-1:1;

  function ensureOffsetRoot(){
    if(!state.mindMapNodeOffsets||typeof state.mindMapNodeOffsets!=='object')state.mindMapNodeOffsets={};
    for(const side of ['right','left'])if(!state.mindMapNodeOffsets[side]||typeof state.mindMapNodeOffsets[side]!=='object')state.mindMapNodeOffsets[side]={};
    return state.mindMapNodeOffsets;
  }

  function offsetBucket(side=effectiveSide(),subjectId=currentSubjectId()){
    const root=ensureOffsetRoot();
    if(!root[side][subjectId]||typeof root[side][subjectId]!=='object')root[side][subjectId]={};
    return root[side][subjectId];
  }

  function nodeKey(d){
    if(!d)return'';
    const chain=typeof d.ancestors==='function'?d.ancestors().reverse():[];
    return chain.map(a=>String(a?.data?.name||'').replace(/\s+/g,' ').trim()).join(' › ');
  }

  function visibleClone(d){
    return{key:nodeKey(d),children:(Array.isArray(d?.children)?d.children:[]).map(visibleClone)};
  }

  function baseLayout(svg){
    const rootEl=svg.querySelector('g.node.root');
    const rootDatum=rootEl?.__data__;
    if(!rootDatum||typeof d3==='undefined')return new Map();
    const mobile=svg.clientWidth<=760;
    const verticalGap=mobile?74:88;
    const horizontalGap=mobile?188:224;
    const clone=d3.hierarchy(visibleClone(rootDatum));
    d3.tree().nodeSize([verticalGap,horizontalGap])(clone);
    const sign=sideSign();
    const map=new Map();
    clone.descendants().forEach(n=>map.set(n.data.key,{x:sign*n.y,y:n.x}));
    return map;
  }

  function positions(svg){
    const map=baseLayout(svg);
    const offsets=offsetBucket();
    map.forEach((p,key)=>{
      const o=offsets[key]||{};
      p.x+=Number(o.dx)||0;
      p.y+=Number(o.dy)||0;
    });
    return map;
  }

  function linkPath(a,b){
    const mx=(a.x+b.x)/2;
    return`M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
  }

  function ensureNodeHitTargets(svg){
    svg.querySelectorAll('g.node').forEach(node=>{
      const inner=node.querySelector(':scope > .node-inner');
      if(!inner)return;
      let hit=node.querySelector(':scope > .mm-node-drag-hit');
      if(!hit){
        hit=document.createElementNS(SVG_NS,'rect');
        hit.classList.add('mm-node-drag-hit');
        hit.setAttribute('rx','12');
        hit.setAttribute('ry','12');
        node.insertBefore(hit,inner);
      }
      let box;
      try{box=inner.getBBox()}catch{return}
      if(!box||!Number.isFinite(box.x)||!Number.isFinite(box.y))return;
      const padX=12,padY=10;
      hit.setAttribute('x',String(box.x-padX));
      hit.setAttribute('y',String(box.y-padY));
      hit.setAttribute('width',String(Math.max(44,box.width+padX*2)));
      hit.setAttribute('height',String(Math.max(40,box.height+padY*2)));
    });
  }

  function applyLayout(svg){
    if(!svg||typeof state!=='object'||state.page!=='mindmap')return false;
    const pos=positions(svg);
    if(!pos.size)return false;

    svg.querySelectorAll('g.node').forEach(node=>{
      const key=nodeKey(node.__data__);
      const p=pos.get(key);
      if(!p)return;
      const transform=`translate(${Number(p.x.toFixed(3))},${Number(p.y.toFixed(3))})`;
      node.dataset.mmHandedTransform=transform;
      if(node.getAttribute('transform')!==transform)node.setAttribute('transform',transform);
      node.classList.add('mm-draggable-node');
    });

    svg.querySelectorAll('.link-layer path.link').forEach(path=>{
      const link=path.__data__;
      const source=pos.get(nodeKey(link?.source));
      const target=pos.get(nodeKey(link?.target));
      if(!source||!target)return;
      const d=linkPath(source,target);
      if(path.getAttribute('d')!==d)path.setAttribute('d',d);
    });
    ensureNodeHitTargets(svg);
    return true;
  }

  function fitLayout(svg){
    const layer=svg?.querySelector('.node-layer');
    const world=svg?.querySelector(':scope > g');
    if(!svg||!layer||!world||typeof d3==='undefined')return false;
    let bbox;try{bbox=layer.getBBox()}catch{return false}
    const w=svg.clientWidth,h=svg.clientHeight;
    if(!bbox||bbox.width<1||bbox.height<1||w<1||h<1)return false;
    const padX=w<=760?46:72,padY=w<=760?138:120;
    const fit=Math.min((w-padX)/bbox.width,(h-padY)/bbox.height,1);
    const minScale=w<=760?.32:.38;
    const scale=Math.max(minScale,Math.min(1,fit*.9));
    const tx=w/2-(bbox.x+bbox.width/2)*scale;
    const ty=h/2-(bbox.y+bbox.height/2)*scale;
    const transform=d3.zoomIdentity.translate(tx,ty).scale(scale);
    svg.__zoom=transform;
    world.setAttribute('transform',transform.toString());
    return true;
  }

  function stabilize(svg,duration=620,fitAfter=false){
    settleUntil=Math.max(settleUntil,performance.now()+duration);
    cancelAnimationFrame(settleRaf);
    const frame=()=>{
      if(!svg?.isConnected||state?.page!=='mindmap')return;
      if(!dragging)applyLayout(svg);
      if(performance.now()<settleUntil){settleRaf=requestAnimationFrame(frame);return}
      if(!dragging){applyLayout(svg);if(fitAfter)fitLayout(svg)}
    };
    settleRaf=requestAnimationFrame(frame);
  }

  function setHandedness(side){
    if(side!=='right'&&side!=='left')return;
    state.mindMapHandedness=side;
    ensureOffsetRoot();
    if(typeof save==='function')save();
    document.getElementById('mmHandednessPrompt')?.remove();
    const select=document.getElementById('mmHandednessSelect');
    if(select&&select.value!==side)select.value=side;
    const wrap=document.getElementById('mmWrap');
    if(wrap){wrap.dataset.mmHandedness=side;wrap.classList.toggle('is-left-handed',side==='left');wrap.classList.toggle('is-right-handed',side==='right')}
    const svg=document.getElementById('mmSvg');
    if(svg)stabilize(svg,100,true);
  }

  function ensurePrompt(wrap){
    if(currentSide()||document.getElementById('mmHandednessPrompt'))return;
    const prompt=document.createElement('div');
    prompt.id='mmHandednessPrompt';
    prompt.setAttribute('role','dialog');
    prompt.setAttribute('aria-modal','true');
    prompt.setAttribute('aria-labelledby','mmHandednessTitle');
    prompt.innerHTML=`<strong id="mmHandednessTitle">你是右撇子還是左撇子？</strong><span>我們先依慣用手排版；所有節點之後都可以自由拖到任何位置。</span><div><button type="button" data-mm-hand="right">右撇子</button><button type="button" data-mm-hand="left">左撇子</button></div>`;
    prompt.addEventListener('pointerdown',event=>event.stopPropagation());
    prompt.addEventListener('click',event=>{
      event.stopPropagation();
      const button=event.target.closest?.('[data-mm-hand]');
      if(button)setHandedness(button.dataset.mmHand);
    });
    wrap.appendChild(prompt);
  }

  function ensureToolbarControl(){
    const toolbar=document.getElementById('mmToolbar');
    if(!toolbar)return;
    let select=document.getElementById('mmHandednessSelect');
    if(select){select.value=currentSide()||'';return}
    select=document.createElement('select');
    select.id='mmHandednessSelect';
    select.setAttribute('aria-label','慣用手');
    select.innerHTML='<option value="" disabled>慣用手</option><option value="right">右撇子</option><option value="left">左撇子</option>';
    select.value=currentSide()||'';
    select.addEventListener('pointerdown',event=>event.stopPropagation());
    select.addEventListener('click',event=>event.stopPropagation());
    select.addEventListener('change',event=>{event.stopPropagation();setHandedness(select.value)});
    const subjectSelect=document.getElementById('mmSubjectSelect');
    const subjectSep=toolbar.querySelector('.mm-subject-sep');
    if(subjectSep)toolbar.insertBefore(select,subjectSep.nextSibling);
    else if(subjectSelect)subjectSelect.insertAdjacentElement('afterend',select);
    else toolbar.insertBefore(select,toolbar.firstChild);
  }

  function pointerInWorld(event,svg){
    const [sx,sy]=d3.pointer(event,svg);
    return d3.zoomTransform(svg).invert([sx,sy]);
  }

  function installDrag(svg){
    if(typeof d3==='undefined'||!svg)return;
    const layer=d3.select(svg).select('.node-layer');
    if(layer.empty())return;
    ensureNodeHitTargets(svg);
    const drag=d3.drag()
      .touchable(()=>true)
      .clickDistance(4)
      .filter(function(event){
        if(document.getElementById('mmWrap')?.classList.contains('is-drawing'))return false;
        return event.button==null||event.button===0;
      })
      .on('start',function(event,d){
        event.sourceEvent?.preventDefault?.();
        event.sourceEvent?.stopPropagation?.();
        dragging=true;
        this.classList.add('is-node-dragging');
        const [wx,wy]=pointerInWorld(event.sourceEvent,svg);
        const [screenX,screenY]=d3.pointer(event.sourceEvent,svg);
        const side=effectiveSide(),subject=currentSubjectId(),bucket=offsetBucket(side,subject);
        const key=nodeKey(d),o=bucket[key]||{};
        this.__mmDrag={
          key,side,subject,wx,wy,screenX,screenY,
          startDx:Number(o.dx)||0,startDy:Number(o.dy)||0,moved:false
        };
      })
      .on('drag',function(event){
        const dragState=this.__mmDrag;if(!dragState)return;
        const [wx,wy]=pointerInWorld(event.sourceEvent,svg);
        const [screenX,screenY]=d3.pointer(event.sourceEvent,svg);
        const dx=wx-dragState.wx,dy=wy-dragState.wy;
        if(Math.hypot(screenX-dragState.screenX,screenY-dragState.screenY)>=4)dragState.moved=true;
        const bucket=offsetBucket(dragState.side,dragState.subject);
        bucket[dragState.key]={dx:dragState.startDx+dx,dy:dragState.startDy+dy};
        applyLayout(svg);
      })
      .on('end',function(){
        const dragState=this.__mmDrag;
        this.classList.remove('is-node-dragging');
        delete this.__mmDrag;
        dragging=false;
        if(dragState?.moved){
          svg.dataset.mmSuppressClickUntil=String(performance.now()+DRAG_CLICK_SUPPRESS_MS);
          this.dataset.mmJustDragged='1';
          setTimeout(()=>{if(this?.dataset)this.removeAttribute('data-mm-just-dragged')},DRAG_CLICK_SUPPRESS_MS+40);
        }
        if(typeof save==='function')save();
        applyLayout(svg);
      });
    layer.selectAll('g.node').call(drag);
  }

  function hitOnlyMutation(record){
    if(record.type!=='childList')return false;
    const nodes=[...record.addedNodes,...record.removedNodes].filter(node=>node.nodeType===1);
    return nodes.length>0&&nodes.every(node=>node.classList?.contains('mm-node-drag-hit'));
  }

  function observe(svg){
    observer?.disconnect?.();
    const world=svg.querySelector(':scope > g');
    if(!world||typeof MutationObserver==='undefined')return;
    const structuralClass=value=>String(value||'').split(/\s+/).filter(Boolean).filter(name=>name!=='mm-draggable-node'&&name!=='is-node-dragging').sort().join(' ');
    observer=new MutationObserver(records=>{
      const structural=records.some(r=>{
        if(hitOnlyMutation(r))return false;
        return r.type==='childList'||(r.attributeName==='class'&&structuralClass(r.oldValue)!==structuralClass(r.target?.getAttribute?.('class')));
      });
      if(structural){
        installDrag(svg);
        stabilize(svg,640,false);
      }
    });
    observer.observe(world,{subtree:true,childList:true,attributes:true,attributeFilter:['class'],attributeOldValue:true});
  }

  function install(){
    if(typeof state!=='object'||state.page!=='mindmap'||typeof d3==='undefined')return false;
    const wrap=document.getElementById('mmWrap'),svg=document.getElementById('mmSvg');
    if(!wrap||!svg)return false;
    const token=++installToken;
    ensureOffsetRoot();
    wrap.dataset.mmHandedLayout=VERSION;
    wrap.dataset.mmHandedness=effectiveSide();
    wrap.classList.toggle('is-left-handed',effectiveSide()==='left');
    wrap.classList.toggle('is-right-handed',effectiveSide()==='right');
    ensureToolbarControl();
    ensurePrompt(wrap);
    applyLayout(svg);
    installDrag(svg);
    observe(svg);
    stabilize(svg,760,true);

    if(svg.dataset.mmStableDragEvents!==VERSION){
      svg.dataset.mmStableDragEvents=VERSION;
      svg.addEventListener('click',event=>{
        if(!event.target.closest?.('g.node'))return;
        const suppressUntil=Number(svg.dataset.mmSuppressClickUntil)||0;
        if(performance.now()<suppressUntil||event.target.closest?.('g.node')?.dataset.mmJustDragged==='1'){
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },true);
      document.getElementById('mmReset')?.addEventListener('click',()=>setTimeout(()=>{applyLayout(svg);fitLayout(svg)},80));
      for(const id of ['mmExpandAll','mmCollapseAll']){
        document.getElementById(id)?.addEventListener('click',()=>stabilize(svg,700,true));
      }
    }
    setTimeout(()=>{if(token===installToken)stabilize(svg,80,false)},900);
    return true;
  }

  if(typeof bind==='function'){
    const baseBind=bind;
    bind=function(){baseBind();setTimeout(install,0)};
  }
  setTimeout(install,0);
  window.WrongBookMindmapHandedLayout={
    version:VERSION,
    install,
    setHandedness,
    applyLayout,
    fitLayout,
    qa(){
      const svg=document.getElementById('mmSvg');
      const nodes=[...(svg?.querySelectorAll('g.node')||[])];
      const hits=nodes.filter(node=>Boolean(node.querySelector(':scope > .mm-node-drag-hit')));
      const draggable=nodes.filter(node=>node.classList.contains('mm-draggable-node'));
      return{
        version:VERSION,
        side:effectiveSide(),
        nodeCount:nodes.length,
        draggableCount:draggable.length,
        hitTargetCount:hits.length,
        rootDraggable:Boolean(svg?.querySelector('g.node.root.mm-draggable-node')),
        freeDrag:true,
        singleNodeDrag:true,
        pass:Boolean(nodes.length&&draggable.length===nodes.length&&hits.length===nodes.length&&svg?.querySelector('g.node.root.mm-draggable-node'))
      };
    }
  };
})();
