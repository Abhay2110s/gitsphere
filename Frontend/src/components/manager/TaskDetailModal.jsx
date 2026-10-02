import React, { useState } from 'react';
import {
  CloseIcon,
  TaskCheckIcon,
  TrashIcon,
  AlertTriangleIcon,
  CalendarIcon,
  UserIcon,
  FolderIcon,
} from '../common/Icons';

export default function TaskDetailModal({
  isOpen,
  task,
  onClose,
  onDeleteTask,
  onUpdateTask,
  onAssignTask,
  availableDevelopers = [],
}) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen || !task) return null;

  const taskId = task._id || task.id;
  const projectName = task.project?.name || 'Project';
  const assigneeName = task.assignedTo?.name || task.assignedTo?.email || 'Unassigned';
  const currentAssigneeId = task.assignedTo?._id || task.assignedTo?.id || (typeof task.assignedTo === 'string' ? task.assignedTo : '');

  const handleClose = () => {
    setIsConfirmingDelete(false);
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!taskId) return;
    try {
      setDeleting(true);
      setError(null);
      if (onDeleteTask) {
        await onDeleteTask(taskId);
      }
      handleClose();
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err?.message || 'Failed to delete task. Please try again.');
      setIsConfirmingDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!newStatus || newStatus === task.status || !onUpdateTask) return;
    try {
      setUpdating(true);
      setError(null);
      await onUpdateTask(taskId, { status: newStatus });
      setSuccess(`Status changed to ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (!newPriority || newPriority === task.priority || !onUpdateTask) return;
    try {
      setUpdating(true);
      setError(null);
      await onUpdateTask(taskId, { priority: newPriority });
      setSuccess(`Priority changed to ${newPriority}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to update priority');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    const target = newAssigneeId === 'unassigned' || !newAssigneeId ? null : newAssigneeId;
    if (target === currentAssigneeId || !onAssignTask) return;
    try {
      setUpdating(true);
      setError(null);
      await onAssignTask(taskId, target);
      setSuccess(target ? 'Assignee updated successfully' : 'Task unassigned');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err?.message || 'Failed to update task assignee');
    } finally {
      setUpdating(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const p = String(priority || 'MEDIUM').toUpperCase();
    switch (p) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">HIGH</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">LOW</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">MEDIUM</span>;
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status || 'TODO').toUpperCase();
    switch (s) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">COMPLETED</span>;
      case 'IN_REVIEW':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">IN REVIEW</span>;
      case 'CHANGES_REQUESTED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">CHANGES REQUESTED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">IN PROGRESS</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1F1F1F] text-[#AAAAAA] border border-[#333333]">TO DO</span>;
    }
  };

  const deadlineFormatted = task.deadline
    ? new Date(task.deadline).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No deadline set';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl rounded-2xl border border-[#222222] bg-[#0E0E0E] shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#1C1C1C]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
              <TaskCheckIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase text-[#888888] flex items-center gap-1">
                  <FolderIcon className="w-3.5 h-3.5" />
                  {projectName}
                </span>
                {getStatusBadge(task.status)}
                {getPriorityBadge(task.priority)}
              </div>
              <h2 className="text-lg font-bold text-white mt-1 leading-snug">
                {task.title}
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#666666] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
              {success}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#666666] block mb-1.5">
              Description
            </label>
            <div className="p-3.5 rounded-xl border border-[#1C1C1C] bg-[#141414] text-xs text-[#CCCCCC] leading-relaxed whitespace-pre-wrap min-h-[60px]">
              {task.description || <span className="text-[#666666] italic">No description provided for this task.</span>}
            </div>
          </div>

          {/* Key Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Assignee Selection */}
            <div className="p-3 rounded-xl border border-[#1C1C1C] bg-[#141414] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#888888]">
                <UserIcon className="w-3.5 h-3.5" />
                <span>Assigned Developer</span>
              </div>
              {onAssignTask ? (
                <select
                  value={currentAssigneeId || 'unassigned'}
                  disabled={updating}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-white transition-colors cursor-pointer"
                >
                  <option value="unassigned">Unassigned</option>
                  {task.assignedTo && !availableDevelopers.some(d => (d._id || d.id) === currentAssigneeId) && (
                    <option value={currentAssigneeId}>{assigneeName}</option>
                  )}
                  {availableDevelopers.map((dev) => (
                    <option key={dev._id || dev.id} value={dev._id || dev.id}>
                      {dev.name || dev.fullName || dev.email}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs font-semibold text-white truncate">
                  {assigneeName}
                </div>
              )}
            </div>

            {/* Due Date Display */}
            <div className="p-3 rounded-xl border border-[#1C1C1C] bg-[#141414] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#888888]">
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Deadline</span>
              </div>
              <div className="text-xs font-mono text-[#CCCCCC]">
                {deadlineFormatted}
              </div>
            </div>

            {/* Quick Status Control */}
            <div className="p-3 rounded-xl border border-[#1C1C1C] bg-[#141414] space-y-1.5">
              <label className="text-[11px] font-mono text-[#888888] block">
                Workflow Status
              </label>
              {onUpdateTask ? (
                <select
                  value={task.status || 'TODO'}
                  disabled={updating}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-white transition-colors cursor-pointer"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="CHANGES_REQUESTED">Changes Requested</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              ) : (
                <div className="text-xs font-semibold text-white">
                  {task.status?.replace('_', ' ')}
                </div>
              )}
            </div>

            {/* Quick Priority Control */}
            <div className="p-3 rounded-xl border border-[#1C1C1C] bg-[#141414] space-y-1.5">
              <label className="text-[11px] font-mono text-[#888888] block">
                Priority Level
              </label>
              {onUpdateTask ? (
                <select
                  value={task.priority || 'MEDIUM'}
                  disabled={updating}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-white transition-colors cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              ) : (
                <div className="text-xs font-semibold text-white">
                  {task.priority}
                </div>
              )}
            </div>
          </div>

          {/* Delete Section / Confirmation Prompt */}
          <div className="pt-4 border-t border-[#1C1C1C]">
            {isConfirmingDelete ? (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 space-y-3 animate-fade-in">
                <div className="flex items-start gap-2.5 text-xs text-red-300 font-mono">
                  <AlertTriangleIcon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-200">Permanently delete this task?</span>
                    <p className="mt-1 text-[11px] text-red-300/80">
                      This will remove the assigned task and all its associated review files and discussions. This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-3 py-1.5 rounded-lg border border-[#333333] text-xs font-mono text-[#CCCCCC] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {deleting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <TrashIcon className="w-3.5 h-3.5" />
                        <span>Confirm Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#666666] font-mono">
                  Manager Task Controls
                </span>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[#1C1C1C] bg-[#0A0A0A]">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
