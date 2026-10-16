import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getContent, addSubscriber, removeSubscriber, getSubscribers } from '../../../lib/store';
import { ADMIN_USER, ADMIN_PASS } from '../../../lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAdmin(req) {
  const tok = crypto.createHash('sha256').update(ADMIN_USER + ':' + ADMIN_PASS + ':pto').digest('hex');
  const cookie = req.headers.get('cookie') || '';
  return cookie.includes('pto_admin=' + tok);
}

function feed(items) {
  return [...items]
    .sort((a, b) => String(b.created || '').localeCompare(String(a.created || '')))
    .slice(0, 20)
    .map((it) => ({
      id: it.id,
      title: it.title || 'New update',
      type: it.type || 'item',
      note: it.note || '',
      cover: it.cover || '',
      created: it.created || ''
    }));
}

export async function GET(req) {
  let items = [];
  try { items = await getContent(); } catch (e) { items = []; }
  let count = 0;
  if (isAdmin(req)) {
    try { count = (await getSubscribers()).length; } catch (e) { count = 0; }
  }
  return NextResponse.json(
    {
      ok: true,
      notifications: feed(items),
      subscribers: count,
      emailEnabled: !!process.env.RESEND_API_KEY
    },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || 'subscribe');
  const email = String(body.email || '');

  if (action === 'unsubscribe') {
    const res = await removeSubscriber(email);
    return NextResponse.json({ ok: res.ok, message: 'Notifications turned off for that email.' });
  }

  const res = await addSubscriber(email);
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: 400 });
  return NextResponse.json({
    ok: true,
    already: !!res.already,
    message: res.already
      ? 'You are already on the list.'
      : 'You are subscribed. We will notify you on every new post.'
  });
}

export async function DELETE(req) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '');
  const res = await removeSubscriber(email);
  return NextResponse.json({ ok: res.ok });
}
