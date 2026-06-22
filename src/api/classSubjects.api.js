import apiClient from './client';

export const classSubjectsApi = {
  getAll: (params = {}) =>
    apiClient.get('/class-subjects', { params }).then(res => res.data),

  assign: (payload) =>
    apiClient.post('/class-subjects', payload).then(res => res.data),

  patch: (id, payload) =>
    apiClient.patch(`/class-subjects/${id}`, payload).then(res => res.data),

  unassign: (id) =>
    apiClient.delete(`/class-subjects/${id}`).then(res => res.data),
};