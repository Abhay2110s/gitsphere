import React, { useState, useEffect, useMemo, useCallback } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import CreateTaskModal from '../../components/manager/CreateTaskModal';
import TaskDetailModal from '../../components/manager/TaskDetailModal';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { projectsApi } from '../../api/projects.api';
import { tasksApi } from '../../api/tasks.api';
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
} from '../../components/common/Icons';

export default function ProjectDetails({ project, onBackToProjects }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [currentStatus, setCurrentStatus] = useState(project?.status || 'PLANNING');
  const [isUpdating, setIsUpdating] = useState(false);

  // Project Tasks state
  const [projectTasks, setProjectTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  const projectId = project?.id || project?._id;

  useEffect(() => {
    if (project?.status) {
      setCurrentStatus(project.status);
    }
  }, [project?.status]);

  // Fetch tasks for this project
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

  useEffect(() => {
    if (projectId && activeTab === 'Tasks') {
      fetchProjectTasks();
    }
  }, [projectId, activeTab, fetchProjectTasks]);

  // Listen to global task events
  useEffect(() => {
    const handleSync = () => {
      fetchProjectTasks();
    };
    window.addEventListener('gitsphere:task-created', handleSync);
    window.addEventListener('gitsphere:task-updated', handleSync);
    window.addEventListener('gitsphere:task-deleted', handleSync);
    return () => {
      window.removeEventListener('gitsphere:task-created', handleSync);
      window.removeEventListener('gitsphere:task-updated', handleSync);
      window.removeEventListener('gitsphere:task-deleted', handleSync);
    };
  }, [fetchProjectTasks]);

  // If no project is currently selected
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

  const tabs = ['Overview', 'Tasks', 'Contributions', 'Reviews', 'Team', 'Activity', 'Versions'];
  const normalizedStatus = (currentStatus || 'PLANNING').toUpperCase();

  // Extract members as available developers
  const availableDevelopers = useMemo(() => {
    if (!project?.members || !Array.isArray(project.members)) return [];
    return project.members.map((m) => {
      const id = String(m._id || m.id || m);
      return {
        id,
        _id: id,
        name: m.name || m.fullName || m.email || id,
        email: m.email,
      };
    });
  }, [project?.members]);

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
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#333333] text-[#CCCCCC]">
              Version {project.currentVersion || 1}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-[#888888] max-w-2xl">
            {project.description || 'No description provided.'}
          </p>
        </div>

        {/* Manager Action Controls: Complete / Archive / Reactivate */}
        <div className="flex items-center gap-2 flex-wrap">
          {normalizedStatus !== 'COMPLETED' && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('COMPLETED')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />
              <span>Mark as Completed</span>
            </button>
          )}

          {normalizedStatus !== 'ARCHIVED' && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('ARCHIVED')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#181818] border border-[#333333] text-[#CCCCCC] text-xs font-mono font-medium hover:text-white hover:bg-[#222222] transition-all cursor-pointer disabled:opacity-50"
            >
              <span>Archive Project</span>
            </button>
          )}

          {(normalizedStatus === 'COMPLETED' || normalizedStatus === 'ARCHIVED') && (
            <button
              disabled={isUpdating}
              onClick={() => handleStatusChange('ACTIVE')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <span>Reactivate Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Notice Banner if Completed or Archived */}
      {normalizedStatus === 'COMPLETED' && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs text-emerald-300 font-mono">
              <strong>Project Completed:</strong> This project is officially marked as complete. All deliverables and tasks have reached final sign-off.
            </p>
          </div>
        </div>
      )}

      {normalizedStatus === 'ARCHIVED' && (
        <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-500" />
            <p className="text-xs text-neutral-400 font-mono">
              <strong>Project Archived:</strong> This project is currently archived and stored for historical records. You can reactivate it at any time.
            </p>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Members" value={project.members?.length || 0} subtext="Assigned developers" icon={UsersIcon} />
        <StatCard label="Tasks" value={projectTasks.length || project.tasks?.length || 0} subtext="Tracked items" icon={TaskCheckIcon} />
        <StatCard label="Completed" value={projectTasks.filter(t => t.status === 'COMPLETED').length || project.completedTasks?.length || 0} subtext="Finished tasks" icon={CheckIcon} />
        <StatCard label="Pending Reviews" value={project.pendingReviews?.length || 0} subtext="Awaiting review" icon={GitPullRequestIcon} />
      </div>

      {/* Project Navigation Tabs */}
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
          </button>
        ))}
      </div>

      {/* Tab Panels with Zero-States */}
      <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-8">
        {activeTab === 'Overview' && (
          <EmptyState
            icon={FolderIcon}
            title="PROJECT OVERVIEW"
            description="Manage sprint tasks, monitor code contributions, and review pull requests for this project."
            className="border-0 bg-transparent py-8"
          />
        )}

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

        {activeTab === 'Contributions' && (
          <EmptyState
            icon={GitCommitIcon}
            title="NO CONTRIBUTIONS SUBMITTED"
            description="Developer code submissions for this project will appear here."
            className="border-0 bg-transparent py-8"
          />
        )}

        {activeTab === 'Reviews' && (
          <EmptyState
            icon={GitPullRequestIcon}
            title="NO REVIEWS REQUIRED"
            description="Pending pull requests and verified sign-offs will appear here."
            className="border-0 bg-transparent py-8"
          />
        )}

        {activeTab === 'Team' && (
          <EmptyState
            icon={UsersIcon}
            title="NO TEAM MEMBERS ASSIGNED"
            description="Invite developers to work on this repository."
            actionLabel="+ Assign Developer"
            onAction={() => {}}
            className="border-0 bg-transparent py-8"
          />
        )}

        {activeTab === 'Activity' && (
          <EmptyState
            icon={ActivityIcon}
            title="NO ACTIVITY YET"
            description="Project activity will appear here as work begins."
            className="border-0 bg-transparent py-8"
          />
        )}

        {activeTab === 'Versions' && (
          <EmptyState
            icon={GitCommitIcon}
            title="NO VERSION RELEASES"
            description="Project code revisions and version snapshots will be tracked here."
            className="border-0 bg-transparent py-8"
          />
        )}
      </div>

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

      {/* Quick Delete Confirmation Modal */}
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

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={handleCreateTask}
        availableProjects={[project]}
        availableDevelopers={availableDevelopers}
      />
    </div>
  );
}
