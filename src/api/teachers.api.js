import apiClient from "./client";

export const teachersApi = {
  getAll: (params = {}) =>
    apiClient.get("/teachers", { params }).then((res) => res.data),

  getById: (id) => apiClient.get(`/teachers/${id}`).then((res) => res.data),

  create: (payload) =>
    apiClient.post("/teachers", payload).then((res) => res.data),

  update: (id, payload) =>
    apiClient.put(`/teachers/${id}`, payload).then((res) => res.data),

  patch: (id, payload) =>
    apiClient.patch(`/teachers/${id}`, payload).then((res) => res.data),

  remove: (id) => apiClient.delete(`/teachers/${id}`).then((res) => res.data),

  // ─────────────────────────────────────────────
  // Teacher profile
  // ─────────────────────────────────────────────

  uploadPhoto: (id, formData) =>
    apiClient.post(`/teachers/${id}/photo`, formData).then((res) => res.data),

  setDesignation: (id, designation) =>
    apiClient
      .patch(`/teachers/${id}/designation`, { designation })
      .then((res) => res.data),

  deactivate: (id) =>
    apiClient.patch(`/teachers/${id}/deactivate`).then((res) => res.data),

  activate: (id) =>
    apiClient.patch(`/teachers/${id}/activate`).then((res) => res.data),

  getMe: () => apiClient.get("/teachers/me").then((res) => res.data),
};
