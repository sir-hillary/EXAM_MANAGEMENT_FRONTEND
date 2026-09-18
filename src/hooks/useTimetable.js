import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classesApi } from "../api/classes.api";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────
// Get timetable
// ─────────────────────────────────────────────

export const useTimetable = (classId) =>
  useQuery({
    queryKey: ["timetable", classId],
    queryFn: () => classesApi.getTimetable(classId),
    enabled: !!classId,
  });

// ─────────────────────────────────────────────
// Create / update timetable period
// ─────────────────────────────────────────────

export const useUpsertPeriod = (classId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      classesApi.upsertPeriod(classId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["timetable", classId],
      });

      toast.success("Timetable updated");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to update timetable"
      );
    },
  });
};

// ─────────────────────────────────────────────
// Delete timetable period
// ─────────────────────────────────────────────

export const useDeletePeriod = (classId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      classesApi.deletePeriod(classId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["timetable", classId],
      });

      toast.success("Period cleared");
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Failed to clear period"
      );
    },
  });
};