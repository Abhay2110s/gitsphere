import React, { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';
import PageHeader from '../../components/developer/PageHeader';
import TaskCard from '../../components/developer/TaskCard';
import EmptyState from '../../components/developer/EmptyState';
import ErrorState from '../../components/developer/ErrorState';
import { CardSkeleton } from '../../components/developer/LoadingSkeleton';
import { TaskCheckIcon, SearchIcon, FilterIcon } from '../../components/common/Icons';

export default function Tasks({ onSelectTask, onOpenWorkspace }) {
  const { tasks, loading, error, refetch, updateTaskStatus } = useTasks();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Tasks"
          description="Development tickets and feature tasks assigned to you."
        />
        <CardSkeleton count={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="My Tasks"
          description="Development tickets and feature tasks assigned to you."
        />
        <ErrorState
          title="Failed to load tasks"
          message={error.message || 'We could not fetch your assigned tasks from the server.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
    const matchesSearch =
      (task.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.project?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filterOptions = [
    { id: 'ALL', label: 'All Tasks', count: tasks.length },
    { id: 'TODO', label: 'To Do', count: tasks.filter((t) => t.status === 'TODO').length },
    { id: 'IN_PROGRESS', label: 'In Progress', count: tasks.filter((t) => t.status === 'IN_PROGRESS').length },
    { id: 'COMPLETED', label: 'Completed', count: tasks.filter((t) => t.status === 'COMPLETED').length },
    { id: 'BLOCKED', label: 'Blocked', count: tasks.filter((t) => t.status === 'BLOCKED').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="My Tasks"
        description="Assigned software tickets, bug fixes, and development objectives across all projects."
      >
        {tasks.length > 0 && (
          <div className="relative w-64">
            <SearchIcon className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111111] border border-[#222222] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#666666] outline-none focus:border-white transition-colors"
            />
          </div>
        )}
      </PageHeader>

      {/* Filter Tabs */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#1C1C1C]">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setStatusFilter(opt.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === opt.id
                  ? 'bg-white text-black font-bold'
                  : 'text-[#888888] hover:text-white hover:bg-[#141414]'
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === opt.id ? 'bg-black text-white' : 'bg-[#1C1C1C] text-[#888888]'
                }`}
              >
                {opt.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Task Grid or Empty State */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={TaskCheckIcon}
          title="NO TASKS ASSIGNED"
          description="You currently have no assigned development tasks. Your project manager will assign sprint tasks here as work begins."
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={FilterIcon}
          title="NO TASKS IN FILTER"
          description={`No tasks found matching status "${statusFilter}" or search "${searchTerm}".`}
          actionLabel="Clear Filters"
          onAction={() => {
            setStatusFilter('ALL');
            setSearchTerm('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task._id || task.id}
              task={task}
              onStatusChange={updateTaskStatus}
              onSelect={onSelectTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
