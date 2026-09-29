import { api } from './client';

export const tasksApi = {
  // Get current logged-in developer's assigned tasks
  getMyTasks: async () => {
    const res = await api.get('/tasks/my-tasks');
    return res.data;
  },

  // Get specific task details
  getTaskById: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}`);
    return res.data;
  },

  // Update task status (TODO, IN_PROGRESS, COMPLETED, BLOCKED)
  updateTaskStatus: async (taskId, status) => {
    const res = await api.patch(`/tasks/${taskId}/status`, { status });
    return res.data;
  },

  // Get coding workspace files for task
  getTaskFiles: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/files`);
    return res.data;
  },

  // Create/save coding file for task
  createTaskFile: async (taskId, fileData) => {
    const res = await api.post(`/tasks/${taskId}/files`, fileData);
    return res.data;
  },

  // Get task reviews
  getTaskReviews: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/reviews`);
    return res.data;
  },

  // Submit review for task
  submitTaskReview: async (taskId, reviewData) => {
    const res = await api.post(`/tasks/${taskId}/reviews`, reviewData);
    return res.data;
  },

  // Get task messages
  getTaskMessages: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/messages`);
    return res.data;
  },
};
