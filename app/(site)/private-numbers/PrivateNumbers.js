'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

function formatMoney(amount, currency) {
  if (amount === null || amount === undefined) return '—';
  const cur = String(currency || 'USD').toUpperCase();
  const value = Number(amount);
  if (!Number.isFinite(value)) return '—';
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return cur === 'USD' ? '$' + formatted : formatted + ' ' + cur;
}

const DURATION_LABEL = {
  oneMonth: '1 month',
  threeMonths: '3 months',
  sixMonths: '6 months',
  oneYear: '12 months',
  oneWeek: '1 week'
};

function durationLabel(key) {
  return DURATION_LABEL[key] || String(key || '').replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

function when(value) {
  if (!value) return '—';
  const ts = Date.parse(String(value).replace(' ', 'T'));
  if (Number.isNaN(ts)) return String(value);
  return new Date(ts).toLocaleString();
}

async function callApi(query) {
  const res = await fetch('/api/private-number?' + new URLSearchParams(query).toString(), { cache: 'no-store' });
  const data = await res.json().catch(() => ({ ok: false, error: 'Unexpected response.' }));
  return { status: res.status, data };
}

export default function PrivateNumbers() {
  const [notice, setNotice] = useState('');
  const [catalog, setCatalog] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [account, setAccount] = useState(null);
  const [numbers, setNumbers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [duration, setDuration] = useState('');
  const [type, setType] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAccount = useCallback(async () => {
    const { data } = await callApi({ action: 'account' });
    if (data.ok) setAccount(data.account || null);
  }, []);

  const loadNumbers = useCallback(async () => {
    const { data } = await callApi({ action: 'numbers' });
    if (data.ok) {
      const items = data.items || [];
      setNumbers(items);
      setSelected((prev) => {
        if (prev && items.some((n) => String(n.id) === String(prev.id))) {
          return items.find((n) => String(n.id) === String(prev.id));
        }
        return items[0] || null;
      });
    }
  }, []);

  const loadCatalog = useCallback(async () => {
    const { status, data } = await callApi({ action: 'catalog' });
    if (data.ok) {
      setCatalog(data.countries || []);
      setCurrency(data.currency || 'USD');
      setNotice('');
      return data.countries || [];
    }
    setNotice(data.error || 'Could not load the catalog.');
    if (status === 503) setCatalog([]);
    return [];
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const list = await loadCatalog();
      if (!alive) return;
      await Promise.all([loadAccount(), loadNumbers()]);
      if (!alive) return;
      const first = list.find((c) => c.packages.length) || list[0];
      if (first) {
        setCountry((prev) => prev || first.code);
        setDuration(first.packages[0] ? first.packages[0].key : '');
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [loadCatalog, loadAccount, loadNumbers]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return catalog;
    return catalog.filter((c) => c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term));
  }, [catalog, q]);

  const activeCountry = useMemo(
    () => catalog.find((c) => c.code === country) || null,
    [catalog, country]
  );

  useEffect(() => {
    if (!activeCountry) return;
    const keys = activeCountry.packages.map((p) => p.key);
    if (!keys.includes(duration)) setDuration(keys[0] || '');
  }, [activeCountry, duration]);

  const loadMessages = useCallback(async (id) => {
    if (!id) return;
    const { data } = await callApi({ action: 'messages', id });
    if (data.ok) setMessages(data.items || []);
  }, []);

  useEffect(() => {
    if (!selected || !selected.id) {
      setMessages([]);
      return;
    }
    loadMessages(selected.id);
    const timer = setInterval(() => loadMessages(selected.id), 10000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadMessages(selected.id);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [selected, loadMessages]);

  async function requestNumber() {
    if (!country || !duration || busy) return;
    setBusy(true);
    setNotice('');
    try {
      const res = await fetch('/api/private-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'buy', country, duration, type })
      });
      const data = await res.json().catch(() => ({ ok: false, error: 'Unexpected response.' }));
      if (!data.ok) {
        setNotice(data.error || 'Could not get a number right now.');
        return;
      }
      setNotice('Private number ready: ' + data.number.number + ' (expires ' + when(data.number.expires) + ').');
      await Promise.all([loadNumbers(), loadAccount()]);
      await loadMessages(data.number.id);
    } catch (e) {
      setNotice('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  }

  async function copy(value, label) {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setNotice(label + ' copied.');
    } catch (e) {
      setNotice('Could not copy. Select the text manually.');
    }
  }

  return (
    <div className="pn">
      <div className="vn-bar glass">
        <div>
          <strong>{catalog.length || '—'}</strong>
          <span className="tiny"> countries</span>
        </div>
        <div>
          <strong>{numbers.length || '—'}</strong>
          <span className="tiny"> your numbers</span>
        </div>
        <div>
          <strong>{account && account.balance !== null ? formatMoney(account.balance, account.currency || currency) : '—'}</strong>
          <span className="tiny"> balance</span>
        </div>
        <div className="tiny">Codes refresh every 10s</div>
      </div>

      {notice && <p className={'pn-notice glass' + (/not connected|token|rejected/i.test(notice) ? ' pn-notice-bad' : '')}>{notice}</p>}

      <div className="pn-steps">
        <div className="pn-step glass">
          <div className="kicker">Step 1</div>
          <h3>Pick country and package</h3>
          <div className="searchbar" style={{ margin: '14px 0' }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search country or code..." aria-label="Search country" />
          </div>
          <div className="pn-country-list">
            {filtered.map((c) => (
              <button
                key={c.code || c.name}
                type="button"
                className={'pn-country' + (country === c.code ? ' active' : '')}
                onClick={() => setCountry(c.code)}
              >
                <span className="vn-flag">{c.flag || c.code.slice(0, 2)}</span>
                <span className="pn-country-meta">
                  <strong>{c.name}</strong>
                  <span className="tiny">
                    {c.packages.length} packages
                    {c.freeCount ? ' · ' + c.freeCount + ' free' : ''}
                    {c.cheapest !== null ? ' · from ' + formatMoney(c.cheapest, c.currency) : ''}
                  </span>
                </span>
              </button>
            ))}
            {!loading && !filtered.length && <p className="muted">No country matches that search.</p>}
            {loading && <div className="loader" />}
          </div>

          {activeCountry && (
            <>
              <div className="kicker" style={{ marginTop: 18 }}>Package</div>
              <div className="pn-chips">
                {activeCountry.packages.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className={'pn-chip' + (duration === p.key ? ' active' : '')}
                    onClick={() => setDuration(p.key)}
                  >
                    <strong>{durationLabel(p.key)}</strong>
                    <span className="tiny">{p.free ? 'Free' : formatMoney(p.price, p.currency)}</span>
                  </button>
                ))}
              </div>

              <div className="kicker" style={{ marginTop: 18 }}>Line type</div>
              <div className="pn-chips">
                {[
                  ['', 'Auto'],
                  ['voip', 'VoIP'],
                  ['non_voip', 'Mobile']
                ].map(([value, label]) => (
                  <button
                    key={value || 'auto'}
                    type="button"
                    className={'pn-chip' + (type === value ? ' active' : '')}
                    onClick={() => setType(value)}
                  >
                    <strong>{label}</strong>
                  </button>
                ))}
              </div>

              <button className="btn btn-cyan" type="button" onClick={requestNumber} disabled={busy || !duration} style={{ marginTop: 20 }}>
                {busy ? 'Getting your number...' : 'Get free private number'}
              </button>
              <p className="tiny" style={{ marginTop: 10 }}>
                Every request is charged against your provider wallet. Free packages cost 0.
              </p>
            </>
          )}
        </div>

        <div className="pn-step glass">
          <div className="kicker">Step 2</div>
          <h3>Your private numbers</h3>
          <div className="pn-number-list">
            {numbers.map((n) => (
              <button
                key={n.id || n.number}
                type="button"
                className={'pn-number' + (selected && String(selected.id) === String(n.id) ? ' active' : '')}
                onClick={() => setSelected(n)}
              >
                <span className="vn-flag">{n.flag || n.code || '#'}</span>
                <span className="pn-country-meta">
                  <strong className="vn-phone">{n.number}</strong>
                  <span className="tiny">
                    {n.country || n.code} · {n.type || 'line'} · expires {when(n.expires)}
                  </span>
                </span>
                <span className={'vn-pill' + (String(n.status).toLowerCase() === 'active' ? ' vn-pill-ok' : '')}>{n.status || 'active'}</span>
              </button>
            ))}
            {!numbers.length && !loading && (
              <p className="muted">No private numbers yet. Request one on the left.</p>
            )}
          </div>

          {selected && (
            <>
              <div className="vn-selected glass" style={{ marginTop: 18 }}>
                <span className="vn-flag">{selected.flag || selected.code}</span>
                <div>
                  <div className="tiny">{selected.country || selected.code} · {selected.type || 'line'}</div>
                  <strong className="vn-phone">{selected.number}</strong>
                </div>
                <div className="btns">
                  <button className="btn btn-cyan" type="button" onClick={() => copy(selected.number, 'Number')}>Copy number</button>
                  <button className="btn btn-ghost" type="button" onClick={() => loadMessages(selected.id)}>Refresh SMS</button>
                </div>
              </div>

              {selected.email && (
                <div className="pn-email">
                  <span className="tiny">Private inbox</span>
                  <div className="pn-email-row">
                    <strong>{selected.email}</strong>
                    <button className="btn btn-ghost" type="button" onClick={() => copy(selected.email, 'Email')}>Copy email</button>
                  </div>
                </div>
              )}

              <h4 style={{ margin: '18px 0 10px' }}>Live messages</h4>
              <div className="vn-msgs">
                {messages.map((m, i) => (
                  <article className="glass vn-msg" key={i}>
                    <div className="vn-msg-head">
                      <strong>{m.sender || 'SMS'}</strong>
                      <span className="tiny">{when(m.time)}</span>
                    </div>
                    {m.code && <div className="vn-mini-code">{m.code}</div>}
                    {m.message && <p className="muted">{m.message}</p>}
                  </article>
                ))}
                {!messages.length && (
                  <p className="muted">No messages yet. Use the number on the service you are verifying, then it appears here.</p>
                )}
              </div>
            </>
          )}

          {!selected && numbers.length > 0 && <p className="muted">Select a number to read its messages.</p>}
        </div>
      </div>

      <p className="tiny" style={{ marginTop: 24 }}>
        Numbers are masked where the provider returns masked values. Never use these lines for banking or identity
        verification of someone else.
      </p>
    </div>
  );
}
