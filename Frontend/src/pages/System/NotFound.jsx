import React from 'react';
import { GitSphereLogo, HomeIcon, ActivityIcon } from '../../components/common/Icons';

/**
 * 404 Not Found — GitSphere System Page
 * Maintains the dark monochrome design system.
 */
export default function NotFound({ onGoHome, onGoDashboard }) {
  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center font-sans selection:bg-white selection:text-black relative overflow-hidden">
      {/* Subtle geometric background grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Subtle hexagonal accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.02]">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <polygon points="200,20 370,110 370,290 200,380 30,290 30,110" stroke="white" strokeWidth="1" fill="none" />
          <polygon points="200,60 340,130 340,270 200,340 60,270 60,130" stroke="white" strokeWidth="0.5" fill="none" />
          <polygon points="200,100 310,150 310,250 200,300 90,250 90,150" stroke="white" strokeWidth="0.3" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 text-center px-6">
        <div className="mb-6">
          <GitSphereLogo className="w-10 h-10 text-[#333333] mx-auto" />
        </div>

        <h1 className="text-[120px] sm:text-[160px] font-black tracking-tighter leading-none text-white/10 select-none">
          404
        </h1>

        <div className="-mt-8 sm:-mt-12">
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase">
            Page Not Found
          </h2>
          <p className="text-sm text-[#666666] mt-2 max-w-sm mx-auto">
            This page doesn't exist. It may have been moved, or the URL might be incorrect.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] active:scale-[0.98] transition-all cursor-pointer shadow-sm"
          >
            <HomeIcon className="w-3.5 h-3.5" />
            Back Home
          </button>
          <button
            onClick={onGoDashboard}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white text-xs font-bold hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <ActivityIcon className="w-3.5 h-3.5" />
            Go to Dashboard
          </button>
        </div>

        <div className="mt-12 text-[10px] font-mono text-[#333333]">
          gitsphere · system · 404
        </div>
      </div>
    </div>
  );
}
