import { api } from './client';

export const dashboardApi = {
  getUserDashboard: async () => {
    const res = await api.get('/dashboard/user');
    return res.data;
  },

  getManagerDashboard: async () => {
    const res = await api.get('/dashboard/manager');
    return res.data;
  },
};
