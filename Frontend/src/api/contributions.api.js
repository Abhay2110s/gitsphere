import { api } from './client';

export const contributionsApi = {
  // Submit new contribution (requires projectId, taskId, files: [{ path, content, language }])
  createContribution: async (data) => {
    const res = await api.post('/contributions', data);
    return res.data;
  },

  // Get contributions (optional projectId and status filter)
  getContributions: async (projectId = null, params = {}) => {
    const queryObj = { ...params };
    if (projectId) {
      queryObj.projectId = projectId;
    }
    const searchParams = new URLSearchParams();
    Object.entries(queryObj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, v);
      }
    });
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/contributions?${queryString}` : '/contributions';
    const res = await api.get(endpoint);
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
    return res.data || [];
  },

  // Approve contribution (Manager only)
  approveContribution: async (contributionId) => {
    const res = await api.patch(`/contributions/${contributionId}/approve`);
    return res.data;
  },

  // Request changes on contribution (Manager only)
  requestChanges: async (contributionId, comment) => {
    const res = await api.patch(`/contributions/${contributionId}/request-changes`, { comment });
    return res.data;
  },
};
