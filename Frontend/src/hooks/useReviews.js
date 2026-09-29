import { useState, useEffect, useCallback } from 'react';
import { reviewsApi } from '../api/reviews.api';

export function useReviews(taskId = null) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async (tid) => {
    const targetTaskId = tid || taskId;
    if (!targetTaskId) {
      setReviews([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await reviewsApi.getTaskReviews(targetTaskId);
      setReviews(Array.isArray(res) ? res : res?.reviews || []);
    } catch (err) {
      setError(err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchReviews(taskId);
    }
  }, [taskId, fetchReviews]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
  };
}
