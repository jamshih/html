// Source prompt renderer. It changes wording/blank answer shape only; source-traced geometry stays untouched.
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
       if(r.replaceFields){
         const old=(item.fields||[]).map(f=>String(f.answer||'')).filter(Boolean);
         item.fields=Array.from({length:r.blanks},(_,i)=>({answer:String(r.sourceAnswers[i]??''),aliases:Array.from(new Set([...(r.answerAliases?.[i]||[]),...(r.keepOldAsAliases===false?[]:old)].filter(Boolean)))}));
         continue;
       }
       if(r.ensureFields){
         while((item.fields?.length||0)<r.blanks){item.fields=item.fields||[];item.fields.push({answer:'',aliases:[]});}
       }
       r.sourceAnswers.forEach((answer,i)=>{
         const f=item.fields?.[i]; if(!f||answer==null)return;
         const old=String(f.answer||''),aliases=[...(f.aliases||[]),...((r.answerAliases?.[i])||[])];
         if(!r.dropOldAlias&&old)aliases.push(old);
         f.aliases=Array.from(new Set(aliases.filter(Boolean)));f.answer=String(answer);
       });
     }
   }
 }
 window.v7NormalizePromptText=function(s){return String(s||'').replace(/[\s\u3000]+/g,'').replace(/[，,]/g,'，').replace(/[：:]/g,'：').replace(/[（(]/g,'(').replace(/[）)]/g,')');};
 patchSourceAnswers();
 const prev=window.v5PageHtml;if(typeof prev!=='function')return;
 window.v5PageHtml=function(ch,sem,page,mode){
   let html=prev(ch,sem,page,mode),recs=(window.SOURCE_PROMPTS_V7||{})[page];if(!Array.isArray(recs)||!recs.length)return html;
   const t=document.createElement('template');t.innerHTML=html;
   for(const r of recs){
     if(r.standalone===false){
       if(!t.content.querySelector(`[data-question="${r.number}"]`)){
         const marker=document.createElement('span');marker.className='v7-logical-question-marker';marker.dataset.question=String(r.number);marker.dataset.page=String(page);marker.dataset.v7CompositeSource='true';marker.hidden=true;marker.setAttribute('aria-hidden','true');
         const section=t.content.querySelector('section')||t.content.firstElementChild;if(section)section.appendChild(marker);
       }
       continue;
     }
     if(r.skipRender)continue;
     const target=r.renderTarget||r.number,el=t.content.querySelector(`[data-question="${target}"]`);if(!el){r.runtimeMissing=true;continue;}
     let fills=[...el.querySelectorAll('.v4strict-fill')].map(x=>x.outerHTML);
     if((r.ensureFields||r.replaceFields)&&typeof window.v4StrictField==='function')fills=Array.from({length:r.blanks},(_,i)=>window.v4StrictField(ch,r.number,i,mode,(r.blankWidths?.[i]||68)));
     if(fills.length!==r.blanks){el.dataset.v7PromptStatus=`blank-count-${fills.length}-expected-${r.blanks}`;continue;}
     let out=String(r.template||'');for(let i=0;i<r.blanks;i++)out=out.split(`{{${i}}}`).join(fills[i]||'');
     el.innerHTML=out;el.dataset.v7PromptStatus='verified';el.dataset.v7SourcePrompt='true';el.dataset.v7SourceBlankCount=String(r.blanks);
   }
   if(page===242&&typeof window.v4StrictField==='function'){
     const el=t.content.querySelector('[data-question="18"]');
     if(el){
       const f=i=>window.v4StrictField(ch,18,i,mode,110);
       el.innerHTML=`<b class="v4strict-num">(18)</b> 3大主因<div style="display:grid;grid-template-columns:18px 110px;gap:5px 7px;margin-top:4px;align-items:center"><span>1.</span>${f(0)}<span>2.</span>${f(1)}<span>3.</span>${f(2)}</div>`;
       el.style.width='190px';el.style.lineHeight='1.25';el.dataset.v7PromptStatus='verified';el.dataset.v7SourcePrompt='true';el.dataset.v7SourceBlankCount='3';
     }
     if(!t.content.querySelector('.v7-p242-atmosphere-cloud')){
       const cloud=document.createElement('div');cloud.className='v7-p242-atmosphere-cloud';cloud.setAttribute('aria-hidden','true');cloud.style.cssText='position:absolute;left:392px;top:758px;width:255px;height:125px;z-index:1;pointer-events:none';cloud.innerHTML='<svg viewBox="0 0 255 125" preserveAspectRatio="none"><path d="M35 108C11 105 5 84 19 68C9 45 28 25 50 30C62 8 94 7 108 27C132 11 161 22 166 45C190 30 220 41 224 65C246 68 252 93 236 107Z" fill="#cbdce1" opacity=".86"/></svg>';
       const q16=t.content.querySelector('[data-question="16"]');if(q16){q16.style.zIndex='2';q16.before(cloud)}
     }
   }
   return t.innerHTML;
 };
 if(typeof window.render==='function')window.render();
})();
