// IMG_1528 source trace.
{
 const c=EARTH_SEMANTIC_MAPS.find(x=>x.number===3),n=id=>c.nodes.find(x=>x.id===id),e=id=>c.relations.find(x=>x.id===id),f=id=>c.figures.find(x=>x.id===id);
 Object.assign(n('sky-23n'),{renderInMap:true,label:'不同緯度天空',x:55,y:85,w:170,h:34,kind:'source-header',color:'#7164a4'});
 Object.assign(n('milankovitch'),{renderInMap:true,label:'地日關係變化／米蘭科維奇3循環',x:55,y:800,w:270,h:36,kind:'source-header',color:'#5d7fae'});
 Object.assign(e('c3-e8'),{renderInMap:true,sourcePath:'M165 830 H390',sourceColor:'#5d7fae',sourceWidth:3,sourceArrow:false});
 Object.assign(f('p247-dome').sourceRect,{x:55,y:150,width:390,height:335});
 Object.assign(f('p247-sunrise').sourceRect,{x:610,y:170,width:220,height:180});
 Object.assign(f('p247-south').sourceRect,{x:585,y:455,width:245,height:170});
 Object.assign(f('p247-orbit').sourceRect,{x:65,y:500,width:360,height:235});
 Object.assign(f('p247-milan').sourceRect,{x:55,y:840,width:500,height:310});
 Object.assign(f('p247-insolation').sourceRect,{x:520,y:880,width:310,height:260});
}
