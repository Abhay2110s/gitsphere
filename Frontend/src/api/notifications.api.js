import { api } from './client';

export const notificationsApi = {
  // Get notifications for current user
  getNotifications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/notifications?${query}` : '/notifications';
    const res = await api.get(endpoint);
    return res.data || [];
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};
