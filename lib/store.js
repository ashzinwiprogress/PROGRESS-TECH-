import fs from 'fs';
import path from 'path';
import os from 'os';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || '';
const BUNDLED_DIR = path.join(process.cwd(), 'data');
const LOCAL_DIR = process.env.VERCEL ? path.join(os.tmpdir(), 'pto-data') : BUNDLED_DIR;

function localFile(name) {
  try { fs.mkdirSync(LOCAL_DIR, { recursive: true }); } catch (e) {}
  return path.join(LOCAL_DIR, name);
}

function readLocal(name, fallback) {
  const paths = [localFile(name), path.join(BUNDLED_DIR, name)];
  for (const p of paths) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : fallback;
    } catch (e) { /* try next location */ }
  }
  return fallback;
}

function writeLocal(name, data) {
  try {
    fs.writeFileSync(localFile(name), JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    return false;
  }
}

async function blobList() {
  try {
    const { list } = await import('@vercel/blob');
    const res = await list({ token: BLOB_TOKEN });
    return res.blobs || [];
  } catch (e) {
    return [];
  }
}

async function blobRead(name, fallback) {
  try {
    const blobs = await blobList();
    const found = blobs.find((b) => b.pathname === name);
    if (!found) return fallback;
    const r = await fetch(found.url, { cache: 'no-store' });
    const data = await r.json();
    return Array.isArray(data) ? data : fallback;
  } catch (e) {
    return fallback;
  }
}

async function blobWrite(name, data) {
  try {
    const { put } = await import('@vercel/blob');
    await put(name, JSON.stringify(data), {
      access: 'public',
      token: BLOB_TOKEN,
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json'
    });
    return true;
  } catch (e) {
    return false;
  }
}

export function usingBlob() {
  return !!BLOB_TOKEN;
}

const EXT_MIME = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
  webp: 'image/webp', svg: 'image/svg+xml', avif: 'image/avif',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', mkv: 'video/x-matroska',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg',
  pdf: 'application/pdf', zip: 'application/zip', txt: 'text/plain'
};

export function mimeForName(name) {
  const ext = String(name || '').split('.').pop().toLowerCase();
  return EXT_MIME[ext] || 'application/octet-stream';
}

export function safeUploadName(originalName) {
  const raw = String(originalName || 'upload');
  const ext = (raw.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${stamp}-${rand}${ext ? '.' + ext : ''}`;
}

export async function saveUpload(buffer, originalName) {
  const name = safeUploadName(originalName);
  if (usingBlob()) {
    try {
      const { put } = await import('@vercel/blob');
      const res = await put('uploads/' + name, buffer, {
        access: 'public',
        token: BLOB_TOKEN,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: mimeForName(name)
      });
      return res.url;
    } catch (e) { /* fall through to local */ }
  }
  try {
    const dir = path.join(LOCAL_DIR, 'uploads');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), buffer);
    return '/api/file/' + name;
  } catch (e) {
    return '';
  }
}

export async function readUpload(name) {
  const clean = path.basename(String(name || ''));
  if (!clean) return null;
  if (usingBlob()) {
    try {
      const blobs = await blobList();
      const found = blobs.find((b) => b.pathname === 'uploads/' + clean || b.pathname === clean);
      if (found) {
        const r = await fetch(found.url, { cache: 'no-store' });
        const ab = await r.arrayBuffer();
        return { buffer: Buffer.from(ab), contentType: found.contentType || mimeForName(clean) };
      }
    } catch (e) { /* fall through to local */ }
  }
  try {
    const buffer = fs.readFileSync(path.join(LOCAL_DIR, 'uploads', clean));
    return { buffer, contentType: mimeForName(clean) };
  } catch (e) {
    return null;
  }
}

export async function getContent() {
  if (usingBlob()) {
    const remote = await blobRead('content.json', null);
    if (remote !== null) return remote;
  }
  return readLocal('content.json', []);
}

export async function setContent(items) {
  if (usingBlob()) {
    const ok = await blobWrite('content.json', items);
    if (ok) return true;
  }
  return writeLocal('content.json', items);
}

export async function getVisitors() {
  if (usingBlob()) {
    const remote = await blobRead('visitors.json', null);
    if (remote !== null) return remote;
  }
  return readLocal('visitors.json', []);
}

export async function setVisitors(items) {
  if (usingBlob()) {
    const ok = await blobWrite('visitors.json', items);
    if (ok) return true;
  }
  return writeLocal('visitors.json', items);
}

export async function logVisitor(entry) {
  const items = await getVisitors();
  items.push(entry);
  const trimmed = items.length > 800 ? items.slice(-800) : items;
  await setVisitors(trimmed);
}

export async function getSubscribers() {
  if (usingBlob()) {
    const remote = await blobRead('subscribers.json', null);
    if (remote !== null) return remote;
  }
  return readLocal('subscribers.json', []);
}

export async function setSubscribers(items) {
  if (usingBlob()) {
    const ok = await blobWrite('subscribers.json', items);
    if (ok) return true;
  }
  return writeLocal('subscribers.json', items);
}

export async function addSubscriber(email) {
  const clean = String(email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) return { ok: false, error: 'Enter a valid email address' };
  const list = await getSubscribers();
  if (list.some((s) => s.email === clean)) {
    return { ok: true, already: true, subscribers: list.length };
  }
  list.push({ id: 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), email: clean, created: new Date().toISOString() });
  await setSubscribers(list);
  return { ok: true, already: false, subscribers: list.length };
}

export async function removeSubscriber(email) {
  const clean = String(email || '').trim().toLowerCase();
  const list = await getSubscribers();
  const filtered = list.filter((s) => s.email !== clean);
  await setSubscribers(filtered);
  return { ok: true, subscribers: filtered.length };
}
