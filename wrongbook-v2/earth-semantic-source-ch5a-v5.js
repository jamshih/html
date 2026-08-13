// Page 250–251 source-semantic chains: saturation and rising air.
const v5C5a=EARTH_SEMANTIC_MAPS.find(c=>c.number===5);
if(v5C5a){
 v5Micro(v5C5a,'add-water-vapor',250,'增加水氣',388,625,92,'#5b84b6');
 v5Micro(v5C5a,'lower-temperature',250,'降低溫度',388,670,92,'#5b84b6');
 v5Micro(v5C5a,'dew-point',250,'露點',505,670,70,'#5b84b6');
 v5Rel(v5C5a,'c5-src-250-1',250,'add-water-vapor','reach-saturation','results-in','溫度固定時增加水氣，可使空氣達到飽和。','#5b84b6');
 v5Rel(v5C5a,'c5-src-250-2',250,'lower-temperature','dew-point','results-in','水氣量固定時降溫至露點，空氣達到飽和。','#5b84b6');
 v5Rel(v5C5a,'c5-src-250-3',250,'dew-point','reach-saturation','results-in','到達露點表示目前水氣量對該溫度已飽和。','#5b84b6');
 v5Micro(v5C5a,'air-rises',251,'空氣上升',180,345,92,'#d4853e');
 v5Micro(v5C5a,'pressure-falls',251,'外界氣壓下降',180,390,112,'#d4853e');
 v5Micro(v5C5a,'parcel-expands',251,'氣塊膨脹',180,435,92,'#d4853e');
 v5Micro(v5C5a,'parcel-cools',251,'氣塊降溫',180,480,92,'#d4853e');
 v5Micro(v5C5a,'condensation',251,'凝結',290,480,70,'#d4853e');
 v5Micro(v5C5a,'cloud-rain',251,'成雲致雨',290,435,92,'#d4853e');
 v5Rel(v5C5a,'c5-src-rise-1',251,'vertical-motion','air-rises','contains','垂直運動包含上升氣流。','#d4853e');
 v5Rel(v5C5a,'c5-src-rise-2',251,'air-rises','pressure-falls','results-in','空氣上升到較高處時外界氣壓降低。','#d4853e');
 v5Rel(v5C5a,'c5-src-rise-3',251,'pressure-falls','parcel-expands','causes','外界氣壓降低使氣塊膨脹。','#d4853e');
 v5Rel(v5C5a,'c5-src-rise-4',251,'parcel-expands','parcel-cools','causes','氣塊絕熱膨脹時溫度下降。','#d4853e');
 v5Rel(v5C5a,'c5-src-rise-5',251,'parcel-cools','condensation','results-in','氣塊降溫至飽和後水氣開始凝結。','#d4853e');
 v5Rel(v5C5a,'c5-src-rise-6',251,'condensation','cloud-rain','results-in','凝結形成雲滴，條件足夠時形成降雨。','#d4853e');
}
