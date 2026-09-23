import React, { useState } from 'react';
import {
  LayersIcon,
  TaskCheckIcon,
  CodeIcon,
  GitPullRequestIcon,
  CheckIcon,
  ActivityIcon,
} from '../common/Icons';
import { HexagonShape } from '../common/Hexagon';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(2); // default step 3

  const steps = [
    {
      num: '01',
      title: 'Initialize',
      desc: 'Import repos & configure team permissions.',
      icon: LayersIcon,
    },
    {
      num: '02',
      title: 'Plan Tasks',
      desc: 'Organize backlogs into active sprints.',
      icon: TaskCheckIcon,
    },
    {
      num: '03',
      title: 'Write Code',
      desc: 'Commit with instant decentralized branch sync.',
      icon: CodeIcon,
    },
    {
      num: '04',
      title: 'Review',
      desc: 'Inline diffs and automated CI test checks.',
      icon: GitPullRequestIcon,
    },
    {
      num: '05',
      title: 'Merge',
      desc: 'Verified sign-offs & squash merge to main.',
      icon: CheckIcon,
    },
    {
      num: '06',
      title: 'Track',
      desc: 'Live velocity and deployment telemetry.',
      icon: ActivityIcon,
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-20 sm:py-28 px-4 sm:px-6 lg:px-12 border-b border-[#EEEEEE]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-black rotate-45 inline-block" />
            <span className="text-xs font-black tracking-[0.25em] text-[#555555] uppercase">
              WORKFLOW
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight leading-tight">
            From idea to impact in 6 steps.
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#666666]">
            A streamlined engineering cycle designed for speed, clarity, and zero friction.
          </p>
        </div>

        {/* DESKTOP ARCHITECTURAL WORKFLOW GRAPH (6 Connected Hexagonal Nodes) */}
        <div className="hidden lg:block relative my-12 px-4">
          <div className="grid grid-cols-6 gap-3 relative z-10">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              const isPast = idx < activeStep;

              return (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(idx)}
                  className="flex flex-col items-center text-center cursor-pointer group relative"
                >
                  {/* Connecting Line */}
                  {idx < steps.length - 1 && (
                    <div
                      className="absolute top-[35px] h-[2px] pointer-events-none z-0"
                      style={{
                        left: 'calc(50% + 42px)',
                        width: 'calc(100% + 0.75rem - 84px)',
                      }}
                    >
                      <div className="w-full h-full bg-[#E5E5E5] relative">
                        <div
                          className="h-full bg-black transition-all duration-300 ease-out"
                          style={{
                            width: idx < activeStep ? '100%' : '0%',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Hexagon Node */}
                  <div className="relative mb-4 z-10">
                    <HexagonShape
                      size={60}
                      fill={isActive ? '#000000' : isPast ? '#222222' : '#FFFFFF'}
                      stroke="#000000"
                      strokeWidth={isActive ? 2.5 : 1.5}
                      className={`transition-all duration-200 group-hover:scale-105 ${
                        isActive ? 'drop-shadow-[0_6px_14px_rgba(0,0,0,0.25)]' : ''
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive || isPast ? 'text-white' : 'text-black'}`} />
                    </HexagonShape>

                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-black text-white text-[9px] font-mono font-bold">
                      {step.num}
                    </div>
                  </div>

                  {/* Step Title */}
                  <h3 className={`text-sm font-extrabold tracking-tight transition-colors ${
                    isActive ? 'text-black' : 'text-[#555555] group-hover:text-black'
                  }`}>
                    {step.title}
                  </h3>

                  {/* Step Description */}
                  <p className="mt-1.5 text-xs text-[#777777] leading-snug">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Minimalist Phase Bar */}
          <div className="mt-12 p-4 sm:p-5 rounded-2xl border-2 border-black bg-[#FAFAFA] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-mono font-bold text-xs shrink-0">
                {steps[activeStep].num}
              </span>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#777777]">
                  Active Step
                </div>
                <div className="text-sm font-bold text-black">
                  {steps[activeStep].title} — <span className="font-normal text-[#555555]">{steps[activeStep].desc}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="px-3.5 py-1.5 rounded-full border border-black text-xs font-bold text-black hover:bg-black hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-black transition-all cursor-pointer"
              >
                ← Prev
              </button>
              <button
                onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                disabled={activeStep === steps.length - 1}
                className="px-3.5 py-1.5 rounded-full bg-black text-white text-xs font-bold hover:bg-[#222222] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black transition-all cursor-pointer"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE & TABLET CONNECTED TIMELINE */}
        <div className="lg:hidden flex flex-col gap-3 relative ml-1">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(idx)}
                className="relative flex items-center gap-3 cursor-pointer"
              >
                {/* Node column */}
                <div className="relative flex flex-col items-center flex-shrink-0 w-8">
                  <HexagonShape
                    size={32}
                    fill={isSelected ? '#000000' : '#FFFFFF'}
                    stroke="#000000"
                    strokeWidth={1.5}
                    className="relative z-10"
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-black'}`} />
                  </HexagonShape>

                  {idx < steps.length - 1 && (
                    <div className="absolute top-[34px] -bottom-3 w-[2px] bg-[#E0E0E0]" />
                  )}
                </div>

                <div className={`p-3.5 rounded-xl flex-1 transition-all ${
                  isSelected
                    ? 'bg-white border-2 border-black shadow-sm'
                    : 'bg-[#F9F9F9] border border-[#E0E0E0]'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-black">
                      {step.num}. {step.title}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black text-white font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#666666]">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
