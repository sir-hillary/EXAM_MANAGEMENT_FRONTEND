import apiClient from './client';

export const subjectsApi = {
  getAll: (params = {}) =>
    apiClient.get('/subjects', { params }).then(res => res.data),

  getById: (id) =>
    apiClient.get(`/subjects/${id}`).then(res => res.data),

  create: (payload) =>
    apiClient.post('/subjects', payload).then(res => res.data),

  update: (id, payload) =>
    apiClient.put(`/subjects/${id}`, payload).then(res => res.data),

  patch: (id, payload) =>
    apiClient.patch(`/subjects/${id}`, payload).then(res => res.data),

  remove: (id) =>
    apiClient.delete(`/subjects/${id}`).then(res => res.data),
};