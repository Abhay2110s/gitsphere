import { api } from './client';

export const tasksApi = {
  // Get accessible tasks (manager sees created, developer sees assigned)
  getMyTasks: async (params) => {
    const res = await api.get('/tasks/my-tasks', { params });
    return res?.data ?? res;
  },

  // Get all tasks with query filters
  getTasks: async (params) => {
    const res = await api.get('/tasks', { params });
    return res?.data ?? res;
  },

  // Create a new task within a project (Manager only)
  createTask: async (projectId, taskData) => {
    const res = await api.post(`/projects/${projectId}/tasks`, taskData);
    return res?.data ?? res;
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

  // Sync workspace files with latest project repository code
  syncTaskFiles: async (taskId) => {
    const res = await api.post(`/tasks/${taskId}/sync-project`);
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
