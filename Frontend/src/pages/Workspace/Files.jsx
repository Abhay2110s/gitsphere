import { useState } from 'react';
import EmptyState from '../../components/workspace/EmptyState';
import { TableSkeleton } from '../../components/workspace/SkeletonLoaders';
import {
  FolderIcon,
  FileIcon,
  SearchIcon,
  PlusIcon,
  ChevronRightIcon,
  CodeIcon,
  TrashIcon,
  DownloadIcon,
} from '../../components/common/Icons';

export default function Files({ files = [], loading, onNavigate, userRole }) {
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  if (loading) return <TableSkeleton rows={5} />;

  const filteredFiles = files.filter((f) =>
    f.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white">Files</h1>
          <p className="text-xs font-mono text-[#666666] mt-1">
            {files.length} file{files.length !== 1 ? 's' : ''} in project
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555555]" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 w-52 rounded-lg bg-[#0A0A0A] border border-[#222222] text-xs text-white placeholder:text-[#555555] focus:outline-none focus:border-[#444444] transition-colors"
            />
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white text-xs font-bold hover:bg-[#1A1A1A] transition-colors cursor-pointer">
            <PlusIcon className="w-3.5 h-3.5" />
            New File
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white text-xs font-bold hover:bg-[#1A1A1A] transition-colors cursor-pointer">
            <FolderIcon className="w-3.5 h-3.5" />
            New Folder
          </button>
        </div>
      </div>

      {/* File Tree or Empty State */}
      {files.length === 0 ? (
        <EmptyState
          icon={FolderIcon}
          title="No files yet"
          description="Files added to this project will appear here."
          actionLabel="Create File"
          onAction={() => {}}
        />
      ) : (
        <div className="border border-[#222222] rounded-xl bg-[#0A0A0A] overflow-hidden">
          {/* Breadcrumb */}
          <div className="px-4 py-3 border-b border-[#1A1A1A] bg-[#070707] flex items-center gap-2 text-xs font-mono text-[#666666]">
            <FolderIcon className="w-3.5 h-3.5 text-[#555555]" />
            <span>Project Root</span>
            {selectedFile && (
              <>
                <ChevronRightIcon className="w-3 h-3 text-[#444444]" />
                <span className="text-white">{selectedFile.name}</span>
              </>
            )}
          </div>

          <div className="divide-y divide-[#1A1A1A]">
            {filteredFiles.map((file, i) => (
              <div
                key={file._id || i}
                className="flex items-center justify-between px-4 py-3 hover:bg-[#0F0F0F] transition-colors group"
              >
                <button
                  onClick={() => setSelectedFile(file)}
                  className="flex items-center gap-3 text-left cursor-pointer"
                >
                  {file.type === 'folder' ? (
                    <FolderIcon className="w-4 h-4 text-[#666666]" />
                  ) : (
                    <FileIcon className="w-4 h-4 text-[#666666]" />
                  )}
                  <div>
                    <span className="text-xs font-semibold text-white">{file.name}</span>
                    {file.path && (
                      <span className="text-[10px] font-mono text-[#555555] ml-2">{file.path}</span>
                    )}
                  </div>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onNavigate?.('editor')}
                    className="p-1.5 rounded-md text-[#666666] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                    title="Open in Editor"
                  >
                    <CodeIcon className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded-md text-[#666666] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer" title="Download">
                    <DownloadIcon className="w-3.5 h-3.5" />
                  </button>
                  {userRole === 'MANAGER' && (
                    <button className="p-1.5 rounded-md text-[#666666] hover:text-red-400 hover:bg-[#1A1A1A] transition-colors cursor-pointer" title="Delete">
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
