import apiClient from "./client";


export const classesApi = {
  getAll: (params = {}) =>
    apiClient.get('/classes', { params }).then(res => res.data),

  getById: (id) =>
    apiClient.get(`/classes/${id}`).then(res => res.data),

  getStudents: (id) =>
    apiClient.get(`/classes/${id}/students`).then(res => res.data),

  create: (payload) =>
    apiClient.post('/classes', payload).then(res => res.data),

  update: (id, payload) =>
    apiClient.put(`/classes/${id}`, payload).then(res => res.data),

  patch: (id, payload) =>
    apiClient.patch(`/classes/${id}`, payload).then(res => res.data),

  remove: (id) =>
    apiClient.delete(`/classes/${id}`).then(res => res.data),
};