import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '../api/tasks.api';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
    const updated = await tasksApi.updateTaskStatus(taskId, newStatus);
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId || t.id === taskId ? { ...t, status: newStatus } : t))
    );
    return updated;
  };

  useEffect(() => {
    let ignore = false;
    tasksApi.getMyTasks()
      .then((res) => {
        if (!ignore) {
          setTasks(Array.isArray(res) ? res : res?.tasks || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
          setTasks([]);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    updateTaskStatus,
  };
}
