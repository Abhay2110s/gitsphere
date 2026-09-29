import React from 'react';

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 rounded-xl border border-[#222222] bg-[#0A0A0A] animate-pulse">
          <div className="h-4 w-36 bg-[#222222] rounded mb-3" />
          <div className="h-3 w-48 bg-[#1A1A1A] rounded mb-6" />
          <div className="h-2 w-full bg-[#1A1A1A] rounded mb-3" />
          <div className="flex justify-between items-center pt-4 border-t border-[#1C1C1C]">
            <div className="h-3 w-16 bg-[#222222] rounded" />
            <div className="h-3 w-12 bg-[#222222] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 4 }) {
  return (
    <div className="border border-[#222222] rounded-xl overflow-hidden bg-[#0A0A0A]">
      <div className="px-6 py-4 border-b border-[#222222] bg-[#111111] flex items-center justify-between">
        <div className="h-4 w-32 bg-[#222222] rounded" />
      </div>
      <div className="divide-y divide-[#1A1A1A] animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#222222]" />
              <div className="space-y-1.5">
                <div className="h-3 w-40 bg-[#222222] rounded" />
                <div className="h-2.5 w-24 bg-[#1A1A1A] rounded" />
              </div>
            </div>
            <div className="h-4 w-20 bg-[#222222] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-[#222222] bg-[#0A0A0A]">
            <div className="h-3 w-20 bg-[#222222] rounded mb-3" />
            <div className="h-8 w-12 bg-[#222222] rounded mb-2" />
            <div className="h-2.5 w-24 bg-[#1A1A1A] rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 h-64 rounded-2xl border border-[#222222] bg-[#0A0A0A]" />
        <div className="lg:col-span-5 h-64 rounded-2xl border border-[#222222] bg-[#0A0A0A]" />
      </div>
    </div>
  );
}
