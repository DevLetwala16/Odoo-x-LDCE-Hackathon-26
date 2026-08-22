import api from './api';

const sharingService = {
  shareTrip: async (tripId) => {
    const response = await api.post(`/trips/${tripId}/share`);
    return response.data;
  },
  
  viewPublicTrip: async (slug) => {
    const response = await api.get(`/trips/shared/${slug}`);
    return response.data;
  },
  
  copyPublicTrip: async (slug) => {
    const response = await api.post(`/trips/shared/${slug}/copy`);
    return response.data;
  }
};

export default sharingService;
