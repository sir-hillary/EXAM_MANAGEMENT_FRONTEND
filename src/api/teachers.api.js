import apiClient from './client';

export const teachersApi = {
  getAll: (params = {}) =>
    apiClient.get('/teachers', { params }).then(res => res.data),

  getById: (id) =>
    apiClient.get(`/teachers/${id}`).then(res => res.data),

  create: (payload) =>
    apiClient.post('/teachers', payload).then(res => res.data),

  update: (id, payload) =>
    apiClient.put(`/teachers/${id}`, payload).then(res => res.data),

  patch: (id, payload) =>
    apiClient.patch(`/teachers/${id}`, payload).then(res => res.data),

  remove: (id) =>
    apiClient.delete(`/teachers/${id}`).then(res => res.data),
};