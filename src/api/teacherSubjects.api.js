import apiClient from './client';

export const teacherSubjectsApi = {
  getAll: (params = {}) =>
    apiClient.get('/teacher-subjects', { params }).then(res => res.data),

  assign: (payload) =>
    apiClient.post('/teacher-subjects', payload).then(res => res.data),

  unassign: (id) =>
    apiClient.delete(`/teacher-subjects/${id}`).then(res => res.data),
};