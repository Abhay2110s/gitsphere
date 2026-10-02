import { api } from './client';

export const projectsApi = {
  // Get projects the user is a member of (or created if manager)
  getProjects: async () => {
    const res = await api.get('/projects');
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data?.projects)) return res.data.projects;
    if (Array.isArray(res?.projects)) return res.projects;
    if (Array.isArray(res?.data)) return res.data;
    return [];
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
    return res?.data ?? res;
  },

  // Add developer/user to project members
  addProjectMember: async (projectId, memberData) => {
    const res = await api.post(`/projects/${projectId}/members`, memberData);
    return res?.data ?? res;
  },

  // Remove developer/user from project members
  removeProjectMember: async (projectId, userId) => {
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    return res?.data ?? res;
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

  // Create a new project version snapshot (Manager only)
  createProjectVersion: async (projectId, versionData = {}) => {
    const res = await api.post(`/projects/${projectId}/versions`, versionData);
    return res.data;
  },

  // Activate / Rollback to a specific project version (Manager only)
  activateProjectVersion: async (projectId, version) => {
    const res = await api.post(`/projects/${projectId}/versions/${version}/activate`);
    return res.data;
  },
};

