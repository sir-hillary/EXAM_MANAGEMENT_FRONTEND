import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import toast from "react-hot-toast";
import resultsApi from "../api/results.api";

// ─── Error Handler ────────────────────────────────────────

const getErrorMessage = (err, fallback) => {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
};

// ─── Queries ─────────────────────────────────────────────

export const useResultsByExam = (examId) => {
  return useQuery({
    queryKey: ["results", "exam", examId],
    queryFn: () => resultsApi.getByExam(examId),
    enabled: Number(examId) > 0,
  });
};

export const useResultsByStudent = (studentId) => {
  return useQuery({
    queryKey: ["results", "student", studentId],
    queryFn: () => resultsApi.getByStudent(studentId),
    enabled: Number(studentId) > 0,
  });
};

export const useMyResults = () => {
  return useQuery({
    queryKey: ["results", "mine"],
    queryFn: () => resultsApi.getMine(),
  });
};

export const useExamSummary = (examId) => {
  return useQuery({
    queryKey: ["results", "exam", examId, "summary"],
    queryFn: () => resultsApi.getExamSummary(examId),
    enabled: Number(examId) > 0,
  });
};

// ─── Bulk Create Results ──────────────────────────────────

export const useBulkCreateResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => resultsApi.bulkCreate(payload),

    onSuccess: (_, variables) => {
      // Refresh exam results, student results, and related queries.
      queryClient.invalidateQueries({
        queryKey: ["results"],
      });

      // Refresh the summary for the affected exam.
      queryClient.invalidateQueries({
        queryKey: [
          "results",
          "exam",
          variables.exam_id,
          "summary",
        ],
      });

      toast.success("Results created successfully");
    },

    onError: (err) => {
      toast.error(
        getErrorMessage(err, "Failed to create results")
      );
    },
  });
};

// ─── Update Result ───────────────────────────────────────

export const usePatchResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      resultsApi.patch(id, payload),

    onSuccess: () => {
      // Refresh result lists, individual result data,
      // and exam summaries.
      queryClient.invalidateQueries({
        queryKey: ["results"],
      });

      toast.success("Result updated successfully");
    },

    onError: (err) => {
      toast.error(
        getErrorMessage(err, "Failed to update result")
      );
    },
  });
};

// ─── Delete Result ────────────────────────────────────────

export const useDeleteResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => resultsApi.remove(id),

    onSuccess: () => {
      // Refresh all result-related queries, including summaries.
      queryClient.invalidateQueries({
        queryKey: ["results"],
      });

      toast.success("Result deleted successfully");
    },

    onError: (err) => {
      toast.error(
        getErrorMessage(err, "Failed to delete result")
      );
    },
  });
};