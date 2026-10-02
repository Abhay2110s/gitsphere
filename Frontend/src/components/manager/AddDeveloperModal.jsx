import React, { useState, useEffect, useMemo } from 'react';
import { CloseIcon, UsersIcon, CheckIcon, SearchIcon } from '../common/Icons';
import { usersApi } from '../../api/users.api';

export default function AddDeveloperModal({
  isOpen,
  onClose,
  onInviteDeveloper,
  projects = [],
}) {
  const [projectId, setProjectId] = useState('');
  const [developers, setDevelopers] = useState([]);
  const [loadingDevelopers, setLoadingDevelopers] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [showManualEmail, setShowManualEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const defaultProjectId = projects[0]?._id || projects[0]?.id || '';
  const currentProjectId = projectId || defaultProjectId;
  const currentProject = projects.find(
    (p) => String(p._id || p.id) === String(currentProjectId)
  ) || projects[0] || null;

  // Fetch active developers from backend on open
  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    setLoadingDevelopers(true);
    setFetchError(null);

    usersApi
      .getUsers({ role: 'USER', limit: 100 })
      .then((res) => {
        if (!ignore) {
          const list = Array.isArray(res)
            ? res
            : Array.isArray(res?.data)
            ? res.data
            : [];
          setDevelopers(list);
          setLoadingDevelopers(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Failed to load developers list:', err);
          setFetchError(err?.message || 'Could not fetch developers');
          setLoadingDevelopers(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  // Reset state on close
  const handleClose = () => {
    if (submitting) return;
    setError(null);
    setFetchError(null);
    setSelectedDeveloper(null);
    setSearchQuery('');
    setManualEmail('');
    setShowManualEmail(false);
    onClose();
  };

  // Helper to determine if a developer is already part of the chosen project
  const isAlreadyMember = (dev) => {
    if (!currentProject || !Array.isArray(currentProject.members)) return false;
    const devId = String(dev._id || dev.id || '');
    const devEmail = (dev.email || '').toLowerCase().trim();

    return currentProject.members.some((m) => {
      const memberId = String(m?._id || m?.id || m || '');
      const memberEmail = (m?.email || '').toLowerCase().trim();
      return (
        (devId && memberId && memberId === devId) ||
        (devEmail && memberEmail && memberEmail === devEmail)
      );
    });
  };

  // Filter developers according to search query
  const filteredDevelopers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return developers;
    return developers.filter(
      (d) =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.email || '').toLowerCase().includes(q)
    );
  }, [developers, searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentProjectId) {
      setError('Please select a project to add the developer to.');
      return;
    }

    const targetEmail = showManualEmail
      ? manualEmail.trim()
      : selectedDeveloper?.email;
    const targetUserId = showManualEmail
      ? undefined
      : selectedDeveloper?._id || selectedDeveloper?.id;

    if (!targetEmail) {
      setError('Please select an active developer from the list or enter their email address.');
      return;
    }

    try {
      setSubmitting(true);
      await onInviteDeveloper({
        projectId: currentProjectId,
        email: targetEmail,
        userId: targetUserId,
      });
      handleClose();
    } catch (err) {
      setError(
        err?.message ||
          'Failed to add developer. Please check the developer information and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 sm:p-7 shadow-2xl relative animate-scale-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222222] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C1C1C] border border-[#333333] flex items-center justify-center text-white">
              <UsersIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Add Developer to Project
              </h3>
              <p className="text-xs text-[#888888]">
                Select an active developer to grant contributor permissions
              </p>
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
          <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-2 shrink-0">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-white text-xs font-mono font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col flex-1 min-h-0">
          {/* Target Project Dropdown */}
          <div className="shrink-0 mb-4">
            <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-1.5">
              Select Target Project *
            </label>
            {projects.length === 0 ? (
              <p className="text-xs text-amber-400/90 bg-amber-950/20 border border-amber-500/30 p-2.5 rounded-lg">
                No projects found. Please create a project first.
              </p>
            ) : projects.length === 1 ? (
              <div className="px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs font-mono flex items-center justify-between">
                <span className="font-bold text-white">{projects[0].name}</span>
                <span className="text-[#777777]">
                  {projects[0].members?.length || 0} members
                </span>
              </div>
            ) : (
              <select
                required
                value={currentProjectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setSelectedDeveloper(null);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs focus:border-white focus:outline-none transition-colors"
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

          {!showManualEmail ? (
            <>
              {/* Search & Active Developer Picker */}
              <div className="flex items-center justify-between mb-2 shrink-0">
                <label className="text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider">
                  Choose from Active Developers ({developers.length})
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualEmail(true);
                    setSelectedDeveloper(null);
                  }}
                  className="text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  Enter email manually →
                </button>
              </div>

              {/* Search input */}
              <div className="relative mb-3 shrink-0">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#666666]">
                  <SearchIcon className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="Filter active developers by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-xs text-white placeholder-[#666666] focus:border-white focus:outline-none transition-colors font-mono"
                />
              </div>

              {/* Scrollable Developers List */}
              <div className="flex-1 overflow-y-auto space-y-2 min-h-[160px] max-h-[260px] pr-1 custom-scrollbar border border-[#1F1F1F] rounded-xl p-2 bg-[#0A0A0A]">
                {loadingDevelopers ? (
                  <div className="flex flex-col items-center justify-center py-8 text-[#777777] text-xs font-mono space-y-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Loading active developers...</span>
                  </div>
                ) : fetchError ? (
                  <div className="py-6 text-center text-xs text-red-400">
                    <p>{fetchError}</p>
                    <button
                      type="button"
                      onClick={() => setShowManualEmail(true)}
                      className="mt-2 text-xs font-bold text-white underline cursor-pointer"
                    >
                      Enter email manually instead
                    </button>
                  </div>
                ) : filteredDevelopers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-[#777777] font-mono">
                    {developers.length === 0 ? (
                      <div className="space-y-2">
                        <p className="text-white font-semibold">No registered developers found</p>
                        <p className="text-[#666666] text-[11px]">
                          Once developers register accounts, they will appear here.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowManualEmail(true)}
                          className="mt-2 px-3 py-1.5 rounded-lg bg-[#1C1C1C] border border-[#333333] text-xs text-white hover:bg-[#252525] transition-colors cursor-pointer"
                        >
                          Enter email manually
                        </button>
                      </div>
                    ) : (
                      <p>No developers match "{searchQuery}"</p>
                    )}
                  </div>
                ) : (
                  filteredDevelopers.map((dev) => {
                    const devId = dev._id || dev.id;
                    const alreadyInProject = isAlreadyMember(dev);
                    const isSelected =
                      selectedDeveloper &&
                      String(selectedDeveloper._id || selectedDeveloper.id) === String(devId);

                    return (
                      <div
                        key={devId}
                        onClick={() => {
                          if (!alreadyInProject) {
                            setSelectedDeveloper(dev);
                            setError(null);
                          }
                        }}
                        className={`p-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                          alreadyInProject
                            ? 'opacity-40 bg-[#121212] border border-[#1E1E1E] cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#181818] border border-white text-white shadow-lg cursor-pointer'
                            : 'bg-[#121212] border border-[#222222] hover:border-[#383838] hover:bg-[#161616] text-[#CCCCCC] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                              isSelected
                                ? 'bg-white text-black'
                                : 'bg-[#1E1E1E] border border-[#333333] text-white'
                            }`}
                          >
                            {dev.name ? dev.name.charAt(0).toUpperCase() : 'D'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">
                                {dev.name || 'Developer'}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
                                Active
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-[#777777] truncate">
                              {dev.email}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          {alreadyInProject ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-[#666666]">
                              Already Member
                            </span>
                          ) : isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center">
                              <CheckIcon className="w-3 h-3" />
                            </div>
                          ) : (
                            <span className="text-[10px] font-mono text-[#666666] group-hover:text-white">
                              Select
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Selected developer indicator */}
              {selectedDeveloper && (
                <div className="mt-3 p-2.5 rounded-xl border border-white/20 bg-[#161616] flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[#888888] font-mono">Selected:</span>
                    <span className="text-white font-bold">{selectedDeveloper.name}</span>
                    <span className="text-[#777777] font-mono">({selectedDeveloper.email})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDeveloper(null)}
                    className="text-[11px] text-[#888888] hover:text-white font-mono cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Manual Email Input Fallback */
            <div className="space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider">
                  Developer Email *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowManualEmail(false);
                    setManualEmail('');
                  }}
                  className="text-[11px] font-mono text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  ← Pick from active developers list
                </button>
              </div>
              <input
                type="email"
                required
                placeholder="developer@company.com"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-sm focus:border-white focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-[#777777]">
                Enter the registered email of the developer you want to add to your project.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 pt-4 border-t border-[#222222] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              disabled={submitting}
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-[#333333] text-xs font-bold text-[#AAAAAA] hover:text-white hover:border-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                projects.length === 0 ||
                (!showManualEmail && !selectedDeveloper) ||
                (showManualEmail && !manualEmail.trim())
              }
              className="px-5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-2 shadow-sm"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Adding to Project...</span>
                </>
              ) : (
                <span>
                  {selectedDeveloper
                    ? `Add ${selectedDeveloper.name || 'Developer'} to Project`
                    : 'Add Developer to Project'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
