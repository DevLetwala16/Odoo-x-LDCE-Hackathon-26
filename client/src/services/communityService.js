import api from './api';

export const communityService = {
  getPosts: (params) => api.get('/community', { params }),
  getPostById: (id) => api.get(`/community/${id}`),
  createPost: (data) => api.post('/community', data),
  updatePost: (id, data) => api.put(`/community/${id}`, data),
  deletePost: (id) => api.delete(`/community/${id}`),
  likePost: (id) => api.post(`/community/${id}/like`),
};

export default communityService;
