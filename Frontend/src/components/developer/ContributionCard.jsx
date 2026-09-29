import React from 'react';
import { GitCommitIcon, ChevronRightIcon } from '../common/Icons';

const CONTRIBUTION_STATUS = {
  DRAFT: { label: 'Draft', border: 'border-[#333333]', text: 'text-[#888888]' },
  IN_REVIEW: { label: 'In Review', border: 'border-[#444444]', text: 'text-white' },
  APPROVED: { label: 'Approved', border: 'border-[#555555]', text: 'text-white' },
  CHANGES_REQUESTED: { label: 'Changes Requested', border: 'border-amber-900/60', text: 'text-amber-400' },
};

export default function ContributionCard({ contribution, onSelect }) {
  if (!contribution) return null;

  const statusConfig = CONTRIBUTION_STATUS[contribution.status] || CONTRIBUTION_STATUS.IN_REVIEW;
  const fileCount = contribution.files?.length || 0;
  const dateStr = contribution.createdAt || contribution.submittedAt;
  const dateFormatted = dateStr
    ? new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div
      onClick={() => onSelect && onSelect(contribution)}
      className="p-5 rounded-2xl border border-[#222222] bg-[#0A0A0A] hover:border-[#383838] transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#888888] shrink-0 group-hover:text-white transition-colors">
              <GitCommitIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white px-1.5 py-0.5 rounded bg-[#1C1C1C] border border-[#333333]">
                  v{contribution.version || 1}
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-white">
                  {contribution.task?.title || `Contribution #${contribution.version || ''}`}
                </h4>
              </div>
              {contribution.project?.name && (
                <div className="text-[10px] font-mono text-[#666666] uppercase mt-0.5 truncate">
                  {contribution.project.name}
                </div>
              )}
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-[#141414] ${statusConfig.border} ${statusConfig.text} shrink-0 uppercase`}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-[#1A1A1A] flex items-center justify-between text-xs text-[#666666]">
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span>{fileCount} {fileCount === 1 ? 'file' : 'files'} changed</span>
          {dateFormatted && (
            <>
              <span>•</span>
              <span>{dateFormatted}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-[#888888] group-hover:text-white transition-colors text-xs font-semibold">
          <span>Details</span>
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
