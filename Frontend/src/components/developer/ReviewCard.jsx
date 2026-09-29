import React from 'react';
import { GitPullRequestIcon, ChevronRightIcon } from '../common/Icons';

export default function ReviewCard({ review, onSelect }) {
  if (!review) return null;

  const isApproved = review.status === 'APPROVED';
  const reviewerName = review.reviewer?.name || review.reviewedBy?.name || 'Reviewer';
  const dateFormatted = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div
      onClick={() => onSelect && onSelect(review)}
      className="p-5 rounded-2xl border border-[#222222] bg-[#0A0A0A] hover:border-[#383838] transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#888888] shrink-0 group-hover:text-white transition-colors">
              <GitPullRequestIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-white">
                {review.task?.title || review.title || 'Review Ticket'}
              </h4>
              <div className="text-[10px] font-mono text-[#666666] truncate mt-0.5">
                Reviewed by {reviewerName}
              </div>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-[#141414] ${
              isApproved
                ? 'border-[#555555] text-white'
                : 'border-amber-900/60 text-amber-400'
            } shrink-0 uppercase`}
          >
            {review.status || 'IN_REVIEW'}
          </span>
        </div>

        {review.comment && (
          <p className="text-xs text-[#888888] line-clamp-2 mb-4 leading-relaxed font-mono">
            "{review.comment}"
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-[#1A1A1A] flex items-center justify-between text-xs text-[#666666]">
        <div className="text-[11px] font-mono">
          {dateFormatted && <span>{dateFormatted}</span>}
        </div>
        <div className="flex items-center gap-1 text-[#888888] group-hover:text-white transition-colors text-xs font-semibold">
          <span>View feedback</span>
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
