import React, { useState, useEffect } from 'react';
import DeveloperLayout from '../../components/developer/DeveloperLayout';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

// Main 10 Sections
import Dashboard from './Dashboard';
import Projects from './Projects';
import ProjectDetails from './ProjectDetails';
import Tasks from './Tasks';
import TaskDetails from './TaskDetails';
import Workspace from './Workspace';
import DeveloperCodeEditor from './DeveloperCodeEditor';
import Contributions from './Contributions';
import ContributionDetails from './ContributionDetails';
import Reviews from './Reviews';
import ReviewDetails from './ReviewDetails';
import Messages from './Messages';
import Notifications from './Notifications';
import Settings from './Settings';

export default function DeveloperApp({ initialSection = 'dashboard', onNavigateToLanding }) {
  const { user, loading: authLoading, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const getSectionFromUrl = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const target = hash || path;

      if (target.includes('project-details') || target.includes('projects/')) return 'project-details';
      if (target.includes('project')) return 'projects';
      if (target.includes('task-details') || target.includes('tasks/')) return 'task-details';
      if (target.includes('task')) return 'tasks';
      if (target.includes('workspace')) return 'workspace';
      if (target.includes('code')) return 'code';
      if (target.includes('contribution-details') || target.includes('contributions/')) return 'contribution-details';
      if (target.includes('contribution')) return 'contributions';
      if (target.includes('review-details') || target.includes('reviews/')) return 'review-details';
      if (target.includes('review')) return 'reviews';
      if (target.includes('message')) return 'messages';
      if (target.includes('notification')) return 'notifications';
      if (target.includes('setting')) return 'settings';
    }
    return initialSection;
  };

  const [currentSection, setCurrentSection] = useState(getSectionFromUrl);

  // Selected item state for detail views
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedFileForEditor, setSelectedFileForEditor] = useState(null);

  // Handle URL hash / history popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentSection(getSectionFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const handleNavigate = (sectionId, extra = null) => {
    setCurrentSection(sectionId);

    if (sectionId === 'project-details' && extra) {
      setSelectedProject(extra);
    } else if (sectionId === 'task-details' && extra) {
      setSelectedTask(extra);
    } else if (sectionId === 'contribution-details' && extra) {
      setSelectedContribution(extra);
    } else if (sectionId === 'review-details' && extra) {
      setSelectedReview(extra);
    } else if (sectionId === 'workspace' && extra) {
      if (extra.project) setSelectedProject(extra.project);
      if (extra.task) setSelectedTask(extra.task);
    } else if (sectionId === 'code' && extra) {
      if (extra.project) setSelectedProject(extra.project);
      if (extra.task) setSelectedTask(extra.task);
      if (extra.file) setSelectedFileForEditor(extra.file);
    }

    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `#developer/${sectionId}`);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleLogout = async () => {
    await logout();
    if (onNavigateToLanding) {
      onNavigateToLanding();
    }
  };

  // Derive active root route for sidebar highlighting
  const getActiveRootRoute = () => {
    if (currentSection.startsWith('project')) return 'projects';
    if (currentSection.startsWith('task')) return 'tasks';
    if (currentSection.startsWith('contribution')) return 'contributions';
    if (currentSection.startsWith('review')) return 'reviews';
    return currentSection;
  };

  return (
    <DeveloperLayout
      currentRoute={getActiveRootRoute()}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      unreadNotificationsCount={unreadCount}
      user={user}
    >
      {/* 1. Dashboard */}
      {currentSection === 'dashboard' && (
        <Dashboard
          onNavigateToProjects={() => handleNavigate('projects')}
          onNavigateToTasks={() => handleNavigate('tasks')}
          onNavigateToContributions={() => handleNavigate('contributions')}
          onSelectProject={(proj) => handleNavigate('project-details', proj)}
          onSelectTask={(task) => handleNavigate('task-details', task)}
        />
      )}

      {/* 2. Projects & Project Details */}
      {currentSection === 'projects' && (
        <Projects onSelectProject={(proj) => handleNavigate('project-details', proj)} />
      )}

      {currentSection === 'project-details' && (
        <ProjectDetails
          project={selectedProject}
          onBackToProjects={() => handleNavigate('projects')}
          onSelectTask={(task) => handleNavigate('task-details', task)}
          onOpenWorkspace={(proj) => handleNavigate('workspace', { project: proj })}
        />
      )}

      {/* 3. Tasks & Task Details */}
      {currentSection === 'tasks' && (
        <Tasks
          onSelectTask={(task) => handleNavigate('task-details', task)}
          onOpenWorkspace={(task) => handleNavigate('workspace', { task })}
        />
      )}

      {currentSection === 'task-details' && (
        <TaskDetails
          task={selectedTask}
          onBackToTasks={() => handleNavigate('tasks')}
          onOpenWorkspace={(task) => handleNavigate('workspace', { task })}
          onOpenCodeEditor={(task) => handleNavigate('code', { task })}
        />
      )}

      {/* 4. Workspace */}
      {currentSection === 'workspace' && (
        <Workspace
          initialProject={selectedProject}
          initialTask={selectedTask}
          onOpenCodeEditor={({ project, task, file }) =>
            handleNavigate('code', { project, task, file })
          }
          onNavigateToContributions={() => handleNavigate('contributions')}
        />
      )}

      {/* 5. Code Editor */}
      {currentSection === 'code' && (
        <DeveloperCodeEditor
          initialProject={selectedProject}
          initialTask={selectedTask}
          initialFile={selectedFileForEditor}
          onContributionSubmitted={() => handleNavigate('contributions')}
        />
      )}

      {/* 6. Contributions & Contribution Details */}
      {currentSection === 'contributions' && (
        <Contributions
          onSelectContribution={(contrib) => handleNavigate('contribution-details', contrib)}
          onNavigateToCodeEditor={() => handleNavigate('code')}
        />
      )}

      {currentSection === 'contribution-details' && (
        <ContributionDetails
          contribution={selectedContribution}
          onBackToContributions={() => handleNavigate('contributions')}
          onOpenWorkspace={() => handleNavigate('workspace')}
        />
      )}

      {/* 7. Reviews & Review Details */}
      {currentSection === 'reviews' && (
        <Reviews onSelectReview={(rev) => handleNavigate('review-details', rev)} />
      )}

      {currentSection === 'review-details' && (
        <ReviewDetails
          review={selectedReview}
          onBackToReviews={() => handleNavigate('reviews')}
          onOpenWorkspace={() => handleNavigate('workspace')}
        />
      )}

      {/* 8. Messages */}
      {currentSection === 'messages' && <Messages />}

      {/* 9. Notifications */}
      {currentSection === 'notifications' && <Notifications />}

      {/* 10. Settings */}
      {currentSection === 'settings' && <Settings onLogout={handleLogout} />}
    </DeveloperLayout>
  );
}
