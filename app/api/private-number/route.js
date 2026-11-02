import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  tnCall,
  tokenConfigured,
  setupHint,
  normalizeCatalog,
  normalizeInventory,
  normalizeNumbers,
  normalizeMessages,
  normalizeAccount
} from '../../../lib/privatenumber';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

function fail(error, status = 502, extra = {}) {
  return NextResponse.json({ ok: false, error, ...extra }, { status, headers: NO_STORE });
}

function notConfigured() {
  return NextResponse.json(
    { ok: false, code: 'not_configured', error: setupHint() },
    { status: 503, headers: NO_STORE }
  );
}

const buyHits = new Map();
const BUY_WINDOW_MS = 60 * 1000;
const BUY_LIMIT = 4;

function clientKey(req) {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  return forwarded.split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
}

function buyAllowed(key) {
  const now = Date.now();
  const hits = (buyHits.get(key) || []).filter((t) => now - t < BUY_WINDOW_MS);
  if (hits.length >= BUY_LIMIT) {
    buyHits.set(key, hits);
    return false;
  }
  hits.push(now);
  buyHits.set(key, hits);
  return true;
}

function cleanCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
}

function cleanDuration(value) {
  return String(value || '').trim().replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
}

function cleanId(value) {
  const raw = String(value || '').trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(raw) ? raw : '';
}

function providerError(res, fallback) {
  const status = res.status === 422 || res.status === 429 ? res.status : res.status === 401 || res.status === 403 ? 502 : 502;
  let message = res.error || fallback;
  if (res.status === 401 || res.status === 403) {
    message = 'The provider rejected the configured API token. Update TEMP_NUMBER_API_TOKEN with a valid token.';
  }
  return fail(message, status, { code: res.code || 'provider_error' });
}

export async function GET(req) {
  if (!tokenConfigured()) return notConfigured();
  const url = new URL(req.url);
  const action = String(url.searchParams.get('action') || 'catalog');

  try {
    if (action === 'catalog') {
      const res = await tnCall('/pricing');
      if (!res.ok) return providerError(res, 'Could not load the country catalog.');
      const catalog = normalizeCatalog(res.data);
      return NextResponse.json({ ok: true, ...catalog }, { headers: NO_STORE });
    }

    if (action === 'inventory') {
      const res = await tnCall('/inventory');
      if (!res.ok) return providerError(res, 'Could not load live inventory.');
      return NextResponse.json({ ok: true, ...normalizeInventory(res.data) }, { headers: NO_STORE });
    }

    if (action === 'account') {
      const res = await tnCall('/account');
      if (!res.ok) return providerError(res, 'Could not load your account balance.');
      return NextResponse.json({ ok: true, account: normalizeAccount(res.data) }, { headers: NO_STORE });
    }

    if (action === 'numbers') {
      const res = await tnCall('/numbers');
      if (!res.ok) return providerError(res, 'Could not load your private numbers.');
      return NextResponse.json({ ok: true, ...normalizeNumbers(res.data) }, { headers: NO_STORE });
    }

    if (action === 'messages') {
      const id = cleanId(url.searchParams.get('id'));
      if (!id) return fail('Choose a private number first.', 400);
      const res = await tnCall('/numbers/' + id + '/sms');
      if (!res.ok) return providerError(res, 'Could not load messages for this number.');
      return NextResponse.json({ ok: true, ...normalizeMessages(res.data) }, { headers: NO_STORE });
    }

    return fail('Unknown action.', 400);
  } catch (e) {
    return fail('Could not complete the request. Try again.', 502);
  }
}

export async function POST(req) {
  if (!tokenConfigured()) return notConfigured();
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || 'buy');

  if (action !== 'buy') return fail('Unknown action.', 400);

  const country = cleanCode(body.country);
  const duration = cleanDuration(body.duration);
  const type = String(body.type || '').trim();
  if (country.length !== 2) return fail('Country code must be two letters.', 400);
  if (!duration) return fail('Choose a package duration.', 400);
  if (type && type !== 'voip' && type !== 'non_voip') return fail('Number type must be voip or non_voip.', 400);

  const key = clientKey(req);
  if (!buyAllowed(key)) {
    return NextResponse.json(
      { ok: false, error: 'Too many number requests. Wait a minute and try again.' },
      { status: 429, headers: { ...NO_STORE, 'Retry-After': '60' } }
    );
  }

  const payload = { country_code: country, duration };
  if (type) payload.number_type = type;

  const idempotencyKey = crypto.randomUUID();
  let res = await tnCall('/numbers/buy', { method: 'POST', body: payload, idempotencyKey });
  if (!res.ok && (res.status === 404 || res.status === 405)) {
    res = await tnCall('/numbers/free', { method: 'POST', body: payload, idempotencyKey });
  }
  if (!res.ok) {
    return providerError(res, 'This number could not be provisioned. Try another country or package.');
  }

  const data = res.data && typeof res.data === 'object' ? res.data : {};
  return NextResponse.json(
    {
      ok: true,
      number: {
        id: data.id || null,
        number: data.phone_number || '',
        code: data.country_code || country,
        country: data.country_name || '',
        type: data.number_type || type || '',
        status: data.status || 'active',
        purchased: data.purchase_date || '',
        expires: data.expire_date || '',
        email: data.email || ''
      },
      meta: res.meta || null
    },
    { headers: NO_STORE }
  );
}
