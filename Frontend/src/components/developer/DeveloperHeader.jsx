import React from 'react';
import { MenuIcon, PlusIcon, BellIcon } from '../common/Icons';

export default function DeveloperHeader({
  currentRoute = 'dashboard',
  onOpenMobileMenu,
  onNewContribution,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  user = null,
}) {
  const userName = user?.name || user?.username || 'Developer';

  return (
    <header className="h-16 border-b border-[#222222] bg-[#070707]/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#888888] hover:text-white hover:bg-[#141414] cursor-pointer"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
          <span className="text-[#555555]">developer</span>
          <span>/</span>
          <span className="text-white font-bold capitalize">{currentRoute.replace('-', ' ')}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {onNewContribution && (
          <button
            onClick={onNewContribution}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Contribution</span>
            <span className="sm:hidden">Submit</span>
          </button>
        )}

        <button
          onClick={onOpenNotifications}
          className="p-2 rounded-lg border border-[#222222] bg-[#0F0F0F] text-[#888888] hover:text-white hover:border-[#333333] transition-colors relative cursor-pointer"
          title="Notifications"
        >
          <BellIcon className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white animate-pulse" />
          )}
        </button>

        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#222222]">
          <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center text-xs font-bold text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-[#AAAAAA] max-w-[120px] truncate">
            {userName}
          </span>
        </div>
      </div>
    </header>
  );
}
