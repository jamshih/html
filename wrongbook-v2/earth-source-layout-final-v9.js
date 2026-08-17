// Final hierarchy normalization from the current NEW_SOURCE_TRUTH grids.
(function(){
 const H=window.SOURCE_HIERARCHY_V9;if(!H)return;
 const annual=H[246]?.nodes?.['p246-annual'];
 if(annual){annual.sourceRect.h=415;annual.safeRect.h=415;annual.contentRect.h=415;}
 const insolation=H[247]?.nodes?.['p247-insolation'];
 if(insolation){insolation.sourceRect.y=770;insolation.sourceRect.h=470;insolation.safeRect.y=770;insolation.safeRect.h=470;insolation.contentRect.y=770;insolation.contentRect.h=470;}
 const evidence=H[249]?.nodes?.['p249-evidence'];
 if(evidence){evidence.sourceRect.h=260;evidence.safeRect.h=260;evidence.contentRect.h=260;}
 const boundaries=H[249]?.nodes?.['p249-boundaries'];
 if(boundaries){boundaries.sourceRect.y=630;boundaries.safeRect.y=630;boundaries.contentRect.y=630;boundaries.sourceRect.h=555;boundaries.safeRect.h=555;boundaries.contentRect.h=555;}
 const layers=H[250]?.nodes?.['p250-layers'];
 if(layers){layers.sourceRect.w=805;layers.safeRect.w=805;layers.contentRect.w=805;layers.sourceRect.h=325;layers.safeRect.h=325;layers.contentRect.h=325;}

 function setRect(el,left,top,width,height){
   if(!el)return;
   if(Number.isFinite(left))el.style.setProperty('left',`${left}px`,'important');
   if(Number.isFinite(top))el.style.setProperty('top',`${top}px`,'important');
   if(Number.isFinite(width))el.style.setProperty('width',`${width}px`,'important');
   if(Number.isFinite(height))el.style.setProperty('height',`${height}px`,'important');
 }
 function question(root,n){return root.querySelector(`[data-question="${n}"]`);}
 function directSpans(el){return el?[...el.children].filter(x=>x.tagName==='SPAN'&&!x.hasAttribute('data-source-label')):[];}
 function removeSvgText(root,selector,values){
   const wanted=new Set(values);
   root.querySelectorAll(`${selector} text`).forEach(el=>{if(wanted.has((el.textContent||'').trim()))el.remove();});
 }
 function normalize243(root){
   // The V8 renderer writes source rectangles inline with !important. Re-apply the final grid positions inline so
   // the compact labels do not get forced back to stale localRect values by the generic prompt pass.
   const decay=root.querySelector('.v8-p243-decay');
   const q38=question(root,38),q39=question(root,39);
   setRect(q38,20,7,310);
   setRect(q39,205,148,145);
   for(const [q,w] of [[q38,44],[q39,30]]){
     const blank=q?.querySelector('.v4strict-fill');
     if(blank){blank.style.setProperty('width',`${w}px`,'important');blank.style.setProperty('min-width',`${w}px`,'important');}
   }
   // The graph already has the canonical q39 suffix owner; only the tick "3" remains static. Nudge it away from the prompt.
   const tick3=decay?.querySelector('svg text:nth-of-type(5)');
   if(tick3)tick3.style.setProperty('transform','translateX(-4px)','important');
   const staticSuffix=decay?.querySelector('svg text:nth-of-type(6)');
   if(staticSuffix)staticSuffix.style.setProperty('display','none','important');
   const fossil=root.querySelector('[data-source-connector="fossilToTimeline"]');
   if(fossil){fossil.setAttribute('d','M190 445V460H55V600');fossil.style.setProperty('d','path("M190 445V460H55V600")','important');}
   const q49=root.querySelector('[data-source-label="q49"]');
   setRect(q49,535,478,150);
 }
 function normalize244(root){
   // Preserve the exact source prompt wording while giving the printed suffixes enough horizontal room.
   setRect(question(root,6),397,500,320);
   const q21=question(root,21);
   setRect(q21,170,145,155);
 }
 function normalize247(root){
   // Keep prompt rows in their printed bands; these adjustments only separate adjacent rows/labels.
   setRect(question(root,22),585,165,240);
   setRect(question(root,26),560,555,270);
   setRect(question(root,33),320,700,190);
   setRect(question(root,39),690,825,190);
   setRect(question(root,41),500,1100,330);
 }
 function normalize248(root){
   // q15 is one canonical source owner equal to the complete printed interior block. Keep it measurable (not display:contents)
   // and convert the original page-absolute field anchors back into coordinates local to that source block.
   const q15=question(root,15);
   if(q15){
     q15.style.setProperty('display','block','important');
     q15.style.setProperty('position','absolute','important');
     q15.style.setProperty('box-sizing','border-box','important');
     q15.style.setProperty('inset','auto','important');
     q15.style.setProperty('right','auto','important');
     q15.style.setProperty('bottom','auto','important');
     q15.style.setProperty('max-width','none','important');
     setRect(q15,62,775,780,425);
     q15.style.setProperty('pointer-events','none','important');
     q15.dataset.parentId='p248-interior';
     q15.dataset.sourceRole='source-box';
     q15.dataset.visualOwner='q15';
     const instruction=q15.querySelector('[data-source-label="q15-instruction"]');
     setRect(instruction,62,15,690);
     if(instruction){instruction.style.fontSize='12.5px';instruction.style.lineHeight='1.4';}
     const cells=directSpans(q15);
     const xs=[376,460,548,628,376,460,548,628,376,460,548];
     const ys=[178,178,178,178,275,275,275,275,370,370,370];
     cells.forEach((el,i)=>{
       if(Number.isFinite(xs[i]))el.style.setProperty('left',`${xs[i]}px`,'important');
       if(Number.isFinite(ys[i]))el.style.setProperty('top',`${ys[i]}px`,'important');
       el.style.setProperty('pointer-events','auto','important');
     });
   }
   const deep=root.querySelector('.v6-p248-deep');
   setRect(deep,55,860,800,370);
   const h4=root.querySelector('.v6-p248-head.h4');setRect(h4,125,700);
   // Keep the top seismic prompt in its printed left text band; do not let it run through P/S labels.
   const q1=question(root,1);setRect(q1,76,268,250);if(q1){q1.style.fontSize='12.5px';q1.style.lineHeight='1.35';}
   // q10/q11 are four-field source rows above the crust section; q12-q14 sit beside the printed brackets.
   setRect(question(root,8),170,510,145);
   setRect(question(root,10),315,538,255);
   setRect(question(root,11),575,538,255);
   setRect(question(root,12),338,635,185);
   setRect(question(root,13),338,690,185);
   setRect(question(root,14),632,618,225);
   // These words are answer owners in the photo, not publisher-printed labels inside the static figure.
   removeSvgText(root,'.v6-p248-crust',['大陸地殼','海洋地殼','莫荷不連續面']);
 }
 function normalize249(root){
   // The source formula box contains printed instructions plus an empty q16 answer line; the completed equation is handwriting.
   const formula=root.querySelector('.v6-p249-formula');
   if(formula){formula.replaceChildren();formula.dataset.sourceRole='source-box';formula.dataset.visualOwner='q16';}
   const hazards=root.querySelector('.v6-p249-hazards');
   if(hazards){hazards.innerHTML='<b>○ 海嘯：</b>海床產生落差引發海嘯波，非地震波傳至海水轉換而成';hazards.dataset.visualOwner='publisher-static';}
   const rects={
     16:[91,157,164],
     17:[540,162,286],
     18:[540,274,286],
     19:[540,333,286],
     20:[145,452,690],
     21:[82,533,770],
     22:[95,682,285],
     24:[680,653,170],
     25:[105,778,278],
     26:[105,866,220]
   };
   for(const [n,r] of Object.entries(rects))setRect(question(root,+n),r[0],r[1],r[2]);
   for(const n of [16,17,18,19,20,21,22,24,25,26]){
     const el=question(root,n);if(!el)continue;
     el.style.fontSize=n===16?'13px':(n===21||n===20?'12.5px':(n===22?'13px':'13.5px'));
     el.style.lineHeight=n===21?'1.1':(n===20?'1.12':(n===22?'1.25':(n===16?'1.45':'1.35')));
     el.style.setProperty('background','transparent','important');
     el.style.setProperty('padding','0','important');
   }
   const q16=question(root,16);if(q16){q16.style.minHeight='205px';q16.dataset.sourceRole='text-row';q16.dataset.visualOwner='q16';}
   const q23=question(root,23);
   if(q23){
     q23.style.setProperty('max-width','none','important');
     q23.style.setProperty('min-width','510px','important');
     q23.style.setProperty('box-sizing','border-box','important');
     setRect(q23,400,650,510,245);q23.dataset.parentId='p249-boundaries';
     const fields=directSpans(q23);
     const xs=[24,150,248,300];
     const ys=[42,18,42,80];
     fields.forEach((el,i)=>{if(Number.isFinite(xs[i]))el.style.setProperty('left',`${xs[i]}px`,'important');if(Number.isFinite(ys[i]))el.style.setProperty('top',`${ys[i]}px`,'important');});
   }
   const taiwan=root.querySelector('.v6-p249-taiwan');setRect(taiwan,383,885,405,300);
   const q27=question(root,27);
   if(q27){
     setRect(q27,430,900,390,310);q27.dataset.parentId='p249-boundaries';
     const fields=directSpans(q27);
     const xs=[245,245,22,177];
     fields.forEach((el,i)=>{if(Number.isFinite(xs[i]))el.style.setProperty('left',`${xs[i]}px`,'important');});
     let s=q27.querySelector('[data-source-label="q27-instruction"]');
     if(!s){s=document.createElement('span');s.dataset.sourceLabel='q27-instruction';s.dataset.sourceRole='text-row';q27.prepend(s);}
     s.style.cssText='position:absolute;left:0;top:-25px;width:390px;font-size:13px;line-height:1.25;pointer-events:none';
     s.innerHTML='請在島弧與海溝處寫上名稱 <b class="v4strict-num">(27)</b>';
   }
 }

 const prev=window.v5PageHtml;
 if(typeof prev==='function'){
   window.v5PageHtml=function(ch,sem,page,mode){
     let html=prev(ch,sem,page,mode);
     if(![243,244,247,248,249].includes(page))return html;
     const t=document.createElement('template');t.innerHTML=html;
     const root=t.content.querySelector(`[data-strict-page="${page}"]`);
     if(!root)return html;
     if(page===243)normalize243(root);
     else if(page===244)normalize244(root);
     else if(page===247)normalize247(root);
     else if(page===248)normalize248(root);
     else normalize249(root);
     return t.innerHTML;
   };
 }
})();
