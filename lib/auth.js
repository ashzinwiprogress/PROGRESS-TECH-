import crypto from 'crypto';
import { ADMIN_USER, ADMIN_PASS } from './config';
import { getUsers, setUsers, logActivity } from './store';

export const STUDENT_COOKIE = 'pto_student';
export const TOS_VERSION = 1;

function sessionSecret() {
  return process.env.USER_SESSION_SECRET || (ADMIN_USER + ':' + ADMIN_PASS + ':student-session');
}

export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    provider: u.provider || 'email',
    created: u.created,
    lastLogin: u.lastLogin || '',
    suspended: !!u.suspended,
    scores: u.scores || {},
    labs: u.labs || 0,
    tosVersion: u.tosVersion || 0
  };
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return salt + ':' + hash;
}

export function verifyPassword(password, stored) {
  try {
    const [salt, hash] = String(stored || '').split(':');
    if (!salt || !hash) return false;
    const test = crypto.scryptSync(String(password), salt, 64).toString('hex');
    if (test.length !== hash.length) return false;
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
  } catch (e) {
    return false;
  }
}

export function makeSession(userId) {
  const payload = Buffer.from(JSON.stringify({ uid: userId, t: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', sessionSecret()).update(payload).digest('hex');
  return payload + '.' + sig;
}

export function readSession(token) {
  const raw = String(token || '');
  const dot = raw.lastIndexOf('.');
  if (dot < 1) return null;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expect = crypto.createHmac('sha256', sessionSecret()).update(payload).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expect);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch (e) {
    return null;
  }
}

export function cookieFromRequest(req) {
  const header = req.headers.get('cookie') || '';
  const parts = header.split(';');
  for (const part of parts) {
    const [k, ...rest] = part.trim().split('=');
    if (k === STUDENT_COOKIE) return rest.join('=');
  }
  return '';
}

export async function userFromRequest(req) {
  const token = cookieFromRequest(req);
  const sess = readSession(token);
  if (!sess || !sess.uid) return null;
  const users = await getUsers();
  return users.find((u) => u && u.id === sess.uid) || null;
}

export function setAuthCookie(res, token, isHttps) {
  res.cookies.set(STUDENT_COOKIE, token, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: !!isHttps,
    maxAge: 60 * 60 * 24 * 30
  });
}

export function clearAuthCookie(res) {
  res.cookies.set(STUDENT_COOKIE, '', { path: '/', maxAge: 0 });
}

export function isHttpsReq(req) {
  return (req.headers.get('x-forwarded-proto') || '') === 'https' || String(req.url || '').startsWith('https');
}

export function validEmail(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value || '').trim().toLowerCase());
}

export function validName(value) {
  const name = String(value || '').trim();
  return name.length >= 2 && name.length <= 80;
}

export function validPassword(value) {
  return String(value || '').length >= 8 && String(value).length <= 128;
}

export async function upsertGoogleUser(profile) {
  const email = String(profile.email || '').trim().toLowerCase();
  const name = String(profile.name || email.split('@')[0] || 'Student').slice(0, 80);
  const googleId = String(profile.sub || '');
  const users = await getUsers();
  let user = users.find((u) => u && (u.email === email || (googleId && u.googleId === googleId)));
  const now = new Date().toISOString();
  if (!user) {
    user = {
      id: 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      name,
      email,
      provider: 'google',
      googleId,
      passwordHash: '',
      created: now,
      lastLogin: now,
      suspended: false,
      scores: {},
      labs: 0,
      tosVersion: TOS_VERSION,
      tosAcceptedAt: now
    };
    users.push(user);
  } else {
    if (user.suspended) return { error: 'This account is suspended. Contact the academy admin.' };
    user.name = user.name || name;
    user.googleId = user.googleId || googleId;
    user.provider = user.provider || 'google';
    user.lastLogin = now;
  }
  await setUsers(users);
  await logActivity({ userId: user.id, email: user.email, action: 'login', detail: 'google' });
  return { user };
}

export async function registerEmailUser({ name, email, password, tos }) {
  if (!tos) return { error: 'Accept the Terms of Service to create an account.' };
  if (!validName(name)) return { error: 'Enter your name (2-80 characters).' };
  if (!validEmail(email)) return { error: 'Enter a valid email address.' };
  if (!validPassword(password)) return { error: 'Password must be at least 8 characters.' };
  const clean = String(email).trim().toLowerCase();
  const users = await getUsers();
  if (users.some((u) => u && u.email === clean)) return { error: 'An account with that email already exists. Sign in instead.' };
  const now = new Date().toISOString();
  const user = {
    id: 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    name: String(name).trim(),
    email: clean,
    provider: 'email',
    googleId: '',
    passwordHash: hashPassword(password),
    created: now,
    lastLogin: now,
    suspended: false,
    scores: {},
    labs: 0,
    tosVersion: TOS_VERSION,
    tosAcceptedAt: now
  };
  users.push(user);
  await setUsers(users);
  await logActivity({ userId: user.id, email: user.email, action: 'register', detail: 'email' });
  return { user };
}

export async function loginEmailUser({ email, password }) {
  if (!validEmail(email) || !password) return { error: 'Enter email and password.' };
  const clean = String(email).trim().toLowerCase();
  const users = await getUsers();
  const user = users.find((u) => u && u.email === clean);
  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return { error: 'Invalid email or password.' };
  }
  if (user.suspended) return { error: 'This account is suspended. Contact the academy admin.' };
  user.lastLogin = new Date().toISOString();
  await setUsers(users);
  await logActivity({ userId: user.id, email: user.email, action: 'login', detail: 'email' });
  return { user };
}

export async function touchLab(userId, lab, scoreKey, score) {
  const users = await getUsers();
  const user = users.find((u) => u && u.id === userId);
  if (!user) return null;
  if (user.suspended) return null;
  user.labs = (user.labs || 0) + 1;
  user.lastLab = lab;
  user.lastLabAt = new Date().toISOString();
  if (scoreKey) {
    user.scores = user.scores || {};
    const prev = Number(user.scores[scoreKey] || 0);
    if (score > prev) user.scores[scoreKey] = score;
  }
  await setUsers(users);
  await logActivity({ userId: user.id, email: user.email, action: 'lab', detail: lab + (scoreKey ? ' score ' + score : '') });
  return publicUser(user);
}

export async function verifyGoogleToken(credential) {
  const token = String(credential || '');
  if (!token) return { error: 'Missing Google credential.' };
  const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(token);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.email) return { error: 'Google sign-in could not be verified.' };
    const expected = process.env.USER_GOOGLE_CLIENT_ID || '';
    if (expected && data.aud && data.aud !== expected) return { error: 'Google client mismatch.' };
    return { profile: data };
  } catch (e) {
    return { error: 'Google sign-in timed out. Try email login.' };
  } finally {
    clearTimeout(timer);
  }
}
