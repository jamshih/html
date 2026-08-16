// Page 242 source trace. Coordinates are page-local and follow IMG_1523.
{
 const ch=EARTH_SEMANTIC_MAPS.find(x=>x.number===1);
 const node=id=>ch.nodes.find(n=>n.id===id),edge=id=>ch.relations.find(e=>e.id===id),fig=id=>ch.figures.find(f=>f.id===id);
 Object.assign(node('big-bang-theory'),{renderInMap:true,x:307,y:160,w:212,h:42,kind:'source-header',color:'#7666a8'});
 Object.assign(node('hubble-evidence'),{renderInMap:true,x:112,y:218,w:275,h:114,kind:'source-plain',color:'#7568a5'});
 Object.assign(node('cmb-evidence'),{renderInMap:true,x:489,y:221,w:247,h:116,kind:'source-plain',color:'#7568a5'});
 Object.assign(node('singularity'),{renderInMap:true,x:270,y:544,w:82,h:82,kind:'source-plain',color:'#565653'});
 Object.assign(node('solar-nebula'),{renderInMap:true,label:'太陽系的形成',x:172,y:1177,w:238,h:46,kind:'source-header',color:'#5f7fae'});
 const traces={
  'c1-e1':['M397 380H447','#7666a8',6,true],
  'c1-e2':['M276 441C263 422 252 403 251 383','#7666a8',6,true],
  'c1-e3':['M329 584H481','#55534f',18,false],
  'c1-e4':['M481 584H640','#657fae',18,false],
  'c1-e5':['M640 584H815','#657fae',18,false],
  'c1-e6':['M815 584H960','#67a16e',18,false],
  'c1-e7':['M496 574L559 503','#657fae',7,false],
  'c1-e8':['M698 602L272 666','#657fae',7,false],
  'c1-e9':['M814 596L724 661','#67a16e',7,false],
  'c1-e11':['M606 884L719 1028','#67a16e',7,false]
 };
 for(const [id,v] of Object.entries(traces)){const e=edge(id);Object.assign(e,{renderInMap:true,sourcePath:v[0],sourceColor:v[1],sourceWidth:v[2],sourceArrow:v[3],sourcePage:242})}
 const rects={
  'p242-bigbang':[238,420,96,64],
  'p242-guide':[88,383,130,116],
  'p242-nebula':[127,744,275,110],
  'p242-planets':[97,996,345,106],
  'p242-atmosphere1':[410,766,215,125],
  'p242-hot-earth':[657,658,49,46],
  'p242-diff':[723,1016,166,166]
 };
 for(const [id,r] of Object.entries(rects)){const f=fig(id);Object.assign(f.sourceRect,{x:r[0],y:r[1],width:r[2],height:r[3]})}
}

const v6P242StrictBase=window.v4Strict242;
const V6_P242_POS_SCALE=1;
const v6P242Px=n=>Math.round(n*V6_P242_POS_SCALE*10)/10;
function v6P242MoveQuestionPx(html,n,x,y,w){
 const re=new RegExp(`(data-question="${n}" style=")[^"]+("?)`);
 return html.replace(re,`$1left:${v6P242Px(x)}px;top:${v6P242Px(y)}px;width:${v6P242Px(w)}px$2`);
}
const V6_P242_SOURCE_LINES=`<svg class="v4strict-svg v6-p242-lines" viewBox="0 0 910 1270" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="v6p242arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs>
<path class="purple" d="M397 380H447" marker-end="url(#v6p242arr)"/>
<path class="purple" d="M276 441C263 422 252 403 251 383" marker-end="url(#v6p242arr)"/>
<path class="spine dark" d="M329 584H481"/><circle class="node" cx="481" cy="584" r="8"/>
<path class="spine blue" d="M481 584H640"/><path class="spine blue" d="M640 584H815"/><circle class="node" cx="815" cy="584" r="8"/>
<path class="spine green" d="M815 584H960"/>
<path class="blue" d="M496 574L559 503"/>
<path class="blue" d="M698 602L272 666"/>
<path class="green" d="M814 596L724 661"/>
<path class="green" d="M693 713L622 780"/>
<path class="green" d="M621 842L456 919" marker-end="url(#v6p242arr)"/>
<path class="green" d="M606 884L719 1028"/>
<path class="green" d="M748 721V790" marker-end="url(#v6p242arr)"/>
<path class="green" d="M748 819V892" marker-end="url(#v6p242arr)"/>
<path class="blue" d="M268 843L139 924" marker-end="url(#v6p242arr)"/>
<path class="blue" d="M110 990V1016H140"/>
<path class="blue" d="M111 1088V1113H226"/>
<path class="blue" d="M452 1088V1113H402"/>
</svg>`;
const V6_P242_ASTRONAUT=`<svg class="v6-p242-astronaut" viewBox="0 0 150 125" preserveAspectRatio="xMidYMid meet" aria-label="太空人搭乘火箭導覽插圖"><g transform="translate(7 55) rotate(-12 70 30)"><path d="M10 37L112 13L130 28L104 47L22 55Z" fill="#eee9df" stroke="#575650" stroke-width="2.4"/><path d="M17 39L4 52L26 50M96 47L110 65L113 45" fill="#c95749" stroke="#575650" stroke-width="2.2"/><circle cx="91" cy="29" r="12" fill="#6f9ab7" stroke="#575650" stroke-width="2"/><path d="M9 51L0 61M18 55L7 69" stroke="#e28b39" stroke-width="5" stroke-linecap="round"/></g><g transform="translate(43 8)"><circle cx="30" cy="22" r="20" fill="#f0eee8" stroke="#4e4e4a" stroke-width="2.5"/><circle cx="30" cy="22" r="13" fill="#343a3d"/><path d="M17 20Q30 9 43 20" fill="#6f7f86"/><path d="M18 44L12 69L36 76L49 49Q41 39 30 39Q22 39 18 44Z" fill="#eee9df" stroke="#4e4e4a" stroke-width="2.5"/><path d="M16 50L1 66M45 51L57 68M17 68L9 83M34 75L42 88" stroke="#4e4e4a" stroke-width="5" stroke-linecap="round"/><rect x="22" y="49" width="16" height="13" rx="2" fill="#78a0b2" stroke="#4e4e4a" stroke-width="1.8"/></g></svg>`;
const V6_P242_EXTRA=`
${V6_P242_ASTRONAUT}
<div class="v6-p242-start-tag">從這裡出發</div>
<div class="v6-p242-dark-age">黑暗時期</div>
<div class="v6-p242-recombination">大爆炸後約38萬年，離子得以<br>結合成原子，大爆炸的餘溫<br>可以傳遞出去</div>
<div class="v6-p242-cooling">地球從高溫狀態<br>逐漸降溫</div>
<div class="v6-p242-nebula-title">太陽星雲學說</div>
<div class="v6-p242-melt">導致地球熔融</div>
<div class="v6-p242-escape">均逸散了</div>
<svg class="v6-p242-planets" viewBox="0 0 345 105" preserveAspectRatio="xMidYMid meet" aria-label="太陽與行星形成順序"><rect x="18" y="12" width="302" height="72" fill="#d9e6ea" stroke="#6f8290" stroke-width="1.5"/><rect x="19" y="13" width="17" height="70" fill="#f0b843"/><circle cx="142" cy="49" r="25" fill="#a88761" stroke="#6b5d50" stroke-width="1.5"/><path d="M124 42q18-9 35 0M122 50q20 8 39 0M126 58q17-7 31 0" fill="none" stroke="#6d5d50" stroke-width="2"/>
<g transform="translate(214 48) rotate(-17)"><circle r="19" fill="#b79a60" stroke="#6b5d50" stroke-width="1.5"/><ellipse rx="35" ry="7" fill="none" stroke="#8d7954" stroke-width="5"/></g>
<circle cx="268" cy="51" r="12" fill="#9aa9b0"/><circle cx="300" cy="51" r="10" fill="#8e9ca6"/><circle cx="325" cy="51" r="8" fill="#71879c"/></svg>
<div class="v6-p242-diff-label">形成地球分層結構</div>`;
window.v4Strict242=function(ch,mode){
 let html=v6P242StrictBase(ch,mode);
 const pos={
  1:[105,558,195],2:[105,590,195],3:[105,622,195],4:[230,526,225],5:[330,454,185],6:[82,377,330],
  8:[74,236,293],9:[476,236,258],10:[550,503,255],11:[95,706,520],12:[108,946,245],13:[95,1000,390],
  14:[102,1114,345],15:[448,1114,370],16:[420,790,210],17:[676,742,180],18:[455,868,290],19:[570,920,205],20:[570,980,205]
 };
 for(const [n,p] of Object.entries(pos))html=v6P242MoveQuestionPx(html,n,p[0],p[1],p[2]);
 html=html.replace(/<svg class="v4strict-svg"[\s\S]*?<\/svg>/,V6_P242_SOURCE_LINES);
 html=html.replace(/style="--rc:#8170a6;left:[^"]+"/,`style="--rc:#8170a6;left:${v6P242Px(307)}px;top:${v6P242Px(160)}px;width:${v6P242Px(212)}px"`);
 html=html.replace(/style="--rc:#667fae;left:[^"]+"/,`style="--rc:#667fae;left:${v6P242Px(172)}px;top:${v6P242Px(1177)}px;width:${v6P242Px(238)}px"`);
 html=html.replace('<div class="v4strict-footer">242</div>',`${V6_P242_EXTRA}<div class="v4strict-footer">242</div>`);
 return html;
};