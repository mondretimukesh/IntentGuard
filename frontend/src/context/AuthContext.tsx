import React, { createContext, useContext, useState } from 'react';

export interface AuthUser {
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, role: 'user' | 'admin', name?: string) => void;
  register: (name: string, email: string, role: 'user' | 'admin') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('intentguard_user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = !!user;

  const login = (email: string, role: 'user' | 'admin', name?: string) => {
    const newUser: AuthUser = {
      name: name || (email.split('@')[0]) || 'Security Analyst',
      email,
      role,
    };
    setUser(newUser);
    localStorage.setItem('intentguard_user', JSON.stringify(newUser));
  };

  const register = (name: string, email: string, role: 'user' | 'admin') => {
    const newUser: AuthUser = {
      name,
      email,
      role,
    };
    setUser(newUser);
    localStorage.setItem('intentguard_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('intentguard_user');
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
