import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../api/tasks.api';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await tasksApi.getMyTasks();
      setTasks(Array.isArray(res) ? res : res?.tasks || []);
    } catch (err) {
      setError(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const updated = await tasksApi.updateTaskStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId || t.id === taskId ? { ...t, status: newStatus } : t))
      );
      return updated;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    updateTaskStatus,
  };
}
