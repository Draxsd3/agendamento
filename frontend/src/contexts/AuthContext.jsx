import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/auth.service';

// Decode JWT payload without external lib.
const decodeToken = (token) => {
  try {
    const payload = token?.split('.')[1];
    if (!payload) return {};

    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');

    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
};

const AuthContext = createContext(null);
const ACTIVE_ESTABLISHMENT_SLUG_KEY = 'activeEstablishmentSlug';
const OWNER_ACCOUNT_TYPE = 'establishment_admin';

const createApiError = (message, status = 500) => {
  const error = new Error(message);
  error.response = { status, data: { error: message } };
  return error;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem(ACTIVE_ESTABLISHMENT_SLUG_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const userData = await authService.me();
      const payload = decodeToken(storedToken);
      const enriched = {
        ...userData,
        establishmentSlug: payload.establishmentSlug || null,
        establishmentId:   payload.establishmentId   || null,
      };
      if (enriched.role !== 'customer') {
        localStorage.removeItem(ACTIVE_ESTABLISHMENT_SLUG_KEY);
      }
      setUser(enriched);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const { user: userData, token: newToken, establishment } = await authService.login(credentials);
    localStorage.setItem('token', newToken);
    setToken(newToken);
    const payload = decodeToken(newToken);
    const enriched = {
      ...userData,
      establishmentSlug: payload.establishmentSlug || establishment?.slug || null,
      establishmentId:   payload.establishmentId   || establishment?.id || null,
    };
    if (enriched.role === 'customer' && credentials.slug) {
      localStorage.setItem(ACTIVE_ESTABLISHMENT_SLUG_KEY, credentials.slug);
    } else if (enriched.role !== 'customer') {
      localStorage.removeItem(ACTIVE_ESTABLISHMENT_SLUG_KEY);
    }
    setUser(enriched);
    return enriched;
  };

  const register = async (data) => {
    const { user: userData, token: newToken, establishment } = await authService.register(data);
    const payload = decodeToken(newToken);
    const enriched = {
      ...userData,
      establishmentSlug: payload.establishmentSlug || establishment?.slug || null,
      establishmentId:   payload.establishmentId   || establishment?.id   || null,
    };

    const expectsOwnerAccount = data.accountType === OWNER_ACCOUNT_TYPE;
    if (expectsOwnerAccount && (enriched.role !== OWNER_ACCOUNT_TYPE || !enriched.establishmentSlug)) {
      clearSession();
      throw createApiError('Nao foi possivel ativar o painel do dono. Tente novamente em instantes.');
    }

    localStorage.setItem('token', newToken);
    setToken(newToken);
    if (enriched.role === 'customer' && data.slug) {
      localStorage.setItem(ACTIVE_ESTABLISHMENT_SLUG_KEY, data.slug);
    } else if (enriched.role !== 'customer') {
      localStorage.removeItem(ACTIVE_ESTABLISHMENT_SLUG_KEY);
    }
    setUser(enriched);
    return enriched;
  };

  const logout = clearSession;

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
