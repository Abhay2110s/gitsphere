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

  // Get tasks within a project
  getProjectTasks: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/tasks`);
    return res.data;
  },

  // Get specific task details
  getTaskById: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}`);
    return res.data;
  },

  // Update task details (Manager only)
  updateTask: async (taskId, updateData) => {
    const res = await api.patch(`/tasks/${taskId}`, updateData);
    return res?.data ?? res;
  },

  // Assign or reassign task (Manager only)
  assignTask: async (taskId, assignedTo) => {
    const res = await api.patch(`/tasks/${taskId}/assign`, { assignedTo });
    return res?.data ?? res;
  },

  // Delete task (Manager only)
  deleteTask: async (taskId) => {
    const res = await api.delete(`/tasks/${taskId}`);
    return res?.data ?? res;
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
