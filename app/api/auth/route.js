import { NextResponse } from 'next/server';
import {
  registerEmailUser,
  loginEmailUser,
  userFromRequest,
  publicUser,
  setAuthCookie,
  clearAuthCookie,
  makeSession,
  isHttpsReq,
  upsertGoogleUser,
  verifyGoogleToken,
  googleEmailUser,
  TOS_VERSION
} from '../../../lib/auth';
import { getUsers, setUsers, logActivity } from '../../../lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(req) {
  const user = await userFromRequest(req);
  if (!user) return json({ ok: false, user: null });
  if (user.suspended) {
    const out = json({ ok: false, user: null, error: 'suspended' });
    clearAuthCookie(out);
    return out;
  }
  return json({ ok: true, user: publicUser(user) });
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || 'me');
  const https = isHttpsReq(req);

  if (action === 'register') {
    const result = await registerEmailUser({
      name: body.name,
      email: body.email,
      password: body.password,
      tos: !!body.tos
    });
    if (result.error) return json({ ok: false, error: result.error }, 400);
    const out = json({ ok: true, user: publicUser(result.user) });
    setAuthCookie(out, makeSession(result.user.id), https);
    return out;
  }

  if (action === 'login') {
    const result = await loginEmailUser({ email: body.email, password: body.password });
    if (result.error) return json({ ok: false, error: result.error }, 401);
    const out = json({ ok: true, user: publicUser(result.user) });
    setAuthCookie(out, makeSession(result.user.id), https);
    return out;
  }

  if (action === 'google') {
    const verified = await verifyGoogleToken(body.credential);
    if (verified.error) return json({ ok: false, error: verified.error }, 401);
    const result = await upsertGoogleUser(verified.profile);
    if (result.error) return json({ ok: false, error: result.error }, 403);
    const out = json({ ok: true, user: publicUser(result.user) });
    setAuthCookie(out, makeSession(result.user.id), https);
    return out;
  }

  if (action === 'google-email') {
    const result = await googleEmailUser({
      email: body.email,
      name: body.name,
      tos: body.tos !== false
    });
    if (result.error) return json({ ok: false, error: result.error }, 400);
    const out = json({ ok: true, user: publicUser(result.user) });
    setAuthCookie(out, makeSession(result.user.id), https);
    return out;
  }

  if (action === 'logout') {
    const user = await userFromRequest(req);
    if (user) await logActivity({ userId: user.id, email: user.email, action: 'logout', detail: '' });
    const out = json({ ok: true });
    clearAuthCookie(out);
    return out;
  }

  if (action === 'accept-tos') {
    const user = await userFromRequest(req);
    if (!user) return json({ ok: false, error: 'Sign in first.' }, 401);
    const users = await getUsers();
    const found = users.find((u) => u && u.id === user.id);
    if (!found) return json({ ok: false, error: 'Account missing.' }, 404);
    found.tosVersion = TOS_VERSION;
    found.tosAcceptedAt = new Date().toISOString();
    await setUsers(users);
    await logActivity({ userId: found.id, email: found.email, action: 'tos', detail: 'accepted v' + TOS_VERSION });
    return json({ ok: true, user: publicUser(found) });
  }

  return json({ ok: false, error: 'Unknown action' }, 400);
}
