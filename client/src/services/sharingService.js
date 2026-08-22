import api from './api';

const sharingService = {
  shareTrip: async (tripId) => {
    const response = await api.post(`/sharing/trips/${tripId}/share`);
    return response.data;
  },
  
  viewPublicTrip: async (slug) => {
    const response = await api.get(`/sharing/public/trips/${slug}`);
    return response.data;
  },
  
  copyPublicTrip: async (slug) => {
    const response = await api.post(`/sharing/public/trips/${slug}/copy`);
    return response.data;
  }
};

export default sharingService;
