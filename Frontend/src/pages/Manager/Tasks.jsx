import React, { useState } from 'react';
import StatCard from '../../components/manager/StatCard';
import CreateTaskModal from '../../components/manager/CreateTaskModal';
import { TaskCheckIcon, PlusIcon } from '../../components/common/Icons';

export default function Tasks() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks] = useState([]); // dynamic empty array

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const inReviewTasks = tasks.filter(t => t.status === 'in_review');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const kanbanColumns = [
    { title: 'TO DO', count: todoTasks.length, emptyText: 'No tasks yet', items: todoTasks },
    { title: 'IN PROGRESS', count: inProgressTasks.length, emptyText: 'No tasks yet', items: inProgressTasks },
    { title: 'IN REVIEW', count: inReviewTasks.length, emptyText: 'No tasks yet', items: inReviewTasks },
    { title: 'COMPLETED', count: completedTasks.length, emptyText: 'No completed tasks', items: completedTasks },
  ];

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
            <span>+ Create Task</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard label="Total Tasks" value={tasks.length} subtext="No activity yet" icon={TaskCheckIcon} />
        <StatCard label="To Do" value={todoTasks.length} subtext="No activity yet" icon={TaskCheckIcon} />
        <StatCard label="In Progress" value={inProgressTasks.length} subtext="No activity yet" icon={TaskCheckIcon} />
        <StatCard label="In Review" value={inReviewTasks.length} subtext="No activity yet" icon={TaskCheckIcon} />
        <StatCard label="Completed" value={completedTasks.length} subtext="No activity yet" icon={TaskCheckIcon} />
      </div>

      {/* Kanban Board Columns (Always visible) */}
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
            {col.items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#222222] rounded-xl bg-[#070707]">
                <p className="text-xs font-mono text-[#666666]">
                  {col.emptyText}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {col.items.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border border-[#222222] bg-[#141414] text-xs">
                    {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateTask={(data) => {
          console.log('Task created:', data);
        }}
        availableProjects={[]}
        availableDevelopers={[]}
      />
    </div>
  );
}
