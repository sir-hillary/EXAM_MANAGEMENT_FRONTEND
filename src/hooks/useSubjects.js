import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { subjectsApi } from "../api";
import toast from "react-hot-toast";

// ─────────────────────────────────────────────────────────────────────────────
// Get all subjects
// GET /api/subjects
// ─────────────────────────────────────────────────────────────────────────────

export const useSubjects = (params = {}) => {
  return useQuery({
    queryKey: ["subjects", params],
    queryFn: () => subjectsApi.getAll(params),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Get one subject
// GET /api/subjects/:id
// ─────────────────────────────────────────────────────────────────────────────

export const useSubject = (id) => {
  return useQuery({
    queryKey: ["subjects", id],
    queryFn: () => subjectsApi.getById(id),
    enabled: Boolean(id),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Create subject
// POST /api/subjects
// ─────────────────────────────────────────────────────────────────────────────

export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subjectsApi.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });

      toast.success("Subject created successfully");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to create subject");
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Update subject
// PUT /api/subjects/:id
// ─────────────────────────────────────────────────────────────────────────────

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => subjectsApi.update(id, payload),

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });

      queryClient.invalidateQueries({
        queryKey: ["subjects", id],
      });

      toast.success("Subject updated successfully");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to update subject");
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete subject
// DELETE /api/subjects/:id
// ─────────────────────────────────────────────────────────────────────────────

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subjectsApi.remove,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subjects"],
      });

      toast.success("Subject deleted successfully");
    },

    onError: (err) => {
      toast.error(err.message || "Failed to delete subject");
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Get subjects assigned to a class for an academic year
// GET /api/subjects/for-class?class_id=:classId&academic_year=:academicYear
// ─────────────────────────────────────────────────────────────────────────────

export const useSubjectsForClass = (classId, academicYear) => {
  return useQuery({
    queryKey: ["subjects", "for-class", classId, academicYear],

    queryFn: () =>
      subjectsApi.getForClass({
        class_id: classId,
        academic_year: academicYear,
      }),

    enabled: Boolean(classId && academicYear),
  });
};
