import React, { useMemo } from 'react';

/**
 * Ultra-smooth, GPU-accelerated atmospheric sliding beam animation
 * adhering strictly to GitSphere's pure black, white, and grayscale color direction.
 */
export default function MonochromeRays() {
  const length = 25;
  const animationTime = 48; // seconds for silky smooth glide

  // Softer grayscale palettes for buttery smooth blending
  const colorPermutations = [
    ['rgba(15, 15, 15, 0.35)', 'rgba(70, 70, 70, 0.28)', 'rgba(160, 160, 160, 0.25)'],
    ['rgba(15, 15, 15, 0.35)', 'rgba(160, 160, 160, 0.25)', 'rgba(70, 70, 70, 0.28)'],
    ['rgba(160, 160, 160, 0.25)', 'rgba(15, 15, 15, 0.35)', 'rgba(70, 70, 70, 0.28)'],
    ['rgba(160, 160, 160, 0.25)', 'rgba(70, 70, 70, 0.28)', 'rgba(15, 15, 15, 0.35)'],
    ['rgba(70, 70, 70, 0.28)', 'rgba(160, 160, 160, 0.25)', 'rgba(15, 15, 15, 0.35)'],
    ['rgba(70, 70, 70, 0.28)', 'rgba(15, 15, 15, 0.35)', 'rgba(160, 160, 160, 0.25)'],
  ];

  const beams = useMemo(() => {
    return Array.from({ length }, (_, i) => {
      const idx = i + 1;
      const palette = colorPermutations[i % colorPermutations.length];
      const duration = animationTime - (animationTime / length / 2) * idx;
      const delay = -((idx / length) * animationTime);

      const boxShadow = `
        -140px 0 90px 45px #ffffff,
        -55px 0 60px 30px ${palette[0]},
        0 0 60px 30px ${palette[1]},
        55px 0 60px 30px ${palette[2]},
        140px 0 90px 45px #ffffff
      `;

      return {
        id: idx,
        style: {
          height: '130%',
          width: 0,
          top: '-15%',
          right: 0,
          position: 'absolute',
          transformOrigin: 'top right',
          boxShadow,
          animation: `${duration}s linear infinite beamSlideGPU`,
          animationDelay: `${delay}s`,
          willChange: 'transform',
        },
      };
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 25 Sliding Monochrome Light Beams (GPU accelerated) */}
      {beams.map((beam) => (
        <div key={beam.id} style={beam.style} />
      ))}

      {/* Horizontal Softening Vignette (.h) */}
      <div
        style={{
          boxShadow: '0 0 50vh 40vh white',
          width: '100%',
          height: 0,
          bottom: 0,
          left: 0,
          position: 'absolute',
        }}
      />

      {/* Vertical Softening Vignette (.v) */}
      <div
        style={{
          boxShadow: '0 0 35vw 25vw white',
          width: 0,
          height: '100%',
          bottom: 0,
          left: 0,
          position: 'absolute',
        }}
      />
    </div>
  );
}
