import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../lib/mockData';

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
const PASSWORDS_STORAGE_KEY = 'vyro_user_passwords';
const RESERVED_NAMES = ['admin', 'vyro', 'official', 'support', 'help', 'root', 'security'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : MOCK_USERS;
    } catch {
      return MOCK_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [passwords, setPasswords] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(PASSWORDS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed to save users in localStorage', e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
    } catch (e) {
      console.warn('Failed to save passwords', e);
    }
  }, [passwords]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.warn('Failed to save session user', e);
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

  const login = async (usernameOrEmail: string, pass: string) => {
    const clean = usernameOrEmail.trim().toLowerCase();
    if (!clean) {
      return { success: false, error: 'Please enter your username or email.' };
    }

    const found = users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );

    if (!found) {
      return { success: false, error: 'No account found with this username or email.' };
    }

    // Check password if stored
    const storedPass = passwords[found.id];
    if (storedPass && storedPass !== pass) {
      return { success: false, error: 'Incorrect password. Please try again.' };
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
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername) {
      return { success: false, error: 'Username is required.' };
    }

    if (!checkUsernameAvailable(cleanUsername)) {
      return { success: false, error: 'Username is already taken or invalid.' };
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    if (!pass || pass.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    const AVATAR_SEEDS = [
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    ];

    const newUser: User = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      displayName: displayName.trim() || cleanUsername,
      email: cleanEmail,
      avatarUrl: AVATAR_SEEDS[Math.floor(Math.random() * AVATAR_SEEDS.length)],
      bio: 'New creator on VYRO ⚡',
      isPrivate: false,
      isVerified: false,
      themePreference: 'dark',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setPasswords((prev) => ({ ...prev, [newUser.id]: pass }));
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
