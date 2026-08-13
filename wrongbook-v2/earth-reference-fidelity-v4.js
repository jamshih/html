// Chapter-specific topology traced from the six photographed two-page spreads.
// This layer replaces generic cross-page curves with page-local workbook routes and junctions.

function v4RefSkPath(d,color,width=8,dash=''){return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${dash?`stroke-dasharray="${dash}"`:''}/>`}
function v4RefSkNode(x,y,color='#555',r=7){return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffdf5" stroke="${color}" stroke-width="3"/>`}
function v4RefSkArrow(x,y,color='#62666a',dir='right'){
 const rot={right:0,left:180,up:-90,down:90}[dir]||0;return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-15 -9L4 -9L4 -17L22 0L4 17L4 9L-15 9Z" fill="${color}" opacity=".92"/></g>`;
}
function v4RefSkeleton(ch){
 const p=[];
 if(ch.number===1){
   p.push(v4RefSkPath('M150 505 H520','#555f68',12));
   p.push(v4RefSkPath('M430 505 H760','#577eb7',12));
   p.push(v4RefSkPath('M735 505 H1010','#4b9b67',12));
   p.push(v4RefSkPath('M1005 505 H1360','#d4a12e',12));
   p.push(v4RefSkPath('M1350 505 H1635','#c85f73',12));p.push(v4RefSkArrow(1710,505,'#545a60'));
   p.push(v4RefSkNode(215,505),v4RefSkNode(505,505),v4RefSkNode(754,505),v4RefSkNode(1005,505),v4RefSkNode(1355,505),v4RefSkNode(1628,505));
   p.push(v4RefSkPath('M215 505 C190 445 165 400 130 350','#8d6eb2',5));
   p.push(v4RefSkPath('M505 505 C430 600 325 690 195 735','#577eb7',5));
   p.push(v4RefSkPath('M754 505 V790 H650 V1030','#4b9b67',5));
   p.push(v4RefSkPath('M1005 505 V885 H1115 V1070','#4b9b67',5));
   p.push(v4RefSkPath('M1260 505 C1250 420 1205 340 1140 280','#df8731',5));
   p.push(v4RefSkPath('M1510 505 C1530 650 1585 760 1695 860','#d4a12e',5));
  }else if(ch.number===2){
   p.push(v4RefSkPath('M140 285 H470 V450','#8a6caf',5));
   p.push(v4RefSkPath('M470 450 C585 500 665 565 760 665','#d8873b',5));
   p.push(v4RefSkPath('M760 665 V990','#597eb8',5));
   p.push(v4RefSkPath('M1080 260 V575 H1325','#d8873b',5));
   p.push(v4RefSkPath('M1325 575 C1430 630 1510 700 1590 800','#6aa36f',5));
   p.push(v4RefSkPath('M1110 820 H1240 V880 H1380 V940 H1530 V1000 H1715','#597eb8',14));p.push(v4RefSkArrow(1750,1000,'#597eb8'));
   [[140,285],[470,450],[760,665],[1080,260],[1325,575],[1110,820],[1240,880],[1380,940],[1530,1000]].forEach(([x,y])=>p.push(v4RefSkNode(x,y)));
  }else if(ch.number===3){
   p.push(v4RefSkPath('M130 275 H415','#df913a',5));p.push(v4RefSkArrow(455,275,'#df913a'));
   p.push(v4RefSkPath('M405 275 C500 350 570 430 625 540','#c85e63',5));
   p.push(v4RefSkPath('M625 540 V925','#5a9b68',5));
   p.push(v4RefSkPath('M1035 280 H1300','#8a6caf',5));
   p.push(v4RefSkPath('M1300 280 V665','#8a6caf',5));
   p.push(v4RefSkPath('M1110 750 H1370','#5b82b9',5));
   p.push(v4RefSkPath('M1370 750 V1040 H1635','#5b82b9',5));
   [[130,275],[405,275],[625,540],[1035,280],[1300,280],[1110,750],[1370,750]].forEach(([x,y])=>p.push(v4RefSkNode(x,y)));
  }else if(ch.number===4){
   p.push(v4RefSkPath('M135 285 H460','#ca6d54',5));
   p.push(v4RefSkPath('M460 285 V535 H690','#ca6d54',5));
   p.push(v4RefSkPath('M135 660 H420 V845','#d79b35',5));
   p.push(v4RefSkPath('M420 845 H760','#d79b35',5));
   p.push(v4RefSkPath('M1040 235 H1330 V505','#5c82bb',5));
   p.push(v4RefSkPath('M1330 505 V700','#5c82bb',5));
   p.push(v4RefSkPath('M1070 780 H1320 V1010 H1705','#5b9d67',5));p.push(v4RefSkArrow(1745,1010,'#5b9d67'));
   [[135,285],[460,285],[135,660],[420,845],[1040,235],[1330,505],[1070,780],[1320,1010]].forEach(([x,y])=>p.push(v4RefSkNode(x,y)));
  }else if(ch.number===5){
   p.push(v4RefSkPath('M150 230 H715','#5b82bb',5));
   p.push(v4RefSkPath('M210 365 V610','#5b82bb',5));
   p.push(v4RefSkPath('M210 610 H670','#5b82bb',5));
   p.push(v4RefSkPath('M150 750 H515 V1040','#5c87be',5));
   p.push(v4RefSkPath('M515 1040 H865','#5c87be',5));
   p.push(v4RefSkArrow(920,1040,'#5c87be'));
   p.push(v4RefSkPath('M1025 190 V1120','#5a9c67',5));
   p.push(v4RefSkPath('M1025 455 H1335','#5a9c67',5));
   p.push(v4RefSkPath('M1025 760 H1395','#5a9c67',5));
   p.push(v4RefSkPath('M1395 760 V980 H1715','#5a9c67',5));
   p.push(v4RefSkPath('M1025 1080 H1260','#d8873b',5));
   [[150,230],[210,610],[150,750],[515,1040],[1025,190],[1025,455],[1025,760],[1395,760],[1025,1080]].forEach(([x,y])=>p.push(v4RefSkNode(x,y)));
  }else if(ch.number===6){
   p.push(v4RefSkPath('M140 240 H485 V470 H760','#8a6caf',5));
   p.push(v4RefSkPath('M140 660 H420 V1040','#5b82bb',5));
   p.push(v4RefSkPath('M420 900 H760','#5b82bb',5));
   p.push(v4RefSkPath('M1040 230 H1380 V560 H1720','#d9893c',5));
   p.push(v4RefSkPath('M1040 760 H1335 V1070 H1710','#5a9d68',5));
   p.push(v4RefSkArrow(1750,1070,'#5a9d68'));
   [[140,240],[485,240],[140,660],[420,900],[1040,230],[1380,560],[1040,760],[1335,1070]].forEach(([x,y])=>p.push(v4RefSkNode(x,y)));
  }
 return `<svg class="v4ref-source-skeleton v4ref-global-lines" viewBox="0 0 ${V4REF_W} ${V4REF_H}" aria-hidden="true">${p.join('')}</svg>`;
}

v4RefZoneHtml=function(ch,z,mode){
 const n=z.items.length,cols=n>20?3:n>7?2:1;
 return `<section class="v4ref-zone" data-v4ref-zone="${v4RefEsc(z.id)}" style="--zone:${z.color};--item-count:${n};left:${z.x}px;top:${z.y}px;width:${z.w}px;height:${z.h}px">
   <header class="v4ref-ribbon">${v4RefEsc(z.title)}</header>
   <div class="v4ref-zone-diagram">${v4RefMiniDiagram(z.diagram)}</div>
   <div class="v4ref-zone-items" style="--cols:${cols}">${z.items.map(i=>v4RefItemHtml(ch,i,mode)).join('')}</div>
 </section>`;
};

v4RefCanvas=function(ch,mode){
 return `<div class="v4ref-stage"><div class="v4ref-canvas" data-v4ref-canvas="1" style="width:${V4REF_W}px;height:${V4REF_H}px">
   <div class="v4ref-paper v4ref-paper-left"></div><div class="v4ref-paper v4ref-paper-right"></div><div class="v4ref-gutter"></div>
   ${v4RefHeader(ch)}<div class="v4ref-right-page-label">地球科學 · 脈絡整合</div>${v4RefSkeleton(ch)}
   ${ch.zones.map(z=>v4RefZoneHtml(ch,z,mode)).join('')}
   <div class="v4ref-page-footer left">${ch.pages[0]}</div><div class="v4ref-page-footer right">${ch.pages[1]}</div>
 </div></div>`;
};

render();
