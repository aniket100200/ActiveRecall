import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  AuthResponse,
  UserDto,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  LoginPayload,
  RegisterPayload,
} from '../../api/authApi';

interface AuthContextType {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const TOKEN_KEY = 'revisemind_auth_token';

const getStoredToken = (): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      return window.localStorage.getItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage errors
  }
  return null;
};

const setStoredToken = (token: string | null) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        window.localStorage.setItem(TOKEN_KEY, token);
      } else {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    }
  } catch {
    // Ignore storage errors
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);
        setUser(currentUser);
      } catch {
        setStoredToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, [token]);

  const handleAuthSuccess = (data: AuthResponse) => {
    setToken(data.token);
    setUser(data.user);
    setStoredToken(data.token);
  };

  const login = async (payload: LoginPayload) => {
    const data = await loginUser(payload);
    handleAuthSuccess(data);
  };

  const register = async (payload: RegisterPayload) => {
    const data = await registerUser(payload);
    handleAuthSuccess(data);
  };

  const logout = () => {
    if (token) {
      logoutUser(token);
    }
    setStoredToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
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
