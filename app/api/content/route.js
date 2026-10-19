import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { getContent, setContent, saveUpload, deleteUpload } from '../../../lib/store';
import { notifyNewPost } from '../../../lib/notify';
import { ADMIN_USER, ADMIN_PASS } from '../../../lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function token() {
  return crypto.createHash('sha256').update(ADMIN_USER + ':' + ADMIN_PASS + ':pto').digest('hex');
}

function isAdmin(req) {
  const cookie = req.headers.get('cookie') || '';
  return cookie.includes('pto_admin=' + token());
}

export async function GET() {
  const items = await getContent();
  return NextResponse.json(
    { ok: true, items },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}

async function storeFile(file, fallbackName) {
  if (!file || typeof file === 'string' || !file.size) return '';
  try {
    return await saveUpload(Buffer.from(await file.arrayBuffer()), file.name || fallbackName);
  } catch (e) {
    return '';
  }
}

export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const fd = await req.formData();
  const title = String(fd.get('title') || '').trim();
  if (!title) return NextResponse.json({ ok: false, error: 'Title is required' }, { status: 400 });

  const coverFile = fd.get('cover');
  const assetFile = fd.get('asset');
  const videoFile = fd.get('video');

  let cover = String(fd.get('cover_url') || '').trim();
  if (!cover) cover = await storeFile(coverFile, 'cover');
  const file = await storeFile(assetFile, 'file');
  let video = String(fd.get('video_url') || '').trim();
  if (!video) video = await storeFile(videoFile, 'video.mp4');

  const item = {
    id: 'pt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    title,
    type: String(fd.get('type') || 'link'),
    url: String(fd.get('url') || '').trim(),
    note: String(fd.get('note') || '').trim(),
    cover,
    file,
    video,
    created: new Date().toISOString().replace('T', ' ').slice(0, 19)
  };

  const items = await getContent();
  items.push(item);
  try {
    await setContent(items);
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Could not save. Check Blob storage on the server.' }, { status: 500 });
  }

  try { revalidatePath('/explore'); } catch (e) {}
  let notified = { sent: 0, skipped: true };
  try { notified = await notifyNewPost(item); } catch (e) {}

  return NextResponse.json(
    { ok: true, item, notified: { sent: notified.sent || 0, recipients: notified.recipients || 0 } },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}

export async function DELETE(req) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || '');
  const items = await getContent();
  const removed = items.find((it) => it.id === id);
  const filtered = items.filter((it) => it.id !== id);
  await setContent(filtered);
  if (removed) {
    await Promise.all([deleteUpload(removed.cover), deleteUpload(removed.file), deleteUpload(removed.video)]);
  }
  try { revalidatePath('/explore'); } catch (e) {}
  return NextResponse.json({ ok: true });
}
