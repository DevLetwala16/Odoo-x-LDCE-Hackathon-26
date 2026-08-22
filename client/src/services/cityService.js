import api from './api';

export const cityService = {
  getCities: async (params) => {
    const res = await api.get('/cities', { params });
    return res?.cities || res?.data?.cities || res || [];
  },
  getCountries: async () => {
    const res = await api.get('/cities/countries');
    return res?.countries || res?.data?.countries || res || [];
  },
  getCityById: async (id) => {
    const res = await api.get(`/cities/${id}`);
    return res?.city || res?.data?.city || res || null;
  },
};

export default cityService;
