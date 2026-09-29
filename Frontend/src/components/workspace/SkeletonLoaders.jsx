import React from 'react';

/** Skeleton stat card matching the Manager StatCard loading state */
export function StatSkeleton({ count = 5 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-xl border border-[#222222] bg-[#0A0A0A] animate-pulse">
          <div className="h-3 w-20 bg-[#222222] rounded mb-3" />
          <div className="h-8 w-12 bg-[#222222] rounded mb-2" />
          <div className="h-2.5 w-24 bg-[#1A1A1A] rounded" />
        </div>
      ))}
    </div>
  );
}

/** Skeleton card grid */
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

/** Skeleton table rows */
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

/** Full-page skeleton with stats + cards */
export function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-48 bg-[#222222] rounded" />
        <div className="h-3 w-72 bg-[#1A1A1A] rounded" />
      </div>
      <StatSkeleton count={4} />
      <TableSkeleton rows={3} />
    </div>
  );
}

/** Error banner */
export function ErrorBanner({ message = 'Unable to load data', onRetry }) {
  return (
    <div className="p-6 rounded-xl border border-red-900/40 bg-red-950/20 text-center flex flex-col items-center justify-center my-4">
      <div className="text-xs font-mono font-bold text-red-400 tracking-wider uppercase mb-1">
        UNABLE TO LOAD DATA
      </div>
      <p className="text-xs text-[#888888] mb-4">
        {message || 'Something went wrong while loading this section.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 rounded-md bg-[#222222] hover:bg-white hover:text-black text-xs font-bold text-white transition-colors cursor-pointer"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
