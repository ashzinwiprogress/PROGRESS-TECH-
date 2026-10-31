'use client';
import { useEffect, useState } from 'react';

export default function Account() {
  const [user, setUser] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch('/api/auth', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) window.location.href = '/login';
        else setUser(d.user);
      })
      .catch(() => setErr('Could not load account'));
  }, []);

  async function logout() {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    window.location.href = '/';
  }

  if (!user) {
    return (
      <section className="section">
        <div className="wrap"><p className="muted">{err || 'Loading account...'}</p></div>
      </section>
    );
  }

  const scores = user.scores || {};

  return (
    <section className="section">
      <div className="wrap">
        <div className="kicker">Student dossier</div>
        <h1>{user.name}</h1>
        <p className="muted">{user.email} · {user.provider} · joined {String(user.created || '').slice(0, 10)}</p>
        <div className="stats">
          <div className="glass" style={{ padding: 18 }}><div className="tiny">Labs run</div><h2>{user.labs || 0}</h2></div>
          <div className="glass" style={{ padding: 18 }}><div className="tiny">Status</div><h2 style={{ fontSize: 22 }}>{user.suspended ? 'Suspended' : 'Active'}</h2></div>
          <div className="glass" style={{ padding: 18 }}><div className="tiny">ToS</div><h2 style={{ fontSize: 22 }}>v{user.tosVersion || 1}</h2></div>
        </div>
        <div className="glass" style={{ padding: 24, marginBottom: 22 }}>
          <h3>Quiz scores</h3>
          {Object.keys(scores).length === 0 && <p className="tiny" style={{ marginTop: 8 }}>No scores yet. Open Labs and take a quiz.</p>}
          <ul className="muted" style={{ paddingLeft: 18, marginTop: 10 }}>
            {Object.entries(scores).map(([k, v]) => (
              <li key={k}>{k}: {v}</li>
            ))}
          </ul>
        </div>
        <div className="btns">
          <a className="btn btn-cyan" href="/labs">Open labs</a>
          <a className="btn btn-ghost" href="/terms">Terms</a>
          <button className="btn btn-gold" type="button" onClick={logout}>Sign out</button>
        </div>
      </div>
    </section>
  );
}
