const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const bookings = [];
const allowedServices = new Set(['美甲', '美睫', '越式洗髮 SPA']);
const allowedTimes = new Set(['09:00','10:30','12:00','13:30','15:00','16:30','18:00','19:30','21:00']);

function clean(value, max = 120) {
  return String(value || '').trim().slice(0, max);
}

function todayInTaipei() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function isValidDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const parsed = new Date(`${dateString}T00:00:00+08:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  return dateString >= todayInTaipei();
}

async function sendLineNotification(booking) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const ownerUserId = process.env.LINE_OWNER_USER_ID;
  if (!token || !ownerUserId) return { sent: false, reason: 'not_configured' };

  const text = [
    '🔔 新預約',
    `姓名：${booking.name}`,
    `服務：${booking.service}`,
    `日期：${booking.date}`,
    `時間：${booking.time}`,
    `電話：${booking.phone}`,
    booking.note ? `備註：${booking.note}` : null,
    `預約編號：${booking.id}`
  ].filter(Boolean).join('\n');

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      to: ownerUserId,
      messages: [{ type: 'text', text }]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LINE push failed: ${response.status} ${body.slice(0, 300)}`);
  }

  return { sent: true };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'lingling-booking' });
});

app.get('/api/availability', (req, res) => {
  const date = clean(req.query.date, 10);
  if (!isValidDate(date)) {
    return res.status(400).json({ ok: false, error: 'invalid_date' });
  }
  const taken = bookings.filter((b) => b.date === date).map((b) => b.time);
  const available = [...allowedTimes].filter((time) => !taken.includes(time));
  res.json({ ok: true, date, available });
});

app.post('/api/book', async (req, res) => {
  const name = clean(req.body.name, 50);
  const phone = clean(req.body.phone, 30);
  const service = clean(req.body.service, 30);
  const date = clean(req.body.date, 10);
  const time = clean(req.body.time, 5);
  const note = clean(req.body.note, 300);

  if (name.length < 2) return res.status(400).json({ ok: false, error: 'name_required' });
  if (!/^[0-9+()\-\s]{8,20}$/.test(phone)) return res.status(400).json({ ok: false, error: 'invalid_phone' });
  if (!allowedServices.has(service)) return res.status(400).json({ ok: false, error: 'invalid_service' });
  if (!isValidDate(date)) return res.status(400).json({ ok: false, error: 'invalid_date' });
  if (!allowedTimes.has(time)) return res.status(400).json({ ok: false, error: 'invalid_time' });

  const duplicate = bookings.some((b) => b.date === date && b.time === time);
  if (duplicate) return res.status(409).json({ ok: false, error: 'slot_taken' });

  const booking = {
    id: `LL-${Date.now().toString(36).toUpperCase()}`,
    name,
    phone,
    service,
    date,
    time,
    note,
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);

  let line = { sent: false, reason: 'not_configured' };
  try {
    line = await sendLineNotification(booking);
  } catch (error) {
    console.error(error.message);
  }

  res.status(201).json({
    ok: true,
    booking: {
      id: booking.id,
      service: booking.service,
      date: booking.date,
      time: booking.time
    },
    lineNotification: line.sent
  });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
