import React, { useState, useMemo } from 'react';
import EmptyState from '../../components/workspace/EmptyState';
import CodeMirrorEditor from '../../components/common/CodeMirrorEditor';
import {
  SUPPORTED_LANGUAGES,
  detectLanguage,
} from '../../utils/editorLanguages';
import {
  FolderIcon,
  CodeIcon,
  SaveIcon,
  ChevronRightIcon,
  CloseIcon,
  GitBranchIcon,
  CheckIcon,
} from '../../components/common/Icons';

function getFileLanguageIcon(filename = '') {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'rs':
      return { label: 'RS', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
    case 'go':
      return { label: 'GO', color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' };
    case 'py':
      return { label: 'PY', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' };
    case 'js':
    case 'jsx':
      return { label: 'JS', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' };
    case 'ts':
    case 'tsx':
      return { label: 'TS', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' };
    case 'sql':
      return { label: 'SQL', color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' };
    case 'php':
      return { label: 'PHP', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30' };
    case 'html':
      return { label: 'HTML', color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' };
    case 'css':
      return { label: 'CSS', color: 'text-sky-400 bg-sky-400/10 border-sky-400/30' };
    case 'json':
      return { label: '{ }', color: 'text-yellow-300 bg-yellow-300/10 border-yellow-300/30' };
    case 'yaml':
    case 'yml':
      return { label: 'YML', color: 'text-pink-400 bg-pink-400/10 border-pink-400/30' };
    case 'md':
      return { label: 'MD', color: 'text-zinc-300 bg-zinc-300/10 border-zinc-300/30' };
    default:
      return { label: 'TXT', color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30' };
  }
}

export default function CodeEditor({ files = [], loading, project, onNavigate }) {
  const [openTabs, setOpenTabs] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [fileContents, setFileContents] = useState({});
  const [initialContents, setInitialContents] = useState({});
  const [activeLanguage, setActiveLanguage] = useState('javascript');
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [activeActivity, setActiveActivity] = useState('explorer');
  const [savedBanner, setSavedBanner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find currently active file without synchronous setState in effect
  const activeFile = useMemo(() => {
    if (selectedFileId) {
      const match = files.find((f) => (f._id || f.id || f.name) === selectedFileId);
      if (match) return match;
    }
    if (openTabs.length > 0) {
      return openTabs[0];
    }
    return files.find((f) => f.type !== 'folder') || files[0] || null;
  }, [files, selectedFileId, openTabs]);

  const activeFileKey = activeFile ? (activeFile._id || activeFile.id || activeFile.name) : null;
  const currentCode = activeFileKey ? (fileContents[activeFileKey] ?? activeFile?.content ?? '') : '';
  const initialCode = activeFileKey ? (initialContents[activeFileKey] ?? activeFile?.content ?? '') : '';
  const isUnsaved = currentCode !== initialCode;

  // Open file in tab
  const handleOpenFile = (file) => {
    if (!file || file.type === 'folder') return;
    const fileId = file._id || file.id || file.name;

    setOpenTabs((prev) => {
      if (!prev.some((f) => (f._id || f.id || f.name) === fileId)) {
        return [...prev, file];
      }
      return prev;
    });

    setSelectedFileId(fileId);
    setActiveLanguage(detectLanguage(file.name));

    setFileContents((prev) => {
      if (prev[fileId] === undefined) {
        return { ...prev, [fileId]: file.content || '' };
      }
      return prev;
    });
    setInitialContents((prev) => {
      if (prev[fileId] === undefined) {
        return { ...prev, [fileId]: file.content || '' };
      }
      return prev;
    });
  };

  // Close tab
  const handleCloseTab = (e, fileIdToClose) => {
    e.stopPropagation();
    const updatedTabs = openTabs.filter((f) => (f._id || f.id || f.name) !== fileIdToClose);
    setOpenTabs(updatedTabs);

    if (activeFileKey === fileIdToClose) {
      if (updatedTabs.length > 0) {
        const next = updatedTabs[updatedTabs.length - 1];
        const nextId = next._id || next.id || next.name;
        setSelectedFileId(nextId);
        setActiveLanguage(detectLanguage(next.name));
      } else {
        setSelectedFileId(null);
      }
    }
  };

  // Code change
  const handleCodeChange = (newVal) => {
    if (!activeFileKey) return;
    setFileContents((prev) => ({ ...prev, [activeFileKey]: newVal }));
  };

  // Save active file
  const handleSave = () => {
    if (!activeFileKey) return;
    setInitialContents((prev) => ({ ...prev, [activeFileKey]: currentCode }));
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const effectiveTabs = useMemo(() => {
    if (openTabs.length > 0) return openTabs;
    return activeFile ? [activeFile] : [];
  }, [openTabs, activeFile]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    return files.filter((f) => f.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()));
  }, [files, searchQuery]);

  if (files.length === 0 && !loading) {
    return (
      <EmptyState
        icon={CodeIcon}
        title="No files in workspace"
        description="Add repository files or create a script to begin writing code."
        actionLabel="Go to Files"
        onAction={() => onNavigate?.('files')}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[580px] rounded-xl border border-[#2B2B2B] bg-[#1E1E1E] overflow-hidden text-white font-sans shadow-2xl">
      {/* Main Workspace Frame */}
      <div className="flex flex-1 min-h-0">
        {/* VS Code Left Activity Bar */}
        <div className="w-12 bg-[#333333]/40 border-r border-[#2B2B2B] flex flex-col items-center py-2 select-none shrink-0 z-10">
          <button
            onClick={() => setActiveActivity(activeActivity === 'explorer' ? null : 'explorer')}
            title="Explorer (Ctrl+Shift+E)"
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative ${
              activeActivity === 'explorer'
                ? 'text-white'
                : 'text-[#858585] hover:text-white'
            }`}
          >
            {activeActivity === 'explorer' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#007ACC] rounded-r" />
            )}
            <FolderIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveActivity(activeActivity === 'search' ? null : 'search')}
            title="Search (Ctrl+Shift+F)"
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative ${
              activeActivity === 'search'
                ? 'text-white'
                : 'text-[#858585] hover:text-white'
            }`}
          >
            {activeActivity === 'search' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#007ACC] rounded-r" />
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <button
            onClick={() => setActiveActivity(activeActivity === 'git' ? null : 'git')}
            title="Source Control (Ctrl+Shift+G)"
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative ${
              activeActivity === 'git'
                ? 'text-white'
                : 'text-[#858585] hover:text-white'
            }`}
          >
            {activeActivity === 'git' && (
              <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#007ACC] rounded-r" />
            )}
            <GitBranchIcon className="w-4 h-4" />
          </button>

          <div className="mt-auto">
            <div className="w-10 h-10 flex items-center justify-center text-[#858585] hover:text-white cursor-pointer" title="Manage Settings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
          </div>
        </div>

        {/* VS Code Side Panel (Explorer / Search / Git) */}
        {activeActivity && (
          <div className="w-56 bg-[#252526] border-r border-[#2B2B2B] flex flex-col shrink-0 overflow-hidden select-none">
            {activeActivity === 'explorer' && (
              <>
                <div className="px-4 py-2.5 flex items-center justify-between text-[11px] font-bold tracking-wider text-[#BBBBBB] uppercase border-b border-[#2D2D2D]">
                  <span className="truncate">EXPLORER: {project?.name || 'PROJECT'}</span>
                  <span className="text-[10px] text-[#777777] font-mono">{files.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto py-1">
                  {filteredFiles.map((file, i) => {
                    const fileId = file._id || file.id || file.name;
                    const isSelected = activeFileKey === fileId;
                    const isFolder = file.type === 'folder';
                    const iconInfo = getFileLanguageIcon(file.name);

                    return (
                      <button
                        key={fileId || i}
                        onClick={() => !isFolder && handleOpenFile(file)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-mono transition-colors text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#37373D] text-white font-medium'
                            : 'text-[#CCCCCC] hover:bg-[#2A2D2E] hover:text-white'
                        }`}
                      >
                        {isFolder ? (
                          <FolderIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <span
                            className={`w-4 h-4 text-[9px] font-mono font-bold flex items-center justify-center rounded border shrink-0 ${iconInfo.color}`}
                          >
                            {iconInfo.label}
                          </span>
                        )}
                        <span className="truncate">{file.name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {activeActivity === 'search' && (
              <div className="p-3 space-y-3">
                <span className="text-[11px] font-bold tracking-wider text-[#BBBBBB] uppercase block">
                  SEARCH
                </span>
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#3C3C3C] text-xs text-white border border-[#4B4B4B] focus:border-[#007ACC] focus:outline-none"
                />
                <div className="text-[11px] text-[#888888]">
                  {searchQuery ? `${filteredFiles.length} match(es)` : 'Type to filter files'}
                </div>
              </div>
            )}

            {activeActivity === 'git' && (
              <div className="p-3 space-y-3 text-xs">
                <span className="text-[11px] font-bold tracking-wider text-[#BBBBBB] uppercase block">
                  SOURCE CONTROL
                </span>
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
                  <GitBranchIcon className="w-3.5 h-3.5" />
                  <span>main branch up to date</span>
                </div>
                <p className="text-[11px] text-[#888888] leading-relaxed">
                  Working tree clean. Use developer workspace to submit reviewed pull requests.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Center Editor Container */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1E1E1E]">
          {/* VS Code Tab Bar */}
          <div className="flex items-center justify-between bg-[#252526] border-b border-[#2B2B2B] overflow-x-auto no-scrollbar">
            <div className="flex items-center flex-1 min-w-0">
              {effectiveTabs.map((tab) => {
                const tabId = tab._id || tab.id || tab.name;
                const isActive = activeFileKey === tabId;
                const tabDirty = fileContents[tabId] !== initialContents[tabId] && fileContents[tabId] !== undefined;
                const iconInfo = getFileLanguageIcon(tab.name);

                return (
                  <div
                    key={tabId}
                    onClick={() => {
                      setSelectedFileId(tabId);
                      setActiveLanguage(detectLanguage(tab.name));
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono border-r border-[#2B2B2B] cursor-pointer select-none relative transition-colors ${
                      isActive
                        ? 'bg-[#1E1E1E] text-white font-medium border-t-2 border-t-[#007ACC]'
                        : 'bg-[#2D2D2D] text-[#969696] hover:bg-[#282828] hover:text-white border-t-2 border-t-transparent'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 text-[8px] font-mono font-bold flex items-center justify-center rounded border shrink-0 ${iconInfo.color}`}
                    >
                      {iconInfo.label}
                    </span>
                    <span className="truncate max-w-[140px]">{tab.name}</span>

                    {/* Dirty dot or Close button */}
                    <button
                      onClick={(e) => handleCloseTab(e, tabId)}
                      className="w-4 h-4 rounded flex items-center justify-center text-[#888888] hover:text-white hover:bg-[#333333] transition-colors ml-1 cursor-pointer"
                      title={tabDirty ? 'Unsaved changes' : 'Close tab'}
                    >
                      {tabDirty ? (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      ) : (
                        <CloseIcon className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Top Right Action Bar */}
            <div className="flex items-center gap-1.5 px-3 py-1">
              <button
                onClick={handleSave}
                disabled={!isUnsaved}
                title="Save (Ctrl+S / Cmd+S)"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#333333] hover:bg-[#3E3E3E] disabled:opacity-40 text-xs font-mono text-white transition-colors cursor-pointer"
              >
                <SaveIcon className="w-3 h-3" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* VS Code Breadcrumb Bar */}
          {activeFile && (
            <div className="flex items-center gap-1.5 px-4 py-1 bg-[#1E1E1E] border-b border-[#2B2B2B] text-[11px] font-mono text-[#888888]">
              <span>{project?.name || 'workspace'}</span>
              <ChevronRightIcon className="w-3 h-3 text-[#555555]" />
              <span>src</span>
              <ChevronRightIcon className="w-3 h-3 text-[#555555]" />
              <span className="text-[#CCCCCC]">{activeFile.name}</span>
              {isUnsaved && <span className="text-amber-400 font-bold ml-1">●</span>}
              {savedBanner && (
                <span className="ml-auto text-emerald-400 flex items-center gap-1 text-[10px]">
                  <CheckIcon className="w-3 h-3" /> Saved
                </span>
              )}
            </div>
          )}

          {/* Editor Core */}
          <div className="flex-1 min-h-0 bg-[#1E1E1E]">
            {!activeFile ? (
              <div className="flex items-center justify-center h-full text-center p-6">
                <div>
                  <CodeIcon className="w-12 h-12 text-[#333333] mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#888888]">No editor tab active</p>
                  <p className="text-xs text-[#555555] mt-1">Select a file from the explorer on the left</p>
                </div>
              </div>
            ) : (
              <CodeMirrorEditor
                value={currentCode}
                onChange={handleCodeChange}
                onCursorChange={setCursor}
                onSave={handleSave}
                language={activeLanguage}
                filename={activeFile.name}
              />
            )}
          </div>
        </div>
      </div>

      {/* VS Code Status Bar */}
      <div className="h-6 bg-[#007ACC] text-white flex items-center justify-between px-3 text-[11px] font-mono select-none shrink-0 z-20">
        {/* Left items */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 hover:bg-black/10 px-1.5 py-0.5 rounded cursor-pointer">
            <GitBranchIcon className="w-3 h-3" />
            <span>main*</span>
          </div>

          <div className="flex items-center gap-1 hover:bg-black/10 px-1.5 py-0.5 rounded cursor-pointer">
            <span>⊗ 0</span>
            <span className="ml-1">⚠ 0</span>
          </div>
        </div>

        {/* Right items */}
        <div className="flex items-center gap-3">
          <span className="hover:bg-black/10 px-1.5 py-0.5 rounded cursor-pointer">
            Ln {cursor.line}, Col {cursor.col}
          </span>
          <span className="hover:bg-black/10 px-1.5 py-0.5 rounded cursor-pointer">
            Spaces: 2
          </span>
          <span className="hover:bg-black/10 px-1.5 py-0.5 rounded cursor-pointer">
            UTF-8
          </span>
          <span className="hover:bg-black/10 px-1.5 py-0.5 rounded cursor-pointer">
            LF
          </span>

          {/* Language Selector */}
          <select
            value={activeLanguage}
            onChange={(e) => setActiveLanguage(e.target.value)}
            className="bg-transparent hover:bg-black/15 text-white text-[11px] font-mono outline-none cursor-pointer px-1 py-0.5 rounded border-none"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id} className="bg-[#1E1E1E] text-white">
                {lang.name}
              </option>
            ))}
          </select>

          <span title="Prettier Formatter Active" className="hover:bg-black/10 px-1.5 py-0.5 rounded cursor-pointer">
            ✓ Prettier
          </span>
        </div>
      </div>
    </div>
  );
}
