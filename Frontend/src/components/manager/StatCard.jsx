import React from 'react';

/**
 * Metric card starting at zero with no fake trends, supporting skeleton loading.
 */
export default function StatCard({
  label,
  value = 0,
  subtext = 'No activity yet',
  icon: Icon,
  isLoading = false,
}) {
  if (isLoading) {
    return (
      <div className="p-5 rounded-xl border border-[#222222] bg-[#0A0A0A] animate-pulse">
        <div className="h-3 w-20 bg-[#222222] rounded mb-3" />
        <div className="h-8 w-12 bg-[#222222] rounded mb-2" />
        <div className="h-2.5 w-24 bg-[#1A1A1A] rounded" />
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl border border-[#222222] bg-[#0A0A0A] hover:border-[#333333] transition-colors">
      <div className="flex items-center justify-between text-[#888888]">
        <span className="text-[11px] font-mono font-bold tracking-wider uppercase">
          {label}
        </span>
        {Icon && <Icon className="w-4 h-4 text-[#666666]" />}
      </div>
      <div className="text-3xl font-black text-white mt-2 tracking-tight">
        {value}
      </div>
      <div className="text-[11px] font-mono text-[#666666] mt-1.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#444444]" />
        <span>{subtext}</span>
      </div>
    </div>
  );
}
