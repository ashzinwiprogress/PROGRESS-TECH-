'use client';

import { useEffect, useRef, useState } from 'react';
import { timeAgo } from '../../../../lib/tempnumber';

export default function Inbox({ country, number, flag, platform, platformName, unused }) {
  const [inbox, setInbox] = useState({ messages: [], latest: null });
  const [err, setErr] = useState('');
  const [copied, setCopied] = useState('');
  const [waiting, setWaiting] = useState(true);
  const [pulls, setPulls] = useState(0);
  const seenRef = useRef('');
  const sinceRef = useRef(unused ? Date.now() : 0);
  const inflight = useRef(false);

  async function load() {
    if (!number || inflight.current) return;
    inflight.current = true;
    try {
      const r = await fetch(
        '/api/temp-number?action=inbox&number=' + encodeURIComponent(number) +
          '&platform=' + encodeURIComponent(platform || 'other') +
          '&since=' + encodeURIComponent(sinceRef.current || 0),
        { cache: 'no-store' }
      );
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'Inbox unavailable');
      setInbox({ messages: d.messages || [], latest: d.latest || null });
      setErr('');
      setPulls((n) => n + 1);
      const code = d.latest && d.latest.otp;
      if (code && code !== seenRef.current) {
        seenRef.current = code;
        setWaiting(false);
        try { await navigator.clipboard.writeText(code); setCopied('Code copied'); } catch (e) {}
      }
    } catch (e) {
      setErr(e.message || 'Could not pull SMS.');
    } finally {
      inflight.current = false;
    }
  }

  useEffect(() => {
    sinceRef.current = unused ? Date.now() : 0;
    seenRef.current = '';
    setWaiting(true);
    load();
    const t = setInterval(load, 1500);
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [number, platform, unused]);

  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(''), 1600);
    } catch (e) {
      setCopied('Could not copy');
    }
  }

  if (!number) {
    return (
      <div className="glass p-tool">
        <p className="err">No number selected.</p>
        <a className="btn btn-cyan" href="/virtual-number">Choose a number</a>
      </div>
    );
  }

  const latest = inbox.latest;
  const qs = 'country=' + encodeURIComponent(country) + '&number=' + encodeURIComponent(number) + '&flag=' + encodeURIComponent(flag || '') + '&unused=' + (unused ? '1' : '0');

  return (
    <div className="vn-inbox">
      <div className="vn-selected glass">
        <span className="vn-flag">{flag}</span>
        <div>
          <div className="tiny">{country} · {platformName}{unused ? ' · unused line' : ''}</div>
          <strong className="vn-phone">{number}</strong>
        </div>
        <div className="btns">
          <button className="btn btn-cyan" type="button" onClick={() => copy(number, 'Number copied')}>Copy number</button>
          <a className="btn btn-ghost" href={'/virtual-number/platform?' + qs}>Change platform</a>
          <a className="btn btn-gold" href="/virtual-number">Change number</a>
        </div>
      </div>
      {copied && <p className="ok">{copied}</p>}

      <div className={'vn-otp glass' + (latest && latest.otp ? ' vn-otp-ready' : '')}>
        {latest && latest.otp ? (
          <>
            <div className="kicker">Code received</div>
            <div className="vn-code">{latest.otp}</div>
            <p className="tiny">{latest.sender || platformName} · {timeAgo(latest.ts)}</p>
            <p className="muted" style={{ marginTop: 8 }}>{latest.message}</p>
            <div className="btns" style={{ marginTop: 16 }}>
              <button className="btn btn-cyan" type="button" onClick={() => copy(latest.otp, 'Code copied')}>Copy code</button>
              <button className="btn btn-ghost" type="button" onClick={load}>Check again</button>
            </div>
          </>
        ) : (
          <>
            <div className="kicker">Waiting for SMS</div>
            <div className="loader" />
            <p className="muted">
              {waiting
                ? 'Copy the number, sign in on ' + platformName + ', then keep this tab open. Codes are pulled every 1.5s.'
                : 'No matching code yet. Keep this tab open.'}
            </p>
            <p className="tiny">Pulls: {pulls}</p>
            {err && <p className="err">{err}</p>}
            <button className="btn btn-ghost" type="button" onClick={load} style={{ marginTop: 12 }}>Pull now</button>
          </>
        )}
      </div>

      <h3 style={{ margin: '28px 0 12px' }}>Message history</h3>
      <div className="vn-msgs">
        {inbox.messages.map((m, i) => (
          <article className="glass vn-msg" key={i}>
            <div className="vn-msg-head">
              <strong>{m.sender || 'SMS'}</strong>
              <span className="tiny">{m.time} · {timeAgo(m.ts)}</span>
            </div>
            {m.otp && <div className="vn-mini-code">{m.otp}</div>}
            <p className="muted">{m.message}</p>
          </article>
        ))}
        {!inbox.messages.length && (
          <p className="muted">No {platformName} SMS on this number yet. Sign in, then wait a few seconds.</p>
        )}
      </div>
    </div>
  );
}
