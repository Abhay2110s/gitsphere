import { api } from './client';

export const usersApi = {
  // Get users list (Manager only)
  getUsers: async (params) => {
    const res = await api.get('/users', { params });
    return res?.data ?? res;
  },

  // Update own profile
  updateProfile: async (profileData) => {
    const res = await api.patch('/users/profile', profileData);
    return res.data;
  },

  // Get user profile by ID
  getUserById: async (userId) => {
    const res = await api.get(`/users/${userId}`);
    return res.data;
  },

  // Permanently delete user account and wipe all records
  deleteAccount: async () => {
    const res = await api.delete('/users/account');
    localStorage.removeItem('gitsphere_token');
    localStorage.removeItem('gitsphere_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return res;
  },
};
