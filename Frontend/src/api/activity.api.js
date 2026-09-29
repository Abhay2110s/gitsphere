import { api } from './client';

export const activityApi = {
  // Get recent activity logs
  getActivity: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/activity?${query}` : '/activity';
    const res = await api.get(endpoint);
    return res.data || [];
  },
};
