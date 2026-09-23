import React from 'react';
import {
  ArrowRightIcon,
  LayersIcon,
  GitPullRequestIcon,
  UsersIcon,
  GitBranchIcon,
  GitCommitIcon,
  CheckIcon,
  TerminalIcon,
} from '../common/Icons';
import MonochromeRays from './MonochromeRays';

export default function Hero({ onOpenAuth, onExplore }) {
  return (
    <section className="relative min-h-screen flex items-center bg-white px-4 sm:px-6 lg:px-12 pt-28 sm:pt-36 pb-16 lg:pb-24 border-b border-[#EEEEEE] overflow-hidden">
      {/* Dynamic atmospheric sliding monochrome light rays */}
      <MonochromeRays />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">

        {/* LEFT COLUMN: Hero Typography & Actions */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left">

          {/* Large Bold Headline with Staggered Word Reveal Animations */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[78px] font-black tracking-tight leading-[1.04] text-black">
            <span className="block">
              <span className="hero-title-word-1 text-black mr-4">Build.</span>
              <span className="hero-title-word-2 text-black">Review.</span>
            </span>
            <span className="block">
              <span className="hero-title-word-3 text-[#333333] hover:text-black transition-colors duration-300">
                Collaborate.
              </span>
            </span>
          </h1>

          {/* Supporting Text with Smooth Fade-Up Animation */}
          <p className="hero-desc-fade mt-7 text-lg sm:text-xl text-[#555555] max-w-xl leading-relaxed font-normal">
            GitSphere brings projects, tasks, code contributions, and reviews together in one collaborative workspace.
          </p>

          {/* Action Buttons with Staggered Entrance Animation */}
          <div className="hero-actions-fade mt-9 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onOpenAuth('signup')}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-black text-white text-base font-semibold hover:bg-[#222222] active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              <span>Get Started</span>
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onExplore}
              className="inline-flex items-center px-7 py-3.5 rounded-full bg-white text-black border-2 border-black text-base font-semibold hover:bg-[#F5F5F5] active:scale-[0.98] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              Explore GitSphere
            </button>
          </div>

          {/* Capability Indicators with Smooth Navigation Anchors */}
          <div className="hero-badges-fade mt-12 pt-8 border-t border-[#EEEEEE] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div 
              onClick={onExplore}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F7F7F7] border border-transparent hover:border-[#E5E5E5] transition-all duration-200 cursor-pointer group select-none"
            >
              <div className="w-7 h-7 rounded-md bg-[#F5F5F5] border border-[#CCCCCC] flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors duration-200 shrink-0">
                <LayersIcon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-black tracking-tight group-hover:translate-x-0.5 transition-transform">
                Project Management
              </span>
            </div>

            <div 
              onClick={onExplore}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F7F7F7] border border-transparent hover:border-[#E5E5E5] transition-all duration-200 cursor-pointer group select-none"
            >
              <div className="w-7 h-7 rounded-md bg-[#F5F5F5] border border-[#CCCCCC] flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors duration-200 shrink-0">
                <GitPullRequestIcon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-black tracking-tight group-hover:translate-x-0.5 transition-transform">
                Code Review
              </span>
            </div>

            <div 
              onClick={onExplore}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F7F7F7] border border-transparent hover:border-[#E5E5E5] transition-all duration-200 cursor-pointer group select-none"
            >
              <div className="w-7 h-7 rounded-md bg-[#F5F5F5] border border-[#CCCCCC] flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors duration-200 shrink-0">
                <UsersIcon className="w-4 h-4" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-black tracking-tight group-hover:translate-x-0.5 transition-transform">
                Team Collaboration
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean High-Contrast Developer Live Telemetry Card with Entrance Animation */}
        <div className="lg:col-span-5 flex items-center justify-center hero-telemetry-fade">
          <div className="w-full max-w-[460px] bg-black text-white p-7 rounded-2xl border-2 border-black shadow-[0_20px_50px_rgba(0,0,0,0.25)] flex flex-col justify-between hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)] transition-shadow duration-300">

            {/* Top Bar */}
            <div className="flex items-center justify-between pb-5 border-b border-[#222222]">
              <div className="flex items-center gap-2">
                <TerminalIcon className="w-4 h-4 text-white" />
                <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                  SPHERE-PIPELINE
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#222222] text-[#CCCCCC] border border-[#333333]">
                v2.4.0-stable
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 py-6 border-b border-[#222222]">
              <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
                <div className="text-[10px] font-mono text-[#888888] uppercase">Review Velocity</div>
                <div className="text-2xl font-black text-white mt-1">42m</div>
                <div className="text-[10px] text-[#AAAAAA] mt-0.5">Average sign-off speed</div>
              </div>

              <div className="p-4 rounded-xl bg-[#111111] border border-[#222222]">
                <div className="text-[10px] font-mono text-[#888888] uppercase">Branch Accuracy</div>
                <div className="text-2xl font-black text-white mt-1">99.98%</div>
                <div className="text-[10px] text-[#AAAAAA] mt-0.5">Zero collision merges</div>
              </div>
            </div>

            {/* Live Feed Status */}
            <div className="pt-5 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#CCCCCC]">
                <span className="flex items-center gap-2">
                  <GitBranchIcon className="w-3.5 h-3.5 text-white" />
                  <span>main ← release-v2</span>
                </span>
                <span className="text-[#888888]">100% synchronized</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#CCCCCC]">
                <span className="flex items-center gap-2">
                  <GitCommitIcon className="w-3.5 h-3.5 text-white" />
                  <span>commit #7fe91b</span>
                </span>
                <span className="text-white font-bold flex items-center gap-1">
                  <CheckIcon className="w-3 h-3 text-white" />
                  Passed CI
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
