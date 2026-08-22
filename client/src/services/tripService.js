import api from './api';

export const tripService = {
  getTrips: (params) => api.get('/trips', { params }),
  getTripById: (id) => api.get(`/trips/${id}`),
  createTrip: (data) => api.post('/trips', data),
  updateTrip: (id, data) => api.put(`/trips/${id}`, data),
  deleteTrip: (id) => api.delete(`/trips/${id}`),
};

export default tripService;
