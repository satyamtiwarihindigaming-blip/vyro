import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiRequest, getAuthToken, setAuthToken } from '../lib/api';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPro: boolean;
  isAuthLoading: boolean;
  login: (usernameOrEmail: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    username: string;
    email: string;
    displayName: string;
    pass: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<boolean>;
  refreshSession: () => Promise<void>;
  checkUsernameAvailable: (username: string) => Promise<{ available: boolean; reason?: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  const refreshSession = async () => {
    const token = getAuthToken();
    if (!token) {
      setCurrentUser(null);
      setIsAuthLoading(false);
      return;
    }

    try {
      const res = await apiRequest<{ user: User }>('/api/auth/me');
      setCurrentUser(res.user);
    } catch {
      setAuthToken(null);
      setCurrentUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const checkUsernameAvailable = async (username: string) => {
    try {
      return await apiRequest<{ available: boolean; reason?: string | null }>(
        `/api/auth/check-username?username=${encodeURIComponent(username)}`
      );
    } catch {
      return { available: false, reason: 'error' };
    }
  };

  const login = async (usernameOrEmail: string, pass: string) => {
    try {
      const res = await apiRequest<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usernameOrEmail, pass }),
      });
      setAuthToken(res.token);
      setCurrentUser(res.user);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Login failed.' };
    }
  };

  const signup = async ({
    username,
    email,
    displayName,
    pass,
  }: {
    username: string;
    email: string;
    displayName: string;
    pass: string;
  }) => {
    try {
      const res = await apiRequest<{ user: User; token: string }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ username, email, displayName, pass }),
      });
      setAuthToken(res.token);
      setCurrentUser(res.user);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message || 'Registration failed.' };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const res = await apiRequest<{ user: User }>('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      setCurrentUser(res.user);
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: (err as Error).message };
    }
  };

  const deleteAccount = async () => {
    try {
      await apiRequest('/api/auth/account', { method: 'DELETE' });
      logout();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isAdmin: currentUser?.role === 'admin',
        isPro: Boolean(currentUser?.isPro || currentUser?.role === 'admin'),
        isAuthLoading,
        login,
        signup,
        logout,
        updateProfile,
        deleteAccount,
        refreshSession,
        checkUsernameAvailable,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
