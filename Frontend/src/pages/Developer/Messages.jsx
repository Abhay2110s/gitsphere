import React, { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import { useMessages } from '../../hooks/useMessages';
import PageHeader from '../../components/developer/PageHeader';
import MessageList from '../../components/developer/MessageList';
import MessageComposer from '../../components/developer/MessageComposer';
import EmptyState from '../../components/developer/EmptyState';
import { MessageIcon, FolderIcon, TaskCheckIcon } from '../../components/common/Icons';

export default function Messages() {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const [channelType, setChannelType] = useState('project'); // 'project' | 'task'
  const [selectedChannelId, setSelectedChannelId] = useState('');

  const effectiveChannelId =
    selectedChannelId ||
    (channelType === 'project'
      ? (projects.length > 0 ? projects[0]._id || projects[0].id : '')
      : (tasks.length > 0 ? tasks[0]._id || tasks[0].id : ''));

  const { messages, loading, error, refetch, sendMessage } = useMessages(
    channelType,
    effectiveChannelId
  );

  const activeChannelName =
    channelType === 'project'
      ? projects.find((p) => (p._id || p.id) === effectiveChannelId)?.name || 'Project Channel'
      : tasks.find((t) => (t._id || t.id) === effectiveChannelId)?.title || 'Task Channel';

  const channelsList = channelType === 'project' ? projects : tasks;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Developer Messages"
        description="Collaborative communication with managers and team members organized by project and task tickets."
      />

      <div className="border border-[#222222] rounded-2xl overflow-hidden bg-[#0A0A0A] grid grid-cols-1 lg:grid-cols-12 min-h-[550px]">
        {/* Left Column: Channels */}
        <div className="lg:col-span-4 border-r border-[#222222] bg-[#070707] flex flex-col">
          {/* Channel Type Toggle */}
          <div className="p-3 border-b border-[#1C1C1C] flex gap-1">
            <button
              onClick={() => {
                setChannelType('project');
                setSelectedChannelId(projects[0]?._id || projects[0]?.id || '');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                channelType === 'project'
                  ? 'bg-white text-black'
                  : 'text-[#888888] hover:text-white hover:bg-[#141414]'
              }`}
            >
              <FolderIcon className="w-3.5 h-3.5" />
              <span>Projects ({projects.length})</span>
            </button>
            <button
              onClick={() => {
                setChannelType('task');
                setSelectedChannelId(tasks[0]?._id || tasks[0]?.id || '');
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                channelType === 'task'
                  ? 'bg-white text-black'
                  : 'text-[#888888] hover:text-white hover:bg-[#141414]'
              }`}
            >
              <TaskCheckIcon className="w-3.5 h-3.5" />
              <span>Tasks ({tasks.length})</span>
            </button>
          </div>

          {/* Channels List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {channelsList.length === 0 ? (
              <p className="text-xs text-[#666666] font-mono p-4 text-center">
                No active {channelType}s yet.
              </p>
            ) : (
              channelsList.map((item) => {
                const itemId = item._id || item.id;
                const isSelected = effectiveChannelId === itemId;
                const title = item.name || item.title;

                return (
                  <button
                    key={itemId}
                    onClick={() => setSelectedChannelId(itemId)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#181818] border border-[#333333]'
                        : 'hover:bg-[#111111] text-[#888888]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white text-black'
                          : 'bg-[#141414] border border-[#222222] text-[#666666]'
                      }`}
                    >
                      {channelType === 'project' ? (
                        <FolderIcon className="w-3.5 h-3.5" />
                      ) : (
                        <TaskCheckIcon className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-white' : 'text-[#AAAAAA]'
                        }`}
                      >
                        {title}
                      </div>
                      <div className="text-[10px] font-mono text-[#555555] uppercase mt-0.5">
                        {channelType} channel
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
          {effectiveChannelId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#1C1C1C] bg-[#0C0C0C] flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wide truncate">
                    {activeChannelName}
                  </h3>
                  <span className="text-[10px] font-mono text-[#666666] uppercase">
                    {channelType} message stream
                  </span>
                </div>
                {loading && (
                  <span className="text-[10px] font-mono text-[#888888]">Loading...</span>
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
              <MessageComposer onSend={sendMessage} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <EmptyState
                icon={MessageIcon}
                title="NO CONVERSATION SELECTED"
                description="Select a project or task from the sidebar to view messages and collaborate."
                className="border-0 bg-transparent"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
