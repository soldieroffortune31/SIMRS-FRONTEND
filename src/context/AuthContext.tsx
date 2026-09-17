'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authApi } from '@/lib/api';
import {
  User,
  ActiveContext,
  AvailableContext,
  MenuItem,
  LoginResult,
} from '@/lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  tempToken: string | null;
  activeContext: ActiveContext | null;
  availableContexts: AvailableContext[];
  menus: MenuItem[];
  permissions: string[];
  isLoading: boolean;
  isContextModalOpen: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  selectContext: (instalasi_id: number, ruangan_id: number) => Promise<void>;
  switchContext: (instalasi_id: number, ruangan_id: number) => Promise<void>;
  logout: () => void;
  openContextModal: () => void;
  closeContextModal: () => void;
  refreshMenus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [activeContext, setActiveContext] = useState<ActiveContext | null>(null);
  const [availableContexts, setAvailableContexts] = useState<AvailableContext[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isContextModalOpen, setIsContextModalOpen] = useState<boolean>(false);

  // Load session from localStorage on initial render
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('simrs_token');
      const storedUser = localStorage.getItem('simrs_user');
      const storedContext = localStorage.getItem('simrs_context');
      const storedMenus = localStorage.getItem('simrs_menus');
      const storedContexts = localStorage.getItem('simrs_available_contexts');

      if (storedToken && storedUser && storedContext) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setActiveContext(JSON.parse(storedContext));

        if (storedMenus) {
          setMenus(JSON.parse(storedMenus));
        }
        if (storedContexts) {
          setAvailableContexts(JSON.parse(storedContexts));
        }
      }
    } catch (e) {
      console.error('Error parsing stored session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session when context changes
  const saveSession = (data: LoginResult) => {
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('simrs_token', data.token);
    }
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('simrs_user', JSON.stringify(data.user));
    }
    if (data.active_context) {
      setActiveContext(data.active_context);
      localStorage.setItem('simrs_context', JSON.stringify(data.active_context));
    }
    if (data.menus) {
      setMenus(data.menus);
      localStorage.setItem('simrs_menus', JSON.stringify(data.menus));
    }
    if (data.available_contexts) {
      setAvailableContexts(data.available_contexts);
      localStorage.setItem('simrs_available_contexts', JSON.stringify(data.available_contexts));
    }
    if (data.permissions) {
      setPermissions(data.permissions);
    }
  };

  const login = async (username: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const response = await authApi.login(username, password);
      const result = response.data;

      if (result.status === 'REQUIRE_CONTEXT_SELECTION') {
        setTempToken(result.temp_token || null);
        setUser(result.user);
        if (result.available_contexts) {
          setAvailableContexts(result.available_contexts);
          localStorage.setItem('simrs_available_contexts', JSON.stringify(result.available_contexts));
        }
        setIsContextModalOpen(true);
        return result;
      }

      if (result.status === 'AUTHENTICATED') {
        saveSession(result);
        router.push('/dashboard');
        return result;
      }

      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const selectContext = async (instalasi_id: number, ruangan_id: number) => {
    setIsLoading(true);
    try {
      const response = await authApi.selectContext(
        instalasi_id,
        ruangan_id,
        tempToken || undefined
      );
      const result = response.data;
      saveSession(result);
      setIsContextModalOpen(false);
      setTempToken(null);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const switchContext = async (instalasi_id: number, ruangan_id: number) => {
    setIsLoading(true);
    try {
      const response = await authApi.switchContext(instalasi_id, ruangan_id);
      const result = response.data;
      saveSession(result);
      setIsContextModalOpen(false);
      // Reload current route or push to dashboard
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('simrs_token');
    localStorage.removeItem('simrs_user');
    localStorage.removeItem('simrs_context');
    localStorage.removeItem('simrs_menus');
    localStorage.removeItem('simrs_available_contexts');

    setUser(null);
    setToken(null);
    setTempToken(null);
    setActiveContext(null);
    setMenus([]);
    setPermissions([]);
    router.push('/login');
  }, [router]);

  const refreshMenus = async () => {
    try {
      const res = await authApi.getMenus();
      if (res.data) {
        setMenus(res.data);
        localStorage.setItem('simrs_menus', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to refresh menus:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        tempToken,
        activeContext,
        availableContexts,
        menus,
        permissions,
        isLoading,
        isContextModalOpen,
        login,
        selectContext,
        switchContext,
        logout,
        openContextModal: () => setIsContextModalOpen(true),
        closeContextModal: () => setIsContextModalOpen(false),
        refreshMenus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
