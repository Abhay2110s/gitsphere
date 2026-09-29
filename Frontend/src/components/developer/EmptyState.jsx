import React from 'react';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-[#222222] bg-[#0A0A0A] ${className}`}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#888888] mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight uppercase">
        {title}
      </h3>
      <p className="mt-2 text-xs sm:text-sm text-[#888888] max-w-md leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-xs sm:text-sm font-bold hover:bg-[#E5E5E5] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
