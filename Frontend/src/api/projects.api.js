import { api } from './client';

export const projectsApi = {
  // Get projects the user is a member of (or created if manager)
  getProjects: async () => {
    const res = await api.get('/projects');
    return res?.data ?? res;
  },

  // Create project (Manager only)
  createProject: async (projectData) => {
    const res = await api.post('/projects', projectData);
    return res?.data ?? res;
  },

  // Update project (Manager only)
  updateProject: async (projectId, projectData) => {
    const res = await api.patch(`/projects/${projectId}`, projectData);
    return res?.data ?? res;
  },

  // Delete project (Manager only)
  deleteProject: async (projectId) => {
    const res = await api.delete(`/projects/${projectId}`);
    return res?.data ?? res;
  },

  // Get project details by ID
  getProject: async (projectId) => {
    const res = await api.get(`/projects/${projectId}`);
    return res.data;
  },

  // Get tasks within a project
  getProjectTasks: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/tasks`);
    return res.data;
  },

  // Get project members
  getProjectMembers: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/members`);
    return res.data;
  },

  // Get latest approved project code
  getProjectCode: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/code`);
    return res.data;
  },

  // Get version history for a project
  getVersionHistory: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/versions`);
    return res.data;
  },

  // Get specific version code
  getVersionByNumber: async (projectId, version) => {
    const res = await api.get(`/projects/${projectId}/versions/${version}`);
    return res.data;
  },
};
