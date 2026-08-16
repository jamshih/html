// Source prompt renderer. Exact printed wording and source geometry are applied together.
(function(){
 const PAGE_CHAPTER={242:1,243:1,244:2,245:2,246:3,247:3,248:4,249:4,250:5,251:5,252:6,253:6};
 function chapterFor(page){return (window.EARTH_REFERENCE_MAPS||[]).find(c=>c.number===PAGE_CHAPTER[page]);}
 function items(ch){return typeof window.v4RefAllItems==='function'?window.v4RefAllItems(ch):[];}
 function patchSourceAnswers(){
   const M=window.SOURCE_PROMPTS_V7||{};
   for(const [pageKey,recs] of Object.entries(M)){
     const ch=chapterFor(+pageKey); if(!ch)continue;
     for(const r of recs){
       if(!Array.isArray(r.sourceAnswers)||!r.sourceAnswers.length)continue;
       const item=items(ch).find(x=>x.number===r.number); if(!item)continue;
       if(r.replaceFields){const old=(item.fields||[]).map(f=>String(f.answer||'')).filter(Boolean);item.fields=Array.from({length:r.blanks},(_,i)=>({answer:String(r.sourceAnswers[i]??''),aliases:Array.from(new Set([...(r.answerAliases?.[i]||[]),...(r.keepOldAsAliases===false?[]:old)].filter(Boolean)))}));continue;}
       if(r.ensureFields){while((item.fields?.length||0)<r.blanks){item.fields=item.fields||[];item.fields.push({answer:'',aliases:[]});}}
       r.sourceAnswers.forEach((answer,i)=>{const f=item.fields?.[i];if(!f||answer==null)return;const old=String(f.answer||''),aliases=[...(f.aliases||[]),...((r.answerAliases?.[i])||[])];if(!r.dropOldAlias&&old)aliases.push(old);f.aliases=Array.from(new Set(aliases.filter(Boolean)));f.answer=String(answer);});
     }
   }
 }
 function applySourceRect(el,r,page){const box=r?.sourceRect;if(!el||!box)return;const x=Number(box.x),y=Number(box.y),w=Number(box.w),h=Number(box.h);if(Number.isFinite(x))el.style.setProperty('left',`${x}px`,'important');if(Number.isFinite(y))el.style.setProperty('top',`${y}px`,'important');if(Number.isFinite(w))el.style.setProperty('width',`${w}px`,'important');el.dataset.sourceRole='prompt';el.dataset.visualOwner='source-prompt-manifest';el.dataset.sourcePage=String(page);el.dataset.sourceRect=[x,y,w,h].join(',');if(Number.isFinite(h))el.dataset.sourceExpectedHeight=String(h);}
 function markBlanks(el,page,n){[...el.querySelectorAll('.v4strict-fill')].forEach((blank,i)=>{blank.dataset.sourceRole='blank';blank.dataset.visualOwner=`q${n}`;blank.dataset.sourcePage=String(page);blank.dataset.sourceBlank=String(i);});}
 function applyOwnedLayout(t,page){const layout=window.EARTH_SOURCE_LAYOUT_V8?.[page];if(!layout?.objects)return;for(const [id,o] of Object.entries(layout.objects)){const el=t.content.querySelector(`[data-source-object="${id}"]`);if(!el)continue;const r=o.inside&&o.localRect?o.localRect:o.rect;if(!r)continue;for(const [prop,val] of [['left',r.x],['top',r.y],['width',r.width]])if(Number.isFinite(Number(val)))el.style.setProperty(prop,`${Number(val)}px`,'important');if(Number.isFinite(Number(r.height))){if(o.role==='figure'||o.role==='heading'||o.role==='source-label')el.style.setProperty('height',`${Number(r.height)}px`,'important');else el.style.setProperty('min-height',`${Number(r.height)}px`,'important')}el.dataset.visualOwner=`source-layout-${page}`;el.dataset.sourceRole=o.role||el.dataset.sourceRole||'';el.dataset.sourceRect=[r.x,r.y,r.width,r.height].join(',');}}
 window.v7NormalizePromptText=function(s){return String(s||'').replace(/[\s\u3000]+/g,'').replace(/[，,]/g,'，').replace(/[：:]/g,'：').replace(/[（(]/g,'(').replace(/[）)]/g,')');};
 patchSourceAnswers();
 const prev=window.v5PageHtml;if(typeof prev!=='function')return;
 window.v5PageHtml=function(ch,sem,page,mode){
   let html=prev(ch,sem,page,mode),recs=(window.SOURCE_PROMPTS_V7||{})[page];if(!Array.isArray(recs)||!recs.length)return html;
   const t=document.createElement('template');t.innerHTML=html;
   const sourceOwned=t.content.querySelector(`[data-source-owned-page="${page}"]`);
   if(sourceOwned){
     // One source-owned renderer owns all final rectangles; this call only enforces that single model against legacy !important CSS.
     applyOwnedLayout(t,page);
     for(const r of recs){const el=t.content.querySelector(`[data-question="${r.renderTarget||r.number}"]`);if(el)markBlanks(el,page,r.number);if(r.standalone===false&&!t.content.querySelector(`[data-question="${r.number}"]`)){const marker=document.createElement('span');marker.className='v7-logical-question-marker';marker.dataset.question=String(r.number);marker.dataset.page=String(page);marker.dataset.v7CompositeSource='true';marker.hidden=true;marker.setAttribute('aria-hidden','true');sourceOwned.appendChild(marker);}}
     return t.innerHTML;
   }
   for(const r of recs){
     if(r.standalone===false){if(!t.content.querySelector(`[data-question="${r.number}"]`)){const marker=document.createElement('span');marker.className='v7-logical-question-marker';marker.dataset.question=String(r.number);marker.dataset.page=String(page);marker.dataset.v7CompositeSource='true';marker.hidden=true;marker.setAttribute('aria-hidden','true');const section=t.content.querySelector('section')||t.content.firstElementChild;if(section)section.appendChild(marker);}continue;}
     if(r.skipRender)continue;
     const target=r.renderTarget||r.number,el=t.content.querySelector(`[data-question="${target}"]`);if(!el){r.runtimeMissing=true;continue;}
     let fills=[...el.querySelectorAll('.v4strict-fill')].map(x=>x.outerHTML);
     if((r.ensureFields||r.replaceFields)&&typeof window.v4StrictField==='function')fills=Array.from({length:r.blanks},(_,i)=>window.v4StrictField(ch,r.number,i,mode,(r.blankWidths?.[i]||68)));
     if(fills.length!==r.blanks){el.dataset.v7PromptStatus=`blank-count-${fills.length}-expected-${r.blanks}`;continue;}
     let out=String(r.template||'');for(let i=0;i<r.blanks;i++)out=out.split(`{{${i}}}`).join(fills[i]||'');
     el.innerHTML=out;el.dataset.v7PromptStatus='verified';el.dataset.v7SourcePrompt='true';el.dataset.v7SourceBlankCount=String(r.blanks);applySourceRect(el,r,page);markBlanks(el,page,r.number);
   }
   if(page===242&&!t.content.querySelector('.v7-p242-atmosphere-cloud')){const cloud=document.createElement('div');cloud.className='v7-p242-atmosphere-cloud';cloud.dataset.sourceFigure='p242-atmosphere1';cloud.dataset.sourceRole='figure';cloud.dataset.visualOwner='p242-source-layout';cloud.setAttribute('aria-hidden','true');cloud.style.cssText='position:absolute;left:362px;top:792px;width:198px;height:112px;z-index:3;pointer-events:none';cloud.innerHTML='<svg viewBox="0 0 255 125" preserveAspectRatio="none"><path d="M35 108C11 105 5 84 19 68C9 45 28 25 50 30C62 8 94 7 108 27C132 11 161 22 166 45C190 30 220 41 224 65C246 68 252 93 236 107Z" fill="#cbdce1" opacity=".86"/></svg>';const q16=t.content.querySelector('[data-question="16"]');if(q16){q16.style.zIndex='5';q16.before(cloud)}}
   return t.innerHTML;
 };
 if(typeof window.render==='function')window.render();
})();