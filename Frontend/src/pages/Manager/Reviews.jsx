import React, { useState, useEffect } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import CodeMirrorEditor from '../../components/common/CodeMirrorEditor';
import { contributionsApi } from '../../api/contributions.api';
import {
  GitPullRequestIcon,
  CheckIcon,
  SearchIcon,
  CodeIcon,
  FileIcon,
  CloseIcon,
  ChevronRightIcon,
} from '../../components/common/Icons';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const res = await contributionsApi.getContributions();
      const list = res?.data || res || [];
      setReviews(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const isChangesRequested = (r) => {
    const s = (r.status || '').toUpperCase();
    if (s !== 'CHANGES_REQUESTED') return false;
    const taskStatus = (r.task?.status || '').toUpperCase();
    return taskStatus !== 'COMPLETED';
  };

  const isApproved = (r) => {
    const s = (r.status || '').toUpperCase();
    const taskStatus = (r.task?.status || '').toUpperCase();
    return s === 'APPROVED' || (taskStatus === 'COMPLETED' && s !== 'DRAFT');
  };

  const pending = reviews.filter(r => (r.status || '').toUpperCase() === 'IN_REVIEW' && (r.task?.status || '').toUpperCase() !== 'COMPLETED').length;
  const completed = reviews.filter(isApproved).length;
  const changesRequested = reviews.filter(isChangesRequested).length;

  const tabs = [
    { id: 'All', label: 'All Reviews', count: reviews.length },
    { id: 'IN_REVIEW', label: 'Pending Review', count: pending },
    { id: 'APPROVED', label: 'Completed / Approved', count: completed },
    { id: 'CHANGES_REQUESTED', label: 'Changes Requested', count: changesRequested },
  ];

  const filteredReviews = reviews.filter((r) => {
    if (activeTab === 'CHANGES_REQUESTED') {
      if (!isChangesRequested(r)) return false;
    } else if (activeTab === 'APPROVED') {
      if (!isApproved(r)) return false;
    } else if (activeTab === 'IN_REVIEW') {
      if ((r.status || '').toUpperCase() !== 'IN_REVIEW' || (r.task?.status || '').toUpperCase() === 'COMPLETED') return false;
    } else if (activeTab !== 'All') {
      if ((r.status || '').toUpperCase() !== activeTab) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (r.task?.title || r.title || '').toLowerCase();
      const dev = (r.developer?.name || '').toLowerCase();
      const proj = (r.project?.name || '').toLowerCase();
      return title.includes(q) || dev.includes(q) || proj.includes(q);
    }
    return true;
  });


  const handleOpenReview = (rev) => {
    setSelectedReview(rev);
    setActiveFileIndex(0);
    setReviewComment(rev.reviewComment || '');
    setActionMessage({ type: '', text: '' });
  };

  const handleCloseReview = () => {
    setSelectedReview(null);
    setActionMessage({ type: '', text: '' });
  };

  const handleApprove = async () => {
    if (!selectedReview) return;
    const revId = selectedReview.id || selectedReview._id;
    setActionLoading(true);
    setActionMessage({ type: '', text: '' });
    try {
      await contributionsApi.approveContribution(revId);
      setActionMessage({ type: 'success', text: `Contribution v${selectedReview.version} approved and merged successfully!` });
      setSelectedReview(prev => ({
        ...prev,
        status: 'APPROVED',
        reviewedAt: new Date().toISOString(),
      }));
      loadReviews();
    } catch (err) {
      console.error('Failed to approve review:', err);
      setActionMessage({ type: 'error', text: err.message || 'Failed to approve contribution' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedReview) return;
    if (!reviewComment.trim()) {
      setActionMessage({ type: 'error', text: 'Please enter feedback explaining the requested changes.' });
      return;
    }
    const revId = selectedReview.id || selectedReview._id;
    setActionLoading(true);
    setActionMessage({ type: '', text: '' });
    try {
      await contributionsApi.requestChanges(revId, reviewComment);
      setActionMessage({ type: 'success', text: 'Changes requested successfully. Developer notified.' });
      setSelectedReview(prev => ({
        ...prev,
        status: 'CHANGES_REQUESTED',
        reviewComment,
        reviewedAt: new Date().toISOString(),
      }));
      loadReviews();
    } catch (err) {
      console.error('Failed to request changes:', err);
      setActionMessage({ type: 'error', text: err.message || 'Failed to request changes' });
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    const s = (status || 'DRAFT').toUpperCase();
    switch (s) {
      case 'IN_REVIEW':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-900/60 bg-amber-950/20 text-amber-400 uppercase">
            PENDING REVIEW
          </span>
        );
      case 'APPROVED':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-emerald-900/60 bg-emerald-950/20 text-emerald-400 uppercase">
            APPROVED
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-rose-900/60 bg-rose-950/20 text-rose-400 uppercase">
            CHANGES REQUESTED
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-[#333333] bg-[#141414] text-[#888888] uppercase">
            DRAFT
          </span>
        );
    }
  };

  const activeFile = selectedReview?.files?.[activeFileIndex] || null;

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
        <div className="flex items-center gap-3">
          <button
            onClick={loadReviews}
            className="px-3 py-1.5 rounded-lg border border-[#2A2A2A] bg-[#111111] hover:bg-[#1A1A1A] text-xs font-mono text-[#AAAAAA] hover:text-white transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Pending Reviews"
          value={pending}
          subtext={pending > 0 ? `${pending} tickets awaiting audit` : 'All caught up'}
          icon={GitPullRequestIcon}
          isLoading={isLoading}
        />
        <StatCard
          label="Completed Reviews"
          value={completed}
          subtext={completed > 0 ? `${completed} contributions merged` : 'None yet'}
          icon={CheckIcon}
          isLoading={isLoading}
        />
        <StatCard
          label="Changes Requested"
          value={changesRequested}
          subtext={changesRequested > 0 ? `${changesRequested} revisions requested` : 'None yet'}
          icon={GitPullRequestIcon}
          isLoading={isLoading}
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#222222] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-white text-black'
                  : 'text-[#888888] hover:text-white hover:bg-[#141414]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                activeTab === tab.id ? 'bg-black text-white' : 'bg-[#1C1C1C] text-[#666666]'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <SearchIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search review tickets..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#222222] bg-[#111111] text-xs text-white placeholder-[#555555] font-mono focus:border-white focus:outline-none"
          />
        </div>
      </div>

      {/* Reviews Content / Grid */}
      <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-4 sm:p-6">
        {filteredReviews.length === 0 ? (
          <EmptyState
            icon={GitPullRequestIcon}
            title="NO REVIEWS FOUND"
            description="Contribution reviews will appear here once developers submit code for review."
            className="border-0 bg-transparent py-12"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviews.map((r) => {
              const isPending = (r.status || '').toUpperCase() === 'IN_REVIEW';
              return (
                <div
                  key={r.id || r._id}
                  onClick={() => handleOpenReview(r)}
                  className="p-5 rounded-xl border border-[#222222] bg-[#111111] hover:border-[#444444] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-[#888888] shrink-0 group-hover:text-white transition-colors">
                          <GitPullRequestIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-white">
                            {r.task?.title || r.title || 'Code Review Ticket'}
                          </h4>
                          <div className="text-[11px] font-mono text-[#666666] truncate mt-0.5">
                            {r.project?.name || 'Project'} • v{r.version}
                          </div>
                        </div>
                      </div>

                      {renderStatusBadge(r.status)}
                    </div>

                    <div className="text-xs text-[#888888] font-mono mb-3">
                      <span>Submitted by </span>
                      <strong className="text-white">{r.developer?.name || 'Developer'}</strong>
                      {r.files?.length > 0 && <span> ({r.files.length} files changed)</span>}
                    </div>

                    {r.reviewComment && (
                      <p className="text-xs text-[#AAAAAA] line-clamp-2 mb-4 p-2.5 rounded-lg bg-[#161616] border border-[#222222] font-mono italic">
                        "{r.reviewComment}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-[#666666]">
                      {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : 'Recent'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReview(r);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:underline cursor-pointer"
                    >
                      <span>{isPending ? 'Audit & Review' : 'View Code'}</span>
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Code Review Modal / Inspection Drawer */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-5xl h-[90vh] bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#222222] bg-[#111111] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-white">
                  <CodeIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{selectedReview.task?.title || 'Code Review'}</span>
                    <span className="text-xs font-mono text-[#888888]">v{selectedReview.version}</span>
                    {renderStatusBadge(selectedReview.status)}
                  </h3>
                  <p className="text-[11px] text-[#666666] font-mono">
                    Developer: {selectedReview.developer?.name} • Project: {selectedReview.project?.name}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseReview}
                className="w-8 h-8 rounded-lg border border-[#2A2A2A] bg-[#161616] text-[#888888] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Notification message */}
            {actionMessage.text && (
              <div
                className={`p-3 text-xs font-mono border-b ${
                  actionMessage.type === 'success'
                    ? 'border-emerald-900/60 bg-emerald-950/30 text-emerald-400'
                    : 'border-rose-900/60 bg-rose-950/30 text-rose-400'
                }`}
              >
                {actionMessage.text}
              </div>
            )}

            {/* Split workspace */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
              {/* File list */}
              <div className="lg:col-span-3 border-r border-[#222222] bg-[#080808] p-3 overflow-y-auto">
                <span className="text-[10px] font-mono font-bold uppercase text-[#AAAAAA] tracking-wider block mb-2">
                  Files ({selectedReview.files?.length || 0})
                </span>
                <div className="space-y-1">
                  {selectedReview.files?.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveFileIndex(idx)}
                      className={`w-full text-left p-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                        idx === activeFileIndex
                          ? 'bg-white text-black font-bold'
                          : 'text-[#888888] hover:bg-[#141414] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <FileIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{file.path}</span>
                      </div>
                      <span className={`text-[9px] uppercase px-1 rounded ${idx === activeFileIndex ? 'bg-black text-white' : 'bg-[#1C1C1C] text-[#666666]'}`}>
                        {file.language || 'code'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Code viewer */}
              <div className="lg:col-span-6 bg-[#1E1E1E] flex flex-col border-r border-[#222222] overflow-hidden">
                <div className="p-2.5 bg-[#141414] border-b border-[#222222] flex items-center justify-between text-xs font-mono">
                  <span className="text-white font-bold">{activeFile?.path || 'No file selected'}</span>
                  {activeFile && (
                    <span className="text-[10px] text-[#888888] bg-[#1C1C1C] px-2 py-0.5 rounded uppercase">
                      {activeFile.language || 'code'}
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden p-2">
                  {activeFile ? (
                    <CodeMirrorEditor
                      value={activeFile.content || ''}
                      language={activeFile.language || 'javascript'}
                      filename={activeFile.path}
                      readOnly={true}
                      height="100%"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs font-mono text-[#666666]">
                      No file selected
                    </div>
                  )}
                </div>
              </div>

              {/* Review and Actions Panel */}
              <div className="lg:col-span-3 bg-[#080808] p-4 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#AAAAAA] tracking-wider block pb-2 border-b border-[#1A1A1A]">
                    Audit Decision
                  </span>

                  {selectedReview.reviewComment && (
                    <div className="p-3 rounded-lg bg-[#141414] border border-[#222222] text-xs font-mono text-[#CCCCCC]">
                      <span className="text-[9px] text-[#888888] uppercase block mb-1">Previous Feedback:</span>
                      "{selectedReview.reviewComment}"
                    </div>
                  )}

                  {(selectedReview.status || '').toUpperCase() === 'IN_REVIEW' ? (
                    <div className="space-y-3">
                      <label className="text-[10px] font-mono font-bold uppercase text-[#AAAAAA] block">
                        Feedback / Reason
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Add review feedback..."
                        rows={4}
                        className="w-full p-2.5 rounded-lg border border-[#222222] bg-[#111111] text-xs text-white placeholder-[#555555] font-mono focus:border-white focus:outline-none resize-none"
                      />

                      <div className="space-y-2 pt-2">
                        <button
                          onClick={handleApprove}
                          disabled={actionLoading}
                          className="w-full py-2.5 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <CheckIcon className="w-3.5 h-3.5" />
                          <span>{actionLoading ? 'Approving...' : 'Approve & Merge'}</span>
                        </button>

                        <button
                          onClick={handleRequestChanges}
                          disabled={actionLoading}
                          className="w-full py-2.5 px-4 rounded-lg border border-rose-900/80 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <span>{actionLoading ? 'Updating...' : 'Request Changes'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-[#1A1A1A] bg-[#111111] text-xs font-mono text-[#888888]">
                      {(selectedReview.status || '').toUpperCase() === 'APPROVED' ? (
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckIcon className="w-4 h-4" />
                          <span>Approved & merged.</span>
                        </div>
                      ) : (
                        <span>Status: {(selectedReview.status || '').toUpperCase()}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#1C1C1C]">
                  <button
                    onClick={handleCloseReview}
                    className="w-full py-2 rounded-lg border border-[#2A2A2A] bg-[#141414] text-xs font-mono text-[#AAAAAA] hover:text-white transition-colors cursor-pointer"
                  >
                    Close Inspection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

