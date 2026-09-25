'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { SafeUser } from '@/types';

interface AuthState {
  user: SafeUser | null;
  token: string | null;
  unreadCount: number;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem('tp_token');
    if (!t) { setLoading(false); return; }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json() as { success: boolean; data?: { user: SafeUser; unreadNotifications: number } };
      if (data.success && data.data) {
        setUser(data.data.user);
        setToken(t);
        setUnreadCount(data.data.unreadNotifications);
      } else {
        localStorage.removeItem('tp_token');
      }
    } catch {
      localStorage.removeItem('tp_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json() as {
        success: boolean;
        error?: string;
        data?: { token: string; user: SafeUser };
      };
      if (!data.success || !data.data) {
        return { success: false, error: data.error ?? 'Login failed' };
      }
      localStorage.setItem('tp_token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('tp_token');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, unreadCount, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Hook for making authenticated API calls */
export function useApi() {
  const { token, logout } = useAuth();

  const call = useCallback(async <T,>(
    url: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });
      if (res.status === 401) {
        logout();
        return { success: false, error: 'Session expired' };
      }
      return await res.json() as { success: boolean; data?: T; error?: string };
    } catch {
      return { success: false, error: 'Network error' };
    }
  }, [token, logout]);

  return { call };
}
