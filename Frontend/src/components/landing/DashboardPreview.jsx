import React, { useState } from 'react';
import {
  GitSphereLogo,
  GitBranchIcon,
  GitPullRequestIcon,
  GitCommitIcon,
  LayersIcon,
  UsersIcon,
  TaskCheckIcon,
  CheckIcon,
  ActivityIcon,
} from '../common/Icons';

export default function DashboardPreview() {
  const [activeTab, setActiveTab] = useState('Projects');
  const [activeFilter, setActiveFilter] = useState('All');

  const sidebarItems = [
    { name: 'Home', icon: ActivityIcon },
    { name: 'Projects', icon: LayersIcon },
    { name: 'Tasks', icon: TaskCheckIcon },
    { name: 'Code', icon: GitBranchIcon },
    { name: 'Reviews', icon: GitPullRequestIcon },
    { name: 'Team', icon: UsersIcon },
  ];

  const projects = [
    {
      id: 'p1',
      title: 'Web Platform',
      repo: 'gitsphere/core-web',
      branch: 'main',
      status: 'Active',
      statusType: 'active',
      progress: 88,
      prs: 6,
      tasksRemaining: '3 tasks',
      updated: '12m ago',
    },
    {
      id: 'p2',
      title: 'API Service',
      repo: 'gitsphere/gateway-api',
      branch: 'v2-edge',
      status: 'In Review',
      statusType: 'review',
      progress: 64,
      prs: 2,
      tasksRemaining: '1 task',
      updated: '45m ago',
    },
    {
      id: 'p3',
      title: 'Mobile App',
      repo: 'gitsphere/native-client',
      branch: 'release-1.4',
      status: 'Completed',
      statusType: 'completed',
      progress: 100,
      prs: 0,
      tasksRemaining: '0 tasks',
      updated: '2h ago',
    },
  ];

  const activities = [
    { title: 'Review approved', target: 'PR #142 in API Service', time: '4m ago', icon: CheckIcon },
    { title: 'Task completed', target: 'Auth session tokens cache', time: '18m ago', icon: TaskCheckIcon },
    { title: 'Code contribution', target: 'Merged 8 commits to main', time: '1h ago', icon: GitCommitIcon },
    { title: 'New task assigned', target: 'Optimize webhook dispatcher', time: '3h ago', icon: LayersIcon },
  ];

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.status.toLowerCase() === activeFilter.toLowerCase());

  return (
    <section id="explore" className="relative bg-[#000000] py-24 sm:py-32 px-4 sm:px-6 lg:px-12 border-b border-[#222222] overflow-hidden">

      {/* Background geometric accents */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-[#111111] rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Centralized intelligence for engineering teams.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#888888]">
            Unified pull requests, sprint workflows, and contributor performance inside an uncompromising monochrome workspace.
          </p>
        </div>

        {/* Dashboard Frame Container with Floating Notifications */}


        {/* THE DASHBOARD STRUCTURE */}
        <div className="rounded-2xl border-2 border-[#333333] bg-[#111111] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden">

          {/* Window Chrome Titlebar */}
          <div className="bg-[#000000] px-4 sm:px-6 py-3 border-b border-[#222222] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#333333] border border-[#444444]" />
              <span className="w-3 h-3 rounded-full bg-[#222222] border border-[#333333]" />
              <span className="w-3 h-3 rounded-full bg-[#222222] border border-[#333333]" />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
              <GitSphereLogo className="w-4 h-4 text-white" />
              <span className="text-white font-semibold">app.gitsphere.internal</span>
              <span className="text-[#555555]">/ workspace / primary</span>
            </div>

            <div className="items-center gap-2 text-xs font-mono text-[#CCCCCC] hidden sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <span className="text-[#777777]">system:</span>
              <span className="text-white font-bold">operational</span>
            </div>
          </div>

          {/* Dashboard Inner Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[580px]">

            {/* SIDEBAR: Black background with white text */}
            <div className="md:col-span-3 lg:col-span-2 bg-[#0A0A0A] border-r border-[#222222] p-4 flex flex-col justify-between">
              <div>
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-[#666666]">
                  Menu
                </div>

                <nav className="mt-2 flex flex-col gap-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setActiveTab(item.name)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isActive
                          ? 'bg-white text-black font-bold shadow'
                          : 'text-[#AAAAAA] hover:text-white hover:bg-[#1A1A1A]'
                          }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#888888]'}`} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Footer User / Team info */}
              <div className="pt-4 border-t border-[#222222] px-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#222222] border border-[#444444] text-white flex items-center justify-center font-bold text-xs">
                  GS
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">Dev Core Team</div>
                  <div className="text-[10px] text-[#666666] truncate">enterprise-tier</div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT: Dynamic Panels based on activeTab */}
            <div className="md:col-span-6 lg:col-span-7 bg-[#111111] p-5 sm:p-6 overflow-x-auto">

              {/* TAB 1 & 2: PROJECTS / HOME */}
              {(activeTab === 'Projects' || activeTab === 'Home') && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Active Repositories</h3>
                      <p className="text-xs text-[#888888] mt-0.5">3 actively tracked repositories</p>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 p-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-xs">
                      {['All', 'Active', 'In Review', 'Completed'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${activeFilter === filter
                            ? 'bg-white text-black font-bold'
                            : 'text-[#888888] hover:text-white'
                            }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PROJECT CARDS: WHITE CARDS with BLACK text on BLACK background */}
                  <div className="flex flex-col gap-4">
                    {filteredProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="bg-white text-black p-5 rounded-xl border-2 border-black shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-extrabold text-black tracking-tight">
                                {proj.title}
                              </h4>
                              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#EEEEEE] border border-[#CCCCCC] rounded text-black font-semibold">
                                {proj.repo}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-[#555555] font-medium">
                              <span className="flex items-center gap-1">
                                <GitBranchIcon className="w-3.5 h-3.5 text-black" />
                                {proj.branch}
                              </span>
                              <span className="flex items-center gap-1">
                                <GitPullRequestIcon className="w-3.5 h-3.5 text-black" />
                                {proj.prs} PRs
                              </span>
                              <span>•</span>
                              <span>{proj.tasksRemaining}</span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${proj.statusType === 'active'
                                ? 'bg-black text-white'
                                : proj.statusType === 'review'
                                  ? 'bg-[#EEEEEE] text-black border border-black'
                                  : 'bg-[#555555] text-white'
                                }`}
                            >
                              {proj.status}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4 pt-3 border-t border-[#EEEEEE] flex items-center justify-between gap-4">
                          <div className="w-full bg-[#EEEEEE] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-black h-full rounded-full transition-all duration-500"
                              style={{ width: `${proj.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-black shrink-0">
                            {proj.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: TASKS SPRINT BOARD */}
              {activeTab === 'Tasks' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Sprint Tasks</h3>
                      <p className="text-xs text-[#888888] mt-0.5">Sprint 24 • 6 active tickets</p>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#222222] border border-[#333333] text-white">
                      Cycle Velocity: 94%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Todo Column */}
                    <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-3">
                      <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#AAAAAA] uppercase tracking-wider">
                        <span>To Do</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#222222] text-[10px]">2</span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <div className="bg-white text-black p-3 rounded-lg border border-black shadow-sm">
                          <span className="text-[10px] font-mono font-bold text-[#666666]">GS-104</span>
                          <p className="text-xs font-bold text-black mt-1">Rate limiter for gateway</p>
                          <div className="mt-2.5 flex items-center justify-between text-[10px]">
                            <span className="px-1.5 py-0.5 bg-black text-white rounded font-mono font-bold">P1</span>
                            <span className="text-[#666666] font-mono">3 pts</span>
                          </div>
                        </div>
                        <div className="bg-white text-black p-3 rounded-lg border border-black shadow-sm">
                          <span className="text-[10px] font-mono font-bold text-[#666666]">GS-109</span>
                          <p className="text-xs font-bold text-black mt-1">WebSocket backoff retry</p>
                          <div className="mt-2.5 flex items-center justify-between text-[10px]">
                            <span className="px-1.5 py-0.5 bg-[#EEEEEE] text-black border border-[#CCCCCC] rounded font-mono font-bold">P2</span>
                            <span className="text-[#666666] font-mono">2 pts</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-3">
                      <div className="flex items-center justify-between mb-3 text-xs font-bold text-white uppercase tracking-wider">
                        <span>In Progress</span>
                        <span className="px-1.5 py-0.5 rounded bg-white text-black text-[10px] font-bold">2</span>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <div className="bg-white text-black p-3 rounded-lg border-2 border-black shadow-md">
                          <span className="text-[10px] font-mono font-bold text-[#666666]">GS-98</span>
                          <p className="text-xs font-bold text-black mt-1">Auth session tokens cache</p>
                          <div className="mt-2.5 flex items-center justify-between text-[10px]">
                            <span className="px-1.5 py-0.5 bg-black text-white rounded font-mono font-bold">P0</span>
                            <span className="text-[#555555] font-mono font-bold">In Review</span>
                          </div>
                        </div>
                        <div className="bg-white text-black p-3 rounded-lg border border-black shadow-sm">
                          <span className="text-[10px] font-mono font-bold text-[#666666]">GS-101</span>
                          <p className="text-xs font-bold text-black mt-1">Zero-downtime DB migrator</p>
                          <div className="mt-2.5 flex items-center justify-between text-[10px]">
                            <span className="px-1.5 py-0.5 bg-black text-white rounded font-mono font-bold">P1</span>
                            <span className="text-[#666666] font-mono">5 pts</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Done Column */}
                    <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-3">
                      <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#AAAAAA] uppercase tracking-wider">
                        <span>Done</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#222222] text-[10px]">2</span>
                      </div>
                      <div className="flex flex-col gap-2.5 opacity-90">
                        <div className="bg-[#1A1A1A] text-white p-3 rounded-lg border border-[#333333]">
                          <span className="text-[10px] font-mono text-[#888888]">GS-89</span>
                          <p className="text-xs font-medium text-[#CCCCCC] mt-1 line-through">Webhook dispatcher</p>
                          <span className="mt-2 inline-block text-[10px] font-mono text-[#AAAAAA]">✓ Merged</span>
                        </div>
                        <div className="bg-[#1A1A1A] text-white p-3 rounded-lg border border-[#333333]">
                          <span className="text-[10px] font-mono text-[#888888]">GS-92</span>
                          <p className="text-xs font-medium text-[#CCCCCC] mt-1 line-through">Vault secret storage</p>
                          <span className="mt-2 inline-block text-[10px] font-mono text-[#AAAAAA]">✓ Deployed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CODE & COMMITS */}
              {activeTab === 'Code' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Repository Tree</h3>
                      <p className="text-xs text-[#888888] mt-0.5">Branch: <span className="text-white font-mono font-bold">main</span> (tracking origin/main)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#1A1A1A] border border-[#333333] text-white">
                        git rev-parse HEAD
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {[
                      { hash: 'e4f9b2a', msg: 'fix(auth): invalidate revoked session tokens in Redis cluster', author: '@abhay', time: '12m ago', diff: '+42 -8' },
                      { hash: 'a108c4e', msg: 'feat(api): add circuit breaker middleware to outbound webhook caller', author: '@elena', time: '48m ago', diff: '+118 -12' },
                      { hash: '89ff12d', msg: 'perf(db): add partial compound index for workspace query acceleration', author: '@marcus', time: '2h ago', diff: '+15 -4' },
                      { hash: '33cb87a', msg: 'chore(deps): bump cryptographic hash primitives and security patch', author: '@bot-dep', time: '5h ago', diff: '+6 -6' },
                    ].map((commit) => (
                      <div key={commit.hash} className="bg-white text-black p-4 rounded-xl border border-black shadow-sm flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black bg-black text-white px-2 py-0.5 rounded">
                              {commit.hash}
                            </span>
                            <span className="text-xs font-bold text-[#666666]">{commit.author}</span>
                            <span className="text-[10px] text-[#888888] font-mono">{commit.time}</span>
                          </div>
                          <p className="text-xs font-bold text-black mt-1.5 truncate">
                            {commit.msg}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-bold text-black shrink-0 px-2 py-1 bg-[#EEEEEE] rounded border border-[#CCCCCC]">
                          {commit.diff}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: CODE REVIEWS */}
              {activeTab === 'Reviews' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Active Pull Requests</h3>
                      <p className="text-xs text-[#888888] mt-0.5">Strict multi-party review protocol active</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-white text-black font-bold">
                      2 Pending Approval
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="bg-white text-black p-4 rounded-xl border-2 border-black shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-black text-white rounded font-mono font-bold text-[10px]">#142</span>
                            <h4 className="text-sm font-black text-black">Core auth session caching & token revocation</h4>
                          </div>
                          <p className="text-xs text-[#555555] mt-1 font-mono">gateway-api • branch: feat/auth-cache → main</p>
                        </div>
                        <span className="px-2 py-0.5 bg-[#EEEEEE] border border-black text-black text-[10px] font-bold rounded uppercase">
                          Approved (2)
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#EEEEEE] flex flex-wrap items-center gap-4 text-xs font-mono text-[#555555]">
                        <span className="text-black font-bold">✓ 48/48 Tests Passed</span>
                        <span className="text-black font-bold">✓ Lint Clean</span>
                        <span className="text-black font-bold">✓ GPG Signed</span>
                      </div>
                    </div>

                    <div className="bg-white text-black p-4 rounded-xl border border-black shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-black text-white rounded font-mono font-bold text-[10px]">#139</span>
                            <h4 className="text-sm font-black text-black">Gateway distributed rate limiter with Redis token bucket</h4>
                          </div>
                          <p className="text-xs text-[#555555] mt-1 font-mono">core-web • branch: feat/ratelimit → main</p>
                        </div>
                        <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold rounded uppercase">
                          Changes Requested
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#EEEEEE] flex flex-wrap items-center gap-4 text-xs font-mono text-[#555555]">
                        <span className="text-black font-bold">✓ CI Build: Success</span>
                        <span className="text-[#888888]">1 review comment open</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: TEAM ROSTER */}
              {activeTab === 'Team' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight">Team Contributors</h3>
                      <p className="text-xs text-[#888888] mt-0.5">4 active engineers in Dev Core Team</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-[#1A1A1A] border border-[#333333] text-white">
                      Access: Restricted Org
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: 'Abhay Singh', role: 'Lead Architect', status: 'Online', commits: '42 commits this week', initial: 'AS' },
                      { name: 'Elena Rostova', role: 'Systems Engineer', status: 'Reviewing', commits: '28 commits this week', initial: 'ER' },
                      { name: 'Marcus Vance', role: 'DevOps & Infra', status: 'In Standup', commits: '19 commits this week', initial: 'MV' },
                      { name: 'Aria Chen', role: 'Security & Core', status: 'Online', commits: '31 commits this week', initial: 'AC' },
                    ].map((member) => (
                      <div key={member.name} className="bg-white text-black p-4 rounded-xl border border-black shadow-sm flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {member.initial}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-black truncate">{member.name}</h4>
                          <p className="text-[11px] font-mono text-[#666666]">{member.role}</p>
                          <span className="text-[10px] text-[#444444] font-medium block mt-0.5">{member.commits}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT SIDE: Recent Activity */}
            <div className="md:col-span-3 lg:col-span-3 bg-[#0D0D0D] border-t md:border-t-0 md:border-l border-[#222222] p-5">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-sm font-bold text-white tracking-wider uppercase">
                  Recent Activity
                </h4>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </div>

              <div className="flex flex-col gap-4">
                {activities.map((act, index) => {
                  const Icon = act.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 group">
                      <div className="w-7 h-7 rounded bg-[#222222] border border-[#333333] flex items-center justify-center text-white shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white tracking-tight leading-snug">
                          {act.title}
                        </p>
                        <p className="text-[11px] text-[#888888] truncate mt-0.5">
                          {act.target}
                        </p>
                        <span className="text-[10px] text-[#555555] font-mono block mt-1">
                          {act.time}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Action Button */}
              <div className="mt-8 pt-4 border-t border-[#222222]">
                <button className="w-full py-2.5 px-3 rounded-lg bg-[#1A1A1A] border border-[#333333] text-white text-xs font-bold hover:bg-white hover:text-black transition-all cursor-pointer">
                  View Complete Audit Log →
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>


    </section>
  );
}
