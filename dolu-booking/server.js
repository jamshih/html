const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'bookings.json');

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const allowedServices = new Set(['寵物美容', '寵物安親', '其他需求']);
const allowedPetTypes = new Set(['狗狗', '貓咪', '其他']);
const allowedTimes = new Set(['11:00', '12:30', '14:00', '15:30', '17:00', '18:30']);

function ensureStore() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '[]', 'utf8');
}

function readBookings() {
  ensureStore();
  try {
    const parsed = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeBookings(bookings) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(bookings, null, 2), 'utf8');
}

function clean(value, max = 120) {
  return String(value || '').trim().slice(0, max);
}

function taipeiDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function isTuesday(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay() === 2;
}

function isValidDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const parsed = new Date(`${dateString}T00:00:00+08:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  if (dateString < taipeiDateParts()) return false;
  if (isTuesday(dateString)) return false;
  return true;
}

async function sendLineNotification(booking) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const ownerUserId = process.env.LINE_OWNER_USER_ID;
  if (!token || !ownerUserId) return { sent: false, reason: 'not_configured' };

  const text = [
    '🐾 DOLU 新預約',
    `飼主：${booking.ownerName}`,
    `寵物：${booking.petName}（${booking.petType}）`,
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
  res.json({ ok: true, service: 'dolu-pet-booking' });
});

app.get('/api/availability', (req, res) => {
  const date = clean(req.query.date, 10);
  if (!isValidDate(date)) {
    return res.status(400).json({ ok: false, error: isTuesday(date) ? 'closed_tuesday' : 'invalid_date' });
  }
  const bookings = readBookings();
  const taken = new Set(bookings.filter((b) => b.date === date).map((b) => b.time));
  const available = [...allowedTimes].filter((time) => !taken.has(time));
  res.json({ ok: true, date, available });
});

app.post('/api/book', async (req, res) => {
  const ownerName = clean(req.body.ownerName, 50);
  const petName = clean(req.body.petName, 50);
  const petType = clean(req.body.petType, 20);
  const phone = clean(req.body.phone, 30);
  const service = clean(req.body.service, 30);
  const date = clean(req.body.date, 10);
  const time = clean(req.body.time, 5);
  const note = clean(req.body.note, 300);

  if (ownerName.length < 2) return res.status(400).json({ ok: false, error: 'owner_name_required' });
  if (!petName) return res.status(400).json({ ok: false, error: 'pet_name_required' });
  if (!allowedPetTypes.has(petType)) return res.status(400).json({ ok: false, error: 'invalid_pet_type' });
  if (!/^[0-9+()\-\s]{8,20}$/.test(phone)) return res.status(400).json({ ok: false, error: 'invalid_phone' });
  if (!allowedServices.has(service)) return res.status(400).json({ ok: false, error: 'invalid_service' });
  if (!isValidDate(date)) return res.status(400).json({ ok: false, error: isTuesday(date) ? 'closed_tuesday' : 'invalid_date' });
  if (!allowedTimes.has(time)) return res.status(400).json({ ok: false, error: 'invalid_time' });

  const bookings = readBookings();
  const duplicate = bookings.some((b) => b.date === date && b.time === time);
  if (duplicate) return res.status(409).json({ ok: false, error: 'slot_taken' });

  const booking = {
    id: `DOLU-${Date.now().toString(36).toUpperCase()}`,
    ownerName,
    petName,
    petType,
    phone,
    service,
    date,
    time,
    note,
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  writeBookings(bookings);

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
      petName: booking.petName,
      service: booking.service,
      date: booking.date,
      time: booking.time
    },
    lineNotification: line.sent
  });
});

app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`DOLU booking service listening on ${port}`);
});
