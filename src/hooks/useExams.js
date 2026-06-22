import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examsApi } from '../api';
import toast from 'react-hot-toast';

export const useExams = (params = {}) => {
  return useQuery({
    queryKey: ['exams', params],
    queryFn: () => examsApi.getAll(params),
  });
};

export const useExam = (id) => {
  return useQuery({
    queryKey: ['exams', id],
    queryFn: () => examsApi.getById(id),
    enabled: !!id,
  });
};

export const useExamResults = (id) => {
  return useQuery({
    queryKey: ['exams', id, 'results'],
    queryFn: () => examsApi.getResults(id),
    enabled: !!id,
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: examsApi.create,
    onSuccess: () => {queryClient.invalidateQueries({ queryKey: ['exams'] });
    toast.success('Examination created successfully!')
  },
  onError: (err) => toast.error(err.message || 'Failed to create class'),
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => examsApi.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exams', id] });
      toast.success('Exam updated successfully')
    },
    onError: (err) => toast.error(err.message || 'Failed to update exam.'),
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: examsApi.remove,
    onSuccess: () => {queryClient.invalidateQueries({ queryKey: ['exams'] });
    toast.success('exam deleted successfully')
  },
  onError: (err) => toast.error(err.message || 'Failed to delete exam'),
  });
};