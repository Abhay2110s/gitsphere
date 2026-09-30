import React, { useState, useMemo } from 'react';
import { CloseIcon, TaskCheckIcon } from '../common/Icons';

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreateTask,
  availableProjects = [],
  availableDevelopers = []
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    priority: 'MEDIUM',
    dueDate: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Derive developer options based on selected project members or available developers
  const developerOptions = useMemo(() => {
    const map = new Map();

    // If a project is selected, add its members
    if (formData.project) {
      const selectedProj = availableProjects.find(
        (p) => String(p._id || p.id) === String(formData.project)
      );
      if (selectedProj?.members && Array.isArray(selectedProj.members)) {
        selectedProj.members.forEach((m) => {
          const id = String(m._id || m.id || m);
          const name = m.name || m.fullName || m.email || id;
          map.set(id, { id, name });
        });
      }
    }

    // Add general available developers
    availableDevelopers.forEach((d) => {
      const id = String(d._id || d.id || d);
      if (!map.has(id)) {
        const name = d.name || d.fullName || d.email || id;
        map.set(id, { id, name });
      }
    });

    return Array.from(map.values());
  }, [formData.project, availableProjects, availableDevelopers]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project) {
      setError('Please select a project');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      if (onCreateTask) {
        await onCreateTask({
          projectId: formData.project,
          title: formData.title.trim(),
          description: formData.description.trim(),
          assignedTo: formData.assignee || null,
          priority: formData.priority || 'MEDIUM',
          deadline: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        });
      }
      setFormData({
        title: '',
        description: '',
        project: '',
        assignee: '',
        priority: 'MEDIUM',
        dueDate: '',
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1C1C1C] border border-[#333333] flex items-center justify-center text-white">
              <TaskCheckIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Create Task</h3>
              <p className="text-xs text-[#888888]">Assign work items and define sprint backlog deliverables</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#1C1C1C] transition-colors cursor-pointer disabled:opacity-50"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
              Task Title *
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              placeholder="e.g. Implement zero-downtime DB migrator"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              rows={3}
              disabled={submitting}
              placeholder="Technical specifications, acceptance criteria..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors resize-none disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                Project *
              </label>
              <select
                required
                disabled={submitting}
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value, assignee: '' })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors disabled:opacity-50"
              >
                <option value="" disabled>Select project</option>
                {availableProjects.length === 0 ? (
                  <option value="" disabled>No projects available</option>
                ) : (
                  availableProjects.map((p) => {
                    const id = p._id || p.id;
                    return (
                      <option key={id} value={id}>
                        {p.name}
                      </option>
                    );
                  })
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                Assign Developer
              </label>
              <select
                disabled={submitting}
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {developerOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                Priority
              </label>
              <select
                disabled={submitting}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors disabled:opacity-50"
              >
                <option value="LOW">Low (P3)</option>
                <option value="MEDIUM">Medium (P2)</option>
                <option value="HIGH">High (P1)</option>
                <option value="URGENT">Urgent (P0)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                Due Date
              </label>
              <input
                type="date"
                disabled={submitting}
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#222222] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-bold text-[#AAAAAA] hover:text-white hover:border-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
