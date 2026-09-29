import React from 'react';
import { FolderIcon, ChevronRightIcon } from '../common/Icons';

export default function ProjectCard({ project, onSelect }) {
  if (!project) return null;

  const memberCount = project.members?.length || 0;
  const currentVersion = project.currentVersion || project.version || (project.latestVersion ? `v${project.latestVersion}` : null);

  return (
    <div
      onClick={() => onSelect && onSelect(project)}
      className="p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A] hover:border-[#444444] transition-all cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-[#888888] shrink-0 group-hover:text-white transition-colors">
              <FolderIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white tracking-tight truncate group-hover:text-white">
                {project.name}
              </h3>
              <div className="text-[10px] font-mono text-[#666666] uppercase">
                {project.key || 'REPO'}
              </div>
            </div>
          </div>
          {currentVersion && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#181818] border border-[#333333] text-white shrink-0">
              {currentVersion}
            </span>
          )}
        </div>

        {project.description && (
          <p className="text-xs text-[#888888] line-clamp-2 mb-4 leading-relaxed">
            {project.description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-[#1A1A1A] flex items-center justify-between text-xs text-[#666666]">
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          {typeof project.progress === 'number' && (
            <>
              <span>•</span>
              <span className="text-white font-bold">{project.progress}%</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-[#888888] group-hover:text-white transition-colors text-xs font-semibold">
          <span>Open</span>
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
