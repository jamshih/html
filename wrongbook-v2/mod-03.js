const defaultSyllabus={level:'高中',grade:'高二',publishers:{chinese:'龍騰',english:'龍騰',math:'南一',physics:'龍騰',chemistry:'翰林',biology:'龍騰',earth:'龍騰',history:'翰林',geography:'翰林',civics:'南一'}};
const initial={page:'home',subject:'biology',selectedProblemId:'bio-1',problems:SEED_PROBLEMS,syllabus:defaultSyllabus,scan:null,scanStudent:[],scanCorrect:[],scanConfirmed:false,scanImage:'',scanBase64:'',scanMime:'image/jpeg',aiLoading:false,aiError:'',tutor:null,annotations:[],reviewMode:'problem',reviewSelections:[],reviewChecked:false,mindAnswers:{},mindHints:{},notes:[],community:[],communityLoading:false,mobileMenu:false,ink:{},aiOnline:null,search:''};
let loaded={};try{loaded=JSON.parse(storageGet('wrongbook-v2-state')||'{}')}catch{}
let state={...initial,...loaded,syllabus:{...defaultSyllabus,...(loaded.syllabus||{}),publishers:{...defaultSyllabus.publishers,...(loaded.syllabus?.publishers||{})}},problems:Array.isArray(loaded.problems)&&loaded.problems.length?loaded.problems:SEED_PROBLEMS};

const NAV=[['home','今天','home'],['notebook','我的錯題','notebook'],['concepts','各科概念','brain'],['mindmap','心智題','map'],['review','複習計畫','calendar'],['tutor','AI 家教','spark'],['community','社群討論','chat'],['notes','我的筆記','note'],['analytics','弱點分析','chart'],['settings','設定','settings']];

async function apiCall(path,body){
  const res=await fetch(API_BASE+path,{method:'POST',headers:{'content-type':'application/json','apikey':SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(body)});
  const data=await res.json().catch(()=>({error:'invalid_response'}));
  if(!res.ok) throw new Error(data.detail||data.error||('HTTP '+res.status));
  return data;
}
async function communityGet(subject='',concept=''){
  const u=new URL(COMMUNITY_BASE);if(subject)u.searchParams.set('subject',subject);if(concept)u.searchParams.set('concept',concept);
  const res=await fetch(u,{headers:{apikey:SUPABASE_PUBLISHABLE_KEY}});const data=await res.json();if(!res.ok)throw new Error(data.error||'community_error');return data.posts||[];
}
async function communityPost(body){
  const res=await fetch(COMMUNITY_BASE,{method:'POST',headers:{'content-type':'application/json',apikey:SUPABASE_PUBLISHABLE_KEY},body:JSON.stringify(body)});const data=await res.json();if(!res.ok)throw new Error(data.error||'community_error');return data;
}
async function imageFileToData(file,maxSide=1700,quality=.84){
  const url=URL.createObjectURL(file);const img=new Image();img.src=url;await img.decode();let w=img.naturalWidth,h=img.naturalHeight;const scale=Math.min(1,maxSide/Math.max(w,h));w=Math.round(w*scale);h=Math.round(h*scale);const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);URL.revokeObjectURL(url);const dataUrl=c.toDataURL('image/jpeg',quality);return{dataUrl,base64:dataUrl.split(',')[1],mimeType:'image/jpeg'};
}
function activeSubject(){return subjectById(state.subject)}
function problemById(id){return state.problems.find(p=>p.id===id)}
function selectedProblem(){return problemById(state.selectedProblemId)||state.problems[0]}
function problemCount(subjectId){return state.problems.filter(p=>p.subject===subjectId).length}
function subjectMastery(subjectId){const ps=state.problems.filter(p=>p.subject===subjectId);if(!ps.length)return 0;return Math.round(ps.reduce((a,p)=>a+(p.mastery||50),0)/ps.length)}
function dueProblems(){return [...state.problems].sort((a,b)=>dueRank(a.due)-dueRank(b.due)).slice(0,7)}
function dueRank(d){return d==='今天'?0:d==='明天'?1:parseInt(d)||9}
function mistakeCount(){return state.problems.reduce((a,p)=>a+(p.attempts||1),0)}
function totalMastery(){return Math.round(SUBJECTS.reduce((a,s)=>a+subjectMastery(s.id),0)/SUBJECTS.length)}
function activePublisher(subjectId=state.subject){return state.syllabus.publishers?.[subjectId]||'尚未設定'}
function getCorrectedTruths(p){return Object.values(p?.corrections||{}).filter(Boolean)}

function shell(){
  return `<div class="app-shell">
    ${sidebar()}
    <main class="main">
      <header class="topbar">
        <div class="topbar-left"><button class="icon-btn mobile-menu-btn" data-action="toggleMenu">${icon('menu')}</button><div class="crumb">${crumb()}</div></div>
        <div class="topbar-actions"><div class="ai-status"><span class="ai-dot ${state.aiLoading?'loading':''}"></span>${state.aiOnline===false?'AI 連線待確認':state.aiLoading?'AI 分析中':'AI 已連線'}</div><button class="ghost-btn" data-action="share">${icon('share')} 分享</button><button class="icon-btn" data-page="settings" aria-label="設定">${icon('settings')}</button></div>
      </header>
      <section class="content">${page()}</section>
    </main>
    ${mobileNav()}
    ${mobileDrawer()}
  </div>`;
}
function sidebar(){
  return `<aside class="sidebar">
    <div class="brand"><div class="brand-mark">錯</div><div><h1>錯題本</h1><small>AI learning workspace</small></div></div>
    <button class="capture-btn" data-action="capture">＋ 掃描 / 新題目</button>
    <nav class="nav">${NAV.map(([p,l,i])=>`<button class="nav-btn ${state.page===p?'active':''}" data-page="${p}">${icon(i)}<span>${l}</span></button>`).join('')}</nav>
    <div class="sidebar-section-title">正在學習</div>
    <div class="sidebar-subjects">${SUBJECTS.slice(0,7).map(s=>`<button class="subject-mini ${state.subject===s.id?'active':''}" data-subject="${s.id}" style="${subjectStyle(s.id)}"><span class="dot">${s.symbol}</span><span>${s.name}</span><span class="count">${problemCount(s.id)}</span></button>`).join('')}<button class="subject-mini" data-page="concepts"><span class="dot">＋</span><span>全部科目</span><span class="count">10</span></button></div>
    <div class="profile-card"><div class="profile-row"><div class="avatar">林</div><div><strong>林大同</strong><small>${esc(state.syllabus.grade)} · ${esc(state.syllabus.level)}</small></div></div><div class="profile-streak">連續學習 12 天 🔥</div></div>
  </aside>`;
}
function mobileNav(){const items=[['home','今天','home'],['notebook','錯題','notebook'],['capture','掃描','camera'],['review','複習','calendar'],['more','更多','menu']];return `<div class="mobile-nav">${items.map(([p,l,i])=>p==='capture'?`<button class="capture-mobile" data-action="capture">${icon(i)}<span>${l}</span></button>`:p==='more'?`<button data-action="toggleMenu">${icon(i)}<span>${l}</span></button>`:`<button class="${state.page===p?'active':''}" data-page="${p}">${icon(i)}<span>${l}</span></button>`).join('')}</div>`}
function mobileDrawer(){return `<div class="mobile-drawer ${state.mobileMenu?'open':''}" data-action="closeMenu"><div class="mobile-drawer-panel" onclick="event.stopPropagation()"><div class="brand"><div class="brand-mark">錯</div><div><h1>錯題本</h1><small>全部功能</small></div></div><nav class="nav">${NAV.map(([p,l,i])=>`<button class="nav-btn ${state.page===p?'active':''}" data-page="${p}">${icon(i)}<span>${l}</span></button>`).join('')}</nav></div></div>`}
function crumb(){const n=NAV.find(x=>x[0]===state.page)?.[1]||'';const p=selectedProblem();if(state.page==='notebook'&&p)return `我的錯題 / ${subjectById(p.subject).name} / ${esc(p.concept)}`;if(['concepts','mindmap'].includes(state.page))return `${n} / ${activeSubject().name}`;return n}
function page(){switch(state.page){case'home':return homePage();case'notebook':return notebookPage();case'concepts':return conceptsPage();case'mindmap':return mindmapPage();case'review':return reviewPage();case'tutor':return tutorPage();case'community':return communityPage();case'notes':return notesPage();case'analytics':return analyticsPage();case'settings':return settingsPage();default:return homePage()}}
function subjectTabs(){return `<div class="subject-tabs">${SUBJECTS.map(s=>`<button class="subject-tab ${state.subject===s.id?'active':''}" data-subject="${s.id}" style="${subjectStyle(s.id)}"><span class="subject-symbol">${s.symbol}</span>${s.name}</button>`).join('')}</div>`}

function homePage(){
  const due=dueProblems();
  const weakest=[...SUBJECTS].sort((a,b)=>subjectMastery(a.id)-subjectMastery(b.id)).slice(0,5);
  return `<div class="page-head"><div><h2>今天，把錯的真的改會</h2><p>原題可以重做；錯誤敘述會被你修成正確版本，再安排回來複習。</p></div><div class="page-actions"><button class="soft-btn" data-page="review">今天的複習</button><button class="primary-btn" data-action="capture">${icon('camera')} 掃描新題目</button></div></div>
  <div class="hero-grid"><div class="stack"><section class="panel"><div class="stat-strip"><div class="stat-card"><strong>${state.problems.length}</strong><span>錯題</span></div><div class="stat-card"><strong>${mistakeCount()}</strong><span>錯誤事件</span></div><div class="stat-card"><strong>${totalMastery()}%</strong><span>平均掌握</span></div><div class="stat-card"><strong>${Object.keys(state.mindHints||{}).length}</strong><span>需要提示節點</span></div></div></section>
  <section><div class="section-title"><h3>各科學習狀況</h3><small>點一科進去</small></div><div class="subject-grid">${SUBJECTS.map(s=>`<button class="subject-card ${state.subject===s.id?'active':''}" data-subject="${s.id}" data-page-after-subject="notebook" style="${subjectStyle(s.id)}"><div class="subject-card-top"><div class="subject-badge">${s.symbol}</div><div><strong>${s.name}</strong><small>${problemCount(s.id)} 題錯題</small></div></div><div class="progress"><span style="width:${subjectMastery(s.id)}%"></span></div><small>掌握 ${subjectMastery(s.id)}%</small></button>`).join('')}</div></section>
  <section class="panel"><div class="panel-head"><h3>最近的錯題</h3><button class="text-btn" data-page="notebook">看全部</button></div><div class="list">${state.problems.slice(0,6).map(problemRow).join('')}</div></section></div>
  <aside class="stack"><section class="panel"><div class="panel-head"><h3>即將複習</h3><span class="meta">依你的錯誤頻率</span></div><div class="list">${due.map(problemRow).join('')}</div></section><section class="panel"><div class="panel-head"><h3>最弱概念</h3></div><div class="weakness-bars">${weakest.map(s=>`<div class="bar-row" style="${subjectStyle(s.id)}"><span>${s.name}</span><div class="bar"><span style="width:${subjectMastery(s.id)}%"></span></div><strong>${subjectMastery(s.id)}%</strong></div>`).join('')}</div><div class="callout" style="margin:0 14px 14px">不是只數錯題。提示使用、重做表現、自己能不能把錯誤敘述改對，都會影響掌握度。</div></section></aside></div>`;
}
function problemRow(p){const s=subjectById(p.subject);return `<div class="list-row" data-problem="${p.id}" style="${subjectStyle(p.subject)}"><div class="subject-icon">${s.symbol}</div><div><strong>${esc(p.title)}</strong><small>${s.name} · ${esc(p.chapter)} · ${p.attempts||1} 次錯誤</small></div><span class="due ${p.due==='今天'?'red':''}">${esc(p.due||'待排')}</span></div>`}
