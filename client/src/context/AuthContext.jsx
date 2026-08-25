import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('nutriai_token');
    const cached = localStorage.getItem('nutriai_user');

    if (!token) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    // Set cached user immediately while verifying
    if (cached) {
      try {
        setUser(JSON.parse(cached));
      } catch {
        // ignore parse error
      }
    }

    try {
      const { data } = await authService.getMe();
      const u = data.data.user;
      setUser(u);
      localStorage.setItem('nutriai_user', JSON.stringify(u));
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('nutriai_token');
      localStorage.removeItem('nutriai_user');
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authService.login({ email, password });
    const { token, user: u } = data.data;
    localStorage.setItem('nutriai_token', token);
    localStorage.setItem('nutriai_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (name, email, password) => {
    const { data } = await authService.register({ name, email, password });
    const { token, user: u } = data.data;
    localStorage.setItem('nutriai_token', token);
    localStorage.setItem('nutriai_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('nutriai_token');
      localStorage.removeItem('nutriai_user');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await authService.getMe();
      const u = data.data.user;
      setUser(u);
      localStorage.setItem('nutriai_user', JSON.stringify(u));
      return u;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
