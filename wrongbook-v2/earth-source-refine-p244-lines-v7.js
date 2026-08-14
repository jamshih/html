// p244 local connector cleanup: every visible path starts/ends at a printed concept or teaching object.
(function(){
  const LINES=`<svg class="v4strict-svg v6-p244-lines v7-p244-lines" data-v7-line-manifest="244" viewBox="0 0 910 1270" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="v7p244purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#7465a4"/></marker><marker id="v7p244orange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#d8813a"/></marker><marker id="v7p244blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#6d86b3"/></marker></defs>
  <g fill="none" stroke="#7465a4" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path data-line-id="p244-color-temperature" d="M288 310V344"/>
    <path data-line-id="p244-color-to-star" d="M300 394L240 485L188 552"/>
    <path data-line-id="p244-star-planet" d="M164 552L105 485"/>
    <path data-line-id="p244-star-stellar" d="M164 552L235 480"/>
    <path data-line-id="p244-star-to-sky" d="M164 770V602" marker-end="url(#v7p244purple)"/>
  </g>
  <g fill="none" stroke="#d8813a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path data-line-id="p244-brightness-factor-root" d="M335 570V515"/>
    <path data-line-id="p244-brightness-luminosity" d="M335 515L318 493"/>
    <path data-line-id="p244-brightness-distance" d="M335 515L420 452"/>
    <path data-line-id="p244-brightness-magnitude" d="M370 585L488 560"/>
    <path data-line-id="p244-magnitude-one" d="M610 558L682 548"/>
    <path data-line-id="p244-magnitude-five" d="M610 565L688 595"/>
    <path data-line-id="p244-magnitude-general" d="M605 572L690 642"/>
    <path data-line-id="p244-star-brightness" d="M255 730L323 610" marker-end="url(#v7p244orange)"/>
    <path data-line-id="p244-absolute-magnitude" d="M620 458L655 470"/>
  </g>
  <path data-line-id="p244-sky-distance" d="M382 765H515" fill="none" stroke="#6d86b3" stroke-width="5" stroke-linecap="round" marker-end="url(#v7p244blue)"/>
  </svg>`;
  const prev=window.v5PageHtml;
  if(typeof prev!=='function')return;
  window.v5PageHtml=function(ch,sem,page,mode){
    let html=prev(ch,sem,page,mode);
    if(page!==244)return html;
    const t=document.createElement('template');t.innerHTML=html;
    const old=t.content.querySelector('.v6-p244-lines');
    if(old){const x=document.createElement('template');x.innerHTML=LINES;old.replaceWith(x.content.firstElementChild)}
    return t.innerHTML;
  };
  if(typeof window.render==='function')window.render();
})();
