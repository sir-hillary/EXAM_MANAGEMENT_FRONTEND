import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teachersApi } from "../api";
import toast from "react-hot-toast";

export const useTeachers = (params = {}) => {
  return useQuery({
    queryKey: ["teachers", params],
    queryFn: () => teachersApi.getAll(params),
  });
};

export const useTeacher = (id) => {
  return useQuery({
    queryKey: ["teachers", id],
    queryFn: () => teachersApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teachersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher created successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to create Teacher"),
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => teachersApi.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teachers", id] });
      toast.success("Teacher updated successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to updated teacher"),
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: teachersApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher deleted successfully");
    },
    onError: (err) => toast.error(err.message || "Failed to delete teacher"),
  });
};
