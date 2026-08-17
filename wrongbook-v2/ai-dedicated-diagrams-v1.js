// Wrongbook — topic-specific AI explanation diagrams.
// This module replaces generic objective/flow-card output with a real visual for known concepts.
(function(){
  if(window.__wrongbookDedicatedAiDiagramsV1)return;
  window.__wrongbookDedicatedAiDiagramsV1=true;

  const TITLE='板塊邊界地形';
  const AI_LABEL='AI 圖解';
  let queued=false;

  const style=document.createElement('style');
  style.textContent=`
    [data-ai-diagram-card="plate-boundary-landforms"]{
      overflow:visible!important;
      background:#fff!important;
    }
    [data-ai-diagram-card="plate-boundary-landforms"] .wb-plate-head{
      display:flex;align-items:center;justify-content:space-between;gap:18px;
      padding:22px 26px 15px;border-bottom:1px solid #ece9e3;
      cursor:grab;touch-action:none;-webkit-user-select:none;user-select:none;
    }
    [data-ai-diagram-card="plate-boundary-landforms"] .wb-plate-head:active{cursor:grabbing}
    .wb-plate-title{margin:0;font-size:clamp(20px,2.3vw,28px);line-height:1.2;font-weight:800;color:#22211f;letter-spacing:.01em}
    .wb-plate-ai{display:flex;align-items:center;gap:12px;flex:0 0 auto;color:#85817a;font-size:15px;font-weight:700;white-space:nowrap}
    .wb-plate-grip{display:grid;grid-template-columns:repeat(2,4px);gap:3px;padding:4px 2px;opacity:.7}
    .wb-plate-grip i{display:block;width:4px;height:4px;border-radius:999px;background:#aaa69f}
    .wb-plate-body{padding:22px 24px 18px}
    .wb-plate-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
    .wb-plate-panel{min-width:0;border:1px solid #e8e5df;border-radius:20px;padding:18px;background:#fcfcfa}
    .wb-plate-kind{display:table;margin:0 auto 13px;padding:8px 18px;border-radius:999px;background:#4f7d5b;color:#fff;font-size:17px;font-weight:800;letter-spacing:.02em}
    .wb-plate-visual{display:block;width:100%;height:auto;aspect-ratio:16/8.4;overflow:visible}
    .wb-plate-result{display:flex;align-items:center;justify-content:center;min-height:50px;margin-top:10px;padding:10px 12px;border-radius:14px;background:#f3f4f0;color:#282825;text-align:center;font-size:17px;line-height:1.35;font-weight:800}
    .wb-plate-mini{display:table;margin:8px auto 0;padding:4px 10px;border:1px dashed #7b9b80;border-radius:9px;color:#3f6549;background:#f8fbf7;font-size:14px;font-weight:800}
    .wb-plate-note{margin:14px 0 0;text-align:center;color:#8c8881;font-size:13px;font-weight:650}
    @media(max-width:680px){
      [data-ai-diagram-card="plate-boundary-landforms"] .wb-plate-head{padding:17px 18px 12px}
      .wb-plate-body{padding:15px}
      .wb-plate-grid{grid-template-columns:1fr;gap:12px}
      .wb-plate-panel{padding:14px}
      .wb-plate-kind,.wb-plate-result{font-size:16px}
    }
  `;
  document.head.appendChild(style);

  function norm(value){return String(value||'').replace(/\s+/g,' ').trim()}

  function textParents(root,text){
    const out=[];
    const walker=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,{acceptNode(node){
      if(norm(node.nodeValue)!==text)return NodeFilter.FILTER_REJECT;
      const p=node.parentElement;
      return p&&!p.closest('script,style,template')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
    }});
    while(walker.nextNode())out.push(walker.currentNode.parentElement);
    return [...new Set(out)];
  }

  function cardFromTitle(titleEl){
    let el=titleEl;
    let fallback=null;
    for(let depth=0;depth<10&&el&&el!==document.body;depth++,el=el.parentElement){
      if(el.id==='app')break;
      const text=norm(el.textContent);
      if(!text.includes(TITLE)||!text.includes(AI_LABEL))continue;
      const rect=el.getBoundingClientRect();
      if(rect.width<300||rect.height<220)continue;
      fallback=el;
      const cs=getComputedStyle(el);
      const radius=parseFloat(cs.borderTopLeftRadius)||0;
      const looksCard=radius>=10||parseFloat(cs.borderTopWidth)>0||cs.boxShadow!=='none'||/card|panel|diagram|figure/i.test(String(el.className||''));
      if(looksCard)return el;
    }
    return fallback;
  }

  function plateMarkup(){
    return `<div class="wb-plate-head" data-ai-diagram-handle aria-label="拖曳 AI 圖解">
      <h3 class="wb-plate-title">板塊邊界地形</h3>
      <div class="wb-plate-ai"><span>AI 圖解</span><span class="wb-plate-grip" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span></div>
    </div>
    <div class="wb-plate-body">
      <div class="wb-plate-grid">
        <section class="wb-plate-panel" aria-label="張裂型邊界">
          <div class="wb-plate-kind">張裂型邊界</div>
          <svg class="wb-plate-visual" viewBox="0 0 360 190" role="img" aria-label="兩板塊向外分離，中央形成裂谷或中洋脊">
            <defs>
              <marker id="wbSpreadArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#4f7d5b"/></marker>
              <linearGradient id="wbMagmaSpread" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e76743"/><stop offset="1" stop-color="#f39a5f"/></linearGradient>
            </defs>
            <path d="M22 78 L145 78 L155 96 L142 126 L22 126 Z" fill="#d9c9aa" stroke="#66645e" stroke-width="2"/>
            <path d="M338 78 L215 78 L205 96 L218 126 L338 126 Z" fill="#d9c9aa" stroke="#66645e" stroke-width="2"/>
            <path d="M22 126H142L137 140H22Z" fill="#b49f7c"/>
            <path d="M338 126H218L223 140H338Z" fill="#b49f7c"/>
            <path d="M177 143 C175 126 169 114 161 102 C170 105 176 98 180 87 C184 98 190 105 199 102 C191 114 185 126 183 143Z" fill="url(#wbMagmaSpread)" opacity=".92"/>
            <path d="M147 83 C156 95 163 100 180 102 C197 100 204 95 213 83" fill="none" stroke="#716e67" stroke-width="2"/>
            <path d="M145 58H70" fill="none" stroke="#4f7d5b" stroke-width="5" stroke-linecap="round" marker-end="url(#wbSpreadArrow)"/>
            <path d="M215 58H290" fill="none" stroke="#4f7d5b" stroke-width="5" stroke-linecap="round" marker-end="url(#wbSpreadArrow)"/>
            <path d="M180 153V118" fill="none" stroke="#e76743" stroke-width="4" stroke-linecap="round" marker-end="url(#wbSpreadArrow)" opacity="0"/>
            <path d="M180 151V116" fill="none" stroke="#e76743" stroke-width="4" stroke-linecap="round"/>
            <path d="M174 124L180 114L186 124" fill="#e76743"/>
          </svg>
          <div class="wb-plate-result">裂谷／中洋脊</div>
        </section>
        <section class="wb-plate-panel" aria-label="聚合型邊界">
          <div class="wb-plate-kind">聚合型邊界</div>
          <svg class="wb-plate-visual" viewBox="0 0 360 190" role="img" aria-label="海洋板塊向下隱沒，形成海溝、火山與山脈">
            <defs>
              <marker id="wbSubArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#fff"/></marker>
            </defs>
            <path d="M10 74H154C169 74 179 82 187 95C195 82 207 75 222 75H350V102H218C205 102 196 109 190 119C182 107 170 100 154 100H10Z" fill="#b9d9e7" stroke="#66818a" stroke-width="2"/>
            <path d="M12 100H154C171 100 184 108 195 122L251 175H226L176 132C169 126 162 124 151 124H12Z" fill="#716f68"/>
            <path d="M155 105C174 108 184 119 196 132L244 175" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" marker-end="url(#wbSubArrow)"/>
            <path d="M218 102H350V142H220C209 137 201 130 195 122C202 112 209 106 218 102Z" fill="#cdb993" stroke="#6d675d" stroke-width="2"/>
            <path d="M238 101L264 70L278 86L299 51L327 85L350 76V102Z" fill="#9bab68" stroke="#68685e" stroke-width="2"/>
            <path d="M282 91L298 56L313 91Z" fill="#7d765f"/>
            <path d="M294 128C291 109 293 96 298 82C303 96 305 109 302 128C314 135 317 145 314 155H281C278 145 282 135 294 128Z" fill="#e76e45" opacity=".9"/>
            <path d="M298 89V57" stroke="#e76e45" stroke-width="4" stroke-linecap="round"/>
            <circle cx="297" cy="45" r="9" fill="#aaa79f"/><circle cx="306" cy="37" r="8" fill="#bbb8b0"/><circle cx="291" cy="34" r="7" fill="#c4c1b9"/>
            <path d="M174 91C181 96 185 101 189 108" fill="none" stroke="#4f7d5b" stroke-width="3"/>
          </svg>
          <div class="wb-plate-mini">隱沒 → 海溝</div>
          <div class="wb-plate-result">海溝・火山・造山運動</div>
        </section>
      </div>
    </div>`;
  }

  function upgrade(card){
    if(!card||card.dataset.wbDedicatedPlateBoundary==='1')return;
    card.dataset.wbDedicatedPlateBoundary='1';
    card.dataset.aiDiagramCard='plate-boundary-landforms';
    card.innerHTML=plateMarkup();
  }

  function scan(){
    const app=document.getElementById('app')||document.body;
    for(const titleEl of textParents(app,TITLE)){
      const card=cardFromTitle(titleEl);
      if(card)upgrade(card);
    }
  }

  function queue(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;scan()});
  }

  scan();
  const app=document.getElementById('app')||document.body;
  new MutationObserver(queue).observe(app,{childList:true,subtree:true,characterData:true});
})();