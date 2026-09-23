import React from 'react';

export default function FeaturesIntro() {
  const modules = [
    { num: '01', title: 'Project Core' },
    { num: '02', title: 'Task Flow' },
    { num: '03', title: 'Code Sync' },
    { num: '04', title: 'Review Engine' },
    { num: '05', title: 'Telemetry' },
  ];

  return (
    <div id="features" className="bg-[#000000] pt-28 pb-14 px-4 sm:px-6 lg:px-12 text-center border-b border-[#1A1A1A]">
      <div className="max-w-5xl mx-auto">
        {/* Large White Heading */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
          Everything you need to build,<br />
          collaborate and grow.
        </h2>

        {/* Supporting text in light gray */}
        <p className="mt-6 text-base sm:text-lg text-[#CCCCCC] max-w-2xl mx-auto leading-relaxed">
          Engineered from the ground up for high-velocity software teams who demand precision, clarity, and zero cognitive overhead.
        </p>

        {/* Module Badge Indicators */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {modules.map((m) => (
            <div
              key={m.num}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111111] border border-[#2A2A2A] text-xs font-mono text-[#CCCCCC] hover:border-[#666666] hover:text-white transition-colors"
            >
              <span className="text-[10px] font-bold text-white bg-[#222222] px-1.5 py-0.5 rounded">
                {m.num}
              </span>
              <span>{m.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
