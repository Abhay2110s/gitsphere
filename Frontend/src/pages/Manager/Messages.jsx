import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import { useMessages } from '../../hooks/useMessages';
import EmptyState from '../../components/manager/EmptyState';
import {
  MessageIcon,
  ArrowRightIcon,
  UserIcon
} from '../../components/common/Icons';

export default function Messages() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedDeveloperId, setSelectedDeveloperId] = useState(''); // '' means project broadcast, or dev._id for 1-on-1

  // Auto-select first project when projects load
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      const firstId = projects[0]._id || projects[0].id;
      setSelectedProjectId(firstId);
      // If project has members, auto-select the first developer for 1-on-1, or default to general
      if (projects[0].members && projects[0].members.length > 0) {
        const firstDev = projects[0].members[0];
        setSelectedDeveloperId(firstDev._id || firstDev.id || firstDev);
      }
    }
  }, [projects, selectedProjectId]);

  const effectiveProjectId = selectedProjectId || (projects.length > 0 ? (projects[0]._id || projects[0].id) : '');
  const currentProject = projects.find((p) => (p._id || p.id) === effectiveProjectId);

  // When project changes, ensure selected developer belongs to current project
  useEffect(() => {
    if (currentProject?.members && currentProject.members.length > 0) {
      const memberIds = currentProject.members.map((m) => String(m._id || m.id || m));
      if (!selectedDeveloperId || !memberIds.includes(String(selectedDeveloperId))) {
        const firstDev = currentProject.members[0];
        setSelectedDeveloperId(firstDev._id || firstDev.id || firstDev);
      }
    } else {
      setSelectedDeveloperId('');
    }
  }, [effectiveProjectId, currentProject]);

  const { messages, loading: messagesLoading, error: messagesError, sendMessage } = useMessages(
    'project',
    effectiveProjectId,
    selectedDeveloperId || null
  );

  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const activeDeveloper = currentProject?.members?.find(
    (m) => String(m._id || m.id || m) === String(selectedDeveloperId)
  );
  const activeDevName = typeof activeDeveloper === 'object' ? activeDeveloper.name || activeDeveloper.email : 'Team Channel';

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending || !effectiveProjectId) return;

    try {
      setSending(true);
      await sendMessage(content.trim());
      setContent('');
    } catch {
      // Handled in useMessages
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-[#1F1F1F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            PROJECT MESSAGES
          </h1>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-[#222222] bg-[#0A0A0A] overflow-hidden min-h-[600px] shadow-2xl">
        {/* Left Sidebar: Projects & Individual Developers */}
        <div className="lg:col-span-4 border-r border-[#222222] flex flex-col bg-[#070707]">
          {/* Projects Switcher */}
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
                    📁 {p.name} ({p.members?.length || 0} devs)
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-[#666666] font-mono">No created projects.</div>
            )}
          </div>

          {/* Individual Developers in Selected Project */}
          <div className="p-3 border-b border-[#1A1A1A] bg-[#090909] flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider text-[#AAAAAA] uppercase">
              2. Individual Developers
            </span>
            <span className="text-[10px] font-mono text-blue-400">
              {currentProject?.members?.length || 0} Assigned
            </span>
          </div>

          {/* Developers List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 max-h-[440px]">
            {projectsLoading ? (
              <div className="p-4 text-center text-xs text-[#666666] font-mono">Loading developers...</div>
            ) : !currentProject || !currentProject.members || currentProject.members.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#666666] font-mono">
                No developers added to this project yet. Add developers from the Project Details page to start chatting.
              </div>
            ) : (
              currentProject.members.map((member, idx) => {
                const memberId = String(typeof member === 'object' ? member._id || member.id : member);
                const memberName = typeof member === 'object' ? member.name || member.email : `Developer #${idx + 1}`;
                const memberEmail = typeof member === 'object' ? member.email : '';
                const isSelected = selectedDeveloperId === memberId;

                return (
                  <button
                    key={memberId || idx}
                    onClick={() => setSelectedDeveloperId(memberId)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 ${isSelected
                      ? 'bg-[#181818] border border-[#3A3A3A] shadow'
                      : 'hover:bg-[#111111] border border-transparent text-[#888888]'
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${isSelected
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-[#141414] border border-[#262626] text-[#777777]'
                        }`}
                    >
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#CCCCCC]'}`}>
                          {memberName}
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-950/40 text-blue-400 border border-blue-800/40">
                          DEV
                        </span>
                      </div>
                      {memberEmail && (
                        <div className="text-[10px] font-mono text-[#666666] truncate mt-0.5">
                          {memberEmail}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: 1-on-1 Chat Stream & Composer */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-[#0A0A0A]">
          {effectiveProjectId && currentProject ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-4 border-b border-[#1C1C1C] bg-[#0C0C0C] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-800/40 flex items-center justify-center text-blue-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white tracking-wide truncate">
                        1-on-1 Chat with {activeDevName}
                      </h3>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950/40 text-purple-400 border border-purple-800/40">
                        PRIVATE
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-[#777777]">
                        Project: <span className="text-white font-bold">{currentProject.name}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {messagesLoading && (
                  <span className="text-[10px] font-mono text-[#888888] animate-pulse">Syncing...</span>
                )}
              </div>

              {/* Messages Error notification if any */}
              {messagesError && (
                <div className="p-2.5 bg-red-950/40 border-b border-red-900/30 text-[11px] text-red-400 font-mono px-4">
                  Failed to synchronize messages: {messagesError.message || 'Error occurred'}
                </div>
              )}

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[440px]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-[#222222] flex items-center justify-center text-xl mb-3">
                      💬
                    </div>
                    <p className="text-xs font-mono font-bold text-[#AAAAAA] uppercase">
                      No Messages With {activeDevName}
                    </p>
                    <p className="text-[11px] text-[#666666] mt-1 max-w-xs">
                      Send a private message below to start your 1-on-1 conversation for {currentProject.name}.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const myId = String(user?._id || user?.id || '');
                    const senderId = String(msg.sender?._id || msg.sender?.id || msg.sender || '');
                    const isMine =
                      Boolean(myId && senderId && myId === senderId) ||
                      Boolean(msg.sender?.email && user?.email && msg.sender.email.toLowerCase() === user.email.toLowerCase());
                    const senderName = isMine ? 'You (Manager)' : (msg.sender?.name || activeDevName);
                    const roleLabel = msg.sender?.role || (isMine ? 'MANAGER' : 'USER');
                    const timeFormatted = msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : '';

                    return (
                      <div
                        key={msg._id || msg.id || idx}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <span className="text-[10px] font-mono font-bold text-[#777777]">
                            {senderName}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${roleLabel === 'MANAGER'
                              ? 'bg-purple-950/40 text-purple-400 border-purple-800/40'
                              : 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                              }`}
                          >
                            {roleLabel === 'MANAGER' ? 'MGR' : 'DEV'}
                          </span>
                          <span className="text-[10px] font-mono text-[#555555]">
                            {timeFormatted}
                          </span>
                        </div>
                        <div
                          className={`max-w-lg px-4 py-2.5 rounded-2xl text-xs leading-relaxed break-words ${isMine
                            ? 'bg-white text-black font-medium rounded-br-none shadow-md'
                            : 'bg-[#141414] border border-[#262626] text-[#E0E0E0] rounded-bl-none'
                            }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSend} className="p-3.5 border-t border-[#1C1C1C] bg-[#0A0A0A]">
                <div className="flex items-center gap-2">
                  <textarea
                    rows={1}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending || !selectedDeveloperId}
                    placeholder={
                      selectedDeveloperId
                        ? `Message ${activeDevName} directly in ${currentProject.name}... (Press Enter)`
                        : 'Select a developer to start chatting...'
                    }
                    className="flex-1 bg-[#141414] border border-[#262626] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#555555] outline-none focus:border-white transition-colors resize-none disabled:opacity-40"
                  />
                  <button
                    type="submit"
                    disabled={sending || !content.trim() || !selectedDeveloperId}
                    className="p-3 rounded-xl bg-white text-black hover:bg-[#E5E5E5] disabled:opacity-30 disabled:hover:bg-white transition-all cursor-pointer shrink-0 font-bold"
                  >
                    {sending ? (
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin block" />
                    ) : (
                      <ArrowRightIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <EmptyState
                icon={MessageIcon}
                title="SELECT A PROJECT & DEVELOPER"
                description="Choose a project and an individual developer to open a direct 1-on-1 private chat channel."
                className="border-0 bg-transparent"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
