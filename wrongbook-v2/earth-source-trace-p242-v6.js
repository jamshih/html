// Page 242 source trace. Coordinates are page-local and follow IMG_1523.
{
 const ch=EARTH_SEMANTIC_MAPS.find(x=>x.number===1);
 const node=id=>ch.nodes.find(n=>n.id===id),edge=id=>ch.relations.find(e=>e.id===id),fig=id=>ch.figures.find(f=>f.id===id);
 Object.assign(node('big-bang-theory'),{renderInMap:true,x:280,y:174,w:225,h:42,kind:'source-header',color:'#7666a8'});
 Object.assign(node('hubble-evidence'),{renderInMap:true,x:74,y:236,w:293,h:114,kind:'source-plain',color:'#7568a5'});
 Object.assign(node('cmb-evidence'),{renderInMap:true,x:476,y:236,w:258,h:112,kind:'source-plain',color:'#7568a5'});
 Object.assign(node('singularity'),{renderInMap:true,x:248,y:557,w:82,h:82,kind:'source-plain',color:'#565653'});
 Object.assign(node('solar-nebula'),{renderInMap:true,label:'太陽系的形成',x:178,y:1178,w:235,h:46,kind:'source-header',color:'#5f7fae'});
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
  'p242-hot-earth':[662,658,60,60],
  'p242-diff':[716,1016,190,166]
 };
 for(const [id,r] of Object.entries(rects)){const f=fig(id);Object.assign(f.sourceRect,{x:r[0],y:r[1],width:r[2],height:r[3]})}
}

// The strict photographed-page scaffold owns production p242. Patch only its local geometry;
// semantic relations above remain data and are not used for automatic production routing.
const v6P242StrictBase=window.v4Strict242;
function v6P242MoveQuestionPx(html,n,x,y,w){
 const re=new RegExp(`(data-question="${n}" style=")[^"]+("?)`);
 return html.replace(re,`$1left:${x}px;top:${y}px;width:${w}px$2`);
}
const V6_P242_SOURCE_LINES=`<svg class="v4strict-svg v6-p242-lines" viewBox="0 0 910 1270" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="v6p242arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs>
<path class="purple" d="M397 388H447" marker-end="url(#v6p242arr)"/>
<path class="purple" d="M276 449C263 430 252 411 251 391" marker-end="url(#v6p242arr)"/>
<path class="spine dark" d="M329 592H473"/><circle class="node" cx="473" cy="592" r="8"/>
<path class="spine blue" d="M473 592H794"/><circle class="node" cx="794" cy="592" r="8"/>
<path class="spine green" d="M794 592H910"/>
<path class="blue" d="M488 582L551 511"/>
<path class="blue" d="M690 610L264 674"/>
<path class="green" d="M793 604L724 669"/>
<path class="green" d="M693 721L622 788"/>
<path class="green" d="M621 850L456 927" marker-end="url(#v6p242arr)"/>
<path class="green" d="M606 892L719 1036"/>
<path class="green" d="M748 729V798" marker-end="url(#v6p242arr)"/>
<path class="green" d="M748 827V900" marker-end="url(#v6p242arr)"/>
<path class="blue" d="M268 851L139 932" marker-end="url(#v6p242arr)"/>
<path class="blue" d="M110 998V1024H140"/>
<path class="blue" d="M111 1096V1121H226"/>
<path class="blue" d="M452 1096V1121H402"/>
</svg>`;
const V6_P242_EXTRA=`
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
  14:[102,1114,345],15:[448,1114,370],16:[420,790,210],17:[676,742,180],18:[555,868,290],19:[704,920,190],20:[704,980,190]
 };
 for(const [n,p] of Object.entries(pos))html=v6P242MoveQuestionPx(html,n,p[0],p[1],p[2]);
 html=html.replace(/<svg class="v4strict-svg"[\s\S]*?<\/svg>/,V6_P242_SOURCE_LINES);
 html=html.replace(/style="--rc:#8170a6;left:[^"]+"/, 'style="--rc:#8170a6;left:280px;top:174px;width:198px"');
 html=html.replace(/style="--rc:#667fae;left:[^"]+"/, 'style="--rc:#667fae;left:178px;top:1178px;width:207px"');
 html=html.replace('<div class="v4strict-footer">242</div>',`${V6_P242_EXTRA}<div class="v4strict-footer">242</div>`);
 return html;
};