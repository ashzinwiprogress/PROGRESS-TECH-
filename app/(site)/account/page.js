'use client';
import { useEffect } from 'react';
import { useAuth } from '../../../components/AuthProvider';

export default function Account() {
  const { user, ready, logout } = useAuth();

  useEffect(() => {
    if (ready && !user) window.location.replace('/login');
  }, [ready, user]);

  if (!user) {
    return (
      <section className="section">
        <div className="wrap"><p className="muted">Loading account...</p></div>
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
