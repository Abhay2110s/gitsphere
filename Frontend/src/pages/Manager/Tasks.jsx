import React, { useState, useMemo } from 'react';
import StatCard from '../../components/manager/StatCard';
import CreateTaskModal from '../../components/manager/CreateTaskModal';
import TaskDetailModal from '../../components/manager/TaskDetailModal';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import {
  TaskCheckIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
  FolderIcon,
  FilterIcon,
} from '../../components/common/Icons';
import { useTasks } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';

export default function Tasks() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);

  const { tasks, loading, error, createTask, updateTask, assignTask, deleteTask } = useTasks();
  const { projects } = useProjects();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const normalizeStatus = (status) => (status ? String(status).toUpperCase() : '');

  // Extract developers from projects for assignment controls
  const availableDevelopers = useMemo(() => {
    const map = new Map();
    (projects || []).forEach((p) => {
      if (p.members && Array.isArray(p.members)) {
        p.members.forEach((m) => {
          const id = String(m._id || m.id || m);
          if (!map.has(id)) {
            const name = m.name || m.fullName || m.email || id;
            map.set(id, { id, _id: id, name, email: m.email });
          }
        });
      }
    });
    return Array.from(map.values());
  }, [projects]);

  // Filter tasks by search query and selected project
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        !searchQuery.trim() ||
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.project?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignedTo?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const taskProjId = String(t.project?._id || t.project?.id || t.project || '');
      const matchProject = selectedProjectId === 'ALL' || taskProjId === selectedProjectId;

      return matchSearch && matchProject;
    });
  }, [tasks, searchQuery, selectedProjectId]);

  const todoTasks = filteredTasks.filter((t) => normalizeStatus(t.status) === 'TODO');
  const inProgressTasks = filteredTasks.filter((t) => normalizeStatus(t.status) === 'IN_PROGRESS');
  const inReviewTasks = filteredTasks.filter(
    (t) =>
      normalizeStatus(t.status) === 'IN_REVIEW' ||
      normalizeStatus(t.status) === 'CHANGES_REQUESTED'
  );
  const completedTasks = filteredTasks.filter(
    (t) => normalizeStatus(t.status) === 'COMPLETED'
  );

  const kanbanColumns = [
    { title: 'TO DO', count: todoTasks.length, emptyText: 'No tasks in backlog', items: todoTasks },
    { title: 'IN PROGRESS', count: inProgressTasks.length, emptyText: 'No tasks in progress', items: inProgressTasks },
    { title: 'IN REVIEW', count: inReviewTasks.length, emptyText: 'No tasks pending review', items: inReviewTasks },
    { title: 'COMPLETED', count: completedTasks.length, emptyText: 'No completed tasks', items: completedTasks },
  ];

  const handleCreateTask = async (payload) => {
    const { projectId, ...taskData } = payload;
    await createTask(projectId, taskData);
    showToast('Task created successfully!');
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) return;
    try {
      setIsDeleting(true);
      await deleteTask(taskId);
      if (selectedTask && (selectedTask._id === taskId || selectedTask.id === taskId)) {
        setSelectedTask(null);
      }
      setTaskToDelete(null);
      showToast('Task deleted successfully');
    } catch (err) {
      console.error('Failed to delete task:', err);
      showToast(err?.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateTask = async (taskId, updateData) => {
    const updated = await updateTask(taskId, updateData);
    if (selectedTask && (selectedTask._id === taskId || selectedTask.id === taskId)) {
      setSelectedTask((prev) => ({ ...prev, ...updated }));
    }
    return updated;
  };

  const handleAssignTask = async (taskId, assignedTo) => {
    const updated = await assignTask(taskId, assignedTo);
    if (selectedTask && (selectedTask._id === taskId || selectedTask.id === taskId)) {
      setSelectedTask((prev) => ({ ...prev, ...updated }));
    }
    return updated;
  };

  const getPriorityBadge = (priority) => {
    const p = String(priority || 'MEDIUM').toUpperCase();
    switch (p) {
      case 'URGENT':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            URGENT
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            HIGH
          </span>
        );
      case 'LOW':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            LOW
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            MEDIUM
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#111111] border border-white/20 text-xs font-mono text-white shadow-2xl flex items-center gap-3 animate-slide-up">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-[#888888] hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            TASKS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Manage sprint tasks, assign work to developers, or delete completed tickets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-all cursor-pointer shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard label="Total Tasks" value={tasks.length} subtext="Across all projects" icon={TaskCheckIcon} />
        <StatCard label="To Do" value={todoTasks.length} subtext="Backlog items" icon={TaskCheckIcon} />
        <StatCard label="In Progress" value={inProgressTasks.length} subtext="Active development" icon={TaskCheckIcon} />
        <StatCard label="In Review" value={inReviewTasks.length} subtext="Pending signoff" icon={TaskCheckIcon} />
        <StatCard label="Completed" value={completedTasks.length} subtext="Delivered" icon={TaskCheckIcon} />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border border-[#222222] bg-[#0A0A0A]">
        <div className="relative w-full sm:w-72">
          <SearchIcon className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, assignees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212] border border-[#222222] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#888888] font-mono">
            <FilterIcon className="w-3.5 h-3.5" />
            <span>Project:</span>
          </div>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-[#121212] border border-[#222222] text-xs font-mono text-white rounded-xl px-3 py-2 outline-none focus:border-white transition-colors cursor-pointer w-full sm:w-auto"
          >
            <option value="ALL">All Projects ({projects.length})</option>
            {projects.map((p) => {
              const pid = String(p._id || p.id);
              return (
                <option key={pid} value={pid}>
                  {p.name}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kanbanColumns.map((col) => (
          <div
            key={col.title}
            className="flex flex-col rounded-2xl border border-[#222222] bg-[#0A0A0A] p-4 min-h-[380px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1C1C1C] mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#AAAAAA]">
                {col.title}
              </span>
              <span className="px-2 py-0.5 rounded bg-[#181818] border border-[#2A2A2A] text-[10px] font-mono text-white">
                {col.count}
              </span>
            </div>

            {/* Column Content / Empty State */}
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="mt-2 text-xs font-mono text-[#666666]">Loading...</span>
              </div>
            ) : col.items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#222222] rounded-xl bg-[#070707]">
                <p className="text-xs font-mono text-[#666666]">{col.emptyText}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {col.items.map((item) => {
                  const taskId = item._id || item.id;
                  const projectName = item.project?.name || 'Project';
                  const assigneeName =
                    item.assignedTo?.name || item.assignedTo?.email || 'Unassigned';

                  return (
                    <div
                      key={taskId}
                      onClick={() => setSelectedTask(item)}
                      className="group relative p-3.5 rounded-xl border border-[#222222] bg-[#121212] hover:border-[#444444] transition-all cursor-pointer space-y-2.5 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2 group-hover:text-white transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {getPriorityBadge(item.priority)}
                          {/* Quick Delete Button */}
                          <button
                            type="button"
                            title="Delete Task"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTaskToDelete(item);
                            }}
                            className="p-1 rounded text-[#555555] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-[#888888] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between text-[10px] font-mono text-[#666666]">
                        <span className="truncate max-w-[90px] text-[#888888] flex items-center gap-1">
                          <FolderIcon className="w-3 h-3 text-[#555555]" />
                          {projectName}
                        </span>
                        <span
                          className={`truncate max-w-[100px] px-1.5 py-0.5 rounded ${
                            item.assignedTo
                              ? 'bg-[#181818] text-[#CCCCCC]'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {assigneeName}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
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
        title="Delete Assigned Task"
        message="Are you sure you want to permanently delete this task? All assigned workspaces, code reviews, and messages for this task will be removed."
        itemName={taskToDelete?.title}
        confirmLabel="Delete Task"
        loading={isDeleting}
        onConfirm={() => handleDeleteTask(taskToDelete?._id || taskToDelete?.id)}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={handleCreateTask}
        availableProjects={projects}
        availableDevelopers={availableDevelopers}
      />
    </div>
  );
}
