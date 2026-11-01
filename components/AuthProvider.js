export function AuthProvider({ children }) {
  return children;
}

export function useAuth() {
  return { user: null, ready: true, refresh: async () => null, setUser: () => {}, logout: async () => {} };
}
