import React, { useState, useEffect, useMemo, useCallback } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import CreateTaskModal from '../../components/manager/CreateTaskModal';
import TaskDetailModal from '../../components/manager/TaskDetailModal';
import AddDeveloperModal from '../../components/manager/AddDeveloperModal';
import CreateVersionModal from '../../components/manager/CreateVersionModal';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { projectsApi } from '../../api/projects.api';
import { tasksApi } from '../../api/tasks.api';
import { contributionsApi } from '../../api/contributions.api';
import { activityApi } from '../../api/activity.api';
import {
  FolderIcon,
  UsersIcon,
  TaskCheckIcon,
  CheckIcon,
  GitPullRequestIcon,
  ActivityIcon,
  GitCommitIcon,
  PlusIcon,
  TrashIcon,
  ChevronRightIcon,
} from '../../components/common/Icons';

export default function ProjectDetails({ project, onBackToProjects }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [currentStatus, setCurrentStatus] = useState(project?.status || 'PLANNING');
  const [currentVersion, setCurrentVersion] = useState(project?.currentVersion || 1);
  const [isUpdating, setIsUpdating] = useState(false);

  // Tasks state
  const [projectTasks, setProjectTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  // Team state
  const [members, setMembers] = useState(project?.members || []);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  // Versions state
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [isCreateVersionOpen, setIsCreateVersionOpen] = useState(false);
  const [selectedVersionForPreview, setSelectedVersionForPreview] = useState(null);
  const [activatingVersion, setActivatingVersion] = useState(false);

  // Contributions & Reviews state
  const [contributions, setContributions] = useState([]);
  const [loadingContributions, setLoadingContributions] = useState(false);
  const [selectedContributionForReview, setSelectedContributionForReview] = useState(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isProcessingReview, setIsProcessingReview] = useState(false);

  // Activity state
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  const projectId = project?.id || project?._id;

  // Memoized available developers and pending reviews before any returns
  const availableDevelopers = useMemo(() => {
    if (!members || !Array.isArray(members)) return [];
    return members.map((m) => {
      const id = String(m._id || m.id || m);
      return {
        id,
        _id: id,
        name: m.name || m.fullName || m.email || id,
        email: m.email,
      };
    });
  }, [members]);

  const pendingReviewsList = useMemo(() => {
    return contributions.filter((c) => c.status === 'IN_REVIEW');
  }, [contributions]);

  useEffect(() => {
    if (project?.status) setCurrentStatus(project.status);
    if (project?.currentVersion) setCurrentVersion(project.currentVersion);
    if (Array.isArray(project?.members)) setMembers(project.members);
  }, [project]);

  // Fetch tasks
  const fetchProjectTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoadingTasks(true);
      const res = await projectsApi.getProjectTasks(projectId);
      const list = Array.isArray(res) ? res : res?.tasks || res?.data?.tasks || res?.data || [];
      setProjectTasks(list);
    } catch (err) {
      console.error('Failed to load project tasks:', err);
      setProjectTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, [projectId]);

  // Fetch versions
  const fetchVersions = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoadingVersions(true);
      const res = await projectsApi.getVersionHistory(projectId);
      const list = Array.isArray(res) ? res : res?.versions || res?.data || [];
      setVersions(list);
    } catch (err) {
      console.error('Failed to load versions:', err);
      setVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  }, [projectId]);

  // Fetch contributions
  const fetchContributions = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoadingContributions(true);
      const res = await contributionsApi.getContributions(projectId);
      const list = Array.isArray(res) ? res : res?.contributions || res?.data || [];
      setContributions(list);
    } catch (err) {
      console.error('Failed to load contributions:', err);
      setContributions([]);
    } finally {
      setLoadingContributions(false);
    }
  }, [projectId]);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoadingActivities(true);
      const res = await activityApi.getActivity({ projectId });
      const list = Array.isArray(res) ? res : res?.activities || res?.data || [];
      setActivities(list);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  }, [projectId]);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await projectsApi.getProjectMembers(projectId);
      const list = Array.isArray(res) ? res : res?.members || res?.data || [];
      setMembers(list);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  }, [projectId]);

  // Tab-based data loading
  useEffect(() => {
    if (!projectId) return;
    if (activeTab === 'Tasks' || activeTab === 'Overview') fetchProjectTasks();
    if (activeTab === 'Versions' || activeTab === 'Overview') fetchVersions();
    if (activeTab === 'Contributions' || activeTab === 'Reviews' || activeTab === 'Overview') fetchContributions();
    if (activeTab === 'Team' || activeTab === 'Overview') fetchMembers();
    if (activeTab === 'Activity' || activeTab === 'Overview') fetchActivities();
  }, [projectId, activeTab, fetchProjectTasks, fetchVersions, fetchContributions, fetchMembers, fetchActivities]);

  // Global event listeners
  useEffect(() => {
    const handleSync = () => {
      fetchProjectTasks();
      fetchVersions();
      fetchContributions();
      fetchMembers();
      fetchActivities();
    };
    window.addEventListener('gitsphere:task-created', handleSync);
    window.addEventListener('gitsphere:task-updated', handleSync);
    window.addEventListener('gitsphere:task-deleted', handleSync);
    window.addEventListener('gitsphere:project-updated', handleSync);
    return () => {
      window.removeEventListener('gitsphere:task-created', handleSync);
      window.removeEventListener('gitsphere:task-updated', handleSync);
      window.removeEventListener('gitsphere:task-deleted', handleSync);
      window.removeEventListener('gitsphere:project-updated', handleSync);
    };
  }, [fetchProjectTasks, fetchVersions, fetchContributions, fetchMembers, fetchActivities]);

  if (!project) {
    return (
      <div className="py-12 animate-fade-in">
        <EmptyState
          icon={FolderIcon}
          title="PROJECT NOT FOUND"
          description="Select a project from your projects to view its details."
          actionLabel="← Return to Projects"
          onAction={onBackToProjects}
        />
      </div>
    );
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      await projectsApi.updateProject(projectId, { status: newStatus });
      setCurrentStatus(newStatus);
      window.dispatchEvent(
        new CustomEvent('gitsphere:project-updated', {
          detail: { projectId, status: newStatus }
        })
      );
    } catch (err) {
      console.error('Failed to update project status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Task operations
  const handleCreateTask = async (taskData) => {
    const payload = { ...taskData };
    delete payload.projectId;
    const res = await tasksApi.createTask(projectId, payload);
    const newTask = res?.data || res?.task || res;
    setProjectTasks((prev) => [newTask, ...prev]);
    window.dispatchEvent(new CustomEvent('gitsphere:task-created', { detail: newTask }));
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) return;
    try {
      setIsDeletingTask(true);
      await tasksApi.deleteTask(taskId);
      setProjectTasks((prev) => prev.filter((t) => t._id !== taskId && t.id !== taskId));
      window.dispatchEvent(new CustomEvent('gitsphere:task-deleted', { detail: { taskId } }));
      if (selectedTask && (selectedTask._id === taskId || selectedTask.id === taskId)) {
        setSelectedTask(null);
      }
      setTaskToDelete(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleUpdateTask = async (taskId, updateData) => {
    const res = await tasksApi.updateTask(taskId, updateData);
    const updated = res?.data || res?.task || res;
    setProjectTasks((prev) =>
      prev.map((t) => (t._id === taskId || t.id === taskId ? { ...t, ...updated } : t))
    );
    if (selectedTask && (selectedTask._id === taskId || selectedTask.id === taskId)) {
      setSelectedTask((prev) => ({ ...prev, ...updated }));
    }
    window.dispatchEvent(new CustomEvent('gitsphere:task-updated', { detail: updated }));
    return updated;
  };

  const handleAssignTask = async (taskId, assignedTo) => {
    const res = await tasksApi.assignTask(taskId, assignedTo);
    const updated = res?.data || res?.task || res;
    setProjectTasks((prev) =>
      prev.map((t) => (t._id === taskId || t.id === taskId ? { ...t, ...updated } : t))
    );
    if (selectedTask && (selectedTask._id === taskId || selectedTask.id === taskId)) {
      setSelectedTask((prev) => ({ ...prev, ...updated }));
    }
    window.dispatchEvent(new CustomEvent('gitsphere:task-updated', { detail: updated }));
    return updated;
  };

  // Version Operations
  const handleCreateVersion = async (versionData) => {
    const res = await projectsApi.createProjectVersion(projectId, versionData);
    const newVer = res?.data || res;
    setCurrentVersion(newVer.version || currentVersion + 1);
    fetchVersions();
    fetchActivities();
    window.dispatchEvent(new CustomEvent('gitsphere:project-updated', { detail: { projectId } }));
  };

  const handleActivateVersion = async (verNumber) => {
    try {
      setActivatingVersion(true);
      await projectsApi.activateProjectVersion(projectId, verNumber);
      setCurrentVersion(verNumber);
      fetchVersions();
      fetchActivities();
      window.dispatchEvent(new CustomEvent('gitsphere:project-updated', { detail: { projectId, currentVersion: verNumber } }));
    } catch (err) {
      console.error('Failed to activate version:', err);
    } finally {
      setActivatingVersion(false);
    }
  };

  // Team Member Operations
  const handleAddMember = async ({ email, userId }) => {
    await projectsApi.addProjectMember(projectId, { email, userId });
    fetchMembers();
    fetchActivities();
    window.dispatchEvent(new CustomEvent('gitsphere:project-updated', { detail: { projectId } }));
  };

  const handleRemoveMember = async (userId) => {
    if (!userId) return;
    try {
      setIsRemovingMember(true);
      await projectsApi.removeProjectMember(projectId, userId);
      setMembers((prev) => prev.filter((m) => (m._id || m.id || m) !== userId));
      setMemberToRemove(null);
      fetchActivities();
      window.dispatchEvent(new CustomEvent('gitsphere:project-updated', { detail: { projectId } }));
    } catch (err) {
      console.error('Failed to remove member:', err);
    } finally {
      setIsRemovingMember(false);
    }
  };

  // Review & Contribution Operations
  const handleApproveContribution = async (contribId) => {
    try {
      setIsProcessingReview(true);
      await contributionsApi.approveContribution(contribId);
      fetchContributions();
      fetchVersions();
      fetchProjectTasks();
      fetchActivities();
      setSelectedContributionForReview(null);
      window.dispatchEvent(new CustomEvent('gitsphere:project-updated', { detail: { projectId } }));
    } catch (err) {
      console.error('Failed to approve contribution:', err);
    } finally {
      setIsProcessingReview(false);
    }
  };

  const handleRequestChanges = async (contribId) => {
    if (!reviewComment.trim()) return;
    try {
      setIsProcessingReview(true);
      await contributionsApi.requestChanges(contribId, reviewComment.trim());
      fetchContributions();
      fetchProjectTasks();
      fetchActivities();
      setSelectedContributionForReview(null);
      setReviewComment('');
      window.dispatchEvent(new CustomEvent('gitsphere:project-updated', { detail: { projectId } }));
    } catch (err) {
      console.error('Failed to request changes:', err);
    } finally {
      setIsProcessingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'PLANNING').toUpperCase();
    if (s === 'COMPLETED') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (s === 'ARCHIVED') return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    if (s === 'ACTIVE') return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (s === 'ON_HOLD') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-[#1C1C1C] text-[#AAAAAA] border-[#2A2A2A]';
  };

  const tabs = ['Overview', 'Tasks', 'Contributions', 'Reviews', 'Team', 'Activity', 'Versions'];
  const normalizedStatus = (currentStatus || 'PLANNING').toUpperCase();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <button
            onClick={onBackToProjects}
            className="text-xs font-mono text-[#888888] hover:text-white flex items-center gap-1.5 mb-2 transition-colors cursor-pointer"
          >
            ← Back to Projects
          </button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {project.name}
            </h1>
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded border uppercase font-bold ${getStatusBadge(normalizedStatus)}`}>
              {normalizedStatus}
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              Active: v{currentVersion}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#888888] max-w-2xl">
            {project.description || 'No description provided.'}
          </p>
        </div>

        {/* Manager Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsCreateVersionOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#181818] border border-[#333333] text-white text-xs font-mono font-bold hover:bg-[#252525] transition-all cursor-pointer shadow-sm"
          >
            <GitCommitIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Create Version</span>
          </button>

          {normalizedStatus !== 'COMPLETED' && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('COMPLETED')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
              <span>Mark Completed</span>
            </button>
          )}

          {normalizedStatus !== 'ARCHIVED' && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('ARCHIVED')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#181818] border border-[#333333] text-[#CCCCCC] text-xs font-mono font-medium hover:text-white hover:bg-[#222222] transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Archive</span>
            </button>
          )}

          {(normalizedStatus === 'COMPLETED' || normalizedStatus === 'ARCHIVED') && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('ACTIVE')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <span>Reactivate</span>
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Members" value={members.length} subtext="Assigned developers" icon={UsersIcon} />
        <StatCard label="Tasks" value={projectTasks.length} subtext="Tracked items" icon={TaskCheckIcon} />
        <StatCard label="Pending Reviews" value={pendingReviewsList.length} subtext="Pull requests" icon={GitPullRequestIcon} />
        <StatCard label="Releases" value={versions.length || 1} subtext={`Active v${currentVersion}`} icon={GitCommitIcon} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#222222] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === tab
                ? 'border-white text-white'
                : 'border-transparent text-[#666666] hover:text-[#AAAAAA]'
            }`}
          >
            {tab}
            {tab === 'Reviews' && pendingReviewsList.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px]">
                {pendingReviewsList.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="p-6 rounded-xl border border-[#1F1F1F] bg-[#0F0F0F] space-y-4">
                  <h3 className="text-xs font-mono font-bold text-[#AAAAAA] uppercase tracking-widest">
                    Project Info & Repository State
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[#666666]">Status:</span>
                      <p className="text-white font-bold mt-0.5">{normalizedStatus}</p>
                    </div>
                    <div>
                      <span className="text-[#666666]">Active Release:</span>
                      <p className="text-emerald-400 font-bold mt-0.5">Version v{currentVersion}</p>
                    </div>
                    <div>
                      <span className="text-[#666666]">Snapshot Files:</span>
                      <p className="text-white font-bold mt-0.5">{project.currentFiles?.length || 1} files</p>
                    </div>
                  </div>
                </div>

                {/* Quick Action Hub */}
                <div className="p-6 rounded-xl border border-[#1F1F1F] bg-[#0F0F0F] space-y-3">
                  <h3 className="text-xs font-mono font-bold text-[#AAAAAA] uppercase tracking-widest">
                    Quick Operations
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => setIsCreateTaskOpen(true)}
                      className="p-3 rounded-lg bg-[#141414] border border-[#262626] hover:border-white/30 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-white font-bold text-xs">
                        <span>+ Create Task</span>
                        <ChevronRightIcon className="w-3.5 h-3.5 text-[#666666] group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-[11px] text-[#777777] mt-1">Assign sprint deliverable</p>
                    </button>

                    <button
                      onClick={() => setIsCreateVersionOpen(true)}
                      className="p-3 rounded-lg bg-[#141414] border border-[#262626] hover:border-white/30 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-white font-bold text-xs">
                        <span>+ Release Version</span>
                        <ChevronRightIcon className="w-3.5 h-3.5 text-[#666666] group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-[11px] text-[#777777] mt-1">Publish code snapshot</p>
                    </button>

                    <button
                      onClick={() => setIsAddMemberOpen(true)}
                      className="p-3 rounded-lg bg-[#141414] border border-[#262626] hover:border-white/30 text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between text-white font-bold text-xs">
                        <span>+ Add Developer</span>
                        <ChevronRightIcon className="w-3.5 h-3.5 text-[#666666] group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-[11px] text-[#777777] mt-1">Enroll team member</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Collaborators Overview */}
              <div className="p-6 rounded-xl border border-[#1F1F1F] bg-[#0F0F0F] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-[#AAAAAA] uppercase tracking-widest">
                    Team Members ({members.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('Team')}
                    className="text-[11px] font-mono text-emerald-400 hover:underline cursor-pointer"
                  >
                    View All
                  </button>
                </div>
                {members.length === 0 ? (
                  <p className="text-xs text-[#666666] font-mono">No developers added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {members.slice(0, 5).map((m, idx) => {
                      const name = m.name || m.fullName || m.email || 'Developer';
                      return (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-[#222222] border border-[#333333] flex items-center justify-center text-[11px] font-bold text-white">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{name}</p>
                            <p className="text-[10px] font-mono text-[#666666] truncate">{m.email}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'Tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Project Tasks ({projectTasks.length})
                </h3>
                <p className="text-xs text-[#777777] mt-0.5">
                  Coding tasks and tickets assigned to developers in this project.
                </p>
              </div>
              <button
                onClick={() => setIsCreateTaskOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Create Task</span>
              </button>
            </div>

            {loadingTasks ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="mt-3 text-xs font-mono text-[#666666]">Loading project tasks...</span>
              </div>
            ) : projectTasks.length === 0 ? (
              <EmptyState
                icon={TaskCheckIcon}
                title="NO TASKS IN PROJECT"
                description="Create task items to start tracking sprint development and assigning developers."
                actionLabel="+ Create Task"
                onAction={() => setIsCreateTaskOpen(true)}
                className="border-0 bg-transparent py-8"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectTasks.map((t) => {
                  const tid = t._id || t.id;
                  const assignee = t.assignedTo?.name || t.assignedTo?.email || 'Unassigned';
                  return (
                    <div
                      key={tid}
                      onClick={() => setSelectedTask(t)}
                      className="group p-4 rounded-xl border border-[#222222] bg-[#121212] hover:border-[#444444] transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                          {t.title}
                        </h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1F1F1F] text-[#AAAAAA] border border-[#333333]">
                            {t.status?.replace('_', ' ')}
                          </span>
                          <button
                            type="button"
                            title="Delete Task"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTaskToDelete(t);
                            }}
                            className="p-1 rounded text-[#555555] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {t.description && (
                        <p className="text-[11px] text-[#888888] line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between text-[10px] font-mono text-[#666666]">
                        <span className="truncate text-[#888888]">
                          Priority: <strong className="text-[#CCCCCC]">{t.priority || 'MEDIUM'}</strong>
                        </span>
                        <span className="truncate text-[#AAAAAA]">
                          {assignee}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* CONTRIBUTIONS TAB */}
        {activeTab === 'Contributions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Contributions ({contributions.length})
                </h3>
                <p className="text-xs text-[#777777] mt-0.5">
                  Code branches and pull requests submitted by developers.
                </p>
              </div>
            </div>

            {loadingContributions ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="mt-3 text-xs font-mono text-[#666666]">Loading contributions...</span>
              </div>
            ) : contributions.length === 0 ? (
              <EmptyState
                icon={GitCommitIcon}
                title="NO CONTRIBUTIONS YET"
                description="Developer code submissions for this project will appear here."
                className="border-0 bg-transparent py-8"
              />
            ) : (
              <div className="space-y-3">
                {contributions.map((c) => {
                  const cid = c._id || c.id;
                  const devName = c.developer?.name || c.developer?.email || 'Developer';
                  const isApproved = c.status === 'APPROVED';
                  const isInReview = c.status === 'IN_REVIEW';
                  return (
                    <div
                      key={cid}
                      className="p-4 rounded-xl border border-[#1F1F1F] bg-[#121212] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#333333] text-white">
                            v{c.version || 1}
                          </span>
                          <h4 className="text-xs font-bold text-white">
                            {c.task?.title || `Contribution Snapshot v${c.version}`}
                          </h4>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isInReview
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}>
                            {c.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#888888] font-mono">
                          Submitted by <strong className="text-white">{devName}</strong> · {c.files?.length || 1} files changed · {new Date(c.submittedAt || c.createdAt).toLocaleString()}
                        </p>
                        {c.reviewComment && (
                          <p className="text-xs text-[#AAAAAA] italic bg-[#0D0D0D] p-2 rounded border border-[#222222]">
                            "{c.reviewComment}"
                          </p>
                        )}
                      </div>

                      {isInReview && (
                        <button
                          onClick={() => setSelectedContributionForReview(c)}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer shrink-0"
                        >
                          Review & Evaluate
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'Reviews' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Pending Reviews ({pendingReviewsList.length})
                </h3>
                <p className="text-xs text-[#777777] mt-0.5">
                  Sign-off on developer pull requests to merge code into the active version.
                </p>
              </div>
            </div>

            {pendingReviewsList.length === 0 ? (
              <EmptyState
                icon={GitPullRequestIcon}
                title="ALL CAUGHT UP"
                description="No pull requests are currently awaiting manager review."
                className="border-0 bg-transparent py-8"
              />
            ) : (
              <div className="space-y-4">
                {pendingReviewsList.map((c) => {
                  const cid = c._id || c.id;
                  const devName = c.developer?.name || c.developer?.email || 'Developer';
                  return (
                    <div
                      key={cid}
                      className="p-5 rounded-xl border border-amber-500/30 bg-[#121212] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#1C1C1C] text-amber-400 border border-amber-500/40">
                              PENDING REVIEW
                            </span>
                            <h4 className="text-sm font-bold text-white">
                              {c.task?.title || `Contribution Version v${c.version}`}
                            </h4>
                          </div>
                          <p className="text-xs text-[#888888] mt-1 font-mono">
                            Developer: <strong className="text-white">{devName}</strong> · Target Release Version: <strong className="text-emerald-400">v{c.version}</strong>
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedContributionForReview(c)}
                          className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer"
                        >
                          Audit Code & Sign Off
                        </button>
                      </div>

                      {c.files && c.files.length > 0 && (
                        <div className="pt-2 border-t border-[#222222] flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-[#666666]">Files:</span>
                          {c.files.map((f, i) => (
                            <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181818] border border-[#2A2A2A] text-[#CCCCCC]">
                              {f.path}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === 'Team' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Project Team ({members.length})
                </h3>
                <p className="text-xs text-[#777777] mt-0.5">
                  Developers assigned to work on this repository.
                </p>
              </div>
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Add Developer</span>
              </button>
            </div>

            {members.length === 0 ? (
              <EmptyState
                icon={UsersIcon}
                title="NO TEAM MEMBERS ASSIGNED"
                description="Invite developers to work on this repository."
                actionLabel="+ Assign Developer"
                onAction={() => setIsAddMemberOpen(true)}
                className="border-0 bg-transparent py-8"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => {
                  const mid = m._id || m.id || m;
                  const name = m.name || m.fullName || m.email || 'Developer';
                  const role = m.role || 'DEVELOPER';
                  return (
                    <div
                      key={mid}
                      className="p-4 rounded-xl border border-[#222222] bg-[#121212] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#1C1C1C] border border-[#333333] flex items-center justify-center font-bold text-white text-sm shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{name}</h4>
                          <p className="text-[11px] text-[#888888] font-mono truncate">{m.email}</p>
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#1C1C1C] text-[#AAAAAA]">
                            {role}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        title="Remove member"
                        onClick={() => setMemberToRemove({ id: mid, name })}
                        className="p-1.5 rounded text-[#666666] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'Activity' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Project Activity Stream
                </h3>
                <p className="text-xs text-[#777777] mt-0.5">
                  Live audit trail of task updates, code releases, and reviews.
                </p>
              </div>
            </div>

            {loadingActivities ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="mt-3 text-xs font-mono text-[#666666]">Loading activity stream...</span>
              </div>
            ) : activities.length === 0 ? (
              <EmptyState
                icon={ActivityIcon}
                title="NO ACTIVITY RECORDED"
                description="Project activity logs will appear here as development progresses."
                className="border-0 bg-transparent py-8"
              />
            ) : (
              <div className="space-y-3">
                {activities.map((act, i) => {
                  const userName = act.user?.name || act.user?.email || 'User';
                  return (
                    <div
                      key={act._id || i}
                      className="p-3.5 rounded-xl border border-[#1C1C1C] bg-[#111111] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[#1C1C1C] border border-[#2A2A2A] flex items-center justify-center text-[10px] text-white font-bold">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-semibold">
                            <strong className="text-emerald-400">{userName}</strong> · {act.action?.replace(/_/g, ' ')}
                          </p>
                          {act.metadata?.title && (
                            <p className="text-[10px] text-[#777777] font-mono">{act.metadata.title}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#555555]">
                        {act.createdAt ? new Date(act.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VERSIONS & RELEASES TAB */}
        {activeTab === 'Versions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#1C1C1C]">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Project Versions & Releases
                </h3>
                <p className="text-xs text-[#777777] mt-0.5">
                  Manage releases, inspect file snapshots, and rollback/activate any version.
                </p>
              </div>
              <button
                onClick={() => setIsCreateVersionOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>+ Create Version</span>
              </button>
            </div>

            {loadingVersions ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="mt-3 text-xs font-mono text-[#666666]">Loading version history...</span>
              </div>
            ) : versions.length === 0 ? (
              <div className="p-6 rounded-xl border border-[#222222] bg-[#111111] text-center space-y-3">
                <GitCommitIcon className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Active Base Release: Version v{currentVersion}</h4>
                <p className="text-xs text-[#888888] max-w-md mx-auto">
                  This project is on base release v{currentVersion}. Click "+ Create Version" to take a code snapshot or approve developer contributions.
                </p>
                <button
                  onClick={() => setIsCreateVersionOpen(true)}
                  className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  <span>Release Version v{currentVersion + 1}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {versions.map((ver) => {
                  const verNum = ver.version;
                  const isActive = verNum === currentVersion;
                  const author = ver.developer?.name || ver.reviewedBy?.name || 'Manager';
                  const snapshotFiles = ver.projectSnapshot || ver.files || [];
                  return (
                    <div
                      key={ver._id || verNum}
                      className={`p-5 rounded-xl border transition-all ${
                        isActive
                          ? 'border-emerald-500/40 bg-emerald-950/10'
                          : 'border-[#222222] bg-[#121212]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded border ${
                              isActive
                                ? 'bg-emerald-500 text-black border-emerald-400'
                                : 'bg-[#1C1C1C] text-white border-[#333333]'
                            }`}>
                              v{verNum}
                            </span>
                            <h4 className="text-sm font-bold text-white">
                              {ver.reviewComment || ver.title || `Release v${verNum}`}
                            </h4>
                            {isActive && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold uppercase">
                                Active Version
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#888888] font-mono">
                            Released by <strong className="text-white">{author}</strong> · {snapshotFiles.length} files · {new Date(ver.reviewedAt || ver.submittedAt || ver.createdAt).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setSelectedVersionForPreview(selectedVersionForPreview?.version === verNum ? null : ver)}
                            className="px-3 py-1.5 rounded-lg border border-[#333333] text-xs font-mono text-[#CCCCCC] hover:text-white hover:border-white transition-colors cursor-pointer"
                          >
                            {selectedVersionForPreview?.version === verNum ? 'Hide Code' : 'View Code'}
                          </button>

                          {!isActive && (
                            <button
                              disabled={activatingVersion}
                              onClick={() => handleActivateVersion(verNum)}
                              className="px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Activate / Rollback
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Code Preview Drawer if selected */}
                      {selectedVersionForPreview?.version === verNum && (
                        <div className="mt-4 pt-4 border-t border-[#222222] space-y-3">
                          <h5 className="text-[11px] font-mono text-[#888888] uppercase tracking-wider">
                            Code Snapshot Files (v{verNum})
                          </h5>
                          {snapshotFiles.map((file, fIdx) => (
                            <div key={fIdx} className="rounded-lg border border-[#222222] overflow-hidden bg-[#0A0A0A]">
                              <div className="px-3 py-1.5 bg-[#141414] border-b border-[#1F1F1F] flex items-center justify-between text-xs font-mono">
                                <span className="text-white font-bold">{file.path}</span>
                                <span className="text-[#666666]">{file.language || 'javascript'}</span>
                              </div>
                              <pre className="p-3 text-xs font-mono text-[#C0C0C0] overflow-x-auto whitespace-pre max-h-48">
                                {file.content}
                              </pre>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code Evaluation / Review Modal for Manager */}
      {selectedContributionForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-3xl bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl relative animate-scale-up max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#222222] shrink-0">
              <div>
                <h3 className="text-base font-bold text-white">Review Developer Contribution</h3>
                <p className="text-xs text-[#888888]">
                  Target Version Release: <strong className="text-emerald-400 font-mono">v{selectedContributionForReview.version}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedContributionForReview(null)}
                className="p-1 rounded-lg text-[#888888] hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="p-3 rounded-lg bg-[#141414] border border-[#222222] text-xs font-mono space-y-1">
                <p className="text-white">Task: <strong>{selectedContributionForReview.task?.title || 'Standalone patch'}</strong></p>
                <p className="text-[#888888]">Developer: {selectedContributionForReview.developer?.name || selectedContributionForReview.developer?.email}</p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono font-bold text-[#AAAAAA] uppercase">Submitted Code Files</h4>
                {selectedContributionForReview.files?.map((f, idx) => (
                  <div key={idx} className="rounded-lg border border-[#222222] overflow-hidden bg-[#0A0A0A]">
                    <div className="px-3 py-1.5 bg-[#141414] border-b border-[#1F1F1F] text-xs font-mono text-white font-bold">
                      {f.path}
                    </div>
                    <pre className="p-3 text-xs font-mono text-[#D4D4D4] overflow-x-auto whitespace-pre max-h-48">
                      {f.content}
                    </pre>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase mb-1.5">
                  Manager Review Notes / Feedback
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Enter feedback or change requests (required for Request Changes)..."
                  className="w-full p-3 rounded-lg bg-[#141414] border border-[#262626] text-white text-xs font-mono focus:border-white focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#222222] flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                disabled={isProcessingReview || !reviewComment.trim()}
                onClick={() => handleRequestChanges(selectedContributionForReview._id || selectedContributionForReview.id)}
                className="px-4 py-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold hover:bg-amber-500/30 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Request Changes
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedContributionForReview(null)}
                  className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-bold text-[#AAAAAA] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessingReview}
                  onClick={() => handleApproveContribution(selectedContributionForReview._id || selectedContributionForReview.id)}
                  className="px-5 py-2 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4 stroke-[3]" />
                  <span>Approve & Release v{selectedContributionForReview.version}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details / Management Modal */}
      <TaskDetailModal
        isOpen={Boolean(selectedTask)}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
        onAssignTask={handleAssignTask}
        availableDevelopers={availableDevelopers}
      />

      {/* Task Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Project Task"
        message="Are you sure you want to permanently delete this task from the project? This action cannot be undone."
        itemName={taskToDelete?.title}
        confirmLabel="Delete Task"
        loading={isDeletingTask}
        onConfirm={() => handleDeleteTask(taskToDelete?._id || taskToDelete?.id)}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* Member Remove Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(memberToRemove)}
        title="Remove Team Member"
        message="Are you sure you want to remove this developer from the project team?"
        itemName={memberToRemove?.name}
        confirmLabel="Remove Developer"
        loading={isRemovingMember}
        onConfirm={() => handleRemoveMember(memberToRemove?.id)}
        onCancel={() => setMemberToRemove(null)}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={handleCreateTask}
        availableProjects={[project]}
        availableDevelopers={availableDevelopers}
      />

      {/* Add Developer / Team Member Modal */}
      <AddDeveloperModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onInviteDeveloper={handleAddMember}
        projects={[project]}
      />

      {/* Create Version Release Modal */}
      <CreateVersionModal
        isOpen={isCreateVersionOpen}
        onClose={() => setIsCreateVersionOpen(false)}
        onCreateVersion={handleCreateVersion}
        project={project}
      />
    </div>
  );
}
