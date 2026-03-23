import axios from 'axios';

const AUTH_URL = import.meta.env.VITE_AUTH_API || 'http://localhost:5001';
const CONGRESS_URL = import.meta.env.VITE_CONGRESS_API || 'http://localhost:5002';
const SCRAPER_URL = import.meta.env.VITE_SCRAPER_API || 'http://localhost:5003';

const authApi = axios.create({ baseURL: AUTH_URL });
const congressApi = axios.create({ baseURL: CONGRESS_URL });
const scraperApi = axios.create({ baseURL: SCRAPER_URL });

// Inject token
[authApi, congressApi, scraperApi].forEach(api => {
  api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  });
  api.interceptors.response.use(
    r => r,
    err => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );
});

// ── Auth ──────────────────────────────────────────────────────────
export const authService = {
  login: (data) => authApi.post('/api/auth/login', data).then(r => r.data),
  register: (data) => authApi.post('/api/auth/register', data).then(r => r.data),
  me: () => authApi.get('/api/auth/me').then(r => r.data),
  updateProfile: (data) => authApi.put('/api/auth/profile', data).then(r => r.data),
  getUsers: () => authApi.get('/api/auth/users').then(r => r.data),
  setUserActive: (id, active) => authApi.patch(`/api/auth/users/${id}/active`, active).then(r => r.data),
};

// ── Congress ──────────────────────────────────────────────────────
export const congressService = {
  getAll: (params) => congressApi.get('/api/congresses', { params }).then(r => r.data),
  getById: (id) => congressApi.get(`/api/congresses/${id}`).then(r => r.data),
  create: (data) => congressApi.post('/api/congresses', data).then(r => r.data),
  update: (id, data) => congressApi.put(`/api/congresses/${id}`, data).then(r => r.data),
  delete: (id) => congressApi.delete(`/api/congresses/${id}`).then(r => r.data),
  getStats: () => congressApi.get('/api/congresses/stats').then(r => r.data),
  getScraperLogs: () => congressApi.get('/api/congresses/scraper-logs').then(r => r.data),
};

// ── Favorites ─────────────────────────────────────────────────────
export const favoriteService = {
  getAll: () => congressApi.get('/api/favorites').then(r => r.data),
  add: (id) => congressApi.post(`/api/favorites/${id}`).then(r => r.data),
  remove: (id) => congressApi.delete(`/api/favorites/${id}`).then(r => r.data),
};

// ── Notifications ─────────────────────────────────────────────────
export const notificationService = {
  getAll: () => congressApi.get('/api/notifications').then(r => r.data),
  markAllRead: () => congressApi.put('/api/notifications/read-all').then(r => r.data),
  broadcast: (data) => congressApi.post('/api/notifications/broadcast', data).then(r => r.data),
};

// ── Scraper ───────────────────────────────────────────────────────
export const scraperService = {
  run: () => scraperApi.post('/run').then(r => r.data),
};
