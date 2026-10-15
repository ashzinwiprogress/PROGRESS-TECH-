import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ADMIN_USER, ADMIN_PASS } from '../../../lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function token() {
  return crypto.createHash('sha256').update(ADMIN_USER + ':' + ADMIN_PASS + ':pto').digest('hex');
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const action = body.action || 'login';

  if (action === 'logout') {
    const out = NextResponse.json({ ok: true });
    out.cookies.set('pto_admin', '', { path: '/', maxAge: 0 });
    return out;
  }

  const u = String(body.username || '');
  const p = String(body.password || '');
  const isHttps = (req.headers.get('x-forwarded-proto') || '') === 'https' || req.url.startsWith('https');
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    const ok = NextResponse.json({ ok: true });
    ok.cookies.set('pto_admin', token(), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps,
      maxAge: 60 * 60 * 12
    });
    return ok;
  }
  return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
}

export async function GET(req) {
  const cookie = req.headers.get('cookie') || '';
  const ok = cookie.includes('pto_admin=' + token());
  return NextResponse.json({ ok });
}
