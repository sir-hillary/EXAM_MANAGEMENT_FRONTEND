import apiClient from './client';

export const resultsApi = {
  getByExam: (examId) =>
    apiClient.get('/results', { params: { exam_id: examId } }).then(res => res.data),

  getByStudent: (studentId) =>
    apiClient.get('/results', { params: { student_id: studentId } }).then(res => res.data),

  getMine: () =>
    apiClient.get('/results').then(res => res.data), // for logged-in students — backend infers their id from JWT

  getById: (id) =>
    apiClient.get(`/results/${id}`).then(res => res.data),

  getExamSummary: (examId) =>
    apiClient.get(`/results/exam/${examId}/summary`).then(res => res.data),

  create: (payload) =>
    apiClient.post('/results', payload).then(res => res.data),

  bulkCreate: (payload) =>
    apiClient.post('/results/bulk', payload).then(res => res.data),

  patch: (id, payload) =>
    apiClient.patch(`/results/${id}`, payload).then(res => res.data),

  remove: (id) =>
    apiClient.delete(`/results/${id}`).then(res => res.data),
};