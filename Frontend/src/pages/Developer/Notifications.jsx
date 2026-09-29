import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import PageHeader from '../../components/developer/PageHeader';
import NotificationItem from '../../components/developer/NotificationItem';
import EmptyState from '../../components/developer/EmptyState';
import ErrorState from '../../components/developer/ErrorState';
import { CardSkeleton } from '../../components/developer/LoadingSkeleton';
import { BellIcon, CheckIcon } from '../../components/common/Icons';

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <PageHeader
        title="Notifications"
        description="Real-time updates regarding task assignments, review evaluations, and project milestones."
        actions={
          unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#333333] hover:border-white text-xs font-mono font-bold text-white transition-colors cursor-pointer"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )
        }
      />

      {/* Filter Tabs */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-2 border-b border-[#1C1C1C] pb-2 text-xs font-mono">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filter === 'ALL'
                ? 'bg-white text-black font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filter === 'UNREAD'
                ? 'bg-white text-black font-bold'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      )}

      {loading ? (
        <CardSkeleton count={3} />
      ) : error ? (
        <ErrorState
          title="Failed to load notifications"
          message={error.message || 'Could not fetch notifications from the server.'}
          onRetry={refetch}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={BellIcon}
          title="NO NOTIFICATIONS"
          description="You are completely caught up. When someone assigns you a task, reviews a contribution, or messages you, notifications will show here."
        />
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          icon={BellIcon}
          title="NO UNREAD NOTIFICATIONS"
          description="All notifications have been reviewed."
          actionLabel="Show All Notifications"
          onAction={() => setFilter('ALL')}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <NotificationItem
              key={notif._id || notif.id}
              notification={notif}
              onMarkRead={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
