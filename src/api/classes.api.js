import apiClient from "./client";

export const classesApi = {
  getAll: (params = {}) =>
    apiClient.get("/classes", { params }).then((res) => res.data),

  getById: (id) => apiClient.get(`/classes/${id}`).then((res) => res.data),

  getStudents: (id) =>
    apiClient.get(`/classes/${id}/students`).then((res) => res.data),

  create: (payload) =>
    apiClient.post("/classes", payload).then((res) => res.data),

  update: (id, payload) =>
    apiClient.put(`/classes/${id}`, payload).then((res) => res.data),

  patch: (id, payload) =>
    apiClient.patch(`/classes/${id}`, payload).then((res) => res.data),

  remove: (id) => apiClient.delete(`/classes/${id}`).then((res) => res.data),

getPerformance: async (classId, params) => {
  const response = await apiClient.get(
    `/classes/${classId}/performance`,
    { params },
  );

  return response.data;
},
  getTermReportCards: (id, termNumber, academicYear) =>
    apiClient
      .get(`/classes/${id}/term-report-cards`, {
        params: { term_number: termNumber, academic_year: academicYear },
      })
      .then((res) => res.data),
  // ─────────────────────────────────────────────
  // Timetable
  // ─────────────────────────────────────────────

  getTimetable: (classId) =>
    apiClient.get(`/classes/${classId}/timetable`).then((res) => res.data),

  upsertPeriod: (classId, payload) =>
    apiClient
      .put(`/classes/${classId}/timetable/period`, payload)
      .then((res) => res.data),

  deletePeriod: (classId, payload) =>
    apiClient
      .delete(`/classes/${classId}/timetable/period`, {
        data: payload,
      })
      .then((res) => res.data),

  // ─────────────────────────────────────────────
  // Student archive / restore / permanent delete
  // ─────────────────────────────────────────────

  archiveStudent: (classId, studentId, reason = null) =>
    apiClient
      .patch(`/classes/${classId}/students/${studentId}/archive`, { reason })
      .then((res) => res.data),

  unarchiveStudent: (classId, studentId) =>
    apiClient
      .patch(`/classes/${classId}/students/${studentId}/unarchive`)
      .then((res) => res.data),

  permanentDeleteStudent: (classId, studentId) =>
    apiClient
      .delete(`/classes/${classId}/students/${studentId}`)
      .then((res) => res.data),
};
