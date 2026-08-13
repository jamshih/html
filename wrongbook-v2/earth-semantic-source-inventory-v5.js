// Independent source-figure inventory for photographed Earth Science pages 242–253.
const V5_SOURCE_FIGURE_INVENTORY={
242:['p242-bigbang','p242-singularity','p242-nebula','p242-planets','p242-atmosphere1','p242-hot-earth','p242-diff','p242-guide'],
243:['p243-decay','p243-strata','p243-fossils','p243-env'],
244:['p244-starbar','p244-brightness','p244-constellation','p244-parallax','p244-guide'],
245:['p245-blackbody','p245-wavelength','p245-hierarchy','p245-solar','p245-comet'],
246:['p246-celestial','p246-daily','p246-daycompare','p246-zodiac'],
247:['p247-dome','p247-sunrise','p247-south','p247-orbit','p247-milan','p247-insolation'],
248:['p248-ray','p248-seismogram','p248-crustgraph','p248-crustsection','p248-deepgraph','p248-layertable'],
249:['p249-location','p249-triangulation','p249-boundary','p249-subduction','p249-taiwan'],
250:['p250-protection','p250-layers','p250-sat','p250-wetbulb'],
251:['p251-geostrophic','p251-friction','p251-highlow'],
252:['p252-enso','p252-normal','p252-tempdepth','p252-salinity'],
253:['p253-greenhouse','p253-energy']
};
window.V5_SOURCE_FIGURE_INVENTORY=V5_SOURCE_FIGURE_INVENTORY;
function v5SourceAuditChapter(ch,removeIds){if(!ch)return;const remove=new Set(removeIds);ch.figures=ch.figures.filter(f=>!remove.has(f.id));ch.figureInventory={};for(const f of ch.figures)ch.figureInventory[f.sourcePage]=(ch.figureInventory[f.sourcePage]||0)+1;}
v5SourceAuditChapter(EARTH_SEMANTIC_MAPS.find(c=>c.number===5),['p251-vertical']);
v5SourceAuditChapter(EARTH_SEMANTIC_MAPS.find(c=>c.number===6),['p252-typhoon','p253-albedo','p253-plateclimate','p253-wave','p253-tides']);
function v5Micro(ch,id,page,label,x,y,w=90,color='#6d8b74'){if(v5NodeById(ch,id))return v5NodeById(ch,id);return v5Node(ch,id,page,label,x,y,w,28,color,'micro',{questionArea:{x,y:y+30,w:8,h:8},blankPattern:'stack'});}
function v5Rel(ch,id,page,from,to,relation,reason,color='#6d8b74',direction='forward'){if(ch.relations.some(e=>e.id===id))return;v5Edge(ch,id,page,from,to,relation,reason,color,direction);}
