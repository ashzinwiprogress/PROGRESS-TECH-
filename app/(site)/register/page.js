'use client';
import { useState } from 'react';
import GoogleSignIn from '../../../components/GoogleSignIn';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tos, setTos] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  function go() {
    window.location.href = '/labs';
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, password, tos })
      });
      const d = await r.json();
      if (!d.ok) setErr(d.error || 'Could not register');
      else go();
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
          <div className="kicker">Join the academy</div>
          <h1>Create account</h1>
          <p className="muted">Register to track lab progress. You must accept the Terms. This platform is for legal, defensive learning only.</p>
          {err && <p className="err" style={{ marginTop: 12 }}>{err}</p>}
          <form className="form" onSubmit={submit} style={{ marginTop: 18 }}>
            <label>Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@academy.com" />
            <label>Password (8+ characters)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            <label className="check-row">
              <input type="checkbox" checked={tos} onChange={(e) => setTos(e.target.checked)} required />
              <span>I agree to the <a href="/terms" target="_blank" rel="noopener">Terms of Service</a> and will only use labs for authorized education.</span>
            </label>
            <button className="btn btn-gold" type="submit" disabled={busy}>{busy ? 'Creating...' : 'Register'}</button>
          </form>
          <div className="auth-or">or</div>
          <GoogleSignIn onOk={go} label="Google accounts also accept the Terms on first sign-in." />
          <p className="tiny" style={{ marginTop: 18 }}>Already enrolled? <a href="/login">Sign in</a></p>
        </div>
      </div>
    </section>
  );
}
