import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types/index.ts';
import { api, authStorage } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole, doctorId?: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check saved storage or initialize with default demo patient
    const savedUser = authStorage.getUser();
    const token = authStorage.getToken();

    if (savedUser && token) {
      setUser(savedUser);
      setLoading(false);
    } else {
      // Default to demo patient for smooth test driving
      api.demoSwitch('patient')
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {
          // fallback if offline
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
  };

  const register = async (payload: { name: string; email: string; password: string; phone?: string }) => {
    const res = await api.register(payload);
    setUser(res.user);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const switchDemoRole = async (targetRole: UserRole, doctorId?: string) => {
    const res = await api.demoSwitch(targetRole, doctorId);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        login,
        register,
        logout,
        switchDemoRole,
        isAuthenticated: !!user,
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
