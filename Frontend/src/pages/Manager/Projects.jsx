import React, { useState } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import CreateProjectModal from '../../components/manager/CreateProjectModal';
import { useProjects } from '../../hooks/useProjects';
import { FolderIcon, PlusIcon } from '../../components/common/Icons';

export default function Projects({ onSelectProject }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { projects, createProject } = useProjects();

  const total = projects.length;
  const active = projects.filter((p) => {
    const s = (p.status || '').toLowerCase();
    return s === 'active' || s === 'planning';
  }).length;
  const completed = projects.filter((p) => (p.status || '').toLowerCase() === 'completed').length;
  const archived = projects.filter((p) => (p.status || '').toLowerCase() === 'archived').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            PROJECTS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Create and manage your development projects.
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-all cursor-pointer shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={total} subtext={total === 0 ? "No activity yet" : `${total} total`} icon={FolderIcon} />
        <StatCard label="Active" value={active} subtext={active === 0 ? "No activity yet" : `${active} active`} icon={FolderIcon} />
        <StatCard label="Completed" value={completed} subtext={completed === 0 ? "No activity yet" : `${completed} completed`} icon={FolderIcon} />
        <StatCard label="Archived" value={archived} subtext={archived === 0 ? "No activity yet" : `${archived} archived`} icon={FolderIcon} />
      </div>

      {/* Projects Grid / Empty State */}
      <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-10">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderIcon}
            title="NO PROJECTS YET"
            description="You haven't created any projects yet. Create your first project to begin organizing your development workflow."
            className="border-0 bg-transparent py-12"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p.id || p._id}
                onClick={() => onSelectProject && onSelectProject(p)}
                className="p-5 rounded-xl border border-[#222222] bg-[#111111] hover:border-white transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white text-sm">{p.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#2A2A2A] text-[#AAAAAA] uppercase">
                      {p.status || 'PLANNING'}
                    </span>
                  </div>
                  <p className="text-xs text-[#888888] mt-2 line-clamp-2">
                    {p.description || 'No description provided.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1C1C1C] flex items-center justify-between text-[11px] font-mono text-[#666666]">
                  <span>{p.members?.length || 0} members</span>
                  <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={createProject}
      />
    </div>
  );
}
