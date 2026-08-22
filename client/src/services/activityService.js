import api from './api';

export const activityService = {
  getActivities: (params) => api.get('/activities', { params }),
  addActivityToStop: (stopId, data) => api.post(`/activities/stops/${stopId}/activities`, data),
  removeActivityFromStop: (stopId, actId) => api.delete(`/activities/stops/${stopId}/activities/${actId}`),
};

export default activityService;
