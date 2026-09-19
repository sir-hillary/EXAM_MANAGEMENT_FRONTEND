import apiClient from "./client";

export const examsApi = {
  // ── Get all exams ─────────────────────────────────────────────
  // Supports pagination and query filters.
  getAll: (params = {}) =>
    apiClient
      .get("/exams", { params })
      .then((res) => res.data),

  // ── Get exam by ID ────────────────────────────────────────────
  getById: (id) =>
    apiClient
      .get(`/exams/${id}`)
      .then((res) => res.data),

  // ── Get results for an exam ───────────────────────────────────
  // Results are fetched from the results API using exam_id.
  getResults: (examId) =>
    apiClient
      .get("/results", {
        params: { exam_id: examId },
      })
      .then((res) => res.data),

  // ── Create exam ───────────────────────────────────────────────
  // Payload includes total_questions and subjects with question_count.
  create: (payload) =>
    apiClient
      .post("/exams", payload)
      .then((res) => res.data),

  // ── Replace/update exam ───────────────────────────────────────
  update: (id, payload) =>
    apiClient
      .put(`/exams/${id}`, payload)
      .then((res) => res.data),

  // ── Partially update exam ─────────────────────────────────────
  patch: (id, payload) =>
    apiClient
      .patch(`/exams/${id}`, payload)
      .then((res) => res.data),

  // ── Delete exam ───────────────────────────────────────────────
  remove: (id) =>
    apiClient
      .delete(`/exams/${id}`)
      .then((res) => res.data),
};

export default examsApi;