import React from 'react';
import StatCard from '../../components/manager/StatCard';
import EmptyState from '../../components/manager/EmptyState';
import { UsersIcon } from '../../components/common/Icons';

export default function Team() {

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="pb-6 border-b border-[#1F1F1F]">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
          PROJECT COLLABORATORS
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#888888]">
          Managers, tech leads, and peer engineers on your assigned repositories.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Team Members" value={0} subtext="No activity yet" icon={UsersIcon} />
        <StatCard label="Managers" value={0} subtext="No activity yet" icon={UsersIcon} />
        <StatCard label="Peer Developers" value={0} subtext="No activity yet" icon={UsersIcon} />
      </div>

      {/* Empty State */}
      <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 sm:p-12">
        <EmptyState
          icon={UsersIcon}
          title="NO TEAM MEMBERS YET"
          description="You have not been assigned to a project team yet. Your teammates and managers will appear here once you join a repository."
          className="border-0 bg-transparent py-10"
        />
      </div>
    </div>
  );
}
