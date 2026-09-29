import React, { useState } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import { GitPullRequestIcon, CheckIcon } from '../../components/common/Icons';

export default function Reviews() {
  const [reviews] = useState([]); // dynamic empty array

  const pending = reviews.filter(r => r.status === 'pending').length;
  const completed = reviews.filter(r => r.status === 'completed').length;
  const changesRequested = reviews.filter(r => r.status === 'changes_requested').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            REVIEWS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Audit, discuss, and approve developer code submissions.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Pending Reviews" value={pending} subtext="No activity yet" icon={GitPullRequestIcon} />
        <StatCard label="Completed Reviews" value={completed} subtext="No activity yet" icon={CheckIcon} />
        <StatCard label="Changes Requested" value={changesRequested} subtext="No activity yet" icon={GitPullRequestIcon} />
      </div>

      {/* Reviews Content / Empty State */}
      <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-12">
        {reviews.length === 0 ? (
          <EmptyState
            icon={GitPullRequestIcon}
            title="NO REVIEWS YET"
            description="Contribution reviews will appear here once developers submit code for review."
            className="border-0 bg-transparent py-10"
          />
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-[#222222] bg-[#111111]">
                {r.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
