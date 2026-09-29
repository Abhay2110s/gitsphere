import React from 'react';
import { GitSphereLogo, LockIcon, HomeIcon, ChevronLeftIcon } from '../../components/common/Icons';

/**
 * 403 Unauthorized — GitSphere System Page
 * Shown when a user is authenticated but lacks permission.
 */
export default function Unauthorized({ onGoDashboard, onGoBack }) {
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

        {/* 403 watermark */}
        <h1 className="text-[100px] sm:text-[140px] font-black tracking-tighter leading-none text-white/5 select-none">
          403
        </h1>

        <div className="-mt-6 sm:-mt-10">
          <div className="w-14 h-14 rounded-2xl bg-[#0A0A0A] border border-[#222222] flex items-center justify-center mx-auto mb-5">
            <LockIcon className="w-7 h-7 text-[#555555]" />
          </div>

          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">
            Access Restricted
          </h2>
          <p className="text-sm text-[#666666] mt-2 max-w-sm mx-auto">
            You don't have permission to access this page. Contact your administrator if you believe this is an error.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={onGoDashboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <HomeIcon className="w-3.5 h-3.5" />
            Go to Dashboard
          </button>
          <button
            onClick={onGoBack || (() => window.history.back())}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white text-xs font-bold hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <ChevronLeftIcon className="w-3.5 h-3.5" />
            Go Back
          </button>
        </div>

        <div className="mt-12 text-[10px] font-mono text-[#333333]">
          gitsphere · system · unauthorized
        </div>
      </div>
    </div>
  );
}
