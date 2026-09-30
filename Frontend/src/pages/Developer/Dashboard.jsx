import React from 'react';
import { useDeveloperDashboard } from '../../hooks/useDeveloperDashboard';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/developer/StatCard';
import EmptyState from '../../components/developer/EmptyState';
import ErrorState from '../../components/developer/ErrorState';
import ProjectCard from '../../components/developer/ProjectCard';
import { DashboardSkeleton } from '../../components/developer/LoadingSkeleton';
import {
  FolderIcon,
  TaskCheckIcon,
  GitCommitIcon,
  ActivityIcon,
  GitPullRequestIcon,
} from '../../components/common/Icons';

export default function Dashboard({
  onNavigateToProjects,
  onNavigateToTasks,
  onNavigateToContributions,
  onSelectProject,
}) {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useDeveloperDashboard();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load dashboard"
        message={error.message || 'We could not fetch your dashboard metrics from the server.'}
        onRetry={refetch}
      />
    );
  }

  const greetingName = user?.name ? user.name : 'Developer';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dynamic Header */}
      <div className="pb-6 border-b border-[#1F1F1F]">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Good day, {greetingName}.
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#888888]">
          Here is your active development workspace overview and assigned tasks.
        </p>
      </div>

      {/* Overview Cards (Real data only, default 0) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Assigned Tasks"
          value={data.assignedTasks}
          subtext={`${data.inProgress} in progress`}
          icon={TaskCheckIcon}
        />
        <StatCard
          label="In Progress"
          value={data.inProgress}
          subtext={`${data.todo} waiting in to-do`}
          icon={ActivityIcon}
        />
        <div onClick={onNavigateToContributions} className={onNavigateToContributions ? 'cursor-pointer' : ''}>
          <StatCard
            label="Completed Tasks"
            value={data.completed}
            subtext="Approved & completed"
            icon={GitCommitIcon}
          />
        </div>
        <StatCard
          label="In Review"
          value={data.inReview}
          subtext="Awaiting manager review"
          icon={GitPullRequestIcon}
        />
      </div>

      {/* Main Grid: Assigned Repositories & Active Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Assigned Repositories */}
        <div className="lg:col-span-6 p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A] mb-5">
              <div>
                <h2 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase">
                  ASSIGNED PROJECTS
                </h2>
                <p className="text-xs text-[#666666] mt-0.5 font-mono">
                  {data.recentProjects.length} Projects
                </p>
              </div>
              {onNavigateToProjects && (
                <button
                  onClick={onNavigateToProjects}
                  className="text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
                >
                  View All →
                </button>
              )}
            </div>

            {data.recentProjects.length === 0 ? (
              <EmptyState
                icon={FolderIcon}
                title="NO PROJECTS YET"
                description="You haven't been added to any project yet. Once your manager assigns you to a project, it will appear here."
                className="border-0 bg-transparent py-8"
              />
            ) : (
              <div className="space-y-3">
                {data.recentProjects.map((p) => (
                  <ProjectCard
                    key={p._id || p.id}
                    project={p}
                    onSelect={onSelectProject}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Tasks */}
        <div className="lg:col-span-6 p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A] mb-5">
              <div>
                <h2 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase">
                  CURRENT TASKS
                </h2>
                <p className="text-xs text-[#666666] mt-0.5 font-mono">
                  {data.assignedTasks} Assigned
                </p>
              </div>
              {onNavigateToTasks && (
                <button
                  onClick={onNavigateToTasks}
                  className="text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
                >
                  View All →
                </button>
              )}
            </div>

            {data.assignedTasks === 0 ? (
              <EmptyState
                icon={TaskCheckIcon}
                title="NO TASKS ASSIGNED"
                description="You currently have no assigned development tasks. When a manager assigns a ticket to you, it will appear here."
                className="border-0 bg-transparent py-8"
              />
            ) : (
              <div className="p-4 rounded-xl border border-[#1F1F1F] bg-[#0F0F0F] text-xs">
                <div className="flex items-center justify-between mb-3 text-mono text-[#888888]">
                  <span>Status Breakdown</span>
                  <span className="text-white font-bold">{data.assignedTasks} Total</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="p-2 rounded bg-[#161616] border border-[#262626]">
                    <div className="text-[#888888]">To-Do</div>
                    <div className="text-white font-bold mt-1">{data.todo}</div>
                  </div>
                  <div className="p-2 rounded bg-[#161616] border border-[#262626]">
                    <div className="text-[#888888]">In Progress</div>
                    <div className="text-white font-bold mt-1">{data.inProgress}</div>
                  </div>
                  <div className="p-2 rounded bg-[#161616] border border-[#262626]">
                    <div className="text-[#888888]">Completed</div>
                    <div className="text-white font-bold mt-1">{data.completed}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity (Strictly backend only) */}
      <div className="p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A]">
        <div className="pb-4 border-b border-[#1A1A1A] mb-5 flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase">
            RECENT ACTIVITY
          </h2>
          <span className="text-[11px] font-mono text-[#666666]">
            {data.recentActivity.length} Events
          </span>
        </div>

        {data.recentActivity.length === 0 ? (
          <EmptyState
            icon={ActivityIcon}
            title="NO ACTIVITY YET"
            description="Your commits, task progressions, and review comments will create a project timeline here as development begins."
            className="border-0 bg-transparent py-6"
          />
        ) : (
          <div className="divide-y divide-[#181818]">
            {data.recentActivity.map((act, i) => (
              <div key={act._id || act.id || i} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#161616] border border-[#262626] flex items-center justify-center text-[10px] text-white">
                    {act.user?.name ? act.user.name.charAt(0).toUpperCase() : '•'}
                  </div>
                  <div>
                    <span className="font-semibold text-white">{act.user?.name || 'User'}</span>
                    <span className="text-[#888888] ml-1.5">{act.action || act.details || 'performed an action'}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#555555]">
                  {act.createdAt ? new Date(act.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
