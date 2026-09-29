import React, { useState } from 'react';
import EmptyState from '../../components/manager/EmptyState';
import StatCard from '../../components/manager/StatCard';
import { BellIcon } from '../../components/common/Icons';

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('All');
  const [notifications] = useState([]); // dynamic empty array

  const tabs = ['All', 'Contributions', 'Tasks', 'Projects', 'Team', 'System'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            NOTIFICATIONS
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Activity alerts, mention digests, and system events.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Notifications" value={notifications.length} subtext="No activity yet" icon={BellIcon} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#222222] overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-mono font-bold tracking-wider transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === tab
                ? 'border-white text-white'
                : 'border-transparent text-[#666666] hover:text-[#AAAAAA]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notifications List / Empty State */}
      <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-12">
        <EmptyState
          icon={BellIcon}
          title="YOU'RE ALL CAUGHT UP"
          description="There are no notifications yet."
          className="border-0 bg-transparent py-10"
        />
      </div>
    </div>
  );
}
