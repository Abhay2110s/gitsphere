import React, { useState } from 'react';
import DeveloperSidebar from './DeveloperSidebar';
import DeveloperHeader from './DeveloperHeader';

export default function DeveloperLayout({
  currentRoute = 'dashboard',
  onNavigate,
  onLogout,
  unreadNotificationsCount = 0,
  user = null,
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex font-sans selection:bg-white selection:text-black">
      {/* SIDEBAR - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0A0A0A] border-r border-[#222222] shrink-0 sticky top-0 h-screen select-none">
        <DeveloperSidebar
          currentRoute={currentRoute}
          onNavigate={onNavigate}
          onLogout={onLogout}
          unreadNotificationsCount={unreadNotificationsCount}
          user={user}
        />
      </aside>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-[#0A0A0A] border-r border-[#222222] h-full flex flex-col z-10">
            <DeveloperSidebar
              currentRoute={currentRoute}
              onNavigate={onNavigate}
              onLogout={onLogout}
              unreadNotificationsCount={unreadNotificationsCount}
              user={user}
              isMobile
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        <DeveloperHeader
          currentRoute={currentRoute}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNewContribution={() => onNavigate && onNavigate('contributions')}
          onOpenNotifications={() => onNavigate && onNavigate('notifications')}
          unreadNotificationsCount={unreadNotificationsCount}
          user={user}
        />

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
