import React, { useState } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import CreateProjectModal from '../../components/manager/CreateProjectModal';
import { useProjects } from '../../hooks/useProjects';
import {
  FolderIcon,
  GitPullRequestIcon,
  TaskCheckIcon,
  UsersIcon,
  ActivityIcon,
  ShieldCheckIcon,
  PlusIcon,
} from '../../components/common/Icons';

export default function Dashboard({ user, onNavigateToProjects, onSelectProject }) {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const { projects, createProject } = useProjects();

  // Dynamic state hooks initialized to zero/empty (prepared for real API data)
  const [pendingReviews] = useState([]);
  const [tasks] = useState([]);
  const [teamMembers] = useState([]);
  const [contributions] = useState([]);
  const [activities] = useState([]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back{user?.name ? `, ${user.name}` : ''}.
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            {user?.email ? `${user.email} • ` : ''}Manage projects, track team progress, and review developer contributions.
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

      {/* 2. Zero-State Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={onNavigateToProjects} className={onNavigateToProjects ? 'cursor-pointer' : ''}>
          <StatCard
            label="Active Projects"
            value={projects.length}
            subtext="View projects"
            icon={FolderIcon}
          />
        </div>
        <StatCard
          label="Pending Reviews"
          value={pendingReviews.length}
          subtext="No activity yet"
          icon={GitPullRequestIcon}
        />
        <StatCard
          label="Active Tasks"
          value={tasks.length}
          subtext="No activity yet"
          icon={TaskCheckIcon}
        />
        <StatCard
          label="Team Members"
          value={teamMembers.length}
          subtext="No activity yet"
          icon={UsersIcon}
        />
      </div>

      {/* 3. Projects Overview & Pending Contributions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Projects Overview */}
        <div className="lg:col-span-8 p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A] flex flex-col justify-between">
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
                  className="p-4 rounded-xl border border-[#222222] bg-[#111111] hover:border-white transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">{p.name}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#AAAAAA] uppercase">
                      {p.status || 'PLANNING'}
                    </span>
                  </div>
                  {p.description && (
                    <p className="text-xs text-[#888888] mt-1.5 line-clamp-2">{p.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Pending Contributions */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A] mb-6">
            <div>
              <h2 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase">
                PENDING CONTRIBUTIONS
              </h2>
              <p className="text-xs text-[#666666] mt-0.5 font-mono">
                {contributions.length}
              </p>
            </div>
          </div>

          {contributions.length === 0 ? (
            <EmptyState
              icon={GitPullRequestIcon}
              title="NO CONTRIBUTIONS"
              description="Developer contributions will appear here once your project receives submissions."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <div className="space-y-3">
              {contributions.map((c) => (
                <div key={c.id} className="p-3 rounded-lg border border-[#222222] bg-[#111111] text-xs">
                  {c.title}
                </div>
              ))}
            </div>
          )}
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
              {activities.map((a, i) => (
                <div key={i} className="text-xs text-white">{a.text}</div>
              ))}
            </div>
          )}
        </div>

        {/* Project Health */}
        <div className="lg:col-span-5 p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A]">
          <div className="pb-4 border-b border-[#1A1A1A] mb-6">
            <h2 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase">
              PROJECT HEALTH
            </h2>
          </div>

          <EmptyState
            icon={ShieldCheckIcon}
            title="No project data available."
            description="Create a project to start tracking progress."
            className="border-0 bg-transparent py-6"
          />
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
