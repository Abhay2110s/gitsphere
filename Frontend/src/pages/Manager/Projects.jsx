import React, { useState } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import CreateProjectModal from '../../components/manager/CreateProjectModal';
import { FolderIcon, PlusIcon } from '../../components/common/Icons';

export default function Projects({ onSelectProject }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects] = useState([]); // dynamic empty state

  const total = projects.length;
  const active = projects.filter(p => p.status === 'active').length;
  const completed = projects.filter(p => p.status === 'completed').length;
  const archived = projects.filter(p => p.status === 'archived').length;

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
            <span>+ New Project</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={total} subtext="No activity yet" icon={FolderIcon} />
        <StatCard label="Active" value={active} subtext="No activity yet" icon={FolderIcon} />
        <StatCard label="Completed" value={completed} subtext="No activity yet" icon={FolderIcon} />
        <StatCard label="Archived" value={archived} subtext="No activity yet" icon={FolderIcon} />
      </div>

      {/* Projects Grid / Empty State */}
      <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-10">
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderIcon}
            title="NO PROJECTS YET"
            description="You haven't created any projects yet. Create your first project to begin organizing your development workflow."
            actionLabel="+ Create Your First Project"
            onAction={() => setIsModalOpen(true)}
            className="border-0 bg-transparent py-12"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject && onSelectProject(p.id)}
                className="p-5 rounded-xl border border-[#222222] bg-[#111111] hover:border-white transition-all cursor-pointer"
              >
                <h3 className="font-bold text-white text-sm">{p.name}</h3>
                <p className="text-xs text-[#888888] mt-1">{p.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={(data) => {
          console.log('Project created:', data);
        }}
      />
    </div>
  );
}
