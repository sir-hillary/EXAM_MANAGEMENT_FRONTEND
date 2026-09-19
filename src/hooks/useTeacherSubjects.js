import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { teacherSubjectsApi } from "../api";
import toast from "react-hot-toast";

// Fetch teacher-subject qualifications
export const useTeacherSubjects = (params = {}) => {
  return useQuery({
    queryKey: ["teacher-subjects", params],
    queryFn: () => teacherSubjectsApi.getAll(params),
  });
};

// Assign a subject qualification to a teacher
export const useAssignTeacherSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherSubjectsApi.assign,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teacher-subjects"],
      });

      toast.success(
        "Teacher qualification assigned successfully",
      );
    },

    onError: (err) => {
      toast.error(
        err.message ||
          "Failed to assign subject to teacher",
      );
    },
  });
};

// Remove a teacher-subject qualification
export const useUnassignTeacherSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: teacherSubjectsApi.unassign,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["teacher-subjects"],
      });

      toast.success(
        "Teacher qualification removed successfully",
      );
    },

    onError: (err) => {
      toast.error(
        err.message ||
          "Failed to remove teacher qualification",
      );
    },
  });
};