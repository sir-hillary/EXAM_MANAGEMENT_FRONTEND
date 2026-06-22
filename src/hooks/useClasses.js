import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classesApi } from '../api';
import toast from 'react-hot-toast';


export const useClasses = (params = {}) => {
  return useQuery({
    queryKey: ['classes', params],
    queryFn: () => classesApi.getAll(params),
  });
};

export const useClass = (id) => {
  return useQuery({
    queryKey: ['classes', id],
    queryFn: () => classesApi.getById(id),
    enabled: !!id,
  });
};

export const useClassStudents = (id) => {
  return useQuery({
    queryKey: ['classes', id, 'students'],
    queryFn: () => classesApi.getStudents(id),
    enabled: !!id,
  });
};

export const useCreateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class created');
    },
    onError: (err) => toast.error(err.message || 'Failed to create class'),
  });
};

export const useUpdateClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => classesApi.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['classes', id] });
      toast.success('Class updated');
    },
    onError: (err) => toast.error(err.message || 'Failed to update class'),
  });
};

export const useDeleteClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classesApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      toast.success('Class deleted')
    },
    onError: (err) => toast.error(err.message || 'Failed to delete class'),
  });
};