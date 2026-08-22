import api from './api';

export const communityService = {
  getPosts: (params) => api.get('/community', { params }).then(res => res.data || {}),
  getPostById: (id) => api.get(`/community/${id}`).then(res => res.data.post || null),
  createPost: (data) => api.post('/community', data).then(res => res.data.post || null),
  updatePost: (id, data) => api.put(`/community/${id}`, data).then(res => res.data.post || null),
  deletePost: (id) => api.delete(`/community/${id}`).then(res => res.data || null),
  likePost: (id) => api.post(`/community/${id}/like`).then(res => res.data.post || null),
};

export default communityService;
