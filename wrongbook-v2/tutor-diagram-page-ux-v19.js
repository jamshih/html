// Wrong Book V19 — diagram-page UX: compact viewport, collision-aware labels, and in-card tutor navigation.
(function(){
  const VERSION='2026-08-18-tutor-diagram-page-ux-v19';
  if(window.__wrongbookTutorDiagramPageUxV19===VERSION)return;
  window.__wrongbookTutorDiagramPageUxV19=VERSION;

  const STYLE_ID='wrongbookTutorDiagramPageUxV19Style';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .wb-dd-body{padding:12px 14px 14px!important}
      .wb-dd-stage{width:100%;max-width:980px;margin:0 auto;aspect-ratio:16/9;border-radius:16px!important;overflow:hidden!important;display:grid;place-items:center;background:#fffdf9}
      .wb-dd-svg{display:block!important;width:100%!important;height:100%!important;max-height:min(48vh,460px)!important;aspect-ratio:auto!important;background:#fffdf9!important}
      .wb-dd-svg text{paint-order:stroke;stroke:#fffdf9;stroke-width:5px;stroke-linejoin:round}
      .wb-dd-svg text[data-wb-v19-long-label="1"]{font-size:24px!important}
      .wb-diagram-page-nav{position:sticky;bottom:0;z-index:18;display:grid;grid-template-columns:44px minmax(58px,auto) 44px;align-items:center;justify-content:center;gap:12px;width:max-content;max-width:calc(100% - 24px);margin:10px auto 0;padding:8px 10px;border:1px solid #e6e3dc;border-radius:14px;background:rgba(255,253,249,.96);box-shadow:0 8px 24px rgba(40,42,38,.08);backdrop-filter:blur(8px)}
      .wb-diagram-page-nav button{width:44px;height:44px;min-width:44px;min-height:44px;padding:0;border:1px solid #deddd8;border-radius:12px;background:#fffdf9;color:#60645d;font:700 24px/1 system-ui;display:grid;place-items:center;cursor:pointer}
      .wb-diagram-page-nav button:disabled{color:#d2d2ce;border-color:#ecebe7;cursor:default}
      .wb-diagram-page-count{min-width:58px;text-align:center;color:#666a63;font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}
      .v5-tutor-stage.wb-diagram-stage-active > .v16-canonical-nav{display:none!important}
      .v9-sheet-ai-card .wb-diagram-page-nav{margin:7px auto 8px;grid-template-columns:38px minmax(50px,auto) 38px;gap:8px;padding:6px 8px;border-radius:11px}
      .v9-sheet-ai-card .wb-diagram-page-nav button{width:38px;height:38px;min-width:38px;min-height:38px;border-radius:10px;font-size:21px}
      .v9-sheet-ai-card .wb-diagram-page-count{min-width:50px;font-size:12px}
      @media(max-width:700px){
        .wb-dd-body{padding:9px!important}
        .wb-dd-stage{aspect-ratio:4/3;max-width:100%;border-radius:13px!important}
        .wb-dd-svg{max-height:min(42vh,380px)!important}
        .wb-dd-svg text[data-wb-v19-long-label="1"]{font-size:22px!important}
        .wb-diagram-page-nav{grid-template-columns:40px minmax(52px,auto) 40px;gap:10px;margin-top:8px;padding:6px 8px;border-radius:12px}
        .wb-diagram-page-nav button{width:40px;height:40px;min-width:40px;min-height:40px;border-radius:11px;font-size:22px}
        .wb-diagram-page-count{min-width:52px;font-size:13px}
      }
    `;
    document.head.appendChild(style);
  }

  const currentProblem=()=>{try{return typeof selectedProblem==='function'?selectedProblem():null}catch{return null}};
  const currentSession=()=>{try{const p=currentProblem();if(!p)return null;return typeof v5TutorSession==='function'?v5TutorSession(p):(state?.tutorSessions?.[p.id]||null)}catch{return null}};
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const overlaps=(a,b,pad=8)=>!(a.x+a.width+pad<=b.x||b.x+b.width+pad<=a.x||a.y+a.height+pad<=b.y||b.y+b.height+pad<=a.y);

  function normalizeLabels(svg){
    if(!svg||!svg.isConnected)return false;
    const texts=[...svg.querySelectorAll('g text')];
    if(!texts.length)return false;
    const placed=[];
    const shifts=[[0,0],[0,-38],[0,38],[0,-70],[0,70],[-72,-36],[72,-36],[-72,36],[72,36],[-110,0],[110,0]];
    for(const text of texts){
      const raw=String(text.textContent||'').trim();
      if(!text.dataset.wbV19BaseX)text.dataset.wbV19BaseX=String(Number(text.getAttribute('x'))||0);
      if(!text.dataset.wbV19BaseY)text.dataset.wbV19BaseY=String(Number(text.getAttribute('y'))||0);
      const bx=Number(text.dataset.wbV19BaseX)||0,by=Number(text.dataset.wbV19BaseY)||0;
      if(raw.length>=13)text.dataset.wbV19LongLabel='1';else delete text.dataset.wbV19LongLabel;
      let accepted=null;
      for(const [dx,dy] of shifts){
        text.setAttribute('x',String(clamp(bx+dx,28,972)));
        text.setAttribute('y',String(clamp(by+dy,32,600)));
        let box=null;try{box=text.getBBox()}catch{}
        if(!box)continue;
        if(!placed.some(prev=>overlaps(box,prev,10))){accepted=box;break}
      }
      if(!accepted){try{accepted=text.getBBox()}catch{}}
      if(accepted)placed.push(accepted);
    }
    return true;
  }

  function fitDedicatedSvg(svg){
    if(!svg||!svg.isConnected)return false;
    const group=svg.querySelector(':scope > g')||svg.querySelector('g:not(defs g)');
    if(!group)return false;
    normalizeLabels(svg);
    let box=null;try{box=group.getBBox()}catch{}
    if(!box||!box.width||!box.height)return false;
    const mobile=matchMedia('(max-width:700px)').matches,target=mobile?4/3:16/9;
    const pad=Math.max(34,Math.min(74,Math.max(box.width,box.height)*.065));
    let x=box.x-pad,y=box.y-pad,w=box.width+pad*2,h=box.height+pad*2;
    const ratio=w/h;
    if(ratio<target){const next=h*target;x-=(next-w)/2;w=next}else if(ratio>target){const next=w/target;y-=(next-h)/2;h=next}
    svg.setAttribute('viewBox',`${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.dataset.wbV19Fitted='1';
    const stage=svg.closest('.wb-dd-stage');if(stage)stage.style.aspectRatio=mobile?'4 / 3':'16 / 9';
    return true;
  }

  function navHostFor(card){
    if(card.matches('.v9-sheet-ai-card'))return card;
    if(card.matches('[data-wb-dedicated-diagram="1"]'))return card;
    if(card.matches('.v8-ai-diagram'))return card;
    return null;
  }

  function ensureDiagramNav(card){
    const host=navHostFor(card);if(!host)return null;
    const session=currentSession(),total=Array.isArray(session?.stages)?session.stages.length:0;
    let nav=host.querySelector(':scope > .wb-diagram-page-nav');
    if(total<=1){nav?.remove();return null}
    if(!nav){
      nav=document.createElement('div');nav.className='wb-diagram-page-nav';nav.setAttribute('role','group');nav.setAttribute('aria-label','圖解步驟導覽');
      nav.innerHTML='<button type="button" data-wb-v19-prev aria-label="上一步">‹</button><span class="wb-diagram-page-count" aria-live="polite"></span><button type="button" data-wb-v19-next aria-label="下一步">›</button>';
      host.appendChild(nav);
    }
    const index=clamp(Math.trunc(Number(session.activeIndex)||0),0,total-1),prev=nav.querySelector('[data-wb-v19-prev]'),next=nav.querySelector('[data-wb-v19-next]'),count=nav.querySelector('.wb-diagram-page-count');
    if(prev)prev.disabled=index<=0;if(next)next.disabled=index>=total-1;if(count)count.textContent=`${index+1} / ${total}`;
    nav.dataset.problemId=String(currentProblem()?.id||'');
    return nav;
  }

  function scan(){
    document.querySelectorAll('.v5-tutor-stage').forEach(stage=>stage.classList.remove('wb-diagram-stage-active'));
    const cards=[...document.querySelectorAll('[data-wb-dedicated-diagram="1"],.v8-ai-diagram,.v9-sheet-ai-card')];
    for(const card of cards){
      const svg=card.querySelector('.wb-dd-svg');if(svg)requestAnimationFrame(()=>fitDedicatedSvg(svg));
      const nav=ensureDiagramNav(card);
      const tutorStage=card.closest('.v5-tutor-stage');if(nav&&tutorStage)tutorStage.classList.add('wb-diagram-stage-active');
    }
  }

  document.addEventListener('click',event=>{
    const prev=event.target?.closest?.('[data-wb-v19-prev]'),next=event.target?.closest?.('[data-wb-v19-next]');if(!prev&&!next)return;
    event.preventDefault();event.stopPropagation();
    const session=currentSession();if(!session?.stages?.length)return;
    const target=clamp((Number(session.activeIndex)||0)+(next?1:-1),0,session.stages.length-1);
    if(typeof v5TutorGoTo==='function')v5TutorGoTo(target);
  },true);

  let queued=false;
  const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;scan()})};
  const mount=()=>{const app=document.getElementById('app');if(!app)return setTimeout(mount,40);new MutationObserver(queue).observe(app,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','data-wb-dedicated-diagram','data-wb-diagram-state']});window.addEventListener('resize',queue,{passive:true});scan()};
  mount();

  window.wrongbookTutorDiagramPageUxQA=function(){
    scan();const s=currentSession(),cards=[...document.querySelectorAll('[data-wb-dedicated-diagram="1"],.v8-ai-diagram,.v9-sheet-ai-card')],svgs=cards.map(c=>c.querySelector('.wb-dd-svg')).filter(Boolean),navs=[...document.querySelectorAll('.wb-diagram-page-nav')],needs=Boolean(s?.stages?.length>1&&cards.length);
    return{version:VERSION,diagramCards:cards.length,dedicatedSvgs:svgs.length,fittedSvgs:svgs.filter(x=>x.dataset.wbV19Fitted==='1').length,navigatorRequired:needs,navigatorPresent:!needs||navs.length>0,oneNavigatorPerCard:cards.every(c=>c.querySelectorAll(':scope > .wb-diagram-page-nav').length<=1),collisionPass:svgs.every(svg=>{const ts=[...svg.querySelectorAll('g text')],boxes=[];for(const t of ts){let b=null;try{b=t.getBBox()}catch{}if(!b)continue;if(boxes.some(x=>overlaps(b,x,4)))return false;boxes.push(b)}return true}),pass:Boolean((!needs||navs.length>0)&&cards.every(c=>c.querySelectorAll(':scope > .wb-diagram-page-nav').length<=1)&&svgs.every(x=>x.dataset.wbV19Fitted==='1'||!x.isConnected))};
  };
})();