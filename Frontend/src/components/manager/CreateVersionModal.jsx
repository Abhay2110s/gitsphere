import React, { useState } from 'react';
import { CloseIcon, GitCommitIcon, PlusIcon, TrashIcon } from '../common/Icons';

export default function CreateVersionModal({
  isOpen,
  onClose,
  onCreateVersion,
  project,
}) {
  const [title, setTitle] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [files, setFiles] = useState([
    { path: 'index.js', content: '// GitSphere Project Release\nconsole.log("Release v2");\n', language: 'javascript' }
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  // Initialize files from project if available and files list is default
  const handleResetToCurrentFiles = () => {
    if (project?.currentFiles && project.currentFiles.length > 0) {
      setFiles(project.currentFiles.map(f => ({ ...f })));
      setActiveFileIndex(0);
    }
  };

  const handleAddFile = () => {
    const newPath = `file_${files.length + 1}.js`;
    setFiles(prev => [...prev, { path: newPath, content: '// New source file\n', language: 'javascript' }]);
    setActiveFileIndex(files.length);
  };

  const handleRemoveFile = (index) => {
    if (files.length <= 1) return;
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (activeFileIndex >= files.length - 1) {
      setActiveFileIndex(Math.max(0, files.length - 2));
    }
  };

  const handleFileChange = (field, value) => {
    setFiles(prev => {
      const copy = [...prev];
      copy[activeFileIndex] = { ...copy[activeFileIndex], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a release title or version tag.');
      return;
    }

    try {
      setSubmitting(true);
      await onCreateVersion({
        title: title.trim(),
        commitMessage: commitMessage.trim() || title.trim(),
        files: files.filter(f => f.path.trim()),
      });
      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to create project version release.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextVersionNum = (project?.currentVersion || 1) + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#0F0F0F] border border-[#262626] rounded-2xl p-6 sm:p-8 shadow-2xl relative animate-scale-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#222222] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1C1C1C] border border-[#333333] flex items-center justify-center text-white">
              <GitCommitIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Create Project Version Release</h3>
              <p className="text-xs text-[#888888]">
                Publish a new version snapshot for <strong className="text-white">{project?.name}</strong> (Target: <span className="font-mono text-emerald-400 font-bold">v{nextVersionNum}</span>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-[#888888] hover:text-white hover:bg-[#1C1C1C] transition-colors cursor-pointer disabled:opacity-50"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center justify-between shrink-0">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-mono">✕</button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 flex-1 flex flex-col overflow-y-auto pr-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                Release Title / Tag *
              </label>
              <input
                type="text"
                required
                placeholder={`Release v${nextVersionNum} - Production Sprint`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-xs focus:border-white focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider mb-1.5">
                Commit Message / Release Notes
              </label>
              <input
                type="text"
                placeholder="Summary of changes in this version"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#141414] border border-[#262626] text-white text-xs focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* Files Snapshot Management */}
          <div className="pt-2 border-t border-[#1F1F1F]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-semibold text-[#AAAAAA] uppercase tracking-wider">
                Release Code Snapshot ({files.length} {files.length === 1 ? 'file' : 'files'})
              </label>
              <div className="flex items-center gap-2">
                {project?.currentFiles && project.currentFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetToCurrentFiles}
                    className="text-[10px] font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
                  >
                    Load Current Project Files
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddFile}
                  className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <PlusIcon className="w-3 h-3" />
                  <span>Add File</span>
                </button>
              </div>
            </div>

            {/* File tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#222222]">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveFileIndex(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-mono cursor-pointer transition-colors border ${
                    activeFileIndex === idx
                      ? 'bg-[#1C1C1C] border-[#333333] text-white font-bold'
                      : 'bg-[#111111] border-transparent text-[#666666] hover:text-[#AAAAAA]'
                  }`}
                >
                  <span>{file.path || `file_${idx + 1}`}</span>
                  {files.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                      className="text-[#666666] hover:text-red-400 p-0.5 rounded"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Active file path & code editor */}
            {files[activeFileIndex] && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-[#777777] uppercase mb-1">File Path</label>
                    <input
                      type="text"
                      value={files[activeFileIndex].path}
                      onChange={(e) => handleFileChange('path', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono focus:border-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#777777] uppercase mb-1">Language</label>
                    <select
                      value={files[activeFileIndex].language || 'javascript'}
                      onChange={(e) => handleFileChange('language', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono focus:border-white focus:outline-none"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="json">JSON</option>
                      <option value="markdown">Markdown</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#777777] uppercase mb-1">File Code Content</label>
                  <textarea
                    rows={6}
                    value={files[activeFileIndex].content}
                    onChange={(e) => handleFileChange('content', e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] text-white font-mono text-xs focus:border-white focus:outline-none resize-none"
                    placeholder="// Write or paste file code here..."
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-[#222222] flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#333333] text-xs font-bold text-[#AAAAAA] hover:text-white hover:border-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Version...</span>
                </>
              ) : (
                <>
                  <GitCommitIcon className="w-4 h-4" />
                  <span>Publish Version v{nextVersionNum}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
