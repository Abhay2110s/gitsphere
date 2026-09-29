import React, { useState } from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import AddDeveloperModal from '../../components/manager/AddDeveloperModal';
import { UsersIcon, PlusIcon } from '../../components/common/Icons';

export default function Team() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamMembers] = useState([]); // dynamic empty array

  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const developers = teamMembers.filter(m => m.role === 'developer').length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1F1F1F]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            TEAM
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#888888]">
            Manage contributors, developer seats, and workspace permissions.
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-all cursor-pointer shadow-sm"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>+ Add Developer</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Team Members" value={teamMembers.length} subtext="No activity yet" icon={UsersIcon} />
        <StatCard label="Active Members" value={activeMembers} subtext="No activity yet" icon={UsersIcon} />
        <StatCard label="Developers" value={developers} subtext="No activity yet" icon={UsersIcon} />
      </div>

      {/* Team Roster / Empty State */}
      <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-12">
        {teamMembers.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="YOUR TEAM IS EMPTY"
            description="Invite developers to collaborate on your projects."
            actionLabel="+ Add Developer"
            onAction={() => setIsModalOpen(true)}
            className="border-0 bg-transparent py-10"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((m) => (
              <div key={m.id} className="p-4 rounded-xl border border-[#222222] bg-[#111111] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#222222] flex items-center justify-center font-bold text-xs text-white">
                  {m.name ? m.name[0] : 'U'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{m.name}</h4>
                  <p className="text-[11px] text-[#888888]">{m.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Developer Modal */}
      <AddDeveloperModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInviteDeveloper={(data) => {
          console.log('Developer invited:', data);
        }}
      />
    </div>
  );
}
