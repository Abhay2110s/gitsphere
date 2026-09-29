import React, { useState } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import {
  FolderIcon,
  UsersIcon,
  TaskCheckIcon,
  CheckIcon,
  GitPullRequestIcon,
  ActivityIcon,
  GitCommitIcon,
  ArrowRightIcon,
} from '../../components/common/Icons';

export default function ProjectDetails({ project, onBackToProjects }) {
  const [activeTab, setActiveTab] = useState('Overview');

  // If no project is currently selected
  if (!project) {
    return (
      <div className="py-12 animate-fade-in">
        <EmptyState
          icon={FolderIcon}
          title="PROJECT NOT FOUND"
          description="Select a project from your projects to view its details."
          actionLabel="← Return to Projects"
          onAction={onBackToProjects}
        />
      </div>
    );
  }

  const tabs = ['Overview', 'Tasks', 'Contributions', 'Reviews', 'Team', 'Activity', 'Versions'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <button
            onClick={onBackToProjects}
            className="text-xs font-mono text-[#888888] hover:text-white flex items-center gap-1.5 mb-2 transition-colors cursor-pointer"
          >
            ← Back to Projects
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {project.name}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#333333] text-[#CCCCCC]">
              Current version: No version yet
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            {project.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Members" value={project.members?.length || 0} subtext="No activity yet" icon={UsersIcon} />
        <StatCard label="Tasks" value={project.tasks?.length || 0} subtext="No activity yet" icon={TaskCheckIcon} />
        <StatCard label="Completed" value={project.completedTasks?.length || 0} subtext="No activity yet" icon={CheckIcon} />
        <StatCard label="Pending Reviews" value={project.pendingReviews?.length || 0} subtext="No activity yet" icon={GitPullRequestIcon} />
      </div>

      {/* Project Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#222222] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === tab
                ? 'border-white text-white'
                : 'border-transparent text-[#666666] hover:text-[#AAAAAA]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels with Zero-States */}
      <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-10">
        {activeTab === 'Overview' && (
          <EmptyState
            icon={FolderIcon}
            title="NO REPOSITORY DATA YET"
            description="Connect code sources and assign sprint deliverables to view project health telemetry."
            className="border-0 bg-transparent py-8"
          />
        )}

        {activeTab === 'Tasks' && (
          <EmptyState
            icon={TaskCheckIcon}
            title="NO TASKS IN PROJECT"
            description="Create task items to start tracking sprint development."
            actionLabel="+ Create Task"
            onAction={() => {}}
            className="border-0 bg-transparent py-8"
          />
        )}

        {activeTab === 'Contributions' && (
          <EmptyState
            icon={GitCommitIcon}
            title="NO CONTRIBUTIONS SUBMITTED"
            description="Developer code submissions for this project will appear here."
            className="border-0 bg-transparent py-8"
          />
        )}

        {activeTab === 'Reviews' && (
          <EmptyState
            icon={GitPullRequestIcon}
            title="NO REVIEWS REQUIRED"
            description="Pending pull requests and verified sign-offs will appear here."
            className="border-0 bg-transparent py-8"
          />
        )}

        {activeTab === 'Team' && (
          <EmptyState
            icon={UsersIcon}
            title="NO TEAM MEMBERS ASSIGNED"
            description="Invite developers to work on this repository."
            actionLabel="+ Assign Developer"
            onAction={() => {}}
            className="border-0 bg-transparent py-8"
          />
        )}

        {activeTab === 'Activity' && (
          <EmptyState
            icon={ActivityIcon}
            title="NO ACTIVITY YET"
            description="Project activity will appear here as work begins."
            className="border-0 bg-transparent py-8"
          />
        )}

        {activeTab === 'Versions' && (
          <EmptyState
            icon={GitCommitIcon}
            title="NO VERSION YET"
            description="Release versions (v1, v2) will generate after initial approved code contributions."
            className="border-0 bg-transparent py-8"
          />
        )}
      </div>
    </div>
  );
}
