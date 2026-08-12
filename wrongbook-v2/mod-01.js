const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const API_BASE='https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1/wrongbook-ai';
const COMMUNITY_BASE='https://rfpkznuntzxfoeeavwwf.supabase.co/functions/v1/wrongbook-community';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_Nt8ik0KBWLdi8hucG9oDRQ_cnMyQ9Gx';

const iconPaths={
 home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/>',
 notebook:'<path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2V3Z"/><path d="M9 3v18"/><path d="M12 7h4M12 11h4"/>',
 map:'<circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M12 7v4M12 11 6 16M12 11l6 5"/>',
 brain:'<path d="M9.5 4.5A3.5 3.5 0 0 0 6 8v1a3 3 0 0 0-1 5.8A3.5 3.5 0 0 0 9 20"/><path d="M14.5 4.5A3.5 3.5 0 0 1 18 8v1a3 3 0 0 1 1 5.8A3.5 3.5 0 0 1 15 20"/><path d="M12 4v16"/><path d="M8 9h4M12 14h4"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/><path d="m8 15 2 2 5-5"/>',
 spark:'<path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3Z"/><path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8Z"/>',
 chat:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4A8 8 0 1 1 21 15Z"/>',
 pen:'<path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10Z"/><path d="m13.5 8.5 3 3"/>',
 chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
 camera:'<path d="M14.5 5 13 3h-2L9.5 5H5a2 2 0 0 0-2 2v11h18V7a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="4"/>',
 share:'<circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
 note:'<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 download:'<path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/>',
 upload:'<path d="M12 21V9M7 14l5-5 5 5"/><path d="M5 3h14"/>'
};
function icon(name){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||iconPaths.spark}</svg>`}
function esc(s=''){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function uid(prefix='p'){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function todayISO(){return new Date().toISOString().slice(0,10)}
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2400)}
function storageGet(k){try{return localStorage.getItem(k)}catch{return null}}
function storageSet(k,v){try{localStorage.setItem(k,v)}catch{}}
function save(){storageSet('wrongbook-v2-state',JSON.stringify(state))}
function subjectStyle(id){const s=SUBJECTS.find(x=>x.id===id)||SUBJECTS[0];return `--subject-color:${s.color};--subject-bg:${s.bg}`}
function subjectById(id){return SUBJECTS.find(x=>x.id===id)||SUBJECTS[0]}
function subjectIdFromText(text=''){const t=String(text).toLowerCase();for(const s of SUBJECTS){if(t.includes(s.name.toLowerCase())||s.aliases.some(a=>t.includes(a)))return s.id}return 'physics'}

const SUBJECTS=[
 {id:'chinese',name:'國文',symbol:'文',color:'#a46d27',bg:'#fff5e8',aliases:['國語','chinese'],chapters:['字詞與語意','修辭與句法','文言文閱讀','現代文閱讀','論證與觀點','國學常識','寫作與表達']},
 {id:'english',name:'英文',symbol:'E',color:'#b85db6',bg:'#fff0fe',aliases:['英語','english'],chapters:['字彙與搭配','文法與句型','克漏字','篇章結構','閱讀理解','翻譯','寫作']},
 {id:'math',name:'數學',symbol:'∑',color:'#5c5ee6',bg:'#f0f0ff',aliases:['math'],chapters:['數與式','多項式與函數','指數與對數','三角比與三角函數','直線與圓','數列與級數','排列組合與機率','統計','向量與矩陣','微積分概念']},
 {id:'physics',name:'物理',symbol:'↗',color:'#3f77d8',bg:'#eef5ff',aliases:['physics','理化'],chapters:['運動學','牛頓運動定律','功與能','動量與碰撞','圓周運動與萬有引力','振動與波','熱學','電場與電路','磁場與電磁感應','幾何光學','近代物理']},
 {id:'chemistry',name:'化學',symbol:'⚗',color:'#d57f2a',bg:'#fff5e9',aliases:['chemistry','理化'],chapters:['原子結構','週期性','化學鍵','化學計量','氣體','溶液','熱化學','反應速率','化學平衡','酸鹼平衡','氧化還原','有機化學']},
 {id:'biology',name:'生物',symbol:'葉',color:'#2e9a60',bg:'#ecf9f1',aliases:['biology'],chapters:['細胞構造','細胞呼吸與光合作用','遺傳物質','細胞分裂','孟德爾遺傳','分子遺傳','演化','生態系','植物生理','動物生理','免疫與恆定']},
 {id:'earth',name:'地科',symbol:'◎',color:'#3489a0',bg:'#ecf9fc',aliases:['地球科學','earth'],chapters:['宇宙與天文','地球內部','板塊與地質作用','地質年代','大氣與天氣','氣候系統','海洋','天然災害','地球環境變遷']},
 {id:'history',name:'歷史',symbol:'史',color:'#c26349',bg:'#fff1ed',aliases:['history'],chapters:['臺灣史','東亞史','中國史','世界史','近代國家形成','帝國主義與全球化','戰爭與冷戰','當代世界']},
 {id:'geography',name:'地理',symbol:'圖',color:'#4d9a81',bg:'#eefaf6',aliases:['geography'],chapters:['地圖與 GIS','地形','氣候','水文與生態','人口','都市與聚落','產業','區域地理','全球化與環境']},
 {id:'civics',name:'公民',symbol:'法',color:'#8a68c8',bg:'#f6f0ff',aliases:['公民與社會','civics','社會'],chapters:['社會與文化','媒體與公共意見','法律基本概念','權利與救濟','政府與政治','民主參與','市場與價格','總體經濟','國際關係與全球化']}
];
