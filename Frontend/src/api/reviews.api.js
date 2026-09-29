import { api } from './client';

export const reviewsApi = {
  // Get review details by ID
  getReviewById: async (reviewId) => {
    const res = await api.get(`/reviews/${reviewId}`);
    return res.data;
  },

  // Get task reviews
  getTaskReviews: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/reviews`);
    return res.data;
  },
};
