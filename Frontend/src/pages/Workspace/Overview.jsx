import React from 'react';
import StatCard from '../../components/workspace/StatCard';
import EmptyState from '../../components/workspace/EmptyState';
import { PageSkeleton } from '../../components/workspace/SkeletonLoaders';
import {
  TaskCheckIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  UsersIcon,
  TagIcon,
  ActivityIcon,
  CodeIcon,
  FolderIcon,
} from '../../components/common/Icons';

export default function Overview({
  project,
  stats,
  progress,
  activity,
  loading,
  error,
  onNavigate,
}) {
  if (loading) return <PageSkeleton />;

  if (error || !project) {
    return (
      <EmptyState
        icon={FolderIcon}
        title={error ? "Unable to load project" : "No project selected"}
        description={error || "Select a project to view its workspace overview."}
        actionLabel="Go to Dashboard"
        onAction={() => onNavigate?.('overview')}
      />
    );
  }

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="space-y-3">
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555]">
          Project Workspace
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          {project?.name || 'No Project Selected'}
        </h1>
        {project?.description && (
          <p className="text-sm text-[#888888] max-w-2xl leading-relaxed">
            {project.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#666666]">
          {project?.status && (
            <span className="px-2 py-1 rounded-md bg-[#141414] border border-[#2A2A2A] text-[#AAAAAA] uppercase text-[10px] font-bold">
              {project.status}
            </span>
          )}
          {project?.createdAt && (
            <span>Created {formatDate(project.createdAt)}</span>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => onNavigate?.('editor')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer shadow-sm"
          >
            <CodeIcon className="w-3.5 h-3.5" />
            Open Editor
          </button>
          <button
            onClick={() => onNavigate?.('files')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white text-xs font-bold hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <FolderIcon className="w-3.5 h-3.5" />
            View Files
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Tasks" value={stats.tasks} icon={TaskCheckIcon} subtext="No activity yet" />
        <StatCard label="Contributions" value={stats.contributions} icon={GitCommitIcon} subtext="No activity yet" />
        <StatCard label="Reviews" value={stats.reviews} icon={GitPullRequestIcon} subtext="No activity yet" />
        <StatCard label="Team Members" value={stats.teamMembers} icon={UsersIcon} subtext="No activity yet" />
        <StatCard label="Versions" value={stats.versions} icon={TagIcon} subtext="No activity yet" />
      </div>

      {/* Progress */}
      <div className="p-6 rounded-xl border border-[#222222] bg-[#0A0A0A]">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#555555] mb-4">
          Development Progress
        </h2>
        <div className="flex items-end gap-4 mb-3">
          <span className="text-4xl font-black text-white tracking-tight">{progress}%</span>
          <span className="text-xs font-mono text-[#666666] pb-1">
            {stats.completedTasks} / {stats.tasks} tasks completed
          </span>
        </div>
        <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {stats.tasks === 0 && (
          <p className="text-xs text-[#666666] mt-3 font-mono">
            Tasks assigned to this project will appear here.
          </p>
        )}
      </div>

      {/* Recent Activity */}
      <div className="p-6 rounded-xl border border-[#222222] bg-[#0A0A0A]">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#555555] mb-4">
          Recent Activity
        </h2>
        {activity.length === 0 ? (
          <div className="text-center py-8">
            <ActivityIcon className="w-8 h-8 text-[#333333] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#666666]">No activity yet</p>
            <p className="text-xs text-[#555555] mt-1">
              Project activity will appear here once development begins.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activity.slice(0, 5).map((item, i) => (
              <div key={item._id || i} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#444444] mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs text-white font-semibold">{item.message || item.action}</p>
                  <p className="text-[10px] font-mono text-[#666666] mt-0.5">
                    {item.createdAt ? formatDate(item.createdAt) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-[#222222] bg-[#0A0A0A]">
          <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#555555] mb-2">
            Project Status
          </div>
          <div className="text-sm font-bold text-white uppercase">
            {project?.status || 'No status'}
          </div>
        </div>
        <div className="p-5 rounded-xl border border-[#222222] bg-[#0A0A0A]">
          <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#555555] mb-2">
            Current Version
          </div>
          <div className="text-sm font-bold text-white">
            {stats.versions > 0 ? `v${stats.versions}` : 'No version created'}
          </div>
        </div>
        <div className="p-5 rounded-xl border border-[#222222] bg-[#0A0A0A]">
          <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#555555] mb-2">
            Active Contributors
          </div>
          <div className="text-sm font-bold text-white">{stats.teamMembers}</div>
        </div>
        <div className="p-5 rounded-xl border border-[#222222] bg-[#0A0A0A]">
          <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#555555] mb-2">
            Open Tasks
          </div>
          <div className="text-sm font-bold text-white">{stats.todoTasks + stats.inProgressTasks}</div>
        </div>
      </div>
    </div>
  );
}
