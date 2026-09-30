import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../api/projects.api';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectsApi.getProjects();
      const list = Array.isArray(res) ? res : res?.data || res?.projects || [];
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
          const list = Array.isArray(res) ? res : res?.data || res?.projects || [];
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

    window.addEventListener('gitsphere:project-created', handleSync);
    return () => {
      ignore = true;
      window.removeEventListener('gitsphere:project-created', handleSync);
    };
  }, [fetchProjects]);

  const createProject = useCallback(async (projectData) => {
    const created = await projectsApi.createProject(projectData);
    setProjects((prev) => [created, ...prev]);
    window.dispatchEvent(new CustomEvent('gitsphere:project-created', { detail: created }));
    return created;
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
  };
}
