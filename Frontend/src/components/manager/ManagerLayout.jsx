import React, { useState } from 'react';
import {
  GitSphereLogo,
  ActivityIcon,
  FolderIcon,
  TaskCheckIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  UsersIcon,
  MessageIcon,
  BellIcon,
  SettingsIcon,
  MenuIcon,
  CloseIcon,
} from '../common/Icons';

export default function ManagerLayout({
  currentRoute = 'dashboard',
  onNavigate,
  onLogout,
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: ActivityIcon, path: '/manager/dashboard' },
    { id: 'projects', name: 'Projects', icon: FolderIcon, path: '/manager/projects' },
    { id: 'tasks', name: 'Tasks', icon: TaskCheckIcon, path: '/manager/tasks' },
    { id: 'contributions', name: 'Contributions', icon: GitCommitIcon, path: '/manager/contributions' },
    { id: 'reviews', name: 'Reviews', icon: GitPullRequestIcon, path: '/manager/reviews' },
    { id: 'team', name: 'Team', icon: UsersIcon, path: '/manager/team' },
    { id: 'messages', name: 'Messages', icon: MessageIcon, path: '/manager/messages' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, path: '/manager/notifications' },
    { id: 'settings', name: 'Settings', icon: SettingsIcon, path: '/manager/settings' },
  ];

  const handleNavClick = (id) => {
    if (onNavigate) {
      onNavigate(id);
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex font-sans selection:bg-white selection:text-black">
      {/* SIDEBAR - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0A0A0A] border-r border-[#222222] shrink-0 sticky top-0 h-screen select-none">
        {/* Workspace Brand / Header */}
        <div className="p-5 border-b border-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black border border-[#333333] flex items-center justify-center text-white">
              <GitSphereLogo className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                GitSphere
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#222222] text-[#AAAAAA] rounded font-semibold">
                  MGR
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#666666]">
                primary workspace
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555]">
            Management
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-bold shadow'
                    : 'text-[#888888] hover:text-white hover:bg-[#141414]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#666666]'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card in Sidebar Footer */}
        <div className="p-4 border-t border-[#1A1A1A] bg-[#070707]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center text-xs font-bold text-white shrink-0">
                M
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate">Manager Account</div>
                <div className="text-[10px] font-mono text-[#666666] truncate">fresh workspace</div>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Exit to Landing"
                className="text-[10px] font-mono text-[#888888] hover:text-white px-2 py-1 rounded hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                Exit
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#0A0A0A] border-r border-[#222222] h-full flex flex-col z-10">
            <div className="p-4 border-b border-[#222222] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitSphereLogo className="w-6 h-6 text-white" />
                <span className="font-bold text-sm">GitSphere Manager</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-[#888888] hover:text-white"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-white text-black font-bold'
                        : 'text-[#888888] hover:text-white hover:bg-[#141414]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-16 border-b border-[#222222] bg-[#070707]/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#888888] hover:text-white hover:bg-[#141414]"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
              <span className="text-[#555555]">manager</span>
              <span>/</span>
              <span className="text-white font-bold capitalize">{currentRoute}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => handleNavClick('notifications')}
              className="p-2 rounded-lg border border-[#222222] bg-[#0F0F0F] text-[#888888] hover:text-white hover:border-[#333333] transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <BellIcon className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#555555]" />
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
