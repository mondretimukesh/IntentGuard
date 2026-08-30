import React, { createContext, useContext, useState } from 'react';
import { loginUser, registerUser, clearAuthToken, setAuthToken } from '../services/api';

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  organization?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, role: 'user' | 'admin', name?: string, password?: string) => Promise<void>;
  register: (name: string, email: string, role: 'user' | 'admin', password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('intentguard_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = !!user;

  const login = async (email: string, role: 'user' | 'admin', name?: string, password?: string) => {
    try {
      if (password) {
        const authData = await loginUser(email, password);
        const newUser: AuthUser = {
          id: authData.user.id,
          name: authData.user.name || name || email.split('@')[0],
          email: authData.user.email,
          role: authData.user.role,
          organization: authData.user.organization || 'General Analyst',
        };
        setUser(newUser);
        localStorage.setItem('intentguard_user', JSON.stringify(newUser));
        return;
      }
    } catch (err) {
      console.warn('Backend login API returned error, continuing with local state:', err);
    }

    // Fallback if password was empty or offline
    const fallbackUser: AuthUser = {
      name: name || (email.split('@')[0]) || 'Security Analyst',
      email,
      role,
      organization: 'CTI Security Team',
    };
    setUser(fallbackUser);
    localStorage.setItem('intentguard_user', JSON.stringify(fallbackUser));
  };

  const register = async (name: string, email: string, role: 'user' | 'admin', password?: string) => {
    try {
      if (password) {
        const authData = await registerUser(name, email, password, role);
        const newUser: AuthUser = {
          id: authData.user.id,
          name: authData.user.name || name,
          email: authData.user.email,
          role: authData.user.role,
          organization: authData.user.organization || 'General Analyst',
        };
        setUser(newUser);
        localStorage.setItem('intentguard_user', JSON.stringify(newUser));
        return;
      }
    } catch (err) {
      console.warn('Backend register API returned error, continuing with local state:', err);
    }

    const fallbackUser: AuthUser = {
      name,
      email,
      role,
      organization: 'General Analyst',
    };
    setUser(fallbackUser);
    localStorage.setItem('intentguard_user', JSON.stringify(fallbackUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('intentguard_user');
    clearAuthToken();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
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
