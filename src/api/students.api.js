import apiClient from "./client";

export const studentsApi = {
  getAll: (params = {}) =>
    apiClient.get("/students", { params }).then((res) => res.data),

  getById: (id) => apiClient.get(`/students/${id}`).then((res) => res.data),

  getResults: (id) =>
    apiClient.get(`/students/${id}/results`).then((res) => res.data),

  getReportCard: (id, examType) =>
    apiClient
      .get(`/students/${id}/report-card`, { params: { exam_type: examType } })
      .then((res) => res.data),

  create: (payload) =>
    apiClient.post("/students", payload).then((res) => res.data),

  update: (id, payload) =>
    apiClient.put(`/students/${id}`, payload).then((res) => res.data),

  patch: (id, payload) =>
    apiClient.patch(`/students/${id}`, payload).then((res) => res.data),

  remove: (id) => apiClient.delete(`/students/${id}`).then((res) => res.data),
  getGenderStats: (classId) =>
    apiClient
      .get("/students/stats/gender", {
        params: classId ? { class_id: classId } : {},
      })
      .then((res) => res.data),
};
