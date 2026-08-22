import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data).then(res => res.data || {}),
  login: (data) => api.post('/auth/login', data).then(res => res.data || {}),
  getMe: () => api.get('/auth/me').then(res => res.data || {}),
  updateProfile: (data) => api.put('/auth/profile', data).then(res => res.data || {}),
  deleteAccount: () => api.delete('/auth/account').then(res => res.data || {}),
};

export default authService;
