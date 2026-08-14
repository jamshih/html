// Page 242 source trace. Coordinates are page-local and follow IMG_1523.
{
 const ch=EARTH_SEMANTIC_MAPS.find(x=>x.number===1);
 const node=id=>ch.nodes.find(n=>n.id===id),edge=id=>ch.relations.find(e=>e.id===id),fig=id=>ch.figures.find(f=>f.id===id);
 Object.assign(node('big-bang-theory'),{renderInMap:true,x:280,y:177,w:225,h:42,kind:'source-header',color:'#7666a8'});
 Object.assign(node('hubble-evidence'),{renderInMap:true,x:74,y:236,w:293,h:114,kind:'source-plain',color:'#7568a5'});
 Object.assign(node('cmb-evidence'),{renderInMap:true,x:476,y:236,w:258,h:112,kind:'source-plain',color:'#7568a5'});
 Object.assign(node('singularity'),{renderInMap:true,x:247,y:553,w:84,h:84,kind:'source-plain',color:'#565653'});
 Object.assign(node('solar-nebula'),{renderInMap:true,label:'太陽系的形成',x:178,y:1188,w:235,h:46,kind:'source-header',color:'#5f7fae'});
 const traces={
  'c1-e1':['M392 388 H448','#7666a8',6,true],
  'c1-e2':['M275 450 C262 430 250 412 250 392','#7666a8',6,true],
  'c1-e3':['M328 593 H473','#55534f',18,false],
  'c1-e4':['M473 593 H640','#657fae',18,false],
  'c1-e5':['M640 593 H794','#657fae',18,false],
  'c1-e6':['M794 593 H910','#67a16e',18,false],
  'c1-e7':['M487 583 L552 510','#657fae',7,false],
  'c1-e8':['M688 610 L262 674','#657fae',7,false],
  'c1-e9':['M793 604 L723 670','#67a16e',7,false],
  'c1-e11':['M607 892 L718 1037','#67a16e',7,false]
 };
 for(const [id,v] of Object.entries(traces)){const e=edge(id);Object.assign(e,{renderInMap:true,sourcePath:v[0],sourceColor:v[1],sourceWidth:v[2],sourceArrow:v[3],sourcePage:242})}
 const rects={
  'p242-bigbang':[214,438,100,66],
  'p242-guide':[65,405,115,98],
  'p242-nebula':[128,760,270,112],
  'p242-planets':[108,1015,345,105],
  'p242-atmosphere1':[420,790,210,92],
  'p242-hot-earth':[666,665,62,62],
  'p242-diff':[718,1028,190,155]
 };
 for(const [id,r] of Object.entries(rects)){const f=fig(id);Object.assign(f.sourceRect,{x:r[0],y:r[1],width:r[2],height:r[3]})}
}

// The strict photographed-page scaffold owns production p242. Patch only its local geometry;
// semantic relations above remain data and are not used for automatic production routing.
const v6P242StrictBase=window.v4Strict242;
function v6P242MoveQuestion(html,n,x,y,w){
 const re=new RegExp(`(data-question="${n}" style="left:)[^;]+(;top:)[^;]+(;width:)[^%]+(%)`);
 return html.replace(re,`$1${x}%$2${y}%$3${w}$4`);
}
const V6_P242_SOURCE_LINES=`<svg class="v4strict-svg v6-p242-lines" viewBox="0 0 910 1270" aria-hidden="true"><defs><marker id="v6p242arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs>
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
 const pos={1:[11.4,44.1,21],2:[11.4,46.7,21],3:[11.4,49.2,21],4:[25.4,41.6,24],5:[36.3,35.7,20],6:[9.0,29.7,34],8:[8.1,18.6,31],9:[52.3,18.6,26],10:[60.8,39.7,29],11:[10.6,55.4,58],12:[11.4,74.7,28],13:[10.2,78.9,43],14:[11.0,88.1,38],15:[49.0,87.9,41],16:[46.2,62.1,23],17:[74.0,58.3,20],18:[55.2,69.0,31],19:[77.0,72.7,21],20:[77.0,77.7,21]};
 for(const [n,p] of Object.entries(pos))html=v6P242MoveQuestion(html,n,p[0],p[1],p[2]);
 html=html.replace(/<svg class="v4strict-svg"[\s\S]*?<\/svg>/,V6_P242_SOURCE_LINES);
 html=html.replace('left:34%;top:14.2%;width:25%','left:30.8%;top:13.9%;width:22%');
 html=html.replace('left:20%;top:93%;width:30%','left:19.5%;top:93.7%;width:23%');
 html=html.replace('<div class="v4strict-footer">242</div>',`${V6_P242_EXTRA}<div class="v4strict-footer">242</div>`);
 return html;
};