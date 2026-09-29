import React, { useState, useEffect } from 'react';
import { tasksApi } from '../../api/tasks.api';
import TaskStatusBadge from '../../components/developer/TaskStatusBadge';
import PageHeader from '../../components/developer/PageHeader';
import EmptyState from '../../components/developer/EmptyState';
import ErrorState from '../../components/developer/ErrorState';
import { ChevronLeftIcon, LayersIcon, CodeIcon, GitPullRequestIcon } from '../../components/common/Icons';

export default function TaskDetails({
  taskId: propTaskId,
  task: initialTask,
  onBackToTasks,
  onOpenWorkspace,
  onOpenCodeEditor,
}) {
  const taskId = initialTask?._id || initialTask?.id || propTaskId;
  const [task, setTask] = useState(initialTask || null);
  const [loading, setLoading] = useState(!initialTask);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchTask = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await tasksApi.getTaskById(taskId);
      if (res) setTask(res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const handleStatusChange = async (newStatus) => {
    if (!task) return;
    try {
      setUpdating(true);
      await tasksApi.updateTaskStatus(taskId, newStatus);
      setTask((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-[#222222] rounded" />
        <div className="h-64 bg-[#0A0A0A] border border-[#222222] rounded-2xl" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBackToTasks}
          className="flex items-center gap-1.5 text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Back to Tasks</span>
        </button>
        <ErrorState
          title="Task not found"
          message={error?.message || 'We could not load this task.'}
          onRetry={fetchTask}
        />
      </div>
    );
  }

  const deadlineFormatted = task.deadline
    ? new Date(task.deadline).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No deadline';

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={onBackToTasks}
        className="flex items-center gap-1.5 text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span>Back to Tasks</span>
      </button>

      {/* Main Task Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-[#222222] bg-[#0A0A0A] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#1A1A1A]">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {task.title}
              </h1>
              <TaskStatusBadge status={task.status} />
            </div>
            {task.project?.name && (
              <div className="text-xs font-mono text-[#888888]">
                Repository: <span className="text-white font-bold">{task.project.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenWorkspace && (
              <button
                onClick={() => onOpenWorkspace(task)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#333333] hover:border-white text-xs font-bold text-white transition-colors cursor-pointer"
              >
                <LayersIcon className="w-3.5 h-3.5" />
                <span>Workspace</span>
              </button>
            )}
            {onOpenCodeEditor && (
              <button
                onClick={() => onOpenCodeEditor(task)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer shadow-sm"
              >
                <CodeIcon className="w-3.5 h-3.5" />
                <span>Code Editor</span>
              </button>
            )}
          </div>
        </div>

        {/* Task Description */}
        <div>
          <h3 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase mb-2">
            DESCRIPTION & OBJECTIVES
          </h3>
          <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed whitespace-pre-line bg-[#0D0D0D] border border-[#1A1A1A] p-4 rounded-xl">
            {task.description || 'No description provided for this task.'}
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#1A1A1A] text-xs font-mono">
          <div>
            <span className="text-[#666666] block">Priority</span>
            <span className="text-white font-bold uppercase mt-1 block">
              {task.priority || 'Normal'}
            </span>
          </div>
          <div>
            <span className="text-[#666666] block">Deadline</span>
            <span className="text-white mt-1 block">{deadlineFormatted}</span>
          </div>
          <div>
            <span className="text-[#666666] block">Assigned Developer</span>
            <span className="text-white mt-1 block truncate">
              {task.assignedTo?.name || 'You'}
            </span>
          </div>
          <div>
            <span className="text-[#666666] block">Change Status</span>
            <select
              value={task.status}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="mt-1 bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono rounded px-2 py-1 outline-none focus:border-white transition-colors cursor-pointer"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
