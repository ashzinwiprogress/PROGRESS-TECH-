export const TEMP_NUMBER_URL = 'https://api.omegatech.app/api/tools/Temp-number?action=otps';

export const PLATFORMS = [
  { id: 'whatsapp', name: 'WhatsApp', hint: 'WhatsApp and WhatsApp Business', aliases: ['whatsapp'] },
  { id: 'facebook', name: 'Facebook', hint: 'Facebook login codes', aliases: ['facebook'] },
  { id: 'instagram', name: 'Instagram', hint: 'Instagram SMS codes', aliases: ['instagram'] },
  { id: 'google', name: 'Google', hint: 'Google / Gmail verification', aliases: ['google'] },
  { id: 'telegram', name: 'Telegram', hint: 'Telegram login codes', aliases: ['telegram'] },
  { id: 'microsoft', name: 'Microsoft', hint: 'Microsoft account codes', aliases: ['microsoft'] },
  { id: 'apple', name: 'Apple', hint: 'Apple ID codes', aliases: ['apple'] },
  { id: 'huawei', name: 'Huawei', hint: 'Huawei / MeeTime codes', aliases: ['huawei', 'meetime'] },
  { id: 'paypal', name: 'PayPal', hint: 'PayPal security codes', aliases: ['paypal'] },
  { id: 'viber', name: 'Viber', hint: 'Viber activation codes', aliases: ['viber'] },
  { id: 'bigo', name: 'BIGO LIVE', hint: 'BIGO live codes', aliases: ['bigo'] },
  { id: 'twitter', name: 'X / Twitter', hint: 'X and Twitter codes', aliases: ['twitter', 'x app'] },
  { id: 'alipay', name: 'Alipay', hint: 'Alipay / AliSMS codes', aliases: ['alipay', 'alisms', 'taobao'] },
  { id: 'tiktok', name: 'TikTok', hint: 'TikTok SMS codes', aliases: ['tiktok'] },
  { id: 'amazon', name: 'Amazon', hint: 'Amazon verification', aliases: ['amazon'] },
  { id: 'discord', name: 'Discord', hint: 'Discord SMS codes', aliases: ['discord'] },
  { id: 'snapchat', name: 'Snapchat', hint: 'Snapchat codes', aliases: ['snapchat'] },
  { id: 'linkedin', name: 'LinkedIn', hint: 'LinkedIn codes', aliases: ['linkedin'] },
  { id: 'uber', name: 'Uber', hint: 'Uber verification', aliases: ['uber'] },
  { id: 'netflix', name: 'Netflix', hint: 'Netflix codes', aliases: ['netflix'] },
  { id: 'mexc', name: 'MEXC', hint: 'MEXC exchange codes', aliases: ['mexc'] },
  { id: 'other', name: 'Any platform', hint: 'Show every SMS for this number', aliases: [] }
];

export function normalizeNumber(n) {
  return String(n || '').replace(/[^\d+]/g, '');
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
    const digits = raw.replace(/[^\d]/g, '');
    if (digits.length >= 3 && digits.length <= 8) return digits;
    if (/\d/.test(raw)) return raw;
  }
  const msg = String((item && item.message) || '');
  const patterns = [
    /G-(\d{4,8})/i,
    /(?:code|kode|kod|codigo|otp|verification)[^\d]{0,16}(\d{3}[- ]?\d{3})/i,
    /(?:code|kode|kod|codigo|otp|verification)[^\d]{0,16}(\d{4,8})/i,
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
  const hay = `${item.sender || ''} ${item.message || ''}`.toLowerCase();
  return plat.aliases.some((a) => hay.includes(a));
}

export function processOtps(otps) {
  const countriesMap = new Map();
  const numbersMap = new Map();
  const list = Array.isArray(otps) ? otps : [];

  for (const item of list) {
    const number = normalizeNumber(item.number);
    if (!number) continue;
    const country = String(item.country || 'Unknown');
    const flag = item.flag || '';
    const ts = parseStamp(item.time);
    const sender = String(item.sender || 'Unknown');

    if (!countriesMap.has(country)) {
      countriesMap.set(country, { name: country, flag, latest: 0, numbers: new Set() });
    }
    const c = countriesMap.get(country);
    c.numbers.add(number);
    if (ts >= c.latest) {
      c.latest = ts;
      c.flag = flag || c.flag;
    }

    if (!numbersMap.has(number)) {
      numbersMap.set(number, {
        number,
        masked: item.maskedNumber || maskNumber(number),
        country,
        flag,
        latest: 0,
        senders: [],
        messageCount: 0
      });
    }
    const n = numbersMap.get(number);
    n.messageCount += 1;
    if (ts >= n.latest) {
      n.latest = ts;
      n.flag = flag || n.flag;
      n.country = country;
      n.masked = item.maskedNumber || n.masked;
    }
    if (sender && !n.senders.includes(sender)) n.senders.push(sender);
  }

  const now = Date.now();
  const countries = [...countriesMap.values()]
    .map((c) => ({
      name: c.name,
      flag: c.flag,
      count: c.numbers.size,
      latest: c.latest,
      hot: now - c.latest < 6 * 3600 * 1000 && c.numbers.size >= 2
    }))
    .sort((a, b) => b.latest - a.latest || b.count - a.count);

  const numbersByCountry = {};
  for (const n of numbersMap.values()) {
    if (!numbersByCountry[n.country]) numbersByCountry[n.country] = [];
    numbersByCountry[n.country].push(n);
  }
  for (const key of Object.keys(numbersByCountry)) {
    numbersByCountry[key].sort((a, b) => b.latest - a.latest);
  }

  return { countries, numbersByCountry, total: numbersMap.size };
}

export function filterInbox(otps, number, platformId) {
  const want = normalizeNumber(number);
  const rows = [];
  for (const item of Array.isArray(otps) ? otps : []) {
    if (normalizeNumber(item.number) !== want) continue;
    if (!platformMatch(item, platformId)) continue;
    const ts = parseStamp(item.time);
    rows.push({
      time: item.time || '',
      ts,
      sender: item.sender || '',
      otp: extractCode(item),
      message: item.message || '',
      country: item.country || '',
      flag: item.flag || '',
      number: item.number || want
    });
  }
  rows.sort((a, b) => b.ts - a.ts);
  const freshMs = 30 * 60 * 1000;
  const latest = rows.find((r) => r.otp && Date.now() - r.ts < freshMs) || rows.find((r) => r.otp) || null;
  return { messages: rows, latest };
}
