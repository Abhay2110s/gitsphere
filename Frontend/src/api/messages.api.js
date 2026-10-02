import { api } from './client';

export const messagesApi = {
  // Send message to a project or task chat
  sendMessage: async (messageData) => {
    const res = await api.post('/messages', messageData);
    return res?.data ?? res;
  },

  // Get project messages (supports filtering by individual developer)
  getProjectMessages: async (projectId, params = {}) => {
    const res = await api.get(`/projects/${projectId}/messages`, { params });
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.messages)) return res.data.messages;
    if (Array.isArray(res?.messages)) return res.messages;
    return [];
  },

  // Get task messages
  getTaskMessages: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/messages`);
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.messages)) return res.data.messages;
    if (Array.isArray(res?.messages)) return res.messages;
    return [];
  },

  // Mark messages as read
  markAsRead: async (messageIds) => {
    const res = await api.patch('/messages/read', { messageIds });
    return res?.data ?? res;
  },

  // Get unread count
  getUnreadCount: async () => {
    const res = await api.get('/messages/unread');
    return res?.data?.unreadCount ?? res?.unreadCount ?? 0;
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const res = await api.delete(`/messages/${messageId}`);
    return res?.data ?? res;
  },
};
