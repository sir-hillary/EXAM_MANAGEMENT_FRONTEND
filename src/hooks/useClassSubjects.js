// src/hooks/useClassSubjects.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classSubjectsApi } from '../api';
import toast from 'react-hot-toast';

export const useClassSubjects = (params = {}) => {
  return useQuery({
    queryKey: ['class-subjects', params],
    queryFn: () => classSubjectsApi.getAll(params),
  });
};

export const useAssignClassSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classSubjectsApi.assign,
    onSuccess: () => {queryClient.invalidateQueries({ queryKey: ['class-subjects'] });
    toast.success("Class assigned")
  },
  onError: (err) => toast.error(err.message || 'Failed to assign  class-subjects'),
  });
};

export const usePatchClassSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => classSubjectsApi.patch(id, payload),
    onSuccess: () => {queryClient.invalidateQueries({ queryKey: ['class-subjects'] });
    toast.success('updated successfully')
  },
  });
};

export const useUnassignClassSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classSubjectsApi.unassign,
    onSuccess: () => {queryClient.invalidateQueries({ queryKey: ['class-subjects'] });
    toast.success('classSubject unassigned successfully!')
  },
  });
};