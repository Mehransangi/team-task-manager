import api from './api';

export const taskApi = {
  getAll: (params = {}) => api.get('/api/tasks', { params }),
  create: (payload) => api.post('/api/tasks', payload),
  getById: (id) => api.get(`/api/tasks/${id}`),
  update: (id, payload) => api.put(`/api/tasks/${id}`, payload),
  delete: (id) => api.delete(`/api/tasks/${id}`),
};
