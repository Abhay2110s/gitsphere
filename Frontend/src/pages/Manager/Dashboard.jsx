import React, { useState, useEffect } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import CreateProjectModal from '../../components/manager/CreateProjectModal';
import { useProjects } from '../../hooks/useProjects';
import { dashboardApi } from '../../api/dashboard.api';
import {
  FolderIcon,
  GitPullRequestIcon,
  TaskCheckIcon,
  UsersIcon,
  ActivityIcon,
  ShieldCheckIcon,
  PlusIcon,
} from '../../components/common/Icons';


export default function Dashboard({
  user,
  onNavigateToProjects,
  onNavigateToContributions,
  onNavigateToReviews,
  onSelectProject,
}) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const { projects, createProject } = useProjects();

  const [metrics, setMetrics] = useState(null);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const res = await dashboardApi.getManagerDashboard();
        const data = res?.data || res;
        if (isMounted && data) {
          setMetrics(data);
          const pending = data.pendingReviews || data.contributions || [];
          setPendingReviews(Array.isArray(pending) ? pending : []);
          setActivities(Array.isArray(data.recentActivity) ? data.recentActivity : []);
        }
      } catch (err) {
        console.error('Failed to load manager dashboard metrics:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalProjects = metrics?.totalProjects ?? projects.length;
  const activeProjects = metrics?.activeProjects ?? projects.filter(p => p.status === 'ACTIVE').length;
  const totalTasks = metrics?.totalTasks ?? 0;
  const completedTasks = metrics?.completedTasks ?? 0;
  const activeTasks = (metrics?.tasksInProgress || 0) + (metrics?.tasksInReview || 0);
  const totalUsers = metrics?.totalUsers ?? 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const formatActivityText = (act) => {
    const actor = act.user?.name || 'A team member';
    const action = act.action || 'ACTIVITY';
    const taskName = act.task?.title ? ` "${act.task.title}"` : '';
    const projName = act.project?.name ? ` in ${act.project.name}` : '';

    switch (action) {
      case 'CONTRIBUTION_SUBMITTED':
        return `${actor} submitted contribution v${act.metadata?.version || '1'} for review${taskName}${projName}`;
      case 'CONTRIBUTION_APPROVED':
        return `${actor} approved contribution v${act.metadata?.version || '1'}${taskName}${projName}`;
      case 'CONTRIBUTION_CHANGES_REQUESTED':
        return `${actor} requested changes on contribution${taskName}${projName}`;
      case 'TASK_STATUS_CHANGED':
        return `${actor} moved task${taskName} to ${act.metadata?.newStatus || 'new status'}${projName}`;
      case 'TASK_CREATED':
        return `${actor} created task${taskName}${projName}`;
      default:
        return `${actor} performed ${action.toLowerCase().replace(/_/g, ' ')}${projName}`;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ''}.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Manage projects, track team progress, and review developer contributions.
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsCreateProjectOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-all cursor-pointer shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* 2. Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={onNavigateToProjects} className={onNavigateToProjects ? 'cursor-pointer' : ''}>
          <StatCard
            label="Active Projects"
            value={projects.length || activeProjects}
            subtext={`${totalProjects} total projects`}
            icon={FolderIcon}
            isLoading={isLoading}
          />
        </div>
        <div
          onClick={onNavigateToContributions || onNavigateToReviews}
          className={onNavigateToContributions || onNavigateToReviews ? 'cursor-pointer' : ''}
        >
          <StatCard
            label="Pending Reviews"
            value={pendingReviews.length}
            subtext={pendingReviews.length > 0 ? `${pendingReviews.length} awaiting review` : 'No pending reviews'}
            icon={GitPullRequestIcon}
            isLoading={isLoading}
          />
        </div>
        <StatCard
          label="Active Tasks"
          value={activeTasks || totalTasks}
          subtext={`${completedTasks} completed`}
          icon={TaskCheckIcon}
          isLoading={isLoading}
        />
        <StatCard
          label="Team Members"
          value={totalUsers}
          subtext={`${metrics?.activeUsers || totalUsers} active`}
          icon={UsersIcon}
          isLoading={isLoading}
        />
      </div>

      {/* 3. Projects Overview & Pending Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Projects Overview */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A] mb-6">
              <div>
                <h2 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase">
                  PROJECTS
                </h2>
                <p className="text-xs text-[#666666] mt-0.5">
                  {projects.length} Projects
                </p>
              </div>
              <div className="flex items-center gap-3">
                {onNavigateToProjects && (
                  <button
                    type="button"
                    onClick={onNavigateToProjects}
                    className="text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
                  >
                    View All &rarr;
                  </button>
                )}
              </div>
            </div>

            {projects.length === 0 ? (
              <EmptyState
                icon={FolderIcon}
                title="NO PROJECTS YET"
                description="Create your first project to start managing tasks, contributions, reviews, and your team."
                className="border-0 bg-transparent py-8"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.map((p) => (
                  <div
                    key={p.id || p._id}
                    onClick={() => onSelectProject ? onSelectProject(p) : (onNavigateToProjects && onNavigateToProjects())}
                    className="p-4 rounded-xl border border-[#222222] bg-[#111111] hover:border-white transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-sm group-hover:text-white transition-colors">
                        {p.name}
                      </h3>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#AAAAAA] uppercase">
                        {p.status || 'PLANNING'}
                      </span>
                    </div>
                    {p.description && (
                      <p className="text-xs text-[#888888] mt-1.5 line-clamp-2">{p.description}</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-[#1C1C1C] flex items-center justify-between text-[11px] text-[#666666] font-mono">
                      <span>v{p.currentVersion || 1}</span>
                      <span>{p.members?.length || 0} members</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pending Contributions */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A] mb-6">
              <div>
                <h2 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase">
                  PENDING CONTRIBUTIONS
                </h2>
                <p className="text-xs text-[#666666] mt-0.5 font-mono">
                  {pendingReviews.length} requiring review
                </p>
              </div>
              {(onNavigateToContributions || onNavigateToReviews) && (
                <button
                  type="button"
                  onClick={onNavigateToContributions || onNavigateToReviews}
                  className="text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
                >
                  Review All &rarr;
                </button>
              )}
            </div>

            {pendingReviews.length === 0 ? (
              <EmptyState
                icon={GitPullRequestIcon}
                title="NO CONTRIBUTIONS"
                description="Developer contributions will appear here once your project receives submissions."
                className="border-0 bg-transparent py-8"
              />
            ) : (
              <div className="space-y-3">
                {pendingReviews.slice(0, 5).map((c) => (
                  <div
                    key={c.id || c._id}
                    onClick={() => {
                      if (onNavigateToContributions) onNavigateToContributions();
                      else if (onNavigateToReviews) onNavigateToReviews();
                    }}
                    className="p-3.5 rounded-xl border border-[#222222] bg-[#111111] hover:border-[#444444] transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate group-hover:text-white">
                          {c.task?.title || c.title || 'Code Submission'}
                        </h4>
                        <p className="text-[11px] text-[#888888] truncate mt-0.5">
                          {c.developer?.name || 'Developer'} • {c.project?.name || 'Project'}
                        </p>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-amber-900/60 bg-amber-950/20 text-amber-400 shrink-0 uppercase font-bold">
                        v{c.version} IN REVIEW
                      </span>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-[#1C1C1C] flex items-center justify-between text-[10px] text-[#666666] font-mono">
                      <span>{c.files?.length || 0} files changed</span>
                      <span className="text-white group-hover:underline flex items-center gap-1">
                        Review &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Recent Activity & Project Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A]">
          <div className="pb-4 border-b border-[#1A1A1A] mb-6">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase">
              RECENT ACTIVITY
            </h2>
          </div>

          {activities.length === 0 ? (
            <EmptyState
              icon={ActivityIcon}
              title="No activity yet."
              description="Your project activity will appear here as your team starts working."
              className="border-0 bg-transparent py-6"
            />
          ) : (
            <div className="space-y-3">
              {activities.map((act, i) => (
                <div
                  key={act._id || i}
                  className="p-3 rounded-lg border border-[#1A1A1A] bg-[#111111] flex items-start gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-white mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white leading-relaxed">
                      {formatActivityText(act)}
                    </p>
                    <span className="text-[10px] font-mono text-[#666666] mt-0.5 block">
                      {act.createdAt ? new Date(act.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Health */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A]">
          <div className="pb-4 border-b border-[#1A1A1A] mb-6">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase">
              PROJECT HEALTH & METRICS
            </h2>
          </div>

          {totalProjects === 0 && totalTasks === 0 ? (
            <EmptyState
              icon={ShieldCheckIcon}
              title="No project data available."
              description="Create a project to start tracking progress."
              className="border-0 bg-transparent py-6"
            />
          ) : (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-[#888888]">Task Completion Rate</span>
                  <span className="font-mono font-bold text-white">{completionRate}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#1C1C1C] overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-[#1C1C1C] bg-[#111111]">
                  <span className="text-[10px] font-mono text-[#666666] uppercase block">
                    Under Review
                  </span>
                  <span className="text-lg font-black text-amber-400 mt-1 block">
                    {metrics?.tasksInReview || pendingReviews.length}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-[#1C1C1C] bg-[#111111]">
                  <span className="text-[10px] font-mono text-[#666666] uppercase block">
                    In Progress
                  </span>
                  <span className="text-lg font-black text-white mt-1 block">
                    {metrics?.tasksInProgress || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-[#1C1C1C] bg-[#111111]">
                  <span className="text-[10px] font-mono text-[#666666] uppercase block">
                    Completed
                  </span>
                  <span className="text-lg font-black text-white mt-1 block">
                    {completedTasks}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-[#1C1C1C] bg-[#111111]">
                  <span className="text-[10px] font-mono text-[#666666] uppercase block">
                    Overdue
                  </span>
                  <span className={`text-lg font-black mt-1 block ${metrics?.overdueTasks ? 'text-red-400' : 'text-[#666666]'}`}>
                    {metrics?.overdueTasks || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreateProject={createProject}
      />
    </div>
  );
}

