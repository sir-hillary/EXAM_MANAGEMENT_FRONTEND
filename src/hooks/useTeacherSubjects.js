// src/hooks/useTeacherSubjects.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherSubjectsApi } from "../api";
import toast from "react-hot-toast";

export const useTeacherSubjects = (params = {}) => {
  return useQuery({
    queryKey: ["teacher-subjects", params],
    queryFn: () => teacherSubjectsApi.getAll(params),
  });
};

export const useAssignTeacherSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teacherSubjectsApi.assign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
      toast.success("Teacher assigned successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to assign teacher a subject"),
  });
};

export const useUnassignTeacherSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teacherSubjectsApi.unassign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-subjects"] });
      toast.success("Teacher unassigned successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to unassign teacher"),
  });
};
