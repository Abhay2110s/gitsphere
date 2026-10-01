import React, { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { reviewsApi } from '../../api/reviews.api';
import PageHeader from '../../components/developer/PageHeader';
import ReviewCard from '../../components/developer/ReviewCard';
import EmptyState from '../../components/developer/EmptyState';
import ErrorState from '../../components/developer/ErrorState';
import { CardSkeleton } from '../../components/developer/LoadingSkeleton';
import { GitPullRequestIcon, FilterIcon } from '../../components/common/Icons';

export default function Reviews({ onSelectReview }) {
  const { tasks, loading: tasksLoading } = useTasks();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (tasks.length === 0) return;
    let ignore = false;

    const reviewPromises = tasks.map((t) =>
      reviewsApi.getTaskReviews(t._id || t.id).catch(() => [])
    );

    Promise.all(reviewPromises)
      .then((results) => {
        if (!ignore) {
          const flattened = results.flat().filter(Boolean);
          setReviews(flattened);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
          setReviews([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [tasks]);

  const refetch = () => {
    if (tasks.length === 0) return;
    setLoading(true);
    setError(null);
    const reviewPromises = tasks.map((t) =>
      reviewsApi.getTaskReviews(t._id || t.id).catch(() => [])
    );
    Promise.all(reviewPromises)
      .then((results) => setReviews(results.flat().filter(Boolean)))
      .catch(setError)
      .finally(() => setLoading(false));
  };

  const filteredReviews = reviews.filter((r) => {
    const taskStatus = (r.task?.status || '').toUpperCase();
    const isCompleted = taskStatus === 'COMPLETED';

    if (statusFilter === 'CHANGES_REQUESTED') {
      if (isCompleted) return false;
      return (r.status || '').toUpperCase() === 'CHANGES_REQUESTED';
    }
    if (statusFilter === 'APPROVED') {
      return (r.status || '').toUpperCase() === 'APPROVED' || isCompleted;
    }
    if (statusFilter === 'IN_REVIEW') {
      if (isCompleted) return false;
      return (r.status || '').toUpperCase() === 'IN_REVIEW';
    }
    return true;
  });


  const isLoading = tasksLoading || loading;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reviews & Feedback"
        description="Manager evaluations, code quality audits, and change requests on your submitted contributions."
      />

      {reviews.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#1C1C1C]">
          {['ALL', 'APPROVED', 'CHANGES_REQUESTED', 'IN_REVIEW'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-black font-bold'
                  : 'text-[#888888] hover:text-white hover:bg-[#141414]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : error ? (
        <ErrorState
          title="Failed to load reviews"
          message={error.message || 'Could not fetch review data from the server.'}
          onRetry={refetch}
        />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={GitPullRequestIcon}
          title="NO REVIEWS YET"
          description="Your submitted contributions haven't received reviews yet. Once a manager evaluates your code, their feedback will appear here."
        />
      ) : filteredReviews.length === 0 ? (
        <EmptyState
          icon={FilterIcon}
          title="NO MATCHING REVIEWS"
          description={`No reviews found with status "${statusFilter}".`}
          actionLabel="Clear Filter"
          onAction={() => setStatusFilter('ALL')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((rev) => (
            <ReviewCard
              key={rev._id || rev.id}
              review={rev}
              onSelect={onSelectReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
