import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/dashboard.api';

export function useDeveloperDashboard() {
  const [data, setData] = useState({
    assignedTasks: 0,
    inProgress: 0,
    inReview: 0,
    completed: 0,
    todo: 0,
    overdue: 0,
    recentProjects: [],
    recentNotifications: [],
    unreadNotificationsCount: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getUserDashboard();
      if (res) {
        setData({
          assignedTasks: Number(res.assignedTasks || 0),
          inProgress: Number(res.inProgress || 0),
          inReview: Number(res.inReview || 0),
          completed: Number(res.completed || 0),
          todo: Number(res.todo || 0),
          overdue: Number(res.overdue || 0),
          recentProjects: Array.isArray(res.recentProjects) ? res.recentProjects : [],
          recentNotifications: Array.isArray(res.recentNotifications) ? res.recentNotifications : [],
          unreadNotificationsCount: Number(res.unreadNotificationsCount || 0),
          recentActivity: Array.isArray(res.recentActivity) ? res.recentActivity : [],
        });
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}
