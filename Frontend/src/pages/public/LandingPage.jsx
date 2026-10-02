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
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
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
    const el = document.getElementById(id) || (id === 'workspace' ? document.getElementById('explore') : null) || (id === 'workflow' ? document.getElementById('how-it-works') : null);
    if (el) {
      const yOffset = -76;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleExplore = () => {
    scrollToSectionWithOffset('workspace');
  };

  const handleLearnMore = () => {
    scrollToSectionWithOffset('workflow');
  };

  return (
    <div className="min-h-screen bg-black text-black antialiased selection:bg-black selection:text-white flex flex-col font-sans">
      {/* 1. NAVBAR (Common) */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col">
        {/* 2. HERO SECTION (Landing) */}
        <Hero
          onOpenAuth={handleOpenAuth}
          onExplore={handleExplore}
        />

        {/* 3. PRODUCT / DASHBOARD PREVIEW (Workspace) */}
        <div>
          <DashboardPreview />
        </div>

        {/* 4. FEATURES INTRODUCTION & HORIZONTAL SCROLL CARDS (Features) */}
        <section id="features" data-section="features" className="relative">
          <FeaturesIntro />
          <HorizontalFeatures />
        </section>

        {/* 5. HOW GITSPHERE WORKS (Workflow) */}
        <div>
          <HowItWorks />
        </div>

        {/* 6. FINAL CTA (Landing) */}
        <div>
          <FinalCta
            onOpenAuth={handleOpenAuth}
            onLearnMore={handleLearnMore}
          />
        </div>
      </main>

      {/* 7. FOOTER (Common) */}
      <div>
        <Footer />
      </div>

      {/* Interactive Modal for Auth / Demo (Common) */}
      <Modal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={handleCloseAuth}
      />
    </div>
  );
}
