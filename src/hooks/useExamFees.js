import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examFeesApi } from "../api/examFees.api";
import toast from "react-hot-toast";

export const useExamFees = (examId) =>
  useQuery({
    queryKey: ["exam-fees", examId],
    queryFn: () => examFeesApi.getByExam(examId),
    enabled: !!examId,
    select: (d) => d.data,
  });

export const useRecordFee = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: examFeesApi.record,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["exam-fees", vars.exam_id] });
      toast.success("Payment recorded");
    },
    onError: (err) => toast.error(err.message || "Failed to record payment"),
  });
};

export const useBulkSetFees = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ examId, amountDue }) =>
      examFeesApi.bulkSet(examId, amountDue),
    onSuccess: (_, { examId }) => {
      qc.invalidateQueries({ queryKey: ["exam-fees", examId] });
      toast.success("Exam fees set for all students");
    },
    onError: (err) => toast.error(err.message || "Failed to set fees"),
  });
};
