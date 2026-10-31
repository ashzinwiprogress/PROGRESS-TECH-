'use client';
import { useEffect, useState } from 'react';

export default function AuthBar() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    fetch('/api/auth', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    });
    setUser(null);
    window.location.href = '/';
  }

  if (user === undefined) return null;

  if (!user) {
    return (
      <div className="auth-chip">
        <a className="btn btn-ghost nav-auth" href="/login">Sign in</a>
        <a className="btn btn-cyan nav-auth" href="/register">Join academy</a>
      </div>
    );
  }

  return (
    <div className="auth-chip">
      <a className="nav-user" href="/account">{user.name}</a>
      <button className="btn btn-ghost nav-auth" type="button" onClick={logout}>Out</button>
    </div>
  );
}
