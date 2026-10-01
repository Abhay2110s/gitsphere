import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CodeMirrorEditor from '../../components/common/CodeMirrorEditor';
import {
  SUPPORTED_LANGUAGES,
  detectLanguage,
} from '../../utils/editorLanguages';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { tasksApi } from '../../api/tasks.api';
import { workspaceApi } from '../../api/workspace.api';
import { contributionsApi } from '../../api/contributions.api';
import PageHeader from '../../components/developer/PageHeader';
import ErrorState from '../../components/developer/ErrorState';
import {
  CodeIcon,
  PlusIcon,
  CheckIcon,
  GitCommitIcon,
  CloseIcon,
  FolderIcon,
  GitBranchIcon,
  SaveIcon,
  ChevronRightIcon,
} from '../../components/common/Icons';

function getFileLanguageBadge(filename = '') {
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
    case 'xml':
      return { label: 'XML', color: 'text-emerald-300 bg-emerald-300/10 border-emerald-300/30' };
    case 'yaml':
    case 'yml':
      return { label: 'YML', color: 'text-pink-400 bg-pink-400/10 border-pink-400/30' };
    case 'md':
      return { label: 'MD', color: 'text-zinc-300 bg-zinc-300/10 border-zinc-300/30' };
    default:
      return { label: 'TXT', color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/30' };
  }
}

export default function DeveloperCodeEditor({
  initialProject = null,
  initialTask = null,
  initialFile = null,
  onContributionSubmitted,
}) {
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const [selectedProjectId, setSelectedProjectId] = useState(
    initialProject?._id || initialProject?.id || ''
  );
  const [selectedTaskId, setSelectedTaskId] = useState(
    initialTask?._id || initialTask?.id || ''
  );

  const effectiveProjectId =
    selectedProjectId || (projects.length > 0 ? projects[0]._id || projects[0].id : '');

  const effectiveTaskId =
    selectedTaskId ||
    (tasks.length > 0
      ? tasks.find((t) => (t.project?._id || t.project) === effectiveProjectId)?._id ||
        tasks[0]._id ||
        tasks[0].id
      : '');

  const [files, setFiles] = useState([]);
  const [openTabs, setOpenTabs] = useState(() => (initialFile ? [initialFile] : []));
  const [activeFileId, setActiveFileId] = useState(() => (initialFile?._id || initialFile?.id || initialFile?.name || null));
  const [fileContents, setFileContents] = useState({});
  const [initialContents, setInitialContents] = useState({});
  const [activeLanguage, setActiveLanguage] = useState(() => (initialFile?.language || 'javascript'));
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [activeActivity, setActiveActivity] = useState('explorer');

  const [loadingFiles, setLoadingFiles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // New File Modal
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFilePath, setNewFilePath] = useState('');
  const [newFileLang, setNewFileLang] = useState('javascript');

  // Submit Contribution Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [contributionNotes, setContributionNotes] = useState('');
  const [submittingContribution, setSubmittingContribution] = useState(false);
  const [contributionSuccess, setContributionSuccess] = useState(null);
  const [syncingProject, setSyncingProject] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // Active file resolution
  const activeFile = useMemo(() => {
    return files.find((f) => (f._id || f.id || f.name || f.fileName) === activeFileId) || null;
  }, [files, activeFileId]);

  const editorCode = activeFileId ? (fileContents[activeFileId] ?? activeFile?.content ?? '') : '';
  const initialCode = activeFileId ? (initialContents[activeFileId] ?? activeFile?.content ?? '') : '';
  const isDirty = editorCode !== initialCode;

  // Open file in tabs
  const handleSelectFile = useCallback((file) => {
    if (!file || file.type === 'folder') return;
    const fileId = file._id || file.id || file.name || file.fileName;

    setOpenTabs((prev) => {
      if (!prev.some((f) => (f._id || f.id || f.name || f.fileName) === fileId)) {
        return [...prev, file];
      }
      return prev;
    });

    setActiveFileId(fileId);
    setActiveLanguage(file.language || detectLanguage(file.name || file.path || file.fileName));

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
  }, []);

  // Close tab
  const handleCloseTab = (e, fileIdToClose) => {
    e.stopPropagation();
    const updatedTabs = openTabs.filter((f) => (f._id || f.id || f.name || f.fileName) !== fileIdToClose);
    setOpenTabs(updatedTabs);

    if (activeFileId === fileIdToClose) {
      if (updatedTabs.length > 0) {
        const next = updatedTabs[updatedTabs.length - 1];
        const nextId = next._id || next.id || next.name || next.fileName;
        setActiveFileId(nextId);
        setActiveLanguage(next.language || detectLanguage(next.name || next.path || next.fileName));
      } else {
        setActiveFileId(null);
      }
    }
  };

  // Fetch files when task changes
  useEffect(() => {
    if (!effectiveTaskId) return;
    let ignore = false;

    tasksApi
      .getTaskFiles(effectiveTaskId)
      .then((res) => {
        if (!ignore) {
          const rawList = Array.isArray(res) ? res : res?.files || res?.data || [];
          const list = rawList.map((f) => ({
            ...f,
            name: f.name || f.fileName,
            path: f.path || (f.filePath && f.filePath !== '/' ? `${f.filePath.replace(/^\/+|\/+$/g, '')}/${f.fileName}` : f.fileName),
          }));
          setFiles(list);
          if (list.length > 0) {
            handleSelectFile(list[0]);
          } else {
            setOpenTabs([]);
            setActiveFileId(null);
          }
          setLoadingFiles(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
          setFiles([]);
          setOpenTabs([]);
          setActiveFileId(null);
          setLoadingFiles(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [effectiveTaskId, handleSelectFile]);

  // Handle code change
  const handleCodeChange = (newVal) => {
    if (!activeFileId) return;
    setFileContents((prev) => ({ ...prev, [activeFileId]: newVal }));
  };

  // Save current file
  const handleSaveFile = async () => {
    if (!activeFile) return;
    try {
      setSaving(true);
      setError(null);
      const fileId = activeFile._id || activeFile.id;

      if (fileId) {
        await workspaceApi.updateFile(fileId, { content: editorCode });
      } else if (effectiveTaskId) {
        const normalized = (activeFile.path || activeFile.name || activeFile.fileName || '').replace(/\\/g, '/').replace(/^\/+/, '');
        const lastSlashIndex = normalized.lastIndexOf('/');
        const fileName = lastSlashIndex !== -1 ? normalized.slice(lastSlashIndex + 1) : normalized;
        const filePath = lastSlashIndex !== -1 ? `/${normalized.slice(0, lastSlashIndex)}` : '/';

        await tasksApi.createTaskFile(effectiveTaskId, {
          fileName,
          filePath,
          path: normalized,
          name: fileName,
          content: editorCode,
          language: activeLanguage,
        });
      }

      setInitialContents((prev) => ({ ...prev, [activeFileId]: editorCode }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      // Update in files list
      setFiles((prev) =>
        prev.map((f) =>
          (f._id && f._id === fileId) || (fileId && f.id === fileId) || (f.name && f.name === activeFile.name) || (f.fileName && f.fileName === activeFile.fileName)
            ? { ...f, content: editorCode, language: activeLanguage }
            : f
        )
      );
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  // Reset editor code to saved state
  const handleResetCode = () => {
    if (!activeFileId) return;
    setFileContents((prev) => ({ ...prev, [activeFileId]: initialCode }));
  };

  // Create new file
  const handleCreateFile = async (e) => {
    e.preventDefault();
    if (!newFilePath.trim() || !effectiveTaskId) return;

    try {
      setSaving(true);
      setError(null);
      const trimmed = newFilePath.trim();
      const computedLang = newFileLang || detectLanguage(trimmed);
      const normalized = trimmed.replace(/\\/g, '/').replace(/^\/+/, '');
      const lastSlashIndex = normalized.lastIndexOf('/');
      const fileName = lastSlashIndex !== -1 ? normalized.slice(lastSlashIndex + 1) : normalized;
      const filePath = lastSlashIndex !== -1 ? `/${normalized.slice(0, lastSlashIndex)}` : '/';

      const res = await tasksApi.createTaskFile(effectiveTaskId, {
        fileName,
        filePath,
        path: normalized,
        name: fileName,
        content: `// ${normalized}\n`,
        language: computedLang,
      });

      const rawFile = res?.data || res;
      const newFile = {
        ...rawFile,
        name: rawFile.name || rawFile.fileName || fileName,
        path: rawFile.path || (rawFile.filePath && rawFile.filePath !== '/' ? `${rawFile.filePath.replace(/^\/+|\/+$/g, '')}/${rawFile.fileName}` : rawFile.fileName) || normalized,
      };

      setFiles((prev) => [...prev, newFile]);
      handleSelectFile(newFile);
      setShowNewFileModal(false);
      setNewFilePath('');
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  // Auto-update language selector when filename input changes in modal
  const handleNewFilePathChange = (e) => {
    const val = e.target.value;
    setNewFilePath(val);
    const detected = detectLanguage(val);
    if (detected) {
      setNewFileLang(detected);
    }
  };

  // Sync workspace files with project repository
  const handleSyncProject = async () => {
    if (!effectiveTaskId) return;
    try {
      setSyncingProject(true);
      setError(null);
      const res = await tasksApi.syncTaskFiles(effectiveTaskId);
      const rawList = res?.data?.files || res?.files || [];
      const list = rawList.map((f) => ({
        ...f,
        name: f.name || f.fileName,
        path: f.path || (f.filePath && f.filePath !== '/' ? `${f.filePath.replace(/^\/+|\/+$/g, '')}/${f.fileName}` : f.fileName),
      }));
      setFiles(list);
      if (!activeFileId && list.length > 0) {
        handleSelectFile(list[0]);
      }
      setSyncMessage(res?.message || 'Workspace synchronized with project repository.');
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err) {
      setError(err);
    } finally {
      setSyncingProject(false);
    }
  };

  // Submit contribution to backend
  const handleSubmitContribution = async (e) => {
    e.preventDefault();
    if (!effectiveProjectId || !effectiveTaskId || files.length === 0) return;

    try {
      setSubmittingContribution(true);
      setError(null);

      // Save currently active file first if modified
      if (activeFile && isDirty) {
        await handleSaveFile();
      }

      const payload = {
        projectId: effectiveProjectId,
        taskId: effectiveTaskId,
        files: files.map((f) => {
          const fid = f._id || f.id || f.name;
          const currentContent = fileContents[fid] !== undefined ? fileContents[fid] : f.content || '';
          return {
            path: f.path || f.name,
            content: currentContent,
            language: f.language || detectLanguage(f.name || f.path),
          };
        }),
        notes: contributionNotes.trim(),
      };

      const result = await contributionsApi.createContribution(payload);
      setContributionSuccess(result);
      setShowSubmitModal(false);
      setContributionNotes('');
      if (onContributionSubmitted) {
        onContributionSubmitted(result);
      }
    } catch (err) {
      setError(err);
    } finally {
      setSubmittingContribution(false);
    }
  };

  const currentProjectName = projects.find((p) => (p._id || p.id) === effectiveProjectId)?.name || 'Project';
  const currentTaskTitle = tasks.find((t) => (t._id || t.id) === effectiveTaskId)?.title || 'Task Workspace';

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-[calc(100vh-140px)] min-h-[640px]">
      <PageHeader
        title="GitSphere Code Editor"
        description="VS Code-powered collaborative editor with multi-language support, syntax highlighting, and review lifecycle."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewFileModal(true)}
              disabled={!effectiveTaskId}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#333333] hover:border-white text-xs font-bold text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>New File</span>
            </button>

            <button
              onClick={handleSyncProject}
              disabled={!effectiveTaskId || syncingProject}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#333333] hover:border-white text-xs font-bold text-[#CCCCCC] hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
              title="Pull latest approved files from project repository"
            >
              <GitBranchIcon className="w-3.5 h-3.5" />
              <span>{syncingProject ? 'Syncing...' : 'Sync Project'}</span>
            </button>

            <button
              onClick={handleSaveFile}
              disabled={!activeFile || saving || !isDirty}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : isDirty
                  ? 'bg-white text-black hover:bg-[#E5E5E5]'
                  : 'bg-[#181818] text-[#666666] border border-[#262626]'
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : saving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <SaveIcon className="w-3.5 h-3.5" />
                  <span>Save (Ctrl+S)</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={files.length === 0 || !effectiveTaskId}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] disabled:opacity-40 transition-colors cursor-pointer shadow-sm"
            >
              <GitCommitIcon className="w-3.5 h-3.5" />
              <span>Submit Contribution</span>
            </button>
          </div>
        }
      />

      {/* Project Sync Notification Banner */}
      {syncMessage && (
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-between text-xs text-blue-400 font-mono animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{syncMessage}</span>
          </div>
          <button
            onClick={() => setSyncMessage(null)}
            className="p-1 hover:text-white transition-colors cursor-pointer"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Contribution Success Banner */}
      {contributionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs text-emerald-400 font-mono animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Contribution submitted successfully! Assigned manager will review your changes.</span>
          </div>
          <button
            onClick={() => setContributionSuccess(null)}
            className="p-1 hover:text-white transition-colors cursor-pointer"
          >
            <CloseIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Project & Task Selector Strip */}
      <div className="p-2.5 rounded-xl border border-[#2B2B2B] bg-[#141414] flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#888888]">Repository:</span>
          <select
            value={effectiveProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedTaskId('');
              setActiveFileId(null);
            }}
            className="bg-[#1C1C1C] border border-[#333333] text-white text-xs font-mono rounded-lg px-2.5 py-1 outline-none cursor-pointer"
          >
            {projects.length === 0 ? (
              <option value="">No projects</option>
            ) : (
              projects.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#888888]">Task:</span>
          <select
            value={effectiveTaskId}
            onChange={(e) => {
              setSelectedTaskId(e.target.value);
              setActiveFileId(null);
            }}
            className="bg-[#1C1C1C] border border-[#333333] text-white text-xs font-mono rounded-lg px-2.5 py-1 outline-none cursor-pointer max-w-[240px] truncate"
          >
            {tasks.length === 0 ? (
              <option value="">No tasks</option>
            ) : (
              tasks.map((t) => (
                <option key={t._id || t.id} value={t._id || t.id}>
                  {t.title}
                </option>
              ))
            )}
          </select>
        </div>

        {isDirty && (
          <span className="text-[11px] font-mono text-amber-400 ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Unsaved changes
          </span>
        )}
      </div>

      {error && (
        <ErrorState
          title="Editor Error"
          message={error.message || 'Operation failed'}
          onRetry={() => setError(null)}
        />
      )}

      {/* VS Code Main Frame */}
      <div className="flex-1 flex flex-col border border-[#2B2B2B] rounded-xl overflow-hidden bg-[#1E1E1E] shadow-2xl min-h-0">
        <div className="flex flex-1 min-h-0">
          {/* VS Code Activity Bar (Far Left Strip) */}
          <div className="w-12 bg-[#333333]/30 border-r border-[#2B2B2B] flex flex-col items-center py-2 select-none shrink-0 z-10">
            <button
              onClick={() => setActiveActivity(activeActivity === 'explorer' ? null : 'explorer')}
              title="Explorer"
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative ${
                activeActivity === 'explorer' ? 'text-white' : 'text-[#858585] hover:text-white'
              }`}
            >
              {activeActivity === 'explorer' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#007ACC] rounded-r" />
              )}
              <FolderIcon className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveActivity(activeActivity === 'git' ? null : 'git')}
              title="Source Control"
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors cursor-pointer relative ${
                activeActivity === 'git' ? 'text-white' : 'text-[#858585] hover:text-white'
              }`}
            >
              {activeActivity === 'git' && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-[#007ACC] rounded-r" />
              )}
              <GitBranchIcon className="w-4 h-4" />
            </button>
          </div>

          {/* VS Code Explorer Sidebar */}
          {activeActivity && (
            <div className="w-56 bg-[#252526] border-r border-[#2B2B2B] flex flex-col shrink-0 overflow-hidden select-none">
              <div className="px-3 py-2.5 border-b border-[#2D2D2D] flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#AAAAAA]">
                  FILES ({files.length})
                </span>
                <button
                  onClick={() => setShowNewFileModal(true)}
                  className="p-1 text-[#888888] hover:text-white transition-colors cursor-pointer"
                  title="Create file"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                {loadingFiles ? (
                  <div className="p-4 text-center">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-[11px] font-mono text-[#888888]">Loading files...</p>
                  </div>
                ) : files.length === 0 ? (
                  <p className="text-[11px] font-mono text-[#666666] p-3 text-center">
                    No files in task.
                  </p>
                ) : (
                  files.map((file) => {
                    const fid = file._id || file.id || file.name || file.fileName;
                    const isSelected = activeFileId === fid;
                    const displayName = file.path || file.name || file.fileName || 'untitled';
                    const badge = getFileLanguageBadge(displayName);

                    return (
                      <button
                        key={fid}
                        onClick={() => handleSelectFile(file)}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#37373D] text-white font-medium'
                            : 'text-[#CCCCCC] hover:text-white hover:bg-[#2A2D2E]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-4 h-4 text-[9px] font-mono font-bold flex items-center justify-center rounded border shrink-0 ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                          <span className="truncate">{displayName}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Center Editor Container */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#1E1E1E]">
            {/* VS Code Tab Bar */}
            <div className="flex items-center justify-between bg-[#252526] border-b border-[#2B2B2B] overflow-x-auto no-scrollbar">
              <div className="flex items-center flex-1 min-w-0">
                {openTabs.map((tab) => {
                  const tabId = tab._id || tab.id || tab.name || tab.fileName;
                  const isActive = activeFileId === tabId;
                  const tabDirty = fileContents[tabId] !== initialContents[tabId] && fileContents[tabId] !== undefined;
                  const displayName = tab.path || tab.name || tab.fileName || 'untitled';
                  const badge = getFileLanguageBadge(displayName);

                  return (
                    <div
                      key={tabId}
                      onClick={() => {
                        setActiveFileId(tabId);
                        setActiveLanguage(tab.language || detectLanguage(displayName));
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono border-r border-[#2B2B2B] cursor-pointer select-none relative transition-colors ${
                        isActive
                          ? 'bg-[#1E1E1E] text-white font-medium border-t-2 border-t-[#007ACC]'
                          : 'bg-[#2D2D2D] text-[#969696] hover:bg-[#282828] hover:text-white border-t-2 border-t-transparent'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 text-[8px] font-mono font-bold flex items-center justify-center rounded border shrink-0 ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <span className="truncate max-w-[140px]">{displayName}</span>

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

              {/* Tab Header Controls */}
              <div className="flex items-center gap-2 px-3 py-1">
                {isDirty && (
                  <button
                    onClick={handleResetCode}
                    className="text-xs font-mono text-[#888888] hover:text-white underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* VS Code Breadcrumb Bar */}
            {activeFile && (
              <div className="flex items-center gap-1.5 px-4 py-1 bg-[#1E1E1E] border-b border-[#2B2B2B] text-[11px] font-mono text-[#888888]">
                <span>{currentProjectName}</span>
                <ChevronRightIcon className="w-3 h-3 text-[#555555]" />
                <span className="truncate max-w-[150px]">{currentTaskTitle}</span>
                <ChevronRightIcon className="w-3 h-3 text-[#555555]" />
                <span className="text-[#CCCCCC]">{activeFile.path || activeFile.name || activeFile.fileName}</span>
                {isDirty && <span className="text-amber-400 font-bold ml-1">●</span>}
                {saveSuccess && (
                  <span className="ml-auto text-emerald-400 flex items-center gap-1 text-[10px]">
                    <CheckIcon className="w-3 h-3" /> Saved
                  </span>
                )}
              </div>
            )}

            {/* Editor Body */}
            <div className="flex-1 min-w-0 min-h-0 bg-[#1E1E1E]">
              {activeFile ? (
                <CodeMirrorEditor
                  value={editorCode}
                  onChange={handleCodeChange}
                  onCursorChange={setCursor}
                  onSave={handleSaveFile}
                  filename={activeFile.path || activeFile.name || activeFile.fileName}
                  language={activeLanguage}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#666666] bg-[#1E1E1E] h-full">
                  <div className="w-12 h-12 rounded-xl bg-[#252526] border border-[#333333] flex items-center justify-center text-[#888888] mb-4">
                    <CodeIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    NO FILE OPEN
                  </h3>
                  <p className="mt-1 text-xs text-[#888888] max-w-sm">
                    Select a project file from the explorer on the left or create a new file to begin writing code.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* VS Code Status Bar */}
        <div className="h-6 bg-[#007ACC] text-white flex items-center justify-between px-3 text-[11px] font-mono select-none shrink-0 z-20">
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

      {/* MODAL: Create New File */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0F0F0F] border border-[#2B2B2B] rounded-2xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#222222] mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Create New File
              </h3>
              <button
                onClick={() => setShowNewFileModal(false)}
                className="text-[#888888] hover:text-white cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFile} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-[#888888] uppercase block mb-1">
                  File Path / Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. src/auth/login.rs or app.go"
                  value={newFilePath}
                  onChange={handleNewFilePathChange}
                  required
                  className="w-full bg-[#181818] border border-[#333333] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#888888] uppercase block mb-1">
                  Language Mode
                </label>
                <select
                  value={newFileLang}
                  onChange={(e) => setNewFileLang(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333333] text-white text-xs font-mono rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name} ({lang.ext})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setShowNewFileModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#333333] text-xs font-bold text-[#888888] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newFilePath.trim() || saving}
                  className="px-5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  {saving ? 'Creating...' : 'Create File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Submit Contribution */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0F0F0F] border border-[#2B2B2B] rounded-2xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#222222] mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <GitCommitIcon className="w-4 h-4" />
                <span>Submit Code Contribution</span>
              </h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-[#888888] hover:text-white cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitContribution} className="space-y-4">
              <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] text-xs space-y-1">
                <div className="flex justify-between font-mono">
                  <span className="text-[#888888]">Files to Submit:</span>
                  <span className="text-white font-bold">{files.length}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#888888]">Status after submit:</span>
                  <span className="text-white font-bold">IN_REVIEW</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#888888] uppercase block mb-1">
                  Submission Notes / Commit Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Summarize the changes and implemented functionality..."
                  value={contributionNotes}
                  onChange={(e) => setContributionNotes(e.target.value)}
                  className="w-full bg-[#181818] border border-[#333333] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#333333] text-xs font-bold text-[#888888] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingContribution}
                  className="px-5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] disabled:opacity-40 transition-colors cursor-pointer"
                >
                  {submittingContribution ? 'Submitting to Review...' : 'Submit to Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
