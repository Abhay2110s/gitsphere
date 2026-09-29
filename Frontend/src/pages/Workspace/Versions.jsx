import React, { useState } from 'react';
import EmptyState from '../../components/workspace/EmptyState';
import { TableSkeleton } from '../../components/workspace/SkeletonLoaders';
import {
  TagIcon,
  UserIcon,
  ClockIcon,
  FileIcon,
  GitCommitIcon,
  EyeIcon,
  DiffIcon,
  ChevronRightIcon,
} from '../../components/common/Icons';

export default function Versions({ versions = [], loading, onNavigate }) {
  const [selectedVersion, setSelectedVersion] = useState(null);

  if (loading) return <TableSkeleton rows={3} />;

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Version Details
  if (selectedVersion) {
    const vIdx = versions.indexOf(selectedVersion);
    const isInitial = vIdx === versions.length - 1 || versions.length === 1;

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedVersion(null)}
          className="text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
        >
          ← Back to Versions
        </button>

        <div className="p-6 rounded-xl border border-[#222222] bg-[#0A0A0A] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">
                v{selectedVersion.version || selectedVersion.versionNumber || (versions.length - vIdx)}
              </h1>
              {isInitial && (
                <span className="text-[10px] font-mono text-[#666666]">Initial project version</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#1A1A1A] pt-6">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-1">Created</div>
              <span className="text-xs font-mono text-[#AAAAAA]">{formatDate(selectedVersion.createdAt)}</span>
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-1">Approved By</div>
              <span className="text-xs font-semibold text-white">{selectedVersion.approvedBy?.name || '—'}</span>
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-1">Source Contribution</div>
              <span className="text-xs font-mono text-[#AAAAAA]">{selectedVersion.contribution?.title || '—'}</span>
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] mb-1">Files Changed</div>
              <span className="text-xs font-bold text-white">{selectedVersion.filesChanged || selectedVersion.files?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Changed files */}
        {selectedVersion.files && selectedVersion.files.length > 0 && (
          <div className="p-6 rounded-xl border border-[#222222] bg-[#0A0A0A]">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#555555] mb-4">Changes</h2>
            <div className="space-y-2">
              {selectedVersion.files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#070707] border border-[#1A1A1A]">
                  <FileIcon className="w-3.5 h-3.5 text-[#666666]" />
                  <span className="text-xs font-mono text-white">{file.path || file.name || `file_${i}`}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate?.('files')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white text-xs font-bold hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <EyeIcon className="w-3.5 h-3.5" />
            View Files
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white text-xs font-bold hover:bg-[#1A1A1A] transition-colors cursor-pointer">
            <DiffIcon className="w-3.5 h-3.5" />
            Compare Version
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black tracking-tight text-white">Versions</h1>
        <p className="text-xs font-mono text-[#666666] mt-1">
          Track the verified history of your project.
        </p>
      </div>

      {/* Version Timeline */}
      {versions.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="No versions yet"
          description="Approved contributions will create project versions automatically."
        />
      ) : (
        <div className="space-y-3">
          {versions.map((ver, i) => {
            const vNumber = ver.version || ver.versionNumber || (versions.length - i);
            return (
              <button
                key={ver._id || i}
                onClick={() => setSelectedVersion(ver)}
                className="w-full p-5 rounded-xl border border-[#222222] bg-[#0A0A0A] hover:border-[#333333] transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center shrink-0 group-hover:bg-[#1A1A1A] transition-colors">
                      <TagIcon className="w-4 h-4 text-[#888888]" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-black text-white">v{vNumber}</div>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#666666]">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {formatDate(ver.createdAt)}
                        </span>
                        {ver.approvedBy?.name && (
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            {ver.approvedBy.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <FileIcon className="w-3 h-3" />
                          {ver.filesChanged || ver.files?.length || 0} files
                        </span>
                      </div>
                      {ver.contribution?.title && (
                        <div className="flex items-center gap-1.5 text-[10px] text-[#555555]">
                          <GitCommitIcon className="w-3 h-3" />
                          <span>{ver.contribution.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 h-4 text-[#444444] group-hover:text-white transition-colors shrink-0 mt-3" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
