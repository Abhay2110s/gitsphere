import { api } from './client';

export const contributionsApi = {
  // Submit new contribution (requires projectId, taskId, files: [{ path, content, language }])
  createContribution: async (data) => {
    const res = await api.post('/contributions', data);
    return res.data;
  },

  // Get contributions by projectId
  getContributions: async (projectId, params = {}) => {
    if (!projectId) return [];
    const query = new URLSearchParams({ projectId, ...params }).toString();
    const res = await api.get(`/contributions?${query}`);
    return res.data || [];
  },

  // Get single contribution by ID
  getContributionById: async (contributionId) => {
    const res = await api.get(`/contributions/${contributionId}`);
    return res.data;
  },

  // Get pending reviews (Manager only)
  getPendingReviews: async () => {
    const res = await api.get('/contributions/pending');
    return res.data;
  },
};
