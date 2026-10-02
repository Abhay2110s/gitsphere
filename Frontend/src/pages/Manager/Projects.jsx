import React, { useState } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import CreateProjectModal from '../../components/manager/CreateProjectModal';
import { useProjects } from '../../hooks/useProjects';
import { FolderIcon, PlusIcon } from '../../components/common/Icons';


export default function Projects({ onSelectProject }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const { projects, createProject, updateProjectStatus } = useProjects();

  const total = projects.length;
  const active = projects.filter((p) => {
    const s = (p.status || '').toUpperCase();
    return s === 'ACTIVE' || s === 'PLANNING';
  }).length;
  const completed = projects.filter((p) => (p.status || '').toUpperCase() === 'COMPLETED').length;
  const archived = projects.filter((p) => (p.status || '').toUpperCase() === 'ARCHIVED').length;

  const filteredProjects = projects.filter((p) => {
    const s = (p.status || 'PLANNING').toUpperCase();
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'ACTIVE') return s === 'ACTIVE' || s === 'PLANNING';
    if (filterStatus === 'COMPLETED') return s === 'COMPLETED';
    if (filterStatus === 'ARCHIVED') return s === 'ARCHIVED';
    return true;
  });

  const handleStatusChange = async (e, projectId, newStatus) => {
    e.stopPropagation();
    try {
      setUpdatingId(projectId);
      await updateProjectStatus(projectId, newStatus);
    } catch (err) {
      console.error('Failed to update project status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'PLANNING').toUpperCase();
    if (s === 'COMPLETED') {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (s === 'ARCHIVED') {
      return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
    if (s === 'ACTIVE') {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
    if (s === 'ON_HOLD') {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-[#1C1C1C] text-[#AAAAAA] border-[#2A2A2A]';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            PROJECTS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Create, complete, and archive development projects.
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1F1F1F] pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'ALL', label: 'All Projects', count: total },
          { id: 'ACTIVE', label: 'Active', count: active },
          { id: 'COMPLETED', label: 'Completed', count: completed },
          { id: 'ARCHIVED', label: 'Archived', count: archived }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === tab.id
                ? 'bg-white text-black font-bold'
                : 'bg-[#121212] text-[#888888] hover:text-white border border-[#222222]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              filterStatus === tab.id ? 'bg-black/20 text-black' : 'bg-[#1C1C1C] text-[#666666]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Projects Grid / Empty State */}
      <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-10">
        {filteredProjects.length === 0 ? (
          <EmptyState
            icon={FolderIcon}
            title={filterStatus === 'ALL' ? "NO PROJECTS YET" : `NO ${filterStatus} PROJECTS`}
            description={
              filterStatus === 'ALL'
                ? "You haven't created any projects yet. Create your first project to begin organizing your development workflow."
                : `There are currently no projects with ${filterStatus.toLowerCase()} status.`
            }
            className="border-0 bg-transparent py-12"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((p) => {
              const projectId = p.id || p._id;
              const status = (p.status || 'PLANNING').toUpperCase();
              const isBusy = updatingId === projectId;

              return (
                <div
                  key={projectId}
                  onClick={() => onSelectProject && onSelectProject(p)}
                  className={`p-5 rounded-xl border bg-[#111111] hover:border-white transition-all cursor-pointer flex flex-col justify-between group ${
                    status === 'COMPLETED'
                      ? 'border-emerald-500/20'
                      : status === 'ARCHIVED'
                      ? 'border-neutral-800 opacity-75'
                      : 'border-[#222222]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                        {p.name}
                      </h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${getStatusBadge(status)}`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-xs text-[#888888] mt-2 line-clamp-2">
                      {p.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {/* Status Management Quick Actions */}
                    <div className="pt-3 border-t border-[#1C1C1C] flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-[#666666]">
                        {p.members?.length || 0} members
                      </span>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {status !== 'COMPLETED' && (
                          <button
                            disabled={isBusy}
                            onClick={(e) => handleStatusChange(e, projectId, 'COMPLETED')}
                            className="px-2 py-1 rounded text-[10px] font-mono font-medium border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer disabled:opacity-50"
                            title="Mark Project as Completed"
                          >
                            ✓ Complete
                          </button>
                        )}

                        {status !== 'ARCHIVED' && (
                          <button
                            disabled={isBusy}
                            onClick={(e) => handleStatusChange(e, projectId, 'ARCHIVED')}
                            className="px-2 py-1 rounded text-[10px] font-mono font-medium border border-[#333333] text-[#888888] hover:text-white hover:bg-[#1E1E1E] transition-colors cursor-pointer disabled:opacity-50"
                            title="Archive Project"
                          >
                            Archive
                          </button>
                        )}

                        {(status === 'COMPLETED' || status === 'ARCHIVED') && (
                          <button
                            disabled={isBusy}
                            onClick={(e) => handleStatusChange(e, projectId, 'ACTIVE')}
                            className="px-2 py-1 rounded text-[10px] font-mono font-medium border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer disabled:opacity-50"
                            title="Re-activate Project"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#555555]">
                      <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Recently'}</span>
                      {status === 'COMPLETED' && (
                        <span className="text-emerald-500/80 font-bold">Goal Finished</span>
                      )}
                      {status === 'ARCHIVED' && (
                        <span className="text-neutral-500 font-bold">Archived</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
