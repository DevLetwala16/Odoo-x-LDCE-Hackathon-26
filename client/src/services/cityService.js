import api from './api';

export const cityService = {
  getCities: (params) => api.get('/cities', { params }),
  getCityById: (id) => api.get(`/cities/${id}`),
};

export default cityService;
