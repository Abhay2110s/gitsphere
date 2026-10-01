import React, { useState, useEffect } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import CodeMirrorEditor from '../../components/common/CodeMirrorEditor';
import { contributionsApi } from '../../api/contributions.api';
import {
  GitCommitIcon,
  GitPullRequestIcon,
  CodeIcon,
  FileIcon,
  CheckIcon,
  ChevronRightIcon,
  SearchIcon,
} from '../../components/common/Icons';

export default function Contributions() {
  const [contributions, setContributions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const loadContributions = async () => {
    setIsLoading(true);
    try {
      const res = await contributionsApi.getContributions();
      const list = res?.data || res || [];
      setContributions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to fetch contributions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContributions();
  }, []);

  const isChangesRequested = (c) => {
    const s = (c.status || '').toUpperCase();
    if (s !== 'CHANGES_REQUESTED') return false;
    const taskStatus = (c.task?.status || '').toUpperCase();
    return taskStatus !== 'COMPLETED';
  };

  const isApproved = (c) => {
    const s = (c.status || '').toUpperCase();
    const taskStatus = (c.task?.status || '').toUpperCase();
    return s === 'APPROVED' || (taskStatus === 'COMPLETED' && s !== 'DRAFT');
  };

  const draft = contributions.filter(c => (c.status || '').toUpperCase() === 'DRAFT').length;
  const inReview = contributions.filter(c => (c.status || '').toUpperCase() === 'IN_REVIEW' && (c.task?.status || '').toUpperCase() !== 'COMPLETED').length;
  const approved = contributions.filter(isApproved).length;
  const changesRequested = contributions.filter(isChangesRequested).length;

  const tabs = [
    { id: 'All', label: 'All', count: contributions.length },
    { id: 'IN_REVIEW', label: 'In Review', count: inReview },
    { id: 'APPROVED', label: 'Approved', count: approved },
    { id: 'CHANGES_REQUESTED', label: 'Changes Requested', count: changesRequested },
    { id: 'DRAFT', label: 'Draft', count: draft },
  ];

  const filteredContributions = contributions.filter((c) => {
    if (activeTab === 'CHANGES_REQUESTED') {
      if (!isChangesRequested(c)) return false;
    } else if (activeTab === 'APPROVED') {
      if (!isApproved(c)) return false;
    } else if (activeTab === 'IN_REVIEW') {
      if ((c.status || '').toUpperCase() !== 'IN_REVIEW' || (c.task?.status || '').toUpperCase() === 'COMPLETED') return false;
    } else if (activeTab !== 'All') {
      if ((c.status || '').toUpperCase() !== activeTab) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (c.task?.title || c.title || '').toLowerCase();
      const dev = (c.developer?.name || '').toLowerCase();
      const proj = (c.project?.name || '').toLowerCase();
      return title.includes(q) || dev.includes(q) || proj.includes(q);
    }
    return true;
  });


  const handleSelectContribution = (c) => {
    setSelectedContribution(c);
    setActiveFileIndex(0);
    setReviewComment(c.reviewComment || '');
    setActionMessage({ type: '', text: '' });
  };

  const handleApprove = async () => {
    if (!selectedContribution) return;
    const contId = selectedContribution.id || selectedContribution._id;
    setActionLoading(true);
    setActionMessage({ type: '', text: '' });
    try {
      const res = await contributionsApi.approveContribution(contId);
      const updated = res?.data || res;
      setActionMessage({ type: 'success', text: `Contribution v${selectedContribution.version} approved and merged successfully!` });
      setSelectedContribution(prev => ({
        ...prev,
        status: 'APPROVED',
        reviewedAt: new Date().toISOString(),
      }));
      // Refresh list in background
      loadContributions();
    } catch (err) {
      console.error('Failed to approve contribution:', err);
      setActionMessage({ type: 'error', text: err.message || 'Failed to approve contribution' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedContribution) return;
    if (!reviewComment.trim()) {
      setActionMessage({ type: 'error', text: 'Please enter a review comment explaining what changes are needed.' });
      return;
    }
    const contId = selectedContribution.id || selectedContribution._id;
    setActionLoading(true);
    setActionMessage({ type: '', text: '' });
    try {
      const res = await contributionsApi.requestChanges(contId, reviewComment);
      const updated = res?.data || res;
      setActionMessage({ type: 'success', text: 'Changes requested successfully. Developer has been notified.' });
      setSelectedContribution(prev => ({
        ...prev,
        status: 'CHANGES_REQUESTED',
        reviewComment,
        reviewedAt: new Date().toISOString(),
      }));
      // Refresh list in background
      loadContributions();
    } catch (err) {
      console.error('Failed to request changes:', err);
      setActionMessage({ type: 'error', text: err.message || 'Failed to request changes' });
    } finally {
      setActionLoading(false);
    }
  };

  const activeFile = selectedContribution?.files?.[activeFileIndex] || null;

  const renderStatusBadge = (status) => {
    const s = (status || 'DRAFT').toUpperCase();
    switch (s) {
      case 'IN_REVIEW':
        return (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-900/60 bg-amber-950/20 text-amber-400 uppercase">
            IN REVIEW
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            CONTRIBUTIONS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Review code branches and developer contributions across your organization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadContributions}
            className="px-3 py-1.5 rounded-lg border border-[#2A2A2A] bg-[#111111] hover:bg-[#1A1A1A] text-xs font-mono text-[#AAAAAA] hover:text-white transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="Total Contributions"
          value={contributions.length}
          subtext={contributions.length > 0 ? `${contributions.length} submitted` : 'No activity yet'}
          icon={GitCommitIcon}
          isLoading={isLoading}
        />
        <StatCard
          label="In Review"
          value={inReview}
          subtext={inReview > 0 ? `${inReview} awaiting review` : 'All clear'}
          icon={GitPullRequestIcon}
          isLoading={isLoading}
        />
        <StatCard
          label="Approved"
          value={approved}
          subtext={approved > 0 ? `${approved} merged` : 'None yet'}
          icon={CheckIcon}
          isLoading={isLoading}
        />
        <StatCard
          label="Changes Requested"
          value={changesRequested}
          subtext={changesRequested > 0 ? `${changesRequested} revisions` : 'None yet'}
          icon={GitPullRequestIcon}
          isLoading={isLoading}
        />
        <StatCard
          label="Draft"
          value={draft}
          subtext={draft > 0 ? `${draft} in draft` : 'None yet'}
          icon={GitCommitIcon}
          isLoading={isLoading}
        />
      </div>

      {/* Main Table or Code-Review Split Interface */}
      {selectedContribution ? (
        <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] overflow-hidden space-y-0">
          {/* Review Header Banner */}
          <div className="p-4 border-b border-[#222222] bg-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedContribution(null)}
                className="text-xs font-mono px-3 py-1.5 rounded border border-[#2A2A2A] bg-[#161616] text-[#AAAAAA] hover:text-white hover:bg-[#202020] transition-colors cursor-pointer"
              >
                &larr; Back to Contributions Table
              </button>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{selectedContribution.task?.title || 'Code Contribution'}</span>
                  <span className="text-xs font-mono text-[#888888]">v{selectedContribution.version}</span>
                </h3>
                <p className="text-[11px] text-[#666666] font-mono mt-0.5">
                  Project: {selectedContribution.project?.name || 'Unknown'} • Developer: {selectedContribution.developer?.name || 'Developer'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {renderStatusBadge(selectedContribution.status)}
            </div>
          </div>

          {/* Feedback banner */}
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

          {/* 3-Column Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
            {/* 1. FILE EXPLORER */}
            <div className="lg:col-span-3 border-r border-[#222222] p-4 bg-[#080808] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A] mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#AAAAAA] tracking-wider">
                    FILE EXPLORER
                  </span>
                  <span className="text-[10px] font-mono text-[#666666]">
                    {selectedContribution.files?.length || 0} files
                  </span>
                </div>

                {(!selectedContribution.files || selectedContribution.files.length === 0) ? (
                  <p className="text-xs text-[#555555] font-mono py-4">No files submitted in this contribution.</p>
                ) : (
                  <div className="space-y-1 overflow-y-auto max-h-[480px]">
                    {selectedContribution.files.map((file, idx) => {
                      const isActive = idx === activeFileIndex;
                      return (
                        <button
                          key={idx}
                          onClick={() => setActiveFileIndex(idx)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-white text-black font-bold'
                              : 'text-[#AAAAAA] hover:bg-[#141414] hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{file.path}</span>
                          </div>
                          <span className={`text-[9px] uppercase px-1 rounded ${isActive ? 'bg-black text-white' : 'bg-[#1C1C1C] text-[#666666]'}`}>
                            {file.language || 'code'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* 2. CODE VIEWER */}
            <div className="lg:col-span-6 bg-[#0D0D0D] flex flex-col border-r border-[#222222]">
              <div className="p-3 bg-[#111111] border-b border-[#222222] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-white">
                  <CodeIcon className="w-4 h-4 text-[#888888]" />
                  <span className="font-bold">{activeFile?.path || 'No file selected'}</span>
                </div>
                {activeFile && (
                  <span className="text-[10px] text-[#888888] bg-[#1A1A1A] px-2 py-0.5 rounded uppercase">
                    {activeFile.language || 'code'}
                  </span>
                )}
              </div>

              <div className="flex-1 min-h-[480px] p-2 bg-[#1E1E1E]">
                {activeFile ? (
                  <CodeMirrorEditor
                    value={activeFile.content || ''}
                    language={activeFile.language || 'javascript'}
                    filename={activeFile.path}
                    readOnly={true}
                    height="460px"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#555555] font-mono text-xs">
                    <CodeIcon className="w-8 h-8 text-[#444444] mb-2" />
                    <span>No file selected for viewing.</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. REVIEW PANEL */}
            <div className="lg:col-span-3 p-4 bg-[#080808] flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[10px] font-mono font-bold uppercase text-[#AAAAAA] tracking-wider block pb-2 border-b border-[#1A1A1A]">
                  REVIEW & ACTION
                </span>

                {/* Developer Info */}
                <div className="p-3 rounded-xl border border-[#1C1C1C] bg-[#111111] space-y-1">
                  <span className="text-[10px] font-mono text-[#666666] uppercase block">Developer</span>
                  <div className="text-xs font-bold text-white">{selectedContribution.developer?.name || 'Developer'}</div>
                  <div className="text-[11px] font-mono text-[#888888]">{selectedContribution.developer?.email}</div>
                  <div className="text-[10px] font-mono text-[#666666] pt-1">
                    Submitted: {selectedContribution.submittedAt ? new Date(selectedContribution.submittedAt).toLocaleString() : 'Recent'}
                  </div>
                </div>

                {/* Previous Review Feedback if present */}
                {selectedContribution.reviewComment && (
                  <div className="p-3 rounded-xl border border-[#222222] bg-[#141414] space-y-1">
                    <span className="text-[10px] font-mono text-[#AAAAAA] uppercase block font-bold">Feedback / Notes</span>
                    <p className="text-xs text-[#CCCCCC] font-mono leading-relaxed italic">
                      "{selectedContribution.reviewComment}"
                    </p>
                  </div>
                )}

                {/* Action controls for IN_REVIEW */}
                {(selectedContribution.status || '').toUpperCase() === 'IN_REVIEW' ? (
                  <div className="space-y-3 pt-2">
                    <label className="text-[10px] font-mono font-bold uppercase text-[#AAAAAA] block">
                      Review Feedback
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Add review feedback or reason for requesting changes..."
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
                    {(selectedContribution.status || '').toUpperCase() === 'APPROVED' ? (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckIcon className="w-4 h-4" />
                        <span>This contribution has been approved and merged into the project repository.</span>
                      </div>
                    ) : (
                      <span>This contribution status is {(selectedContribution.status || '').toUpperCase()}.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Contributions Table View */
        <div className="space-y-4">
          {/* Controls bar: Tabs & Search */}
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
                placeholder="Search contributions..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#222222] bg-[#111111] text-xs text-white placeholder-[#555555] font-mono focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
            {filteredContributions.length === 0 ? (
              <EmptyState
                icon={GitCommitIcon}
                title="NO CONTRIBUTIONS FOUND"
                description={
                  activeTab !== 'All'
                    ? `No contributions found with status "${activeTab}".`
                    : 'Developer code submissions will appear here when team members submit their work.'
                }
                className="border-0 bg-transparent py-12"
              />
            ) : (
              <div className="divide-y divide-[#1A1A1A]">
                {filteredContributions.map((c) => (
                  <div
                    key={c.id || c._id}
                    onClick={() => handleSelectContribution(c)}
                    className="p-4 sm:p-5 hover:bg-[#111111] transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-sm text-white group-hover:text-white transition-colors truncate">
                          {c.task?.title || c.title || 'Code Contribution'}
                        </h3>
                        <span className="text-xs font-mono text-[#888888]">v{c.version}</span>
                        {renderStatusBadge(c.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#666666] font-mono">
                        <span className="text-[#AAAAAA]">
                          By {c.developer?.name || 'Developer'}
                        </span>
                        <span>•</span>
                        <span>Project: {c.project?.name || 'Project'}</span>
                        <span>•</span>
                        <span>{c.files?.length || 0} files</span>
                        {c.submittedAt && (
                          <>
                            <span>•</span>
                            <span>{new Date(c.submittedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectContribution(c);
                        }}
                        className="px-3.5 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Review Code</span>
                        <ChevronRightIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

