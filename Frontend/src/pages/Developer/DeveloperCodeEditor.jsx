import React, { useState, useEffect } from 'react';
import CodeMirrorEditor from '../../components/common/CodeMirrorEditor';
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
} from '../../components/common/Icons';

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
  const [selectedFile, setSelectedFile] = useState(initialFile || null);
  const [editorCode, setEditorCode] = useState('');
  const [initialCode, setInitialCode] = useState('');
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

  // Fetch files when task changes
  useEffect(() => {
    if (!effectiveTaskId) {
      return;
    }
    let ignore = false;
    tasksApi
      .getTaskFiles(effectiveTaskId)
      .then((res) => {
        if (!ignore) {
          const list = Array.isArray(res) ? res : res?.files || [];
          setFiles(list);
          if (list.length > 0) {
            setSelectedFile(list[0]);
            setEditorCode(list[0].content || '');
            setInitialCode(list[0].content || '');
          }
          setLoadingFiles(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
          setFiles([]);
          setLoadingFiles(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [effectiveTaskId]);

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setEditorCode(file.content || '');
    setInitialCode(file.content || '');
  };

  // Save current file
  const handleSaveFile = async () => {
    if (!selectedFile) return;
    try {
      setSaving(true);
      setError(null);
      const fileId = selectedFile._id || selectedFile.id;
      if (fileId) {
        await workspaceApi.updateFile(fileId, { content: editorCode });
      } else if (selectedTaskId) {
        await tasksApi.createTaskFile(selectedTaskId, {
          path: selectedFile.path || selectedFile.name,
          content: editorCode,
          language: selectedFile.language || 'javascript',
        });
      }

      setInitialCode(editorCode);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      // Update in files list
      setFiles((prev) =>
        prev.map((f) =>
          (f._id && f._id === fileId) || f.name === selectedFile.name
            ? { ...f, content: editorCode }
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
    setEditorCode(initialCode);
  };

  // Create new file
  const handleCreateFile = async (e) => {
    e.preventDefault();
    if (!newFilePath.trim() || !selectedTaskId) return;

    try {
      setSaving(true);
      const newFile = await tasksApi.createTaskFile(selectedTaskId, {
        path: newFilePath.trim(),
        content: `// ${newFilePath.trim()}\n`,
        language: newFileLang,
      });

      setFiles((prev) => [...prev, newFile]);
      setSelectedFile(newFile);
      setEditorCode(newFile.content);
      setInitialCode(newFile.content);
      setShowNewFileModal(false);
      setNewFilePath('');
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  // Submit contribution to backend
  const handleSubmitContribution = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedTaskId || files.length === 0) return;

    try {
      setSubmittingContribution(true);
      setError(null);

      // Save currently active file first if modified
      if (selectedFile && editorCode !== initialCode) {
        await handleSaveFile();
      }

      const payload = {
        projectId: selectedProjectId,
        taskId: selectedTaskId,
        files: files.map((f) => ({
          path: f.path || f.name,
          content: (selectedFile && (selectedFile._id === f._id || selectedFile.name === f.name)) ? editorCode : (f.content || ''),
          language: f.language || 'javascript',
        })),
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

  const isDirty = editorCode !== initialCode;

  return (
    <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      <PageHeader
        title="GitSphere Code Editor"
        description="Collaborative code workspace with real-time editing, syntax highlighting, and contribution review lifecycle."
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
              onClick={handleSaveFile}
              disabled={!selectedFile || saving || !isDirty}
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
                <span>Save File</span>
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

      {/* Contribution Success Banner */}
      {contributionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-between text-xs text-emerald-400 font-mono animate-fade-in">
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

      {/* Selectors Bar */}
      <div className="p-3 rounded-xl border border-[#222222] bg-[#0A0A0A] flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#666666]">Repo:</span>
          <select
            value={effectiveProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedTaskId('');
              setSelectedFile(null);
            }}
            className="bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono rounded-lg px-2.5 py-1 outline-none cursor-pointer"
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
          <span className="text-[#666666]">Task:</span>
          <select
            value={effectiveTaskId}
            onChange={(e) => {
              setSelectedTaskId(e.target.value);
              setSelectedFile(null);
            }}
            className="bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono rounded-lg px-2.5 py-1 outline-none cursor-pointer"
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
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
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

      {/* Editor Body */}
      <div className="flex-1 flex border border-[#222222] rounded-2xl overflow-hidden bg-[#0A0A0A]">
        {/* Left Sidebar: File Tree */}
        <div className="w-56 border-r border-[#222222] bg-[#070707] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#1C1C1C] flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666666]">
              Files ({files.length})
            </span>
            <button
              onClick={() => setShowNewFileModal(true)}
              className="p-1 text-[#888888] hover:text-white transition-colors cursor-pointer"
              title="Create new file"
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingFiles ? (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2" />
                <p className="text-[11px] font-mono text-[#666666]">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <p className="text-[11px] font-mono text-[#555555] p-3 text-center">
                No files in this task.
              </p>
            ) : (
              files.map((file) => {
                const isSelected =
                  (selectedFile?._id && file._id === selectedFile._id) ||
                  selectedFile?.name === file.name;

                return (
                  <button
                    key={file._id || file.id || file.name}
                    onClick={() => handleSelectFile(file)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white text-black font-bold'
                        : 'text-[#AAAAAA] hover:text-white hover:bg-[#141414]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <CodeIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{file.path || file.name}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center: CodeMirror Editor Container */}
        <div className="flex-1 flex flex-col bg-[#0A0A0A]">
          {selectedFile ? (
            <>
              {/* Tab Header */}
              <div className="h-9 bg-[#141414] border-b border-[#222222] px-4 flex items-center justify-between text-xs font-mono">
                <span className="text-white font-semibold">
                  {selectedFile.path || selectedFile.name}
                </span>
                <div className="flex items-center gap-3 text-[#666666] text-[11px]">
                  <span>{selectedFile.language || 'javascript'}</span>
                  {isDirty && (
                    <button
                      onClick={handleResetCode}
                      className="text-xs hover:text-white underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* CodeMirror Component */}
              <div className="flex-1 h-full min-h-0">
                <CodeMirrorEditor
                  value={editorCode}
                  onChange={(val) => setEditorCode(val)}
                  filename={selectedFile.path || selectedFile.name}
                  language={selectedFile.language || 'javascript'}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#666666] bg-[#0A0A0A]">
              <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-center text-[#888888] mb-4">
                <CodeIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                NO FILE SELECTED
              </h3>
              <p className="mt-1 text-xs text-[#888888] max-w-sm">
                Select a project file from the left sidebar or create a new file to start editing.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Create New File */}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A] mb-4">
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
                  placeholder="e.g. src/auth/login.js"
                  value={newFilePath}
                  onChange={(e) => setNewFilePath(e.target.value)}
                  required
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-[#888888] uppercase block mb-1">
                  Language
                </label>
                <select
                  value={newFileLang}
                  onChange={(e) => setNewFileLang(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono rounded-xl px-3 py-2 outline-none cursor-pointer"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="json">JSON</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="python">Python</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1A1A1A]">
                <button
                  type="button"
                  onClick={() => setShowNewFileModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#262626] text-xs font-bold text-[#888888] hover:text-white cursor-pointer"
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
          <div className="w-full max-w-lg bg-[#0A0A0A] border border-[#222222] rounded-2xl p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A] mb-4">
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
              <div className="p-3 rounded-xl bg-[#111111] border border-[#222222] text-xs space-y-1">
                <div className="flex justify-between text-mono">
                  <span className="text-[#666666]">Files to Submit:</span>
                  <span className="text-white font-bold">{files.length}</span>
                </div>
                <div className="flex justify-between text-mono">
                  <span className="text-[#666666]">Status after submit:</span>
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
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-3.5 py-2 text-xs text-white placeholder-[#666666] outline-none focus:border-white transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#1A1A1A]">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#262626] text-xs font-bold text-[#888888] hover:text-white cursor-pointer"
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
