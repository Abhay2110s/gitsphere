import { useState, useEffect, useCallback } from 'react';
import { contributionsApi } from '../api/contributions.api';

export function useContributions(projectId = null) {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContributions = useCallback(async (pid) => {
    const targetProject = pid || projectId;
    if (!targetProject) {
      setContributions([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await contributionsApi.getContributions(targetProject);
      setContributions(Array.isArray(res) ? res : res?.contributions || []);
    } catch (err) {
      setError(err);
      setContributions([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchContributions(projectId);
    }
  }, [projectId, fetchContributions]);

  const submitContribution = async (data) => {
    const res = await contributionsApi.createContribution(data);
    if (res?.project === projectId) {
      setContributions((prev) => [res, ...prev]);
    }
    return res;
  };

  return {
    contributions,
    loading,
    error,
    refetch: fetchContributions,
    submitContribution,
  };
}
