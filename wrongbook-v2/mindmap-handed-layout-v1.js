// Wrong Book handedness-aware mind-map layout + draggable curriculum nodes.
// Scope: mind-map only. Does not alter curriculum, ink, AI, subject navigation, or other pages.
(function(){
  const VERSION='2026-08-18-handed-layout-v1';
  if(window.__wrongbookMindmapHandedLayout===VERSION)return;
  window.__wrongbookMindmapHandedLayout=VERSION;

  const DEFAULT_SIDE='right';
  const MIN_SIDE_DISTANCE=72;
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

  function allDescendantsIncludingCollapsed(d){
    const out=[];
    const seen=new Set();
    const walk=node=>{
      if(!node||seen.has(node))return;
      seen.add(node);out.push(node);
      const children=Array.isArray(node.children)&&node.children.length?node.children:Array.isArray(node._children)?node._children:[];
      children.forEach(walk);
    };
    walk(d);
    return out;
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
      node.classList.toggle('mm-draggable-node',!node.classList.contains('root'));
    });

    svg.querySelectorAll('.link-layer path.link').forEach(path=>{
      const link=path.__data__;
      const source=pos.get(nodeKey(link?.source));
      const target=pos.get(nodeKey(link?.target));
      if(!source||!target)return;
      const d=linkPath(source,target);
      if(path.getAttribute('d')!==d)path.setAttribute('d',d);
    });
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

  function stabilize(svg,duration=760,fitAfter=true){
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
    if(svg)stabilize(svg,90,true);
  }

  function ensurePrompt(wrap){
    if(currentSide()||document.getElementById('mmHandednessPrompt'))return;
    const prompt=document.createElement('div');
    prompt.id='mmHandednessPrompt';
    prompt.setAttribute('role','dialog');
    prompt.setAttribute('aria-modal','true');
    prompt.setAttribute('aria-labelledby','mmHandednessTitle');
    prompt.innerHTML=`<strong id="mmHandednessTitle">你是右撇子還是左撇子？</strong><span>我們會把心智圖節點放在較順手的書寫方向；之後可以隨時更改。</span><div><button type="button" data-mm-hand="right">右撇子</button><button type="button" data-mm-hand="left">左撇子</button></div>`;
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

  function installDrag(svg){
    if(typeof d3==='undefined'||!svg)return;
    const layer=d3.select(svg).select('.node-layer');
    if(layer.empty())return;
    const drag=d3.drag()
      .touchable(()=>true)
      .clickDistance(5)
      .filter(function(event){return !this.classList.contains('root')&&!document.getElementById('mmWrap')?.classList.contains('is-drawing')&&!event.button})
      .on('start',function(event,d){
        event.sourceEvent?.stopPropagation?.();
        dragging=true;
        this.classList.add('is-node-dragging');
        const [sx,sy]=d3.pointer(event.sourceEvent,svg);
        const [wx,wy]=d3.zoomTransform(svg).invert([sx,sy]);
        const side=effectiveSide(),subject=currentSubjectId(),bucket=offsetBucket(side,subject);
        const base=baseLayout(svg);
        const descendants=allDescendantsIncludingCollapsed(d).filter(n=>n.depth>0);
        const entries=descendants.map(n=>{
          const key=nodeKey(n),o=bucket[key]||{};
          const b=base.get(key)||{x:0,y:0};
          return{key,startDx:Number(o.dx)||0,startDy:Number(o.dy)||0,currentX:b.x+(Number(o.dx)||0)};
        });
        this.__mmDrag={wx,wy,entries,side};
      })
      .on('drag',function(event){
        const dragState=this.__mmDrag;if(!dragState)return;
        const [sx,sy]=d3.pointer(event.sourceEvent,svg);
        const [wx,wy]=d3.zoomTransform(svg).invert([sx,sy]);
        let dx=wx-dragState.wx,dy=wy-dragState.wy;
        if(dragState.entries.length){
          if(dragState.side==='right'){
            const minX=Math.min(...dragState.entries.map(e=>e.currentX));
            dx=Math.max(dx,MIN_SIDE_DISTANCE-minX);
          }else{
            const maxX=Math.max(...dragState.entries.map(e=>e.currentX));
            dx=Math.min(dx,-MIN_SIDE_DISTANCE-maxX);
          }
        }
        const bucket=offsetBucket(dragState.side,currentSubjectId());
        dragState.entries.forEach(entry=>{bucket[entry.key]={dx:entry.startDx+dx,dy:entry.startDy+dy}});
        applyLayout(svg);
      })
      .on('end',function(){
        this.classList.remove('is-node-dragging');
        delete this.__mmDrag;
        dragging=false;
        if(typeof save==='function')save();
        applyLayout(svg);
      });
    layer.selectAll('g.node').call(drag);
  }

  function observe(svg){
    observer?.disconnect?.();
    const world=svg.querySelector(':scope > g');
    if(!world||typeof MutationObserver==='undefined')return;
    const structuralClass=value=>String(value||'').split(/\s+/).filter(Boolean).filter(name=>name!=='mm-draggable-node'&&name!=='is-node-dragging').sort().join(' ');
    observer=new MutationObserver(records=>{
      const structural=records.some(r=>r.type==='childList'||(r.attributeName==='class'&&structuralClass(r.oldValue)!==structuralClass(r.target?.getAttribute?.('class'))));
      if(structural){
        installDrag(svg);
        stabilize(svg,700,true);
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
    installDrag(svg);
    observe(svg);
    stabilize(svg,850,true);

    if(svg.dataset.mmHandedEvents!==VERSION){
      svg.dataset.mmHandedEvents=VERSION;
      svg.addEventListener('click',event=>{
        if(event.target.closest?.('g.node'))stabilize(svg,690,true);
      },true);
      for(const id of ['mmExpandAll','mmCollapseAll','mmReset']){
        document.getElementById(id)?.addEventListener('click',()=>stabilize(svg,700,true));
      }
    }
    setTimeout(()=>{if(token===installToken)stabilize(svg,80,true)},900);
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
    qa(){
      const svg=document.getElementById('mmSvg'),side=effectiveSide();
      const nodes=[...(svg?.querySelectorAll('g.node:not(.root)')||[])];
      const worldPositions=nodes.map(node=>{
        const raw=node.getAttribute('transform')||'';
        const match=raw.match(/translate\(\s*([-+]?\d*\.?\d+)/);
        return Number(match?.[1]);
      }).filter(Number.isFinite);
      const sidePass=side==='right'?worldPositions.every(x=>x>=MIN_SIDE_DISTANCE-1):worldPositions.every(x=>x<=-MIN_SIDE_DISTANCE+1);
      return{version:VERSION,side,sidePass,nodeCount:nodes.length,promptVisible:Boolean(document.getElementById('mmHandednessPrompt')),controlPresent:Boolean(document.getElementById('mmHandednessSelect'))};
    }
  };
})();
