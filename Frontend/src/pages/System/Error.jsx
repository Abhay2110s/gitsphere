import React from 'react';
import { GitSphereLogo, AlertTriangleIcon, RefreshIcon, HomeIcon } from '../../components/common/Icons';

/**
 * Generic Error — GitSphere System Page
 * Never exposes stack traces, internal paths, or sensitive information.
 */
export default function ErrorPage({ message, onRetry, onGoDashboard }) {
  // Safely display a user-friendly message only
  const safeMessage = (() => {
    if (!message) return null;
    // Never show anything that looks like a stack trace or internal path
    if (message.includes('at ') || message.includes('/') || message.includes('\\') || message.length > 200) {
      return null;
    }
    return message;
  })();

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center font-sans selection:bg-white selection:text-black relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 text-center px-6">
        <div className="mb-6">
          <GitSphereLogo className="w-10 h-10 text-[#333333] mx-auto" />
        </div>

        <div className="w-14 h-14 rounded-2xl bg-[#0A0A0A] border border-[#222222] flex items-center justify-center mx-auto mb-5">
          <AlertTriangleIcon className="w-7 h-7 text-[#555555]" />
        </div>

        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">
          Something went wrong
        </h2>
        <p className="text-sm text-[#666666] mt-2 max-w-sm mx-auto">
          {safeMessage || "We couldn't complete this request. Please try again."}
        </p>

        <div className="flex items-center justify-center gap-3 mt-8">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              Try Again
            </button>
          )}
          <button
            onClick={onGoDashboard || (() => (window.location.href = '/'))}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white text-xs font-bold hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <HomeIcon className="w-3.5 h-3.5" />
            Go to Dashboard
          </button>
        </div>

        <div className="mt-12 text-[10px] font-mono text-[#333333]">
          gitsphere · system · error
        </div>
      </div>
    </div>
  );
}
