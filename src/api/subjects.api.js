import apiClient from "./client";

export const subjectsApi = {
  // ───────────────────────────────────────────────────────────────────────────
  // Get all subjects
  // GET /api/subjects
  // ───────────────────────────────────────────────────────────────────────────

  getAll: (params = {}) =>
    apiClient
      .get("/subjects", { params })
      .then((res) => res.data),

  // ───────────────────────────────────────────────────────────────────────────
  // Get one subject
  // GET /api/subjects/:id
  // ───────────────────────────────────────────────────────────────────────────

  getById: (id) =>
    apiClient
      .get(`/subjects/${id}`)
      .then((res) => res.data),

  // ───────────────────────────────────────────────────────────────────────────
  // Create subject
  // POST /api/subjects
  // ───────────────────────────────────────────────────────────────────────────

  create: (payload) =>
    apiClient
      .post("/subjects", payload)
      .then((res) => res.data),

  // ───────────────────────────────────────────────────────────────────────────
  // Replace subject
  // PUT /api/subjects/:id
  // ───────────────────────────────────────────────────────────────────────────

  update: (id, payload) =>
    apiClient
      .put(`/subjects/${id}`, payload)
      .then((res) => res.data),

  // ───────────────────────────────────────────────────────────────────────────
  // Partially update subject
  // PATCH /api/subjects/:id
  // ───────────────────────────────────────────────────────────────────────────

  patch: (id, payload) =>
    apiClient
      .patch(`/subjects/${id}`, payload)
      .then((res) => res.data),

  // ───────────────────────────────────────────────────────────────────────────
  // Delete subject
  // DELETE /api/subjects/:id
  // ───────────────────────────────────────────────────────────────────────────

  remove: (id) =>
    apiClient
      .delete(`/subjects/${id}`)
      .then((res) => res.data),

  // ───────────────────────────────────────────────────────────────────────────
  // Get subjects assigned to a class
  // GET /api/subjects/for-class
  //
  // Query parameters:
  //   class_id
  //   academic_year
  // ───────────────────────────────────────────────────────────────────────────

  getForClass: ({ class_id, academic_year }) =>
    apiClient
      .get("/subjects/for-class", {
        params: {
          class_id,
          academic_year,
        },
      })
      .then((res) => res.data),
};

export default subjectsApi;