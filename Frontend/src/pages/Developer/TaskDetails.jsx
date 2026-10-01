import React, { useState, useEffect } from 'react';
import { tasksApi } from '../../api/tasks.api';
import TaskStatusBadge from '../../components/developer/TaskStatusBadge';
import ErrorState from '../../components/developer/ErrorState';
import { ChevronLeftIcon, LayersIcon, CodeIcon } from '../../components/common/Icons';

export default function TaskDetails({
  taskId: propTaskId,
  task: initialTask,
  onBackToTasks,
  onOpenWorkspace,
  onOpenCodeEditor,
}) {
  const taskId = initialTask?._id || initialTask?.id || propTaskId;
  const [task, setTask] = useState(initialTask || null);
  const [loading, setLoading] = useState(!initialTask && Boolean(taskId));
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    let ignore = false;

    tasksApi.getTaskById(taskId)
      .then((res) => {
        if (!ignore && res) {
          setTask(res);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [taskId]);

  const refetch = () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    tasksApi.getTaskById(taskId)
      .then(setTask)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  const [statusError, setStatusError] = useState(null);
  const [statusSuccess, setStatusSuccess] = useState(null);

  const handleStatusChange = async (newStatus) => {
    if (!task || newStatus === task.status) return;
    try {
      setUpdating(true);
      setStatusError(null);
      setStatusSuccess(null);
      await tasksApi.updateTaskStatus(taskId, newStatus);
      setTask((prev) => ({ ...prev, status: newStatus }));
      setStatusSuccess(`Task status successfully updated to ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setStatusSuccess(null), 3500);
    } catch (err) {
      console.error('Failed to update status:', err);
      setStatusError(err?.message || 'Failed to update status');
      setTimeout(() => setStatusError(null), 5000);
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
          onRetry={refetch}
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
            {task.status === 'COMPLETED' ? (
              <div className="mt-1">
                <span className="inline-block text-[11px] font-mono text-emerald-400 bg-emerald-950/20 border border-emerald-900/40 px-2.5 py-1 rounded">
                  Completed (Approved)
                </span>
                <p className="text-[10px] text-[#666666] mt-1">
                  Manager approved and closed this task
                </p>
              </div>
            ) : task.status === 'IN_REVIEW' ? (
              <div className="mt-1">
                <span className="inline-block text-[11px] font-mono text-amber-400 bg-amber-950/20 border border-amber-900/40 px-2.5 py-1 rounded">
                  Under Review
                </span>
                <p className="text-[10px] text-[#666666] mt-1">
                  Awaiting review and approval from Project Manager
                </p>
              </div>
            ) : (
              <div className="mt-1">
                <select
                  value={task.status}
                  disabled={updating}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono rounded px-2.5 py-1.5 outline-none focus:border-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {task.status === 'TODO' && (
                    <>
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">Start Work (In Progress)</option>
                    </>
                  )}
                  {task.status === 'IN_PROGRESS' && (
                    <>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="TODO">Move back to To Do</option>
                      <option value="IN_REVIEW">Submit for Review</option>
                    </>
                  )}
                  {task.status === 'CHANGES_REQUESTED' && (
                    <>
                      <option value="CHANGES_REQUESTED">Changes Requested</option>
                      <option value="IN_PROGRESS">Resume Work (In Progress)</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>
        </div>

        {statusError && (
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-400 font-mono animate-fade-in">
            {statusError}
          </div>
        )}

        {statusSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-400 font-mono animate-fade-in">
            {statusSuccess}
          </div>
        )}
      </div>
    </div>
  );
}
