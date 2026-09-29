import React, { useState, useEffect } from 'react';
import { projectsApi } from '../../api/projects.api';
import PageHeader from '../../components/developer/PageHeader';
import EmptyState from '../../components/developer/EmptyState';
import ErrorState from '../../components/developer/ErrorState';
import TaskCard from '../../components/developer/TaskCard';
import { TableSkeleton } from '../../components/developer/LoadingSkeleton';
import {
  FolderIcon,
  ChevronLeftIcon,
  TaskCheckIcon,
  GitCommitIcon,
  UsersIcon,
  CodeIcon,
} from '../../components/common/Icons';

export default function ProjectDetails({
  project: initialProject,
  projectId: propProjectId,
  onBackToProjects,
  onSelectTask,
  onOpenWorkspace,
}) {
  const projectId = initialProject?._id || initialProject?.id || propProjectId;

  const [project, setProject] = useState(initialProject || null);
  const [tasks, setTasks] = useState([]);
  const [versions, setVersions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tasks' | 'versions' | 'code'
  const [projectCode, setProjectCode] = useState(null);
  const [loading, setLoading] = useState(!initialProject);
  const [error, setError] = useState(null);

  const fetchProjectData = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const [projData, taskData, versionData] = await Promise.all([
        projectsApi.getProject(projectId).catch(() => initialProject),
        projectsApi.getProjectTasks(projectId).catch(() => []),
        projectsApi.getVersionHistory(projectId).catch(() => []),
      ]);

      if (projData) setProject(projData);
      setTasks(Array.isArray(taskData) ? taskData : taskData?.tasks || []);
      setVersions(Array.isArray(versionData) ? versionData : versionData?.versions || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const loadProjectCode = async () => {
    try {
      const code = await projectsApi.getProjectCode(projectId);
      setProjectCode(code);
    } catch (err) {
      console.error('Failed to load project code:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'code' && !projectCode) {
      loadProjectCode();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-[#222222] rounded animate-pulse" />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBackToProjects}
          className="flex items-center gap-1.5 text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>
        <ErrorState
          title="Project not found"
          message={error?.message || 'We could not locate this project.'}
          onRetry={fetchProjectData}
        />
      </div>
    );
  }

  const members = project.members || [];
  const currentVersion = project.currentVersion || (versions.length > 0 ? `v${versions[0].version}` : 'v1');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back navigation */}
      <button
        onClick={onBackToProjects}
        className="flex items-center gap-1.5 text-xs font-mono text-[#888888] hover:text-white transition-colors cursor-pointer"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        <span>Back to Projects</span>
      </button>

      {/* Project Banner Header */}
      <div className="p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#141414] border border-[#2A2A2A] flex items-center justify-center text-white shrink-0">
            <FolderIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {project.name}
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C1C1C] border border-[#333333] text-white">
                {currentVersion}
              </span>
            </div>
            {project.description && (
              <p className="mt-1 text-xs text-[#888888] max-w-xl leading-relaxed">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {onOpenWorkspace && (
          <button
            onClick={() => onOpenWorkspace(project)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-[#E5E5E5] transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            <CodeIcon className="w-4 h-4" />
            <span>Open Workspace</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#222222] pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white text-black font-bold'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          Overview & Team
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-white text-black font-bold'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'versions'
              ? 'bg-white text-black font-bold'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          Versions ({versions.length})
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'code'
              ? 'bg-white text-black font-bold'
              : 'text-[#888888] hover:text-white'
          }`}
        >
          Latest Code
        </button>
      </div>

      {/* TAB 1: Overview & Team */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A] space-y-4">
            <h3 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase pb-3 border-b border-[#1A1A1A]">
              PROJECT DETAILS
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-[#666666]">Status:</span>
                <span className="text-white ml-2 font-bold uppercase">{project.status || 'Active'}</span>
              </div>
              <div>
                <span className="text-[#666666]">Version:</span>
                <span className="text-white ml-2 font-bold">{currentVersion}</span>
              </div>
              <div>
                <span className="text-[#666666]">Created:</span>
                <span className="text-white ml-2">
                  {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '—'}
                </span>
              </div>
              <div>
                <span className="text-[#666666]">Last Updated:</span>
                <span className="text-white ml-2">
                  {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A]">
            <h3 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase pb-3 border-b border-[#1A1A1A] mb-4">
              COLLABORATING TEAM ({members.length})
            </h3>
            {members.length === 0 ? (
              <p className="text-xs text-[#666666]">No members listed.</p>
            ) : (
              <div className="space-y-3">
                {members.map((m, idx) => {
                  const mName = typeof m === 'object' ? m.name || m.email : 'Member';
                  const mRole = typeof m === 'object' ? m.role || 'DEVELOPER' : 'MEMBER';
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <div className="w-7 h-7 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center font-bold text-white text-[10px]">
                        {mName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{mName}</div>
                        <div className="text-[10px] font-mono text-[#666666] uppercase">{mRole}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Tasks */}
      {activeTab === 'tasks' && (
        <div>
          {tasks.length === 0 ? (
            <EmptyState
              icon={TaskCheckIcon}
              title="NO TASKS IN PROJECT"
              description="No tasks have been created for this project yet."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id || task.id}
                  task={task}
                  onSelect={onSelectTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Versions */}
      {activeTab === 'versions' && (
        <div className="p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A]">
          <h3 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase pb-4 border-b border-[#1A1A1A] mb-4">
            APPROVED VERSION HISTORY
          </h3>
          {versions.length === 0 ? (
            <EmptyState
              icon={GitCommitIcon}
              title="NO APPROVED VERSIONS YET"
              description="Approved contributions will increment project releases and appear in this history."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <div className="divide-y divide-[#1A1A1A]">
              {versions.map((ver, i) => (
                <div key={ver._id || i} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#161616] border border-[#282828] text-white">
                      v{ver.version}
                    </span>
                    <div>
                      <div className="text-white font-semibold">
                        {ver.title || `Release v${ver.version}`}
                      </div>
                      <div className="text-[10px] text-[#666666]">
                        {ver.approvedBy?.name ? `Approved by ${ver.approvedBy.name}` : 'Main branch'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-[#555555]">
                    {ver.createdAt ? new Date(ver.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Code */}
      {activeTab === 'code' && (
        <div className="p-6 rounded-2xl border border-[#222222] bg-[#0A0A0A]">
          <h3 className="text-xs font-mono font-bold tracking-widest text-[#AAAAAA] uppercase pb-4 border-b border-[#1A1A1A] mb-4">
            APPROVED CODE REPOSITORY
          </h3>
          {!projectCode || !projectCode.files || projectCode.files.length === 0 ? (
            <EmptyState
              icon={CodeIcon}
              title="NO APPROVED CODE YET"
              description="When a contribution is approved by a manager, the master code branch will be published here."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <div className="space-y-4">
              {projectCode.files.map((file, idx) => (
                <div key={idx} className="border border-[#222222] rounded-xl overflow-hidden bg-[#0D0D0D]">
                  <div className="px-4 py-2 border-b border-[#1A1A1A] bg-[#141414] flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">{file.path || file.name}</span>
                    <span className="text-[#666666]">{file.language || 'text'}</span>
                  </div>
                  <pre className="p-4 text-xs font-mono text-[#C0C0C0] overflow-x-auto whitespace-pre">
                    {file.content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
