// Page 243 source trace. Fixed page-local geometry follows IMG_1524.
const v6P243StrictBase=window.v4Strict243;
const V6_P243_SCALE=1;
const v6P243Px=n=>Math.round(n*V6_P243_SCALE*10)/10;
function v6P243MoveQuestion(html,n,x,y,w){
 const re=new RegExp(`(data-question="${n}" style=")[^"]+("?)`);
 return html.replace(re,`$1left:${v6P243Px(x)}px;top:${v6P243Px(y)}px;width:${v6P243Px(w)}px$2`);
}
const V6_P243_LINES=`<svg class="v4strict-svg v6-p243-lines" viewBox="0 0 910 1270" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="v6p243arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="context-stroke"/></marker></defs>
<path class="orange" d="M58 181H104M104 181V126H120M104 181V214H120M132 236V322"/>
<path class="orange" d="M200 218L328 385"/><path class="orange" d="M126 319L212 488"/>
<path class="spine green" d="M0 642H145"/><circle class="node" cx="145" cy="642" r="8"/>
<path class="spine mustard" d="M145 642H450"/><circle class="node" cx="450" cy="642" r="8"/>
<path class="spine pink" d="M450 642H640"/><circle class="node" cx="640" cy="642" r="8"/>
<path class="spine slate" d="M640 642H742"/><circle class="node" cx="742" cy="642" r="8"/>
<path class="arrow dark" d="M742 642H876" marker-end="url(#v6p243arr)"/>
<path class="mustard" d="M285 635L232 577"/><path class="orange" d="M450 632L385 543"/><path class="orange" d="M640 632L566 535"/>
<path class="mustard" d="M287 688C360 706 485 744 612 803" marker-end="url(#v6p243arr)"/>
<path class="mustard" d="M798 862C720 842 674 817 618 804" marker-end="url(#v6p243arr)"/>
<path class="green" d="M0 817H431V895" marker-end="url(#v6p243arr)"/>
<path class="green" d="M102 872V1055L218 1145" marker-end="url(#v6p243arr)"/>
<path class="green" d="M214 921V963H355" marker-end="url(#v6p243arr)"/>
<path class="green" d="M355 963H592" marker-end="url(#v6p243arr)"/>
<path class="green" d="M592 963V1144L419 1194" marker-end="url(#v6p243arr)"/>
</svg>`;
const V6_P243_STRATA=`<svg class="v6-p243-strata" viewBox="0 0 355 210" preserveAspectRatio="xMidYMid meet" aria-label="相對地質年代地層示意圖"><rect x="8" y="8" width="255" height="190" fill="#e7ddab" stroke="#69665f" stroke-width="2"/><path d="M9 9H262V63C225 58 191 64 162 59C118 52 80 58 9 63Z" fill="#d8c791"/><path d="M9 63C80 58 118 52 162 59C191 64 225 58 262 63V105C220 100 181 106 145 99C100 90 59 101 9 103Z" fill="#d9cd84" stroke="#817659" stroke-width="1"/><g fill="#817659"><circle cx="36" cy="76" r="1.6"/><circle cx="61" cy="85" r="1.6"/><circle cx="90" cy="73" r="1.6"/><circle cx="123" cy="90" r="1.6"/><circle cx="160" cy="76" r="1.6"/><circle cx="198" cy="92" r="1.6"/><circle cx="234" cy="76" r="1.6"/></g><path d="M9 103C61 99 99 91 144 100C180 107 221 100 262 105V146C235 143 208 138 184 143C151 151 116 142 89 144C54 146 33 152 9 150Z" fill="#ad5c4f"/><g fill="#ead8aa"><ellipse cx="82" cy="120" rx="7" ry="4" transform="rotate(-20 82 120)"/><ellipse cx="123" cy="131" rx="6" ry="4" transform="rotate(25 123 131)"/><ellipse cx="180" cy="120" rx="8" ry="4" transform="rotate(-15 180 120)"/><ellipse cx="224" cy="132" rx="6" ry="4" transform="rotate(20 224 132)"/></g><path d="M9 150C54 152 82 144 112 146C146 148 174 155 205 150C230 146 247 149 262 147V197H9Z" fill="#b68b69"/><path d="M20 168H250M20 181H250" stroke="#8d684f" stroke-width="1.4" stroke-dasharray="10 7"/><path d="M231 0L197 210" stroke="#5e4d49" stroke-width="10"/><g font-family="Noto Sans TC,PingFang TC,Microsoft JhengHei,sans-serif" font-size="16" fill="#4d4a44"><text x="270" y="40">D沉積岩</text><text x="270" y="78">C沉積岩</text><text x="270" y="110">B火成岩侵入</text><text x="270" y="129" font-size="12">（內含C碎塊）</text><text x="270" y="168">A沉積岩</text><text x="270" y="199">E逆斷層</text></g></svg>`;
const V6_P243_OCEAN=`<svg class="v6-p243-ocean" viewBox="0 0 620 230" preserveAspectRatio="xMidYMid meet" aria-label="早期海洋、光合作用與氧氣增加"><path d="M0 92Q90 72 170 90T340 92T620 82V212H0Z" fill="#c8d7d6" opacity=".9"/><path d="M0 145Q80 127 155 143T310 144T465 140T620 132V212H0Z" fill="#9ea49d" opacity=".82"/><path d="M165 155h110l-13 36h-83Z" fill="#827b70"/><path d="M300 154q18-38 36 0" fill="none" stroke="#6f8e63" stroke-width="5"/><circle cx="390" cy="120" r="10" fill="#e9eee9" stroke="#6c7c71" stroke-width="2"/><path d="M401 120H515" stroke="#69a166" stroke-width="8"/><path d="M515 120l-18-10v20Z" fill="#69a166"/></svg>`;
window.v4Strict243=function(ch,mode){
 let html=v6P243StrictBase(ch,mode);
 const pos={33:[272,88,250],34:[276,151,235],35:[323,248,548],36:[622,112,180],37:[586,65,180],38:[536,28,190],39:[805,164,115],40:[230,325,280],41:[230,382,285],42:[230,438,285],43:[3,344,210],44:[198,548,125],45:[414,546,125],46:[644,540,170],47:[10,510,180],48:[302,513,220],30:[207,696,135],21:[8,790,175],22:[8,838,175],23:[8,883,175],24:[185,790,275],31:[640,778,245],25:[360,897,315],26:[297,967,250],27:[320,1028,180],28:[575,955,145],29:[699,918,205],32:[198,1135,260]};
 for(const [n,p] of Object.entries(pos))html=v6P243MoveQuestion(html,n,p[0],p[1],p[2]);
 html=html.replace(/<svg class="v4strict-svg"[\s\S]*?<\/svg>/,V6_P243_LINES);
 html=html.replace('<div class="v4strict-footer">243</div>',`${V6_P243_STRATA}${V6_P243_OCEAN}<div class="v4strict-footer">243</div>`);
 html=html.replace(/style="--rc:#6c9b5e;left:[^"]+"/,`style="--rc:#6c9b5e;left:${v6P243Px(490)}px;top:${v6P243Px(1200)}px;width:${v6P243Px(245)}px"`);
 return html;
};