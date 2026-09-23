import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import OtpVerificationPage from './pages/OtpVerificationPage';

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
  const [verificationEmail, setVerificationEmail] = useState('abh***@gmail.com');

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
    if (email) setVerificationEmail(email);

    if (route === 'register') {
      window.history.pushState({}, '', '#register');
    } else if (route === 'login') {
      window.history.pushState({}, '', '#login');
    } else if (route === 'verify') {
      window.history.pushState({}, '', '#verify');
    } else {
      window.history.pushState({}, '', window.location.pathname.replace(/\/register|\/signup|\/login|\/signin|\/verify|\/otp/, '') || '/');
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  if (currentRoute === 'verify') {
    return (
      <OtpVerificationPage
        userEmail={verificationEmail}
        onChangeEmail={() => navigateTo('register')}
        onVerificationComplete={() => navigateTo('landing')}
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
