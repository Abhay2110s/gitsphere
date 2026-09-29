import { api } from './client';

export const messagesApi = {
  // Send message to a project or task chat
  sendMessage: async (messageData) => {
    const res = await api.post('/messages', messageData);
    return res.data;
  },

  // Get project messages
  getProjectMessages: async (projectId) => {
    const res = await api.get(`/projects/${projectId}/messages`);
    return res.data || [];
  },

  // Get task messages
  getTaskMessages: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}/messages`);
    return res.data || [];
  },

  // Mark messages as read
  markAsRead: async (messageIds) => {
    const res = await api.patch('/messages/read', { messageIds });
    return res.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const res = await api.get('/messages/unread');
    return res.data?.unreadCount || 0;
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const res = await api.delete(`/messages/${messageId}`);
    return res.data;
  },
};
