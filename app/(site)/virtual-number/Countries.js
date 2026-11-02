'use client';

import { useEffect, useMemo, useState } from 'react';
import { timeAgo, freshness } from '../../../lib/tempnumber';

export default function Countries() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [country, setCountry] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('unused');
  const [busy, setBusy] = useState(true);
  const [pulse, setPulse] = useState(0);

  async function load() {
    try {
      const r = await fetch('/api/temp-number?action=overview', { cache: 'no-store' });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Could not load numbers');
      setData(d);
      setErr('');
      setPulse(Date.now());
      setCountry((prev) => {
        if (prev && d.countries.some((c) => c.name === prev)) return prev;
        const unused = d.countries.find((c) => c.unusedCount > 0);
        const hot = d.countries.find((c) => c.hot) || d.countries[0];
        return (unused || hot || { name: '' }).name;
      });
    } catch (e) {
      setErr(e.message || 'Live feed is unavailable.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
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

  const numbers = useMemo(() => {
    const raw = ((data && data.numbersByCountry) || {})[country] || [];
    if (filter === 'unused') return raw.filter((n) => n.unused);
    if (filter === 'live') return raw.filter((n) => n.live || (!n.unused && n.latest));
    return raw;
  }, [data, country, filter, pulse]);

  return (
    <div className="vn">
      <div className="vn-bar glass">
        <div>
          <strong>{data ? data.unusedTotal : '—'}</strong>
          <span className="tiny"> unused</span>
        </div>
        <div>
          <strong>{data ? data.liveTotal : '—'}</strong>
          <span className="tiny"> live</span>
        </div>
        <div>
          <strong>{data ? data.countries.length : '—'}</strong>
          <span className="tiny"> countries</span>
        </div>
        <div className="tiny">Auto-updates every 4s{data ? ' · ' + timeAgo(data.updated) : ''}</div>
      </div>

      <div className="searchbar">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search country..." />
        <button className="btn btn-ghost" type="button" onClick={load}>Refresh now</button>
      </div>

      <div className="vn-filters">
        {[
          ['unused', 'Unused numbers'],
          ['live', 'Live / active'],
          ['all', 'All numbers']
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={'tab' + (filter === id ? ' active' : '')}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
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
                  <span className="tiny">
                    {c.unusedCount ? c.unusedCount + ' unused · ' : ''}
                    {c.liveCount ? c.liveCount + ' live · ' : ''}
                    {c.latest ? timeAgo(c.latest) : 'catalog'}
                  </span>
                </span>
                {c.unusedCount > 0 && <span className="vn-pill vn-pill-ok">New</span>}
                {c.hot && !c.unusedCount && <span className="vn-pill vn-pill-gold">Hot</span>}
              </button>
            ))}
            {!busy && !countries.length && <p className="muted">No countries match that search. Wait for the next pull.</p>}
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: 12 }}>2. Pick an unused or live number</h3>
          {!country && <p className="muted">Select a country to see numbers.</p>}
          <div className="vn-numbers">
            {numbers.map((n) => {
              const f = freshness(n.latest, n.unused);
              return (
                <a
                  key={n.number}
                  className={'vn-number glass' + (n.unused ? ' vn-number-unused' : '')}
                  href={'/virtual-number/platform?country=' + encodeURIComponent(n.country) + '&number=' + encodeURIComponent(n.number) + '&flag=' + encodeURIComponent(n.flag || '') + '&unused=' + (n.unused ? '1' : '0')}
                >
                  <div className="vn-number-top">
                    <span className="vn-flag">{n.flag}</span>
                    <span className={f.cls}>{f.label}</span>
                  </div>
                  <strong className="vn-phone">{n.number}</strong>
                  <span className="tiny">
                    {n.country} · {n.unused ? 'not used on any platform yet' : timeAgo(n.latest) + ' · ' + n.messageCount + ' SMS'}
                  </span>
                  {!n.unused && n.senders.length > 0 && (
                    <span className="tiny vn-senders">{n.senders.slice(0, 4).join(' · ')}</span>
                  )}
                </a>
              );
            })}
            {country && !numbers.length && (
              <p className="muted">
                {filter === 'unused'
                  ? 'No unused numbers for this country right now. Switch to Live or wait for the next catalog pull.'
                  : 'No live numbers for this country yet. Wait for the next pull.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
