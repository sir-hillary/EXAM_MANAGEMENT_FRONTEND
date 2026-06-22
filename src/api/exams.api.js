import apiClient from './client';

export const examsApi = {
  getAll: (params = {}) =>
    apiClient.get('/exams', { params }).then(res => res.data),

  getById: (id) =>
    apiClient.get(`/exams/${id}`).then(res => res.data),

  getResults: (id) =>
    apiClient.get(`/exams/${id}/results`).then(res => res.data),

  create: (payload) =>
    apiClient.post('/exams', payload).then(res => res.data),

  update: (id, payload) =>
    apiClient.put(`/exams/${id}`, payload).then(res => res.data),

  patch: (id, payload) =>
    apiClient.patch(`/exams/${id}`, payload).then(res => res.data),

  remove: (id) =>
    apiClient.delete(`/exams/${id}`).then(res => res.data),
};