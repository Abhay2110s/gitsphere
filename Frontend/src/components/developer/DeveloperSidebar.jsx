import React from 'react';
import {
  GitSphereLogo,
  ActivityIcon,
  FolderIcon,
  TaskCheckIcon,
  LayersIcon,
  CodeIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  MessageIcon,
  BellIcon,
  SettingsIcon,
  CloseIcon,
} from '../common/Icons';

const DEVELOPER_NAV_ITEMS = [
  { id: 'dashboard', name: 'Dashboard', icon: ActivityIcon, path: '/developer' },
  { id: 'projects', name: 'Projects', icon: FolderIcon, path: '/developer/projects' },
  { id: 'tasks', name: 'Tasks', icon: TaskCheckIcon, path: '/developer/tasks' },
  { id: 'workspace', name: 'Workspace', icon: LayersIcon, path: '/developer/workspace' },
  { id: 'code', name: 'Code Editor', icon: CodeIcon, path: '/developer/code' },
  { id: 'contributions', name: 'Contributions', icon: GitCommitIcon, path: '/developer/contributions' },
  { id: 'reviews', name: 'Reviews', icon: GitPullRequestIcon, path: '/developer/reviews' },
  { id: 'messages', name: 'Messages', icon: MessageIcon, path: '/developer/messages' },
  { id: 'notifications', name: 'Notifications', icon: BellIcon, path: '/developer/notifications' },
  { id: 'settings', name: 'Settings', icon: SettingsIcon, path: '/developer/settings' },
];

export default function DeveloperSidebar({
  currentRoute = 'dashboard',
  onNavigate,
  onLogout,
  unreadNotificationsCount = 0,
  hasUnreadMessages = false,
  user = null,
  isMobile = false,
  onCloseMobile,
}) {
  const userName = user?.name || user?.username || 'Developer';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleItemClick = (id) => {
    if (onNavigate) {
      onNavigate(id);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-[#0A0A0A] border-r border-[#222222] select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1A1A1A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black border border-[#333333] flex items-center justify-center text-white">
            <GitSphereLogo className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              GitSphere
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#1C1C1C] border border-[#333333] text-white rounded font-semibold">
                DEV
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#666666]">
              developer workspace
            </div>
          </div>
        </div>

        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#141414] cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List - Exact 10 items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555]">
          Developer Navigation
        </div>
        {DEVELOPER_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.id;
          const hasBadge = item.id === 'notifications' && unreadNotificationsCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-[#888888] hover:text-white hover:bg-[#141414]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#666666]'}`} />
                <span>{item.name}</span>
              </div>
              {item.id === 'messages' && hasUnreadMessages && (
                <span className="relative flex h-2 w-2" title="New unread messages">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.9)]"></span>
                </span>
              )}
              {hasBadge && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Card in Sidebar Footer */}
      <div className="p-4 border-t border-[#1A1A1A] bg-[#070707]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center text-xs font-bold text-white shrink-0">
              {userInitial}
            </div>
            <div className="truncate min-w-0">
              <div className="text-xs font-bold text-white truncate">{userName}</div>
              <div className="text-[10px] font-mono text-[#666666] truncate">
                {user?.email || 'developer'}
              </div>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Logout"
              className="text-[10px] font-mono text-[#888888] hover:text-white px-2 py-1 rounded hover:bg-[#1A1A1A] transition-colors cursor-pointer shrink-0"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return content;
}
