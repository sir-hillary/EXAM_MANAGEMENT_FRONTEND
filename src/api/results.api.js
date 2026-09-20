import apiClient from "./client";

export const resultsApi = {
  /*
  |--------------------------------------------------------------------------
  | Results by exam
  |--------------------------------------------------------------------------
  |
  | Returns all learner results belonging to an exam.
  |
  | GET /results?exam_id=:examId
  |
  */
  getByExam: (examId) =>
    apiClient
      .get("/results", {
        params: {
          exam_id: examId,
        },
      })
      .then((res) => res.data),

  /*
  |--------------------------------------------------------------------------
  | Results by student
  |--------------------------------------------------------------------------
  |
  | Returns all results belonging to a specific learner.
  |
  | GET /results?student_id=:studentId
  |
  */
  getByStudent: (studentId) =>
    apiClient
      .get("/results", {
        params: {
          student_id: studentId,
        },
      })
      .then((res) => res.data),

  /*
  |--------------------------------------------------------------------------
  | Logged-in student's results
  |--------------------------------------------------------------------------
  |
  | The backend identifies the student from the authenticated JWT.
  |
  | GET /results
  |
  */
  getMine: () => apiClient.get("/results").then((res) => res.data),

  /*
  |--------------------------------------------------------------------------
  | Single result
  |--------------------------------------------------------------------------
  |
  | GET /results/:id
  |
  */
  getById: (id) => apiClient.get(`/results/${id}`).then((res) => res.data),

  /*
  |--------------------------------------------------------------------------
  | Exam summary
  |--------------------------------------------------------------------------
  |
  | Returns statistics for all results belonging to an exam.
  |
  | GET /results/exam/:examId/summary
  |
  */
  getExamSummary: (examId) =>
    apiClient.get(`/results/exam/${examId}/summary`).then((res) => res.data),

  /*
  |--------------------------------------------------------------------------
  | Create one result
  |--------------------------------------------------------------------------
  |
  | Expected payload:
  |
  | {
  |   exam_id: 39,
  |   student_id: 5,
  |   questions_correct: 42,
  |   remarks: "Good performance"
  | }
  |
  | Grade is calculated by the backend.
  | Percentage is calculated by the backend.
  |
  */
  create: (payload) =>
    apiClient.post("/results", payload).then((res) => res.data),

  /*
  |--------------------------------------------------------------------------
  | Create / update results in bulk
  |--------------------------------------------------------------------------
  |
  | Expected payload:
  |
  | {
  |   exam_id: 39,
  |   results: [
  |     {
  |       student_id: 5,
  |       questions_correct: 42,
  |       remarks: "Good"
  |     },
  |     {
  |       student_id: 6,
  |       questions_correct: 37
  |     }
  |   ]
  | }
  |
  */
  bulkCreate: (payload) =>
    apiClient.post("/results/bulk", payload).then((res) => res.data),

  /*
  |--------------------------------------------------------------------------
  | Update result
  |--------------------------------------------------------------------------
  |
  | Expected payload can contain:
  |
  | {
  |   questions_correct: 45,
  |   remarks: "Very good"
  | }
  |
  | The backend recalculates the grade.
  |
  */
  patch: (id, payload) =>
    apiClient.patch(`/results/${id}`, payload).then((res) => res.data),

  /*
  |--------------------------------------------------------------------------
  | Delete result
  |--------------------------------------------------------------------------
  */
  remove: (id) => apiClient.delete(`/results/${id}`).then((res) => res.data),
};
