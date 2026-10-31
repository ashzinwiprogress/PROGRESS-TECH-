'use client';
import { useEffect, useRef, useState } from 'react';

export default function GoogleSignIn({ onOk, label }) {
  const [clientId, setClientId] = useState('');
  const [err, setErr] = useState('');
  const onOkRef = useRef(onOk);
  onOkRef.current = onOk;

  useEffect(() => {
    fetch('/api/auth/google-config')
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
        callback: async (resp) => {
          setErr('');
          const r = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'google', credential: resp.credential })
          });
          const d = await r.json();
          if (!d.ok) {
            setErr(d.error || 'Google sign-in failed');
            return;
          }
          if (onOkRef.current) onOkRef.current(d.user);
        }
      });
      const host = document.getElementById('pto-google-btn');
      if (host && !host.dataset.ready) {
        window.google.accounts.id.renderButton(host, {
          theme: 'filled_black',
          size: 'large',
          width: 320,
          text: 'continue_with'
        });
        host.dataset.ready = '1';
      }
    }, 200);
    return () => clearInterval(timer);
  }, [clientId]);

  if (!clientId) {
    return (
      <p className="tiny">
        Google sign-in is optional. Set <code>USER_GOOGLE_CLIENT_ID</code> in the project env to enable it.
        Email register still works.
      </p>
    );
  }

  return (
    <div>
      <div id="pto-google-btn" style={{ display: 'flex', justifyContent: 'center' }}></div>
      {err && <p className="err" style={{ marginTop: 8 }}>{err}</p>}
      {label && <p className="tiny" style={{ marginTop: 8 }}>{label}</p>}
    </div>
  );
}
