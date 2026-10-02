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

  // Auto-select first project when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id || projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const effectiveProjectId = selectedProjectId || (projects.length > 0 ? (projects[0]._id || projects[0].id) : '');

  const { messages, loading, error, refetch, sendMessage } = useMessages(
    'project',
    effectiveProjectId
  );

  const activeProject = projects.find((p) => (p._id || p.id) === effectiveProjectId);
  const managerName = activeProject?.createdBy?.name || 'Project Manager';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Developer Messages"
          description="Collaborative communication with your project manager and team members."
        />
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono shrink-0 self-start sm:self-auto">
          <ClockIcon className="w-3.5 h-3.5" />
          <span>10-Day Auto-Vanishing Active</span>
        </div>
      </div>

      <div className="border border-[#222222] rounded-2xl overflow-hidden bg-[#0A0A0A] grid grid-cols-1 lg:grid-cols-12 min-h-[580px] shadow-2xl">
        {/* Left Column: Project Channels */}
        <div className="lg:col-span-4 border-r border-[#222222] bg-[#070707] flex flex-col">
          <div className="p-4 border-b border-[#1C1C1C] flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider text-[#AAAAAA] uppercase">
              Project Channels
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-[#888888]">
              {projects.length} Projects
            </span>
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {projectsLoading ? (
              <p className="text-xs text-[#666666] font-mono p-4 text-center">
                Loading projects...
              </p>
            ) : projects.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#666666] font-mono">
                You are not assigned to any projects yet.
              </div>
            ) : (
              projects.map((project) => {
                const projectId = project._id || project.id;
                const isSelected = effectiveProjectId === projectId;
                const pManager = project.createdBy?.name || 'Manager';

                return (
                  <button
                    key={projectId}
                    onClick={() => setSelectedProjectId(projectId)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#181818] border border-[#333333] shadow'
                        : 'hover:bg-[#111111] border border-transparent text-[#888888]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white text-black'
                          : 'bg-[#141414] border border-[#222222] text-[#666666]'
                      }`}
                    >
                      <FolderIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-white' : 'text-[#AAAAAA]'
                        }`}
                      >
                        {project.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#666666] truncate mt-0.5 flex items-center gap-1.5">
                        <UserIcon className="w-2.5 h-2.5 text-purple-400" />
                        <span>Lead: {pManager}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-[#0A0A0A]">
          {effectiveProjectId && activeProject ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#1C1C1C] bg-[#0C0C0C] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-white">
                    <FolderIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wide truncate max-w-sm">
                      {activeProject.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-purple-400 font-bold">
                        Manager: {managerName}
                      </span>
                      <span className="text-[10px] font-mono text-[#666666]">
                        • {activeProject.members?.length || 0} Developers
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
                disabled={!effectiveProjectId}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <EmptyState
                icon={MessageIcon}
                title="NO PROJECT SELECTED"
                description="Select a project channel to communicate directly with your project manager and team."
                className="border-0 bg-transparent"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
