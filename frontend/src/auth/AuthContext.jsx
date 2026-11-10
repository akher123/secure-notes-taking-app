import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setUnauthorizedHandler } from '../api/client';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
      navigate('/login', { replace: true });
    });
  }, [logout, navigate]);

  const applySession = useCallback((result) => {
    persistSession(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const login = useCallback(
    async (email, password) => {
      const result = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return applySession(result);
    },
    [applySession]
  );

  const register = useCallback(
    async ({ name, email, password }) => {
      const result = await api('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      return applySession(result);
    },
    [applySession]
  );

  const value = useMemo(
    () => ({ token, user, login, register, logout }),
    [token, user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
