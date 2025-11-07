import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authServiceNew, User, AuthResponse } from '../services/authServiceNew';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  registrarAdmin: (email: string, nome: string, senha: string) => Promise<AuthResponse>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authServiceNew.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authServiceNew.login(email, password);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const registrarAdmin = async (email: string, nome: string, senha: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authServiceNew.registrarAdmin(email, nome, senha);
      if (response.success && response.user) {
        setUser(response.user);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authServiceNew.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    registrarAdmin,
    isAuthenticated: user !== null,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
