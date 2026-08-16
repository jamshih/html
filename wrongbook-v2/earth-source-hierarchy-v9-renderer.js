// Final source-owned renderer for hierarchy-sensitive Earth pages.
(function(){
  function rec(page,n){return (window.SOURCE_PROMPTS_V7?.[page]||[]).find(x=>x.number===n);}
  function prompt(ch,page,n,mode,cls=''){
    const r=rec(page,n);if(!r)return '';
    const widths=r.blankWidths||[];let out=String(r.template||'');
    for(let i=0;i<r.blanks;i++)out=out.split(`{{${i}}}`).join(v4StrictField(ch,n,i,mode,widths[i]||58));
    const parent=window.v9SourceParentFor?.(page,n)||`p${page}`;
    return `<div class="v9-q ${cls}" data-question="${n}" data-page="${page}" data-source-role="text-row" data-parent-id="${parent}" data-source-owner="${parent}" data-v9-source-prompt="true">${out}</div>`;
  }
  function sourceNode(id){for(const p of [252,253]){const n=window.SOURCE_HIERARCHY_V9?.[p]?.nodes?.[id];if(n)return n;}return null;}
  function group(id,kind,inner,extra=''){
    const n=sourceNode(id);
    return `<div class="v9-group ${extra}" data-source-object="${id}" data-source-role="${kind}" data-parent-id="${n?.parentId||''}" data-container-kind="${n?.containerKind||'none'}">${inner}</div>`;
  }
  function pageShell(page,inner){let html=v4StrictPage(page,inner,`v9-page v9-page-${page}`);return html.replace(`data-strict-page="${page}"`,`data-strict-page="${page}" data-semantic-page="${page}" data-source-trace-page="${page}" data-source-owned-page="${page}" data-source-hierarchy-version="9"`);}

  const PAC=`<svg class="v9-p252-pac-figure" data-source-role="figure" data-figure-kind="normal-pacific" viewBox="0 0 365 165" aria-label="正常年赤道太平洋與洋流"><defs><marker id="v9pacR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#d65e57"/></marker></defs><rect width="365" height="165" fill="#dceae5"/><path d="M0 40Q32 19 57 39V165H0ZM326 34Q350 18 365 35V165H326Z" fill="#c8b477"/><path d="M58 58Q168 28 326 56" fill="none" stroke="#d65e57" stroke-width="4" marker-end="url(#v9pacR)"/><path d="M324 81H60" fill="none" stroke="#d65e57" stroke-width="3" marker-end="url(#v9pacR)"/><path d="M61 106H324" fill="none" stroke="#d65e57" stroke-width="3" marker-end="url(#v9pacR)"/><path d="M323 132H60" fill="none" stroke="#d65e57" stroke-width="3" marker-end="url(#v9pacR)"/><text x="116" y="51" font-size="11">北太平洋流</text><text x="135" y="77" font-size="10">北赤道流</text><text x="135" y="102" font-size="10">反赤道流</text><text x="135" y="128" font-size="10">南赤道流</text><text x="12" y="23" font-size="11">高水位／溫暖水域</text><text x="294" y="20" font-size="10">東太平洋</text></svg>`;
  const ENSO=`<svg class="v9-p252-enso-figure" data-source-role="graph" data-graph-kind="enso" viewBox="0 0 335 255" aria-label="聖嬰年赤道太平洋剖面"><defs><marker id="v9e252" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#626262"/></marker></defs><rect x="38" y="62" width="272" height="155" fill="#f7f3e9" stroke="#9b958a"/><path d="M42 150Q124 108 200 115Q258 120 306 137V215H42Z" fill="#4e88b6"/><path d="M42 125Q120 88 200 98Q260 105 306 120V145Q244 128 197 125Q116 116 42 145Z" fill="#e48158"/><path d="M47 137Q126 111 205 119Q263 124 303 134" fill="none" stroke="#efb24a" stroke-width="10"/><g stroke="#5c5c58" stroke-width="4" marker-end="url(#v9e252)"><path d="M105 122V91"/><path d="M147 115V84"/><path d="M190 118V88"/><path d="M253 80V111"/></g><text x="126" y="80" font-size="11">對流上升</text><text x="210" y="154" font-size="11">赤道東風減弱</text></svg>`;
  const TEMP=`<svg class="v9-p252-temp-figure" data-source-role="graph" data-graph-kind="temperature-depth" viewBox="0 0 185 150" aria-label="海水溫度垂直分層"><path d="M28 18H145M28 18V140" stroke="#555" stroke-width="1.5"/><path d="M126 24C104 34 74 39 55 49C44 60 39 76 38 95C37 112 37 128 37 139" fill="none" stroke="#bd5450" stroke-width="3"/><path d="M28 58H72M178 58H183M28 103H56M180 103H183" stroke="#8ba0af" stroke-width="1" stroke-dasharray="4 4"/><text x="82" y="12" font-size="9">溫度（°C）</text><text x="9" y="90" font-size="9" transform="rotate(-90 9 90)">深度（公里）</text></svg>`;
  const SAL=`<svg class="v9-p252-sal-figure" data-source-role="graph" data-graph-kind="surface-salinity" viewBox="0 0 290 170" aria-label="表面鹽度與蒸發降水緯度分布"><rect x="25" y="10" width="245" height="125" fill="#fff" stroke="#aaa"/><g stroke="#ddd"><path d="M25 40H270M25 70H270M25 100H270M75 10V135M125 10V135M175 10V135M225 10V135"/></g><path d="M28 94C72 117 103 83 145 69C179 58 216 63 268 82" fill="none" stroke="#4e7eaa" stroke-width="2.5"/><path d="M28 107C65 72 104 45 145 74C184 101 219 80 268 50" fill="none" stroke="#6da268" stroke-width="2.2"/><path d="M28 65C72 54 106 107 145 99C185 92 219 43 268 73" fill="none" stroke="#d28659" stroke-width="2.2"/><text x="184" y="36" font-size="9" fill="#6da268">蒸發量</text><text x="201" y="113" font-size="9" fill="#d28659">降水量</text><text x="80" y="91" font-size="9" fill="#4e7eaa">鹽度</text><text x="29" y="158" font-size="9">90°</text><text x="140" y="158" font-size="9">0°</text><text x="248" y="158" font-size="9">90°</text></svg>`;

  function page252(ch,mode){
    const ty=[1,2,3,4,5,6,7].map(n=>prompt(ch,252,n,mode,`q${n}`)).join('');
    const ensoVisual=group('p252-enso-figure','protected-figure',`${ENSO}${prompt(ch,252,18,mode,'q18')}`,'v9-p252-enso-visual');
    const q17=group('p252-enso-q17','source-box',prompt(ch,252,17,mode,'q17'),'v9-p252-enso-q17box');
    const q19=group('p252-enso-q19','source-box',prompt(ch,252,19,mode,'q19'),'v9-p252-enso-q19box');
    const ens=group('p252-enso','graphic-container',`<div class="v9-ribbon purple small">聖嬰現象</div><div class="v9-pill purple">聖嬰年</div>${ensoVisual}${q17}${q19}`,'v9-p252-enso');
    const pac=group('p252-normal-pacific','protected-figure',PAC,'v9-p252-normal-pacific');
    const horiz=group('p252-horizontal','group',`${pac}${prompt(ch,252,8,mode,'q8')}${prompt(ch,252,9,mode,'q9')}${prompt(ch,252,10,mode,'q10')}`,'v9-p252-horizontal');
    const q16=group('p252-upwelling-q16','source-box',prompt(ch,252,16,mode,'q16'),'v9-p252-q16box');
    const mixed=group('p252-mixed-upwelling','source-box',prompt(ch,252,11,mode,'q11'),'v9-p252-mixed');
    const temp=group('p252-temp-depth','protected-figure',`${TEMP}${prompt(ch,252,12,mode,'q12')}${prompt(ch,252,13,mode,'q13')}${prompt(ch,252,14,mode,'q14')}`,'v9-p252-temp');
    const exp=group('p252-temp-explain','source-box',prompt(ch,252,15,mode,'q15'),'v9-p252-temp-explain');
    const sal=[20,21,22,23,24,25,26].map(n=>prompt(ch,252,n,mode,`q${n}`)).join('');
    const ocean=`<div class="v9-ribbon blue ocean-title">海　洋</div><div class="v9-ribbon blue horizontal-title">水平變化</div><div class="v9-ribbon blue temp-title">海水溫度</div><div class="v9-ribbon blue vertical-title">垂直變化</div>${horiz}${q16}${mixed}${temp}${exp}<div class="v9-ribbon blue salt-title">海水鹽類</div>${group('p252-salinity','group',sal,'v9-p252-salinity')}${group('p252-salinity-graph','protected-figure',SAL,'v9-p252-salgraph')}`;
    const inner=`${v4StrictHeader(6,'海、氣與氣候變遷')}<div class="v9-ribbon purple airsea-title">海氣交互作用</div><div class="v9-ribbon purple ty-title">侵臺颱風</div>${group('p252-typhoon','group',ty,'v9-p252-typhoon')}${group('p252-air-sea','group',ens,'v9-p252-airsea')}${group('p252-ocean','group',ocean,'v9-p252-ocean')}`;
    return pageShell(252,inner);
  }

  const ENERGY=`<svg class="v9-p253-energy-graphic" data-source-role="figure" data-figure-kind="energy-balance" viewBox="0 0 300 365" aria-label="地球能量收支"><defs><marker id="v9e253" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#e79a2e"/></marker></defs><circle cx="152" cy="49" r="24" fill="#f4c62d" stroke="#cf8a24"/><g stroke="#cf8a24" stroke-width="2"><path d="M152 12V0M152 86V99M115 49H100M189 49H204M126 23L116 13M178 23L188 13M126 75L116 86M178 75L188 86"/></g><path d="M152 83V158" stroke="#e79a2e" stroke-width="5" marker-end="url(#v9e253)"/><text x="126" y="118" font-size="11">太陽入射100%</text><path d="M263 173V113" stroke="#e79a2e" stroke-width="4" marker-end="url(#v9e253)"/><text x="214" y="101" font-size="10">地球總反照率約31%</text><path d="M152 194V278" stroke="#d5a228" stroke-width="5" marker-end="url(#v9e253)"/><path d="M30 291Q111 273 186 280Q240 286 290 274V345H30Z" fill="#b49a78"/><rect x="235" y="271" width="57" height="9" transform="rotate(7 235 271)" fill="#4aa5c7"/></svg>`;
  const PLATE=`<svg class="v9-p253-plate-graphic" data-source-role="background" viewBox="0 0 755 92" aria-hidden="true"><path d="M0 39Q110 20 220 34Q340 50 455 31Q600 12 755 32V92H0Z" fill="#b79a77"/><path d="M15 35Q90 21 165 31M285 37Q380 21 455 31M545 30Q635 14 720 29" fill="none" stroke="#87765d" stroke-width="2"/></svg>`;
  const CLOUD=`<svg class="v9-p253-cloud-graphic" viewBox="0 0 205 100" aria-hidden="true"><path d="M8 82C-4 60 15 43 34 48C43 24 70 23 84 43C103 20 135 28 139 50C160 37 184 47 185 67C201 64 209 77 199 93H10Z" fill="#efd0c1" stroke="#d69d82" stroke-width="1.5"/></svg>`;
  function p253BranchSvg(){return `<svg class="v9-p253-ocean-lines" data-source-role="connector" viewBox="0 0 780 675" aria-hidden="true"><g fill="none" stroke="#57955b" stroke-width="4" stroke-linecap="square" stroke-linejoin="miter"><path d="M34 85V630"/><path d="M34 85H72"/><path d="M215 108V215M215 120H250M215 168H250M215 214H250"/><path d="M34 280H105"/><path d="M34 385H105M105 365V462M105 365H132M105 410H132M105 460H132"/><path d="M335 383V501M335 402H357M335 449H357M335 496H357"/><path d="M34 535H104M104 535V666M104 565H127M104 596H127M104 627H127M104 660H127"/></g><g fill="#fff" stroke="#666" stroke-width="2"><circle cx="34" cy="85" r="6"/><circle cx="34" cy="280" r="6"/><circle cx="34" cy="385" r="6"/><circle cx="34" cy="535" r="6"/></g></svg>`;}

  function page253(ch,mode){
    const cloud=group('p253-greenhouse-cloud','graphic-container',`${CLOUD}<div class="v9-cloud-label">溫室氣體包含</div>${prompt(ch,253,29,mode,'q29')}${prompt(ch,253,30,mode,'q30')}`,'v9-p253-cloud');
    const climateLeft=group('p253-climate-left','group',`${prompt(ch,253,27,mode,'q27')}${prompt(ch,253,28,mode,'q28')}${cloud}${prompt(ch,253,31,mode,'q31')}${prompt(ch,253,32,mode,'q32')}<div class="v9-greenhouse-effect">溫室效應</div>`,'v9-p253-climate-left');
    const energy=group('p253-energy','protected-figure',`${ENERGY}${prompt(ch,253,33,mode,'q33')}${prompt(ch,253,34,mode,'q34')}${prompt(ch,253,35,mode,'q35')}`,'v9-p253-energy');
    const plate=group('p253-plate-strip','source-strip',`${PLATE}${prompt(ch,253,36,mode,'q36')}`,'v9-p253-plate');
    const climate=group('p253-climate','group',`<div class="v9-ribbon orange climate-title">氣候變遷</div>${climateLeft}${energy}${plate}`,'v9-p253-climate');
    const cause=group('p253-cause','group',`<div class="v9-root cause-root">最常見成因：風吹拂海面</div>${prompt(ch,253,37,mode,'q37')}${group('p253-large-wind','group',`<div class="v9-large-wind-label"><span>固定方向、大範圍的風</span><b>信風與西風</b><span>季風</span></div>${prompt(ch,253,38,mode,'q38')}${prompt(ch,253,39,mode,'q39')}${prompt(ch,253,40,mode,'q40')}`,'v9-p253-large-wind')}`,'v9-p253-cause');
    const current=group('p253-current','group',`<div class="v9-root current-root">海流</div>${prompt(ch,253,41,mode,'q41')}${prompt(ch,253,42,mode,'q42')}`,'v9-p253-current');
    const near=group('p253-nearshore','group',`${prompt(ch,253,43,mode,'q43')}${prompt(ch,253,44,mode,'q44')}${prompt(ch,253,45,mode,'q45')}`,'v9-p253-nearshore');
    const wave=group('p253-wave','group',`<div class="v9-root wave-root">波浪</div><div class="v9-wave-label">任何外力作用均會形成波<br>當波浪傳抵近岸會因水深變淺</div>${near}`,'v9-p253-wave');
    const tide=group('p253-tide','group',`<div class="v9-root tide-root">潮汐</div>${[46,47,48,49,50].map(n=>prompt(ch,253,n,mode,`q${n}`)).join('')}`,'v9-p253-tide');
    const three=group('p253-three','group',`<div class="v9-three-title">3大海水運動</div>${current}${wave}${tide}`,'v9-p253-three');
    const ocean=group('p253-ocean-motion','group',`<div class="v9-ribbon green oceanmotion-title">海水運動</div>${p253BranchSvg()}${cause}${three}`,'v9-p253-ocean-motion');
    return pageShell(253,`${climate}${ocean}`);
  }

  function annotate(html,page){
    const h=window.SOURCE_HIERARCHY_V9?.[page];if(!h)return html;
    const t=document.createElement('template');t.innerHTML=html;
    const sec=t.content.querySelector(`[data-strict-page="${page}"]`);if(!sec)return html;
    sec.dataset.sourceHierarchyVersion='9';sec.dataset.sourceOwnedPage=String(page);sec.dataset.sourceOwner=h.rootId;
    for(const q of sec.querySelectorAll('[data-question]')){const n=Number(q.dataset.question),parent=window.v9SourceParentFor?.(page,n)||h.rootId;q.dataset.parentId=parent;q.dataset.sourceOwner=parent;q.dataset.sourceRole='text-row';}
    for(const [id,node] of Object.entries(h.nodes)){if(id===h.rootId)continue;sec.querySelectorAll(`[data-source-object="${id}"]`).forEach(el=>{el.dataset.parentId=node.parentId||h.rootId;el.dataset.containerKind=node.containerKind||'none';});}
    return t.innerHTML;
  }
  const prev=window.v5PageHtml;if(typeof prev!=='function')return;
  window.v5PageHtml=function(ch,sem,page,mode){if(page===252)return page252(ch,mode);if(page===253)return page253(ch,mode);return annotate(prev(ch,sem,page,mode),page);};
  window.V9_SOURCE_RENDERER_ACTIVE=true;
  if(typeof window.render==='function')window.render();
})();