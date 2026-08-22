import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPopularCities: () => api.get('/admin/popular-cities'),
  getPopularActivities: () => api.get('/admin/popular-activities'),
};

export default adminService;
