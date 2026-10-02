import React, { useState, useEffect } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../hooks/useMessages';
import PageHeader from '../../components/developer/PageHeader';
import MessageList from '../../components/developer/MessageList';
import MessageComposer from '../../components/developer/MessageComposer';
import EmptyState from '../../components/developer/EmptyState';
import { MessageIcon, FolderIcon, ClockIcon, UserIcon } from '../../components/common/Icons';

export default function Messages() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');

  // Auto-select first project when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      const firstId = projects[0]._id || projects[0].id;
      setSelectedProjectId(firstId);
    }
  }, [projects, selectedProjectId]);

  const effectiveProjectId = selectedProjectId || (projects.length > 0 ? (projects[0]._id || projects[0].id) : '');
  const currentProject = projects.find((p) => (p._id || p.id) === effectiveProjectId);

  // Extract contacts for current project: Project Manager + Fellow Developers
  const projectManager = currentProject?.createdBy;
  const managerId = projectManager ? String(projectManager._id || projectManager.id || projectManager) : '';
  const myId = String(user?._id || user?.id || '');

  const fellowDevelopers = (currentProject?.members || []).filter((m) => {
    const mId = String(typeof m === 'object' ? m._id || m.id : m);
    return mId !== myId;
  });

  // When project changes, default active recipient to Project Manager
  useEffect(() => {
    if (managerId) {
      setSelectedRecipientId(managerId);
    } else if (fellowDevelopers.length > 0) {
      const firstDev = fellowDevelopers[0];
      setSelectedRecipientId(String(typeof firstDev === 'object' ? firstDev._id || firstDev.id : firstDev));
    } else {
      setSelectedRecipientId('');
    }
  }, [effectiveProjectId, managerId]);

  const { messages, loading, error, refetch, sendMessage } = useMessages(
    'project',
    effectiveProjectId,
    selectedRecipientId || null
  );

  // Find active contact details
  let activeContactName = 'Collaborator';
  let activeContactRole = 'USER';
  let activeContactEmail = '';

  if (selectedRecipientId && managerId && selectedRecipientId === managerId) {
    activeContactName = typeof projectManager === 'object' ? projectManager.name || 'Project Manager' : 'Project Manager';
    activeContactRole = 'MANAGER';
    activeContactEmail = typeof projectManager === 'object' ? projectManager.email : '';
  } else if (selectedRecipientId) {
    const foundDev = fellowDevelopers.find((d) => {
      const dId = String(typeof d === 'object' ? d._id || d.id : d);
      return dId === selectedRecipientId;
    });
    if (foundDev) {
      activeContactName = typeof foundDev === 'object' ? foundDev.name || 'Developer' : 'Developer';
      activeContactRole = 'USER';
      activeContactEmail = typeof foundDev === 'object' ? foundDev.email : '';
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Developer Messages"
          description="Communicate 1-on-1 with your project manager and team members separated by project."
        />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono shrink-0 self-start sm:self-auto">
          <ClockIcon className="w-3.5 h-3.5" />
          <span>10-Day Auto-Vanishing Active</span>
        </div>
      </div>

      <div className="border border-[#222222] rounded-2xl overflow-hidden bg-[#0A0A0A] grid grid-cols-1 lg:grid-cols-12 min-h-[600px] shadow-2xl">
        {/* Left Column: Project Selector & Individual Contacts */}
        <div className="lg:col-span-4 border-r border-[#222222] bg-[#070707] flex flex-col">
          {/* Step 1: Projects Selector */}
          <div className="p-4 border-b border-[#1A1A1A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-[#AAAAAA] uppercase">
                1. Select Project
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-[#777777]">
                {projects.length} Projects
              </span>
            </div>

            {projects.length > 0 ? (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] text-white text-xs font-mono rounded-xl p-2.5 outline-none focus:border-white transition-colors"
              >
                {projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-[#666666] font-mono">No projects found.</div>
            )}
          </div>

          {/* Step 2: Individual Contacts List */}
          <div className="p-3 border-b border-[#1A1A1A] bg-[#090909] flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider text-[#AAAAAA] uppercase">
              2. Contacts in Project
            </span>
            <span className="text-[10px] font-mono text-purple-400">
              {1 + fellowDevelopers.length} Contacts
            </span>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 max-h-[440px]">
            {projectsLoading ? (
              <p className="text-xs text-[#666666] font-mono p-4 text-center">
                Loading contacts...
              </p>
            ) : !currentProject ? (
              <div className="p-6 text-center text-xs text-[#666666] font-mono">
                Select a project above.
              </div>
            ) : (
              <>
                {/* 1. Project Manager Contact */}
                {managerId && (
                  <button
                    onClick={() => setSelectedRecipientId(managerId)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 ${
                      selectedRecipientId === managerId
                        ? 'bg-[#181818] border border-[#3A3A3A] shadow'
                        : 'hover:bg-[#111111] border border-transparent text-[#888888]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        selectedRecipientId === managerId
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-[#141414] border border-[#262626] text-purple-400'
                      }`}
                    >
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${selectedRecipientId === managerId ? 'text-white' : 'text-[#CCCCCC]'}`}>
                          {typeof projectManager === 'object' ? projectManager.name || 'Project Manager' : 'Project Manager'}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/40 text-purple-400 border border-purple-800/40">
                          LEAD MGR
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#666666] truncate mt-0.5">
                        {typeof projectManager === 'object' ? projectManager.email : 'Project Creator'}
                      </div>
                    </div>
                  </button>
                )}

                {/* 2. Fellow Project Developers */}
                {fellowDevelopers.map((dev, idx) => {
                  const devId = String(typeof dev === 'object' ? dev._id || dev.id : dev);
                  const devName = typeof dev === 'object' ? dev.name || dev.email : `Developer #${idx + 1}`;
                  const devEmail = typeof dev === 'object' ? dev.email : '';
                  const isSelected = selectedRecipientId === devId;

                  return (
                    <button
                      key={devId || idx}
                      onClick={() => setSelectedRecipientId(devId)}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-[#181818] border border-[#3A3A3A] shadow'
                          : 'hover:bg-[#111111] border border-transparent text-[#888888]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-[#141414] border border-[#262626] text-[#777777]'
                        }`}
                      >
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#CCCCCC]'}`}>
                            {devName}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-950/40 text-blue-400 border border-blue-800/40">
                            DEV
                          </span>
                        </div>
                        {devEmail && (
                          <div className="text-[10px] font-mono text-[#666666] truncate mt-0.5">
                            {devEmail}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Right Column: 1-on-1 Chat Window */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-[#0A0A0A]">
          {effectiveProjectId && currentProject && selectedRecipientId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#1C1C1C] bg-[#0C0C0C] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      activeContactRole === 'MANAGER'
                        ? 'bg-purple-950/40 border border-purple-800/40 text-purple-400'
                        : 'bg-blue-950/40 border border-blue-800/40 text-blue-400'
                    }`}
                  >
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white tracking-wide truncate">
                        1-on-1 Chat with {activeContactName}
                      </h3>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                          activeContactRole === 'MANAGER'
                            ? 'bg-purple-950/40 text-purple-400 border-purple-800/40'
                            : 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                        }`}
                      >
                        {activeContactRole === 'MANAGER' ? 'LEAD MGR' : 'DEV'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-[#777777]">
                        Project: <span className="text-white font-bold">{currentProject.name}</span>
                      </span>
                      <span className="text-[10px] font-mono text-amber-500/80">
                        • 10d auto-retention
                      </span>
                    </div>
                  </div>
                </div>

                {loading && (
                  <span className="text-[10px] font-mono text-[#888888] animate-pulse">Syncing...</span>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-950/30 border-b border-red-900/30 text-xs text-red-400 flex items-center justify-between font-mono">
                  <span>Failed to load messages: {error.message || 'Error occurred'}</span>
                  <button onClick={refetch} className="underline hover:text-white cursor-pointer">
                    Retry
                  </button>
                </div>
              )}

              {/* Message List */}
              <MessageList
                messages={messages}
                currentUserId={user?._id || user?.id}
              />

              {/* Message Composer */}
              <MessageComposer
                onSend={sendMessage}
                disabled={!effectiveProjectId || !selectedRecipientId}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <EmptyState
                icon={MessageIcon}
                title="NO CONTACT SELECTED"
                description="Select a project and a contact to open a direct 1-on-1 private chat channel."
                className="border-0 bg-transparent"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
