import api from './api';

export const teamApi = {
  getAll: () => api.get('/api/teams'),
  create: (payload) => api.post('/api/teams', payload),
  getById: (id) => api.get(`/api/teams/${id}`),
  update: (id, payload) => api.put(`/api/teams/${id}`, payload),
  delete: (id) => api.delete(`/api/teams/${id}`),
  addMember: (teamId, payload) => api.post(`/api/teams/${teamId}/members`, payload),
};