'use client';
import { useAuth } from './AuthProvider';

export default function AuthBar() {
  const { user, ready, logout } = useAuth();

  if (!ready) {
    return <div className="auth-chip auth-chip-loading" aria-hidden="true"></div>;
  }

  if (!user) {
    return (
      <div className="auth-chip">
        <a className="btn btn-ghost nav-auth" href="/login">Sign in</a>
        <a className="btn btn-cyan nav-auth" href="/register">Join</a>
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
