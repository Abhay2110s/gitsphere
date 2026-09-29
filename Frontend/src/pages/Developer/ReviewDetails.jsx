import React, { useState, useEffect } from 'react';
import { reviewsApi } from '../../api/reviews.api';
import PageHeader from '../../components/developer/PageHeader';
import ErrorState from '../../components/developer/ErrorState';
import { ChevronLeftIcon, GitPullRequestIcon } from '../../components/common/Icons';

export default function ReviewDetails({
  reviewId: propId,
  review: initialReview,
  onBackToReviews,
  onOpenWorkspace,
}) {
  const reviewId = initialReview?._id || initialReview?.id || propId;
  const [review, setReview] = useState(initialReview || null);
  const [loading, setLoading] = useState(!initialReview);
  const [error, setError] = useState(null);

  const fetchReview = async () => {
    if (!reviewId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await reviewsApi.getReviewById(reviewId);
      if (res) setReview(res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-[#222222] rounded" />
        <div className="h-64 bg-[#0A0A0A] border border-[#222222] rounded-2xl" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBackToReviews}
          className="flex items-center gap-1.5 text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Back to Reviews</span>
        </button>
        <ErrorState
          title="Review not found"
          message={error?.message || 'We could not fetch this review.'}
          onRetry={fetchReview}
        />
      </div>
    );
  }

  const isApproved = review.status === 'APPROVED';
  const reviewer = review.reviewer || review.reviewedBy;

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={onBackToReviews}
        className="flex items-center gap-1.5 text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span>Back to Reviews</span>
      </button>

      <div className="p-6 sm:p-8 rounded-2xl border border-[#222222] bg-[#0A0A0A] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#1A1A1A]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-white shrink-0">
              <GitPullRequestIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {review.task?.title || review.title || 'Review Ticket'}
                </h1>
              </div>
              <div className="text-xs font-mono text-[#888888] mt-1">
                Evaluated by <span className="text-white font-bold">{reviewer?.name || 'Reviewer'}</span>
              </div>
            </div>
          </div>

          <span
            className={`text-xs font-mono font-bold px-3 py-1 rounded border bg-[#141414] ${
              isApproved
                ? 'border-[#555555] text-white'
                : 'border-amber-900/60 text-amber-400'
            } shrink-0 uppercase self-start`}
          >
            {review.status || 'IN_REVIEW'}
          </span>
        </div>

        {/* Review Comments */}
        <div>
          <h3 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase mb-2">
            REVIEWER EVALUATION COMMENTS
          </h3>
          <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed whitespace-pre-line bg-[#0D0D0D] border border-[#1A1A1A] p-4 rounded-xl font-mono">
            {review.comment || 'No review comments submitted.'}
          </p>
        </div>

        {/* Timeline / Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#1A1A1A] text-xs font-mono">
          <div>
            <span className="text-[#666666] block">Review Outcome</span>
            <span className="text-white font-bold uppercase mt-1 block">
              {review.status || 'IN_REVIEW'}
            </span>
          </div>
          <div>
            <span className="text-[#666666] block">Review Date</span>
            <span className="text-white mt-1 block">
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : '—'}
            </span>
          </div>
          <div>
            <span className="text-[#666666] block">Reviewer Email</span>
            <span className="text-white mt-1 block truncate">
              {reviewer?.email || '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
