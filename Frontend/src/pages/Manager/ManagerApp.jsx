import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ManagerLayout from '../../components/manager/ManagerLayout';
import Dashboard from './Dashboard';
import Projects from './Projects';
import ProjectDetails from './ProjectDetails';
import Tasks from './Tasks';
import Contributions from './Contributions';
import Reviews from './Reviews';
import Team from './Team';
import Messages from './Messages';
import Notifications from './Notifications';
import Settings from './Settings';

export default function ManagerApp({ initialSection = 'dashboard', onNavigateToLanding }) {
  const { user, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const target = hash || path;
      if (target.includes('project-details') || target.includes('projects/')) return 'project-details';
      if (target.includes('project')) return 'projects';
      if (target.includes('task')) return 'tasks';
      if (target.includes('contribution')) return 'contributions';
      if (target.includes('review')) return 'reviews';
      if (target.includes('team')) return 'team';
      if (target.includes('message')) return 'messages';
      if (target.includes('notification')) return 'notifications';
      if (target.includes('setting')) return 'settings';
    }
    return initialSection;
  });

  const [selectedProject, setSelectedProject] = useState(null);

  const handleNavigate = (sectionId, extra = null) => {
    setCurrentSection(sectionId);
    if (extra && sectionId === 'project-details') {
      setSelectedProject(extra);
    }
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `#manager/${sectionId}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    if (onNavigateToLanding) {
      onNavigateToLanding();
    }
  };

  return (
    <ManagerLayout
      currentRoute={currentSection}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      user={user}
    >
      {currentSection === 'dashboard' && (
        <Dashboard
          user={user}
          onNavigateToProjects={() => handleNavigate('projects')}
          onSelectProject={(proj) => handleNavigate('project-details', proj)}
        />
      )}

      {currentSection === 'projects' && (
        <Projects onSelectProject={(proj) => handleNavigate('project-details', proj)} />
      )}

      {currentSection === 'project-details' && (
        <ProjectDetails
          project={selectedProject}
          onBackToProjects={() => handleNavigate('projects')}
        />
      )}

      {currentSection === 'tasks' && <Tasks />}

      {currentSection === 'contributions' && <Contributions />}

      {currentSection === 'reviews' && <Reviews />}

      {currentSection === 'team' && <Team />}

      {currentSection === 'messages' && <Messages />}

      {currentSection === 'notifications' && <Notifications />}

      {currentSection === 'settings' && <Settings user={user} />}
    </ManagerLayout>
  );
}
