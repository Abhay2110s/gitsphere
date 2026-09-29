import React, { useState, useEffect } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { tasksApi } from '../../api/tasks.api';
import { workspaceApi } from '../../api/workspace.api';
import PageHeader from '../../components/developer/PageHeader';
import EmptyState from '../../components/developer/EmptyState';
import ErrorState from '../../components/developer/ErrorState';
import { TableSkeleton } from '../../components/developer/LoadingSkeleton';
import {
  LayersIcon,
  CodeIcon,
  FolderIcon,
  TaskCheckIcon,
  PlusIcon,
  GitCommitIcon,
} from '../../components/common/Icons';

export default function Workspace({
  initialProject = null,
  initialTask = null,
  onOpenCodeEditor,
  onNavigateToContributions,
}) {
  const { projects, loading: loadingProjects } = useProjects();
  const { tasks, loading: loadingTasks } = useTasks();

  const [selectedProjectId, setSelectedProjectId] = useState(
    initialProject?._id || initialProject?.id || ''
  );
  const [selectedTaskId, setSelectedTaskId] = useState(
    initialTask?._id || initialTask?.id || ''
  );

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileComments, setFileComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState(null);

  // Auto-select first project/task if available and none selected
  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0]._id || projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      // Find task matching selected project if possible
      const match = tasks.find(
        (t) => t.project?._id === selectedProjectId || t.project === selectedProjectId
      );
      setSelectedTaskId(match ? match._id || match.id : tasks[0]._id || tasks[0].id);
    }
  }, [tasks, selectedProjectId, selectedTaskId]);

  // Fetch workspace files whenever selected task changes
  useEffect(() => {
    if (!selectedTaskId) {
      setFiles([]);
      setSelectedFile(null);
      return;
    }

    const fetchFiles = async () => {
      try {
        setLoadingFiles(true);
        setError(null);
        const res = await tasksApi.getTaskFiles(selectedTaskId);
        const fileList = Array.isArray(res) ? res : res?.files || [];
        setFiles(fileList);
        if (fileList.length > 0) {
          setSelectedFile(fileList[0]);
        } else {
          setSelectedFile(null);
        }
      } catch (err) {
        setError(err);
        setFiles([]);
        setSelectedFile(null);
      } finally {
        setLoadingFiles(false);
      }
    };

    fetchFiles();
  }, [selectedTaskId]);

  // Fetch comments when selected file changes
  useEffect(() => {
    if (!selectedFile?._id && !selectedFile?.id) {
      setFileComments([]);
      return;
    }

    const fetchComments = async () => {
      try {
        const fId = selectedFile._id || selectedFile.id;
        const res = await workspaceApi.getFileComments(fId);
        setFileComments(Array.isArray(res) ? res : res?.comments || []);
      } catch (err) {
        setFileComments([]);
      }
    };

    fetchComments();
  }, [selectedFile]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!selectedFile || !newComment.trim()) return;
    try {
      const fId = selectedFile._id || selectedFile.id;
      const res = await workspaceApi.createComment(fId, {
        content: newComment.trim(),
        line: 1,
      });
      if (res) {
        setFileComments((prev) => [...prev, res]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const currentTask = tasks.find((t) => (t._id || t.id) === selectedTaskId);
  const currentProject = projects.find((p) => (p._id || p.id) === selectedProjectId);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Developer Workspace"
        description="Collaborative workspace linking repositories, active task tickets, code files, and review threads."
        actions={
          onOpenCodeEditor && (
            <button
              onClick={() => onOpenCodeEditor({ project: currentProject, task: currentTask, file: selectedFile })}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer shadow-sm"
            >
              <CodeIcon className="w-4 h-4" />
              <span>Open in Monaco Editor</span>
            </button>
          )
        }
      />

      {/* Selectors Bar */}
      <div className="p-4 rounded-2xl border border-[#222222] bg-[#0A0A0A] grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-mono font-bold uppercase text-[#888888] block mb-1.5">
            Active Repository
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono rounded-xl px-3 py-2 outline-none focus:border-white transition-colors cursor-pointer"
          >
            {projects.length === 0 ? (
              <option value="">No assigned projects</option>
            ) : (
              projects.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id}>
                  {p.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-mono font-bold uppercase text-[#888888] block mb-1.5">
            Active Task Ticket
          </label>
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full bg-[#141414] border border-[#2A2A2A] text-white text-xs font-mono rounded-xl px-3 py-2 outline-none focus:border-white transition-colors cursor-pointer"
          >
            {tasks.length === 0 ? (
              <option value="">No assigned tasks</option>
            ) : (
              tasks.map((t) => (
                <option key={t._id || t.id} value={t._id || t.id}>
                  {t.title} ({t.status})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Main Workspace Stage */}
      {loadingFiles ? (
        <TableSkeleton rows={4} />
      ) : error ? (
        <ErrorState
          title="Failed to load workspace"
          message={error.message || 'Could not fetch files for this task.'}
          onRetry={() => setSelectedTaskId(selectedTaskId)}
        />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={TaskCheckIcon}
          title="NO ACTIVE TASKS"
          description="You need an assigned task to load files and begin development in the workspace."
        />
      ) : files.length === 0 ? (
        <EmptyState
          icon={LayersIcon}
          title="NO WORKSPACE FILES YET"
          description="No code files have been created for this task yet. Open the Code Editor to create files and submit contributions."
          actionLabel="Open Code Editor"
          onAction={() => onOpenCodeEditor && onOpenCodeEditor({ project: currentProject, task: currentTask })}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* File Tree Left Column */}
          <div className="lg:col-span-4 p-5 rounded-2xl border border-[#222222] bg-[#0A0A0A] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A] mb-3">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#888888]">
                  TASK FILES ({files.length})
                </span>
                {onOpenCodeEditor && (
                  <button
                    onClick={() => onOpenCodeEditor({ project: currentProject, task: currentTask })}
                    className="p-1 text-[#888888] hover:text-white transition-colors cursor-pointer"
                    title="Add file in Code Editor"
                  >
                    <PlusIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[400px]">
                {files.map((file) => {
                  const isSelected =
                    (selectedFile?._id && file._id === selectedFile._id) ||
                    (selectedFile?.name && file.name === selectedFile.name);

                  return (
                    <button
                      key={file._id || file.id || file.name}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-white text-black font-bold'
                          : 'text-[#AAAAAA] hover:text-white hover:bg-[#141414]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CodeIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{file.path || file.name}</span>
                      </div>
                      <span className="text-[10px] uppercase opacity-60 ml-2">
                        {file.language || 'txt'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedFile && (
              <div className="pt-4 border-t border-[#1A1A1A] mt-4">
                <button
                  onClick={() => onOpenCodeEditor({ project: currentProject, task: currentTask, file: selectedFile })}
                  className="w-full py-2 rounded-xl bg-[#141414] hover:bg-white hover:text-black border border-[#2A2A2A] text-xs font-bold text-white transition-all cursor-pointer text-center"
                >
                  Edit This File →
                </button>
              </div>
            )}
          </div>

          {/* File Content Preview Right Column */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="p-5 rounded-2xl border border-[#222222] bg-[#0A0A0A] flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A] mb-3">
                <div className="flex items-center gap-2 text-xs font-mono text-white">
                  <CodeIcon className="w-4 h-4 text-[#888888]" />
                  <span className="font-bold">{selectedFile?.path || selectedFile?.name}</span>
                  <span className="text-[#666666]">({selectedFile?.language || 'text'})</span>
                </div>
              </div>

              <div className="flex-1 bg-[#050505] rounded-xl border border-[#1A1A1A] p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-[#D4D4D4] whitespace-pre leading-relaxed">
                  {selectedFile?.content || '// File is empty'}
                </pre>
              </div>
            </div>

            {/* Line Comments Thread */}
            <div className="p-5 rounded-2xl border border-[#222222] bg-[#0A0A0A]">
              <h4 className="text-xs font-mono font-bold tracking-widest text-[#888888] uppercase mb-3">
                CODE COMMENTS ({fileComments.length})
              </h4>

              {fileComments.length === 0 ? (
                <p className="text-xs text-[#666666] font-mono py-2">
                  No comments yet on this file.
                </p>
              ) : (
                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                  {fileComments.map((c, i) => (
                    <div
                      key={c._id || i}
                      className="p-3 rounded-xl bg-[#111111] border border-[#222222] text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#666666] mb-1">
                        <span className="font-bold text-white">{c.user?.name || 'Reviewer'}</span>
                        <span>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                      <p className="text-[#CCCCCC]">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment on this code file..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-[#141414] border border-[#2A2A2A] rounded-xl px-3 py-1.5 text-xs text-white placeholder-[#666666] outline-none focus:border-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-[#E5E5E5] disabled:opacity-30 transition-colors cursor-pointer"
                >
                  Comment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
