import { useState, lazy, Suspense } from 'react';
import WorkspaceLayout from '../../components/workspace/WorkspaceLayout';
import { useWorkspace } from '../../hooks/useWorkspace';
import { ErrorBanner, PageSkeleton } from '../../components/workspace/SkeletonLoaders';

const Overview = lazy(() => import('./Overview'));
const Files = lazy(() => import('./Files'));
const CodeEditor = lazy(() => import('./CodeEditor'));
const Tasks = lazy(() => import('./Tasks'));
const CodeReview = lazy(() => import('./CodeReview'));
const Team = lazy(() => import('./Team'));
const Activity = lazy(() => import('./Activity'));
const Versions = lazy(() => import('./Versions'));

const LoadingFallback = () => (
  <div className="p-8">
    <PageSkeleton />
  </div>
);

export default function WorkspaceApp({ projectId, onBack, userRole = 'USER' }) {
  const [section, setSection] = useState('overview');
  const workspace = useWorkspace(projectId);

  // Derive user role from localStorage if not passed
  const role = (() => {
    if (userRole) return userRole;
    try {
      const stored = localStorage.getItem('gitsphere_user');
      if (stored) {
        const u = JSON.parse(stored);
        return u.role || 'USER';
      }
    } catch {
      // Fallback
    }
    return 'USER';
  })();

  const renderSection = () => {
    if (workspace.error) {
      return <ErrorBanner message={workspace.error} onRetry={workspace.refresh} />;
    }

    const commonProps = {
      project: workspace.project,
      stats: workspace.stats,
      loading: workspace.loading,
      error: workspace.error,
      userRole: role,
      onNavigate: setSection,
    };

    switch (section) {
      case 'overview':
        return (
          <Overview
            {...commonProps}
            progress={workspace.progress}
            activity={workspace.activity}
          />
        );
      case 'files':
        return <Files files={workspace.files} {...commonProps} />;
      case 'editor':
        return <CodeEditor files={workspace.files} {...commonProps} />;
      case 'tasks':
        return <Tasks tasks={workspace.tasks} {...commonProps} />;
      case 'reviews':
        return <CodeReview contributions={workspace.contributions} {...commonProps} />;
      case 'team':
        return <Team team={workspace.team} {...commonProps} />;
      case 'activity':
        return <Activity activity={workspace.activity} {...commonProps} />;
      case 'versions':
        return <Versions versions={workspace.versions} {...commonProps} />;
      default:
        return (
          <Overview
            {...commonProps}
            progress={workspace.progress}
            activity={workspace.activity}
          />
        );
    }
  };

  return (
    <WorkspaceLayout
      currentSection={section}
      onNavigate={setSection}
      project={workspace.project}
      onBack={onBack}
    >
      <Suspense fallback={<LoadingFallback />}>
        {renderSection()}
      </Suspense>
    </WorkspaceLayout>
  );
}
