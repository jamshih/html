// Wrong Book — deterministic TikZ-style spatial geometry diagrams.
// Gemini may decide that a diagram is useful, but for this line/point/plane pattern the browser owns
// the complete geometry and layout. No generative image and no model-authored coordinates are used.
(function(){
  const VERSION='2026-08-18-tikz-spatial-v1';
  if(window.__wrongbookTikzSpatialGeometry===VERSION)return;
  window.__wrongbookTikzSpatialGeometry=VERSION;

  let queued=false;
  const norm=v=>String(v??'').replace(/（/g,'(').replace(/）/g,')').replace(/，/g,',').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const finite=v=>Number.isFinite(Number(v));
  const currentProblem=()=>{try{return typeof selectedProblem==='function'?selectedProblem():null}catch{return null}};

  function pointTuple(text,name){
    const m=norm(text).match(new RegExp(`(?:^|[^A-Za-z0-9])${name}\\s*\\(([^()]*)\\)`,'i'));
    if(!m)return null;
    const parts=m[1].split(',').map(x=>x.trim()).filter(Boolean);
    return parts.length>=2&&parts.length<=4?parts:null;
  }
  function tupleLabel(name,parts){return parts?.length?`${name}(${parts.join(', ')})`:name}
  function lineName(text){const m=norm(text).match(/直線\s*([A-Z]{2})/i);return m?.[1]?.toUpperCase()||'AB'}
  function subjectIsMath(p){return ['math','mathematics','數學'].includes(String(p?.subject||window.state?.subject||'').toLowerCase())}
  function matches(p){
    if(!p||!subjectIsMath(p))return false;
    const t=norm(p.problemText||p.title||'');
    if(!/平面/.test(t)||!/垂直/.test(t))return false;
    const line=lineName(t),a=line[0],b=line[1];
    return Boolean(pointTuple(t,a)&&pointTuple(t,b)&&pointTuple(t,'P')&&new RegExp(`(?:直線\\s*)?${line}`,'i').test(t)&&/(?:P[^。；;]{0,34}(?:在|位於)[^。；;]{0,22}(?:上|直線)|通過\s*P|過\s*P)/i.test(t));
  }
  function parameterRatio(a,b,p){
    if(!a||!b||!p)return .5;
    for(let i=0;i<Math.min(a.length,b.length,p.length);i++){
      if(!finite(a[i])||!finite(b[i])||!finite(p[i]))continue;
      const av=Number(a[i]),bv=Number(b[i]),pv=Number(p[i]),d=bv-av;if(Math.abs(d)<1e-9)continue;
      const t=(pv-av)/d;if(t>=0&&t<=1)return t;
    }
    return .5;
  }
  function modelFor(p){
    const text=norm(p?.problemText||p?.title||''),line=lineName(text),aName=line[0]||'A',bName=line[1]||'B';
    const a=pointTuple(text,aName),b=pointTuple(text,bName),point=pointTuple(text,'P');
    return{line,aName,bName,a,b,p:point,ratio:parameterRatio(a,b,point)};
  }

  function installStyle(){
    if(document.getElementById('wrongbookTikzSpatialStyle'))return;
    const style=document.createElement('style');style.id='wrongbookTikzSpatialStyle';style.textContent=`
      .v8-ai-diagram[data-wb-tikz-spatial="1"]{border:1px solid #e5e1da!important;border-radius:20px!important;background:#fff!important;overflow:hidden!important;box-shadow:0 8px 24px rgba(48,44,37,.07)!important}
      .v8-ai-diagram[data-wb-tikz-spatial="1"]>.wb-tikz-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px 10px;border-bottom:1px solid #ece9e3}
      .wb-tikz-title{margin:0;font-size:clamp(17px,1.8vw,23px);font-weight:820;color:#22211f;line-height:1.25}.wb-tikz-badge{font-size:12px;font-weight:800;color:#77736c;white-space:nowrap}
      .wb-tikz-body{padding:10px 12px 12px}.wb-tikz-stage{border:1px solid #ebe7df;border-radius:16px;background:#fffdfa;overflow:hidden}.wb-tikz-svg{display:block;width:100%;height:auto;aspect-ratio:2/1;background:#fffdfa}
      .wb-tikz-notes{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px}.wb-tikz-note{padding:6px 9px;border-radius:999px;background:#f1f4ef;color:#3f6549;font-size:12px;font-weight:800}
      .v5-tutor-stage>.v8-ai-diagram[data-wb-tikz-spatial="1"]{display:none!important}
      .v9-sheet-ai-card:has(.v8-ai-diagram[data-wb-tikz-spatial="1"]) .wb-diagram-page-nav{display:none!important}
      .v9-sheet-ai-card:has(.v8-ai-diagram[data-wb-tikz-spatial="1"]){background:#fff!important}
      @media(max-width:680px){.v8-ai-diagram[data-wb-tikz-spatial="1"]>.wb-tikz-head{padding:11px 12px 8px}.wb-tikz-body{padding:8px}.wb-tikz-svg{aspect-ratio:4/2.35}.wb-tikz-note{font-size:11px}}
    `;document.head.appendChild(style);
  }

  function svgMarkup(m){
    const ax=215,bx=885,y=310,px=Math.round(ax+(bx-ax)*Math.min(.78,Math.max(.22,m.ratio))),planeX1=px-90,planeX2=px+90;
    const aLabel=esc(tupleLabel(m.aName,m.a)),bLabel=esc(tupleLabel(m.bName,m.b)),pLabel=esc(tupleLabel('P',m.p)),line=esc(m.line);
    const pBoxW=Math.min(325,Math.max(210,[...pLabel].length*21));
    return `<svg class="wb-tikz-svg" viewBox="0 0 1100 550" role="img" aria-label="${line} 通過 A、P、B，且過 P 的平面與 ${line} 垂直">
      <defs>
        <marker id="wbTikzArrow" viewBox="0 0 10 10" refX="8.7" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#4f7659"/></marker>
        <linearGradient id="wbTikzPlane" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8efe8" stop-opacity=".82"/><stop offset="1" stop-color="#dbe8dc" stop-opacity=".40"/></linearGradient>
      </defs>
      <g font-family="Noto Sans TC, PingFang TC, Microsoft JhengHei, sans-serif">
        <polygon points="${planeX1},125 ${planeX2},85 ${planeX2},475 ${planeX1},515" fill="url(#wbTikzPlane)" stroke="#9bb19f" stroke-width="2" stroke-dasharray="9 9"/>
        <line x1="${px}" y1="58" x2="${px}" y2="510" stroke="#4f7659" stroke-width="5" stroke-dasharray="18 16" stroke-linecap="round"/>
        <line x1="105" y1="${y}" x2="995" y2="${y}" stroke="#4f7659" stroke-width="7" stroke-linecap="round" marker-start="url(#wbTikzArrow)" marker-end="url(#wbTikzArrow)"/>
        <path d="M ${px} ${y-28} H ${px+28} V ${y}" fill="none" stroke="#bf6747" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="${ax}" cy="${y}" r="10" fill="#4f7659"/><circle cx="${bx}" cy="${y}" r="10" fill="#4f7659"/><circle cx="${px}" cy="${y}" r="11" fill="#bf6747"/>
        <text x="${ax}" y="${y-32}" text-anchor="middle" font-size="29" font-weight="800" fill="#262522">${aLabel}</text>
        <text x="${bx}" y="${y-32}" text-anchor="middle" font-size="29" font-weight="800" fill="#262522">${bLabel}</text>
        <rect x="${px+22}" y="82" width="${pBoxW}" height="58" rx="16" fill="#fffdfa" stroke="#e4dfd6"/>
        <text x="${px+40}" y="120" text-anchor="start" font-size="31" font-weight="850" fill="#262522">${pLabel}</text>
        <text x="${Math.round((ax+px)/2)}" y="366" text-anchor="middle" font-size="24" font-weight="800" fill="#3f6549">直線 ${line}</text>
        <rect x="${px+48}" y="390" width="250" height="54" rx="15" fill="#fffdfa" stroke="#dfe5dd"/>
        <text x="${px+173}" y="425" text-anchor="middle" font-size="23" font-weight="800" fill="#3f6549">平面 α 的截面</text>
        <text x="${px+34}" y="${y-38}" font-size="21" font-weight="850" fill="#bf6747">90°</text>
        <text x="58" y="70" font-size="18" font-weight="750" fill="#77736c">示意圖不代表 3D 比例；只保留題目的幾何關係</text>
      </g>
    </svg>`;
  }
  function markup(m){return `<div class="wb-tikz-head"><h3 class="wb-tikz-title">直線與垂直平面</h3><span class="wb-tikz-badge">AI 圖解 · TikZ-style</span></div><div class="wb-tikz-body"><div class="wb-tikz-stage">${svgMarkup(m)}</div><div class="wb-tikz-notes"><span class="wb-tikz-note">P ∈ ${esc(m.line)}</span><span class="wb-tikz-note">${esc(m.line)} ⟂ 平面 α</span><span class="wb-tikz-note">平面通過 P</span></div></div>`}

  function stageElement(){return document.querySelector('.v5-tutor-stage')}
  function ensureSourceDiagram(p){
    const stage=stageElement();if(!stage)return null;
    let card=stage.querySelector(':scope > .v8-ai-diagram');
    if(!card){card=document.createElement('div');card.className='v8-ai-diagram';const paragraph=stage.querySelector(':scope > p');if(paragraph)paragraph.insertAdjacentElement('afterend',card);else stage.prepend(card)}
    const signature=`${VERSION}|${norm(p.problemText||p.title||'')}`;
    if(card.dataset.wbTikzSignature!==signature){card.dataset.wbTikzSignature=signature;card.dataset.v8Signature=signature;card.dataset.wbTikzSpatial='1';card.dataset.wbDiagramState='ready';card.dataset.aiDiagramCard='tikz-spatial-line-plane';card.innerHTML=markup(modelFor(p))}
    return card;
  }
  function clearOwnership(){document.querySelectorAll('.v8-ai-diagram[data-wb-tikz-spatial="1"]').forEach(card=>card.remove())}
  function apply(){
    const p=currentProblem();if(!matches(p)){clearOwnership();return false}
    installStyle();const card=ensureSourceDiagram(p);if(!card)return false;
    try{if(typeof window.__wrongbookPaperOverlayV9==='string'&&typeof window.runWrongbookPaperOverlayQA==='function')requestAnimationFrame(()=>window.runWrongbookPaperOverlayQA())}catch{}
    return true;
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}

  window.__wrongbookTikzSpatialTest={matches,pointTuple,lineName,parameterRatio,modelFor};
  window.wrongbookTikzSpatialQA=function(){
    const fixture={subject:'math',problemText:'空間中有兩點 A(1, 5, -4)、B(-14, 15, 6)，已知點 P(-5, r, s) 在 AB 上，若平面通過 P 點且與直線 AB 垂直。'},m=modelFor(fixture),source=document.querySelector('.v5-tutor-stage>.v8-ai-diagram[data-wb-tikz-spatial="1"]'),clone=document.querySelector('.v9-sheet-ai-card .v8-ai-diagram[data-wb-tikz-spatial="1"]');
    const parsed=Boolean(m.a?.join(',')==='1,5,-4'&&m.b?.join(',')==='-14,15,6'&&m.p?.join(',')==='-5,r,s');
    const ratioOk=Number(m.ratio.toFixed(2))===.4;
    return{version:VERSION,fixtureDetected:matches(fixture),parsedPoints:parsed,ratioFromKnownCoordinate:ratioOk,sourceDeterministic:!source||source.dataset.wbDiagramState==='ready',diagramOnSheet:!source||Boolean(clone),rightAngleMarker:!source||Boolean(source.querySelector('path[d*=" H "]')),pagerSuppressedForTikz:true,generativeImageUsed:false,geminiLayoutUsed:false,pass:Boolean(matches(fixture)&&parsed&&ratioOk&&(!source||source.dataset.wbDiagramState==='ready'))};
  };

  apply();const app=document.getElementById('app')||document.body;new MutationObserver(queue).observe(app,{childList:true,subtree:true,characterData:true});
  document.addEventListener('click',queue,true);setTimeout(queue,120);setTimeout(queue,650);
})();
