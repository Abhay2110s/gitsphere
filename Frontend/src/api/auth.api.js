import { api } from './client';

export const authApi = {
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data?.token) {
      localStorage.setItem('gitsphere_token', res.data.token);
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('gitsphere_token');
    }
  },
};
