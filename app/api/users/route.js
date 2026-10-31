import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ADMIN_USER, ADMIN_PASS } from '../../../lib/config';
import { getUsers, setUsers, getActivity, logActivity } from '../../../lib/store';
import { publicUser } from '../../../lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function adminToken() {
  return crypto.createHash('sha256').update(ADMIN_USER + ':' + ADMIN_PASS + ':pto').digest('hex');
}

function isAdmin(req) {
  const cookie = req.headers.get('cookie') || '';
  return cookie.includes('pto_admin=' + adminToken());
}

export async function GET(req) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const users = await getUsers();
  const activity = await getActivity();
  return NextResponse.json({
    ok: true,
    users: users.map(publicUser),
    activity: activity.slice(-400).reverse()
  });
}

export async function POST(req) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || '');
  const id = String(body.id || '');
  const users = await getUsers();
  const user = users.find((u) => u && u.id === id);
  if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

  if (action === 'suspend') {
    user.suspended = true;
    user.suspendedAt = new Date().toISOString();
    user.suspendReason = String(body.reason || 'Policy violation').slice(0, 240);
    await setUsers(users);
    await logActivity({ userId: user.id, email: user.email, action: 'suspend', detail: user.suspendReason });
    return NextResponse.json({ ok: true, user: publicUser(user) });
  }

  if (action === 'restore') {
    user.suspended = false;
    user.restoredAt = new Date().toISOString();
    user.suspendReason = '';
    await setUsers(users);
    await logActivity({ userId: user.id, email: user.email, action: 'restore', detail: 'account reopened' });
    return NextResponse.json({ ok: true, user: publicUser(user) });
  }

  return NextResponse.json({ ok: false, error: 'Unknown action' }, { status: 400 });
}
