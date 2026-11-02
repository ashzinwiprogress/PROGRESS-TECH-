export const TEMP_NUMBER_URL = 'https://api.omegatech.app/api/tools/Temp-number?action=otps';
export const TEMP_NUMBERS_URL = 'https://api.omegatech.app/api/tools/Temp-number?action=numbers';

export const PLATFORMS = [
  { id: 'whatsapp', name: 'WhatsApp', hint: 'WhatsApp and WhatsApp Business', aliases: ['whatsapp'] },
  { id: 'facebook', name: 'Facebook', hint: 'Facebook login codes', aliases: ['facebook'] },
  { id: 'instagram', name: 'Instagram', hint: 'Instagram SMS codes', aliases: ['instagram'] },
  { id: 'google', name: 'Google', hint: 'Google / Gmail verification', aliases: ['google', 'gmail'] },
  { id: 'telegram', name: 'Telegram', hint: 'Telegram login codes', aliases: ['telegram'] },
  { id: 'microsoft', name: 'Microsoft', hint: 'Microsoft account codes', aliases: ['microsoft', 'outlook'] },
  { id: 'apple', name: 'Apple', hint: 'Apple ID codes', aliases: ['apple'] },
  { id: 'huawei', name: 'Huawei', hint: 'Huawei / MeeTime codes', aliases: ['huawei', 'meetime'] },
  { id: 'paypal', name: 'PayPal', hint: 'PayPal security codes', aliases: ['paypal'] },
  { id: 'viber', name: 'Viber', hint: 'Viber activation codes', aliases: ['viber'] },
  { id: 'bigo', name: 'BIGO LIVE', hint: 'BIGO live codes', aliases: ['bigo'] },
  { id: 'twitter', name: 'X / Twitter', hint: 'X and Twitter codes', aliases: ['twitter', 'x app'] },
  { id: 'alipay', name: 'Alipay', hint: 'Alipay / AliSMS codes', aliases: ['alipay', 'alisms', 'taobao'] },
  { id: 'tiktok', name: 'TikTok', hint: 'TikTok SMS codes', aliases: ['tiktok', 'douyin'] },
  { id: 'amazon', name: 'Amazon', hint: 'Amazon verification', aliases: ['amazon'] },
  { id: 'discord', name: 'Discord', hint: 'Discord SMS codes', aliases: ['discord'] },
  { id: 'snapchat', name: 'Snapchat', hint: 'Snapchat codes', aliases: ['snapchat'] },
  { id: 'linkedin', name: 'LinkedIn', hint: 'LinkedIn codes', aliases: ['linkedin'] },
  { id: 'uber', name: 'Uber', hint: 'Uber verification', aliases: ['uber'] },
  { id: 'netflix', name: 'Netflix', hint: 'Netflix codes', aliases: ['netflix'] },
  { id: 'mexc', name: 'MEXC', hint: 'MEXC exchange codes', aliases: ['mexc'] },
  { id: 'other', name: 'Any platform', hint: 'Show every SMS for this number', aliases: [] }
];

const UNUSED_PER_COUNTRY = 36;
const UNUSED_ROTATE_MS = 180000;
const LIVE_MS = 2 * 3600 * 1000;
const FRESH_MS = 10 * 60 * 1000;
const OTP_FRESH_MS = 20 * 60 * 1000;

export function normalizeNumber(n) {
  return String(n || '').replace(/[^\d+]/g, '');
}

export function digitsOnly(n) {
  return String(n || '').replace(/\D/g, '');
}

export function isPlausibleNumber(n) {
  const d = digitsOnly(n);
  if (d.length < 8 || d.length > 15) return false;
  if (/^(\d)\1+$/.test(d)) return false;
  if (/^0+$/.test(d)) return false;
  return true;
}

export function displayNumber(n) {
  const raw = normalizeNumber(n);
  if (!raw) return '';
  return raw.startsWith('+') ? raw : '+' + raw;
}

export function titleCountry(name) {
  const s = String(name || '').trim();
  if (!s) return 'Unknown';
  if (s !== s.toLowerCase() && s !== s.toUpperCase()) return s;
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function isFlagEmoji(value) {
  return /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/.test(String(value || ''));
}

export function parseStamp(t) {
  if (!t) return 0;
  const iso = Date.parse(String(t).replace(' ', 'T') + 'Z');
  if (!Number.isNaN(iso)) return iso;
  const local = Date.parse(String(t).replace(' ', 'T'));
  return Number.isNaN(local) ? 0 : local;
}

export function timeAgo(ts) {
  if (!ts) return 'just now';
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return s + 's ago';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

export function maskNumber(number) {
  const d = String(number || '');
  if (d.length < 6) return d;
  return d.slice(0, 4) + '••' + d.slice(-4);
}

export function extractCode(item) {
  const raw = String((item && item.otp) || '').trim();
  if (raw && !/^no\s*otp/i.test(raw)) {
    const compact = raw.replace(/[^\d]/g, '');
    if (compact.length >= 3 && compact.length <= 8) return compact;
    if (/\d/.test(raw) && raw.length <= 12) return raw.replace(/\s+/g, '');
  }
  const msg = String((item && item.message) || '');
  const patterns = [
    /G-(\d{4,8})/i,
    /(?:code|kode|kod|codigo|otp|pin|verification|verify)[^\d]{0,20}(\d{3}[- ]?\d{3})/i,
    /(?:code|kode|kod|codigo|otp|pin|verification|verify)[^\d]{0,20}(\d{4,8})/i,
    /(\d{3})-(\d{3})/,
    /\b(\d{4,8})\b/
  ];
  for (const p of patterns) {
    const m = msg.match(p);
    if (!m) continue;
    const digits = (m[2] ? m[1] + m[2] : m[1]).replace(/[^\d]/g, '');
    if (digits.length >= 3 && digits.length <= 8) return digits;
  }
  return '';
}

export function platformMatch(item, platformId) {
  if (!platformId || platformId === 'other') return true;
  const plat = PLATFORMS.find((p) => p.id === platformId);
  if (!plat) return true;
  const hay = `${item.sender || ''} ${item.message || ''} ${item.otp || ''}`.toLowerCase();
  return plat.aliases.some((a) => hay.includes(a));
}

function seedHash(s) {
  let h = 2166136261;
  const str = String(s || '');
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rotateSlice(list, limit, salt) {
  if (!Array.isArray(list) || list.length <= limit) return list.slice();
  const ranked = list.map((item, i) => ({
    item,
    score: seedHash((item.number || '') + ':' + salt) + i
  }));
  ranked.sort((a, b) => a.score - b.score);
  return ranked.slice(0, limit).map((r) => r.item);
}

function emptyNumber(number, extra) {
  return {
    number,
    masked: extra.masked || maskNumber(number),
    country: extra.country || 'Unknown',
    flag: extra.flag || '',
    latest: extra.latest || 0,
    senders: extra.senders || [],
    messageCount: extra.messageCount || 0,
    unused: extra.unused !== false && !(extra.messageCount > 0),
    live: !!extra.live
  };
}

export function processOtps(otps, catalog) {
  const countriesMap = new Map();
  const numbersMap = new Map();
  const list = Array.isArray(otps) ? otps : [];
  const now = Date.now();

  function touchCountry(country, flag, ts, unused) {
    if (!countriesMap.has(country)) {
      countriesMap.set(country, {
        name: country,
        flag,
        latest: 0,
        numbers: new Set(),
        unused: 0,
        live: 0
      });
    }
    const c = countriesMap.get(country);
    if (ts >= c.latest) {
      c.latest = ts;
      c.flag = flag || c.flag;
    }
    if (unused) c.unused += 1;
    return c;
  }

  for (const item of list) {
    const number = displayNumber(item.number);
    if (!isPlausibleNumber(number)) continue;
    const country = titleCountry(item.country);
    const flag = item.flag || '';
    const ts = parseStamp(item.time);
    const sender = String(item.sender || '').trim();

    const c = touchCountry(country, flag, ts, false);
    c.numbers.add(number);

    if (!numbersMap.has(number)) {
      numbersMap.set(number, emptyNumber(number, {
        masked: item.maskedNumber || maskNumber(number),
        country,
        flag,
        latest: ts,
        senders: [],
        messageCount: 0,
        unused: false,
        live: now - ts < LIVE_MS
      }));
    }
    const n = numbersMap.get(number);
    n.messageCount += 1;
    n.unused = false;
    n.live = now - Math.max(n.latest, ts) < LIVE_MS;
    if (ts >= n.latest) {
      n.latest = ts;
      n.flag = flag || n.flag;
      n.country = country;
      n.masked = item.maskedNumber || n.masked;
    }
    if (sender && !n.senders.includes(sender)) n.senders.push(sender);
  }

  const catalogList = Array.isArray(catalog) ? catalog : [];
  for (const item of catalogList) {
    const number = displayNumber(item.number);
    if (!isPlausibleNumber(number)) continue;
    if (numbersMap.has(number)) continue;
    const country = titleCountry(item.country);
    const flag = isFlagEmoji(item.flag) ? item.flag : '';
    numbersMap.set(number, emptyNumber(number, {
      country,
      flag,
      latest: 0,
      senders: [],
      messageCount: 0,
      unused: true,
      live: false
    }));
    const c = touchCountry(country, flag, 0, true);
    c.numbers.add(number);
  }

  for (const n of numbersMap.values()) {
    const c = countriesMap.get(n.country);
    if (!c) continue;
    if (n.live) c.live += 1;
  }

  const rotateSalt = String(Math.floor(now / UNUSED_ROTATE_MS));
  const numbersByCountry = {};
  for (const n of numbersMap.values()) {
    if (!numbersByCountry[n.country]) numbersByCountry[n.country] = [];
    numbersByCountry[n.country].push(n);
  }

  let shownTotal = 0;
  for (const key of Object.keys(numbersByCountry)) {
    const live = numbersByCountry[key]
      .filter((n) => !n.unused)
      .sort((a, b) => b.latest - a.latest);
    const unused = rotateSlice(
      numbersByCountry[key].filter((n) => n.unused),
      UNUSED_PER_COUNTRY,
      rotateSalt + ':' + key
    );
    const merged = unused.concat(live);
    numbersByCountry[key] = merged;
    shownTotal += merged.length;
    const c = countriesMap.get(key);
    if (c) c.shown = merged.length;
  }

  const countries = [...countriesMap.values()]
    .map((c) => ({
      name: c.name,
      flag: c.flag,
      count: c.shown || c.numbers.size,
      unusedCount: c.unused,
      liveCount: c.live,
      latest: c.latest,
      hot: c.unused > 0 || (now - c.latest < LIVE_MS && c.live >= 1)
    }))
    .sort((a, b) => {
      if (a.hot !== b.hot) return a.hot ? -1 : 1;
      return (b.latest - a.latest) || (b.unusedCount - a.unusedCount) || (b.count - a.count);
    });

  return {
    countries,
    numbersByCountry,
    total: shownTotal,
    unusedTotal: countries.reduce((s, c) => s + (c.unusedCount || 0), 0),
    liveTotal: countries.reduce((s, c) => s + (c.liveCount || 0), 0)
  };
}

export function filterInbox(otps, number, platformId, since) {
  const want = digitsOnly(number);
  const sinceTs = Number(since) > 0 ? Number(since) - 8000 : 0;
  const rows = [];
  for (const item of Array.isArray(otps) ? otps : []) {
    if (digitsOnly(item.number) !== want) continue;
    if (!platformMatch(item, platformId)) continue;
    const ts = parseStamp(item.time);
    if (sinceTs && ts && ts < sinceTs) continue;
    rows.push({
      time: item.time || '',
      ts,
      sender: item.sender || '',
      otp: extractCode(item),
      message: item.message || '',
      country: item.country || '',
      flag: item.flag || '',
      number: displayNumber(item.number || number)
    });
  }
  rows.sort((a, b) => b.ts - a.ts);
  const latest =
    rows.find((r) => r.otp && (!r.ts || Date.now() - r.ts < OTP_FRESH_MS)) ||
    rows.find((r) => r.otp) ||
    null;
  return { messages: rows, latest };
}

export function freshness(ts, unused) {
  if (unused) return { label: 'Unused', cls: 'vn-pill vn-pill-ok' };
  const age = Date.now() - (ts || 0);
  if (age < FRESH_MS) return { label: 'Live', cls: 'vn-pill vn-pill-ok' };
  if (age < LIVE_MS) return { label: 'Active', cls: 'vn-pill vn-pill-gold' };
  return { label: 'Standby', cls: 'vn-pill' };
}
