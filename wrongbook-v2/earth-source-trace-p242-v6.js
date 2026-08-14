// Page 242 source trace. Coordinates are page-local and follow IMG_1523.
{
 const ch=EARTH_SEMANTIC_MAPS.find(x=>x.number===1);
 const node=id=>ch.nodes.find(n=>n.id===id),edge=id=>ch.relations.find(e=>e.id===id),fig=id=>ch.figures.find(f=>f.id===id);
 Object.assign(node('big-bang-theory'),{renderInMap:true,x:345,y:102,w:205,h:38,kind:'source-header',color:'#7666a8'});
 Object.assign(node('hubble-evidence'),{renderInMap:true,x:78,y:150,w:230,h:48,kind:'source-ellipse',color:'#7568a5'});
 Object.assign(node('cmb-evidence'),{renderInMap:true,x:585,y:150,w:220,h:48,kind:'source-ellipse',color:'#7568a5'});
 Object.assign(node('singularity'),{renderInMap:true,x:106,y:455,w:95,h:30,kind:'source-plain',color:'#6d6d6d'});
 Object.assign(node('solar-nebula'),{renderInMap:true,label:'太陽系的形成',x:70,y:1160,w:170,h:34,kind:'source-header',color:'#5f7fae'});
 const traces={
  'c1-e1':['M445 140 V168 H192 V185','#7666a8',2.4,false],
  'c1-e2':['M445 140 V168 H695 V185','#7666a8',2.4,false],
  'c1-e3':['M150 480 H275','#5a5a57',7,true],
  'c1-e4':['M275 480 H430','#5a5a57',7,true],
  'c1-e5':['M430 480 H585','#5a5a57',7,true],
  'c1-e6':['M585 480 H775','#5a5a57',7,true],
  'c1-e7':['M160 650 H310','#d49a38',3.2,true],
  'c1-e8':['M310 650 H500','#d49a38',3.2,true],
  'c1-e9':['M500 650 H770','#d49a38',3.2,true],
  'c1-e11':['M535 905 C610 905 665 940 720 995','#d15f49',3,true]
 };
 for(const [id,v] of Object.entries(traces)){const e=edge(id);Object.assign(e,{renderInMap:true,sourcePath:v[0],sourceColor:v[1],sourceWidth:v[2],sourceArrow:v[3]})}
 const rects={
  'p242-bigbang':[225,250,225,145],
  'p242-guide':[34,340,108,92],
  'p242-nebula':[72,615,305,155],
  'p242-planets':[74,775,325,120],
  'p242-atmosphere1':[410,755,230,105],
  'p242-hot-earth':[660,735,170,105],
  'p242-diff':[650,950,210,190]
 };
 for(const [id,r] of Object.entries(rects)){const f=fig(id);Object.assign(f.sourceRect,{x:r[0],y:r[1],width:r[2],height:r[3]})}
}