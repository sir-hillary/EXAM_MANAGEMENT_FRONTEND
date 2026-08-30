import apiClient from "./client";

export const examFeesApi = {
  getByExam: (examId) =>
    apiClient.get(`/exam-fees/exam/${examId}`).then((r) => r.data),

  record: (payload) =>
    apiClient.post("/exam-fees", payload).then((r) => r.data),

  bulkSet: (examId, amountDue) =>
    apiClient
      .post("/exam-fees/bulk", { exam_id: examId, amount_due: amountDue })
      .then((r) => r.data),
};
