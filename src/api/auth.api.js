import apiClient from './client';

export const authApi = {
  requestOtp:       (email) =>
    apiClient.post('/auth/register/request-otp', { email }).then(r => r.data),

  completeRegister: (payload) =>
    apiClient.post('/auth/register/complete', payload).then(r => r.data),

  login:            (credentials) =>
    apiClient.post('/auth/login', credentials).then(r => r.data),

  getMe:            () =>
    apiClient.get('/auth/me').then(r => r.data),

  forgotPassword:   (email) =>
    apiClient.post('/auth/forgot-password', { email }).then(r => r.data),

  resetPassword:    (payload) =>
    apiClient.post('/auth/reset-password', payload).then(r => r.data),

  changePassword:   (payload) =>
    apiClient.post('/auth/change-password', payload).then(r => r.data),
};