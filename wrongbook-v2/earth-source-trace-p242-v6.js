// Page 242 source trace. Coordinates are page-local and follow IMG_1523.
{
 const ch=EARTH_SEMANTIC_MAPS.find(x=>x.number===1);
 const node=id=>ch.nodes.find(n=>n.id===id),edge=id=>ch.relations.find(e=>e.id===id),fig=id=>ch.figures.find(f=>f.id===id);
 Object.assign(node('big-bang-theory'),{renderInMap:true,x:280,y:174,w:225,h:42,kind:'source-header',color:'#7666a8'});
 Object.assign(node('hubble-evidence'),{renderInMap:true,x:74,y:236,w:293,h:114,kind:'source-plain',color:'#7568a5'});
 Object.assign(node('cmb-evidence'),{renderInMap:true,x:476,y:236,w:258,h:112,kind:'source-plain',color:'#7568a5'});
 Object.assign(node('singularity'),{renderInMap:true,x:248,y:557,w:82,h:82,kind:'source-plain',color:'#565653'});
 Object.assign(node('solar-nebula'),{renderInMap:true,label:'太陽系的形成',x:178,y:1195,w:235,h:46,kind:'source-header',color:'#5f7fae'});
 const traces={
  'c1-e1':['M397 388H447','#7666a8',6,true],
  'c1-e2':['M276 449C263 430 252 411 251 391','#7666a8',6,true],
  'c1-e3':['M329 592H473','#55534f',18,false],
  'c1-e4':['M473 592H640','#657fae',18,false],
  'c1-e5':['M640 592H794','#657fae',18,false],
  'c1-e6':['M794 592H910','#67a16e',18,false],
  'c1-e7':['M488 582L551 511','#657fae',7,false],
  'c1-e8':['M690 610L264 674','#657fae',7,false],
  'c1-e9':['M793 604L724 669','#67a16e',7,false],
  'c1-e11':['M606 892L719 1036','#67a16e',7,false]
 };
 for(const [id,v] of Object.entries(traces)){const e=edge(id);Object.assign(e,{renderInMap:true,sourcePath:v[0],sourceColor:v[1],sourceWidth:v[2],sourceArrow:v[3],sourcePage:242})}
 const rects={
  'p242-bigbang':[220,446,100,70],
  'p242-guide':[88,405,105,105],
  'p242-nebula':[132,750,275,110],
  'p242-planets':[108,1014,345,106],
  'p242-atmosphere1':[420,786,210,94],
  'p242-hot-earth':[668,666,49,46],
  'p242-diff':[560,1016,166,166]
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
<path class="purple" d="M484 438H531" marker-end="url(#v6p242arr)"/>
<path class="purple" d="M349 486C349 470 345 456 340 444" marker-end="url(#v6p242arr)"/>
<path class="spine dark" d="M410 648H548"/><circle class="node" cx="548" cy="648" r="8"/>
<path class="spine blue" d="M548 648H850"/><circle class="node" cx="850" cy="648" r="8"/>
<path class="spine green" d="M850 648H930"/>
<path class="blue" d="M558 638L620 573"/>
<path class="blue" d="M627 660L340 735"/>
<path class="green" d="M850 658L755 738"/>
<path class="green" d="M850 658L915 714"/>
<path class="green" d="M790 730L657 844" marker-end="url(#v6p242arr)"/>
<path class="green" d="M757 800V867" marker-end="url(#v6p242arr)"/>
<path class="green" d="M757 900V965" marker-end="url(#v6p242arr)"/>
<path class="green" d="M664 910L775 1095"/>
<path class="blue" d="M337 854L222 951" marker-end="url(#v6p242arr)"/>
<path class="blue" d="M186 1016V1051H222"/>
<path class="blue" d="M187 1110V1145H300"/>
<path class="blue" d="M500 1110V1145H458"/>
</svg>`
const V6_P242_EXTRA=`
<div class="v6-p242-nebula-title">太陽星雲學說</div>
<div class="v6-p242-melt">導致地球熔融</div>
<div class="v6-p242-escape">均逸散了</div>
<svg class="v6-p242-planets" viewBox="0 0 345 105" preserveAspectRatio="xMidYMid meet" aria-label="太陽與行星形成順序"><rect x="18" y="12" width="302" height="72" fill="#d9e6ea" stroke="#6f8290" stroke-width="1.5"/><rect x="19" y="13" width="17" height="70" fill="#f0b843"/><circle cx="142" cy="49" r="25" fill="#a88761" stroke="#6b5d50" stroke-width="1.5"/><path d="M124 42q18-9 35 0M122 50q20 8 39 0M126 58q17-7 31 0" fill="none" stroke="#6d5d50" stroke-width="2"/>
<g transform="translate(214 48) rotate(-17)"><circle r="19" fill="#b79a60" stroke="#6b5d50" stroke-width="1.5"/><ellipse rx="35" ry="7" fill="none" stroke="#8d7954" stroke-width="5"/></g>
<circle cx="268" cy="51" r="12" fill="#9aa9b0"/><circle cx="300" cy="51" r="10" fill="#8e9ca6"/><circle cx="325" cy="51" r="8" fill="#71879c"/></svg>
<div class="v6-p242-diff-label">形成地球分層結構</div>
<div class="v8-p242-cooling">地球從高溫狀態逐漸降溫</div>`;
window.v4Strict242=function(ch,mode){
 let html=v6P242StrictBase(ch,mode);
 const pos={
  // Page 242 source boxes measured against the 910×1270 atlas (IMG_1523).
  1:[188,568,160],2:[188,603,160],3:[188,638,160],4:[326,538,205],5:[402,486,170],6:[185,402,315],
  8:[184,220,274],9:[558,220,248],10:[628,528,215],11:[184,696,468],12:[184,928,248],13:[184,992,365],
  14:[184,1123,355],15:[548,1123,350],16:[505,802,202],17:[735,742,168],18:[556,922,284],19:[755,982,145],20:[755,1050,145]
 };
 for(const [n,p] of Object.entries(pos))html=v6P242MoveQuestionPx(html,n,p[0],p[1],p[2]);
 html=html.replace(/<svg class="v4strict-svg"[\s\S]*?<\/svg>/,V6_P242_SOURCE_LINES);
 html=html.replace(/style="--rc:#8170a6;left:[^"]+"/,`style="--rc:#8170a6;left:${v6P242Px(308)}px;top:${v6P242Px(160)}px;width:${v6P242Px(220)}px"`);
 html=html.replace(/style="--rc:#667fae;left:[^"]+"/,`style="--rc:#667fae;left:${v6P242Px(244)}px;top:${v6P242Px(1206)}px;width:${v6P242Px(220)}px"`);
 html=html.replace('<div class="v4strict-footer">242</div>',`${V6_P242_EXTRA}<div class="v4strict-footer">242</div>`);
 return html;
};