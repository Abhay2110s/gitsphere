import React, { useState } from 'react';
import TaskStatusBadge from './TaskStatusBadge';

export default function TaskCard({ task, onStatusChange, onSelect }) {
  const [updating, setUpdating] = useState(false);

  if (!task) return null;

  const handleStatusSelect = async (e) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (newStatus === task.status || !onStatusChange) return;

    try {
      setUpdating(true);
      await onStatusChange(task._id || task.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const deadlineFormatted = task.deadline
    ? new Date(task.deadline).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No deadline';

  return (
    <div
      onClick={() => onSelect && onSelect(task)}
      className="p-5 rounded-2xl border border-[#222222] bg-[#0A0A0A] hover:border-[#383838] transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-white">
              {task.title}
            </h4>
            {task.project?.name && (
              <span className="text-[10px] font-mono text-[#666666] uppercase block mt-0.5 truncate">
                {task.project.name}
              </span>
            )}
          </div>
          <TaskStatusBadge status={task.status} />
        </div>

        {task.description && (
          <p className="text-xs text-[#888888] line-clamp-2 mb-4 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-[#1A1A1A] flex items-center justify-between gap-2 text-xs">
        <div className="text-[11px] font-mono text-[#666666]">
          <span>Due: </span>
          <span className="text-[#888888]">{deadlineFormatted}</span>
        </div>

        {onStatusChange && (
          <div onClick={(e) => e.stopPropagation()}>
            <select
              value={task.status}
              disabled={updating}
              onChange={handleStatusSelect}
              className="bg-[#141414] border border-[#2A2A2A] text-white text-[11px] font-mono rounded px-2 py-1 outline-none focus:border-white transition-colors cursor-pointer"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
