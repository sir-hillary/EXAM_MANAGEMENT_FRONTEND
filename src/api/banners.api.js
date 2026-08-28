import apiClient from './client';

export const bannersApi = {
  // Public — no token needed
  getActive: () =>
    fetch(`${import.meta.env.VITE_API_URL}/banners`)
      .then(r => r.json()),

  // Admin only
  getAll: () =>
    apiClient.get('/banners/all').then(r => r.data),

  upload: (formData) =>
    apiClient.post('/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),

  update: (id, payload) =>
    apiClient.patch(`/banners/${id}`, payload).then(r => r.data),

  remove: (id) =>
    apiClient.delete(`/banners/${id}`).then(r => r.data),

  reorder: (order) =>
    apiClient.post('/banners/reorder', { order }).then(r => r.data),
};