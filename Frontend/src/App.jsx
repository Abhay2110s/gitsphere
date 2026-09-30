import { useState, useEffect, lazy, Suspense } from 'react';
import LandingPage from './pages/public/LandingPage';

const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const OtpVerificationPage = lazy(() => import('./pages/public/OtpVerificationPage'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/public/ResetPasswordPage'));
const ManagerApp = lazy(() => import('./pages/Manager/ManagerApp'));
const DeveloperApp = lazy(() => import('./pages/Developer/DeveloperApp'));
const WorkspaceApp = lazy(() => import('./pages/Workspace/WorkspaceApp'));
const NotFoundPage = lazy(() => import('./pages/System/NotFound'));
const UnauthorizedPage = lazy(() => import('./pages/System/Unauthorized'));
const ErrorSystemPage = lazy(() => import('./pages/System/Error'));

function App() {
  const getInitialRoute = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (hash.startsWith('#workspace') || path.startsWith('/workspace')) {
        return 'workspace';
      }

      if (path === '/unauthorized' || hash === '#unauthorized') {
        return 'unauthorized';
      }

      if (path === '/error' || hash === '#error') {
        return 'error';
      }

      if (path === '/404' || hash === '#404') {
        return '404';
      }

      if (path.startsWith('/developer') || hash.startsWith('#developer') || path.startsWith('/dev') || hash.startsWith('#dev')) {
        return 'developer';
      }

      if (path.startsWith('/manager') || hash.startsWith('#manager')) {
        return 'manager';
      }

      if (path === '/dashboard' || hash === '#dashboard') {
        try {
          const stored = localStorage.getItem('gitsphere_user');
          if (stored) {
            const u = JSON.parse(stored);
            const role = String(u.role || '').toUpperCase();
            if (role === 'MANAGER' || role === 'ADMIN') return 'manager';
          }
        } catch {
          // ignore
        }
        return 'developer';
      }

      if (path === '/register' || path === '/signup' || hash === '#register' || hash === '#signup') {
        return 'register';
      }
      if (path === '/login' || path === '/signin' || hash === '#login' || hash === '#signin') {
        return 'login';
      }

      if (path === '/forget-password' || path === '/forget' || hash === '#forget-password' || hash === '#forget') {
        return 'forgot-password';
      }

      if (path === '/reset-password' || path === '/reset' || hash === '#reset-password' || hash === '#reset') {
        return 'reset-password';
      }

      if (path === '/verify' || path === '/otp' || hash === '#verify' || hash === '#otp') {
        return 'verify';
      }
    }

    return 'landing';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [workspaceProjectId, setWorkspaceProjectId] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const match = hash.match(/#workspace\/([a-zA-Z0-9]+)/);
      return match ? match[1] : null;
    }
    return null;
  });
  const [verificationEmail, setVerificationEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('gitsphere_verification_email') ||
        localStorage.getItem('gitsphere_pending_email') ||
        ''
      );
    }
    return '';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#workspace') || path.startsWith('/workspace')) {
        const match = hash.match(/#workspace\/([a-zA-Z0-9]+)/);
        if (match) setWorkspaceProjectId(match[1]);
        setCurrentRoute('workspace');
      } else if (path === '/unauthorized' || hash === '#unauthorized') {
        setCurrentRoute('unauthorized');
      } else if (path === '/error' || hash === '#error') {
        setCurrentRoute('error');
      } else if (path === '/404' || hash === '#404') {
        setCurrentRoute('404');
      } else if (path.startsWith('/developer') || hash.startsWith('#developer') || path.startsWith('/dev') || hash.startsWith('#dev')) {
        setCurrentRoute('developer');
      } else if (path.startsWith('/manager') || hash.startsWith('#manager')) {
        setCurrentRoute('manager');
      } else if (path === '/dashboard' || hash === '#dashboard') {
        try {
          const stored = localStorage.getItem('gitsphere_user');
          if (stored) {
            const u = JSON.parse(stored);
            const role = String(u.role || '').toUpperCase();
            if (role === 'MANAGER' || role === 'ADMIN') {
              setCurrentRoute('manager');
              return;
            }
          }
        } catch {
          // ignore
        }
        setCurrentRoute('developer');
      } else if (
        path === '/register' ||
        path === '/signup' ||
        hash === '#register' ||
        hash === '#signup'
      ) {
        setCurrentRoute('register');
      } else if (path === '/login' || path === '/signin' || hash === '#login' || hash === '#signin') {
        setCurrentRoute('login');
      } else if (
        path === '/forget-password' ||
        path === '/forget' ||
        hash === '#forget-password' ||
        hash === '#forget'
      ) {
        setCurrentRoute('forgot-password');
      } else if (
        path === '/reset-password' ||
        path === '/reset' ||
        hash === '#reset-password' ||
        hash === '#reset'
      ) {
        setCurrentRoute('reset-password');
      } else if (
        path === '/verify' ||
        path === '/otp' ||
        hash === '#verify' ||
        hash === '#otp'
      ) {
        setCurrentRoute('verify');
      } else {
        setCurrentRoute('landing');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (route, email = '') => {
    setCurrentRoute(route);
    if (email) {
      setVerificationEmail(email);
      if (typeof window !== 'undefined') {
        localStorage.setItem('gitsphere_verification_email', email);
      }
    }

    if (route === 'workspace') {
      window.history.pushState({}, '', `#workspace/${email || workspaceProjectId || ''}`);
    } else if (route === 'developer') {
      window.history.pushState({}, '', '#developer/dashboard');
    } else if (route === 'manager') {
      window.history.pushState({}, '', '#manager/dashboard');
    } else if (route === 'register') {
      window.history.pushState({}, '', '#register');
    } else if (route === 'login') {
      window.history.pushState({}, '', '#login');
    } else if (route === 'forgot-password') {
      window.history.pushState({}, '', '#forgot-password');
    } else if (route === 'reset-password') {
      window.history.pushState({}, '', '#reset-password');
    } else if (route === 'verify') {
      window.history.pushState({}, '', '#verify');
    } else if (route === '404') {
      window.history.pushState({}, '', '#404');
    } else {
      window.history.pushState({}, '', window.location.pathname.replace(/\/register|\/signup|\/login|\/signin|\/forgot-password|\/forgot|\/forget-password|\/forget|\/reset-password|\/reset|\/verify|\/otp|\/404|\/unauthorized|\/error/, '') || '/');
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleAuthSuccess = (authenticatedUser) => {
    try {
      if (authenticatedUser && typeof window !== 'undefined') {
        localStorage.setItem('gitsphere_user', JSON.stringify(authenticatedUser));
      }
      let role = '';
      if (authenticatedUser && authenticatedUser.role) {
        role = String(authenticatedUser.role).toUpperCase();
      } else {
        const stored = localStorage.getItem('gitsphere_user');
        if (stored) {
          const u = JSON.parse(stored);
          role = String(u.role || '').toUpperCase();
        }
      }

      if (role === 'MANAGER' || role === 'ADMIN') {
        navigateTo('manager');
        return;
      }
      if (role === 'USER' || role === 'DEVELOPER') {
        navigateTo('developer');
        return;
      }
    } catch {
      // fallback
    }
    navigateTo('developer');
  };

  const handleVerificationComplete = (verifiedUser) => {
    const purpose = typeof window !== 'undefined' ? localStorage.getItem('gitsphere_otp_purpose') : null;
    if (purpose === 'reset-password') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gitsphere_otp_purpose');
      }
      navigateTo('reset-password');
    } else {
      handleAuthSuccess(verifiedUser);
    }
  };

  if (currentRoute === 'workspace') {
    return (
      <Suspense fallback={null}>
        <WorkspaceApp
          projectId={workspaceProjectId}
          onBack={() => navigateTo('developer')}
        />
      </Suspense>
    );
  }

  if (currentRoute === '404') {
    return (
      <Suspense fallback={null}>
        <NotFoundPage
          onGoHome={() => navigateTo('landing')}
          onGoDashboard={handleAuthSuccess}
        />
      </Suspense>
    );
  }

  if (currentRoute === 'unauthorized') {
    return (
      <Suspense fallback={null}>
        <UnauthorizedPage
          onGoDashboard={() => navigateTo('developer')}
          onGoBack={() => window.history.back()}
        />
      </Suspense>
    );
  }

  if (currentRoute === 'error') {
    return (
      <Suspense fallback={null}>
        <ErrorSystemPage
          onRetry={() => window.location.reload()}
          onGoDashboard={() => navigateTo('landing')}
        />
      </Suspense>
    );
  }

  if (currentRoute === 'developer') {
    return (
      <Suspense fallback={null}>
        <DeveloperApp onNavigateToLanding={() => navigateTo('landing')} />
      </Suspense>
    );
  }

  if (currentRoute === 'manager') {
    return (
      <Suspense fallback={null}>
        <ManagerApp onNavigateToLanding={() => navigateTo('landing')} />
      </Suspense>
    );
  }

  if (currentRoute === 'reset-password') {
    return (
      <Suspense fallback={null}>
        <ResetPasswordPage
          userEmail={verificationEmail}
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToForgotPassword={() => navigateTo('forgot-password')}
          onNavigateToLanding={() => navigateTo('landing')}
        />
      </Suspense>
    );
  }

  if (currentRoute === 'forgot-password') {
    return (
      <Suspense fallback={null}>
        <ForgotPasswordPage
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToVerify={(email) => navigateTo('verify', email)}
          onNavigateToLanding={() => navigateTo('landing')}
        />
      </Suspense>
    );
  }

  if (currentRoute === 'verify') {
    return (
      <Suspense fallback={null}>
        <OtpVerificationPage
          userEmail={verificationEmail}
          onChangeEmail={() => navigateTo('register')}
          onVerificationComplete={handleVerificationComplete}
          onNavigateToLanding={() => navigateTo('landing')}
        />
      </Suspense>
    );
  }

  if (currentRoute === 'register') {
    return (
      <Suspense fallback={null}>
        <RegisterPage
          onNavigateToLogin={() => navigateTo('login')}
          onNavigateToOtp={(email) => navigateTo('verify', email)}
          onNavigateToLanding={() => navigateTo('landing')}
          onLoginSuccess={handleAuthSuccess}
        />
      </Suspense>
    );
  }

  if (currentRoute === 'login') {
    return (
      <Suspense fallback={null}>
        <LoginPage
          onNavigateToRegister={() => navigateTo('register')}
          onNavigateToForgotPassword={() => navigateTo('forgot-password')}
          onNavigateToLanding={() => navigateTo('landing')}
          onLoginSuccess={handleAuthSuccess}
        />
      </Suspense>
    );
  }

  return (
    <LandingPage
      onNavigateToAuth={(mode) => navigateTo(mode === 'login' ? 'login' : 'register')}
      onNavigateToRegister={() => navigateTo('register')}
    />
  );
}

export default App;
