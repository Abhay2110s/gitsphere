import React, { useState } from 'react';
import EmptyState from '../../components/manager/EmptyState';
import { MessageIcon } from '../../components/common/Icons';

export default function Messages() {
  const [conversations] = useState([]); // dynamic empty array
  const [selectedConversation] = useState(null);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-[#1F1F1F]">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          MESSAGES
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#888888]">
          Direct messaging and collaborative discussion threads with project contributors.
        </p>
      </div>

      {/* Messages Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-[#222222] bg-[#0A0A0A] overflow-hidden min-h-[560px]">
        {/* Left Column: Conversation List */}
        <div className="lg:col-span-4 border-r border-[#222222] flex flex-col bg-[#070707]">
          <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider text-[#AAAAAA] uppercase">
              Conversations
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[#888888]">
              {conversations.length} Conversations
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center p-6">
            {conversations.length === 0 ? (
              <EmptyState
                icon={MessageIcon}
                title="NO CONVERSATIONS"
                description="Your conversations with team members will appear here."
                className="border-0 bg-transparent py-8"
              />
            ) : (
              <div className="space-y-2">
                {conversations.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg border border-[#222222] bg-[#111111] text-xs">
                    {c.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Main Message Chat Panel */}
        <div className="lg:col-span-8 flex flex-col justify-center items-center p-8 bg-[#0A0A0A] text-center">
          {selectedConversation ? (
            <div className="w-full h-full flex flex-col">
              {/* Chat thread */}
            </div>
          ) : (
            <EmptyState
              icon={MessageIcon}
              title="SELECT A CONVERSATION"
              description="Choose a conversation to start messaging."
              className="border-0 bg-transparent py-12"
            />
          )}
        </div>
      </div>
    </div>
  );
}
