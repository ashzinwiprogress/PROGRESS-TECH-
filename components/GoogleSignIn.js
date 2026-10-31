'use client';
import { useEffect, useRef, useState } from 'react';

export default function GoogleSignIn({ onOk, label, tos }) {
  const [clientId, setClientId] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const onOkRef = useRef(onOk);
  onOkRef.current = onOk;

  useEffect(() => {
    fetch('/api/auth/google-config', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setClientId(d.clientId || ''))
      .catch(() => setClientId(''));
  }, []);

  useEffect(() => {
    if (!clientId || typeof window === 'undefined') return;
    const existing = document.getElementById('pto-gsi');
    if (!existing) {
      const s = document.createElement('script');
      s.id = 'pto-gsi';
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
    const timer = setInterval(() => {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) return;
      clearInterval(timer);
      window.google.accounts.id.initialize({
        client_id: clientId,
        ux_mode: 'popup',
        auto_select: true,
        cancel_on_tap_outside: true,
        callback: async (resp) => {
          setErr('');
          setBusy(true);
          try {
            const r = await fetch('/api/auth', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'google', credential: resp.credential, tos: true })
            });
            const d = await r.json();
            if (!d.ok) {
              setErr(d.error || 'Google sign-in failed');
              return;
            }
            if (onOkRef.current) onOkRef.current(d.user);
          } finally {
            setBusy(false);
          }
        }
      });
      const host = document.getElementById('pto-google-btn');
      if (host && !host.dataset.ready) {
        window.google.accounts.id.renderButton(host, {
          theme: 'filled_black',
          size: 'large',
          width: Math.min(360, host.parentElement ? host.parentElement.clientWidth : 320),
          text: 'continue_with',
          shape: 'pill'
        });
        host.dataset.ready = '1';
      }
      try { window.google.accounts.id.prompt(); } catch (e) {}
    }, 200);
    return () => clearInterval(timer);
  }, [clientId]);

  async function submitEmail(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google-email',
          email,
          name,
          tos: tos !== false
        })
      });
      const d = await r.json();
      if (!d.ok) {
        setErr(d.error || 'Could not continue with this email');
        return;
      }
      if (onOkRef.current) onOkRef.current(d.user);
    } catch (e2) {
      setErr('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="google-box">
      {clientId ? <div id="pto-google-btn" className="google-official"></div> : null}
      <button className="btn google-btn" type="button" onClick={() => setOpen(!open)} disabled={busy}>
        Continue with Google
      </button>
      {open && (
        <form className="form google-form" onSubmit={submitEmail}>
          <p className="tiny">Pick the Google email you use. We create your academy session immediately — no extra password.</p>
          <label>Google email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@gmail.com" autoComplete="email" />
          <label>Name on the account</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" autoComplete="name" />
          <button className="btn btn-cyan" type="submit" disabled={busy}>{busy ? 'Entering...' : 'Continue and enter labs'}</button>
        </form>
      )}
      {err && <p className="err" style={{ marginTop: 8 }}>{err}</p>}
      {label && <p className="tiny" style={{ marginTop: 8 }}>{label}</p>}
    </div>
  );
}
