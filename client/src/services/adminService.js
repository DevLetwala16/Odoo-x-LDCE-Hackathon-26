import api from './api';

export const adminService = {
  getStats: () => api.get('/admin/stats').then(res => res.data || {}),
  getUsers: () => api.get('/admin/users').then(res => res.data.users || []),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then(res => res.data || null),
  getPopularCities: () => api.get('/admin/popular-cities').then(res => res.data || []),
  getPopularActivities: () => api.get('/admin/popular-activities').then(res => res.data || []),
};

export default adminService;
