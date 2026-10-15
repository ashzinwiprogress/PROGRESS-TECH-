import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getContent, setContent } from '../../../lib/store';
import { ADMIN_USER, ADMIN_PASS } from '../../../lib/config';
import { uploadToPublicHost } from '../../../lib/omegatech';

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
  return NextResponse.json({ ok: true, items });
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
  if (!cover && coverFile && typeof coverFile !== 'string' && coverFile.size > 0) {
    cover = await uploadToPublicHost(Buffer.from(await coverFile.arrayBuffer()), coverFile.name || 'cover');
  }
  let file = '';
  if (assetFile && typeof assetFile !== 'string' && assetFile.size > 0) {
    file = await uploadToPublicHost(Buffer.from(await assetFile.arrayBuffer()), assetFile.name || 'file');
  }
  let video = String(fd.get('video_url') || '').trim();
  if (!video && videoFile && typeof videoFile !== 'string' && videoFile.size > 0) {
    video = await uploadToPublicHost(Buffer.from(await videoFile.arrayBuffer()), videoFile.name || 'video.mp4');
  }

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
  await setContent(items);
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || '');
  const items = await getContent();
  const filtered = items.filter((it) => it.id !== id);
  await setContent(filtered);
  return NextResponse.json({ ok: true });
}
