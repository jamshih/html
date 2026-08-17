// Earth cluster ownership v9. Source-photo geometry is authoritative; this layer repairs only
// Earth-page regions whose legacy page-global coordinates/duplicate prose make them unreadable.
(function(){
  const M=window.SOURCE_PROMPTS_V7||{};
  const byNumber=(page,n)=>(M[page]||[]).find(r=>Number(r.number)===Number(n));
  const fieldSpec=(page,n,widths)=>{const r=byNumber(page,n);if(!r)return null;r.replaceFields=true;r.blankWidths=widths;return r;};

  // Page 250: the prompt owner must also own the photographed visual treatment. Recreate the
  // fields at source-like widths so Learn mode does not change the reading order or force wraps.
  const p48=fieldSpec(250,48,[96]);
  if(p48)p48.template='<div class="v9-p250-method-heading">使未飽和空氣塊達飽和的兩個方法：</div><div class="v9-p250-method-row">甲. <b class="v4strict-num">(48)</b> {{0}}</div>';
  const p49=fieldSpec(250,49,[96]);
  if(p49)p49.template='乙. <b class="v4strict-num">(49)</b> {{0}}　← 自然界的 <strong class="v9-p250-rain-pill">成雲致雨</strong> 主要方式';
  fieldSpec(250,50,[112]);
  fieldSpec(250,51,[92]);
  const p52=fieldSpec(250,52,[178]);
  if(p52)p52.template='相對溼度＝<b class="v4strict-num">(52)</b> {{0}}';
  const p53=fieldSpec(250,53,[178]);
  if(p53)p53.template='<b class="v4strict-num">(53)</b> {{0}}';
  fieldSpec(250,54,[82]);

  const prev=window.v5PageHtml;
  if(typeof prev!=='function')return;

  const setBox=(el,x,y,w,h)=>{
    if(!el)return;
    for(const [k,v] of Object.entries({left:x,top:y,width:w,height:h})){
      if(v!=null)el.style.setProperty(k,`${v}px`,'important');
    }
    el.style.setProperty('position','absolute','important');
  };
  const own=(el,id,role,cluster)=>{
    if(!el)return el;
    if(id)el.dataset.sourceObject=id;
    if(role)el.dataset.sourceRole=role;
    if(cluster)el.dataset.sourceClusterOwner=cluster;
    el.dataset.visualOwner='earth-cluster-layout-v9';
    return el;
  };
  const move=(root,parent,n,box,cluster)=>{
    const el=root.querySelector(`[data-question="${n}"]`);
    if(!el||!parent)return null;
    parent.appendChild(el);
    own(el,`p${root.dataset.sourceTracePage||root.dataset.strictPage}-q${n}`,'prompt',cluster);
    setBox(el,box[0],box[1],box[2],box[3]);
    return el;
  };

  function repair247(t){
    const page=t.content.querySelector('[data-source-trace-page="247"],[data-strict-page="247"]');
    if(!page)return;
    const bottom=page.querySelector('.v6-p247-bottom');
    const left=bottom?.querySelector('.left');
    const right=bottom?.querySelector('.right');
    const figure=page.querySelector('.v6-p247-insolation');
    if(!bottom||!left||!right||!figure)return;

    bottom.dataset.sourceCluster='p247-milankovitch-bottom';
    bottom.dataset.sourceRole='background-panel';
    bottom.dataset.visualOwner='earth-cluster-layout-v9';
    left.dataset.sourceCluster='p247-milankovitch-summary';
    left.dataset.visualOwner='earth-cluster-layout-v9';
    right.dataset.sourceCluster='p247-ice-age-panel';
    right.dataset.visualOwner='earth-cluster-layout-v9';

    right.innerHTML='<b class="v9-p247-ice-title">★ 易使地球進入冰期的組合：</b><p class="v9-p247-ice-support">到高緯度的太陽輻射較小，高緯度的冰原較易往外擴展</p><i class="v9-p247-ice-separator" data-source-object="p247-ice-panel-divider" data-source-role="border" aria-hidden="true"></i><b class="v9-p247-comparison-heading">同一束光線直射與斜射地表之比較：</b>';

    const ps=[...left.querySelectorAll('p')];
    if(ps.length>2)ps[ps.length-1].remove();

    move(page,left,34,[66,72,150,null],'p247-milankovitch-summary');
    move(page,left,35,[235,72,150,null],'p247-milankovitch-summary');
    move(page,left,36,[24,194,325,null],'p247-milankovitch-summary');
    move(page,left,37,[24,314,325,null],'p247-milankovitch-summary');

    move(page,right,38,[40,29,165,null],'p247-ice-age-panel');
    move(page,right,39,[202,29,180,null],'p247-ice-age-panel');
    move(page,right,40,[24,120,365,null],'p247-ice-age-panel');
    move(page,right,41,[24,344,365,null],'p247-ice-age-panel');
    right.appendChild(figure);
    own(figure,'p247-insolation-comparison','figure','p247-ice-age-panel');
    setBox(figure,34,207,330,137);
  }

  function repair250(t){
    const page=t.content.querySelector('[data-source-trace-page="250"],[data-strict-page="250"]');
    if(!page)return;
    const airTitle=page.querySelector('.v6-p250-air-title');
    const method=page.querySelector('.v6-p250-method');
    const rh=page.querySelector('.v6-p250-rh');
    const branches=page.querySelector('.v6-p250-branches');
    if(!method||!rh)return;

    own(airTitle,'p250-air-layer-title','heading','p250-atmosphere-layers');
    airTitle.dataset.sourceCluster='p250-atmosphere-title';

    method.innerHTML='<svg class="v9-p250-method-branch" data-source-object="p250-saturation-branch" data-source-role="connector" viewBox="0 0 420 175" preserveAspectRatio="none" aria-hidden="true"><path d="M10 14V148M10 148H82"/><circle cx="10" cy="14" r="7"/><circle cx="10" cy="148" r="7"/></svg>';
    method.dataset.sourceCluster='p250-saturation-methods';
    method.dataset.visualOwner='earth-cluster-layout-v9';
    move(page,method,48,[18,0,395,null],'p250-saturation-methods');
    move(page,method,49,[18,64,400,null],'p250-saturation-methods');
    move(page,method,50,[82,128,335,null],'p250-saturation-methods');

    rh.innerHTML='<i class="v9-p250-fraction-rule" data-source-object="p250-rh-fraction-rule" data-source-role="border" aria-hidden="true"></i><span class="v9-p250-rh-times" data-source-object="p250-rh-times" data-source-role="source-label">×100%</span>';
    rh.dataset.sourceCluster='p250-relative-humidity';
    rh.dataset.visualOwner='earth-cluster-layout-v9';
    move(page,rh,51,[118,0,305,null],'p250-relative-humidity');
    move(page,rh,52,[0,46,340,null],'p250-relative-humidity');
    move(page,rh,53,[92,91,235,null],'p250-relative-humidity');
    move(page,rh,54,[118,147,305,null],'p250-relative-humidity');

    const wet=document.createElement('div');
    wet.className='v9-p250-wetbulb-cluster';wet.dataset.sourceCluster='p250-wetbulb-method';wet.dataset.visualOwner='earth-cluster-layout-v9';page.appendChild(wet);
    move(page,wet,55,[8,22,270,null],'p250-wetbulb-method');
    move(page,wet,56,[8,76,315,null],'p250-wetbulb-method');
    move(page,wet,57,[8,142,310,null],'p250-wetbulb-method');

    const dew=document.createElement('div');
    dew.className='v9-p250-dewpoint-cluster';dew.dataset.sourceCluster='p250-dewpoint-rh';dew.dataset.visualOwner='earth-cluster-layout-v9';page.appendChild(dew);
    move(page,dew,58,[105,9,235,null],'p250-dewpoint-rh');
    move(page,dew,59,[105,64,235,null],'p250-dewpoint-rh');
    move(page,dew,60,[0,117,330,null],'p250-dewpoint-rh');

    if(branches){
      branches.innerHTML='<path d="M405 719V1143M405 850H477M82 989H405M405 989H418M405 1050H472M405 1143H472" fill="none"/><g class="v9-p250-spine-nodes"><circle cx="405" cy="719" r="7"/><circle cx="405" cy="850" r="7"/><circle cx="405" cy="989" r="7"/><circle cx="405" cy="1050" r="7"/><circle cx="405" cy="1143" r="7"/></g>';
      own(branches,'p250-humidity-spine','connector','p250-humidity-system');
      branches.dataset.sourceClusterOwner='p250-humidity-system';
    }
  }

  window.v5PageHtml=function(ch,sem,page,mode){
    const html=prev(ch,sem,page,mode);
    if(page!==247&&page!==250)return html;
    const t=document.createElement('template');t.innerHTML=html;
    if(page===247)repair247(t);else repair250(t);
    return t.innerHTML;
  };
  if(typeof window.render==='function')window.render();
})();
