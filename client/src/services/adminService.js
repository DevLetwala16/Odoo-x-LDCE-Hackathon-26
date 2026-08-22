import api from './api';

export const adminService = {
  getStats: async (userId = 'all') => {
    const res = await api.get('/admin/stats', { params: { userId } });
    return res?.data || res || {};
  },
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res?.users || res?.data?.users || res || [];
  },
  updateUserRole: async (id, role) => {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    return res?.user || res?.data?.user || res || {};
  },
  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res?.data || res || null;
  },
  getPopularCities: async () => {
    const res = await api.get('/admin/popular-cities');
    return res?.cities || res?.data?.cities || res || [];
  },
  getPopularActivities: async () => {
    const res = await api.get('/admin/popular-activities');
    return res?.activities || res?.data?.activities || res || [];
  },
  getLoginLogs: async () => {
    const res = await api.get('/admin/login-logs');
    return res?.logs || res?.data?.logs || res || [];
  },
};

export default adminService;
