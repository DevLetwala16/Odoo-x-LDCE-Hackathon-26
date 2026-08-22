import axios from 'axios';

/**
 * Axios base instance for all API calls.
 *
 * - Base URL is relative ('/api') — Vite proxy forwards to :5000 in dev.
 * - Request interceptor auto-attaches Bearer token from localStorage.
 * - Response interceptor unwraps the { success, data } envelope.
 */
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: unwrap envelope + handle auth errors ──
api.interceptors.response.use(
  (response) => {
    // Unwrap the standard envelope: { success: true, data: { ... } }
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'Something went wrong';

    // Auto-logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
