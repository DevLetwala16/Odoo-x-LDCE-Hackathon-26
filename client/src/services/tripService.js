import api from './api';

export const tripService = {
  getTrips: (params) => api.get('/trips', { params }).then(res => res.data.trips || []),
  getTripById: (id) => api.get(`/trips/${id}`).then(res => res.data.trip || null),
  createTrip: (data) => api.post('/trips', data).then(res => res.data.trip || null),
  updateTrip: (id, data) => api.put(`/trips/${id}`, data).then(res => res.data.trip || null),
  deleteTrip: (id) => api.delete(`/trips/${id}`).then(res => res.data || null),
};

export default tripService;
