import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { classSubjectsApi } from "../api";
import toast from "react-hot-toast";

export const useClassSubjects = (params = {}) => {
  return useQuery({
    queryKey: ["class-subjects", params],
    queryFn: () => classSubjectsApi.getAll(params),
  });
};

export const useAssignClassSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classSubjectsApi.assign,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["class-subjects"],
      });

      toast.success("Subject assigned to class successfully");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to assign subject to class");
    },
  });
};

export const usePatchClassSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => classSubjectsApi.patch(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["class-subjects"],
      });

      toast.success("Class subject assignment updated successfully");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to update class subject assignment");
    },
  });
};

export const useUnassignClassSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: classSubjectsApi.unassign,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["class-subjects"],
      });

      toast.success("Subject unassigned from class successfully");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to unassign subject from class");
    },
  });
};
