import React from 'react';
import { BellIcon, CheckIcon } from '../common/Icons';

export default function NotificationItem({ notification, onMarkRead }) {
  if (!notification) return null;

  const isUnread = !notification.isRead;
  const dateFormatted = notification.createdAt
    ? new Date(notification.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
        isUnread
          ? 'bg-[#111111] border-[#333333]'
          : 'bg-[#0A0A0A] border-[#1C1C1C] opacity-80'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
            isUnread
              ? 'bg-white text-black'
              : 'bg-[#181818] border border-[#2A2A2A] text-[#888888]'
          }`}
        >
          <BellIcon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`text-xs font-bold truncate ${
                isUnread ? 'text-white' : 'text-[#AAAAAA]'
              }`}
            >
              {notification.title || 'System Notification'}
            </h4>
            {notification.type && (
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#181818] border border-[#2A2A2A] text-[#888888]">
                {notification.type}
              </span>
            )}
          </div>
          {notification.message && (
            <p className="text-xs text-[#888888] mt-1 leading-relaxed">
              {notification.message}
            </p>
          )}
          <span className="text-[10px] font-mono text-[#555555] block mt-1.5">
            {dateFormatted}
          </span>
        </div>
      </div>

      {isUnread && onMarkRead && (
        <button
          onClick={() => onMarkRead(notification._id || notification.id)}
          title="Mark as read"
          className="p-1.5 rounded-lg border border-[#333333] hover:border-white text-[#888888] hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <CheckIcon className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
