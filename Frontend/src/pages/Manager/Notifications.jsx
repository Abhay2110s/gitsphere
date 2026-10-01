import React, { useState, useMemo } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import EmptyState from '../../components/manager/EmptyState';
import StatCard from '../../components/manager/StatCard';
import {
  BellIcon,
  CheckIcon,
  GitCommitIcon,
  TaskCheckIcon,
  FolderIcon,
  UsersIcon,
  TrashIcon,
} from '../../components/common/Icons';

export default function Notifications({ onNavigateToSection }) {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('All');

  const tabs = [
    { id: 'All', label: 'All', count: notifications.length },
    { id: 'Unread', label: 'Unread', count: unreadCount },
    {
      id: 'Submissions',
      label: 'Submissions',
      count: notifications.filter((n) => n.type === 'CODE_SUBMITTED').length,
    },
    {
      id: 'Tasks',
      label: 'Tasks',
      count: notifications.filter((n) =>
        ['TASK_STATUS_CHANGED', 'TASK_ASSIGNED', 'TASK_UPDATED'].includes(n.type)
      ).length,
    },
    {
      id: 'Reviews',
      label: 'Reviews',
      count: notifications.filter((n) =>
        ['CODE_REVIEWED', 'CODE_APPROVED', 'CHANGES_REQUESTED_NOTIFICATION'].includes(n.type)
      ).length,
    },
  ];

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === 'Unread') return !n.isRead;
      if (activeTab === 'Submissions') return n.type === 'CODE_SUBMITTED';
      if (activeTab === 'Tasks')
        return ['TASK_STATUS_CHANGED', 'TASK_ASSIGNED', 'TASK_UPDATED'].includes(n.type);
      if (activeTab === 'Reviews')
        return ['CODE_REVIEWED', 'CODE_APPROVED', 'CHANGES_REQUESTED_NOTIFICATION'].includes(n.type);
      return true;
    });
  }, [notifications, activeTab]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'CODE_SUBMITTED':
        return {
          label: 'Code Submission',
          className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: GitCommitIcon,
        };
      case 'TASK_STATUS_CHANGED':
        return {
          label: 'Status Change',
          className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          icon: TaskCheckIcon,
        };
      case 'CODE_APPROVED':
        return {
          label: 'Approved',
          className: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
          icon: CheckIcon,
        };
      case 'CHANGES_REQUESTED_NOTIFICATION':
        return {
          label: 'Changes Requested',
          className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: BellIcon,
        };
      case 'MEMBER_ADDED':
        return {
          label: 'Team',
          className: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: UsersIcon,
        };
      default:
        return {
          label: type || 'Alert',
          className: 'bg-[#222222] text-[#AAAAAA] border-[#333333]',
          icon: BellIcon,
        };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            NOTIFICATIONS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Real-time activity alerts, code submissions, and team milestone events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black hover:bg-[#E5E5E5] text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#222222] bg-[#0F0F0F] hover:border-[#444444] text-xs font-mono text-[#AAAAAA] hover:text-white transition-colors cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Notifications"
          value={notifications.length}
          subtext="Lifetime activity alerts"
          icon={BellIcon}
          isLoading={loading}
        />
        <StatCard
          label="Unread Alerts"
          value={unreadCount}
          subtext={unreadCount > 0 ? 'Requires attention' : 'All alerts caught up'}
          icon={BellIcon}
          isLoading={loading}
        />
        <StatCard
          label="Code Submissions"
          value={notifications.filter((n) => n.type === 'CODE_SUBMITTED').length}
          subtext="Awaiting review or triage"
          icon={GitCommitIcon}
          isLoading={loading}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222222] overflow-x-auto no-scrollbar pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-[#888888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'bg-[#1C1C1C] text-[#888888]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && notifications.length === 0 ? (
          <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-12 text-center text-xs font-mono text-[#666666] animate-pulse">
            Loading notifications...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center text-xs font-mono text-red-400">
            Failed to load notifications: {error.message || 'Server error'}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-12">
            <EmptyState
              icon={BellIcon}
              title={
                activeTab === 'Unread'
                  ? "YOU'RE ALL CAUGHT UP"
                  : 'NO NOTIFICATIONS FOUND'
              }
              description={
                activeTab === 'Unread'
                  ? 'There are no unread notifications.'
                  : 'No notification records match this filter.'
              }
              className="border-0 bg-transparent py-6"
            />
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const badge = getTypeBadge(notif.type);
            const BadgeIcon = badge.icon;
            const isUnread = !notif.isRead;
            const dateFormatted = notif.createdAt
              ? new Date(notif.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div
                key={notif._id || notif.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-[#121212] border-[#333333] shadow-md shadow-black/50'
                    : 'bg-[#0A0A0A] border-[#1C1C1C] opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      isUnread
                        ? 'bg-white text-black border-white'
                        : 'bg-[#141414] text-[#888888] border-[#222222]'
                    }`}
                  >
                    <BadgeIcon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-bold truncate ${
                          isUnread ? 'text-white' : 'text-[#CCCCCC]'
                        }`}
                      >
                        {notif.title || 'Notification'}
                      </h4>

                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${badge.className}`}
                      >
                        {badge.label}
                      </span>

                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </div>

                    {notif.message && (
                      <p className="text-xs text-[#999999] leading-relaxed">
                        {notif.message}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-[#666666]">
                      {notif.project?.name && (
                        <span className="flex items-center gap-1 text-[#888888]">
                          <FolderIcon className="w-3 h-3 text-[#555555]" />
                          <span>{notif.project.name}</span>
                        </span>
                      )}

                      {notif.task?.title && (
                        <span className="flex items-center gap-1 text-[#888888]">
                          <TaskCheckIcon className="w-3 h-3 text-[#555555]" />
                          <span className="truncate max-w-[200px]">{notif.task.title}</span>
                        </span>
                      )}

                      {dateFormatted && <span>{dateFormatted}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  {isUnread && (
                    <button
                      onClick={() => markAsRead(notif._id || notif.id)}
                      title="Mark as read"
                      className="p-2 rounded-lg border border-[#222222] bg-[#141414] hover:border-white text-[#888888] hover:text-white transition-colors cursor-pointer"
                    >
                      <CheckIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {deleteNotification && (
                    <button
                      onClick={() => deleteNotification(notif._id || notif.id)}
                      title="Delete notification"
                      className="p-2 rounded-lg border border-[#222222] bg-[#141414] hover:border-red-500 hover:text-red-400 text-[#666666] transition-colors cursor-pointer"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
