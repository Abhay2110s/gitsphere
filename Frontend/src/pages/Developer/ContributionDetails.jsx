import React, { useState, useEffect } from 'react';
import { contributionsApi } from '../../api/contributions.api';
import PageHeader from '../../components/developer/PageHeader';
import EmptyState from '../../components/developer/EmptyState';
import ErrorState from '../../components/developer/ErrorState';
import { ChevronLeftIcon, GitCommitIcon, CodeIcon } from '../../components/common/Icons';

export default function ContributionDetails({
  contributionId: propId,
  contribution: initialContrib,
  onBackToContributions,
  onOpenWorkspace,
}) {
  const contributionId = initialContrib?._id || initialContrib?.id || propId;
  const [contribution, setContribution] = useState(initialContrib || null);
  const [loading, setLoading] = useState(!initialContrib);
  const [error, setError] = useState(null);

  const fetchContribution = async () => {
    if (!contributionId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await contributionsApi.getContributionById(contributionId);
      if (res) setContribution(res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContribution();
  }, [contributionId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-[#222222] rounded" />
        <div className="h-64 bg-[#0A0A0A] border border-[#222222] rounded-2xl" />
      </div>
    );
  }

  if (error || !contribution) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBackToContributions}
          className="flex items-center gap-1.5 text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Back to Contributions</span>
        </button>
        <ErrorState
          title="Contribution not found"
          message={error?.message || 'We could not load this contribution record.'}
          onRetry={fetchContribution}
        />
      </div>
    );
  }

  const files = contribution.files || [];
  const reviewer = contribution.reviewedBy || contribution.reviewer;

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={onBackToContributions}
        className="flex items-center gap-1.5 text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span>Back to Contributions</span>
      </button>

      {/* Main Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[#222222] bg-[#0A0A0A] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#1A1A1A]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-white shrink-0">
              <GitCommitIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#333333] text-white">
                  v{contribution.version || 1}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {contribution.task?.title || `Contribution #${contribution.version}`}
                </h1>
              </div>
              <div className="text-xs font-mono text-[#888888] mt-1">
                Project: <span className="text-white font-bold">{contribution.project?.name || 'Project'}</span>
              </div>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded border bg-[#141414] border-[#444444] text-white shrink-0 uppercase self-start">
            {contribution.status || 'IN_REVIEW'}
          </span>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[#666666] block">Submitted By</span>
            <span className="text-white mt-1 block">
              {contribution.developer?.name || 'You'}
            </span>
          </div>
          <div>
            <span className="text-[#666666] block">Submitted Date</span>
            <span className="text-white mt-1 block">
              {contribution.submittedAt || contribution.createdAt
                ? new Date(contribution.submittedAt || contribution.createdAt).toLocaleDateString()
                : '—'}
            </span>
          </div>
          <div>
            <span className="text-[#666666] block">Reviewer</span>
            <span className="text-white mt-1 block">
              {reviewer ? reviewer.name : 'Pending Assignment'}
            </span>
          </div>
          <div>
            <span className="text-[#666666] block">Total Files</span>
            <span className="text-white font-bold mt-1 block">
              {files.length}
            </span>
          </div>
        </div>

        {/* Review Feedback / Comments if present */}
        {contribution.reviewComment && (
          <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
            <h4 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase mb-1">
              MANAGER REVIEW FEEDBACK
            </h4>
            <p className="text-xs text-[#E0E0E0] font-mono leading-relaxed">
              "{contribution.reviewComment}"
            </p>
          </div>
        )}

        {/* Submitted Files */}
        <div>
          <h3 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase mb-4">
            SUBMITTED FILES ({files.length})
          </h3>

          {files.length === 0 ? (
            <p className="text-xs text-[#666666] font-mono">No files attached to this contribution.</p>
          ) : (
            <div className="space-y-4">
              {files.map((file, idx) => (
                <div key={idx} className="border border-[#222222] rounded-xl overflow-hidden bg-[#0A0A0A]">
                  <div className="px-4 py-2 border-b border-[#1A1A1A] bg-[#141414] flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">{file.path || file.name}</span>
                    <span className="text-[#666666]">{file.language || 'text'}</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-[#CCCCCC] overflow-x-auto whitespace-pre">
                    {file.content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
