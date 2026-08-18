// Wrongbook — dedicated math/physics diagram renderer.
// Gemini only plans a strict drawing-tool JSON spec; the phone/browser renders deterministic SVG.
(function(){
  if(window.__wrongbookAiDiagramToolsV1)return;
  window.__wrongbookAiDiagramToolsV1=true;

  const LABEL='AI 圖解';
  const API='https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1/wrongbook-diagram-ai';
  const KEY=typeof SUPABASE_PUBLISHABLE_KEY==='string'?SUPABASE_PUBLISHABLE_KEY:'';
  const CACHE_PREFIX='wrongbook:diagram-spec:v1:';
  const pending=new Map();
  let queued=false;

  const style=document.createElement('style');
  style.textContent=`
    [data-wb-dedicated-diagram="1"]{overflow:visible!important;background:#fff!important}
    .wb-dd-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px 12px;border-bottom:1px solid #ece9e3;cursor:grab;touch-action:none}
    .wb-dd-title{margin:0;font-size:clamp(18px,2vw,25px);line-height:1.25;font-weight:800;color:#22211f}
    .wb-dd-ai{display:flex;align-items:center;gap:9px;color:#87827a;font-size:14px;font-weight:700;white-space:nowrap}
    .wb-dd-grip{display:grid;grid-template-columns:repeat(2,4px);gap:3px;opacity:.66}.wb-dd-grip i{width:4px;height:4px;border-radius:50%;background:#aaa69f}
    .wb-dd-body{padding:14px 16px 16px}.wb-dd-stage{border:1px solid #e8e5df;border-radius:18px;background:#fcfcfa;overflow:hidden}
    .wb-dd-svg{display:block;width:100%;height:auto;aspect-ratio:16/10;background:#fffdf9}
    .wb-dd-notes{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.wb-dd-note{padding:7px 10px;border-radius:11px;background:#f2f3ef;color:#3a3935;font-size:13px;font-weight:700}
    .wb-dd-loading{opacity:.72}
    @media(max-width:680px){.wb-dd-head{padding:15px 16px 10px}.wb-dd-body{padding:10px}.wb-dd-svg{aspect-ratio:4/3}}
  `;
  document.head.appendChild(style);

  const clamp=(v,a=0,b=1000)=>Math.min(Math.max(Number(v)||0,a),b);
  const norm=v=>String(v||'').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  function hash(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(36)}
  function subjectId(){try{return String(state?.subject||'')}catch{return''}}
  function currentProblem(){try{return typeof selectedProblem==='function'?selectedProblem():null}catch{return null}}

  function labelNodes(root){
    const base=root?.nodeType===1?root:document.body,out=[];
    const walker=document.createTreeWalker(base,NodeFilter.SHOW_TEXT,{acceptNode(node){const p=node.parentElement;return p&&!p.closest('script,style,template')&&norm(node.nodeValue).includes(LABEL)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
    while(walker.nextNode())out.push(walker.currentNode.parentElement);
    return[...new Set(out)];
  }

  function cardFor(label){
    const explicit=label.closest('[data-ai-diagram-card]');if(explicit)return explicit;
    let el=label;
    for(let i=0;i<11&&el&&el!==document.body;i++,el=el.parentElement){
      if(el.id==='app'||!el.contains(label))continue;
      const r=el.getBoundingClientRect();if(r.width<240||r.height<150)continue;
      const cs=getComputedStyle(el),radius=parseFloat(cs.borderTopLeftRadius)||0,border=parseFloat(cs.borderTopWidth)||0;
      if(radius>=6||border>0||cs.boxShadow!=='none'||/card|panel|diagram|figure|visual|explain/i.test(String(el.className||''))||/^(SECTION|ARTICLE)$/i.test(el.tagName||''))return el;
    }
    return null;
  }

  function cardTitle(card){
    const candidates=[...card.querySelectorAll('h1,h2,h3,h4,strong,[class*="title" i]')].map(x=>norm(x.textContent)).filter(t=>t&&t!==LABEL&&!t.includes(LABEL)&&t.length<=90);
    return candidates[0]||norm(card.textContent).replace(LABEL,'').slice(0,70)||'AI 圖解';
  }

  function contextFor(card){
    const subject=subjectId(),p=currentProblem(),title=cardTitle(card),concept=norm(p?.concept)||title,problemText=norm(p?.problemText||'');
    return{subject,title,concept,problemText};
  }

  function cacheKey(ctx){return CACHE_PREFIX+hash([ctx.subject,ctx.title,ctx.concept,ctx.problemText].join('|'))}
  function readCache(ctx){try{return JSON.parse(localStorage.getItem(cacheKey(ctx))||'null')}catch{return null}}
  function writeCache(ctx,spec){try{localStorage.setItem(cacheKey(ctx),JSON.stringify(spec))}catch{}}

  async function requestSpec(ctx){
    const key=cacheKey(ctx),cached=readCache(ctx);if(cached?.elements?.length)return cached;
    if(pending.has(key))return pending.get(key);
    const task=(async()=>{
      const res=await fetch(API,{method:'POST',headers:{'content-type':'application/json',apikey:KEY},body:JSON.stringify(ctx)});
      const data=await res.json().catch(()=>({error:'invalid_response'}));
      if(!res.ok||!data?.result?.elements?.length)throw new Error(data?.detail||data?.error||`HTTP ${res.status}`);
      writeCache(ctx,data.result);return data.result;
    })().finally(()=>pending.delete(key));
    pending.set(key,task);return task;
  }

  function coords(e){return{x1:clamp(e.x1),y1:clamp(e.y1),x2:clamp(e.x2),y2:clamp(e.y2),x:clamp(e.x),y:clamp(e.y),cx:clamp(e.cx),cy:clamp(e.cy),r:clamp(e.r,0,500),w:clamp(e.width),h:clamp(e.height)}}
  function styleFor(e){const s=e?.style;return s==='accent'?{stroke:'#bf6747',fill:'#f3d7cb'}:s==='secondary'?{stroke:'#6d7f98',fill:'#e6edf4'}:s==='muted'?{stroke:'#918c84',fill:'#efede8'}:{stroke:'#4f7659',fill:'#e4efe4'}}
  function label(x,y,text,anchor='middle',extra=''){if(!norm(text))return'';return`<text x="${clamp(x)}" y="${clamp(y)}" text-anchor="${anchor}" ${extra}>${esc(text)}</text>`}
  function pointsString(points=[]){return points.slice(0,40).map(p=>`${clamp(p?.x)},${clamp(p?.y)}`).join(' ')}

  function arcPath(e){
    const c=coords(e),a1=(Number(e.startAngle)||0)*Math.PI/180,a2=(Number(e.endAngle)||0)*Math.PI/180,r=Math.max(1,c.r),x1=c.cx+r*Math.cos(a1),y1=c.cy+r*Math.sin(a1),x2=c.cx+r*Math.cos(a2),y2=c.cy+r*Math.sin(a2),delta=Math.abs((Number(e.endAngle)||0)-(Number(e.startAngle)||0))%360;
    return`M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${delta>180?1:0} ${(Number(e.endAngle)||0)>=(Number(e.startAngle)||0)?1:0} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }

  function zigzag(e,turns=8,amp=18){
    const c=coords(e),dx=c.x2-c.x1,dy=c.y2-c.y1,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,pts=[{x:c.x1,y:c.y1}];
    for(let i=1;i<turns;i++){const t=i/turns,off=(i%2?1:-1)*amp;pts.push({x:c.x1+dx*t+nx*off,y:c.y1+dy*t+ny*off})}pts.push({x:c.x2,y:c.y2});return pointsString(pts);
  }

  function battery(e){
    const c=coords(e),dx=c.x2-c.x1,dy=c.y2-c.y1,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,nx=-uy,ny=ux,mx=(c.x1+c.x2)/2,my=(c.y1+c.y2)/2,gap=12;
    const a={x:mx-ux*gap,y:my-uy*gap},b={x:mx+ux*gap,y:my+uy*gap};
    return`<line x1="${c.x1}" y1="${c.y1}" x2="${a.x}" y2="${a.y}"/><line x1="${b.x}" y1="${b.y}" x2="${c.x2}" y2="${c.y2}"/><line x1="${a.x+nx*30}" y1="${a.y+ny*30}" x2="${a.x-nx*30}" y2="${a.y-ny*30}"/><line x1="${b.x+nx*48}" y1="${b.y+ny*48}" x2="${b.x-nx*48}" y2="${b.y-ny*48}"/>${label(mx,my-55,e.label)}`;
  }

  function elementSvg(e,markerId){
    const c=coords(e),st=styleFor(e),dash=e.style==='dashed'?'stroke-dasharray="16 12"':'',arrows=`${e.arrowStart?'marker-start="url(#'+markerId+')"':''} ${e.arrowEnd||e.type==='vector'?'marker-end="url(#'+markerId+')"':''}`;
    const common=`stroke="${st.stroke}" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" ${dash} ${arrows}`;
    switch(e.type){
      case'axis':return`<line x1="${c.x1}" y1="${c.y1}" x2="${c.x2}" y2="${c.y2}" ${common} marker-end="url(#${markerId})"/>${label(c.x2-8,c.y2-16,e.label,'end')}`;
      case'line':case'wire':case'mirror':return`<line x1="${c.x1}" y1="${c.y1}" x2="${c.x2}" y2="${c.y2}" ${common}/>${label((c.x1+c.x2)/2,(c.y1+c.y2)/2-14,e.label)}`;
      case'vector':return`<line x1="${c.x1}" y1="${c.y1}" x2="${c.x2}" y2="${c.y2}" ${common}/>${label(c.x2,c.y2-16,e.label)}`;
      case'polyline':case'curve':return`<polyline points="${pointsString(e.points)}" ${common}/>${e.label&&e.points?.length?label(e.points[e.points.length-1].x,e.points[e.points.length-1].y-15,e.label):''}`;
      case'point':return`<circle cx="${c.x}" cy="${c.y}" r="8" fill="${st.stroke}" stroke="none"/>${label(c.x+14,c.y-14,e.label,'start')}`;
      case'circle':return`<circle cx="${c.cx}" cy="${c.cy}" r="${c.r}" ${common}/>${label(c.cx,c.cy-c.r-15,e.label)}`;
      case'rect':return`<rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="12" fill="${st.fill}" stroke="${st.stroke}" stroke-width="4"/>${label(c.x+c.w/2,c.y+c.h/2+7,e.label)}`;
      case'arc':return`<path d="${arcPath(e)}" ${common}/>${label(c.cx,c.cy-c.r-12,e.label)}`;
      case'spring':return`<polyline points="${zigzag(e,10,18)}" ${common}/>${label((c.x1+c.x2)/2,(c.y1+c.y2)/2-26,e.label)}`;
      case'resistor':return`<polyline points="${zigzag(e,8,20)}" ${common}/>${label((c.x1+c.x2)/2,(c.y1+c.y2)/2-28,e.label)}`;
      case'battery':return`<g ${common}>${battery(e)}</g>`;
      case'lens':{const x=Number.isFinite(Number(e.x))?c.x:(c.x1+c.x2)/2,y1=Number.isFinite(Number(e.y1))?c.y1:150,y2=Number.isFinite(Number(e.y2))?c.y2:850;return`<path d="M ${x} ${y1} C ${x-45} ${(y1+y2)/2-120},${x-45} ${(y1+y2)/2+120},${x} ${y2} M ${x} ${y1} C ${x+45} ${(y1+y2)/2-120},${x+45} ${(y1+y2)/2+120},${x} ${y2}" ${common}/>${label(x,y1-18,e.label)}`}
      case'text':return label(c.x,c.y,e.label,'middle','class="wb-dd-free-text"');
      default:return'';
    }
  }

  function renderSpec(card,spec,ctx){
    const id='wbArrow-'+hash(ctx.subject+ctx.title+Date.now()),elements=(spec.elements||[]).map(e=>elementSvg(e,id)).join(''),notes=(spec.notes||[]).filter(Boolean).slice(0,2);
    card.dataset.wbDedicatedDiagram='1';card.dataset.aiDiagramCard=`${ctx.subject}-${hash(ctx.title+ctx.concept)}`;
    card.innerHTML=`<div class="wb-dd-head" data-ai-diagram-handle aria-label="拖曳 AI 圖解"><h3 class="wb-dd-title">${esc(spec.title||ctx.title)}</h3><div class="wb-dd-ai"><span>AI 圖解</span><span class="wb-dd-grip" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span></div></div><div class="wb-dd-body"><div class="wb-dd-stage"><svg class="wb-dd-svg" viewBox="0 0 1000 625" role="img" aria-label="${esc(spec.title||ctx.title)}"><defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#4f7659"/></marker></defs><g font-family="Noto Sans TC, PingFang TC, sans-serif" font-size="30" font-weight="700" fill="#282724">${elements}</g></svg></div>${notes.length?`<div class="wb-dd-notes">${notes.map(n=>`<span class="wb-dd-note">${esc(n)}</span>`).join('')}</div>`:''}</div>`;
    card.dataset.wbDiagramState='ready';
  }

  async function upgrade(card){
    if(!card||card.dataset.wbDiagramState)return;
    const ctx=contextFor(card);if(!['math','physics'].includes(ctx.subject))return;
    card.dataset.wbDiagramState='loading';card.classList.add('wb-dd-loading');
    try{const spec=await requestSpec(ctx);if(!card.isConnected)return;renderSpec(card,spec,ctx)}catch(err){card.dataset.wbDiagramState='failed';console.warn('[wrongbook diagram tools]',err)}finally{card.classList.remove('wb-dd-loading')}
  }

  function scan(root=document.getElementById('app')||document.body){for(const label of labelNodes(root)){const card=cardFor(label);if(card)upgrade(card)}}
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;scan()})}
  scan();new MutationObserver(queue).observe(document.getElementById('app')||document.body,{childList:true,subtree:true,characterData:true});

  window.wbRenderDiagramSpec=(card,spec,ctx)=>renderSpec(card,spec,ctx||contextFor(card));
  window.__wrongbookDiagramToolsQA=()=>({loaded:true,subjects:['math','physics'],renderer:'deterministic-svg',modelRoute:'flash',cache:true,pending:pending.size,cards:document.querySelectorAll('[data-wb-dedicated-diagram="1"]').length});
})();