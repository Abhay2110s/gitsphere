import React, { useState } from 'react';
import { CloseIcon, UsersIcon, UserIcon } from '../common/Icons';

export default function AddDeveloperModal({
  isOpen,
  onClose,
  onInviteDeveloper,
  projects = [],
  teamMembers = [],
}) {
  const [projectId, setProjectId] = useState('');
  const [selectedExistingMemberId, setSelectedExistingMemberId] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const defaultProjectId = projects[0]?._id || projects[0]?.id || '';
  const currentProjectId = projectId || defaultProjectId;

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    setSubmitting(false);
    setProjectId('');
    setSelectedExistingMemberId('');
    setEmail('');
    onClose();
  };

  const handleExistingMemberSelect = (e) => {
    const val = e.target.value;
    setSelectedExistingMemberId(val);
    if (val === 'custom' || !val) {
      setEmail('');
    } else {
      const member = teamMembers.find(
        (m) => String(m.id || m._id) === String(val)
      );
      if (member) {
        setEmail(member.email || '');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const targetEmail = email.trim();
    if (!currentProjectId) {
      setError('Please select a project to add the team member to.');
      return;
    }

    if (!targetEmail) {
      setError('Please enter developer email address.');
      return;
    }

    try {
      setSubmitting(true);
      await onInviteDeveloper({
        projectId: currentProjectId,
        email: targetEmail,
        userId: selectedExistingMemberId && selectedExistingMemberId !== 'custom' ? selectedExistingMemberId : undefined,
      });
      setEmail('');
      setSelectedExistingMemberId('');
      handleClose();
    } catch (err) {
      setError(err?.message || 'Failed to add developer. Please check the email and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-[#222222]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1C1C1C] border border-[#333333] flex items-center justify-center text-white">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Add Developer to Team</h3>
              <p className="text-xs text-[#888888]">Grant project contributor permissions</p>
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
          <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-2">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-white text-xs font-mono font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* Target Project Dropdown */}
          <div>
            <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
              Select Your Project *
            </label>
            {projects.length === 0 ? (
              <p className="text-xs text-amber-400/90 bg-amber-950/20 border border-amber-500/30 p-2.5 rounded-lg">
                No projects found. Please create a project before adding developers to your team.
              </p>
            ) : (
              <select
                required
                value={currentProjectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors"
              >
                {projects.map((p) => {
                  const id = p._id || p.id;
                  const memberCount = Array.isArray(p.members) ? p.members.length : 0;
                  return (
                    <option key={id} value={id} className="bg-[#141414] text-white">
                      {p.name} ({memberCount} {memberCount === 1 ? 'member' : 'members'})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Quick Select from Existing Team Members (if any exist) */}
          {teamMembers.length > 0 && (
            <div>
              <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
                Quick Select from Your Team
              </label>
              <select
                value={selectedExistingMemberId}
                onChange={handleExistingMemberSelect}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors cursor-pointer"
              >
                <option value="" className="bg-[#141414] text-white">
                  -- Select a developer from your team or type new email --
                </option>
                {teamMembers.map((m) => {
                  const id = m.id || m._id;
                  return (
                    <option key={id} value={id} className="bg-[#141414] text-white">
                      {m.name} ({m.email})
                    </option>
                  );
                })}
                <option value="custom" className="bg-[#141414] text-white">
                  ✍️ Enter new developer email...
                </option>
              </select>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
              Developer Email *
            </label>
            <input
              type="email"
              required
              placeholder="developer@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSelectedExistingMemberId('');
              }}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors"
            />
            <p className="mt-1 text-[11px] text-[#777777]">
              Enter the registered email of the developer you want to add to your project.
            </p>
          </div>

          {/* Role Indicator */}
          <div>
            <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-2">
              Assigned Role
            </label>
            <input
              type="text"
              disabled
              value="Developer (Project Contributor)"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#1A1A1A] border border-[#262626] text-[#888888] text-sm cursor-not-allowed font-mono"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-[#222222] flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-bold text-[#AAAAAA] hover:text-white hover:border-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || projects.length === 0}
              className="px-5 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Adding to Project...</span>
                </>
              ) : (
                <span>Add to Project</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
