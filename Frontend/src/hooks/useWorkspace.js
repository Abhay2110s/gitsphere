import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '../api/projects.api';
import { contributionsApi } from '../api/contributions.api';
import { activityApi } from '../api/activity.api';

/**
 * Central hook for all project-workspace data.
 * Fetches project details, tasks, contributions, team, versions, files and activity.
 */
export function useWorkspace(projectId) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [team, setTeam] = useState([]);
  const [versions, setVersions] = useState([]);
  const [files, setFiles] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        projectsApi.getProject(projectId),
        projectsApi.getProjectTasks(projectId),
        contributionsApi.getContributions(projectId),
        projectsApi.getProjectMembers(projectId),
        projectsApi.getVersionHistory(projectId),
        projectsApi.getProjectCode(projectId),
        activityApi.getActivity({ projectId }),
      ]);

      const val = (r) => (r.status === 'fulfilled' ? r.value : null);

      setProject(val(results[0]));
      setTasks(Array.isArray(val(results[1])) ? val(results[1]) : []);
      setContributions(Array.isArray(val(results[2])) ? val(results[2]) : []);
      setTeam(Array.isArray(val(results[3])) ? val(results[3]) : []);
      setVersions(Array.isArray(val(results[4])) ? val(results[4]) : []);
      setFiles(Array.isArray(val(results[5])) ? val(results[5]) : []);
      setActivity(Array.isArray(val(results[6])) ? val(results[6]) : []);
    } catch (err) {
      setError(err.message || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    let ignore = false;
    Promise.allSettled([
      projectsApi.getProject(projectId),
      projectsApi.getProjectTasks(projectId),
      contributionsApi.getContributions(projectId),
      projectsApi.getProjectMembers(projectId),
      projectsApi.getVersionHistory(projectId),
      projectsApi.getProjectCode(projectId),
      activityApi.getActivity({ projectId }),
    ])
      .then((results) => {
        if (!ignore) {
          const val = (r) => (r.status === 'fulfilled' ? r.value : null);
          setProject(val(results[0]));
          setTasks(Array.isArray(val(results[1])) ? val(results[1]) : []);
          setContributions(Array.isArray(val(results[2])) ? val(results[2]) : []);
          setTeam(Array.isArray(val(results[3])) ? val(results[3]) : []);
          setVersions(Array.isArray(val(results[4])) ? val(results[4]) : []);
          setFiles(Array.isArray(val(results[5])) ? val(results[5]) : []);
          setActivity(Array.isArray(val(results[6])) ? val(results[6]) : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || 'Failed to load project data');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [projectId]);

  const stats = {
    tasks: tasks.length,
    contributions: contributions.length,
    reviews: contributions.filter((c) => c.status === 'IN_REVIEW' || c.status === 'APPROVED' || c.status === 'CHANGES_REQUESTED').length,
    teamMembers: team.length,
    versions: versions.length,
    files: files.length,
    todoTasks: tasks.filter((t) => t.status === 'TODO').length,
    inProgressTasks: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    completedTasks: tasks.filter((t) => t.status === 'COMPLETED').length,
    pendingReviews: contributions.filter((c) => c.status === 'IN_REVIEW').length,
    approvedReviews: contributions.filter((c) => c.status === 'APPROVED').length,
    changesRequested: contributions.filter((c) => c.status === 'CHANGES_REQUESTED').length,
  };

  const progress = stats.tasks > 0 ? Math.round((stats.completedTasks / stats.tasks) * 100) : 0;

  return {
    project,
    tasks,
    contributions,
    team,
    versions,
    files,
    activity,
    stats,
    progress,
    loading,
    error,
    refresh: fetchAll,
  };
}
