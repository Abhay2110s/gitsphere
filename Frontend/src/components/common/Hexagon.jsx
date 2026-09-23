import React from 'react';

/**
 * Universal mathematical SVG Hexagon component
 * Used across the application for badges, icons, and geometric containers.
 * Does NOT contain any hero network design.
 */
export function HexagonShape({
  size = 64,
  fill = '#000000',
  stroke = '#222222',
  strokeWidth = 2,
  className = '',
  children,
  onClick,
}) {
  const w = size;
  const h = size * 1.1547;
  const points = `
    ${w * 0.5},0
    ${w},${h * 0.25}
    ${w},${h * 0.75}
    ${w * 0.5},${h}
    0,${h * 0.75}
    0,${h * 0.25}
  `;

  return (
    <div
      onClick={onClick}
      style={{ width: `${w}px`, height: `${h}px` }}
      className={`relative inline-flex items-center justify-center select-none transition-all duration-300 ${className}`}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-sm"
      >
        <polygon
          points={points}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </svg>
      {children && (
        <div className="relative z-10 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

export default HexagonShape;
