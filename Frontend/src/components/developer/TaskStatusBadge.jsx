import React from 'react';

const STATUS_CONFIG = {
  TODO: {
    label: 'To Do',
    bg: 'bg-[#1A1A1A]',
    border: 'border-[#333333]',
    text: 'text-[#AAAAAA]',
    dot: 'bg-[#666666]',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bg: 'bg-[#111111]',
    border: 'border-[#444444]',
    text: 'text-white',
    dot: 'bg-white',
  },
  IN_REVIEW: {
    label: 'In Review',
    bg: 'bg-[#181818]',
    border: 'border-[#4A4A4A]',
    text: 'text-[#CCCCCC]',
    dot: 'bg-[#999999]',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-[#141414]',
    border: 'border-[#383838]',
    text: 'text-[#DDDDDD]',
    dot: 'bg-[#888888]',
  },
  BLOCKED: {
    label: 'Blocked',
    bg: 'bg-red-950/20',
    border: 'border-red-900/40',
    text: 'text-red-400',
    dot: 'bg-red-500',
  },
};

export default function TaskStatusBadge({ status = 'TODO', className = '' }) {
  const normalized = (status || 'TODO').toUpperCase();
  const config = STATUS_CONFIG[normalized] || STATUS_CONFIG.TODO;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border ${config.bg} ${config.border} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
