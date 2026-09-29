import React from 'react';

/**
 * High-performance, GPU-accelerated atmospheric ambient light for GitSphere Hero
 * Uses zero-repaint CSS gradients instead of heavy multi-layered box-shadow blurs.
 */
export default function MonochromeRays() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Primary soft atmospheric monochrome spotlight */}
      <div 
        className="absolute -top-[25%] -right-[10%] w-[55vw] h-[55vw] max-w-[900px] max-h-[900px] rounded-full opacity-60 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(230, 230, 230, 0.45) 0%, rgba(245, 245, 245, 0.2) 40%, rgba(255, 255, 255, 0) 70%)',
          willChange: 'transform',
        }}
      />

      {/* Subtle angled ambient architectural light beam */}
      <div
        className="absolute -top-[35%] -right-[15%] w-[85vw] h-[130vh] opacity-30 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.02) 30%, transparent 65%)',
          transform: 'rotate(-12deg)',
        }}
      />

      {/* Secondary subtle ambient glow */}
      <div 
        className="absolute bottom-[-10%] left-[5%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(240, 240, 240, 0.5) 0%, rgba(255, 255, 255, 0) 70%)',
        }}
      />
    </div>
  );
}
