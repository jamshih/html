const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'requests.json');

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const services = new Set(['花束預訂','蘭花／盆花','開幕花禮','會場布置','其他需求']);
const fulfillment = new Set(['到店取花','外送需求','先諮詢']);
const times = new Set(['10:00','11:30','13:00','14:30','16:00','17:30']);

function ensureStore(){fs.mkdirSync(dataDir,{recursive:true});if(!fs.existsSync(dataFile))fs.writeFileSync(dataFile,'[]','utf8');}
function readRows(){ensureStore();try{const v=JSON.parse(fs.readFileSync(dataFile,'utf8'));return Array.isArray(v)?v:[]}catch{return[]}}
function writeRows(rows){ensureStore();fs.writeFileSync(dataFile,JSON.stringify(rows,null,2),'utf8')}
function clean(v,max=120){return String(v||'').trim().slice(0,max)}
function todayTW(){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const g=t=>p.find(x=>x.type===t)?.value;return `${g('year')}-${g('month')}-${g('day')}`}
function isSunday(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const [y,m,d]=s.split('-').map(Number);return new Date(Date.UTC(y,m-1,d)).getUTCDay()===0}
function isValidDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(`${s}T00:00:00+08:00`);return !Number.isNaN(d.getTime())&&s>=todayTW()&&!isSunday(s)}

async function sendLine(row){
  const token=process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const owner=process.env.LINE_OWNER_USER_ID;
  if(!token||!owner)return {sent:false,reason:'not_configured'};
  const text=[
    '🌿 悟語花坊｜新花禮預約',
    `姓名：${row.name}`,
    `電話：${row.phone}`,
    `需求：${row.service}`,
    `方式：${row.fulfillment}`,
    `日期：${row.date}`,
    `時間：${row.time}`,
    row.budget?`預算：${row.budget}`:null,
    row.note?`備註：${row.note}`:null,
    `編號：${row.id}`
  ].filter(Boolean).join('\n');
  const r=await fetch('https://api.line.me/v2/bot/message/push',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({to:owner,messages:[{type:'text',text}]})});
  if(!r.ok)throw new Error(`LINE push failed: ${r.status} ${(await r.text()).slice(0,200)}`);
  return {sent:true};
}

app.get('/api/health',(_req,res)=>res.json({ok:true,service:'wuyu-flower-booking'}));
app.get('/api/availability',(req,res)=>{
  const date=clean(req.query.date,10);
  if(!isValidDate(date))return res.status(400).json({ok:false,error:isSunday(date)?'closed_sunday':'invalid_date'});
  const rows=readRows();
  const counts={};
  rows.filter(r=>r.date===date).forEach(r=>counts[r.time]=(counts[r.time]||0)+1);
  res.json({ok:true,date,available:[...times].filter(t=>(counts[t]||0)<3)});
});
app.post('/api/book',async(req,res)=>{
  const name=clean(req.body.name,50),phone=clean(req.body.phone,30),email=clean(req.body.email,120),service=clean(req.body.service,40),fulfill=clean(req.body.fulfillment,20),date=clean(req.body.date,10),time=clean(req.body.time,5),budget=clean(req.body.budget,30),note=clean(req.body.note,400);
  if(name.length<2)return res.status(400).json({ok:false,error:'name_required'});
  if(!/^[0-9+()\-\s]{8,20}$/.test(phone))return res.status(400).json({ok:false,error:'invalid_phone'});
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return res.status(400).json({ok:false,error:'invalid_email'});
  if(!services.has(service))return res.status(400).json({ok:false,error:'invalid_service'});
  if(!fulfillment.has(fulfill))return res.status(400).json({ok:false,error:'invalid_fulfillment'});
  if(!isValidDate(date)||!times.has(time))return res.status(400).json({ok:false,error:'invalid_slot'});
  const rows=readRows();
  if(rows.filter(r=>r.date===date&&r.time===time).length>=3)return res.status(409).json({ok:false,error:'slot_full'});
  const row={id:`WY-${Date.now().toString(36).toUpperCase()}`,name,phone,email,service,fulfillment:fulfill,date,time,budget,note,createdAt:new Date().toISOString()};
  rows.push(row);writeRows(rows);
  let line={sent:false,reason:'not_configured'};try{line=await sendLine(row)}catch(e){console.error(e.message)}
  res.status(201).json({ok:true,booking:{id:row.id,service,date,time},lineNotification:line.sent});
});
app.use((_req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(port,()=>console.log(`Wuyu flower booking listening on ${port}`));
