import fs from 'fs';
import path from 'path';
import os from 'os';
import getConfig from 'next/config';

const BUNDLED_DIR = path.join(process.cwd(), 'data');
const LOCAL_DIR = process.env.VERCEL ? path.join(os.tmpdir(), 'pto-data') : BUNDLED_DIR;

let dotEnvToken;

function tokenFromDotEnv() {
  if (dotEnvToken !== undefined) return dotEnvToken;
  dotEnvToken = '';
  try {
    for (const file of ['.env.local', '.env']) {
      const raw = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      const match = raw.match(/^\s*BLOB_READ_WRITE_TOKEN\s*=\s*"?([^"\n#]+)"?\s*$/m);
      if (match && match[1]) {
        dotEnvToken = match[1].trim();
        break;
      }
    }
  } catch (e) { /* no env file present */ }
  return dotEnvToken;
}

function tokenFromRuntimeConfig() {
  try {
    const config = getConfig && getConfig();
    return (config && config.serverRuntimeConfig && config.serverRuntimeConfig.blobToken) || '';
  } catch (e) {
    return '';
  }
}

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN || tokenFromRuntimeConfig() || tokenFromDotEnv();
}

function blobConfigured() {
  return !!blobToken() || !!(process.env.VERCEL && (process.env.BLOB_STORE_ID || process.env.VERCEL_OIDC_TOKEN));
}

let accessMode = process.env.BLOB_ACCESS === 'public' ? 'public' : 'private';

async function withAccess(fn) {
  try {
    return await fn(accessMode);
  } catch (e) {
    const message = String((e && e.message) || '');
    const retryable = (e && e.name === 'BlobAccessError') || /private|public|access/i.test(message);
    if (!retryable) throw e;
    const other = accessMode === 'private' ? 'public' : 'private';
    const result = await fn(other);
    accessMode = other;
    return result;
  }
}

function tokenOption() {
  const token = blobToken();
  return token ? { token } : {};
}

async function blobPut(name, body, contentType) {
  const { put } = await import('@vercel/blob');
  return withAccess((access) =>
    put(name, body, {
      access,
      ...tokenOption(),
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
      cacheControlMaxAge: 0
    })
  );
}

async function blobGet(name) {
  const { get } = await import('@vercel/blob');
  const res = await withAccess((access) =>
    get(name, { access, ...tokenOption(), useCache: false })
  );
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  const buffer = Buffer.from(await new Response(res.stream).arrayBuffer());
  return { buffer, contentType: (res.blob && res.blob.contentType) || '' };
}

function localFile(name) {
  try { fs.mkdirSync(path.dirname(path.join(LOCAL_DIR, name)), { recursive: true }); } catch (e) {}
  return path.join(LOCAL_DIR, name);
}

function readLocal(name, fallback) {
  const paths = [path.join(LOCAL_DIR, name), path.join(BUNDLED_DIR, name)];
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

async function readJson(name, fallback) {
  if (blobConfigured()) {
    try {
      const found = await blobGet(name);
      if (found) {
        const data = JSON.parse(found.buffer.toString('utf8'));
        if (Array.isArray(data)) return data;
      }
    } catch (e) { /* fall back to local */ }
  }
  return readLocal(name, fallback);
}

async function writeJson(name, data) {
  if (blobConfigured()) {
    try {
      await blobPut(name, JSON.stringify(data), 'application/json');
      return true;
    } catch (e) {
      const localOk = writeLocal(name, data);
      if (!localOk) throw e;
      if (process.env.VERCEL) throw e;
      return true;
    }
  }
  const ok = writeLocal(name, data);
  if (!ok) throw new Error('Could not save ' + name);
  return true;
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

function safeUploadName(originalName) {
  const raw = String(originalName || 'upload');
  const ext = (raw.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${stamp}-${rand}${ext ? '.' + ext : ''}`;
}

export function usingBlob() {
  return blobConfigured();
}

export async function saveUpload(buffer, originalName) {
  const name = safeUploadName(originalName);
  const pathname = 'uploads/' + name;
  if (blobConfigured()) {
    try {
      await blobPut(pathname, buffer, mimeForName(name));
      return '/api/file/' + name;
    } catch (e) {
      if (process.env.VERCEL) throw e;
    }
  }
  try {
    const dest = localFile(pathname);
    fs.writeFileSync(dest, buffer);
    return '/api/file/' + name;
  } catch (e) {
    if (process.env.VERCEL) throw e;
    return '';
  }
}

export async function readUpload(name) {
  const clean = path.basename(String(name || ''));
  if (!clean || clean === '.' || clean === '..') return null;
  if (blobConfigured()) {
    try {
      const found = await blobGet('uploads/' + clean);
      if (found) {
        return { buffer: found.buffer, contentType: found.contentType || mimeForName(clean) };
      }
    } catch (e) { /* fall back to local disk */ }
  }
  try {
    const buffer = fs.readFileSync(localFile('uploads/' + clean));
    return { buffer, contentType: mimeForName(clean) };
  } catch (e) {
    return null;
  }
}

function uploadNameFromUrl(value) {
  const raw = String(value || '');
  if (!raw.includes('/api/file/')) return '';
  const name = path.basename(raw.split('/api/file/')[1].split(/[?#]/)[0]);
  return name && name !== '.' && name !== '..' ? name : '';
}

export async function deleteUpload(value) {
  const name = uploadNameFromUrl(value);
  if (!name) return false;
  const pathname = 'uploads/' + name;
  let removed = false;
  if (blobConfigured()) {
    try {
      const { del } = await import('@vercel/blob');
      await del(pathname, tokenOption());
      removed = true;
    } catch (e) { /* fall back to local disk */ }
  }
  try {
    fs.unlinkSync(localFile(pathname));
    removed = true;
  } catch (e) { /* not on local disk */ }
  return removed;
}

export async function getContent() {
  return readJson('content.json', []);
}

export async function setContent(items) {
  return writeJson('content.json', items);
}

export async function getVisitors() {
  return readJson('visitors.json', []);
}

export async function setVisitors(items) {
  return writeJson('visitors.json', items);
}

export async function logVisitor(entry) {
  const items = await getVisitors();
  items.push(entry);
  const trimmed = items.length > 800 ? items.slice(-800) : items;
  await setVisitors(trimmed);
}

export async function getSubscribers() {
  return readJson('subscribers.json', []);
}

export async function setSubscribers(items) {
  return writeJson('subscribers.json', items);
}

export async function addSubscriber(email) {
  const clean = String(email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) return { ok: false, error: 'Enter a valid email address' };
  const list = await getSubscribers();
  if (list.some((s) => s && s.email === clean)) {
    return { ok: true, already: true, subscribers: list.length };
  }
  list.push({ id: 'sub_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8), email: clean, created: new Date().toISOString() });
  await setSubscribers(list);
  return { ok: true, already: false, subscribers: list.length };
}

export async function removeSubscriber(email) {
  const clean = String(email || '').trim().toLowerCase();
  const list = await getSubscribers();
  const filtered = list.filter((s) => s && s.email !== clean);
  await setSubscribers(filtered);
  return { ok: true, subscribers: filtered.length };
}
