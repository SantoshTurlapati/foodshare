import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  unreadCount: number;
  login: (email: string, pass: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserContext: (partialUser: Partial<User>) => void;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('foodshare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('foodshare_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('foodshare_token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      setUser(res.user);
      setUnreadCount(res.user.unreadNotificationsCount || 0);
      localStorage.setItem('foodshare_user', JSON.stringify(res.user));
    } catch {
      localStorage.removeItem('foodshare_token');
      localStorage.removeItem('foodshare_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Periodic notification count poll if logged in
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(async () => {
      try {
        const notifs = await notificationService.getNotifications();
        setUnreadCount(notifs.unreadCount);
      } catch {
        // silent fail
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await authService.login(email, pass);
    localStorage.setItem('foodshare_token', res.token);
    localStorage.setItem('foodshare_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    setUnreadCount(res.user.unreadNotificationsCount || 0);
    return res.user;
  };

  const register = async (data: any): Promise<User> => {
    const res = await authService.register(data);
    localStorage.setItem('foodshare_token', res.token);
    localStorage.setItem('foodshare_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    setUnreadCount(0);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('foodshare_token');
    localStorage.removeItem('foodshare_user');
    setToken(null);
    setUser(null);
    setUnreadCount(0);
  };

  const updateUserContext = (partialUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...partialUser };
      localStorage.setItem('foodshare_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        unreadCount,
        login,
        register,
        logout,
        refreshUser,
        updateUserContext,
        setUnreadCount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
