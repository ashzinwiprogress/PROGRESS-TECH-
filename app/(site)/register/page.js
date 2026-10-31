'use client';
import { useEffect, useState } from 'react';
import GoogleSignIn from '../../../components/GoogleSignIn';
import { useAuth } from '../../../components/AuthProvider';

export default function Register() {
  const { user, ready, setUser, refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tos, setTos] = useState(true);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) window.location.replace('/labs');
  }, [ready, user]);

  async function enter(next) {
    setUser(next);
    try { document.cookie = 'pto_followed=1;path=/;max-age=' + 60 * 60 * 24 * 365; } catch (e) {}
    await refresh();
    window.location.replace('/labs');
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, password, tos })
      });
      const d = await r.json();
      if (!d.ok) setErr(d.error || 'Could not register');
      else await enter(d.user);
    } catch (e2) {
      setErr('Network error');
    } finally {
      setBusy(false);
    }
  }

  if (ready && user) {
    return (
      <section className="section">
        <div className="wrap"><p className="muted">You are already signed in. Opening labs...</p></div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap auth-wrap">
        <div className="glass auth-card">
          <div className="kicker">Join the academy</div>
          <h1>Create account</h1>
          <p className="muted">Register once. You are signed in automatically and sent to the labs. Legal, defensive learning only.</p>
          {err && <p className="err" style={{ marginTop: 12 }}>{err}</p>}
          <form className="form" onSubmit={submit} style={{ marginTop: 18 }}>
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" autoComplete="name" />
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@gmail.com" autoComplete="email" />
            <label>Password (8+ characters)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
            <label className="check-row">
              <input type="checkbox" checked={tos} onChange={(e) => setTos(e.target.checked)} required />
              <span>I agree to the <a href="/terms" target="_blank" rel="noopener">Terms of Service</a> and will only use labs for authorized education.</span>
            </label>
            <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Creating...' : 'Register and enter labs'}</button>
          </form>
          <div className="auth-or">or continue with Google</div>
          <GoogleSignIn onOk={enter} label="Use your Google email. You enter the academy immediately." />
          <p className="tiny" style={{ marginTop: 18 }}>Already enrolled? <a href="/login">Sign in</a></p>
        </div>
      </div>
    </section>
  );
}
