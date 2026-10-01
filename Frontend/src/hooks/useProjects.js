import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../api/projects.api';

function normalizeProjects(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data?.projects)) return res.data.projects;
  if (Array.isArray(res?.projects)) return res.projects;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.getProjects();
      const list = normalizeProjects(res);
      setProjects(list);
      return list;
    } catch (err) {
      setError(err?.message || 'Failed to fetch projects');
      setProjects([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    projectsApi.getProjects()
      .then((res) => {
        if (!ignore) {
          const list = normalizeProjects(res);
          setProjects(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err?.message || 'Failed to fetch projects');
          setProjects([]);
          setLoading(false);
        }
      });

    const handleSync = () => {
      fetchProjects();
    };

    const handleUpdateSync = (e) => {
      if (e.detail?.projectId) {
        setProjects((prev) =>
          prev.map((p) => {
            const id = p.id || p._id;
            return id === e.detail.projectId ? { ...p, status: e.detail.status, ...(e.detail.project || {}) } : p;
          })
        );
      }
    };

    window.addEventListener('gitsphere:project-created', handleSync);
    window.addEventListener('gitsphere:project-updated', handleUpdateSync);
    return () => {
      ignore = true;
      window.removeEventListener('gitsphere:project-created', handleSync);
      window.removeEventListener('gitsphere:project-updated', handleUpdateSync);
    };
  }, [fetchProjects]);

  const createProject = useCallback(async (projectData) => {
    const created = await projectsApi.createProject(projectData);
    setProjects((prev) => [created, ...prev]);
    window.dispatchEvent(new CustomEvent('gitsphere:project-created', { detail: created }));
    return created;
  }, []);

  const updateProjectStatus = useCallback(async (projectId, status) => {
    const updated = await projectsApi.updateProject(projectId, { status });
    const clean = updated?.data ?? updated;
    setProjects((prev) =>
      prev.map((p) => {
        const id = p.id || p._id;
        return id === projectId ? { ...p, ...clean, status } : p;
      })
    );
    window.dispatchEvent(
      new CustomEvent('gitsphere:project-updated', {
        detail: { projectId, status, project: clean }
      })
    );
    return clean;
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProjectStatus
  };
}
