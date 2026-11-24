import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { CURRENT_USER, MOCK_USERS } from '../lib/mockData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: { username: string; email: string; displayName: string; pass: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  deleteAccount: () => void;
  checkUsernameAvailable: (username: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'vyro_registered_users';
const CURRENT_USER_KEY = 'vyro_session_user';
const RESERVED_NAMES = ['admin', 'vyro', 'official', 'support', 'help', 'root', 'security'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [currentUser]);

  // Username validation (case-insensitive, reserved names, format)
  const checkUsernameAvailable = (username: string): boolean => {
    const clean = username.trim().toLowerCase();
    if (clean.length < 3 || clean.length > 30) return false;
    if (!/^[a-z0-9_.]{3,30}$/.test(clean)) return false;
    if (RESERVED_NAMES.includes(clean)) return false;
    return !users.some((u) => u.username.toLowerCase() === clean);
  };

  const login = async (usernameOrEmail: string, _pass: string) => {
    const clean = usernameOrEmail.trim().toLowerCase();
    const found = users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );

    if (!found) {
      return { success: false, error: 'User not found. Please check your credentials.' };
    }

    setCurrentUser(found);
    return { success: true };
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
    // In production pass is hashed using bcrypt/Argon2
    void pass;
    const cleanUsername = username.trim().toLowerCase();
    if (!checkUsernameAvailable(cleanUsername)) {
      return { success: false, error: 'Username is taken, reserved, or invalid.' };
    }

    if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      displayName: displayName.trim() || cleanUsername,
      email: email.trim().toLowerCase(),
      avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50)}?w=150`,
      bio: 'New creator on VYRO ⚡',
      isPrivate: false,
      isVerified: false,
      themePreference: 'dark',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const deleteAccount = () => {
    if (!currentUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== currentUser.id));
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        signup,
        logout,
        updateProfile,
        deleteAccount,
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
