import { api } from './client';

export const workspaceApi = {
  // Get file by ID
  getFileById: async (fileId) => {
    const res = await api.get(`/code/files/${fileId}`);
    return res.data;
  },

  // Update file content
  updateFile: async (fileId, data) => {
    const res = await api.patch(`/code/files/${fileId}`, data);
    return res.data;
  },

  // Delete file
  deleteFile: async (fileId) => {
    const res = await api.delete(`/code/files/${fileId}`);
    return res.data;
  },

  // Code line comments
  getFileComments: async (fileId) => {
    const res = await api.get(`/code/files/${fileId}/comments`);
    return res.data;
  },

  // Create code comment
  createComment: async (fileId, commentData) => {
    const res = await api.post(`/code/files/${fileId}/comments`, commentData);
    return res.data;
  },

  // File version history
  getFileVersions: async (fileId) => {
    const res = await api.get(`/code/files/${fileId}/versions`);
    return res.data;
  },

  // Restore file version
  restoreFileVersion: async (fileId, versionId) => {
    const res = await api.post(`/code/files/${fileId}/restore/${versionId}`);
    return res.data;
  },
};
