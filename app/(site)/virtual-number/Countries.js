'use client';

import { useEffect, useMemo, useState } from 'react';
import { timeAgo } from '../../../lib/tempnumber';

function freshness(ts) {
  const age = Date.now() - (ts || 0);
  if (age < 30 * 60 * 1000) return { label: 'Fresh', cls: 'vn-pill vn-pill-ok' };
  if (age < 6 * 3600 * 1000) return { label: 'Active', cls: 'vn-pill vn-pill-gold' };
  return { label: 'Standby', cls: 'vn-pill' };
}

export default function Countries() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [country, setCountry] = useState('');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(true);

  async function load() {
    try {
      const r = await fetch('/api/temp-number?action=overview', { cache: 'no-store' });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Could not load numbers');
      setData(d);
      setErr('');
      setCountry((prev) => {
        if (prev && d.countries.some((c) => c.name === prev)) return prev;
        const hot = d.countries.find((c) => c.hot) || d.countries[0];
        return hot ? hot.name : '';
      });
    } catch (e) {
      setErr(e.message || 'Live feed is unavailable.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 12000);
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const countries = useMemo(() => {
    const list = (data && data.countries) || [];
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((c) => c.name.toLowerCase().includes(term));
  }, [data, q]);

  const numbers = ((data && data.numbersByCountry) || {})[country] || [];

  return (
    <div className="vn">
      <div className="vn-bar glass">
        <div>
          <strong>{data ? data.total : '—'}</strong>
          <span className="tiny"> live numbers</span>
        </div>
        <div>
          <strong>{data ? data.countries.length : '—'}</strong>
          <span className="tiny"> countries</span>
        </div>
        <div className="tiny">Auto-refresh every 12s{data ? ' · ' + timeAgo(data.updated) : ''}</div>
      </div>

      <div className="searchbar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search country..." />
        <button className="btn btn-ghost" type="button" onClick={load}>Refresh now</button>
      </div>

      {err && <p className="err">{err}</p>}
      {busy && !data && <div className="loader" />}

      <div className="vn-split">
        <div>
          <h3 style={{ marginBottom: 12 }}>1. Choose a country</h3>
          <div className="vn-countries">
            {countries.map((c) => (
              <button
                key={c.name}
                type="button"
                className={'vn-country glass' + (country === c.name ? ' active' : '')}
                onClick={() => setCountry(c.name)}
              >
                <span className="vn-flag">{c.flag || c.name.slice(0, 2)}</span>
                <span className="vn-country-meta">
                  <strong>{c.name}</strong>
                  <span className="tiny">{c.count} numbers · {timeAgo(c.latest)}</span>
                </span>
                {c.hot && <span className="vn-pill vn-pill-ok">Hot</span>}
              </button>
            ))}
            {!busy && !countries.length && <p className="muted">No countries match that search.</p>}
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: 12 }}>2. Pick a fresh number</h3>
          {!country && <p className="muted">Select a country to see live numbers.</p>}
          <div className="vn-numbers">
            {numbers.map((n) => {
              const f = freshness(n.latest);
              return (
                <a
                  key={n.number}
                  className="vn-number glass"
                  href={'/virtual-number/platform?country=' + encodeURIComponent(n.country) + '&number=' + encodeURIComponent(n.number) + '&flag=' + encodeURIComponent(n.flag || '')}
                >
                  <div className="vn-number-top">
                    <span className="vn-flag">{n.flag}</span>
                    <span className={f.cls}>{f.label}</span>
                  </div>
                  <strong className="vn-phone">{n.number}</strong>
                  <span className="tiny">{n.country} · {timeAgo(n.latest)} · {n.messageCount} SMS</span>
                  {n.senders.length > 0 && (
                    <span className="tiny vn-senders">{n.senders.slice(0, 4).join(' · ')}</span>
                  )}
                </a>
              );
            })}
            {country && !numbers.length && <p className="muted">No live numbers for this country yet. Wait for the next pull.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
