import React, { useState } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import { GitCommitIcon, GitPullRequestIcon, CodeIcon } from '../../components/common/Icons';

export default function Contributions() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [contributions] = useState([]); // dynamic empty array

  const draft = contributions.filter(c => c.status === 'draft').length;
  const inReview = contributions.filter(c => c.status === 'in_review').length;
  const approved = contributions.filter(c => c.status === 'approved').length;
  const changesRequested = contributions.filter(c => c.status === 'changes_requested').length;

  const tabs = [
    { id: 'All', label: 'All', count: contributions.length },
    { id: 'Draft', label: 'Draft', count: draft },
    { id: 'In Review', label: 'In Review', count: inReview },
    { id: 'Approved', label: 'Approved', count: approved },
    { id: 'Changes Requested', label: 'Changes Requested', count: changesRequested },
  ];

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
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard label="Total Contributions" value={contributions.length} subtext="No activity yet" icon={GitCommitIcon} />
        <StatCard label="Draft" value={draft} subtext="No activity yet" icon={GitCommitIcon} />
        <StatCard label="In Review" value={inReview} subtext="No activity yet" icon={GitPullRequestIcon} />
        <StatCard label="Approved" value={approved} subtext="No activity yet" icon={GitCommitIcon} />
        <StatCard label="Changes Requested" value={changesRequested} subtext="No activity yet" icon={GitPullRequestIcon} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222222] overflow-x-auto no-scrollbar pb-1">
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

      {/* Main Table or Code-Review Split Interface */}
      {selectedContribution ? (
        <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
          <div className="p-4 border-b border-[#222222] flex items-center justify-between">
            <button
              onClick={() => setSelectedContribution(null)}
              className="text-xs font-mono text-[#888888] hover:text-white transition-colors"
            >
              ← Back to Contributions Table
            </button>
            <span className="text-xs font-mono font-bold text-white">Code Review</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
            {/* FILE EXPLORER */}
            <div className="lg:col-span-3 border-r border-[#222222] p-4 bg-[#080808]">
              <span className="text-[10px] font-mono font-bold uppercase text-[#666666] tracking-wider block mb-3">
                FILE EXPLORER
              </span>
              <p className="text-xs text-[#555555] font-mono">No files</p>
            </div>

            {/* CODE VIEWER */}
            <div className="lg:col-span-6 p-6 flex flex-col items-center justify-center text-center bg-[#0D0D0D]">
              <span className="text-[10px] font-mono font-bold uppercase text-[#666666] tracking-wider block mb-2">
                CODE VIEWER
              </span>
              <p className="text-xs text-[#555555] font-mono">No code selected</p>
            </div>

            {/* REVIEW PANEL */}
            <div className="lg:col-span-3 border-l border-[#222222] p-4 bg-[#080808]">
              <span className="text-[10px] font-mono font-bold uppercase text-[#666666] tracking-wider block mb-3">
                REVIEW
              </span>
              <p className="text-xs text-[#555555] font-mono">No contribution selected</p>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Contributions Table */
        <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-12">
          {contributions.length === 0 ? (
            <EmptyState
              icon={GitCommitIcon}
              title="NO CONTRIBUTIONS YET"
              description="Developer code submissions will appear here when team members submit their work."
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <div className="space-y-3">
              {contributions.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedContribution(c)}
                  className="p-4 rounded-xl border border-[#222222] bg-[#111111] hover:border-white transition-all cursor-pointer flex items-center justify-between"
                >
                  <span className="font-bold text-sm text-white">{c.title}</span>
                  <span className="text-xs text-[#888888]">{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Structural Code-Review Preview Container */}
      <div className="rounded-2xl border border-[#222222] bg-[#070707] p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A] mb-4">
          <div className="flex items-center gap-2">
            <CodeIcon className="w-4 h-4 text-[#888888]" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AAAAAA]">
              CODE REVIEW WORKSPACE PREVIEW
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#555555]">
            idle state
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
          <div className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A]">
            <span className="text-[10px] font-mono font-bold text-[#666666] uppercase block">
              FILE EXPLORER
            </span>
            <span className="text-xs font-mono text-[#444444] mt-2 block">
              No files
            </span>
          </div>

          <div className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A]">
            <span className="text-[10px] font-mono font-bold text-[#666666] uppercase block">
              CODE VIEWER
            </span>
            <span className="text-xs font-mono text-[#444444] mt-2 block">
              No code selected
            </span>
          </div>

          <div className="p-4 rounded-xl border border-[#1A1A1A] bg-[#0A0A0A]">
            <span className="text-[10px] font-mono font-bold text-[#666666] uppercase block">
              REVIEW
            </span>
            <span className="text-xs font-mono text-[#444444] mt-2 block">
              No contribution selected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
