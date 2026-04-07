import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';

// Decode JWT payload without external lib
const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const userData = await authService.me();
      const payload = decodeToken(storedToken);
      setUser({
        ...userData,
        establishmentSlug: payload.establishmentSlug || null,
        establishmentId:   payload.establishmentId   || null,
      });
    } catch {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const { user: userData, token: newToken, establishment } = await authService.login(credentials);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser({ ...userData, establishmentSlug: establishment?.slug || null });
    return { ...userData, establishmentSlug: establishment?.slug || null };
  };

  const register = async (data) => {
    const { user: userData, token: newToken } = await authService.register(data);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'establishment_admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isSuperAdmin,
        isAdmin,
        isCustomer,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
