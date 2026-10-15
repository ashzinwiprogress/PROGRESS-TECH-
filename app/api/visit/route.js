import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { logVisitor, getVisitors } from '../../../lib/store';
import { ADMIN_USER, ADMIN_PASS } from '../../../lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adminToken() {
  return crypto.createHash('sha256').update(ADMIN_USER + ':' + ADMIN_PASS + ':pto').digest('hex');
}

export async function GET(req) {
  const cookie = req.headers.get('cookie') || '';
  if (!cookie.includes('pto_admin=' + adminToken())) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const visitors = await getVisitors();
  return NextResponse.json({ ok: true, visitors });
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    await logVisitor({
      id: 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      ip,
      page: String(body.page || '/'),
      ua: (req.headers.get('user-agent') || '').slice(0, 240),
      time: new Date().toISOString().replace('T', ' ').slice(0, 19)
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false });
  }
}
