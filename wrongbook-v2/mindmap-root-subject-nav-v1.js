// Wrong Book root-level subject gathering.
// Collapsing any subject tree reveals every subject as peer nodes inside the mind-map canvas.
(function(){
  const VERSION='2026-08-18-root-subject-gathering-v2';
  const SVG_NS='http://www.w3.org/2000/svg';
  let observer=null;
  let resizeObserver=null;
  let openTimer=0;

  function currentSubjectId(){
    return String((typeof state==='object'&&state?.subject)||'');
  }

  function subjectRegistry(){
    return typeof SUBJECTS!=='undefined'&&Array.isArray(SUBJECTS)?SUBJECTS:[];
  }

  function svgEl(name){
    return document.createElementNS(SVG_NS,name);
  }

  function createNavigator(svg){
    let nav=document.getElementById('mmRootSubjectNav');
    if(nav&&nav.namespaceURI!==SVG_NS){nav.remove();nav=null}
    if(nav)return nav;
    if(!svg||!subjectRegistry().length||typeof setSubject!=='function')return null;

    nav=svgEl('g');
    nav.id='mmRootSubjectNav';
    nav.classList.add('mm-subject-gathering');
    nav.dataset.version=VERSION;
    nav.setAttribute('role','group');
    nav.setAttribute('aria-label','全部科目');
    nav.style.display='none';

    const orbit=svgEl('ellipse');
    orbit.classList.add('mm-subject-gathering-orbit');
    orbit.setAttribute('aria-hidden','true');
    nav.appendChild(orbit);

    const title=svgEl('text');
    title.classList.add('mm-subject-gathering-title');
    title.textContent='全部科目';
    title.setAttribute('text-anchor','middle');
    nav.appendChild(title);

    const nodes=svgEl('g');
    nodes.classList.add('mm-subject-gathering-nodes');
    nav.appendChild(nodes);

    svg.appendChild(nav);
    return nav;
  }

  function gatheringLayout(subjects,current,w,h){
    const cx=w/2;
    const cy=h/2+8;
    const mobile=w<=760;
    const rx=mobile?Math.max(112,Math.min(148,w*.35)):Math.max(260,Math.min(390,w*.34));
    const ry=mobile?Math.max(190,Math.min(250,h*.34)):Math.max(190,Math.min(260,h*.30));
    const peers=subjects.filter(subject=>String(subject.id)!==current);
    const result=new Map();
    result.set(current,{x:cx,y:cy,active:true});
    peers.forEach((subject,index)=>{
      const angle=-Math.PI/2+(Math.PI*2*index/Math.max(1,peers.length));
      const factor=index%2===0?.90:1;
      const margin=mobile?48:62;
      const x=Math.max(margin,Math.min(w-margin,cx+Math.cos(angle)*rx*factor));
      const y=Math.max(margin+22,Math.min(h-margin,cy+Math.sin(angle)*ry*factor));
      result.set(String(subject.id),{x,y,active:false});
    });
    return{cx,cy,rx,ry,result};
  }

  function expandCurrentRoot(){
    const root=document.querySelector('#mmSvg g.node.root');
    if(!root?.classList.contains('collapsed'))return false;
    const target=root.querySelector('circle')||root;
    target.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
    return true;
  }

  function openSubject(subjectId){
    const next=String(subjectId||'');
    if(!next)return;
    clearTimeout(openTimer);
    if(next===currentSubjectId()){
      expandCurrentRoot();
      return;
    }
    setSubject(next);
    const ensureExpanded=()=>{
      if(typeof state!=='object'||state.page!=='mindmap'||currentSubjectId()!==next)return;
      expandCurrentRoot();
    };
    setTimeout(ensureExpanded,40);
    openTimer=setTimeout(ensureExpanded,720);
  }

  function renderGathering(svg,nav){
    const subjects=subjectRegistry();
    const current=currentSubjectId();
    if(!subjects.length||!current)return false;
    const w=svg.clientWidth||Number(svg.getAttribute('width'))||1000;
    const h=svg.clientHeight||Number(svg.getAttribute('height'))||700;
    if(w<1||h<1)return false;
    const layout=gatheringLayout(subjects,current,w,h);

    const orbit=nav.querySelector('.mm-subject-gathering-orbit');
    orbit?.setAttribute('cx',layout.cx);
    orbit?.setAttribute('cy',layout.cy);
    orbit?.setAttribute('rx',layout.rx);
    orbit?.setAttribute('ry',layout.ry);

    const title=nav.querySelector('.mm-subject-gathering-title');
    if(title){
      title.setAttribute('x',layout.cx);
      title.setAttribute('y',Math.max(34,layout.cy-layout.ry-32));
    }

    if(typeof d3==='undefined')return false;
    const nodes=d3.select(nav).select('.mm-subject-gathering-nodes')
      .selectAll('g.mm-root-subject-button')
      .data(subjects,subject=>String(subject.id));

    const joined=nodes.join(
      enter=>{
        const group=enter.append('g')
          .attr('class','mm-root-subject-button')
          .attr('role','button')
          .attr('tabindex',0)
          .attr('data-mm-root-subject',subject=>String(subject.id));
        group.append('circle').attr('class','mm-root-subject-dot');
        group.append('text').attr('class','mm-root-subject-name');
        group.append('text').attr('class','mm-root-subject-hint').text('點擊展開');
        group.on('pointerdown',event=>event.stopPropagation());
        group.on('click',(event,subject)=>{
          event.preventDefault();
          event.stopPropagation();
          openSubject(subject.id);
        });
        group.on('keydown',(event,subject)=>{
          if(event.key!=='Enter'&&event.key!==' ')return;
          event.preventDefault();
          event.stopPropagation();
          openSubject(subject.id);
        });
        return group;
      },
      update=>update,
      exit=>exit.remove()
    );

    joined
      .classed('is-active',subject=>String(subject.id)===current)
      .attr('aria-current',subject=>String(subject.id)===current?'true':null)
      .attr('aria-label',subject=>`展開${subject.name}心智圖`)
      .attr('transform',subject=>{
        const point=layout.result.get(String(subject.id))||{x:layout.cx,y:layout.cy};
        return`translate(${point.x.toFixed(2)},${point.y.toFixed(2)})`;
      });

    joined.select('.mm-root-subject-dot')
      .attr('r',subject=>String(subject.id)===current?14:10);

    joined.select('.mm-root-subject-name')
      .text(subject=>subject.name)
      .attr('x',subject=>String(subject.id)===current?22:0)
      .attr('y',subject=>String(subject.id)===current?7:31)
      .attr('text-anchor',subject=>String(subject.id)===current?'start':'middle');

    joined.select('.mm-root-subject-hint')
      .attr('x',subject=>String(subject.id)===current?22:0)
      .attr('y',subject=>String(subject.id)===current?25:47)
      .attr('text-anchor',subject=>String(subject.id)===current?'start':'middle')
      .style('display',subject=>String(subject.id)===current?null:'none');

    return true;
  }

  function sync(){
    if(typeof state!=='object'||state.page!=='mindmap')return false;
    const wrap=document.getElementById('mmWrap');
    const svg=document.getElementById('mmSvg');
    const root=svg?.querySelector('g.node.root');
    if(!wrap||!svg||!root)return false;
    const nav=createNavigator(svg);
    if(!nav)return false;

    const collapsed=root.classList.contains('collapsed');
    wrap.classList.toggle('wbmm-root-overview',collapsed);
    nav.style.display=collapsed?'':'none';
    nav.setAttribute('aria-hidden',collapsed?'false':'true');
    if(collapsed)renderGathering(svg,nav);
    return collapsed;
  }

  function observeRoot(){
    const layer=document.querySelector('#mmSvg .node-layer');
    if(!layer||typeof MutationObserver==='undefined')return;
    observer?.disconnect?.();
    observer=new MutationObserver(records=>{
      if(records.some(record=>record.type==='childList'||record.attributeName==='class'))requestAnimationFrame(sync);
    });
    observer.observe(layer,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  }

  function observeSize(svg){
    resizeObserver?.disconnect?.();
    if(typeof ResizeObserver==='undefined')return;
    resizeObserver=new ResizeObserver(()=>{
      if(document.getElementById('mmWrap')?.classList.contains('wbmm-root-overview'))requestAnimationFrame(sync);
    });
    resizeObserver.observe(svg);
  }

  function install(){
    if(typeof state!=='object'||state.page!=='mindmap')return;
    const wrap=document.getElementById('mmWrap');
    const svg=document.getElementById('mmSvg');
    if(!wrap||!svg)return;
    createNavigator(svg);
    observeRoot();
    observeSize(svg);
    sync();

    if(svg.dataset.rootSubjectNav!==VERSION){
      svg.dataset.rootSubjectNav=VERSION;
      svg.addEventListener('click',event=>{
        if(!event.target.closest?.('g.node.root'))return;
        setTimeout(sync,0);
        setTimeout(sync,620);
      },true);
    }
  }

  if(typeof bind==='function'){
    const baseBind=bind;
    bind=function(){
      baseBind();
      install();
    };
  }

  setTimeout(install,0);
  window.WrongBookMindmapRootSubjectNav={
    version:VERSION,
    install,
    sync,
    openSubject,
    qa(){
      const wrap=document.getElementById('mmWrap');
      const svg=document.getElementById('mmSvg');
      const root=svg?.querySelector('g.node.root');
      const nav=document.getElementById('mmRootSubjectNav');
      const subjects=subjectRegistry();
      const collapsed=Boolean(root?.classList.contains('collapsed'));
      const nodes=[...(nav?.querySelectorAll('[data-mm-root-subject]')||[])];
      return{
        version:VERSION,
        collapsed,
        overviewClass:Boolean(wrap?.classList.contains('wbmm-root-overview')),
        gatheringVisible:Boolean(nav&&nav.style.display!=='none'),
        subjectCount:subjects.length,
        nodeCount:nodes.length,
        currentCount:nodes.filter(node=>node.getAttribute('aria-current')==='true').length,
        pass:Boolean(!collapsed||(nav&&nav.namespaceURI===SVG_NS&&nodes.length===subjects.length&&nodes.length>1&&nodes.filter(node=>node.getAttribute('aria-current')==='true').length===1))
      };
    }
  };
})();
