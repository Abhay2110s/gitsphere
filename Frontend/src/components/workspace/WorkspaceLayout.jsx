import React, { useState } from 'react';
import {
  GitSphereLogo,
  ActivityIcon,
  FolderIcon,
  CodeIcon,
  TaskCheckIcon,
  GitPullRequestIcon,
  UsersIcon,
  TagIcon,
  EyeIcon,
  MenuIcon,
  CloseIcon,
  ChevronRightIcon,
  HomeIcon,
} from '../common/Icons';

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',     icon: EyeIcon },
  { id: 'files',       label: 'Files',        icon: FolderIcon },
  { id: 'editor',      label: 'Code Editor',  icon: CodeIcon },
  { id: 'tasks',       label: 'Tasks',        icon: TaskCheckIcon },
  { id: 'reviews',     label: 'Code Review',  icon: GitPullRequestIcon },
  { id: 'team',        label: 'Team',         icon: UsersIcon },
  { id: 'activity',    label: 'Activity',     icon: ActivityIcon },
  { id: 'versions',    label: 'Versions',     icon: TagIcon },
];

export default function WorkspaceLayout({
  currentSection = 'overview',
  onNavigate,
  project = null,
  onBack,
  children,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (id) => {
    onNavigate?.(id);
    setMobileMenuOpen(false);
  };

  const projectName = project?.name || 'No Project Selected';

  return (
    <div className="min-h-screen bg-[#000000] text-white flex font-sans selection:bg-white selection:text-black">
      {/* SIDEBAR — Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0A0A0A] border-r border-[#222222] shrink-0 sticky top-0 h-screen select-none">
        {/* Brand */}
        <div className="p-5 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-black border border-[#333333] flex items-center justify-center text-white">
              <GitSphereLogo className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                GitSphere
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#222222] text-[#AAAAAA] rounded font-semibold">
                  WS
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#666666] truncate max-w-[160px]">
                {projectName.toLowerCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555]">
            Project Workspace
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black font-bold shadow'
                    : 'text-[#888888] hover:text-white hover:bg-[#141414]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#666666]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Back to projects */}
        <div className="p-4 border-t border-[#1A1A1A] bg-[#070707]">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#888888] hover:text-white hover:bg-[#141414] transition-colors cursor-pointer"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>
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
                <span className="font-bold text-sm">Workspace</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-[#888888] hover:text-white"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive
                        ? 'bg-white text-black font-bold'
                        : 'text-[#888888] hover:text-white hover:bg-[#141414]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="h-16 border-b border-[#222222] bg-[#070707]/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#888888] hover:text-white hover:bg-[#141414]"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
              <span className="text-[#555555]">workspace</span>
              <ChevronRightIcon className="w-3 h-3 text-[#555555]" />
              <span className="text-white font-bold capitalize">{currentSection}</span>
            </div>
          </div>

          {project && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-mono text-[#666666]">{project.status || 'active'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#444444]" />
            </div>
          )}
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
