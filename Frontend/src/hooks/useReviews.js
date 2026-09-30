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
    setLoading(true);
    setError(null);
    try {
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
    if (!taskId) {
      return;
    }
    let ignore = false;
    reviewsApi.getTaskReviews(taskId)
      .then((res) => {
        if (!ignore) {
          setReviews(Array.isArray(res) ? res : res?.reviews || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
          setReviews([]);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [taskId]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
  };
}
