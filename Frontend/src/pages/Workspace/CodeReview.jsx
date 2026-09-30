import React, { useState } from 'react';
import EmptyState from '../../components/workspace/EmptyState';
import { TableSkeleton } from '../../components/workspace/SkeletonLoaders';
import {
  GitPullRequestIcon,
  UserIcon,
  ClockIcon,
  FileIcon,
  CheckIcon,
  AlertTriangleIcon,
} from '../../components/common/Icons';

const REVIEW_STATUS_STYLES = {
  IN_REVIEW: 'bg-[#1A1A1A] text-white border border-[#444444]',
  APPROVED: 'bg-white text-black',
  CHANGES_REQUESTED: 'bg-red-950/40 text-red-400 border border-red-900/40',
  DRAFT: 'bg-[#222222] text-[#888888]',
};

export default function CodeReview({ contributions = [], loading, userRole }) {
  const [filter, setFilter] = useState('ALL');
  const [selectedReview, setSelectedReview] = useState(null);

  if (loading) return <TableSkeleton rows={4} />;

  const reviewable = contributions.filter(
    (c) => c.status === 'IN_REVIEW' || c.status === 'APPROVED' || c.status === 'CHANGES_REQUESTED' || c.status === 'DRAFT'
  );

  const filtered = filter === 'ALL'
    ? reviewable
    : reviewable.filter((c) => c.status === filter);

  const tabs = ['ALL', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'];

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Review Details
  if (selectedReview) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedReview(null)}
          className="text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
        >
          ← Back to Reviews
        </button>

        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-[#222222] bg-[#0A0A0A]">
            <h1 className="text-xl font-black tracking-tight text-white mb-2">
              {selectedReview.title || 'Contribution'}
            </h1>
            {selectedReview.description && (
              <p className="text-sm text-[#888888] leading-relaxed">{selectedReview.description}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#1A1A1A]">
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-1">Submitted By</div>
                <span className="text-xs font-semibold text-white">{selectedReview.submittedBy?.name || '—'}</span>
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-1">Submitted</div>
                <span className="text-xs font-mono text-[#AAAAAA]">{formatDate(selectedReview.createdAt)}</span>
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-1">Files Changed</div>
                <span className="text-xs font-bold text-white">{selectedReview.files?.length || 0}</span>
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-1">Status</div>
                <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${REVIEW_STATUS_STYLES[selectedReview.status] || 'bg-[#222222] text-[#AAAAAA]'}`}>
                  {selectedReview.status?.replace('_', ' ') || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Diff placeholder area */}
          <div className="p-6 rounded-xl border border-[#222222] bg-[#0A0A0A]">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#555555] mb-4">Changed Files</h2>
            {(!selectedReview.files || selectedReview.files.length === 0) ? (
              <p className="text-xs text-[#555555] font-mono">No files changed in this contribution.</p>
            ) : (
              <div className="space-y-2">
                {selectedReview.files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#070707] border border-[#1A1A1A]">
                    <FileIcon className="w-3.5 h-3.5 text-[#666666]" />
                    <span className="text-xs font-mono text-white">{file.path || file.name || `file_${i}`}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manager review actions */}
          {userRole === 'MANAGER' && selectedReview.status === 'IN_REVIEW' && (
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer shadow-sm">
                <CheckIcon className="w-3.5 h-3.5" />
                Approve
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white text-xs font-bold hover:bg-[#1A1A1A] transition-colors cursor-pointer">
                <AlertTriangleIcon className="w-3.5 h-3.5" />
                Request Changes
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Code Review</h1>
          <p className="text-xs font-mono text-[#666666] mt-1">
            {reviewable.length} review{reviewable.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-[#1A1A1A]">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-2 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
              filter === t
                ? 'text-white border-white'
                : 'text-[#666666] border-transparent hover:text-[#AAAAAA]'
            }`}
          >
            {t === 'ALL' ? 'All' : t.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Review List */}
      {reviewable.length === 0 ? (
        <EmptyState
          icon={GitPullRequestIcon}
          title="No code reviews yet"
          description="Submitted contributions will appear here when they require review."
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-xs text-[#666666] font-mono">
          No reviews match this filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <button
              key={item._id || i}
              onClick={() => setSelectedReview(item)}
              className="w-full p-5 rounded-xl border border-[#222222] bg-[#0A0A0A] hover:border-[#333333] transition-colors cursor-pointer text-left"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="text-sm font-bold text-white">{item.title || 'Untitled Contribution'}</div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-[#666666]">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3 h-3" />
                      {item.submittedBy?.name || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileIcon className="w-3 h-3" />
                      {item.files?.length || 0} files
                    </span>
                  </div>
                </div>
                <span className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold uppercase ${REVIEW_STATUS_STYLES[item.status] || 'bg-[#222222] text-[#AAAAAA]'}`}>
                  {item.status?.replace(/_/g, ' ') || 'Unknown'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
