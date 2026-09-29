import React from 'react';
import StatCard from '../../components/workspace/StatCard';
import EmptyState from '../../components/workspace/EmptyState';
import { PageSkeleton } from '../../components/workspace/SkeletonLoaders';
import {
  UsersIcon,
  PlusIcon,
  UserIcon,
  TaskCheckIcon,
  GitCommitIcon,
} from '../../components/common/Icons';

export default function Team({ team = [], stats, loading, userRole }) {
  if (loading) return <PageSkeleton />;

  const managers = team.filter((m) => m.role === 'MANAGER');
  const developers = team.filter((m) => m.role === 'USER' || m.role === 'DEVELOPER');

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Project Team</h1>
          <p className="text-xs font-mono text-[#666666] mt-1">
            {team.length} member{team.length !== 1 ? 's' : ''}
          </p>
        </div>
        {userRole === 'MANAGER' && (
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer shadow-sm">
            <PlusIcon className="w-3.5 h-3.5" />
            Invite Member
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Members" value={team.length} icon={UsersIcon} subtext="No activity yet" />
        <StatCard label="Managers" value={managers.length} subtext="No activity yet" />
        <StatCard label="Developers" value={developers.length} subtext="No activity yet" />
      </div>

      {/* Team List */}
      {team.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No team members yet"
          description="Invite developers to start collaborating on this project."
          actionLabel={userRole === 'MANAGER' ? 'Invite Member' : undefined}
        />
      ) : (
        <div className="border border-[#222222] rounded-xl overflow-hidden bg-[#0A0A0A]">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#1A1A1A] bg-[#070707] text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555]">
            <div className="col-span-4">Member</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Joined</div>
            <div className="col-span-2">Contributions</div>
          </div>
          <div className="divide-y divide-[#1A1A1A]">
            {team.map((member, i) => (
              <div
                key={member._id || i}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 hover:bg-[#0F0F0F] transition-colors"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#333333] flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {member.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{member.name || 'Unknown'}</div>
                    <div className="text-[10px] font-mono text-[#666666] truncate">{member.email || ''}</div>
                  </div>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-[#141414] border border-[#2A2A2A] text-[#AAAAAA]">
                    {member.role === 'MANAGER' ? 'Manager' : 'Developer'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="flex items-center gap-1.5 text-xs font-mono text-[#666666]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#444444]" />
                    Active
                  </span>
                </div>
                <div className="col-span-2 flex items-center text-xs font-mono text-[#666666]">
                  {formatDate(member.joinedAt || member.createdAt)}
                </div>
                <div className="col-span-2 flex items-center text-xs font-mono text-[#666666]">
                  {member.contributionCount || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
