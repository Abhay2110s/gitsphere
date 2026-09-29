import React, { useState } from 'react';
import EmptyState from '../../components/workspace/EmptyState';
import { TableSkeleton } from '../../components/workspace/SkeletonLoaders';
import {
  ActivityIcon,
  TaskCheckIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  UsersIcon,
  FolderIcon,
  TagIcon,
  FileIcon,
  MessageIcon,
} from '../../components/common/Icons';

const ACTIVITY_ICONS = {
  task_created: TaskCheckIcon,
  task_assigned: TaskCheckIcon,
  task_completed: TaskCheckIcon,
  contribution_submitted: GitCommitIcon,
  contribution_approved: GitCommitIcon,
  review_created: GitPullRequestIcon,
  member_added: UsersIcon,
  file_created: FileIcon,
  file_updated: FileIcon,
  version_created: TagIcon,
  comment_added: MessageIcon,
};

const FILTER_TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'TASKS', label: 'Tasks' },
  { id: 'CODE', label: 'Code' },
  { id: 'REVIEWS', label: 'Reviews' },
  { id: 'TEAM', label: 'Team' },
  { id: 'FILES', label: 'Files' },
  { id: 'VERSIONS', label: 'Versions' },
];

function matchesFilter(item, filter) {
  if (filter === 'ALL') return true;
  const type = (item.type || item.action || '').toLowerCase();
  const map = {
    TASKS: ['task'],
    CODE: ['contribution', 'commit', 'code'],
    REVIEWS: ['review'],
    TEAM: ['member', 'user', 'team'],
    FILES: ['file'],
    VERSIONS: ['version'],
  };
  return (map[filter] || []).some((k) => type.includes(k));
}

export default function Activity({ activity = [], loading }) {
  const [filter, setFilter] = useState('ALL');

  if (loading) return <TableSkeleton rows={5} />;

  const filtered = activity.filter((item) => matchesFilter(item, filter));

  const formatRelativeDate = (d) => {
    if (!d) return '';
    const now = new Date();
    const date = new Date(d);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const groupByDate = (items) => {
    const groups = {};
    items.forEach((item) => {
      const date = item.createdAt
        ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : 'Unknown';
      if (!groups[date]) groups[date] = [];
      groups[date].push(item);
    });
    return groups;
  };

  const grouped = groupByDate(filtered);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black tracking-tight text-white">Activity</h1>
        <p className="text-xs font-mono text-[#666666] mt-1">
          {activity.length} event{activity.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-[#1A1A1A] overflow-x-auto no-scrollbar">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-2 text-xs font-bold transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
              filter === tab.id
                ? 'text-white border-white'
                : 'text-[#666666] border-transparent hover:text-[#AAAAAA]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {activity.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="No activity yet"
          description="Project events will appear here as your team works."
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-xs text-[#666666] font-mono">
          No activity matches this filter.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-4">
                {date}
              </div>
              <div className="space-y-0 border-l border-[#1A1A1A] ml-2">
                {items.map((item, i) => {
                  const type = (item.type || item.action || '').toLowerCase().replace(/\s+/g, '_');
                  const IconComponent = ACTIVITY_ICONS[type] || ActivityIcon;
                  return (
                    <div key={item._id || i} className="flex items-start gap-4 pl-6 py-3 relative">
                      <div className="absolute left-[-5px] top-4 w-2.5 h-2.5 rounded-full bg-[#333333] border-2 border-[#0A0A0A]" />
                      <div className="w-7 h-7 rounded-lg bg-[#141414] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                        <IconComponent className="w-3.5 h-3.5 text-[#666666]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white">
                          {item.message || item.action || 'Activity event'}
                        </p>
                        {item.description && (
                          <p className="text-[10px] text-[#666666] mt-0.5">{item.description}</p>
                        )}
                        <p className="text-[10px] font-mono text-[#555555] mt-1">
                          {formatRelativeDate(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
