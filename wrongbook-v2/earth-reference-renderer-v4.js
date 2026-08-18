// Interactive renderer for the six photographed Earth Science「脈絡整合」chapter spreads.
// Keeps the existing 108 課綱 mind map intact as an alternate mode.

const v4RefGenericMindmapPage=mindmapPage;
const v4RefGenericBind=bind;
const V4REF_W=1900,V4REF_H=1320;

function v4RefEsc(s=''){return typeof esc==='function'?esc(String(s)):String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function v4RefNorm(s=''){
 return String(s).trim().toLowerCase().normalize('NFKC').replace(/[\s、，,。．\.・·:：;；()（）\[\]【】<>＜＞/／\\_-]/g,'').replace(/約|大約|左右|大致|大概/g,'').replace(/攝氏/g,'').replace(/度/g,'°').replace(/百分之/g,'%');
}
function v4RefFieldKey(ch,item,fi){return `earth-ref:${ch.number}:${item.number}:${fi}`}
function v4RefAnswerValue(ch,item,fi){return state.refEarthAnswers?.[v4RefFieldKey(ch,item,fi)]||''}
function v4RefFieldOk(ch,item,fi){
 const val=v4RefNorm(v4RefAnswerValue(ch,item,fi));if(!val)return false;
 const f=item.fields[fi],accepted=[f.answer,...(f.aliases||[])].map(v4RefNorm);
 return accepted.some(a=>a===val||a&&val.length>=2&&(a.includes(val)||val.includes(a)));
}
function v4RefItemOk(ch,item){return item.fields.every((_,fi)=>v4RefFieldOk(ch,item,fi))}
function v4RefStats(ch){const items=v4RefAllItems(ch),done=items.filter(i=>v4RefItemOk(ch,i)).length;return{done,total:items.length,pct:items.length?Math.round(done/items.length*100):0}}
function v4RefCurrentChapter(){const n=Number(state.refEarthChapter||1);return EARTH_REFERENCE_MAPS.find(x=>x.number===n)||EARTH_REFERENCE_MAPS[0]}
function v4RefStudyMode(){return ['learn','recall','review'].includes(state.refEarthStudyMode)?state.refEarthStudyMode:'recall'}

function v4RefMiniDiagram(type){
 const start='<svg class="v4ref-diagram-svg" viewBox="0 0 300 150" aria-hidden="true">',end='</svg>';
 const common='<defs><marker id="v4ref-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="currentColor"/></marker></defs>';
 const map={
  'bigbang':`<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="30" cy="75" r="9" fill="currentColor"/><path d="M42 75 C85 44 125 39 166 52 S238 74 282 75"/><path d="M42 75 C85 106 125 111 166 98 S238 76 282 75"/></g><g fill="currentColor"><circle cx="110" cy="61" r="3"/><circle cx="154" cy="88" r="4"/><circle cx="205" cy="60" r="3"/><circle cx="250" cy="90" r="4"/></g>`,
  'nebula':`<g fill="none" stroke="currentColor" stroke-width="3"><ellipse cx="150" cy="78" rx="125" ry="42"/><ellipse cx="150" cy="78" rx="72" ry="24"/><circle cx="150" cy="78" r="18" fill="#f3ca65"/><path d="M28 78h244" stroke-dasharray="8 7"/></g><g fill="currentColor"><circle cx="65" cy="77" r="5"/><circle cx="94" cy="63" r="4"/><circle cx="212" cy="86" r="5"/><circle cx="238" cy="68" r="4"/></g>`,
  'earth-evolution':`<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="112" cy="78" r="48"/><path d="M80 64q20-18 41-5t36 0M82 92q27 14 58 3"/><path d="M181 38v80"/><path d="M195 48h72M195 78h72M195 108h72"/></g><circle cx="112" cy="78" r="58" fill="none" stroke="currentColor" stroke-dasharray="4 6"/>`,
  'geotime':`<g fill="none" stroke="currentColor" stroke-width="3"><path d="M25 82H278" marker-end="url(#v4ref-arr)"/><path d="M55 62v40M105 62v40M165 62v40M225 62v40"/></g><g fill="currentColor"><circle cx="55" cy="82" r="6"/><circle cx="105" cy="82" r="6"/><circle cx="165" cy="82" r="6"/><circle cx="225" cy="82" r="6"/></g>`,
  'fossil-timeline':`<g fill="none" stroke="currentColor" stroke-width="3"><path d="M25 105H278" marker-end="url(#v4ref-arr)"/><path d="M65 90v30M125 90v30M190 90v30M245 90v30"/></g><g fill="currentColor"><path d="M51 70q14-20 28 0q-14 14-28 0Z"/><path d="M113 69q13-20 25 1q-13 12-25-1Z"/><circle cx="190" cy="66" r="13"/><path d="M236 76q9-22 18 0Z"/></g>`,
  'star-spectrum':`<g fill="none" stroke="currentColor" stroke-width="3"><path d="M28 112H280M42 125V20"/><path d="M48 105C75 98 86 44 108 35s34 60 54 64s39-34 54-28s27 25 52 28"/></g><g fill="currentColor"><circle cx="70" cy="35" r="10"/><circle cx="119" cy="50" r="10"/><circle cx="177" cy="66" r="10"/><circle cx="237" cy="82" r="10"/></g>`,
  'celestial-sphere':`<g fill="none" stroke="currentColor" stroke-width="3"><ellipse cx="150" cy="82" rx="115" ry="45"/><ellipse cx="150" cy="82" rx="48" ry="112" transform="rotate(-26 150 82)"/><path d="M150 18v128" stroke-dasharray="6 5"/></g><g fill="currentColor"><circle cx="92" cy="67" r="4"/><circle cx="210" cy="92" r="4"/><circle cx="151" cy="35" r="5"/></g>`,
  'solar-system':`<g fill="none" stroke="currentColor" stroke-width="2"><circle cx="52" cy="76" r="19" fill="#f3ca65"/><ellipse cx="110" cy="76" rx="42" ry="22"/><ellipse cx="160" cy="76" rx="76" ry="36"/><ellipse cx="210" cy="76" rx="112" ry="50"/></g><g fill="currentColor"><circle cx="111" cy="55" r="5"/><circle cx="160" cy="112" r="7"/><circle cx="242" cy="41" r="9"/></g>`,
  'cosmic-scale':`<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="65" cy="76" r="22"/><circle cx="112" cy="76" r="40"/><circle cx="174" cy="76" r="60"/><circle cx="240" cy="76" r="72" stroke-dasharray="7 6"/></g><path d="M43 76q22-20 44 0q-22 20-44 0Zm91 0q40-30 80 0q-40 30-80 0Z" fill="none" stroke="currentColor" stroke-width="2"/>`,
  'earth-rotation':`<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="150" cy="78" r="52"/><path d="M125 26l50 104"/><path d="M85 79c18-33 115-41 135-4" marker-end="url(#v4ref-arr)"/></g><circle cx="151" cy="78" r="60" fill="none" stroke="currentColor" stroke-dasharray="5 6"/>`,
  'zodiac':`<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="150" cy="77" r="22" fill="#f3ca65"/><ellipse cx="150" cy="77" rx="125" ry="50"/><path d="M25 77h250" stroke-dasharray="6 6"/></g><g fill="currentColor">${[35,65,95,125,175,205,235,265].map((x,i)=>`<circle cx="${x}" cy="${i%2?44:112}" r="4"/>`).join('')}</g>`,
  'sun-path':`<g fill="none" stroke="currentColor" stroke-width="3"><path d="M28 122h245"/><path d="M150 122V22" stroke-dasharray="5 5"/><path d="M38 120Q150 3 265 120"/><path d="M55 120Q150 38 247 120"/><path d="M83 120Q150 66 218 120"/></g>`,
  'milankovitch':`<g fill="none" stroke="currentColor" stroke-width="3"><ellipse cx="150" cy="77" rx="120" ry="50"/><circle cx="150" cy="77" r="17" fill="#f3ca65"/><path d="M58 43l30 70M242 43l-28 70"/><path d="M53 77h194" stroke-dasharray="5 6"/></g>`,
  'seismic-wave':`<g fill="none" stroke="currentColor" stroke-width="3"><path d="M22 84Q77 17 140 76T278 73"/><path d="M22 105Q87 55 147 102T278 96"/><path d="M25 126H280"/></g><circle cx="48" cy="84" r="8" fill="currentColor"/>`,
  'earth-layers':`<g fill="none" stroke="currentColor" stroke-width="3"><path d="M44 126A108 108 0 0 1 256 126"/><path d="M72 126A80 80 0 0 1 228 126"/><path d="M106 126A46 46 0 0 1 194 126"/><path d="M132 126A20 20 0 0 1 168 126"/></g>`,
  'triangulation':`<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="82" cy="55" r="52"/><circle cx="213" cy="59" r="62"/><circle cx="151" cy="117" r="59"/></g><g fill="currentColor"><circle cx="82" cy="55" r="5"/><circle cx="213" cy="59" r="5"/><circle cx="151" cy="117" r="5"/><circle cx="151" cy="73" r="8"/></g>`,
  'plate-tectonics':`<g fill="none" stroke="currentColor" stroke-width="3"><path d="M20 92h86l43-47l44 47h88"/><path d="M94 94l-34 30M205 94l38 30" marker-end="url(#v4ref-arr)"/><path d="M150 47V121" stroke-dasharray="6 5"/></g><path d="M122 97q28 19 55 0" fill="none" stroke="currentColor" stroke-width="3"/>`,
  'atmosphere':`<g fill="none" stroke="currentColor" stroke-width="3"><path d="M45 126Q150 45 255 126"/><path d="M62 112Q150 57 238 112"/><path d="M83 96Q150 69 217 96"/><path d="M109 82Q150 74 191 82"/></g><path d="M150 124V21" stroke="currentColor" stroke-width="2" stroke-dasharray="5 5"/>`,
  'humidity-curve':`<g fill="none" stroke="currentColor" stroke-width="3"><path d="M35 126H276M48 135V20"/><path d="M51 119C93 117 125 110 152 96s46-39 61-67s32-15 48-6"/><path d="M105 100h112M147 61v66" stroke-dasharray="5 5"/></g>`,
  'wind-system':`<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="85" cy="75" r="31"/><circle cx="220" cy="75" r="31"/><path d="M85 26c52 18 53 80 0 101M220 26c-52 18-53 80 0 101" marker-end="url(#v4ref-arr)"/><path d="M35 75h96M170 75h97"/></g>`,
  'typhoon-enso':`<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="72" cy="77" r="43"/><path d="M44 77c16-24 45-24 58 0s-6 41-29 36s-31-25-13-35" marker-end="url(#v4ref-arr)"/><path d="M136 105h139M136 105q57-65 139 0"/><path d="M190 108v-54M227 108v-78" marker-end="url(#v4ref-arr)"/></g>`,
  'ocean-profile':`<g fill="none" stroke="currentColor" stroke-width="3"><path d="M42 28v102H270"/><path d="M60 42C125 40 145 48 155 74s-4 40 95 44"/><path d="M58 66h200M58 100h200" stroke-dasharray="6 5"/></g>`,
  'climate-energy':`<g fill="none" stroke="currentColor" stroke-width="3"><circle cx="74" cy="48" r="20" fill="#f3ca65"/><path d="M92 54l58 34" marker-end="url(#v4ref-arr)"/><path d="M154 96q48-28 98 0"/><path d="M188 97v-47" marker-end="url(#v4ref-arr)"/><path d="M221 97v-31" marker-end="url(#v4ref-arr)"/></g>`,
  'ocean-motion':`<g fill="none" stroke="currentColor" stroke-width="3"><path d="M20 96Q55 56 90 96T160 96T230 96T290 96"/><path d="M31 128h236"/><path d="M63 128q0-48 42-48M238 128q0-48-42-48" marker-end="url(#v4ref-arr)"/></g><circle cx="150" cy="48" r="16" fill="none" stroke="currentColor"/>`
 };
 return start+common+(map[type]||map['geotime'])+end;
}

function v4RefAnswerFields(ch,item,mode){
 if(mode==='learn')return `<span class="v4ref-learn-answer">${item.fields.map(f=>v4RefEsc(f.answer)).join('／')}</span>`;
 return item.fields.map((f,fi)=>{
   const val=v4RefAnswerValue(ch,item,fi),ok=v4RefFieldOk(ch,item,fi);
   return `<span class="v4ref-input-wrap ${val?(ok?'is-ok':'is-wrong'):''}"><input class="v4ref-input" data-v4ref-input="1" data-v4ref-chapter="${ch.number}" data-v4ref-number="${item.number}" data-v4ref-field="${fi}" value="${v4RefEsc(val)}" autocomplete="off" aria-label="第${item.number}格"><i>${ok?'✓':val?'×':''}</i></span>`;
 }).join('<span class="v4ref-field-sep">／</span>');
}
function v4RefItemHtml(ch,item,mode){
 const ok=v4RefItemOk(ch,item),user=item.fields.map((_,fi)=>v4RefAnswerValue(ch,item,fi)).filter(Boolean).join('／');
 return `<div class="v4ref-blank-item ${ok?'is-complete':''}" data-v4ref-item="${item.number}" data-v4ref-page="${item.page}">
   <span class="v4ref-junction"></span><span class="v4ref-prompt">${v4RefEsc(item.prompt)}</span><b class="v4ref-number">(${item.number})</b>${v4RefAnswerFields(ch,item,mode)}
   ${mode==='review'?`<span class="v4ref-review-line ${ok?'good':user?'bad':''}">${ok?'✓ 正確':user?'你的答案：'+v4RefEsc(user)+' · 正解：'+v4RefEsc(item.fields.map(f=>f.answer).join('／')):'正解：'+v4RefEsc(item.fields.map(f=>f.answer).join('／'))}</span>`:''}
 </div>`;
}
function v4RefZoneApprovedAssets(ch,z){
 const byChapter={
  2:['earth-science-02__telescope','earth-science-02__star-sparkles'],
  3:['earth-science-03__planetesimal'],
  4:['earth-science-04__seismograph'],
  5:['earth-science-05__sun']
 };
 const ids=z===ch.zones[0]?byChapter[ch.number]||[]:[];
 return typeof mindmapApprovedAssetHtml==='function'?mindmapApprovedAssetHtml(ids,{className:'mindmap-asset-group v4ref-approved-assets',label:`${z.title}核准概念插圖`}):'';
}
function v4RefZoneHtml(ch,z,mode){
 const cols=z.items.length>22?3:z.items.length>11?2:1;
 const approvedAssets=v4RefZoneApprovedAssets(ch,z);
 return `<section class="v4ref-zone" data-v4ref-zone="${v4RefEsc(z.id)}" style="--zone:${z.color};left:${z.x}px;top:${z.y}px;width:${z.w}px;height:${z.h}px">
   <header class="v4ref-ribbon">${v4RefEsc(z.title)}</header>
   <div class="v4ref-zone-diagram ${approvedAssets?'has-approved-assets':''}">${v4RefMiniDiagram(z.diagram)}${approvedAssets}</div>
   <div class="v4ref-zone-items" style="--cols:${cols}">${z.items.map(i=>v4RefItemHtml(ch,i,mode)).join('')}</div>
 </section>`;
}
function v4RefGlobalConnections(ch){
 const zones=ch.zones,centers=zones.map(z=>({x:z.x+z.w/2,y:z.y+z.h/2,color:z.color}));
 let order=centers.map((_,i)=>i);
 if(ch.number===5)order=[0,2,1];
 const paths=[];
 for(let i=0;i<order.length-1;i++){
   const a=centers[order[i]],b=centers[order[i+1]],mx=(a.x+b.x)/2;
   paths.push(`<path d="M${a.x} ${a.y} C${mx} ${a.y},${mx} ${b.y},${b.x} ${b.y}" stroke="${a.color}"/>`);
 }
 return `<svg class="v4ref-global-lines" viewBox="0 0 ${V4REF_W} ${V4REF_H}" aria-hidden="true"><defs><marker id="v4ref-global-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#777"/></marker></defs>${paths.join('')}</svg>`;
}
function v4RefHeader(ch){
 return `<div class="v4ref-source-header"><svg viewBox="0 0 125 62" aria-hidden="true"><g fill="#89ae9a" stroke="#557c6c" stroke-width="2"><ellipse cx="49" cy="38" rx="36" ry="20"/><circle cx="83" cy="32" r="14"/><path d="M20 31q-11-5-15 2q8 5 15 3"/><path d="M31 54q0 7 9 7h8q2-5-2-8M60 54q0 7 10 7h8q1-5-4-8"/></g><circle cx="88" cy="27" r="2.5" fill="#263c35"/></svg><span class="v4ref-title-mini">脈絡<br>整合</span><b>${ch.number}</b><h3>${v4RefEsc(ch.title)}</h3></div>`;
}
function v4RefChapterNav(ch){
 return `<div class="v4ref-chapter-nav">${EARTH_REFERENCE_MAPS.map(x=>{const st=v4RefStats(x);return `<button class="${x.number===ch.number?'active':''}" data-v4ref-chapter="${x.number}"><b>${x.number}</b><span>${v4RefEsc(x.title)}</span><small>${st.done}/${x.blankCount}</small></button>`}).join('')}</div>`;
}
function v4RefModeBar(mode){
 return `<div class="v4ref-modebar"><div class="v4ref-source-switch"><button class="active" data-v4ref-source="reference">課本脈絡整合</button><button data-v4ref-source="curriculum">108 課綱圖</button></div><div class="v4ref-study-switch"><button class="${mode==='learn'?'active':''}" data-v4ref-mode="learn">學習</button><button class="${mode==='recall'?'active':''}" data-v4ref-mode="recall">回想</button><button class="${mode==='review'?'active':''}" data-v4ref-mode="review">檢查</button></div></div>`;
}
function v4RefCurriculumSwitch(){return `<div class="v4ref-modebar v4ref-modebar-generic"><div class="v4ref-source-switch"><button data-v4ref-source="reference">課本脈絡整合</button><button class="active" data-v4ref-source="curriculum">108 課綱圖</button></div></div>`}
function v4RefCanvas(ch,mode){
 return `<div class="v4ref-stage"><div class="v4ref-canvas" data-v4ref-canvas="1" style="width:${V4REF_W}px;height:${V4REF_H}px">
   <div class="v4ref-paper v4ref-paper-left"></div><div class="v4ref-paper v4ref-paper-right"></div><div class="v4ref-gutter"></div>
   ${v4RefHeader(ch)}<div class="v4ref-right-page-label">單元8　進階探究題</div>${v4RefGlobalConnections(ch)}
   ${ch.zones.map(z=>v4RefZoneHtml(ch,z,mode)).join('')}
   <div class="v4ref-page-footer left">${ch.pages[0]}</div><div class="v4ref-page-footer right">${ch.pages[1]}</div>
 </div></div>`;
}
function v4RefReferencePage(){
 const ch=v4RefCurrentChapter(),mode=v4RefStudyMode(),st=v4RefStats(ch),qa=v4RefValidateData();
 return `<div class="page-head v4ref-page-head"><div><div class="tw-badge">臺灣教科書脈絡整合</div><h2>心智圖學習 · 地球科學</h2><p>依頁 242–253 的六組跨頁脈絡重建。回想時只隱藏編號空格，周圍分支、圖表與上下文保持原位。</p></div><div class="v4-head-progress"><span>${st.done}/${st.total} 已回想</span><i><b style="width:${st.pct}%"></b></i></div></div>
   ${subjectTabs()}${v4RefModeBar(mode)}${v4RefChapterNav(ch)}
   <div class="v4ref-toolbar"><span>第 ${ch.pages[0]}–${ch.pages[1]} 頁 · ${ch.blankCount} 個編號空格</span><div><button data-v4ref-zoom="out" aria-label="縮小">−</button><button data-v4ref-zoom="fit">適合寬度</button><button data-v4ref-zoom="reset">100%</button><button data-v4ref-zoom="in" aria-label="放大">＋</button></div></div>
   <div class="v4ref-viewport" data-v4ref-viewport="1">${v4RefCanvas(ch,mode)}</div>
   <div class="v4ref-footnote"><span>資料完整度 QA：${qa.total}/${qa.expectedTotal}</span><span>手機可拖曳、雙指縮放；版面不會改排成直向卡片。</span></div>`;
}

mindmapPage=function(){
 const s=activeSubject();
 if(s.id!=='earth')return v4RefGenericMindmapPage();
 if(state.earthMindSource==='curriculum')return v4RefCurriculumSwitch()+v4RefGenericMindmapPage();
 return v4RefReferencePage();
};

function v4RefSetScale(view,scale,anchor){
 const stage=view.querySelector('.v4ref-stage'),canvas=view.querySelector('.v4ref-canvas');if(!stage||!canvas)return;
 const old=Number(view.dataset.scale||1),next=Math.max(.28,Math.min(1.6,scale));
 const ax=anchor?.x??view.clientWidth/2,ay=anchor?.y??view.clientHeight/2;
 const contentX=(view.scrollLeft+ax)/old,contentY=(view.scrollTop+ay)/old;
 view.dataset.scale=String(next);canvas.style.transform=`scale(${next})`;stage.style.width=`${V4REF_W*next}px`;stage.style.height=`${V4REF_H*next}px`;
 view.scrollLeft=Math.max(0,contentX*next-ax);view.scrollTop=Math.max(0,contentY*next-ay);
}
function v4RefFit(view){const s=Math.min(1,(view.clientWidth-14)/V4REF_W);v4RefSetScale(view,s,{x:0,y:0});view.scrollLeft=0;view.scrollTop=0}
function v4RefInitViewport(){
 const view=document.querySelector('[data-v4ref-viewport]');if(!view)return;
 requestAnimationFrame(()=>v4RefFit(view));
 let dragging=false,sx=0,sy=0,sl=0,st=0,touchStart=null;
 view.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.target.closest('input,button'))return;dragging=true;sx=e.clientX;sy=e.clientY;sl=view.scrollLeft;st=view.scrollTop;view.setPointerCapture?.(e.pointerId);view.classList.add('is-panning')});
 view.addEventListener('pointermove',e=>{if(!dragging)return;view.scrollLeft=sl-(e.clientX-sx);view.scrollTop=st-(e.clientY-sy)});
 const end=()=>{dragging=false;view.classList.remove('is-panning')};view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);
 view.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();const r=view.getBoundingClientRect(),anchor={x:e.clientX-r.left,y:e.clientY-r.top};v4RefSetScale(view,Number(view.dataset.scale||1)*(e.deltaY<0?1.08:.92),anchor)},{passive:false});
 view.addEventListener('touchstart',e=>{if(e.target.closest('input,button'))return;if(e.touches.length===1){touchStart={kind:'pan',x:e.touches[0].clientX,y:e.touches[0].clientY,sl:view.scrollLeft,st:view.scrollTop}}else if(e.touches.length===2){const a=e.touches[0],b=e.touches[1];touchStart={kind:'pinch',dist:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),scale:Number(view.dataset.scale||1),mx:(a.clientX+b.clientX)/2,my:(a.clientY+b.clientY)/2}}},{passive:true});
 view.addEventListener('touchmove',e=>{if(!touchStart||e.target.closest('input,button'))return;if(touchStart.kind==='pan'&&e.touches.length===1){e.preventDefault();view.scrollLeft=touchStart.sl-(e.touches[0].clientX-touchStart.x);view.scrollTop=touchStart.st-(e.touches[0].clientY-touchStart.y)}else if(touchStart.kind==='pinch'&&e.touches.length===2){e.preventDefault();const a=e.touches[0],b=e.touches[1],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),r=view.getBoundingClientRect();v4RefSetScale(view,touchStart.scale*(d/touchStart.dist),{x:touchStart.mx-r.left,y:touchStart.my-r.top})}},{passive:false});
 view.addEventListener('touchend',()=>{touchStart=null},{passive:true});
}
function v4RefStoreInput(el){
 const ch=EARTH_REFERENCE_MAPS.find(x=>x.number===Number(el.dataset.v4refChapter));if(!ch)return;const item=v4RefAllItems(ch).find(x=>x.number===Number(el.dataset.v4refNumber));if(!item)return;
 state.refEarthAnswers=state.refEarthAnswers||{};state.refEarthAnswers[v4RefFieldKey(ch,item,Number(el.dataset.v4refField))]=el.value.trim();save();
 const wrap=el.closest('.v4ref-input-wrap'),ok=v4RefFieldOk(ch,item,Number(el.dataset.v4refField));wrap?.classList.toggle('is-ok',ok);wrap?.classList.toggle('is-wrong',Boolean(el.value.trim())&&!ok);const i=wrap?.querySelector('i');if(i)i.textContent=ok?'✓':el.value.trim()?'×':'';
}
function v4RefFocusInput(el){const view=document.querySelector('[data-v4ref-viewport]');if(!view)return;const scale=Number(view.dataset.scale||1);if(scale<.62)v4RefSetScale(view,.72);setTimeout(()=>{const vr=view.getBoundingClientRect(),er=el.getBoundingClientRect();view.scrollLeft+=er.left+er.width/2-(vr.left+vr.width/2);view.scrollTop+=er.top+er.height/2-(vr.top+vr.height/2)},20)}

bind=function(){
 v4RefGenericBind();
 document.querySelectorAll('[data-v4ref-source]').forEach(el=>el.onclick=()=>{state.earthMindSource=el.dataset.v4refSource;save();render()});
 document.querySelectorAll('[data-v4ref-chapter]').forEach(el=>el.onclick=()=>{state.refEarthChapter=Number(el.dataset.v4refChapter);save();render()});
 document.querySelectorAll('[data-v4ref-mode]').forEach(el=>el.onclick=()=>{state.refEarthStudyMode=el.dataset.v4refMode;save();render()});
 document.querySelectorAll('[data-v4ref-input]').forEach(el=>{el.onchange=()=>v4RefStoreInput(el);el.oninput=()=>v4RefStoreInput(el);el.onfocus=()=>v4RefFocusInput(el)});
 const view=document.querySelector('[data-v4ref-viewport]');
 document.querySelectorAll('[data-v4ref-zoom]').forEach(el=>el.onclick=()=>{if(!view)return;const z=el.dataset.v4refZoom,s=Number(view.dataset.scale||1);if(z==='in')v4RefSetScale(view,s*1.18);if(z==='out')v4RefSetScale(view,s*.84);if(z==='fit')v4RefFit(view);if(z==='reset')v4RefSetScale(view,1)});
 v4RefInitViewport();
};

render();
