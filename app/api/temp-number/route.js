import { NextResponse } from 'next/server';
import { omgJson } from '../../../lib/omegatech';
import {
  TEMP_NUMBER_URL,
  TEMP_NUMBERS_URL,
  processOtps,
  filterInbox,
  PLATFORMS,
  digitsOnly
} from '../../../lib/tempnumber';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };
const OTP_TTL = 1800;
const CATALOG_TTL = 90000;
const HISTORY_CAP = 400;
const HISTORY_PER_NUMBER = 50;

let otpCache = { at: 0, otps: [], rawTotal: 0 };
let catalogCache = { at: 0, numbers: [] };
const history = new Map();

function json(obj, status = 200) {
  return NextResponse.json(obj, { status, headers: NO_STORE });
}

function remember(otps) {
  const list = Array.isArray(otps) ? otps : [];
  for (const item of list) {
    const key = digitsOnly(item && item.number);
    if (!key) continue;
    const stamp = String((item && (item.time || item.otp || item.message)) || '');
    const prev = history.get(key) || [];
    const exists = prev.some((row) =>
      String(row.time || '') === String(item.time || '') &&
      String(row.message || '') === String(item.message || '') &&
      String(row.otp || '') === String(item.otp || '')
    );
    if (exists) continue;
    prev.unshift(item);
    if (prev.length > HISTORY_PER_NUMBER) prev.length = HISTORY_PER_NUMBER;
    history.set(key, prev);
  }
  while (history.size > HISTORY_CAP) {
    const first = history.keys().next().value;
    history.delete(first);
  }
}

async function loadOtps(force) {
  if (!force && Date.now() - otpCache.at < OTP_TTL && otpCache.otps.length) return otpCache;
  const { json: payload, status } = await omgJson(TEMP_NUMBER_URL, 18000);
  const otps = (payload && payload.data && payload.data.otps) || [];
  if (!otps.length && status !== 200) {
    if (otpCache.otps.length) return otpCache;
    throw new Error('Live numbers are unavailable right now.');
  }
  if (otps.length) {
    remember(otps);
    otpCache = {
      at: Date.now(),
      otps,
      rawTotal: (payload && payload.data && payload.data.total) || otps.length
    };
  } else if (!otpCache.at) {
    otpCache = { at: Date.now(), otps: [], rawTotal: 0 };
  }
  return otpCache;
}

async function loadCatalog() {
  if (Date.now() - catalogCache.at < CATALOG_TTL && catalogCache.numbers.length) return catalogCache;
  const { json: payload, status } = await omgJson(TEMP_NUMBERS_URL, 40000);
  const numbers = (payload && payload.data && payload.data.numbers) || [];
  if (!numbers.length && status !== 200) {
    if (catalogCache.numbers.length) return catalogCache;
    return catalogCache.at ? catalogCache : { at: Date.now(), numbers: [] };
  }
  catalogCache = { at: Date.now(), numbers };
  return catalogCache;
}

function inboxRows(number) {
  const key = digitsOnly(number);
  const fromHistory = history.get(key) || [];
  const fromLive = otpCache.otps.filter((item) => digitsOnly(item.number) === key);
  const merged = fromHistory.concat(fromLive);
  const seen = new Set();
  const unique = [];
  for (const item of merged) {
    const stamp = String(item.time || '') + '|' + String(item.message || '') + '|' + String(item.otp || '');
    if (seen.has(stamp)) continue;
    seen.add(stamp);
    unique.push(item);
  }
  return unique;
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'overview';

    if (action === 'platforms') {
      return json({ ok: true, platforms: PLATFORMS });
    }

    if (action === 'inbox') {
      const number = String(url.searchParams.get('number') || '');
      const platform = String(url.searchParams.get('platform') || 'other');
      const since = Number(url.searchParams.get('since') || 0);
      if (!number) return json({ ok: false, error: 'Number is required' }, 400);
      await loadOtps(true);
      const inbox = filterInbox(inboxRows(number), number, platform, since);
      return json({
        ok: true,
        number,
        platform,
        messages: inbox.messages,
        latest: inbox.latest,
        updated: Date.now()
      });
    }

    const [bundle, catalog] = await Promise.all([loadOtps(false), loadCatalog()]);
    const processed = processOtps(bundle.otps, catalog.numbers);

    if (action === 'numbers') {
      const country = String(url.searchParams.get('country') || '');
      const numbers = country ? (processed.numbersByCountry[country] || []) : [];
      return json({
        ok: true,
        country,
        numbers,
        updated: bundle.at,
        total: processed.total
      });
    }

    return json({
      ok: true,
      countries: processed.countries,
      numbersByCountry: processed.numbersByCountry,
      total: processed.total,
      unusedTotal: processed.unusedTotal,
      liveTotal: processed.liveTotal,
      feedTotal: bundle.rawTotal,
      catalogTotal: catalog.numbers.length,
      updated: Date.now()
    });
  } catch (e) {
    return json({ ok: false, error: e.message || 'Could not load live numbers' }, 502);
  }
}
