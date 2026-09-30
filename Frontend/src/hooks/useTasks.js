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

  const createTask = useCallback(async (projectId, taskData) => {
    const res = await tasksApi.createTask(projectId, taskData);
    const newTask = res?.data || res?.task || res;
    setTasks((prev) => [newTask, ...prev]);
    window.dispatchEvent(new CustomEvent('gitsphere:task-created', { detail: newTask }));
    return newTask;
  }, []);

  useEffect(() => {
    let ignore = false;
    tasksApi.getMyTasks()
      .then((res) => {
        if (!ignore) {
          const list = Array.isArray(res) ? res : res?.data || res?.tasks || [];
          setTasks(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err?.message || 'Failed to fetch tasks');
          setTasks([]);
          setLoading(false);
        }
      });

    const handleSync = () => {
      fetchTasks();
    };

    window.addEventListener('gitsphere:task-created', handleSync);
    return () => {
      ignore = true;
      window.removeEventListener('gitsphere:task-created', handleSync);
    };
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTaskStatus,
  };
}
