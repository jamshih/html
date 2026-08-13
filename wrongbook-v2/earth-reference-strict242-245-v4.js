// Strict source-fidelity correction for photographed pages 242–245.
// The photographs outrank earlier inferred counts/layout. No source bitmap ships in the app.

const v4StrictPrevCanvas = v4RefCanvas;
const V4STRICT_PAGE_W = 910;
const V4STRICT_PAGE_H = 1270;

function v4StrictF(answer, aliases=[]){ return {answer:String(answer), aliases}; }
function v4StrictCh2Item(number,page,prompt,answer,opts={}){
  const raw=Array.isArray(answer)?answer:[answer];
  return {
    id:`earth-ref-2-${number}`, number, page, prompt, parentNodeId:page===244?'source244':'source245',
    fields:raw.map(x=>typeof x==='object'&&x.answer?v4StrictF(x.answer,x.aliases||[]):v4StrictF(x)),
    width:opts.width||120, note:opts.note||'', sourceConfidence:'photo-verified'
  };
}

(function v4StrictPatchChapter2(){
  const ch=EARTH_REFERENCE_MAPS.find(x=>x.number===2); if(!ch) return;
  const rows=[
    [1,244,'行星與恆星的顏色亦受表面何者影響','表面成分'],
    [2,244,'恆星顏色主要受何者影響','溫度'],
    [3,244,'恆星顏色由高溫到低溫','藍、白、黃、橘、紅'],
    [4,244,'任何溫度高於絕對0度的物體都會放出','輻射'],
    [5,244,'恆星亮度受兩因素影響之一','光度'],
    [6,244,'恆星亮度受兩因素影響之二','距離'],
    [7,244,'同溫度下光度另受恆星何者影響','表面積'],
    [8,244,'觀測亮度與何者平方成反比','距離'],
    [9,244,'由地球實際觀測到的星等','視星等'],
    [10,244,'換算到固定距離比較的星等','絕對星等'],
    [11,244,'星等數值愈小，亮度愈','亮'],
    [12,244,'星等差1，亮度倍率約','2.512'],
    [13,244,'星等差5，亮度倍率約','100'],
    [14,244,'絕對星等定義距離約','32.6光年'],
    [15,244,'全天球88個天區，每個天區稱為','星座'],
    [16,244,'同一星座恆星通常依何者高低編成α、β、γ','亮度'],
    [17,244,'距離地球愈何者，看到的是愈久以前的影像','遠'],
    [18,244,'天體距離常用單位 AU','天文單位'],
    [19,244,'天體距離常用單位 ly','光年'],
    [20,244,'天體距離常用單位 pc','秒差距'],
    [21,244,'1 pc 約等於多少 ly','3.26'],
    [22,245,'恆星表面溫度愈高，最強輻射波長愈','短'],
    [23,245,'觀測較高溫天體適合較何種波長','短'],
    [24,245,'觀測較低溫天體適合較何種波長','長'],
    [25,245,'宇宙階級中星團、星雲之上的基本成員','恆星'],
    [26,245,'地球所繞行的恆星','太陽'],
    [27,245,'繞恆星運行且符合行星條件','行星'],
    [28,245,'繞日公轉但未清除軌道附近小天體','矮行星'],
    [29,245,'繞日公轉的小型天體統稱','太陽系小天體'],
    [30,245,'繞行星運行的天體','衛星'],
    [31,245,'類地行星主要組成',['岩石','金屬']],
    [32,245,'類木行星主要組成',['氣體','冰']],
    [33,245,'古柏帶與歐特雲是何者發源地','彗星'],
    [34,245,'古柏帶常見彗星週期','短'],
    [35,245,'歐特雲常見彗星週期','長'],
    [36,245,'彗核靠近日照後外圍形成','彗髮'],
    [37,245,'彗星受輻射壓形成、往後偏的尾','塵埃尾'],
    [38,245,'彗星受太陽風形成、正背對太陽的尾','離子尾'],
    [39,245,'宇宙階級常用的基本距離單位','光年'],
    [40,245,'太陽所在星系','銀河系'],
    [41,245,'銀河系外型分類','棒旋星系'],
    [42,245,'銀河盤面直徑約','10萬光年'],
    [43,245,'太陽位於銀河的','盤面'],
    [44,245,'太陽距中央核球約','2萬6千光年'],
    [45,245,'多個星系形成','星系群'],
    [46,245,'銀河系所在星系群','本星系群'],
    [47,245,'多個星系團／群形成','超星系團'],
    [48,245,'本星系群所在的大尺度結構','本超星系團'],
    [49,245,'最大的整體層級','宇宙'],
    [50,245,'遠方星系退行受何種宇宙現象影響','宇宙膨脹'],
    [51,245,'距離愈遠，遠離速度愈','快']
  ];
  const items=rows.map(r=>v4StrictCh2Item(r[0],r[1],r[2],r[3]));
  items.find(x=>x.number===26).fields[0].aliases=['日'];
  items.find(x=>x.number===41).fields[0].aliases=['棒旋'];
  items.find(x=>x.number===44).fields[0].aliases=['2.64萬光年','26000光年'];
  ch.blankCount=51;
  ch.zones=[
    {id:'source244',title:'望星空 · 頁244',color:'#7061a2',x:0,y:0,w:0,h:0,diagram:'source244',items:items.filter(x=>x.page===244)},
    {id:'source245',title:'望星空 · 頁245',color:'#4e78aa',x:0,y:0,w:0,h:0,diagram:'source245',items:items.filter(x=>x.page===245)}
  ];
  V4REF_REQUIRED_COUNTS[1]=51;
})();

v4RefValidateData=function(){
  const expectedCounts=[48,51,41,27,60,50];
  const chapters=EARTH_REFERENCE_MAPS.map((ch,i)=>{
    const items=v4RefAllItems(ch),numbers=items.map(x=>x.number).sort((a,b)=>a-b),expected=Array.from({length:expectedCounts[i]},(_,j)=>j+1);
    const missing=expected.filter(n=>!numbers.includes(n)),duplicates=numbers.filter((n,j)=>numbers.indexOf(n)!==j),extra=numbers.filter(n=>!expected.includes(n));
    return {chapter:ch.number,title:ch.title,expected:expectedCounts[i],actual:items.length,missing,duplicates:[...new Set(duplicates)],extra,ok:items.length===expectedCounts[i]&&!missing.length&&!duplicates.length&&!extra.length};
  });
  const total=EARTH_REFERENCE_MAPS.reduce((n,ch)=>n+v4RefAllItems(ch).length,0),expectedTotal=expectedCounts.reduce((a,b)=>a+b,0);
  const ch5=EARTH_REFERENCE_MAPS[4],order=ch5.sourceOrder||[];
  const ch5OrderOk=order.length===60&&order.slice(0,17).every((n,i)=>n===i+1)&&order.slice(17,47).every((n,i)=>n===i+18)&&order.slice(47).every((n,i)=>n===i+48);
  return {chapters,total,expectedTotal,ch5OrderOk,photoOverride:'Chapter 2 photograph visibly contains printed item (51)',ok:chapters.every(x=>x.ok)&&total===expectedTotal&&ch5OrderOk};
};
window.v4RefValidateData=v4RefValidateData;

function v4StrictItem(ch,n){return v4RefAllItems(ch).find(x=>x.number===n)}
function v4StrictField(ch,n,fi,mode,w=72,extra=''){
  const item=v4StrictItem(ch,n); if(!item||!item.fields[fi]) return '';
  const f=item.fields[fi],val=v4RefAnswerValue(ch,item,fi),ok=v4RefFieldOk(ch,item,fi);
  if(mode==='learn') return `<span class="v4strict-fill learn ${extra}" style="--fw:${w}px">${v4RefEsc(f.answer)}</span>`;
  return `<span class="v4strict-fill ${val?(ok?'is-ok':'is-wrong'):''} ${extra}" style="--fw:${w}px"><input data-v4ref-input="1" data-v4ref-chapter="${ch.number}" data-v4ref-number="${n}" data-v4ref-field="${fi}" value="${v4RefEsc(val)}" autocomplete="off" aria-label="第${n}格" style="width:${w}px"><i>${ok?'✓':val?'×':''}</i></span>`;
}
function v4StrictQ(ch,mode,n,x,y,w,html,cls=''){
  return `<div class="v4strict-q ${cls}" data-page="${v4StrictItem(ch,n)?.page||''}" data-section="${v4StrictItem(ch,n)?.parentNodeId||''}" data-question="${n}" style="left:${x}%;top:${y}%;width:${w}%">${html}</div>`;
}
function v4StrictN(n){return `<b class="v4strict-num">(${n})</b>`}
function v4StrictPage(page,inner,extra=''){
  const left=page%2===0?25:965;
  return `<section class="v4strict-page ${extra}" data-strict-page="${page}" style="left:${left}px;top:20px;width:${V4STRICT_PAGE_W}px;height:${V4STRICT_PAGE_H}px">${inner}<div class="v4strict-footer">${page}</div></section>`;
}
function v4StrictHeader(chNo,title){
  return `<div class="v4strict-header"><svg viewBox="0 0 116 64" aria-hidden="true"><g fill="#8fb2a0" stroke="#5e8675" stroke-width="2"><ellipse cx="45" cy="39" rx="35" ry="20"/><circle cx="80" cy="34" r="13"/><path d="M13 34Q0 29 4 38Q11 40 20 39"/><path d="M29 55v7h12l3-7M57 55v7h13l3-7"/></g><circle cx="85" cy="30" r="2.3" fill="#314a41"/></svg><span class="v4strict-mini">脈絡<br>整合</span><b>${chNo}</b><h3>${v4RefEsc(title)}</h3><i></i></div>`;
}
function v4StrictRibbon(text,color,x,y,w){return `<div class="v4strict-ribbon" style="--rc:${color};left:${x}%;top:${y}%;width:${w}%">${text}</div>`}

function v4Strict242(ch,mode){
  const f=(n,fi,w)=>v4StrictField(ch,n,fi,mode,w),q=[];
  q.push(v4StrictQ(ch,mode,1,12,35,24,`體積極 ${v4StrictN(1)}${f(1,0,58)}`));
  q.push(v4StrictQ(ch,mode,2,12,38.3,24,`壓力極 ${v4StrictN(2)}${f(2,0,58)}`));
  q.push(v4StrictQ(ch,mode,3,12,41.6,24,`密度極 ${v4StrictN(3)}${f(3,0,58)}`));
  q.push(v4StrictQ(ch,mode,4,27.2,36.2,25,`時間：${v4StrictN(4)}${f(4,0,115)}`));
  q.push(v4StrictQ(ch,mode,5,38.5,31.8,20,`溫度極 ${v4StrictN(5)}${f(5,0,55)}`));
  q.push(v4StrictQ(ch,mode,6,11.5,28.5,31,`宇宙開始 ${v4StrictN(6)}${f(6,0,76)}，溫度隨之 ${v4StrictN(7)}${f(7,0,72)}`));
  q.push(v4StrictQ(ch,mode,8,10.5,18.3,31,`<strong>證據一</strong> ${v4StrictN(8)}${f(8,0,90)} 定律<br>遙遠星系光譜有 ${f(8,1,66)} 現象<br>距離愈遠，遠離速度愈 ${f(8,2,55)}<br>公式：${f(8,3,110)}`,'v4strict-box'));
  q.push(v4StrictQ(ch,mode,9,55.5,18.8,29,`<strong>證據二</strong> ${v4StrictN(9)}${f(9,0,128)}<br>爆炸餘溫到現今約等於 ${f(9,1,70)}`,'v4strict-box'));
  q.push(v4StrictQ(ch,mode,10,62.5,34,27,`大爆炸後約 ${v4StrictN(10)}${f(10,0,66)} 億年<br>開始有 ${f(10,1,78)} 誕生`));
  q.push(v4StrictQ(ch,mode,11,11,53.6,56,`最初原始太陽星雲呈 ${v4StrictN(11)}${f(11,0,56)} 溫狀態，後因 ${f(11,1,76)} 作用，<br>塌縮成 ${f(11,2,120)}（扁形狀），雲氣中心溫度逐漸 ${f(11,3,70)}`));
  q.push(v4StrictQ(ch,mode,12,12,72.7,24,`太陽系形成時間：約 ${v4StrictN(12)}${f(12,0,96)}`));
  q.push(v4StrictQ(ch,mode,13,10.5,80.1,42,`${v4StrictN(13)} 當內部溫壓可以將氫 ${f(13,0,84)} 成氦，太陽誕生`));
  q.push(v4StrictQ(ch,mode,14,11,87.1,38,`${v4StrictN(14)} 愈靠近太陽，環境溫度愈 ${f(14,0,54)}，<br>岩石金屬可留在內側形成類 ${f(14,1,64)} 行星`));
  q.push(v4StrictQ(ch,mode,15,51.5,87.1,40,`${v4StrictN(15)} ${f(15,0,80)} 將密度小的氣體帶到<br>外側，形成類 ${f(15,1,65)} 行星`));
  q.push(v4StrictQ(ch,mode,16,47.8,65.4,19,`${v4StrictN(16)}<strong> 第一階段大氣</strong><div class="v4strict-atmo-grid">${f(16,0,60)}${f(16,1,60)}${f(16,2,60)}${f(16,3,60)}</div>`,'v4strict-cloud'));
  q.push(v4StrictQ(ch,mode,17,75.2,58.8,18,`${v4StrictN(17)}${f(17,0,60)} 溫狀態`));
  q.push(v4StrictQ(ch,mode,18,57.3,75,30,`${v4StrictN(18)}<strong> 3大主因</strong><ol><li>${f(18,0,165)}</li><li>${f(18,1,165)}</li><li>${f(18,2,165)}</li></ol>`));
  q.push(v4StrictQ(ch,mode,19,78.5,77.5,18,`${v4StrictN(19)} 密度較 ${f(19,0,44)} 的<br>${f(19,1,72)}（組成）下沉`));
  q.push(v4StrictQ(ch,mode,20,78.5,85,18,`${v4StrictN(20)} 密度較 ${f(20,0,44)} 的<br>${f(20,1,72)}（組成）上升`));
  const svg=`<svg class="v4strict-svg" viewBox="0 0 910 1270" aria-hidden="true"><defs><marker id="s242arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs><path class="purple" d="M490 344 C515 337 535 326 558 310" marker-end="url(#s242arr)"/><path class="purple" d="M360 434 C390 405 385 378 370 352" marker-end="url(#s242arr)"/><path class="spine dark" d="M330 465 H510"/><circle class="node" cx="510" cy="465" r="9"/><path class="spine blue" d="M510 465 H770"/><circle class="node" cx="770" cy="465" r="9"/><path class="spine green" d="M770 465 H910"/><path class="blue" d="M510 465 L610 365"/><path class="blue" d="M510 465 L350 620"/><path class="green" d="M770 465 L704 535"/><path class="green" d="M770 465 L865 545"/><path class="green" d="M704 535 L610 735"/><path class="green" d="M865 545 V690"/><path class="blue" d="M356 676 L274 783" marker-end="url(#s242arr)"/></svg>`;
  const diagrams=`<div class="v4strict-bigbang-burst">大爆炸</div><div class="v4strict-singularity">奇異點</div><svg class="v4strict-nebula" viewBox="0 0 330 150" aria-label="太陽星雲塌縮圓盤"><defs><radialGradient id="neb"><stop offset="0" stop-color="#ffd558"/><stop offset=".35" stop-color="#f39b45"/><stop offset="1" stop-color="#dcb56d" stop-opacity=".25"/></radialGradient><marker id="nebarr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#4f7fb9"/></marker></defs><ellipse cx="160" cy="75" rx="145" ry="54" fill="url(#neb)"/><ellipse cx="160" cy="75" rx="104" ry="34" fill="none" stroke="#e9b24b" stroke-width="3"/><circle cx="160" cy="75" r="20" fill="#ffd34e"/><path d="M45 72 C100 112 220 108 284 72" fill="none" stroke="#4f7fb9" stroke-width="10" marker-end="url(#nebarr)"/></svg><div class="v4strict-earth-hot"><span></span></div><svg class="v4strict-earth-wedge" viewBox="0 0 190 180" aria-label="地球分層"><path d="M15 15 A160 160 0 0 1 175 175 L15 175Z" fill="#bbb8b0"/><path d="M42 45 A120 120 0 0 1 155 158 L42 158Z" fill="#94928c"/><path d="M73 81 A72 72 0 0 1 133 143 L73 143Z" fill="#686865"/><circle cx="151" cy="51" r="17" fill="#fffdf5" stroke="#777"/><text x="151" y="57" text-anchor="middle">殼</text><circle cx="151" cy="108" r="17" fill="#fffdf5" stroke="#777"/><text x="151" y="114" text-anchor="middle">函</text><circle cx="128" cy="150" r="17" fill="#fffdf5" stroke="#777"/><text x="128" y="156" text-anchor="middle">核</text></svg>`;
  return v4StrictPage(242,`${v4StrictHeader(1,'時間之箭')}${v4StrictRibbon('大霹靂學說','#8170a6',34,14.2,25)}${svg}${q.join('')}${diagrams}${v4StrictRibbon('太陽系的形成','#667fae',20,93,30)}`,'v4strict-242');
}

function v4Strict243(ch,mode){
  const f=(n,fi,w)=>v4StrictField(ch,n,fi,mode,w),q=[];
  q.push(v4StrictQ(ch,mode,33,18,9,28,`利用 ${v4StrictN(33)}${f(33,0,118)} 得知岩體形成時間`));
  q.push(v4StrictQ(ch,mode,34,18,14,28,`主要為 ${v4StrictN(34)}${f(34,0,86)} 岩類`));
  q.push(v4StrictQ(ch,mode,35,38,20.2,48,`半衰期定義：${v4StrictN(35)}${f(35,0,300)}`));
  q.push(v4StrictQ(ch,mode,36,66,7.5,22,`${v4StrictN(36)}${f(36,0,65)} 元素`));
  q.push(v4StrictQ(ch,mode,37,66,11.4,22,`${v4StrictN(37)}${f(37,0,65)} 元素`));
  q.push(v4StrictQ(ch,mode,38,57.5,4.5,28,`${v4StrictN(38)}${f(38,0,72)} %`));
  q.push(v4StrictQ(ch,mode,39,80.5,15.8,14,`${v4StrictN(39)}${f(39,0,62)} 個半衰期`));
  q.push(v4StrictQ(ch,mode,40,38,27,25,`${v4StrictN(40)} 疊置定律：${f(40,0,110)}`));
  q.push(v4StrictQ(ch,mode,41,38,31.6,27,`${v4StrictN(41)} 截切定律：${f(41,0,100)}`));
  q.push(v4StrictQ(ch,mode,42,38,36,27,`${v4StrictN(42)} 包裹體定律：${f(42,0,100)}`));
  q.push(v4StrictQ(ch,mode,43,8,29.5,25,`不同地區地層比對年代的化石稱為 ${v4StrictN(43)}${f(43,0,110)}`,'v4strict-box'));
  q.push(v4StrictQ(ch,mode,44,28.5,46.2,14,`${v4StrictN(44)}${f(44,0,74)}`));
  q.push(v4StrictQ(ch,mode,45,47.5,46.2,14,`${v4StrictN(45)}${f(45,0,74)}`));
  q.push(v4StrictQ(ch,mode,46,68.5,46.2,15,`${v4StrictN(46)}${f(46,0,88)}`));
  q.push(v4StrictQ(ch,mode,47,13.5,42.2,18,`${v4StrictN(47)}${f(47,0,100)}`));
  q.push(v4StrictQ(ch,mode,48,31,42,18,`${v4StrictN(48)}${f(48,0,110)}${f(48,1,110)}`));
  q.push(v4StrictQ(ch,mode,21,10,65,19,`第二階段大氣<br>主要：${v4StrictN(21)}${f(21,0,70)}`,'v4strict-cloud small'));
  q.push(v4StrictQ(ch,mode,22,10,69.2,19,`${v4StrictN(22)}${f(22,0,70)}`,'v4strict-cloud small'));
  q.push(v4StrictQ(ch,mode,23,10,73.4,19,`極少：${v4StrictN(23)}${f(23,0,70)}`,'v4strict-cloud small'));
  q.push(v4StrictQ(ch,mode,24,26,63.8,22,`冷卻凝結　時間：約 ${v4StrictN(24)}${f(24,0,90)} 年前`));
  q.push(v4StrictQ(ch,mode,25,42,76.7,28,`海洋形成　證據：古老的 ${v4StrictN(25)}${f(25,0,92)}`));
  q.push(v4StrictQ(ch,mode,26,34.5,82,22,`${v4StrictN(26)}${f(26,0,90)} 等生物行光合作用`));
  q.push(v4StrictQ(ch,mode,27,44,86.5,16,`化石：${v4StrictN(27)}${f(27,0,80)}`));
  q.push(v4StrictQ(ch,mode,28,63,82.8,13,`放出 ${v4StrictN(28)}${f(28,0,55)}`));
  q.push(v4StrictQ(ch,mode,29,75,81.3,20,`淺海環境形成 ${v4StrictN(29)}${f(29,0,105)}`,'v4strict-oval'));
  q.push(v4StrictQ(ch,mode,30,24,60,13,`${v4StrictN(30)}${f(30,0,62)}`,'v4strict-oval'));
  q.push(v4StrictQ(ch,mode,31,76,63,18,`時間：約 ${v4StrictN(31)}${f(31,0,70)} 年前<br>生物上陸`));
  q.push(v4StrictQ(ch,mode,32,21,94,25,`第三階段大氣（現今）<br>${v4StrictN(32)}${f(32,0,58)}：占約78%<br>${f(32,1,58)}：占約21%`,'v4strict-cloud current'));
  const svg=`<svg class="v4strict-svg" viewBox="0 0 910 1270" aria-hidden="true"><defs><marker id="s243arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs><path class="orange" d="M150 110 V380"/><path class="orange" d="M205 148 L330 320"/><path class="spine green" d="M0 618 H120"/><circle class="node" cx="120" cy="618" r="9"/><path class="spine mustard" d="M120 618 H480"/><circle class="node" cx="480" cy="618" r="9"/><path class="spine pink" d="M480 618 H640"/><circle class="node" cx="640" cy="618" r="9"/><path class="spine slate" d="M640 618 H760"/><circle class="node" cx="760" cy="618" r="9"/><path class="spine arrow" d="M760 618 H895" marker-end="url(#s243arr)"/><path class="mustard" d="M365 524 C355 560 290 582 212 606"/><path class="mustard" d="M720 556 C675 505 590 468 500 453"/><path class="green" d="M120 618 L255 756 V895"/><path class="green" d="M255 895 H390 V982"/><path class="green" d="M390 982 H642"/><path class="green" d="M642 982 V1095 L300 1190"/><path class="green" d="M535 900 L690 900" marker-end="url(#s243arr)"/></svg>`;
  const diagrams=`<div class="v4strict-geology-title">絕對地質年代與相對地質年代</div><svg class="v4strict-decay" viewBox="0 0 330 210" aria-label="放射性衰變半衰期圖"><path d="M28 176H312M28 176V22" stroke="#555" stroke-width="2" fill="none"/><path d="M28 36 C80 70 112 105 150 130 S240 164 300 170" stroke="#806f9f" stroke-width="4" fill="none"/><path d="M28 176 C92 145 132 115 170 91 S250 56 302 42" stroke="#d08c48" stroke-width="3" stroke-dasharray="7 5" fill="none"/><path d="M80 176V152M135 176V135M190 176V118M245 176V102" stroke="#777"/><text x="28" y="16">元素百分比</text><text x="210" y="202">經過時間</text></svg><svg class="v4strict-strata" viewBox="0 0 260 155" aria-label="相對年代地層示意"><path d="M15 25H245V140H15Z" fill="#e3d9a4" stroke="#777"/><path d="M15 70 Q90 52 150 70 T245 60 V105 H15Z" fill="#b76455" opacity=".8"/><path d="M15 105 H245 V140 H15Z" fill="#b98b66"/><path d="M178 18 L140 143" stroke="#72615c" stroke-width="9"/><circle cx="95" cy="84" r="6" fill="#fff"/><circle cx="205" cy="82" r="5" fill="#fff"/></svg><svg class="v4strict-fossils" viewBox="0 0 310 95" aria-label="代表化石時間線"><path d="M15 72H295" stroke="#647fa4" stroke-width="3"/><path d="M55 58V82M120 58V82M190 58V82M250 58V82" stroke="#647fa4" stroke-width="2"/><path d="M39 36q16-22 32 0q-16 15-32 0Z" fill="#88745b"/><path d="M107 37q14-20 28 0q-14 12-28 0Z" fill="#7b6c58"/><circle cx="190" cy="32" r="16" fill="#917763"/><path d="M236 42q14-28 28 0Z" fill="#776858"/></svg>`;
  return v4StrictPage(243,`${svg}${q.join('')}${diagrams}${v4StrictRibbon('地球環境的演變','#6c9b5e',63,94,28)}`,'v4strict-243');
}

function v4Strict244(ch,mode){
  const f=(n,fi,w)=>v4StrictField(ch,n,fi,mode,w),q=[];
  q.push(v4StrictQ(ch,mode,1,10.5,27,29,`顏色受 ${v4StrictN(1)}${f(1,0,105)} 影響`,'v4strict-box'));
  q.push(v4StrictQ(ch,mode,2,38,23.5,28,`顏色受 ${v4StrictN(2)}${f(2,0,76)} 影響`,'v4strict-box'));
  q.push(v4StrictQ(ch,mode,3,11,16.7,54,`恆星顏色 ${v4StrictN(3)}${f(3,0,255)}`,'v4strict-box'));
  q.push(v4StrictQ(ch,mode,4,68,19.4,27,`任何溫度高於絕對0度的物體都會放出 ${v4StrictN(4)}${f(4,0,86)}<br>→ 有其受溫度掌控的熱輻射曲線`));
  q.push(v4StrictQ(ch,mode,5,42,38,18,`受兩因素影響<br>${v4StrictN(5)}${f(5,0,68)} 度`));
  q.push(v4StrictQ(ch,mode,6,57,38.4,21,`${v4StrictN(6)}${f(6,0,70)}　亮度與 ${v4StrictN(8)}${f(8,0,74)}² 成反比`));
  q.push(v4StrictQ(ch,mode,7,52,32.5,17,`${v4StrictN(7)}${f(7,0,84)}`));
  q.push(v4StrictQ(ch,mode,9,57,43.4,15,`${v4StrictN(9)}${f(9,0,70)} 星等`,'v4strict-oval'));
  q.push(v4StrictQ(ch,mode,10,57,34.2,17,`${v4StrictN(10)}${f(10,0,82)} 星等`,'v4strict-oval'));
  q.push(v4StrictQ(ch,mode,11,74,44,22,`星等數值愈小，亮度愈 ${v4StrictN(11)}${f(11,0,55)}`));
  q.push(v4StrictQ(ch,mode,12,74,48.4,22,`星等數值差1，亮度倍率差 ${v4StrictN(12)}${f(12,0,66)} 倍`));
  q.push(v4StrictQ(ch,mode,13,74,52.4,22,`星等數值差5，亮度倍率差 ${v4StrictN(13)}${f(13,0,66)} 倍`));
  q.push(v4StrictQ(ch,mode,14,72,36.4,24,`依據恆星換算至距離地球 ${v4StrictN(14)}${f(14,0,92)} 處之亮度所劃分`));
  q.push(v4StrictQ(ch,mode,15,54,57,26,`全天球劃分為88個天區<br>每個天區稱為 ${v4StrictN(15)}${f(15,0,70)}`));
  q.push(v4StrictQ(ch,mode,16,74,57.3,23,`同一星座內恆星依據 ${v4StrictN(16)}${f(16,0,72)} 高低編號為 α、β、γ…`));
  q.push(v4StrictQ(ch,mode,17,51,72.3,45,`距離地球愈 ${v4StrictN(17)}${f(17,0,65)}，在地球上見到的是該天體愈久遠以前的影像`));
  q.push(v4StrictQ(ch,mode,18,50.5,79.5,32,`${v4StrictN(18)}${f(18,0,100)}（AU）`));
  q.push(v4StrictQ(ch,mode,19,50.5,85,32,`${v4StrictN(19)}${f(19,0,100)}（ly）`));
  q.push(v4StrictQ(ch,mode,20,50.5,90.5,32,`${v4StrictN(20)}${f(20,0,100)}（pc）`));
  q.push(v4StrictQ(ch,mode,21,73,89,20,`1 pc ≈ ${v4StrictN(21)}${f(21,0,68)} ly`));
  const svg=`<svg class="v4strict-svg" viewBox="0 0 910 1270" aria-hidden="true"><defs><marker id="s244arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs><path class="purple" d="M350 300 L300 380"/><path class="purple" d="M350 300 L470 300"/><path class="purple" d="M330 420 L275 500 L220 450"/><path class="orange" d="M485 300 V470"/><path class="orange" d="M485 470 L610 410"/><path class="orange" d="M485 470 L640 515"/><path class="orange" d="M485 470 L690 575"/><path class="purple" d="M230 455 V690" marker-end="url(#s244arr)"/><path class="blue" d="M570 660 L705 660" marker-end="url(#s244arr)"/><path class="red" d="M485 745 V1115"/><circle class="node" cx="485" cy="825" r="8"/><circle class="node" cx="485" cy="895" r="8"/><circle class="node" cx="485" cy="965" r="8"/></svg>`;
  const diagrams=`<div class="v4strict-starcolor"><span>高溫</span><i></i><b>太陽</b><em>低溫</em></div><div class="v4strict-starbox">星色</div><div class="v4strict-brightbox">亮度</div><svg class="v4strict-celestial" viewBox="0 0 300 240" aria-label="天球與黃道"><ellipse cx="150" cy="116" rx="112" ry="88" fill="#bbc7df" opacity=".45"/><ellipse cx="150" cy="116" rx="123" ry="27" fill="none" stroke="#d39842" stroke-width="4" transform="rotate(-12 150 116)"/><path d="M150 32V204" stroke="#596ea1" stroke-width="3" stroke-dasharray="6 6"/><circle cx="150" cy="116" r="8" fill="#586fa0"/><path d="M105 112q45-28 90 0" fill="none" stroke="#4a4e56" stroke-width="4"/></svg><svg class="v4strict-parallax" viewBox="0 0 260 120" aria-label="秒差距視差三角"><path d="M18 80 L225 34 L225 80Z" fill="#c3d9e4" stroke="#607d96" stroke-width="2"/><path d="M165 80 A42 42 0 0 0 158 59" fill="none" stroke="#777"/><text x="13" y="100">1AU</text><text x="175" y="55">1″</text></svg>`;
  return v4StrictPage(244,`${v4StrictHeader(2,'望星空')}${svg}${q.join('')}${diagrams}`,'v4strict-244');
}

function v4Strict245(ch,mode){
  const f=(n,fi,w)=>v4StrictField(ch,n,fi,mode,w),q=[];
  q.push(v4StrictQ(ch,mode,22,6,7.5,48,`星體表面溫度（T）愈高 → 所發出的電磁波強度最高值的波長（λ）愈 ${v4StrictN(22)}${f(22,0,58)}`));
  q.push(v4StrictQ(ch,mode,23,34,19,31,`觀測較高溫的天體，適合用波長較 ${v4StrictN(23)}${f(23,0,58)} 的波段`));
  q.push(v4StrictQ(ch,mode,24,67,19,28,`觀測較低溫的天體或現象，則適合用波長較 ${v4StrictN(24)}${f(24,0,58)} 的波段`));
  q.push(v4StrictQ(ch,mode,25,32,50.5,17,`${v4StrictN(25)}${f(25,0,74)}`));
  q.push(v4StrictQ(ch,mode,26,32,61.5,17,`${v4StrictN(26)}${f(26,0,74)}`));
  q.push(v4StrictQ(ch,mode,27,14,58.2,18,`${v4StrictN(27)}${f(27,0,74)}`));
  q.push(v4StrictQ(ch,mode,28,22,78.5,26,`${v4StrictN(28)}${f(28,0,92)}`));
  q.push(v4StrictQ(ch,mode,29,22,83,28,`${v4StrictN(29)}${f(29,0,120)}`));
  q.push(v4StrictQ(ch,mode,30,1.5,66.5,18,`${v4StrictN(30)}${f(30,0,72)}`));
  q.push(v4StrictQ(ch,mode,31,48,69.5,27,`主要組成：${v4StrictN(31)}${f(31,0,65)}、${f(31,1,65)}　氣體`));
  q.push(v4StrictQ(ch,mode,32,72,69.5,23,`${v4StrictN(32)}${f(32,0,60)}、${f(32,1,60)}`));
  q.push(v4StrictQ(ch,mode,33,72,88.7,20,`${v4StrictN(33)}${f(33,0,72)} 發源地`));
  q.push(v4StrictQ(ch,mode,34,61,86.1,17,`${v4StrictN(34)}${f(34,0,58)} 週期`));
  q.push(v4StrictQ(ch,mode,35,84,86.1,14,`${v4StrictN(35)}${f(35,0,58)} 週期`));
  q.push(v4StrictQ(ch,mode,36,28,91.4,21,`彗核與 ${v4StrictN(36)}${f(36,0,70)}`));
  q.push(v4StrictQ(ch,mode,37,42,96,21,`${v4StrictN(37)}${f(37,0,70)} 尾：往後偏`));
  q.push(v4StrictQ(ch,mode,38,63,95.4,23,`${v4StrictN(38)}${f(38,0,70)} 尾：正背對太陽`));
  q.push(v4StrictQ(ch,mode,39,51,48.5,21,`宇宙基本單位 ${v4StrictN(39)}${f(39,0,74)}`));
  q.push(v4StrictQ(ch,mode,40,57,55.5,21,`${v4StrictN(40)}${f(40,0,90)}`));
  q.push(v4StrictQ(ch,mode,41,70,60,25,`外型分類屬於 ${v4StrictN(41)}${f(41,0,95)} 星系`));
  q.push(v4StrictQ(ch,mode,42,70,64.2,26,`銀河盤面直徑約 ${v4StrictN(42)}${f(42,0,95)}`));
  q.push(v4StrictQ(ch,mode,43,70,68.5,26,`位於銀河 ${v4StrictN(43)}${f(43,0,80)}`));
  q.push(v4StrictQ(ch,mode,44,70,72.7,27,`距離中央核球約 ${v4StrictN(44)}${f(44,0,105)}`));
  q.push(v4StrictQ(ch,mode,45,62.5,51.7,20,`${v4StrictN(45)}${f(45,0,90)}`));
  q.push(v4StrictQ(ch,mode,46,64.5,57.2,20,`${v4StrictN(46)}${f(46,0,95)}`));
  q.push(v4StrictQ(ch,mode,47,73.5,44,22,`${v4StrictN(47)}${f(47,0,100)}`));
  q.push(v4StrictQ(ch,mode,48,82,52.5,17,`${v4StrictN(48)}${f(48,0,95)}`));
  q.push(v4StrictQ(ch,mode,49,83.5,38.5,15,`${v4StrictN(49)}${f(49,0,80)}`));
  q.push(v4StrictQ(ch,mode,50,74,30,21,`受 ${v4StrictN(50)}${f(50,0,110)} 影響`));
  q.push(v4StrictQ(ch,mode,51,59,34.5,35,`從地球可觀察到本星系群外天體，距離愈遠，遠離速度愈 ${v4StrictN(51)}${f(51,0,58)}`));
  const svg=`<svg class="v4strict-svg" viewBox="0 0 910 1270" aria-hidden="true"><defs><marker id="s245arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs><path class="green" d="M425 150 V330" marker-end="url(#s245arr)"/><path class="green" d="M705 150 V330" marker-end="url(#s245arr)"/><path class="green" d="M530 225 H650" marker-start="url(#s245arr)" marker-end="url(#s245arr)"/><path class="green" d="M730 360 V430"/><path class="stair" d="M75 760 L210 695 L355 620 L500 545 L650 470 L790 395"/><path class="red" d="M120 620 L260 565" marker-end="url(#s245arr)"/><path class="blue" d="M330 690 L465 690"/><path class="blue" d="M310 860 L180 925"/><path class="blue" d="M495 665 V820"/><path class="blue-dash" d="M455 1010 L430 840"/></svg>`;
  const stairs=[[55,63,190],[22,57,210],[35,52,220],[51,47,230],[65,42,240],[79,36,260]].map(([x,y,w])=>`<div class="v4strict-step" style="left:${x}%;top:${y}%;width:${w}px"><i></i></div>`).join('');
  const diagrams=`<svg class="v4strict-blackbody" viewBox="0 0 340 260" aria-label="黑體輻射曲線"><path d="M35 225H325M35 225V22" stroke="#555" stroke-width="2"/><rect x="44" y="34" width="31" height="185" fill="url(#spectrum245)" opacity=".8"/><defs><linearGradient id="spectrum245"><stop stop-color="#6c49a0"/><stop offset=".22" stop-color="#365bb4"/><stop offset=".45" stop-color="#33a9c9"/><stop offset=".63" stop-color="#6fbd66"/><stop offset=".8" stop-color="#f0c447"/><stop offset="1" stop-color="#d75a42"/></linearGradient></defs><path d="M39 222 C58 42 76 33 96 85 S145 185 310 205" fill="none" stroke="#3d4e87" stroke-width="4"/><path d="M39 223 C69 100 87 84 110 128 S180 199 310 214" fill="none" stroke="#d0a449" stroke-width="3"/><path d="M39 224 C87 158 118 151 150 180 S235 214 310 220" fill="none" stroke="#b54848" stroke-width="3"/><text x="6" y="18">輻射強度</text><text x="230" y="250">波長(nm)</text></svg><div class="v4strict-telescope xray">日冕：X 射線望遠鏡</div><div class="v4strict-telescope ir">紅外線望遠鏡：星雲、行星、低溫恆星</div><div class="v4strict-telescope micro">微波望遠鏡：宇宙背景輻射</div><div class="v4strict-universe-title">宇宙階級</div>${stairs}<div class="v4strict-galaxy-icon">◉</div><svg class="v4strict-solar-chart" viewBox="0 0 430 230" aria-label="太陽系組成與行星距離"><rect x="5" y="5" width="420" height="220" rx="3" fill="#393936"/><path d="M24 165H405" stroke="#eee"/><g fill="#ddd" font-size="12"><text x="20" y="195">0.4</text><text x="58" y="195">0.7</text><text x="98" y="195">1</text><text x="135" y="195">1.5</text><text x="190" y="195">5.2</text><text x="236" y="195">10</text><text x="285" y="195">19</text><text x="330" y="195">30</text></g><g><circle cx="22" cy="165" r="7" fill="#f7d741"/><circle cx="60" cy="165" r="4" fill="#aaa"/><circle cx="100" cy="165" r="6" fill="#78a8c8"/><circle cx="138" cy="165" r="5" fill="#b47863"/><circle cx="194" cy="165" r="13" fill="#b6895d"/><circle cx="239" cy="165" r="11" fill="#d2bd8e"/><circle cx="286" cy="165" r="8" fill="#9fc0c8"/><circle cx="332" cy="165" r="8" fill="#6888b0"/></g></svg><svg class="v4strict-comet" viewBox="0 0 180 120" aria-label="彗星尾"><rect x="58" y="35" width="60" height="50" fill="#485867"/><circle cx="88" cy="60" r="9" fill="#e9d28c"/><path d="M92 60L165 20" stroke="#74a9d3" stroke-width="6"/><path d="M92 60Q140 55 170 88" stroke="#d2b45e" stroke-width="6" fill="none"/></svg>`;
  return v4StrictPage(245,`${svg}${q.join('')}${diagrams}`,'v4strict-245');
}

v4RefCanvas=function(ch,mode){
  if(ch.number!==1&&ch.number!==2) return v4StrictPrevCanvas(ch,mode);
  const pages=ch.number===1?v4Strict242(ch,mode)+v4Strict243(ch,mode):v4Strict244(ch,mode)+v4Strict245(ch,mode);
  return `<div class="v4ref-stage"><div class="v4ref-canvas v4strict-spread" data-v4ref-canvas="1" style="width:${V4REF_W}px;height:${V4REF_H}px"><div class="v4ref-gutter"></div>${pages}</div></div>`;
};

function v4StrictQaPanel(){
  if(!new URLSearchParams(location.search).has('refqa')) return '';
  return `<div class="v4strict-qa-panel"><strong>Source overlay QA</strong><label>來源圖<input id="v4strictQaFile" type="file" accept="image/*"></label><button data-v4strict-qa="overlay">50% 疊圖</button><button data-v4strict-qa="side">並排</button><button data-v4strict-qa="off">關閉來源</button></div><img id="v4strictQaSource" class="v4strict-qa-source" alt="local source QA">`;
}
const v4StrictPrevReferencePage=v4RefReferencePage;
v4RefReferencePage=function(){return v4StrictPrevReferencePage()+v4StrictQaPanel()};
const v4StrictPrevBind=bind;
bind=function(){
  v4StrictPrevBind();
  const file=document.getElementById('v4strictQaFile'),img=document.getElementById('v4strictQaSource'),view=document.querySelector('[data-v4ref-viewport]');
  if(file&&img){file.onchange=()=>{const f=file.files?.[0];if(!f)return;img.src=URL.createObjectURL(f);img.onload=()=>img.classList.add('show')}}
  document.querySelectorAll('[data-v4strict-qa]').forEach(b=>b.onclick=()=>{if(!img||!view)return;document.body.dataset.v4strictQa=b.dataset.v4strictQa;img.classList.toggle('show',b.dataset.v4strictQa!=='off')});
};

render();
