import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subjectsApi } from "../api";
import toast from "react-hot-toast";

export const useSubjects = (params = {}) => {
  return useQuery({
    queryKey: ["subjects", params],
    queryFn: () => subjectsApi.getAll(params),
  });
};

export const useSubject = (id) => {
  return useQuery({
    queryKey: ["subjects", id],
    queryFn: () => subjectsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subjectsApi.create,
    onSuccess: () => {
      (queryClient.invalidateQueries({ queryKey: ["subjects"] }),
        toast.success("Subject created successfully"));
    },
    onError: (err) => toast.error(err.message || "Failed to create subject"),
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => subjectsApi.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["subjects", id] });
      toast.success("Subject updated successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to update subject"),
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: subjectsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      toast.success("Student deleted successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to delete subjects"),
  });
};

export const useSubjectsForClass = (division) => {
  return useQuery({
    queryKey: ['subjects', 'for-class', division],
    queryFn: () => subjectsApi.getForClass(division),
    enabled: !!division,
  });
};
