import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, HttpError } from '@/lib/api';
import { clearStoredSession, readStoredSession, writeStoredSession } from '@/lib/auth-storage';
import { ROUTER_BASENAME } from '@/lib/env';
import type { PermissionGrant, User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
  hasGrant: (grant: PermissionGrant) => boolean;
  hasAnyGrant: (...required: PermissionGrant[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = readStoredSession();
  const [user, setUser] = useState<User | null>(stored?.user ?? null);
  const [token, setToken] = useState<string | null>(stored?.token ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(!!stored?.token);

  const logout = useCallback(() => {
    clearStoredSession();
    setUser(null);
    setToken(null);
    setIsLoading(false);
  }, []);

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    if (token) {
      writeStoredSession({ token, user: nextUser });
    }
  }, [token]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const me = await api.auth.me();
      updateUser(me);
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout, token, updateUser]);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await api.auth.login({ username, password });
      setToken(response.token);
      setUser(response.user);
      writeStoredSession({ token: response.token, user: response.user });
      return { success: true };
    } catch (error) {
      const message = error instanceof HttpError ? error.message : 'Login failed';
      return { success: false, error: message };
    }
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      window.location.replace(`${ROUTER_BASENAME === "/" ? "" : ROUTER_BASENAME}/401`);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    if (!token) return;
    refreshUser();
  }, [refreshUser, token]);

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    refreshUser,
    updateUser,
    hasGrant: (grant: PermissionGrant) => !!user?.grants.includes(grant),
    hasAnyGrant: (...required: PermissionGrant[]) => required.some(grant => !!user?.grants.includes(grant)),
  }), [user, token, isLoading, login, logout, refreshUser, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
