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
      setProjects(Array.isArray(res) ? res : res?.projects || []);
    } catch (err) {
      setError(err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    projectsApi.getProjects()
      .then((res) => {
        if (!ignore) {
          setProjects(Array.isArray(res) ? res : res?.projects || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
          setProjects([]);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
  };
}
