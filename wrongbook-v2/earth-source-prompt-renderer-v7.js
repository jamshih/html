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
       if(r.ensureFields){
         while((item.fields?.length||0)<r.blanks){
           item.fields=item.fields||[];
           item.fields.push({answer:'',aliases:[]});
         }
       }
       r.sourceAnswers.forEach((answer,i)=>{
         const f=item.fields?.[i]; if(!f||answer==null)return;
         const old=String(f.answer||'');
         const aliases=[...(f.aliases||[]),...((r.answerAliases?.[i])||[])];
         if(!r.dropOldAlias&&old)aliases.push(old);
         f.aliases=Array.from(new Set(aliases.filter(Boolean)));
         f.answer=String(answer);
       });
     }
   }
 }
 window.v7NormalizePromptText=function(s){return String(s||'').replace(/[\s\u3000]+/g,'').replace(/[，,]/g,'，').replace(/[：:]/g,'：').replace(/[（(]/g,'(').replace(/[）)]/g,')');};
 patchSourceAnswers();
 const prev=window.v5PageHtml;
 if(typeof prev!=='function')return;
 window.v5PageHtml=function(ch,sem,page,mode){
   let html=prev(ch,sem,page,mode),recs=(window.SOURCE_PROMPTS_V7||{})[page];
   if(!Array.isArray(recs)||!recs.length)return html;
   const t=document.createElement('template');t.innerHTML=html;
   for(const r of recs){
     if(r.standalone===false||r.skipRender)continue;
     const target=r.renderTarget||r.number;
     const el=t.content.querySelector(`[data-question="${target}"]`);
     if(!el){r.runtimeMissing=true;continue;}
     let fills=[...el.querySelectorAll('.v4strict-fill')].map(x=>x.outerHTML);
     if(r.ensureFields&&typeof window.v4StrictField==='function'){
       fills=Array.from({length:r.blanks},(_,i)=>window.v4StrictField(ch,r.number,i,mode,(r.blankWidths?.[i]||68)));
     }
     if(fills.length!==r.blanks){el.dataset.v7PromptStatus=`blank-count-${fills.length}-expected-${r.blanks}`;continue;}
     let out=String(r.template||'');
     for(let i=0;i<r.blanks;i++)out=out.split(`{{${i}}}`).join(fills[i]||'');
     el.innerHTML=out;
     el.dataset.v7PromptStatus='verified';
     el.dataset.v7SourcePrompt='true';
     el.dataset.v7SourceBlankCount=String(r.blanks);
   }
   return t.innerHTML;
 };
 if(typeof window.render==='function')window.render();
})();
