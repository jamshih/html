const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'requests.json');

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const requestTypes = new Set([
  '親子活動／說故事',
  '團體參訪',
  '講座／手作活動',
  '場地／活動合作',
  '品牌／內容合作',
  '其他需求'
]);

const timeRanges = new Set(['上午', '下午', '傍晚', '彈性皆可']);

function ensureStore() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '[]', 'utf8');
}

function readRows() {
  ensureStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRows(rows) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(rows, null, 2), 'utf8');
}

function clean(value, max = 120) {
  return String(value || '').trim().slice(0, max);
}

function todayTW() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const get = type => parts.find(x => x.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function validDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00+08:00`);
  return !Number.isNaN(parsed.getTime()) && date >= todayTW();
}

async function sendLine(row) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const owner = process.env.LINE_OWNER_USER_ID;
  if (!token || !owner) return { sent: false, reason: 'not_configured' };

  const text = [
    '📚 晨熹社｜新活動／合作需求',
    `聯絡人：${row.name}`,
    `電話：${row.phone}`,
    row.email ? `Email：${row.email}` : null,
    `類型：${row.requestType}`,
    `希望日期：${row.date}`,
    `時段：${row.timeRange}`,
    row.people ? `人數：約 ${row.people} 人` : null,
    row.childAge ? `孩童年齡：${row.childAge}` : null,
    row.note ? `需求：${row.note}` : null,
    `編號：${row.id}`,
    '※ 此為需求申請，仍需店家確認後才成立。'
  ].filter(Boolean).join('\n');

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      to: owner,
      messages: [{ type: 'text', text }]
    })
  });

  if (!response.ok) {
    throw new Error(`LINE push failed: ${response.status} ${(await response.text()).slice(0, 200)}`);
  }
  return { sent: true };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'asahikari-booking' });
});

app.post('/api/request', async (req, res) => {
  const name = clean(req.body.name, 50);
  const phone = clean(req.body.phone, 30);
  const email = clean(req.body.email, 120);
  const requestType = clean(req.body.requestType, 40);
  const date = clean(req.body.date, 10);
  const timeRange = clean(req.body.timeRange, 20);
  const peopleRaw = clean(req.body.people, 4);
  const childAge = clean(req.body.childAge, 60);
  const note = clean(req.body.note, 500);

  if (name.length < 2) return res.status(400).json({ ok: false, error: 'name_required' });
  if (!/^[0-9+()\-\s]{8,20}$/.test(phone)) return res.status(400).json({ ok: false, error: 'invalid_phone' });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: 'invalid_email' });
  if (!requestTypes.has(requestType)) return res.status(400).json({ ok: false, error: 'invalid_request_type' });
  if (!validDate(date)) return res.status(400).json({ ok: false, error: 'invalid_date' });
  if (!timeRanges.has(timeRange)) return res.status(400).json({ ok: false, error: 'invalid_time_range' });

  let people = null;
  if (peopleRaw) {
    people = Number(peopleRaw);
    if (!Number.isInteger(people) || people < 1 || people > 200) {
      return res.status(400).json({ ok: false, error: 'invalid_people' });
    }
  }

  const row = {
    id: `AH-${Date.now().toString(36).toUpperCase()}`,
    name,
    phone,
    email,
    requestType,
    date,
    timeRange,
    people,
    childAge,
    note,
    status: 'pending_confirmation',
    createdAt: new Date().toISOString()
  };

  const rows = readRows();
  rows.push(row);
  writeRows(rows);

  let line = { sent: false, reason: 'not_configured' };
  try {
    line = await sendLine(row);
  } catch (error) {
    console.error(error.message);
  }

  res.status(201).json({
    ok: true,
    request: {
      id: row.id,
      requestType: row.requestType,
      date: row.date,
      status: row.status
    },
    lineNotification: line.sent,
    message: '需求已送出，待店家確認後才成立。'
  });
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Asahikari booking listening on ${port}`);
});
