'use client';
import { useEffect, useState } from 'react';
import GoogleSignIn from '../../../components/GoogleSignIn';
import { useAuth } from '../../../components/AuthProvider';

export default function Login() {
  const { user, ready, setUser, refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        body: JSON.stringify({ action: 'login', email, password })
      });
      const d = await r.json();
      if (!d.ok) setErr(d.error || 'Sign in failed');
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
          <div className="kicker">Student access</div>
          <h1>Sign in</h1>
          <p className="muted">One session. After you enter, you stay logged in on this device. All tools are defensive and educational.</p>
          {err && <p className="err" style={{ marginTop: 12 }}>{err}</p>}
          <form className="form" onSubmit={submit} style={{ marginTop: 18 }}>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@gmail.com" autoComplete="email" />
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            <button className="btn btn-cyan" type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign in and enter'}</button>
          </form>
          <div className="auth-or">or continue with Google</div>
          <GoogleSignIn onOk={enter} />
          <p className="tiny" style={{ marginTop: 18 }}>
            New student? <a href="/register">Create an account</a> · <a href="/terms">Terms of Service</a>
          </p>
        </div>
      </div>
    </section>
  );
}
