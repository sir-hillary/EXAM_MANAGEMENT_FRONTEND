import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resultsApi } from '../api';
import toast from 'react-hot-toast';

export const useResultsByExam = (examId) => {
  return useQuery({
    queryKey: ['results', 'exam', examId],
    queryFn: () => resultsApi.getByExam(examId),
    enabled: !!examId,
  });
};

export const useResultsByStudent = (studentId) => {
  return useQuery({
    queryKey: ['results', 'student', studentId],
    queryFn: () => resultsApi.getByStudent(studentId),
    enabled: !!studentId,
  });
};

export const useExamSummary = (examId) => {
  return useQuery({
    queryKey: ['results', 'exam', examId, 'summary'],
    queryFn: () => resultsApi.getExamSummary(examId),
    enabled: !!examId,
  });
};

export const useBulkCreateResults = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resultsApi.bulkCreate,
    onSuccess: (_, { exam_id }) => {
      queryClient.invalidateQueries({ queryKey: ['results', 'exam', exam_id] });
      queryClient.invalidateQueries({ queryKey: ['results', 'exam', exam_id, 'summary'] });
      toast.success('results created in bulk')
    },
    onError: (err) => toast.error(err.message || 'Failed to create results'),
  });
};

export const usePatchResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => resultsApi.patch(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      toast.success('results updated')
    },
  });
};

export const useDeleteResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resultsApi.remove,
    onSuccess: () => {queryClient.invalidateQueries({ queryKey: ['results'] });
    toast.success('result deleted')
  },
  onError: (err) => toast.error(err.message || 'Failed to delete results'),
  });
};