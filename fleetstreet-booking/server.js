const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'requests.json');
const asahikariDataFile = path.join(dataDir, 'asahikari-requests.json');
const linhanweiDataFile = path.join(dataDir, 'linhanwei-requests.json');
const asahikariPublic = path.join(__dirname, '..', 'asahikari-booking', 'public');
const linhanweiPublic = path.join(__dirname, '..', 'linhanwei-art-booking', 'public');

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/asahikari', express.static(asahikariPublic));
app.use('/linhanwei', express.static(linhanweiPublic));

const purposes = new Set(['空間包場諮詢','讀書會／小型活動','品牌合作／拍攝','其他需求']);
const times = new Set(['09:30','11:30','14:00','16:00']);
const asahikariRequestTypes = new Set(['親子活動／說故事','團體參訪','講座／手作活動','場地／活動合作','品牌／內容合作','其他需求']);
const asahikariTimeRanges = new Set(['上午','下午','傍晚','彈性皆可']);
const linhanweiRequestTypes = new Set(['陶藝／釉下彩體驗','客製白瓷印章','團體藝術課程／講座','展覽／品牌／異業合作','作品／商品詢問','其他需求']);

function ensureStore(file=dataFile){
  fs.mkdirSync(dataDir,{recursive:true});
  if(!fs.existsSync(file)) fs.writeFileSync(file,'[]','utf8');
}
function readRows(file=dataFile){
  ensureStore(file);
  try { const v=JSON.parse(fs.readFileSync(file,'utf8')); return Array.isArray(v)?v:[]; }
  catch { return []; }
}
function writeRows(rows,file=dataFile){ ensureStore(file); fs.writeFileSync(file,JSON.stringify(rows,null,2),'utf8'); }
function clean(v,max=160){ return String(v||'').trim().slice(0,max); }
function todayTW(){
  const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const g=t=>p.find(x=>x.type===t)?.value;
  return `${g('year')}-${g('month')}-${g('day')}`;
}
function isValidDate(s){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d=new Date(`${s}T00:00:00+08:00`);
  return !Number.isNaN(d.getTime()) && s>=todayTW();
}

async function pushLine(token,owner,text,label='LINE'){
  if(!token||!owner) return {sent:false,reason:'not_configured'};
  const r=await fetch('https://api.line.me/v2/bot/message/push',{
    method:'POST',
    headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
    body:JSON.stringify({to:owner,messages:[{type:'text',text}]})
  });
  if(!r.ok) throw new Error(`${label} push failed: ${r.status} ${(await r.text()).slice(0,200)}`);
  return {sent:true};
}

async function sendLine(row){
  const text=[
    '☕ Fleet Street｜新空間預約需求',
    `姓名：${row.name}`,
    `電話：${row.phone}`,
    `需求：${row.purpose}`,
    `日期：${row.date}`,
    `希望時段：${row.time}`,
    `人數：${row.people}`,
    row.email?`Email：${row.email}`:null,
    row.note?`備註：${row.note}`:null,
    `編號：${row.id}`
  ].filter(Boolean).join('\n');
  return pushLine(process.env.LINE_CHANNEL_ACCESS_TOKEN,process.env.LINE_OWNER_USER_ID,text,'Fleet Street LINE');
}

async function sendAsahikariLine(row){
  const text=[
    '📚 晨熹社｜新活動／合作需求',
    `聯絡人：${row.name}`,
    `電話：${row.phone}`,
    row.email?`Email：${row.email}`:null,
    `類型：${row.requestType}`,
    `希望日期：${row.date}`,
    `時段：${row.timeRange}`,
    row.people?`人數：約 ${row.people} 人`:null,
    row.childAge?`孩童年齡：${row.childAge}`:null,
    row.note?`需求：${row.note}`:null,
    `編號：${row.id}`,
    '※ 此為需求申請，仍需店家確認後才成立。'
  ].filter(Boolean).join('\n');
  return pushLine(process.env.ASAHIKARI_LINE_CHANNEL_ACCESS_TOKEN,process.env.ASAHIKARI_LINE_OWNER_USER_ID,text,'ASAHIKARI LINE');
}

async function sendLinHanWeiLine(row){
  const text=[
    '🎨 林函葦藝術工作室｜新課程／客製需求',
    `聯絡人：${row.name}`,
    `Email：${row.email}`,
    row.phone?`電話：${row.phone}`:null,
    `需求：${row.requestType}`,
    row.date?`希望日期：${row.date}`:null,
    row.people?`人數：約 ${row.people} 人`:null,
    `內容：${row.note}`,
    `編號：${row.id}`,
    '※ 此為需求申請，實際內容、日期與價格仍需工作室確認。'
  ].filter(Boolean).join('\n');
  return pushLine(process.env.LINHANWEI_LINE_CHANNEL_ACCESS_TOKEN,process.env.LINHANWEI_LINE_OWNER_USER_ID,text,'Lin Han Wei LINE');
}

app.get('/api/health',(_req,res)=>res.json({ok:true,service:'fleetstreet-booking',asahikariMounted:true,linhanweiMounted:true}));
app.get('/api/availability',(req,res)=>{
  const date=clean(req.query.date,10);
  if(!isValidDate(date)) return res.status(400).json({ok:false,error:'invalid_date'});
  const rows=readRows();
  const counts={};
  rows.filter(r=>r.date===date).forEach(r=>counts[r.time]=(counts[r.time]||0)+1);
  res.json({ok:true,date,available:[...times].filter(t=>(counts[t]||0)<2)});
});
app.post('/api/book',async(req,res)=>{
  const name=clean(req.body.name,50);
  const phone=clean(req.body.phone,30);
  const email=clean(req.body.email,120);
  const purpose=clean(req.body.purpose,40);
  const date=clean(req.body.date,10);
  const time=clean(req.body.time,5);
  const people=Number(req.body.people);
  const note=clean(req.body.note,500);

  if(name.length<2) return res.status(400).json({ok:false,error:'name_required'});
  if(!/^[0-9+()\-\s]{8,20}$/.test(phone)) return res.status(400).json({ok:false,error:'invalid_phone'});
  if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ok:false,error:'invalid_email'});
  if(!purposes.has(purpose)) return res.status(400).json({ok:false,error:'invalid_purpose'});
  if(!isValidDate(date)||!times.has(time)) return res.status(400).json({ok:false,error:'invalid_slot'});
  if(!Number.isInteger(people)||people<1||people>60) return res.status(400).json({ok:false,error:'invalid_people'});

  const rows=readRows();
  if(rows.filter(r=>r.date===date&&r.time===time).length>=2) return res.status(409).json({ok:false,error:'slot_full'});

  const row={id:`FS-${Date.now().toString(36).toUpperCase()}`,name,phone,email,purpose,date,time,people,note,createdAt:new Date().toISOString()};
  rows.push(row); writeRows(rows);

  let line={sent:false,reason:'not_configured'};
  try { line=await sendLine(row); } catch(e){ console.error(e.message); }
  res.status(201).json({ok:true,booking:{id:row.id,purpose,date,time,people},lineNotification:line.sent});
});

app.get('/asahikari/api/health',(_req,res)=>res.json({ok:true,service:'asahikari-booking'}));
app.post(['/api/request','/asahikari/api/request'],async(req,res)=>{
  const name=clean(req.body.name,50);
  const phone=clean(req.body.phone,30);
  const email=clean(req.body.email,120);
  const requestType=clean(req.body.requestType,40);
  const date=clean(req.body.date,10);
  const timeRange=clean(req.body.timeRange,20);
  const peopleRaw=clean(req.body.people,4);
  const childAge=clean(req.body.childAge,60);
  const note=clean(req.body.note,500);

  if(name.length<2) return res.status(400).json({ok:false,error:'name_required'});
  if(!/^[0-9+()\-\s]{8,20}$/.test(phone)) return res.status(400).json({ok:false,error:'invalid_phone'});
  if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ok:false,error:'invalid_email'});
  if(!asahikariRequestTypes.has(requestType)) return res.status(400).json({ok:false,error:'invalid_request_type'});
  if(!isValidDate(date)) return res.status(400).json({ok:false,error:'invalid_date'});
  if(!asahikariTimeRanges.has(timeRange)) return res.status(400).json({ok:false,error:'invalid_time_range'});

  let people=null;
  if(peopleRaw){
    people=Number(peopleRaw);
    if(!Number.isInteger(people)||people<1||people>200) return res.status(400).json({ok:false,error:'invalid_people'});
  }

  const row={id:`AH-${Date.now().toString(36).toUpperCase()}`,name,phone,email,requestType,date,timeRange,people,childAge,note,status:'pending_confirmation',createdAt:new Date().toISOString()};
  const rows=readRows(asahikariDataFile); rows.push(row); writeRows(rows,asahikariDataFile);

  let line={sent:false,reason:'not_configured'};
  try { line=await sendAsahikariLine(row); } catch(e){ console.error(e.message); }
  res.status(201).json({ok:true,request:{id:row.id,requestType,date,status:row.status},lineNotification:line.sent,message:'需求已送出，待店家確認後才成立。'});
});

app.get('/linhanwei/api/health',(_req,res)=>res.json({ok:true,service:'linhanwei-art-booking'}));
app.post('/linhanwei/api/request',async(req,res)=>{
  const name=clean(req.body.name,50);
  const email=clean(req.body.email,120);
  const phone=clean(req.body.phone,30);
  const requestType=clean(req.body.requestType,40);
  const date=clean(req.body.date,10);
  const peopleRaw=clean(req.body.people,4);
  const note=clean(req.body.note,800);

  if(name.length<2) return res.status(400).json({ok:false,error:'name_required'});
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ok:false,error:'invalid_email'});
  if(phone && !/^[0-9+()\-\s]{8,20}$/.test(phone)) return res.status(400).json({ok:false,error:'invalid_phone'});
  if(!linhanweiRequestTypes.has(requestType)) return res.status(400).json({ok:false,error:'invalid_request_type'});
  if(date && !isValidDate(date)) return res.status(400).json({ok:false,error:'invalid_date'});
  if(note.length<5) return res.status(400).json({ok:false,error:'note_required'});

  let people=null;
  if(peopleRaw){
    people=Number(peopleRaw);
    if(!Number.isInteger(people)||people<1||people>200) return res.status(400).json({ok:false,error:'invalid_people'});
  }

  const row={id:`LHW-${Date.now().toString(36).toUpperCase()}`,name,email,phone,requestType,date:date||null,people,note,status:'pending_confirmation',createdAt:new Date().toISOString()};
  const rows=readRows(linhanweiDataFile); rows.push(row); writeRows(rows,linhanweiDataFile);

  let line={sent:false,reason:'not_configured'};
  try { line=await sendLinHanWeiLine(row); } catch(e){ console.error(e.message); }
  res.status(201).json({ok:true,request:{id:row.id,requestType,status:row.status},lineNotification:line.sent,message:'需求已送出，待工作室確認後才成立。'});
});

app.use((_req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(port,'0.0.0.0',()=>console.log(`Fleet Street booking listening on ${port}; Asahikari mounted at /asahikari; LinHanWei mounted at /linhanwei`));
