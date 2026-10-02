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

  const updateTask = useCallback(async (taskId, updateData) => {
    const res = await tasksApi.updateTask(taskId, updateData);
    const updated = res?.data || res?.task || res;
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId || t.id === taskId ? { ...t, ...updated } : t))
    );
    window.dispatchEvent(new CustomEvent('gitsphere:task-updated', { detail: updated }));
    return updated;
  }, []);

  const assignTask = useCallback(async (taskId, assignedTo) => {
    const res = await tasksApi.assignTask(taskId, assignedTo);
    const updated = res?.data || res?.task || res;
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId || t.id === taskId ? { ...t, ...updated } : t))
    );
    window.dispatchEvent(new CustomEvent('gitsphere:task-updated', { detail: updated }));
    return updated;
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    await tasksApi.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t._id !== taskId && t.id !== taskId));
    window.dispatchEvent(new CustomEvent('gitsphere:task-deleted', { detail: { taskId } }));
  }, []);

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

    const handleDeleteSync = (e) => {
      const deletedId = e?.detail?.taskId;
      if (deletedId) {
        setTasks((prev) => prev.filter((t) => t._id !== deletedId && t.id !== deletedId));
      } else {
        fetchTasks();
      }
    };

    window.addEventListener('gitsphere:task-created', handleSync);
    window.addEventListener('gitsphere:task-updated', handleSync);
    window.addEventListener('gitsphere:task-deleted', handleDeleteSync);
    return () => {
      ignore = true;
      window.removeEventListener('gitsphere:task-created', handleSync);
      window.removeEventListener('gitsphere:task-updated', handleSync);
      window.removeEventListener('gitsphere:task-deleted', handleDeleteSync);
    };
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    assignTask,
    deleteTask,
    updateTaskStatus,
  };
}
