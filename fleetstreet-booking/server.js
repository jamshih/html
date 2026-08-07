const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'requests.json');

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const purposes = new Set(['空間包場諮詢','讀書會／小型活動','品牌合作／拍攝','其他需求']);
const times = new Set(['09:30','11:30','14:00','16:00']);

function ensureStore(){
  fs.mkdirSync(dataDir,{recursive:true});
  if(!fs.existsSync(dataFile)) fs.writeFileSync(dataFile,'[]','utf8');
}
function readRows(){
  ensureStore();
  try { const v=JSON.parse(fs.readFileSync(dataFile,'utf8')); return Array.isArray(v)?v:[]; }
  catch { return []; }
}
function writeRows(rows){ ensureStore(); fs.writeFileSync(dataFile,JSON.stringify(rows,null,2),'utf8'); }
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

async function sendLine(row){
  const token=process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const owner=process.env.LINE_OWNER_USER_ID;
  if(!token||!owner) return {sent:false,reason:'not_configured'};
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
  const r=await fetch('https://api.line.me/v2/bot/message/push',{
    method:'POST',
    headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
    body:JSON.stringify({to:owner,messages:[{type:'text',text}]})
  });
  if(!r.ok) throw new Error(`LINE push failed: ${r.status} ${(await r.text()).slice(0,200)}`);
  return {sent:true};
}

app.get('/api/health',(_req,res)=>res.json({ok:true,service:'fleetstreet-booking'}));
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

  const row={
    id:`FS-${Date.now().toString(36).toUpperCase()}`,
    name,phone,email,purpose,date,time,people,note,
    createdAt:new Date().toISOString()
  };
  rows.push(row);
  writeRows(rows);

  let line={sent:false,reason:'not_configured'};
  try { line=await sendLine(row); }
  catch(e){ console.error(e.message); }

  res.status(201).json({ok:true,booking:{id:row.id,purpose,date,time,people},lineNotification:line.sent});
});

app.use((_req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(port,()=>console.log(`Fleet Street booking listening on ${port}`));
