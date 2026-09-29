import React, { useState, useCallback } from 'react';
import EmptyState from '../../components/workspace/EmptyState';
import {
  FolderIcon,
  FileIcon,
  CodeIcon,
  SaveIcon,
  SendIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '../../components/common/Icons';

/** Lazy Monaco import to avoid SSR issues */
let MonacoEditor = null;
try {
  MonacoEditor = React.lazy(() => import('@monaco-editor/react'));
} catch {
  MonacoEditor = null;
}

function MiniFileTree({ files, selectedFile, onSelect }) {
  if (!files || files.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-[#555555] font-mono">
        No files
      </div>
    );
  }

  return (
    <div className="py-2 space-y-0.5">
      {files.map((file, i) => {
        const isSelected = selectedFile?._id === file._id;
        const isFolder = file.type === 'folder';
        return (
          <button
            key={file._id || i}
            onClick={() => !isFolder && onSelect?.(file)}
            className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono rounded transition-colors cursor-pointer ${
              isSelected
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#777777] hover:text-white hover:bg-[#0F0F0F]'
            }`}
          >
            {isFolder ? (
              <FolderIcon className="w-3 h-3 shrink-0" />
            ) : (
              <FileIcon className="w-3 h-3 shrink-0" />
            )}
            <span className="truncate">{file.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function CodeEditor({ files = [], loading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [code, setCode] = useState('');
  const [unsaved, setUnsaved] = useState(false);
  const [language, setLanguage] = useState('javascript');

  const detectLanguage = (name) => {
    if (!name) return 'plaintext';
    const ext = name.split('.').pop()?.toLowerCase();
    const map = {
      js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
      py: 'python', java: 'java', c: 'c', cpp: 'cpp', go: 'go',
      rs: 'rust', rb: 'ruby', php: 'php', css: 'css', html: 'html',
      json: 'json', xml: 'xml', yaml: 'yaml', yml: 'yaml', md: 'markdown',
      sql: 'sql', sh: 'shell', bash: 'shell',
    };
    return map[ext] || 'plaintext';
  };

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    setCode(file.content || '');
    setLanguage(detectLanguage(file.name));
    setUnsaved(false);
  }, []);

  const handleCodeChange = (value) => {
    setCode(value || '');
    setUnsaved(true);
  };

  if (files.length === 0 && !loading) {
    return (
      <EmptyState
        icon={CodeIcon}
        title="No files available"
        description="Create a file or add project files to begin coding."
        actionLabel="Create File"
        onAction={() => {}}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1A1A1A] bg-[#070707]">
        <div className="flex items-center gap-2 text-xs font-mono text-[#666666]">
          <CodeIcon className="w-3.5 h-3.5 text-[#555555]" />
          <span>project</span>
          {selectedFile && (
            <>
              <ChevronRightIcon className="w-3 h-3 text-[#444444]" />
              <span className="text-white">{selectedFile.name}</span>
              {unsaved && (
                <span className="w-2 h-2 rounded-full bg-white ml-1" title="Unsaved changes" />
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={!unsaved}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] text-white text-xs font-bold hover:bg-[#222222] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <SaveIcon className="w-3 h-3" />
            Save
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer shadow-sm">
            <SendIcon className="w-3 h-3" />
            Submit
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Mini File Explorer */}
        <div className="w-48 shrink-0 border-r border-[#1A1A1A] bg-[#070707] overflow-y-auto hidden md:block">
          <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#555555] border-b border-[#1A1A1A]">
            Explorer
          </div>
          <MiniFileTree
            files={files}
            selectedFile={selectedFile}
            onSelect={handleFileSelect}
          />
        </div>

        {/* Editor */}
        <div className="flex-1 min-w-0">
          {!selectedFile ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <CodeIcon className="w-10 h-10 text-[#333333] mx-auto mb-3" />
                <p className="text-sm font-bold text-[#666666]">Select a file to start editing</p>
                <p className="text-xs text-[#555555] mt-1">Choose a file from the explorer panel</p>
              </div>
            </div>
          ) : MonacoEditor ? (
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center h-full text-xs font-mono text-[#555555]">
                  Loading editor...
                </div>
              }
            >
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                  padding: { top: 12 },
                }}
              />
            </React.Suspense>
          ) : (
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full h-full p-4 bg-transparent text-white font-mono text-sm resize-none focus:outline-none"
              spellCheck={false}
            />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-[#1A1A1A] bg-[#070707] text-[10px] font-mono text-[#555555]">
        <div className="flex items-center gap-4">
          <span>{language}</span>
          {unsaved && <span className="text-[#AAAAAA]">● Modified</span>}
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>LF</span>
        </div>
      </div>
    </div>
  );
}
