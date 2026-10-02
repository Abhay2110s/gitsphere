import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../hooks/useProjects';
import { useMessages } from '../../hooks/useMessages';
import { tasksApi } from '../../api/tasks.api';
import EmptyState from '../../components/manager/EmptyState';
import {
  MessageIcon,
  FolderIcon,
  TaskCheckIcon,
  ClockIcon,
  ArrowRightIcon,
  UserIcon
} from '../../components/common/Icons';

export default function Messages() {
  const { user } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();

  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [channelType, setChannelType] = useState('project'); // 'project' | 'task'
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [projectTasks, setProjectTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);

  // Auto-select first project when projects are loaded
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      const firstId = projects[0]._id || projects[0].id;
      setSelectedProjectId(firstId);
    }
  }, [projects, selectedProjectId]);

  // Fetch tasks for currently selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setProjectTasks([]);
      setSelectedTaskId('');
      return;
    }

    let isMounted = true;
    setTasksLoading(true);
    tasksApi
      .getProjectTasks(selectedProjectId)
      .then((res) => {
        if (!isMounted) return;
        const tasksList = Array.isArray(res) ? res : res?.tasks || [];
        setProjectTasks(tasksList);
        if (channelType === 'task' && tasksList.length > 0) {
          setSelectedTaskId(tasksList[0]._id || tasksList[0].id);
        }
      })
      .catch(() => {
        if (isMounted) setProjectTasks([]);
      })
      .finally(() => {
        if (isMounted) setTasksLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedProjectId, channelType]);

  const activeChannelId = channelType === 'project' ? selectedProjectId : selectedTaskId;
  const { messages, loading: messagesLoading, error: messagesError, sendMessage } = useMessages(
    channelType,
    activeChannelId
  );

  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const currentProject = projects.find(
    (p) => (p._id || p.id) === selectedProjectId
  );
  const currentTask = projectTasks.find(
    (t) => (t._id || t.id) === selectedTaskId
  );

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || sending || !activeChannelId) return;

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
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Direct collaborative channels with your project developers. Messages are isolated per project and auto-expire after 10 days.
          </p>
        </div>

        {/* 10-day Notice Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono shrink-0">
          <ClockIcon className="w-3.5 h-3.5" />
          <span>10-Day Auto-Vanishing Active</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-[#222222] bg-[#0A0A0A] overflow-hidden min-h-[600px] shadow-2xl">
        {/* Left Sidebar: Projects & Channels */}
        <div className="lg:col-span-4 border-r border-[#222222] flex flex-col bg-[#070707]">
          {/* Projects Selector Header */}
          <div className="p-4 border-b border-[#1A1A1A] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-[#AAAAAA] uppercase">
                Your Projects ({projects.length})
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#141414] border border-[#262626] text-[#777777]">
                Manager Console
              </span>
            </div>

            {/* Project dropdown or list */}
            {projects.length > 0 ? (
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setChannelType('project');
                }}
                className="w-full bg-[#111111] border border-[#262626] text-white text-xs font-mono rounded-xl p-2.5 outline-none focus:border-white transition-colors"
              >
                {projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.name} ({p.members?.length || 0} devs)
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-xs text-[#666666] font-mono">No created projects found.</div>
            )}
          </div>

          {/* Channel Type Selector: Project Room vs Task Threads */}
          <div className="p-2 border-b border-[#1A1A1A] flex gap-1 bg-[#090909]">
            <button
              onClick={() => setChannelType('project')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                channelType === 'project'
                  ? 'bg-white text-black shadow'
                  : 'text-[#888888] hover:text-white hover:bg-[#141414]'
              }`}
            >
              <FolderIcon className="w-3.5 h-3.5" />
              <span>Project Room</span>
            </button>
            <button
              onClick={() => {
                setChannelType('task');
                if (projectTasks.length > 0 && !selectedTaskId) {
                  setSelectedTaskId(projectTasks[0]._id || projectTasks[0].id);
                }
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                channelType === 'task'
                  ? 'bg-white text-black shadow'
                  : 'text-[#888888] hover:text-white hover:bg-[#141414]'
              }`}
            >
              <TaskCheckIcon className="w-3.5 h-3.5" />
              <span>Task Chats ({projectTasks.length})</span>
            </button>
          </div>

          {/* Sub-channel List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[450px]">
            {projectsLoading ? (
              <div className="p-4 text-center text-xs text-[#666666] font-mono">Loading projects...</div>
            ) : channelType === 'project' ? (
              currentProject ? (
                <div className="p-3.5 rounded-xl border border-white/20 bg-[#161616] text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white text-black font-bold flex items-center justify-center shrink-0">
                      <FolderIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white truncate">{currentProject.name}</div>
                      <div className="text-[10px] font-mono text-[#888888] mt-0.5">
                        {currentProject.members?.length || 0} Assigned Developers
                      </div>
                    </div>
                  </div>

                  {/* Project Member Badges */}
                  {currentProject.members && currentProject.members.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#222222]">
                      <div className="text-[10px] font-mono uppercase text-[#777777] mb-1.5">
                        Assigned Devs:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {currentProject.members.map((m, idx) => {
                          const mName = typeof m === 'object' ? m.name || m.email : `Developer #${idx + 1}`;
                          return (
                            <span
                              key={m._id || m.id || idx}
                              className="px-2 py-0.5 rounded-md bg-[#202020] text-[10px] font-mono text-[#CCCCCC] border border-[#2D2D2D]"
                            >
                              {mName}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : null
            ) : (
              /* Task Chats List */
              tasksLoading ? (
                <div className="p-4 text-center text-xs text-[#666666] font-mono">Loading tasks...</div>
              ) : projectTasks.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#666666] font-mono">
                  No tasks created in this project yet.
                </div>
              ) : (
                projectTasks.map((t) => {
                  const tId = t._id || t.id;
                  const isSelected = selectedTaskId === tId;
                  const devName = t.assignedTo?.name || 'Unassigned';

                  return (
                    <button
                      key={tId}
                      onClick={() => setSelectedTaskId(tId)}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-[#1A1A1A] border border-[#3A3A3A] shadow'
                          : 'hover:bg-[#121212] border border-transparent text-[#888888]'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white text-black'
                            : 'bg-[#141414] border border-[#262626] text-[#666666]'
                        }`}
                      >
                        <TaskCheckIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#AAAAAA]'}`}>
                          {t.title}
                        </div>
                        <div className="text-[10px] font-mono text-[#666666] truncate mt-0.5 flex items-center gap-1.5">
                          <UserIcon className="w-2.5 h-2.5" />
                          <span>{devName}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Right Column: Chat Feed & Composer */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-[#0A0A0A]">
          {activeChannelId ? (
            <>
              {/* Active Channel Header */}
              <div className="p-4 border-b border-[#1C1C1C] bg-[#0C0C0C] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-white">
                    {channelType === 'project' ? (
                      <FolderIcon className="w-4 h-4" />
                    ) : (
                      <TaskCheckIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wide truncate max-w-sm sm:max-w-md">
                      {channelType === 'project'
                        ? currentProject?.name || 'Project Channel'
                        : currentTask?.title || 'Task Thread'}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-mono text-[#777777] uppercase">
                        {channelType === 'project' ? 'Project Broadcaster' : `Task with ${currentTask?.assignedTo?.name || 'Developer'}`}
                      </span>
                      <span className="text-[10px] font-mono text-amber-500/80">
                        • 10d auto-retention
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
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-h-[420px]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-[#222222] flex items-center justify-center text-xl mb-3">
                      💬
                    </div>
                    <p className="text-xs font-mono font-bold text-[#AAAAAA] uppercase">
                      No Messages In This Channel
                    </p>
                    <p className="text-[11px] text-[#666666] mt-1 max-w-xs">
                      Send a message below to start collaborating with your assigned project developers.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine =
                      (msg.sender?._id && user?._id && msg.sender._id === user._id) ||
                      msg.sender === user?._id ||
                      (msg.sender?.role === 'MANAGER' && msg.sender?.email === user?.email);
                    const senderName = msg.sender?.name || (isMine ? 'You (Manager)' : 'Developer');
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
                    placeholder={`Message ${channelType === 'project' ? 'all project developers' : (currentTask?.assignedTo?.name || 'developer')}... (Press Enter)`}
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
                title="SELECT A PROJECT CHANNEL"
                description="Select a project or task to view and participate in project developer conversations."
                className="border-0 bg-transparent"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
