import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannersApi } from '../api/banners.api';

export const useActiveBanners = () =>
  useQuery({
    queryKey: ['banners', 'active'],
    queryFn:  bannersApi.getActive,
    staleTime: 5 * 60 * 1000,   // cache for 5 minutes
    select: (data) => data.data ?? [],
  });

export const useAllBanners = () =>
  useQuery({
    queryKey: ['banners', 'all'],
    queryFn:  bannersApi.getAll,
    select:   (data) => data.data ?? [],
  });

export const useUploadBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bannersApi.upload,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
};

export const useUpdateBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => bannersApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
};

export const useDeleteBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bannersApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
};

export const useReorderBanners = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bannersApi.reorder,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['banners'] }),
  });
};