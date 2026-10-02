import { api } from './client';

export const authApi = {
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data || res.user || res;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    const token = res.data?.token || res.token;
    const user = res.data?.user || res.user;

    if (token) {
      localStorage.setItem('gitsphere_token', token);
    }
    if (user) {
      localStorage.setItem('gitsphere_user', JSON.stringify(user));
    }
    return res;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    const token = res.data?.token || res.token;
    const user = res.data?.user || res.user;

    if (token) {
      localStorage.setItem('gitsphere_token', token);
    }
    if (user) {
      localStorage.setItem('gitsphere_user', JSON.stringify(user));
    }
    return res;
  },

  verifyOtp: async ({ email, otp }) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    const token = res.data?.token || res.token;
    const user = res.data?.user || res.user;

    if (token) {
      localStorage.setItem('gitsphere_token', token);
    }
    if (user) {
      localStorage.setItem('gitsphere_user', JSON.stringify(user));
    }
    return res;
  },

  resendOtp: async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res;
  },

  resetPassword: async ({ email, password, otp }) => {
    const res = await api.post('/auth/reset-password', { email, password, otp });
    return res;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      localStorage.removeItem('gitsphere_token');
      localStorage.removeItem('gitsphere_user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  deleteAccount: async () => {
    try {
      await api.delete('/users/account');
    } finally {
      localStorage.removeItem('gitsphere_token');
      localStorage.removeItem('gitsphere_user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
};

