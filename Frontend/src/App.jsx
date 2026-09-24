import { useState, useEffect } from 'react';
import LandingPage from './pages/public/LandingPage';
import RegisterPage from './pages/public/RegisterPage';
import LoginPage from './pages/public/LoginPage';
import OtpVerificationPage from './pages/public/OtpVerificationPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';

function App() {
  const getInitialRoute = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (
        path === '/register' ||
        path === '/signup' ||
        hash === '#register' ||
        hash === '#signup'
      ) {
        return 'register';
      }
      if (path === '/login' || path === '/signin' || hash === '#login' || hash === '#signin') {
        return 'login';
      }
      if (
        path === '/forget-password' ||
        path === '/forget' ||
        hash === '#forget-password' ||
        hash === '#forget'
      ) {
        return 'forgot-password';
      }
      if (
        path === '/reset-password' ||
        path === '/reset' ||
        hash === '#reset-password' ||
        hash === '#reset'
      ) {
        return 'reset-password';
      }
      if (
        path === '/verify' ||
        path === '/otp' ||
        hash === '#verify' ||
        hash === '#otp'
      ) {
        return 'verify';
      }
    }
    return 'landing';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
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
      if (
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

    if (route === 'register') {
      window.history.pushState({}, '', '#register');
    } else if (route === 'login') {
      window.history.pushState({}, '', '#login');
    } else if (route === 'forgot-password') {
      window.history.pushState({}, '', '#forgot-password');
    } else if (route === 'reset-password') {
      window.history.pushState({}, '', '#reset-password');
    } else if (route === 'verify') {
      window.history.pushState({}, '', '#verify');
    } else {
      window.history.pushState({}, '', window.location.pathname.replace(/\/register|\/signup|\/login|\/signin|\/forgot-password|\/forgot|\/forget-password|\/forget|\/reset-password|\/reset|\/verify|\/otp/, '') || '/');
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  if (currentRoute === 'reset-password') {
    return (
      <ResetPasswordPage
        userEmail={verificationEmail}
        onNavigateToLogin={() => navigateTo('login')}
        onNavigateToForgotPassword={() => navigateTo('forgot-password')}
        onNavigateToLanding={() => navigateTo('landing')}
      />
    );
  }

  if (currentRoute === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onNavigateToLogin={() => navigateTo('login')}
        onNavigateToVerify={(email) => navigateTo('verify', email)}
        onNavigateToLanding={() => navigateTo('landing')}
      />
    );
  }

  if (currentRoute === 'verify') {
    return (
      <OtpVerificationPage
        userEmail={verificationEmail}
        onChangeEmail={() => navigateTo('register')}
        onVerificationComplete={() => navigateTo('reset-password')}
        onNavigateToLanding={() => navigateTo('landing')}
      />
    );
  }

  if (currentRoute === 'register') {
    return (
      <RegisterPage
        onNavigateToLogin={() => navigateTo('login')}
        onNavigateToOtp={(email) => navigateTo('verify', email)}
        onNavigateToLanding={() => navigateTo('landing')}
        onLoginSuccess={() => navigateTo('landing')}
      />
    );
  }

  if (currentRoute === 'login') {
    return (
      <LoginPage
        onNavigateToRegister={() => navigateTo('register')}
        onNavigateToForgotPassword={() => navigateTo('forgot-password')}
        onNavigateToLanding={() => navigateTo('landing')}
        onLoginSuccess={() => navigateTo('landing')}
      />
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
