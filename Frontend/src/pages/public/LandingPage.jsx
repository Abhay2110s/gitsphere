import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Modal from '../../components/common/Modal';

import Hero from '../../components/landing/Hero';
import DashboardPreview from '../../components/landing/DashboardPreview';
import FeaturesIntro from '../../components/landing/FeaturesIntro';
import HorizontalFeatures from '../../components/landing/HorizontalFeatures';
import HowItWorks from '../../components/landing/HowItWorks';
import FinalCta from '../../components/landing/FinalCta';

export default function LandingPage({ onNavigateToRegister, onNavigateToAuth }) {
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'signup' });

  useEffect(() => {
    // Disable automatic browser scroll restoration to prevent page jumping/moving upward on reload
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleOpenAuth = (mode = 'signup') => {
    if (onNavigateToAuth) {
      onNavigateToAuth(mode);
      return;
    }
    if (onNavigateToRegister) {
      onNavigateToRegister(mode);
      return;
    }
    setAuthModal({ isOpen: true, mode });
  };

  const handleCloseAuth = () => {
    setAuthModal({ isOpen: false, mode: 'signup' });
  };

  const scrollToSectionWithOffset = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -76;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleExplore = () => {
    scrollToSectionWithOffset('explore');
  };

  const handleLearnMore = () => {
    scrollToSectionWithOffset('how-it-works');
  };

  return (
    <div className="min-h-screen bg-black text-black antialiased selection:bg-black selection:text-white flex flex-col font-sans">
      {/* 1. NAVBAR (Common) */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col">
        {/* 2. HERO SECTION (Landing) - No Hexagonal Design */}
        <Hero
          onOpenAuth={handleOpenAuth}
          onExplore={handleExplore}
        />

        {/* 3. PRODUCT / DASHBOARD PREVIEW (Landing) */}
        <DashboardPreview />

        {/* 4. FEATURES INTRODUCTION (Landing) */}
        <FeaturesIntro />

        {/* 5. FULL-SCREEN SCROLL-DRIVEN HORIZONTAL FEATURES (Cards 01 to 05) */}
        <HorizontalFeatures />

        {/* 6. HOW GITSPHERE WORKS (Landing) - Follows directly after Feature 05 */}
        <HowItWorks />

        {/* 8. FINAL CTA (Landing) */}
        <FinalCta
          onOpenAuth={handleOpenAuth}
          onLearnMore={handleLearnMore}
        />
      </main>

      {/* 9. FOOTER (Common) */}
      <Footer />

      {/* Interactive Modal for Auth / Demo (Common) */}
      <Modal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={handleCloseAuth}
      />
    </div>
  );
}
