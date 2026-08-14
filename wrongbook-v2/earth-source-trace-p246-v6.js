// IMG_1527 source trace.
{
 const c=EARTH_SEMANTIC_MAPS.find(x=>x.number===3),n=id=>c.nodes.find(x=>x.id===id),e=id=>c.relations.find(x=>x.id===id),f=id=>c.figures.find(x=>x.id===id);
 Object.assign(n('daily-motion'),{renderInMap:true,x:80,y:120,w:145,h:36,kind:'source-header',color:'#df972f'});
 Object.assign(n('earth-rotation'),{renderInMap:true,x:585,y:120,w:150,h:38,kind:'source-header',color:'#d47f35'});
 Object.assign(n('earth-revolution'),{renderInMap:true,x:575,y:615,w:165,h:38,kind:'source-header',color:'#5d7fae'});
 Object.assign(n('annual-motion'),{renderInMap:true,x:600,y:680,w:135,h:34,kind:'source-header',color:'#5e8088'});
 Object.assign(n('zodiac'),{renderInMap:true,x:75,y:735,w:225,h:38,kind:'source-header',color:'#5f9a64'});
 Object.assign(e('c3-e2'),{renderInMap:true,sourcePath:'M600 165 H455 H300',sourceColor:'#df8d35',sourceWidth:5,sourceArrow:true});
 Object.assign(e('c3-e3'),{renderInMap:true,sourcePath:'M655 655 V690',sourceColor:'#5d7fae',sourceWidth:4,sourceArrow:true});
 Object.assign(e('c3-e5'),{renderInMap:true,sourcePath:'M600 705 H520 L475 760',sourceColor:'#5f9a64',sourceWidth:4,sourceArrow:true});
 Object.assign(f('p246-daily').sourceRect,{x:70,y:175,width:330,height:245});
 Object.assign(f('p246-celestial').sourceRect,{x:500,y:170,width:350,height:360});
 Object.assign(f('p246-daycompare').sourceRect,{x:300,y:585,width:360,height:180});
 Object.assign(f('p246-zodiac').sourceRect,{x:70,y:770,width:690,height:360});
}
