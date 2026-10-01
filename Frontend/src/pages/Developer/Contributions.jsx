import React, { useState, useEffect } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { contributionsApi } from '../../api/contributions.api';
import PageHeader from '../../components/developer/PageHeader';
import ContributionCard from '../../components/developer/ContributionCard';
import EmptyState from '../../components/developer/EmptyState';
import ErrorState from '../../components/developer/ErrorState';
import { CardSkeleton } from '../../components/developer/LoadingSkeleton';
import { GitCommitIcon, PlusIcon, FilterIcon } from '../../components/common/Icons';

export default function Contributions({
  onSelectContribution,
  onNavigateToCodeEditor,
}) {
  const { projects, loading: loadingProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const activeProjectId = selectedProjectId || (projects.length > 0 ? (projects[0]._id || projects[0].id) : '');

  useEffect(() => {
    if (!activeProjectId) return;
    let ignore = false;

    contributionsApi.getContributions(activeProjectId)
      .then((res) => {
        if (!ignore) {
          setContributions(Array.isArray(res) ? res : res?.contributions || []);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
          setContributions([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [activeProjectId]);

  const filteredContributions = contributions.filter((c) => {
    const taskStatus = (c.task?.status || '').toUpperCase();
    const isCompleted = taskStatus === 'COMPLETED';

    if (statusFilter === 'CHANGES_REQUESTED') {
      if (isCompleted) return false;
      return (c.status || '').toUpperCase() === 'CHANGES_REQUESTED';
    }
    if (statusFilter === 'APPROVED') {
      return (c.status || '').toUpperCase() === 'APPROVED' || isCompleted;
    }
    if (statusFilter === 'IN_REVIEW') {
      if (isCompleted) return false;
      return (c.status || '').toUpperCase() === 'IN_REVIEW';
    }
    return true;
  });


  const isLoading = loadingProjects || loading;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Code Contributions"
        description="Submitted code patches, version increments, and pull requests awaiting manager review."
        actions={
          onNavigateToCodeEditor && (
            <button
              onClick={onNavigateToCodeEditor}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer shadow-sm"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>New Contribution</span>
            </button>
          )
        }
      />

      {/* Project Selector & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-[#222222] bg-[#0A0A0A]">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#666666]">Select Project:</span>
          <select
            value={activeProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setLoading(true);
            }}
            className="bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono rounded-xl px-3 py-1.5 outline-none focus:border-white transition-colors cursor-pointer"
          >
            {projects.length === 0 ? (
              <option value="">No projects</option>
            ) : (
              projects.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          {['ALL', 'IN_REVIEW', 'APPROVED', 'CHANGES_REQUESTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-white text-black font-bold'
                  : 'text-[#888888] hover:text-white hover:bg-[#141414]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <CardSkeleton count={3} />
      ) : error ? (
        <ErrorState
          title="Failed to load contributions"
          message={error.message || 'Could not fetch contributions from the server.'}
          onRetry={() => {
            if (!activeProjectId) return;
            setLoading(true);
            setError(null);
            contributionsApi.getContributions(activeProjectId)
              .then((res) => setContributions(Array.isArray(res) ? res : res?.contributions || []))
              .catch(setError)
              .finally(() => setLoading(false));
          }}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={GitCommitIcon}
          title="NO PROJECTS AVAILABLE"
          description="You must be a member of a project to view or submit contributions."
        />
      ) : contributions.length === 0 ? (
        <EmptyState
          icon={GitCommitIcon}
          title="NO CONTRIBUTIONS YET"
          description="Your submitted code branches, commits, and pull requests for this project will appear here."
          actionLabel="Create First Contribution"
          onAction={onNavigateToCodeEditor}
        />
      ) : filteredContributions.length === 0 ? (
        <EmptyState
          icon={FilterIcon}
          title="NO MATCHING CONTRIBUTIONS"
          description={`No contributions with status "${statusFilter}".`}
          actionLabel="Reset Filter"
          onAction={() => setStatusFilter('ALL')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredContributions.map((contrib) => (
            <ContributionCard
              key={contrib._id || contrib.id}
              contribution={contrib}
              onSelect={onSelectContribution}
            />
          ))}
        </div>
      )}
    </div>
  );
}
