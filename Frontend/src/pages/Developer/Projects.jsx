import React, { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import ProjectCard from '../../components/developer/ProjectCard';
import EmptyState from '../../components/developer/EmptyState';
import ErrorState from '../../components/developer/ErrorState';
import PageHeader from '../../components/developer/PageHeader';
import { CardSkeleton } from '../../components/developer/LoadingSkeleton';
import { FolderIcon, SearchIcon } from '../../components/common/Icons';

export default function Projects({ onSelectProject }) {
  const { projects, loading, error, refetch } = useProjects();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Assigned Projects"
          description="Projects and repositories you are currently collaborating on."
        />
        <CardSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Assigned Projects"
          description="Projects and repositories you are currently collaborating on."
        />
        <ErrorState
          title="Failed to load projects"
          message={error.message || 'We could not fetch your projects from the server.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const filteredProjects = projects.filter((p) =>
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Assigned Projects"
        description="Repositories and codebases you are contributing to as an assigned developer."
      >
        {projects.length > 0 && (
          <div className="relative w-64">
            <SearchIcon className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111111] border border-[#222222] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#666666] outline-none focus:border-white transition-colors"
            />
          </div>
        )}
      </PageHeader>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderIcon}
          title="NO PROJECTS YET"
          description="You haven't been assigned to a project yet. When your manager adds you to a team, your repositories will appear here."
        />
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="NO MATCHING PROJECTS"
          description={`No project names or descriptions matched "${searchTerm}".`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => (
            <ProjectCard
              key={p._id || p.id}
              project={p}
              onSelect={onSelectProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
