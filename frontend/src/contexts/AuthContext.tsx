import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { users, demoAccounts } from '@/data/mock-data';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'asset_mgmt_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const user = users.find(u => u.id === parsed.userId);
        if (user) return { user, isAuthenticated: true };
      }
    } catch {}
    return { user: null, isAuthenticated: false };
  });

  const login = useCallback((username: string, password: string) => {
    const account = demoAccounts.find(a => a.username === username && a.password === password);
    if (!account) return { success: false, error: 'Invalid credentials' };
    const user = users.find(u => u.username === account.username);
    if (!user) return { success: false, error: 'User not found' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId: user.id }));
    setState({ user, isAuthenticated: true });
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
