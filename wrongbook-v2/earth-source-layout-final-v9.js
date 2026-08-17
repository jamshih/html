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
 function removeSvgText(root,selector,values){
   const wanted=new Set(values);
   root.querySelectorAll(`${selector} text`).forEach(el=>{if(wanted.has((el.textContent||'').trim()))el.remove();});
 }
 function normalize248(root){
   // q15 is one canonical source owner equal to the complete printed interior block. Keep it measurable (not display:contents)
   // so its instruction and all eleven table cells have one valid source owner without changing their visible coordinates.
   const q15=question(root,15);
   if(q15){
     q15.style.setProperty('display','block','important');
     q15.style.setProperty('position','absolute','important');
     q15.style.setProperty('box-sizing','border-box','important');
     q15.style.setProperty('inset','auto','important');
     setRect(q15,62,775,780,425);
     q15.style.setProperty('pointer-events','none','important');
     q15.dataset.parentId='p248-interior';
     q15.dataset.sourceRole='source-box';
     q15.dataset.visualOwner='q15';
     const instruction=q15.querySelector('[data-source-label="q15-instruction"]');
     setRect(instruction,22,37,744);
     if(instruction){instruction.style.fontSize='12.5px';instruction.style.lineHeight='1.42';}
     const cells=[...q15.children].filter(el=>el.tagName==='SPAN'&&!el.hasAttribute('data-source-label'));
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
   // Keep the top seismic prompt in its printed left text band; do not let it run through P/S labels.
   const q1=question(root,1);setRect(q1,76,268,250);if(q1){q1.style.fontSize='12.5px';q1.style.lineHeight='1.35';}
   // q10/q11 are four-field source rows above the crust section; q12-q14 sit beside the printed brackets.
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
     20:[145,470,690],
     21:[82,520,770],
     22:[95,682,285],
     24:[680,653,170],
     25:[105,778,278],
     26:[105,866,220]
   };
   for(const [n,r] of Object.entries(rects))setRect(question(root,+n),r[0],r[1],r[2]);
   for(const n of [16,17,18,19,20,21,22,24,25,26]){
     const el=question(root,n);if(!el)continue;
     el.style.fontSize=n===16?'13px':(n===21?'12.5px':([20,22].includes(n)?'13px':'13.5px'));
     el.style.lineHeight=n===21?'1.2':([20,22].includes(n)?'1.25':(n===16?'1.45':'1.35'));
     el.style.setProperty('background','transparent','important');
     el.style.setProperty('padding','0','important');
   }
   const q16=question(root,16);if(q16){q16.style.minHeight='205px';q16.dataset.sourceRole='text-row';q16.dataset.visualOwner='q16';}
   const q23=question(root,23);
   if(q23){q23.style.setProperty('width','560px','important');q23.dataset.parentId='p249-boundaries';}
   const taiwan=root.querySelector('.v6-p249-taiwan');setRect(taiwan,383,900,405,300);
   const q27=question(root,27);
   if(q27){
     setRect(q27,410,875,500,330);q27.dataset.parentId='p249-boundaries';
     let s=q27.querySelector('[data-source-label="q27-instruction"]');
     if(!s){s=document.createElement('span');s.dataset.sourceLabel='q27-instruction';s.dataset.sourceRole='text-row';q27.prepend(s);}
     s.style.cssText='position:absolute;left:0;top:0;width:390px;font-size:13px;line-height:1.25;pointer-events:none';
     s.innerHTML='請在島弧與海溝處寫上名稱 <b class="v4strict-num">(27)</b>';
   }
 }

 const prev=window.v5PageHtml;
 if(typeof prev==='function'){
   window.v5PageHtml=function(ch,sem,page,mode){
     let html=prev(ch,sem,page,mode);
     if(page!==248&&page!==249)return html;
     const t=document.createElement('template');t.innerHTML=html;
     const root=t.content.querySelector(`[data-strict-page="${page}"]`);
     if(!root)return html;
     if(page===248)normalize248(root);else normalize249(root);
     return t.innerHTML;
   };
 }
})();
