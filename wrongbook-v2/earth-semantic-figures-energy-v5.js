V5_RENDERERS['energy-balance']=()=>v5Svg(`<circle cx="55" cy="44" r="20" fill="#f4b43e" stroke="#cf8c1e"/><path d="M78 55L135 88" stroke="#e08a3a" stroke-width="5" marker-end="url(#v5arr)"/><text x="82" y="42" font-size="11">100%</text><path d="M142 91L187 54" stroke="#e2b44f" stroke-width="4" marker-end="url(#v5arr)"/><text x="170" y="48" font-size="10">約31%反射</text><path d="M145 96V142" stroke="#d67c55" stroke-width="4" marker-end="url(#v5arr)"/><text x="153" y="136" font-size="10">地表吸收</text><path d="M205 142V78" stroke="#c85b52" stroke-width="4" marker-end="url(#v5arr)"/><path d="M235 80V130" stroke="#c7857e" stroke-width="4" marker-end="url(#v5arr)"/><path d="M95 150Q170 126 278 150" fill="#d7c2a7" stroke="#9b7a5d"/><path d="M250 150V112" stroke="#6f99b2" stroke-width="4" marker-end="url(#v5arr)"/><rect x="243" y="151" width="40" height="10" fill="#9bc6dc"/><text x="198" y="72" font-size="10">地表向外</text><text x="236" y="105" font-size="10">回傳</text><text x="232" y="175" font-size="9">冰雪反照</text>`);

// Page 253 source branch: make the periodic sea-level cycle relationships explicit rather than leaving questions floating under one node.
const v5C6Cycle=EARTH_SEMANTIC_MAPS.find(c=>c.number===6);
if(v5C6Cycle){
 const N=(id,label,x,y,w=92)=>v5Micro(v5C6Cycle,id,253,label,x,y,w,'#5d9a6e');
 const E=(id,from,to,relation,reason)=>v5Rel(v5C6Cycle,id,253,from,to,relation,reason,'#5d9a6e');
 N('sea-level-forcing','日月共同作用',700,875,102);N('earth-spin-cycle','地球自轉',700,915,82);N('periodic-sea-level','週期性漲退',800,915,92);
 E('c6-cycle1','sea-level-forcing','periodic-sea-level','causes','日月共同作用提供海水週期變化的外力來源。');
 E('c6-cycle2','earth-spin-cycle','periodic-sea-level','causes','地球自轉使同一地點週期性經歷海面高低變化。');
 E('c6-cycle3','tides','periodic-sea-level','contains','潮汐是規律的海面週期變化。');
 N('lunar-daily-shift','月球每日東移約13°',690,960,126);N('daily-time-delay','次日約延後50分',690,1000,116);N('half-day-cycle','相鄰高潮約12h25m',690,1040,126);
 E('c6-cycle4','lunar-daily-shift','daily-time-delay','results-in','月球每日向東移，使次日相近潮位出現時間約延後五十分鐘。');
 E('c6-cycle5','tides','half-day-cycle','contains','半日潮相鄰兩次高潮的時間約十二小時二十五分。');
 N('large-range-cycle','大潮｜朔、望',815,960,88);N('small-range-cycle','小潮｜上、下弦',815,1000,98);
 E('c6-cycle6','tides','large-range-cycle','classified-into','朔與望附近潮差較大，屬大潮。');
 E('c6-cycle7','tides','small-range-cycle','classified-into','上弦與下弦附近潮差較小，屬小潮。');
}
