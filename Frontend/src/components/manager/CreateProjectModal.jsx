import React, { useState } from 'react';
import { CloseIcon, FolderIcon } from '../common/Icons';

export default function CreateProjectModal({ isOpen, onClose, onCreateProject }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectType: 'web',
    visibility: 'private',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (submitting) return;
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setError('Project name must be at least 2 characters long');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      if (onCreateProject) {
        await onCreateProject({
          name: trimmedName,
          description: formData.description.trim(),
          projectType: formData.projectType || 'web',
          visibility: formData.visibility || 'private',
        });
      }
      setFormData({ name: '', description: '', projectType: 'web', visibility: 'private' });
      setError(null);
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to create project. Please try again.');
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
              <FolderIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Create Project</h3>
              <p className="text-xs text-[#888888]">Initialize a new development repository and workspace</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#1C1C1C] transition-colors cursor-pointer disabled:opacity-50"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
              Project Name
            </label>
            <input
              type="text"
              required
              disabled={submitting}
              placeholder="e.g. gateway-core"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              placeholder="Brief summary of repository goals and deliverables..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors resize-none disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                Project Type
              </label>
              <select
                required
                disabled={submitting}
                value={formData.projectType}
                onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors disabled:opacity-50"
              >
                <option value="" disabled>Select project type</option>
                <option value="web">Web Application</option>
                <option value="api">API Service</option>
                <option value="mobile">Mobile Client</option>
                <option value="library">Library / CLI</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                Visibility
              </label>
              <select
                required
                disabled={submitting}
                value={formData.visibility}
                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors disabled:opacity-50"
              >
                <option value="" disabled>Select visibility</option>
                <option value="private">Private</option>
                <option value="internal">Internal</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#222222] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-bold text-[#AAAAAA] hover:text-white hover:border-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && (
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              )}
              <span>{submitting ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
