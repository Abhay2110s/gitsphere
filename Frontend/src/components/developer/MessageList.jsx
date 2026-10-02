import React from 'react';

export default function MessageList({ messages = [], currentUserId }) {
  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#666666]">
        <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center text-[#888888] mb-3">
          💬
        </div>
        <p className="text-xs font-mono">No messages yet.</p>
        <p className="text-[11px] text-[#555555] mt-1">Start the conversation below.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg, index) => {
        const isMine =
          (msg.sender?._id && currentUserId && msg.sender._id === currentUserId) ||
          (msg.sender === currentUserId);
        const role = msg.sender?.role || (isMine ? 'USER' : 'MANAGER');
        const senderName = msg.sender?.name || (isMine ? 'You' : (role === 'MANAGER' ? 'Project Manager' : 'Developer'));
        const timeFormatted = msg.createdAt
          ? new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '';

        return (
          <div
            key={msg._id || msg.id || index}
            className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[10px] font-mono font-bold text-[#777777]">
                {senderName}
              </span>
              <span
                className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                  role === 'MANAGER'
                    ? 'bg-purple-950/40 text-purple-400 border-purple-800/40'
                    : 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                }`}
              >
                {role === 'MANAGER' ? 'MGR' : 'DEV'}
              </span>
              <span className="text-[10px] font-mono text-[#555555]">
                {timeFormatted}
              </span>
            </div>
            <div
              className={`max-w-md px-3.5 py-2 rounded-xl text-xs leading-relaxed break-words ${
                isMine
                  ? 'bg-white text-black font-medium rounded-br-none shadow'
                  : 'bg-[#141414] border border-[#262626] text-[#E0E0E0] rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
