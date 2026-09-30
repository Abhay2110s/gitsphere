import React, { useState } from 'react';
import StatCard from '../../components/workspace/StatCard';
import EmptyState from '../../components/workspace/EmptyState';
import { PageSkeleton } from '../../components/workspace/SkeletonLoaders';
import {
  TaskCheckIcon,
  SearchIcon,
  PlusIcon,
} from '../../components/common/Icons';

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
};

export default function Tasks({ tasks = [], stats, loading, userRole }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedTask, setSelectedTask] = useState(null);

  if (loading) return <PageSkeleton />;

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statuses = ['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'];

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Task Details Panel
  if (selectedTask) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedTask(null)}
          className="text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
        >
          ← Back to Tasks
        </button>

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
              <span className="text-xs font-mono text-[#AAAAAA]">{formatDate(selectedTask.dueDate)}</span>
            </div>
          </div>
        </div>
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
          {userRole === 'MANAGER' && (
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer shadow-sm">
              <PlusIcon className="w-3.5 h-3.5" />
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.tasks} icon={TaskCheckIcon} subtext="No activity yet" />
        <StatCard label="Todo" value={stats.todoTasks} subtext="No activity yet" />
        <StatCard label="In Progress" value={stats.inProgressTasks} subtext="No activity yet" />
        <StatCard label="Completed" value={stats.completedTasks} subtext="No activity yet" />
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
          actionLabel={userRole === 'MANAGER' ? 'Create Task' : undefined}
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
            <div className="col-span-2">Due Date</div>
          </div>
          {/* Rows */}
          <div className="divide-y divide-[#1A1A1A]">
            {filtered.map((task, i) => (
              <button
                key={task._id || i}
                onClick={() => setSelectedTask(task)}
                className="w-full grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-[#0F0F0F] transition-colors cursor-pointer text-left"
              >
                <div className="col-span-4">
                  <div className="text-xs font-bold text-white">{task.title}</div>
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
                <div className="col-span-2 flex items-center text-xs font-mono text-[#666666]">
                  {formatDate(task.dueDate)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
