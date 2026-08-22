import api from './api';

export const adminService = {
  getStats: async (userId = 'all') => {
    const res = await api.get('/admin/stats', { params: { userId } });
    return res?.data || res || {};
  },
  getOverview: async () => {
    const res = await api.get('/admin/overview');
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
  toggleAdmin: async (id) => {
    const res = await api.put(`/admin/users/${id}/toggle-admin`);
    return res?.data || res || {};
  },
  deleteUser: async (id) => {
    const res = await api.delete(`/admin/users/${id}`);
    return res?.data || res || null;
  },
  getPopularCities: async () => {
    const res = await api.get('/admin/popular-cities');
    return res?.cities || res?.data?.cities || res || [];
  },
  getCities: async () => {
    const res = await api.get('/admin/cities');
    return res?.cities || res?.data?.cities || res || [];
  },
  createCity: async (cityForm) => {
    const res = await api.post('/admin/cities', cityForm);
    return res?.data || res || {};
  },
  updateCity: async (cityId, cityForm) => {
    const res = await api.put(`/admin/cities/${cityId}`, cityForm);
    return res?.data || res || {};
  },
  deleteCity: async (cityId) => {
    const res = await api.delete(`/admin/cities/${cityId}`);
    return res?.data || res || {};
  },
  createActivity: async (activityForm) => {
    const res = await api.post('/admin/activities', activityForm);
    return res?.data || res || {};
  },
  deleteActivity: async (activityId) => {
    const res = await api.delete(`/admin/activities/${activityId}`);
    return res?.data || res || {};
  },
  getActivitiesForCity: async (cityId) => {
    const res = await api.get('/activities', { params: { cityId } });
    return res?.activities || res?.data?.activities || res || [];
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
