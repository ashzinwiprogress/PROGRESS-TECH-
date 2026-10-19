'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

const SEEN_KEY = 'pto_seen_posts';
const EMAIL_KEY = 'pto_notify_email';

function loadSeen() {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]'); } catch (e) { return []; }
}
function saveSeen(ids) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(ids.slice(-200))); } catch (e) {}
}
function timeAgo(iso) {
  const t = Date.parse(String(iso).replace(' ', 'T'));
  if (!t) return '';
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}

export default function NotifyBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [seen, setSeen] = useState([]);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [toast, setToast] = useState(null);
  const firstLoad = useRef(true);
  const seenRef = useRef([]);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/notify', { cache: 'no-store' });
      const d = await r.json();
      const list = Array.isArray(d.notifications) ? d.notifications : [];
      setItems(list);
      if (typeof d.emailEnabled === 'boolean') setEmailEnabled(d.emailEnabled);
      const seenIds = loadSeen();
      if (firstLoad.current) {
        firstLoad.current = false;
        const merged = Array.from(new Set([...seenIds, ...list.map((n) => n.id)]));
        saveSeen(merged);
        setSeen(merged);
        return;
      }
      const fresh = list.filter((n) => !seenIds.includes(n.id));
      if (fresh.length > 0) {
        setToast(fresh[0]);
        setTimeout(() => setToast(null), 6000);
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try { new Notification('New on PROGRESS TECH', { body: fresh[0].title }); } catch (e) {}
        }
      }
    } catch (e) { /* offline: keep last state */ }
  }, []);

  useEffect(() => {
    const s = loadSeen();
    seenRef.current = s;
    setSeen(s);
    try {
      const saved = localStorage.getItem(EMAIL_KEY);
      if (saved) { setEmail(saved); setSubscribed(true); }
    } catch (e) {}
    refresh();
    const t = setInterval(refresh, 15000);
    const onFocus = () => refresh();
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(t);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  const unread = items.filter((n) => !seen.includes(n.id)).length;

  function openPanel() {
    const next = Array.from(new Set([...seenRef.current, ...items.map((n) => n.id)]));
    saveSeen(next);
    seenRef.current = next;
    setSeen(next);
    setOpen((o) => !o);
  }

  async function subscribe(e) {
    e.preventDefault();
    setMessage('');
    try {
      const r = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'subscribe', email })
      });
      const d = await r.json();
      if (d.ok) {
        setSubscribed(true);
        try { localStorage.setItem(EMAIL_KEY, email); } catch (e2) {}
        setMessage(d.message || 'Subscribed.');
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          try { Notification.requestPermission(); } catch (e2) {}
        }
      } else {
        setMessage(d.error || 'Could not subscribe.');
      }
    } catch (e2) {
      setMessage('Could not subscribe. Check your connection.');
    }
  }

  async function unsubscribe() {
    try {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unsubscribe', email })
      });
    } catch (e) {}
    try { localStorage.removeItem(EMAIL_KEY); } catch (e) {}
    setSubscribed(false);
    setMessage('Notifications turned off.');
  }

  return (
    <div className="notify">
      <button className="notify-btn" type="button" aria-label="Notifications" onClick={openPanel}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && <span className="notify-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notify-panel glass">
          <div className="notify-head">
            <strong>Notifications</strong>
            <button type="button" className="notify-close" onClick={() => setOpen(false)} aria-label="Close">x</button>
          </div>

          <div className="notify-sub">
            {!emailEnabled && (
              <p className="tiny" style={{ marginBottom: 8, color: '#9ec4d6' }}>
                Email delivery is not configured on the server. You will still get in-site and browser alerts while the site is open.
              </p>
            )}
            {subscribed ? (
              <div className="notify-sub-on">
                <span className="tiny">Email alerts on for {email}</span>
                <button type="button" className="btn btn-ghost notify-small" onClick={unsubscribe}>Turn off</button>
              </div>
            ) : (
              <form className="notify-form" onSubmit={subscribe}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email for new-post alerts"
                  required
                />
                <button type="submit" className="btn btn-cyan notify-small">Notify me</button>
              </form>
            )}
            {message && <p className="tiny" style={{ marginTop: 8, color: '#ffd166' }}>{message}</p>}
          </div>

          <div className="notify-list">
            {items.length === 0 && <p className="tiny" style={{ padding: 14 }}>No updates yet. New posts will appear here.</p>}
            {items.map((n) => (
              <a className="notify-item" key={n.id} href="/explore">
                {n.cover
                  ? <img src={n.cover} alt="" />
                  : <span className="notify-dot" />}
                <span className="notify-meta">
                  <strong>{n.title}</strong>
                  <span className="tiny">{String(n.type).toUpperCase()} - {timeAgo(n.created)}</span>
                </span>
              </a>
            ))}
          </div>
          <a className="notify-all" href="/explore">See everything on Explore</a>
        </div>
      )}

      {toast && (
        <a className="notify-toast glass" href="/explore">
          <span className="notify-dot" />
          <span>
            <strong>New post</strong>
            <span className="tiny">{toast.title}</span>
          </span>
        </a>
      )}
    </div>
  );
}
