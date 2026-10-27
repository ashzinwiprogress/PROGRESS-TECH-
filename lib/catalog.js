const RENTRY_ID = process.env.CATALOG_PASTE_ID || 'mqyznxtf';
const RENTRY_EDIT = process.env.CATALOG_PASTE_EDIT || '73echFfE';
const RENTRY_PAGE = 'https://rentry.co/' + RENTRY_ID;
const RENTRY_EDIT_URL = 'https://rentry.co/api/edit/' + RENTRY_ID;
const UA = 'Mozilla/5.0 ProgressTech';

let memoryItems = null;
let memoryAt = 0;
const MEMORY_MS = 8000;

function decodeEntities(s) {
  return String(s || '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function extractJsonArray(html) {
  const article = String(html || '').match(/<article[\s\S]*?<\/article>/i);
  const chunk = article ? article[0] : String(html || '');
  const text = decodeEntities(chunk.replace(/<[^>]+>/g, ' '));
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start < 0 || end <= start) return null;
  try {
    const data = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(data) ? data : null;
  } catch (e) {
    return null;
  }
}

async function fetchText(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'User-Agent': UA, ...(options && options.headers) }
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text, headers: res.headers };
  } finally {
    clearTimeout(timer);
  }
}

async function csrfToken() {
  const r = await fetchText('https://rentry.co', {}, 12000);
  const cookie = r.headers.get('set-cookie') || '';
  const m = cookie.match(/csrftoken=([^;]+)/);
  if (m && m[1]) return m[1];
  const form = r.text.match(/name=["']csrfmiddlewaretoken["']\s+value=["']([^"']+)/i);
  return form ? form[1] : '';
}

export async function readRemoteCatalog() {
  if (memoryItems && Date.now() - memoryAt < MEMORY_MS) return memoryItems;
  const r = await fetchText(RENTRY_PAGE, {}, 12000);
  const items = extractJsonArray(r.text);
  if (!items) return null;
  memoryItems = items;
  memoryAt = Date.now();
  return items;
}

export async function writeRemoteCatalog(items) {
  const list = Array.isArray(items) ? items : [];
  const csrf = await csrfToken();
  if (!csrf) throw new Error('Catalog host unavailable');
  const body = new URLSearchParams({
    csrfmiddlewaretoken: csrf,
    edit_code: RENTRY_EDIT,
    text: JSON.stringify(list)
  });
  const r = await fetchText(RENTRY_EDIT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: RENTRY_PAGE,
      Origin: 'https://rentry.co',
      Cookie: 'csrftoken=' + csrf
    },
    body
  }, 15000);
  let ok = r.ok;
  try {
    const j = JSON.parse(r.text);
    ok = String(j.status) === '200' || j.content === 'OK';
  } catch (e) { /* use http status */ }
  if (!ok) throw new Error('Could not save catalog');
  memoryItems = list;
  memoryAt = Date.now();
  return true;
}
