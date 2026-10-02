import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import { useMessages } from '../../hooks/useMessages';
import EmptyState from '../../components/manager/EmptyState';
import {
  MessageIcon,
  FolderIcon,
  ClockIcon,
  ArrowRightIcon,
  UserIcon
} from '../../components/common/Icons';

export default function Messages() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-select first project when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      const firstId = projects[0]._id || projects[0].id;
      setSelectedProjectId(firstId);
    }
  }, [projects, selectedProjectId]);

  const effectiveProjectId = selectedProjectId || (projects.length > 0 ? (projects[0]._id || projects[0].id) : '');

  const { messages, loading: messagesLoading, error: messagesError, sendMessage } = useMessages(
    'project',
    effectiveProjectId
  );

  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const currentProject = projects.find(
    (p) => (p._id || p.id) === effectiveProjectId
  );

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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

  const filteredProjects = projects.filter((p) =>
    (p.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-[#1F1F1F] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            PROJECT MESSAGES
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Direct collaborative channels segregated by project. Chat with your assigned developers in strict isolation.
          </p>
        </div>

        {/* 10-day Notice Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono shrink-0">
          <ClockIcon className="w-3.5 h-3.5" />
          <span>10-Day Auto-Vanishing Active</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-[#222222] bg-[#0A0A0A] overflow-hidden min-h-[580px] shadow-2xl">
        {/* Left Sidebar: Projects List (Project Bifurcation) */}
        <div className="lg:col-span-4 border-r border-[#222222] flex flex-col bg-[#070707]">
          <div className="p-4 border-b border-[#1A1A1A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-[#AAAAAA] uppercase">
                Your Projects ({projects.length})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-[#777777]">
                Project Isolation
              </span>
            </div>

            {/* Quick Filter Input */}
            {projects.length > 4 && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full bg-[#111111] border border-[#222222] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#555555] outline-none focus:border-white transition-colors"
              />
            )}
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {projectsLoading ? (
              <div className="p-4 text-center text-xs text-[#666666] font-mono">Loading projects...</div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#666666] font-mono">
                {searchQuery ? 'No matching projects found.' : 'No created projects found.'}
              </div>
            ) : (
              filteredProjects.map((project) => {
                const pId = project._id || project.id;
                const isSelected = effectiveProjectId === pId;
                const memberCount = project.members?.length || 0;

                return (
                  <button
                    key={pId}
                    onClick={() => setSelectedProjectId(pId)}
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
                      <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#AAAAAA]'}`}>
                        {project.name}
                      </div>
                      <div className="text-[10px] font-mono text-[#666666] truncate mt-0.5 flex items-center gap-1.5">
                        <UserIcon className="w-2.5 h-2.5 text-blue-400" />
                        <span>{memberCount} Assigned Dev{memberCount === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Feed & Composer */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-[#0A0A0A]">
          {effectiveProjectId && currentProject ? (
            <>
              {/* Active Channel Header with Project Developers */}
              <div className="p-4 border-b border-[#1C1C1C] bg-[#0C0C0C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-white">
                    <FolderIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wide truncate max-w-sm">
                      {currentProject.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-blue-400">
                        {currentProject.members?.length || 0} Assigned Developers
                      </span>
                      <span className="text-[10px] font-mono text-amber-500/80">
                        • 10d auto-retention
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned Dev Chips */}
                {currentProject.members && currentProject.members.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 max-w-xs">
                    {currentProject.members.slice(0, 3).map((m, idx) => {
                      const mName = typeof m === 'object' ? m.name || m.email : `Dev #${idx + 1}`;
                      return (
                        <span
                          key={m._id || m.id || idx}
                          className="px-2 py-0.5 rounded-md bg-[#161616] text-[10px] font-mono text-[#CCCCCC] border border-[#262626]"
                        >
                          {mName}
                        </span>
                      );
                    })}
                    {currentProject.members.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono text-[#777777]">
                        +{currentProject.members.length - 3} more
                      </span>
                    )}
                  </div>
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
                      No Messages In This Project Channel
                    </p>
                    <p className="text-[11px] text-[#666666] mt-1 max-w-xs">
                      Send a message below to start collaborating with your assigned project developers.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const myId = String(user?._id || user?.id || '');
                    const senderId = String(msg.sender?._id || msg.sender?.id || msg.sender || '');
                    const isMine =
                      Boolean(myId && senderId && myId === senderId) ||
                      Boolean(msg.sender?.email && user?.email && msg.sender.email.toLowerCase() === user.email.toLowerCase());
                    const senderName = isMine ? 'You (Manager)' : (msg.sender?.name || 'Developer');
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
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                              roleLabel === 'MANAGER'
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
                          className={`max-w-lg px-4 py-2.5 rounded-2xl text-xs leading-relaxed break-words ${
                            isMine
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
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSend} className="p-3.5 border-t border-[#1C1C1C] bg-[#0A0A0A]">
                <div className="flex items-center gap-2">
                  <textarea
                    rows={1}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={sending}
                    placeholder={`Message developers in ${currentProject.name}... (Press Enter to send)`}
                    className="flex-1 bg-[#141414] border border-[#262626] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#555555] outline-none focus:border-white transition-colors resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !content.trim()}
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
                title="SELECT A PROJECT"
                description="Select a project channel to communicate directly with your project developers."
                className="border-0 bg-transparent"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
