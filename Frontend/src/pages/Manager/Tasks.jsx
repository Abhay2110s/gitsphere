import React, { useState } from 'react';
import StatCard from '../../components/manager/StatCard';
import CreateTaskModal from '../../components/manager/CreateTaskModal';
import { TaskCheckIcon, PlusIcon } from '../../components/common/Icons';
import { useTasks } from '../../hooks/useTasks';
import { useProjects } from '../../hooks/useProjects';

export default function Tasks() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tasks, loading, error, createTask } = useTasks();
  const { projects } = useProjects();

  const normalizeStatus = (status) => (status ? String(status).toUpperCase() : '');

  const todoTasks = tasks.filter((t) => normalizeStatus(t.status) === 'TODO');
  const inProgressTasks = tasks.filter((t) => normalizeStatus(t.status) === 'IN_PROGRESS');
  const inReviewTasks = tasks.filter(
    (t) => normalizeStatus(t.status) === 'IN_REVIEW' || normalizeStatus(t.status) === 'CHANGES_REQUESTED'
  );
  const completedTasks = tasks.filter((t) => normalizeStatus(t.status) === 'COMPLETED');

  const kanbanColumns = [
    { title: 'TO DO', count: todoTasks.length, emptyText: 'No tasks in backlog', items: todoTasks },
    { title: 'IN PROGRESS', count: inProgressTasks.length, emptyText: 'No tasks in progress', items: inProgressTasks },
    { title: 'IN REVIEW', count: inReviewTasks.length, emptyText: 'No tasks pending review', items: inReviewTasks },
    { title: 'COMPLETED', count: completedTasks.length, emptyText: 'No completed tasks', items: completedTasks },
  ];

  const handleCreateTask = async (payload) => {
    const { projectId, ...taskData } = payload;
    await createTask(projectId, taskData);
  };

  const getPriorityBadge = (priority) => {
    const p = String(priority || 'MEDIUM').toUpperCase();
    switch (p) {
      case 'URGENT':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">URGENT</span>;
      case 'HIGH':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">HIGH</span>;
      case 'LOW':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">LOW</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">MEDIUM</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            TASKS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Manage sprint tasks, backlog tickets, and work items across projects.
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
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
                <p className="text-xs font-mono text-[#666666]">
                  {col.emptyText}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {col.items.map((item) => {
                  const taskId = item._id || item.id;
                  const projectName = item.project?.name || 'Project';
                  const assigneeName = item.assignedTo?.name || item.assignedTo?.email || 'Unassigned';

                  return (
                    <div
                      key={taskId}
                      className="p-3.5 rounded-xl border border-[#222222] bg-[#121212] hover:border-[#333333] transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        {getPriorityBadge(item.priority)}
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-[#888888] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between text-[10px] font-mono text-[#666666]">
                        <span className="truncate max-w-[100px] text-[#888888]">{projectName}</span>
                        <span className="truncate max-w-[100px] text-[#AAAAAA]">{assigneeName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateTask={handleCreateTask}
        availableProjects={projects}
      />
    </div>
  );
}
