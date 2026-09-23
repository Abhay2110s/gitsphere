import React from 'react';
import { ArrowRightIcon, CheckIcon } from '../common/Icons';
import { HexagonShape } from '../common/Hexagon';

export default function FinalCta({ onOpenAuth, onLearnMore }) {
  return (
    <section className="relative bg-[#000000] py-32 sm:py-40 px-4 sm:px-6 lg:px-12 border-b border-[#222222] overflow-hidden text-center">
      
      {/* Subtle large white/gray hexagonal structures around the edges */}
      <div className="absolute -top-16 -left-16 pointer-events-none opacity-20">
        <HexagonShape size={240} fill="none" stroke="#FFFFFF" strokeWidth={1.5} />
      </div>

      <div className="absolute -bottom-24 -right-20 pointer-events-none opacity-20">
        <HexagonShape size={300} fill="none" stroke="#CCCCCC" strokeWidth={1.5} />
      </div>

      <div className="absolute top-1/4 right-8 pointer-events-none opacity-10 hidden md:block">
        <HexagonShape size={140} fill="#111111" stroke="#888888" strokeWidth={1} />
      </div>

      <div className="absolute bottom-1/4 left-8 pointer-events-none opacity-10 hidden md:block">
        <HexagonShape size={120} fill="#111111" stroke="#888888" strokeWidth={1} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Small uppercase text */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#333333] bg-[#111111] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-[0.25em] text-[#CCCCCC] uppercase">
            READY TO GET STARTED?
          </span>
        </div>

        {/* Large White Heading */}
        <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.05]">
          Build something great together.
        </h2>

        {/* Supporting text */}
        <p className="mt-7 text-lg sm:text-xl text-[#888888] max-w-xl mx-auto leading-relaxed">
          Join GitSphere and bring your team, projects and code together.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          
          {/* Primary button: WHITE background, BLACK text */}
          <button
            onClick={() => onOpenAuth('signup')}
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black text-base font-bold hover:bg-[#EEEEEE] active:scale-[0.98] transition-all duration-200 shadow-[0_10px_25px_rgba(255,255,255,0.1)] hover:scale-105 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Secondary button: BLACK background, WHITE border, WHITE text */}
          <button
            onClick={onLearnMore}
            className="inline-flex items-center px-8 py-4 rounded-full bg-black text-white border-2 border-white text-base font-bold hover:bg-[#111111] active:scale-[0.98] transition-all duration-200 cursor-pointer hover:border-[#CCCCCC]"
          >
            Learn More
          </button>
        </div>

        {/* Micro Guarantee indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-mono text-[#AAAAAA]">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#2A2A2A]">
            <CheckIcon className="w-3.5 h-3.5 text-white" />
            Zero-config migration
          </span>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#2A2A2A]">
            <CheckIcon className="w-3.5 h-3.5 text-white" />
            Unlimited private repos
          </span>
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#2A2A2A]">
            <CheckIcon className="w-3.5 h-3.5 text-white" />
            Enterprise SSO & 99.99% SLA
          </span>
        </div>

      </div>
    </section>
  );
}
