import { NextResponse } from 'next/server';
import { omgJson } from '../../../lib/omegatech';
import { TEMP_NUMBER_URL, processOtps, filterInbox, PLATFORMS } from '../../../lib/tempnumber';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

let cache = { at: 0, otps: [], rawTotal: 0 };

async function loadOtps() {
  if (Date.now() - cache.at < 8000 && cache.otps.length) return cache;
  const { json, status } = await omgJson(TEMP_NUMBER_URL, 45000);
  const otps = (json && json.data && json.data.otps) || [];
  if (!otps.length && status !== 200) {
    if (cache.otps.length) return cache;
    throw new Error('Live numbers are unavailable right now.');
  }
  cache = {
    at: Date.now(),
    otps,
    rawTotal: (json && json.data && json.data.total) || otps.length
  };
  return cache;
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'overview';
    const bundle = await loadOtps();
    const processed = processOtps(bundle.otps);

    if (action === 'platforms') {
      return NextResponse.json(
        { ok: true, platforms: PLATFORMS },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    if (action === 'numbers') {
      const country = String(url.searchParams.get('country') || '');
      const numbers = country ? (processed.numbersByCountry[country] || []) : [];
      return NextResponse.json(
        { ok: true, country, numbers, updated: bundle.at, total: processed.total },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    if (action === 'inbox') {
      const number = String(url.searchParams.get('number') || '');
      const platform = String(url.searchParams.get('platform') || 'other');
      if (!number) return NextResponse.json({ ok: false, error: 'Number is required' }, { status: 400 });
      const inbox = filterInbox(bundle.otps, number, platform);
      return NextResponse.json(
        {
          ok: true,
          number,
          platform,
          messages: inbox.messages,
          latest: inbox.latest,
          updated: bundle.at
        },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        countries: processed.countries,
        numbersByCountry: processed.numbersByCountry,
        total: processed.total,
        feedTotal: bundle.rawTotal,
        updated: bundle.at
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e.message || 'Could not load live numbers' },
      { status: 502, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
