import React, { useState } from 'react';
import StatCard from '../../components/workspace/StatCard';
import EmptyState from '../../components/workspace/EmptyState';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { PageSkeleton } from '../../components/workspace/SkeletonLoaders';
import {
  TaskCheckIcon,
  SearchIcon,
  PlusIcon,
  TrashIcon,
} from '../../components/common/Icons';
import { tasksApi } from '../../api/tasks.api';

const STATUS_COLORS = {
  TODO: 'bg-[#222222] text-[#AAAAAA]',
  IN_PROGRESS: 'bg-[#1A1A1A] text-white border border-[#444444]',
  COMPLETED: 'bg-white text-black',
  BLOCKED: 'bg-red-950/40 text-red-400 border border-red-900/40',
};

const PRIORITY_COLORS = {
  LOW: 'text-[#666666]',
  MEDIUM: 'text-[#AAAAAA]',
  HIGH: 'text-white',
  CRITICAL: 'text-red-400',
  URGENT: 'text-red-400',
};

export default function Tasks({ tasks = [], stats, loading, userRole }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (loading) return <PageSkeleton />;

  const filtered = tasks.filter((t) => {
    const matchSearch =
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statuses = ['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'];

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDeleteTask = async (taskId) => {
    if (!taskId) return;
    try {
      setIsDeleting(true);
      await tasksApi.deleteTask(taskId);
      window.dispatchEvent(new CustomEvent('gitsphere:task-deleted', { detail: { taskId } }));
      if (selectedTask && (selectedTask._id === taskId || selectedTask.id === taskId)) {
        setSelectedTask(null);
      }
      setTaskToDelete(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Task Details Panel
  if (selectedTask) {
    const taskId = selectedTask._id || selectedTask.id;
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedTask(null)}
            className="text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
          >
            ← Back to Tasks
          </button>

          {userRole === 'MANAGER' && (
            <button
              onClick={() => setTaskToDelete(selectedTask)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              <span>Delete Task</span>
            </button>
          )}
        </div>

        <div className="p-6 rounded-xl border border-[#222222] bg-[#0A0A0A] space-y-6">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">{selectedTask.title}</h1>
            {selectedTask.description && (
              <p className="text-sm text-[#888888] mt-2 leading-relaxed">{selectedTask.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#1A1A1A] pt-6">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-1">Status</div>
              <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[selectedTask.status] || 'bg-[#222222] text-[#AAAAAA]'}`}>
                {selectedTask.status?.replace('_', ' ') || 'Unknown'}
              </span>
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-1">Priority</div>
              <span className={`text-xs font-bold uppercase ${PRIORITY_COLORS[selectedTask.priority] || 'text-[#666666]'}`}>
                {selectedTask.priority || '—'}
              </span>
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-1">Assigned To</div>
              <span className="text-xs font-semibold text-white">{selectedTask.assignedTo?.name || '—'}</span>
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-1">Due Date</div>
              <span className="text-xs font-mono text-[#AAAAAA]">{formatDate(selectedTask.dueDate || selectedTask.deadline)}</span>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        <DeleteConfirmModal
          isOpen={Boolean(taskToDelete)}
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          itemName={taskToDelete?.title}
          confirmLabel="Delete Task"
          loading={isDeleting}
          onConfirm={() => handleDeleteTask(taskToDelete?._id || taskToDelete?.id)}
          onCancel={() => setTaskToDelete(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-black tracking-tight text-white">Tasks</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555555]" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-48 rounded-lg bg-[#0A0A0A] border border-[#222222] text-xs text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats?.tasks ?? tasks.length} icon={TaskCheckIcon} subtext="No activity yet" />
        <StatCard label="Todo" value={stats?.todoTasks ?? tasks.filter(t => t.status === 'TODO').length} subtext="No activity yet" />
        <StatCard label="In Progress" value={stats?.inProgressTasks ?? tasks.filter(t => t.status === 'IN_PROGRESS').length} subtext="No activity yet" />
        <StatCard label="Completed" value={stats?.completedTasks ?? tasks.filter(t => t.status === 'COMPLETED').length} subtext="No activity yet" />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-[#1A1A1A] pb-0">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-2 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
              filterStatus === s
                ? 'text-white border-white'
                : 'text-[#666666] border-transparent hover:text-[#AAAAAA]'
            }`}
          >
            {s === 'ALL' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={TaskCheckIcon}
          title="No tasks yet"
          description="Create or assign a task to start development."
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-xs text-[#666666] font-mono">
          No tasks match your filters.
        </div>
      ) : (
        <div className="border border-[#222222] rounded-xl overflow-hidden bg-[#0A0A0A]">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1A1A1A] bg-[#070707] text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555]">
            <div className="col-span-4">Task</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-2">Assignee</div>
            <div className="col-span-2">Status</div>
            <div className={userRole === 'MANAGER' ? 'col-span-1' : 'col-span-2'}>Due Date</div>
            {userRole === 'MANAGER' && <div className="col-span-1 text-right">Action</div>}
          </div>
          {/* Rows */}
          <div className="divide-y divide-[#1A1A1A]">
            {filtered.map((task, i) => {
              const taskId = task._id || task.id || i;
              return (
                <div
                  key={taskId}
                  onClick={() => setSelectedTask(task)}
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-[#0F0F0F] transition-colors cursor-pointer text-left items-center group"
                >
                  <div className="col-span-4">
                    <div className="text-xs font-bold text-white group-hover:text-white transition-colors">{task.title}</div>
                    {task.description && (
                      <div className="text-[10px] text-[#666666] truncate mt-0.5">{task.description}</div>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className={`text-xs font-bold uppercase ${PRIORITY_COLORS[task.priority] || 'text-[#666666]'}`}>
                      {task.priority || '—'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                      {task.assignedTo?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <span className="text-xs text-[#888888] truncate">{task.assignedTo?.name || 'Unassigned'}</span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[task.status] || 'bg-[#222222] text-[#AAAAAA]'}`}>
                      {task.status?.replace('_', ' ') || 'Unknown'}
                    </span>
                  </div>
                  <div className={`${userRole === 'MANAGER' ? 'col-span-1' : 'col-span-2'} flex items-center text-xs font-mono text-[#666666]`}>
                    {formatDate(task.dueDate || task.deadline)}
                  </div>
                  {userRole === 'MANAGER' && (
                    <div className="col-span-1 flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        title="Delete Task"
                        onClick={() => setTaskToDelete(task)}
                        className="p-1 rounded text-[#555555] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
        itemName={taskToDelete?.title}
        confirmLabel="Delete Task"
        loading={isDeleting}
        onConfirm={() => handleDeleteTask(taskToDelete?._id || taskToDelete?.id)}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
}
