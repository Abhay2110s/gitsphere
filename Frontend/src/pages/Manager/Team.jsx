import React, { useState, useEffect, useMemo } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import AddDeveloperModal from '../../components/manager/AddDeveloperModal';
import { UsersIcon, PlusIcon, CloseIcon, CheckIcon } from '../../components/common/Icons';
import { useProjects } from '../../hooks/useProjects';
import { projectsApi } from '../../api/projects.api';
import { usersApi } from '../../api/users.api';

export default function Team() {
  const { projects, loading: loadingProjects, refetch } = useProjects();
  const [candidateDevelopers, setCandidateDevelopers] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProject, setFilterProject] = useState('ALL');
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [removingMemberId, setRemovingMemberId] = useState(null);

  // Fetch registered platform developers (role=USER) for quick assignment
  useEffect(() => {
    let ignore = false;
    async function loadCandidates() {
      setLoadingCandidates(true);
      try {
        const res = await usersApi.getUsers({ role: 'USER', limit: 100 });
        const list = Array.isArray(res) ? res : res?.data || [];
        if (!ignore) {
          setCandidateDevelopers(list);
        }
      } catch (err) {
        console.error('Failed to load candidate developers:', err);
      } finally {
        if (!ignore) setLoadingCandidates(false);
      }
    }
    loadCandidates();
    return () => {
      ignore = true;
    };
  }, []);

  // Aggregate unique team members across all manager's projects
  const teamMembers = useMemo(() => {
    const memberMap = new Map();

    (projects || []).forEach((project) => {
      const projId = project._id || project.id;
      const projName = project.name || 'Untitled Project';

      (project.members || []).forEach((m) => {
        const memId = m._id || m.id;
        if (!memId) return;

        if (!memberMap.has(memId)) {
          memberMap.set(memId, {
            id: memId,
            name: m.name || 'Developer',
            email: m.email || '',
            avatar: m.avatar || '',
            role: m.role || 'USER',
            projects: [{ id: projId, name: projName }],
          });
        } else {
          const existing = memberMap.get(memId);
          if (!existing.projects.some((p) => p.id === projId)) {
            existing.projects.push({ id: projId, name: projName });
          }
        }
      });
    });

    return Array.from(memberMap.values());
  }, [projects]);

  // Filtered members based on search and project filter
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.projects.some((p) => p.name.toLowerCase().includes(query));

      const matchesProject =
        filterProject === 'ALL' ||
        m.projects.some((p) => p.id === filterProject);

      return matchesSearch && matchesProject;
    });
  }, [teamMembers, searchQuery, filterProject]);

  const totalMembersCount = teamMembers.length;
  const totalProjectsCount = projects.length;

  const showNotification = (msg, isErr = false) => {
    if (isErr) {
      setActionError(msg);
      setActionMessage(null);
    } else {
      setActionMessage(msg);
      setActionError(null);
    }
    setTimeout(() => {
      setActionMessage(null);
      setActionError(null);
    }, 4000);
  };

  const handleInviteDeveloper = async ({ projectId, email, userId }) => {
    try {
      await projectsApi.addProjectMember(projectId, { email, userId });
      await refetch();
      window.dispatchEvent(new CustomEvent('gitsphere:project-created'));
      showNotification(`Developer ${email} successfully added to project!`);
    } catch (err) {
      throw new Error(err?.message || 'Failed to add developer to project', { cause: err });
    }
  };

  const handleRemoveMember = async (projectId, userId, memberName, projectName) => {
    const confirmed = window.confirm(
      `Remove ${memberName || 'this developer'} from project "${projectName}"?`
    );
    if (!confirmed) return;

    try {
      setRemovingMemberId(`${projectId}-${userId}`);
      await projectsApi.removeProjectMember(projectId, userId);
      await refetch();
      window.dispatchEvent(new CustomEvent('gitsphere:project-created'));
      showNotification(`Removed ${memberName} from ${projectName}.`);
    } catch (err) {
      showNotification(err?.message || 'Failed to remove member.', true);
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            TEAM
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Manage contributors, developer seats, and repository permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-all cursor-pointer shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>+ Add Developer</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckIcon className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <CloseIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Contributors"
          value={loadingProjects ? '...' : totalMembersCount}
          subtext={totalMembersCount > 0 ? `${totalMembersCount} unique developers` : 'No team members added yet'}
          icon={UsersIcon}
        />
        <StatCard
          label="Active Projects"
          value={loadingProjects ? '...' : totalProjectsCount}
          subtext={`${totalProjectsCount} repositories managed`}
          icon={UsersIcon}
        />
        <StatCard
          label="Registered Developers"
          value={loadingCandidates ? '...' : candidateDevelopers.length}
          subtext="Available on platform"
          icon={UsersIcon}
        />
      </div>

      {/* Search and Filter Controls */}
      {totalMembersCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0D0D0D] border border-[#222222] p-3 rounded-xl">
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by name, email, project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-xs placeholder-[#666666] focus:border-white focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-mono text-[#888888] uppercase">Project:</span>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-xs focus:border-white focus:outline-none transition-colors"
            >
              <option value="ALL" className="bg-[#141414] text-white">All Projects</option>
              {projects.map((p) => {
                const id = p._id || p.id;
                return (
                  <option key={id} value={id} className="bg-[#141414] text-white">
                    {p.name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}

      {/* Team Roster / Empty State */}
      <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-8">
        {loadingProjects ? (
          <div className="py-16 text-center text-[#888888] text-sm flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>Loading team members...</span>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="NO PROJECTS FOUND"
            description="Create a project first before inviting developers to collaborate."
            actionLabel="View Projects"
            onAction={() => {
              window.location.hash = '#/projects';
            }}
            className="border-0 bg-transparent py-10"
          />
        ) : teamMembers.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="YOUR TEAM IS EMPTY"
            description="Invite developers to collaborate on your repositories and assign tasks."
            actionLabel="+ Add Developer"
            onAction={() => setIsModalOpen(true)}
            className="border-0 bg-transparent py-10"
          />
        ) : filteredMembers.length === 0 ? (
          <div className="py-12 text-center text-[#888888] text-xs font-mono">
            No team members match your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl border border-[#222222] bg-[#111111] hover:border-[#333333] transition-colors flex flex-col justify-between gap-4"
              >
                {/* Member Header */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1C1C1C] border border-[#2C2C2C] flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                    {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-white truncate">{member.name}</h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-[#888888] font-mono truncate">{member.email}</p>
                    <p className="text-[10px] text-[#555555] uppercase font-mono mt-0.5">
                      Role: {member.role === 'USER' ? 'Developer' : member.role}
                    </p>
                  </div>
                </div>

                {/* Assigned Projects */}
                <div className="pt-3 border-t border-[#1C1C1C] space-y-2">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#666666]">
                    Assigned Repositories:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.projects.map((proj) => {
                      const isRemoving = removingMemberId === `${proj.id}-${member.id}`;
                      return (
                        <div
                          key={proj.id}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#181818] border border-[#2A2A2A] text-[11px] text-[#DDDDDD]"
                        >
                          <span className="font-mono text-white truncate max-w-[120px]">
                            {proj.name}
                          </span>
                          <button
                            type="button"
                            title={`Remove from ${proj.name}`}
                            disabled={isRemoving}
                            onClick={() =>
                              handleRemoveMember(proj.id, member.id, member.name, proj.name)
                            }
                            className="text-[#666666] hover:text-red-400 transition-colors p-0.5 cursor-pointer disabled:opacity-50"
                          >
                            <CloseIcon className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Developer Modal */}
      <AddDeveloperModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projects={projects}
        candidateDevelopers={candidateDevelopers}
        onInviteDeveloper={handleInviteDeveloper}
      />
    </div>
  );
}
