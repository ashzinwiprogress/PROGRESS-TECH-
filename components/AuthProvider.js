'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({
  user: undefined,
  ready: false,
  refresh: async () => {},
  setUser: () => {},
  logout: async () => {}
});

async function api(action, body) {
  const isPost = !!action;
  const r = await fetch('/api/auth', {
    method: isPost ? 'POST' : 'GET',
    cache: 'no-store',
    credentials: 'include',
    headers: isPost ? { 'Content-Type': 'application/json' } : { Accept: 'application/json' },
    body: isPost ? JSON.stringify({ action, ...body }) : undefined
  });
  return r.json().catch(() => ({ ok: false }));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  async function refresh() {
    try {
      const d = await api('');
      setUser(d.user || null);
      return d.user || null;
    } catch (e) {
      setUser(null);
      return null;
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function logout() {
    await api('logout');
    setUser(null);
    window.location.href = '/';
  }

  return (
    <AuthContext.Provider value={{ user, ready: user !== undefined, refresh, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { api as authApi };
