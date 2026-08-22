import api from './api';

export const stopService = {
  createStop: (tripId, data) => api.post(`/stops/trips/${tripId}/stops`, data),
  updateStop: (id, data) => api.put(`/stops/${id}`, data),
  deleteStop: (id) => api.delete(`/stops/${id}`),
  reorderStops: (tripId, stopIds) => api.patch(`/stops/trips/${tripId}/stops/reorder`, { stopIds }),
};

export default stopService;
