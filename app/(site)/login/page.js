'use client';
import { useState } from 'react';
import GoogleSignIn from '../../../components/GoogleSignIn';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  function go(user) {
    window.location.href = user && user.suspended ? '/login' : '/labs';
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      const d = await r.json();
      if (!d.ok) setErr(d.error || 'Sign in failed');
      else go(d.user);
    } catch (e2) {
      setErr('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section">
      <div className="wrap auth-wrap">
        <div className="glass auth-card">
          <div className="kicker">Student access</div>
          <h1>Sign in</h1>
          <p className="muted">Labs, quizzes and playgrounds are for registered academy students. All tools are defensive and educational.</p>
          {err && <p className="err" style={{ marginTop: 12 }}>{err}</p>}
          <form className="form" onSubmit={submit} style={{ marginTop: 18 }}>
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@academy.com" />
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button className="btn btn-cyan" type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <div className="auth-or">or</div>
          <GoogleSignIn onOk={go} />
          <p className="tiny" style={{ marginTop: 18 }}>
            New student? <a href="/register">Create an account</a> · <a href="/terms">Terms of Service</a>
          </p>
        </div>
      </div>
    </section>
  );
}
