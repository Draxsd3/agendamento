import axios from 'axios';

const normalizeBaseUrl = (value) => {
  if (!value) return '/api/v1';
  return value.endsWith('/api/v1') ? value : `${value.replace(/\/$/, '')}/api/v1`;
};

const parseTimeout = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 5000 ? parsed : fallback;
};

const REQUEST_TIMEOUT_MS = parseTimeout(import.meta.env.VITE_API_TIMEOUT_MS, 45000);

const api = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
  headers: { 'Content-Type': 'application/json' },
  timeout: REQUEST_TIMEOUT_MS,
});

const AUTH_PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/register-owner',
  '/auth/forgot-password',
  '/auth/reset-password',
];

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isPublicAuthRequest = AUTH_PUBLIC_PATHS.some((path) => requestUrl.includes(path));

    if (error.response?.status === 401 && !isPublicAuthRequest) {
      localStorage.removeItem('token');
      if (error.config?.url?.includes('/auth/me')) {
        return Promise.reject(error);
      }
      const path = window.location.pathname.split('/').filter(Boolean);
      const reserved = new Set(['login', 'cadastro', 'recuperar-senha', 'super-admin', 'admin', 'minha-conta']);
      const tenantSlug = path[0] && !reserved.has(path[0]) ? path[0] : null;
      window.location.href = tenantSlug ? `/${tenantSlug}/login` : '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
