import fs from 'fs';
import path from 'path';
import os from 'os';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || '';
const LOCAL_DIR = process.env.VERCEL ? path.join(os.tmpdir(), 'pto-data') : path.join(process.cwd(), 'data');

function localFile(name) {
  try { fs.mkdirSync(LOCAL_DIR, { recursive: true }); } catch (e) {}
  return path.join(LOCAL_DIR, name);
}

function readLocal(name, fallback) {
  try {
    const raw = fs.readFileSync(localFile(name), 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : fallback;
  } catch (e) {
    return fallback;
  }
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
