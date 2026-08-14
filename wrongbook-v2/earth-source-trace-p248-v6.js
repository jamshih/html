// IMG_1529: four independent printed teaching blocks; no cross-block semantic edges.
{
 const c=EARTH_SEMANTIC_MAPS.find(x=>x.number===4),n=id=>c.nodes.find(x=>x.id===id),f=id=>c.figures.find(x=>x.id===id);
 const show=(id,x,y,w,color)=>Object.assign(n(id),{renderInMap:true,x,y,w,h:34,kind:'source-header',color});
 show('seismic-terms',75,120,155,'#c96b56');show('seismic-waves',520,120,145,'#c96b56');show('crust-lithosphere',70,500,235,'#c88e47');show('deep-earth',70,880,195,'#5d9a65');
 Object.assign(f('p248-ray').sourceRect,{x:65,y:175,width:340,height:250});Object.assign(f('p248-seismogram').sourceRect,{x:480,y:170,width:350,height:250});
 Object.assign(f('p248-crustgraph').sourceRect,{x:70,y:570,width:285,height:220});Object.assign(f('p248-crustsection').sourceRect,{x:420,y:555,width:390,height:245});
 Object.assign(f('p248-deepgraph').sourceRect,{x:75,y:950,width:400,height:275});Object.assign(f('p248-layertable').sourceRect,{x:485,y:950,width:340,height:275});
}
