import api from './api';

export const cityService = {
  getCities: (params) => api.get('/cities', { params }).then(res => res.data.cities || []),
  getCityById: (id) => api.get(`/cities/${id}`).then(res => res.data.city || null),
};

export default cityService;
