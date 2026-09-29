import React from 'react';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load the requested data.',
  onRetry,
}) {
  return (
    <div className="p-8 rounded-2xl border border-red-950/60 bg-red-950/10 text-center flex flex-col items-center justify-center my-6">
      <div className="w-10 h-10 rounded-full bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400 mb-3">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-sm font-bold text-white tracking-wide uppercase mb-1">
        {title}
      </h3>
      <p className="text-xs text-[#888888] max-w-sm mb-4">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#222222] hover:bg-white hover:text-black text-xs font-bold text-white transition-all cursor-pointer"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
