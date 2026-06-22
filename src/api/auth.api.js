import apiClient from './client';

export const authApi = {
  login: (credentials) =>
    apiClient.post('/auth/login', credentials).then(res => res.data),

  register: (payload) =>
    apiClient.post('/auth/register', payload).then(res => res.data),

  getMe: () =>
    apiClient.get('/auth/me').then(res => res.data),

  changePassword: (payload) =>
    apiClient.post('/auth/change-password', payload).then(res => res.data),
};