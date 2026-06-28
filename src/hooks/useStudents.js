import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentsApi } from "../api";
import toast from "react-hot-toast";

export const useStudents = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => studentsApi.getAll(params),
    ...options,
  });
};

export const useStudent = (id) => {
  return useQuery({
    queryKey: ["students", id],
    queryFn: () => studentsApi.getById(id),
    enabled: !!id,
  });
};

export const useStudentResults = (id) => {
  return useQuery({
    queryKey: ["students", id, "results"],
    queryFn: () => studentsApi.getResults(id),
    enabled: !!id,
  });
};

export const useStudentReportCard = (id, examType) => {
  return useQuery({
    queryKey: ["students", id, "report-card", examType],
    queryFn: () => studentsApi.getReportCard(id, examType),
    enabled: !!id && !!examType,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student created successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to create student"),
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => studentsApi.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["students", id] });
      toast.success("Student updated successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to update student"),
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: studentsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted");
    },
    onError: (err) => toast.error(err.message || "Failed to delete student"),
  });
};

export const useGenderStats = (classId) => {
  return useQuery({
    queryKey: ['students', 'stats', 'gender', classId],
    queryFn: () => studentsApi.getGenderStats(classId),
  });
};
